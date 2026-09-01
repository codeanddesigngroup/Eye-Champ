import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const brandsRouter = Router();
brandsRouter.use(requireAdmin);

const validStatus = new Set(["Active", "Draft"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const fields = `SELECT id::text, name, slug, description, product_count AS products, status,
  featured, origin, image_url AS image, TO_CHAR(updated_at, 'Mon DD, YYYY') AS updated FROM brands`;

brandsRouter.get("/", async (_request, response, next) => {
  try { const { rows } = await pool.query(`${fields} ORDER BY updated_at DESC`); response.json({ brands: rows }); }
  catch (error) { next(error); }
});

brandsRouter.post("/", async (request, response, next) => {
  try {
    const { name, description = "", status = "Draft", featured = false, origin = "Not specified", image = "/images/brand-banners/ray-ban.webp" } = request.body ?? {};
    if (typeof name !== "string" || !name.trim()) return response.status(400).json({ error: "Brand name is required." });
    if (!validStatus.has(status) || typeof featured !== "boolean") return response.status(400).json({ error: "Invalid brand status or featured value." });
    const slug = slugify(name);
    if (!slug) return response.status(400).json({ error: "Brand name must contain letters or numbers." });
    const { rows } = await pool.query(`
      INSERT INTO brands (name, slug, description, status, featured, origin, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id::text, name, slug, description, product_count AS products, status,
        featured, origin, image_url AS image, 'Just now' AS updated
    `, [name.trim(), slug, String(description).trim(), status, featured, String(origin).trim() || "Not specified", image]);
    response.status(201).json({ brand: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A brand with this slug already exists." });
    next(error);
  }
});

brandsRouter.patch("/:id", async (request, response, next) => {
  try {
    const { name, description, status, featured, origin, image } = request.body ?? {};
    if (status !== undefined && !validStatus.has(status)) return response.status(400).json({ error: "Invalid status." });
    if (featured !== undefined && typeof featured !== "boolean") return response.status(400).json({ error: "Invalid featured value." });
    const { rows } = await pool.query(`
      UPDATE brands SET name=COALESCE($2,name), slug=CASE WHEN $2::text IS NULL THEN slug ELSE $3 END,
        description=COALESCE($4,description), status=COALESCE($5,status), featured=COALESCE($6,featured),
        origin=COALESCE($7,origin), image_url=COALESCE($8,image_url), updated_at=NOW()
      WHERE id=$1 RETURNING id::text, name, slug, description, product_count AS products, status,
        featured, origin, image_url AS image, 'Just now' AS updated
    `, [request.params.id, name?.trim() || null, name ? slugify(name) : null, description ?? null, status ?? null, featured ?? null, origin ?? null, image ?? null]);
    if (!rows[0]) return response.status(404).json({ error: "Brand not found." });
    response.json({ brand: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "A brand with this slug already exists." });
    next(error);
  }
});

brandsRouter.patch("/", async (request, response, next) => {
  try {
    const { ids, status, featured } = request.body ?? {};
    if (!Array.isArray(ids) || !ids.length || (status === undefined && featured === undefined)) return response.status(400).json({ error: "Brand IDs and a change are required." });
    if (status !== undefined && !validStatus.has(status)) return response.status(400).json({ error: "Invalid status." });
    if (featured !== undefined && typeof featured !== "boolean") return response.status(400).json({ error: "Invalid featured value." });
    const result = await pool.query("UPDATE brands SET status=COALESCE($1,status), featured=COALESCE($2,featured), updated_at=NOW() WHERE id=ANY($3::bigint[])", [status ?? null, featured ?? null, ids]);
    response.json({ updated: result.rowCount });
  } catch (error) { next(error); }
});

brandsRouter.delete("/", async (request, response, next) => {
  try {
    const { ids } = request.body ?? {};
    if (!Array.isArray(ids) || !ids.length) return response.status(400).json({ error: "Brand IDs are required." });
    const result = await pool.query("DELETE FROM brands WHERE id=ANY($1::bigint[])", [ids]);
    response.json({ deleted: result.rowCount });
  } catch (error) { next(error); }
});
