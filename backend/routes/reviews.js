import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const reviewsRouter = Router();
reviewsRouter.use(requireAdmin);

reviewsRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id::text, r.product_id::text AS "productId", p.title AS "productTitle", p.slug AS "productSlug",
        r.customer_name AS "customerName", r.customer_email AS "customerEmail", r.rating, r.title, r.body,
        r.fit, r.quality, r.photo_url AS "photoUrl", r.moderation_status AS status, r.created_at AS "createdAt"
      FROM product_reviews r
      JOIN products p ON p.id=r.product_id
      ORDER BY CASE r.moderation_status WHEN 'Pending' THEN 0 WHEN 'Approved' THEN 1 ELSE 2 END, r.created_at DESC
    `);
    response.json({ reviews: rows });
  } catch (error) { next(error); }
});

reviewsRouter.patch("/:id", async (request, response, next) => {
  try {
    const status = String(request.body?.status ?? "");
    if (!["Approved", "Disapproved"].includes(status)) return response.status(400).json({ error: "Choose Approved or Disapproved." });
    const { rows } = await pool.query("UPDATE product_reviews SET moderation_status=$1 WHERE id=$2 RETURNING id::text, moderation_status AS status", [status, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Review not found." });
    response.json({ review: rows[0] });
  } catch (error) { next(error); }
});
