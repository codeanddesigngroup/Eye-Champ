import { Router } from "express";
import { pool } from "../db.js";

export const storefrontProductsRouter = Router();

storefrontProductsRouter.get("/settings", async (_request, response, next) => {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key='general'");
    response.json({
      currency: rows[0]?.value?.currency || "PKR",
      storeStatus: rows[0]?.value?.storeStatus || "Live",
      storeName: rows[0]?.value?.storeName || "Eye Champ",
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
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NULL AND LOWER(c.name)=LOWER(p.categories->>0) LIMIT 1) AS "categorySlug",
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NOT NULL AND LOWER(c.name)=LOWER(p.subcategories->>0) LIMIT 1) AS "subcategorySlug"
      FROM products p WHERE p.status = 'Active'
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
