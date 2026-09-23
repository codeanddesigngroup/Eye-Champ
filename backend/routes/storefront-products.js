import { Router } from "express";
import { createHash } from "node:crypto";
import rateLimit from "express-rate-limit";
import { pool } from "../db.js";

export const storefrontProductsRouter = Router();
const reviewLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

storefrontProductsRouter.get("/:slug/reviews", async (request, response, next) => {
  try {
    const product = await pool.query("SELECT id FROM products WHERE slug=$1 AND status='Active'", [request.params.slug]);
    if (!product.rows[0]) return response.status(404).json({ error: "Product not found." });
    const { rows } = await pool.query(`SELECT id::text, customer_name AS "name", rating, title, body, fit, quality,
      photo_url AS "photoUrl", created_at AS "createdAt" FROM product_reviews WHERE product_id=$1 AND moderation_status='Approved' ORDER BY created_at DESC`, [product.rows[0].id]);
    response.json({ reviews: rows });
  } catch (error) { next(error); }
});

storefrontProductsRouter.post("/:slug/reviews", reviewLimiter, async (request, response, next) => {
  try {
    const token = request.cookies?.eye_champ_customer_session;
    if (!token) return response.status(401).json({ error: "Sign in to write a review." });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await pool.query("SELECT email FROM customer_sessions WHERE token_hash=$1 AND expires_at>NOW()", [tokenHash]);
    if (!session.rows[0]) return response.status(401).json({ error: "Sign in to write a review." });
    const product = await pool.query("SELECT id FROM products WHERE slug=$1 AND status='Active'", [request.params.slug]);
    if (!product.rows[0]) return response.status(404).json({ error: "Product not found." });
    const email = session.rows[0].email;
    const purchase = await pool.query(`SELECT customer_name FROM orders WHERE LOWER(email)=LOWER($1)
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(items) AS item WHERE item->>'productId'=$2)
      ORDER BY created_at DESC LIMIT 1`, [email, String(product.rows[0].id)]);
    if (!purchase.rows[0]) return response.status(403).json({ error: "Only customers who purchased this product can review it." });
    const rating = Number(request.body?.rating);
    const title = String(request.body?.title ?? "").trim();
    const body = String(request.body?.body ?? "").trim();
    const fit = String(request.body?.fit ?? "").trim();
    const quality = String(request.body?.quality ?? "").trim();
    const photoUrl = String(request.body?.photoUrl ?? "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || title.length < 3 || title.length > 160 || body.length < 10 || body.length > 3000 || (fit && !["Tight", "True to Size", "Loose"].includes(fit)) || (quality && !["Low", "Average", "High"].includes(quality)) || (photoUrl && (photoUrl.length > 1000 || !/^https:\/\//i.test(photoUrl)))) return response.status(400).json({ error: "Check the rating, title, and review details." });
    const { rows } = await pool.query(`INSERT INTO product_reviews(product_id,customer_email,customer_name,rating,title,body,fit,quality,photo_url)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(product_id,customer_email) DO UPDATE SET
      rating=EXCLUDED.rating,title=EXCLUDED.title,body=EXCLUDED.body,fit=EXCLUDED.fit,quality=EXCLUDED.quality,photo_url=EXCLUDED.photo_url,moderation_status='Pending',created_at=NOW()
      RETURNING id::text`, [product.rows[0].id, email, purchase.rows[0].customer_name, rating, title, body, fit || null, quality || null, photoUrl || null]);
    response.status(201).json({ id: rows[0].id });
  } catch (error) { next(error); }
});

storefrontProductsRouter.get("/settings", async (_request, response, next) => {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key='general'");
    response.json({
      currency: rows[0]?.value?.currency || "PKR",
      storeStatus: rows[0]?.value?.storeStatus || "Live",
      storeName: rows[0]?.value?.storeName || "Eye Champ",
      promoEnabled: rows[0]?.value?.promoEnabled !== false,
      promoText: rows[0]?.value?.promoText ?? "Buy one, get one 20% off.",
      promoCode: rows[0]?.value?.promoCode ?? "GET20",
    });
  } catch (error) { next(error); }
});

storefrontProductsRouter.get("/detail/:slug", async (request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, title, slug, description, price::float, discount_percent::float AS "discountPercent", quantity,
      shape, material, rim, fit, weight::float, special_feature AS "specialFeature", measurements,
      lens_compatibility AS "lensCompatibility", genders, categories, subcategories, collections,
      brands, media, variants FROM products WHERE slug=$1 AND status='Active'`, [request.params.slug]);
    if (!rows[0]) return response.status(404).json({ error: "Product not found." });
    response.json({ product: rows[0] });
  } catch (error) { next(error); }
});

storefrontProductsRouter.get("/", async (request, response, next) => {
  try {
    const categorySlug = String(request.query.category ?? "").trim();
    const subcategorySlug = String(request.query.subcategory ?? "").trim();
    const gender = String(request.query.gender ?? "").trim();
    const collection = String(request.query.collection ?? "").trim();
    const shape = String(request.query.shape ?? "").trim();
    const material = String(request.query.material ?? "").trim();
    const brand = String(request.query.brand ?? "").trim();
    const rim = String(request.query.rim ?? "").trim();
    const maxPrice = Math.max(0, Number(request.query.maxPrice) || 0);
    const onSale = String(request.query.onSale ?? "") === "true";
    let categoryName = "", subcategoryName = "";
    if (categorySlug) {
      const { rows: categoryRows } = await pool.query("SELECT id, name FROM categories WHERE slug=$1 AND parent_id IS NULL AND status='Active'", [categorySlug]);
      if (!categoryRows[0]) return response.status(404).json({ error: "Category not found." });
      categoryName = categoryRows[0].name;
      if (subcategorySlug && subcategorySlug !== "all") {
        const { rows: subcategoryRows } = await pool.query("SELECT name FROM categories WHERE slug=$1 AND parent_id=$2 AND status='Active'", [subcategorySlug, categoryRows[0].id]);
        if (!subcategoryRows[0]) return response.status(404).json({ error: "Subcategory not found." });
        subcategoryName = subcategoryRows[0].name;
      }
    }
    const { rows } = await pool.query(`SELECT p.id::text, p.title, p.slug, p.price::float, p.discount_percent::float AS "discountPercent", p.quantity, p.shape, p.material, p.rim,
      p.genders, p.categories, p.subcategories, p.collections, p.brands, p.media, p.variants, p.created_at AS "createdAt",
      reviews.rating, COALESCE(reviews.review_count, 0)::int AS "reviewCount",
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NULL AND LOWER(c.name)=LOWER(p.categories->>0) LIMIT 1) AS "categorySlug",
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NOT NULL AND LOWER(c.name)=LOWER(p.subcategories->>0) LIMIT 1) AS "subcategorySlug"
      FROM products p
      LEFT JOIN (
        SELECT product_id, ROUND(AVG(rating)::numeric, 1)::float AS rating, COUNT(*)::int AS review_count
        FROM product_reviews WHERE moderation_status='Approved'
        GROUP BY product_id
      ) reviews ON reviews.product_id = p.id
      WHERE p.status = 'Active'
      AND ($1 = '' OR p.categories ? $1)
      AND ($2 = '' OR p.subcategories ? $2)
      AND ($3 = '' OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(p.genders) AS product_gender WHERE LOWER(product_gender) = LOWER($3)))
      AND ($4 = '' OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(p.collections) AS product_collection WHERE LOWER(product_collection) = LOWER($4)))
      AND ($5 = '' OR LOWER(COALESCE(p.shape, '')) = LOWER($5))
      AND ($6 = '' OR LOWER(COALESCE(p.material, '')) = LOWER($6))
      AND ($7 = '' OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(p.brands) AS product_brand WHERE LOWER(product_brand) = LOWER($7)))
      AND ($8 = '' OR LOWER(COALESCE(p.rim, '')) = LOWER($8))
      AND ($9::float = 0 OR p.price <= $9::float)
      AND (NOT $10::boolean OR p.discount_percent > 0)
      ORDER BY p.created_at DESC`, [categoryName, subcategoryName, gender, collection, shape, material, brand, rim, maxPrice, onSale]);
    response.json({ products: rows, category: categoryName || null, subcategory: subcategoryName || null });
  } catch (error) { next(error); }
});

storefrontProductsRouter.get("/categories/navigation", async (_request, response, next) => {
  try {
    const [categoryResult, collectionResult, brandResult] = await Promise.all([
      pool.query(`SELECT id::text, name, slug, parent_id::text AS "parentId"
        FROM categories WHERE status='Active' ORDER BY parent_id NULLS FIRST, created_at ASC`),
      pool.query("SELECT name FROM collections WHERE status='Active' ORDER BY name ASC"),
      pool.query("SELECT name FROM brands WHERE status='Active' ORDER BY name ASC"),
    ]);
    response.json({ categories: categoryResult.rows, collections: collectionResult.rows.map(item => item.name), brands: brandResult.rows.map(item => item.name) });
  } catch (error) { next(error); }
});
