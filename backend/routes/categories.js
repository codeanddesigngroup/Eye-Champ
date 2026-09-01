import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAdmin);

const fields = `
  SELECT c.id::text, c.name, c.slug, c.parent_id::text AS "parentId", c.description,
         c.product_count AS products, c.status, c.type, c.image_url AS image,
         TO_CHAR(c.updated_at, 'Mon DD, YYYY') AS updated
  FROM categories c`;
const validStatus = new Set(["Active", "Draft"]);
const validType = new Set(["Manual", "Smart"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

categoriesRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`${fields} ORDER BY c.parent_id NULLS FIRST, c.created_at DESC`);
    response.json({ categories: rows });
  } catch (error) { next(error); }
});

categoriesRouter.post("/", async (request, response, next) => {
  try {
    const { name, parentId = null, description = "", status = "Active", type = "Manual", image = "/images/Browline.webp" } = request.body ?? {};
    if (typeof name !== "string" || !name.trim()) return response.status(400).json({ error: "Category name is required." });
    if (!validStatus.has(status) || !validType.has(type)) return response.status(400).json({ error: "Invalid category status or type." });
    const slug = slugify(name);
    if (!slug) return response.status(400).json({ error: "Category name must contain letters or numbers." });
    const { rows } = await pool.query(`
      INSERT INTO categories (name, slug, parent_id, description, status, type, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id::text, name, slug, parent_id::text AS "parentId", description,
                product_count AS products, status, type, image_url AS image, 'Just now' AS updated
    `, [name.trim(), slug, parentId || null, String(description).trim(), status, type, image]);
    response.status(201).json({ category: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A category with this slug already exists." });
    if (error.code === "23503") return response.status(400).json({ error: "Parent category does not exist." });
    next(error);
  }
});

categoriesRouter.patch("/:id", async (request, response, next) => {
  try {
    const { name, description, status, type, parentId, image } = request.body ?? {};
    if (status !== undefined && !validStatus.has(status)) return response.status(400).json({ error: "Invalid status." });
    if (type !== undefined && !validType.has(type)) return response.status(400).json({ error: "Invalid type." });
    const { rows } = await pool.query(`
      UPDATE categories SET
        name = COALESCE($2, name), slug = CASE WHEN $2::text IS NULL THEN slug ELSE $3 END,
        description = COALESCE($4, description), status = COALESCE($5, status),
        type = COALESCE($6, type), parent_id = CASE WHEN $7::boolean THEN $8 ELSE parent_id END,
        image_url = COALESCE($9, image_url), updated_at = NOW()
      WHERE id = $1
      RETURNING id::text, name, slug, parent_id::text AS "parentId", description,
                product_count AS products, status, type, image_url AS image, 'Just now' AS updated
    `, [request.params.id, name?.trim() || null, name ? slugify(name) : null, description ?? null, status ?? null, type ?? null, Object.hasOwn(request.body ?? {}, "parentId"), parentId || null, image ?? null]);
    if (!rows[0]) return response.status(404).json({ error: "Category not found." });
    response.json({ category: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A category with this slug already exists." });
    if (error.code === "23503") return response.status(400).json({ error: "Invalid parent category." });
    next(error);
  }
});

categoriesRouter.patch("/", async (request, response, next) => {
  try {
    const { ids, status } = request.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0 || !validStatus.has(status)) return response.status(400).json({ error: "Category IDs and a valid status are required." });
    const result = await pool.query("UPDATE categories SET status = $1, updated_at = NOW() WHERE id = ANY($2::bigint[])", [status, ids]);
    response.json({ updated: result.rowCount });
  } catch (error) { next(error); }
});

categoriesRouter.delete("/", async (request, response, next) => {
  try {
    const { ids } = request.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0) return response.status(400).json({ error: "Category IDs are required." });
    const result = await pool.query("DELETE FROM categories WHERE id = ANY($1::bigint[])", [ids]);
    response.json({ deleted: result.rowCount });
  } catch (error) { next(error); }
});
