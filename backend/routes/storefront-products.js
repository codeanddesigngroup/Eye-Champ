import { Router } from "express";
import { pool } from "../db.js";

export const storefrontProductsRouter = Router();

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
    const { rows } = await pool.query(`SELECT id::text, title, slug, price::float, quantity, shape, material, rim,
      genders, categories, collections, brands, media, variants, created_at AS "createdAt"
      FROM products WHERE status = 'Active'
      AND ($1 = '' OR categories ? $1)
      AND ($2 = '' OR subcategories ? $2)
      ORDER BY created_at DESC`, [categoryName, subcategoryName]);
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
