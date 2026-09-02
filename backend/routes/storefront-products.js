import { Router } from "express";
import { pool } from "../db.js";

export const storefrontProductsRouter = Router();

storefrontProductsRouter.get("/detail/:slug", async (request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, title, slug, description, price::float, quantity,
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
    const { rows } = await pool.query(`SELECT p.id::text, p.title, p.slug, p.price::float, p.quantity, p.shape, p.material, p.rim,
      p.genders, p.categories, p.subcategories, p.collections, p.brands, p.media, p.variants, p.created_at AS "createdAt",
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NULL AND LOWER(c.name)=LOWER(p.categories->>0) LIMIT 1) AS "categorySlug",
      (SELECT c.slug FROM categories c WHERE c.parent_id IS NOT NULL AND LOWER(c.name)=LOWER(p.subcategories->>0) LIMIT 1) AS "subcategorySlug"
      FROM products p WHERE p.status = 'Active'
      AND ($1 = '' OR p.categories ? $1)
      AND ($2 = '' OR p.subcategories ? $2)
      ORDER BY p.created_at DESC`, [categoryName, subcategoryName]);
    response.json({ products: rows, category: categoryName || null, subcategory: subcategoryName || null });
  } catch (error) { next(error); }
});

storefrontProductsRouter.get("/categories/navigation", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, name, slug, parent_id::text AS "parentId"
      FROM categories WHERE status='Active' ORDER BY parent_id NULLS FIRST, created_at ASC`);
    response.json({ categories: rows });
  } catch (error) { next(error); }
});
