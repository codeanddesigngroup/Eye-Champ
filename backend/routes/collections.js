import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const collectionsRouter = Router();
collectionsRouter.use(requireAdmin);

const validStatus = new Set(["Active", "Draft"]);
const validMethod = new Set(["Smart", "Manual"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const fields = `SELECT id::text, name, slug, description, product_count AS products, status,
  method, image_url AS image, rule, TO_CHAR(updated_at, 'Mon DD, YYYY') AS updated FROM collections`;

collectionsRouter.get("/", async (_request, response, next) => {
  try { const { rows } = await pool.query(`${fields} ORDER BY updated_at DESC`); response.json({ collections: rows }); }
  catch (error) { next(error); }
});

collectionsRouter.post("/", async (request, response, next) => {
  try {
    const { name, description = "", status = "Draft", method = "Smart", image = "/images/Rectangle.webp", rule } = request.body ?? {};
    if (typeof name !== "string" || !name.trim()) return response.status(400).json({ error: "Collection name is required." });
    if (!validStatus.has(status) || !validMethod.has(method)) return response.status(400).json({ error: "Invalid collection status or method." });
    const slug = slugify(name);
    if (!slug) return response.status(400).json({ error: "Collection name must contain letters or numbers." });
    const collectionRule = String(rule || (method === "Smart" ? "Configure automated conditions" : "Products added manually")).trim();
    const { rows } = await pool.query(`
      INSERT INTO collections (name, slug, description, status, method, image_url, rule)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id::text, name, slug, description, product_count AS products, status,
                method, image_url AS image, rule, 'Just now' AS updated
    `, [name.trim(), slug, String(description).trim(), status, method, image, collectionRule]);
    response.status(201).json({ collection: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A collection with this slug already exists." });
    next(error);
  }
});

collectionsRouter.patch("/:id", async (request, response, next) => {
  try {
    const { name, description, status, method, image, rule } = request.body ?? {};
    if (status !== undefined && !validStatus.has(status)) return response.status(400).json({ error: "Invalid status." });
    if (method !== undefined && !validMethod.has(method)) return response.status(400).json({ error: "Invalid method." });
    const { rows } = await pool.query(`
      UPDATE collections SET name=COALESCE($2,name), slug=CASE WHEN $2::text IS NULL THEN slug ELSE $3 END,
        description=COALESCE($4,description), status=COALESCE($5,status), method=COALESCE($6,method),
        image_url=COALESCE($7,image_url), rule=COALESCE($8,rule), updated_at=NOW()
      WHERE id=$1 RETURNING id::text, name, slug, description, product_count AS products, status,
        method, image_url AS image, rule, 'Just now' AS updated
    `, [request.params.id, name?.trim() || null, name ? slugify(name) : null, description ?? null, status ?? null, method ?? null, image ?? null, rule ?? null]);
    if (!rows[0]) return response.status(404).json({ error: "Collection not found." });
    response.json({ collection: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A collection with this slug already exists." });
    next(error);
  }
});

collectionsRouter.patch("/", async (request, response, next) => {
  try {
    const { ids, status } = request.body ?? {};
    if (!Array.isArray(ids) || !ids.length || !validStatus.has(status)) return response.status(400).json({ error: "Collection IDs and a valid status are required." });
    const result = await pool.query("UPDATE collections SET status=$1, updated_at=NOW() WHERE id=ANY($2::bigint[])", [status, ids]);
    response.json({ updated: result.rowCount });
  } catch (error) { next(error); }
});

collectionsRouter.delete("/", async (request, response, next) => {
  try {
    const { ids } = request.body ?? {};
    if (!Array.isArray(ids) || !ids.length) return response.status(400).json({ error: "Collection IDs are required." });
    const result = await pool.query("DELETE FROM collections WHERE id=ANY($1::bigint[])", [ids]);
    response.json({ deleted: result.rowCount });
  } catch (error) { next(error); }
});
