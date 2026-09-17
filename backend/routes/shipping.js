import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const shippingRouter = Router();
shippingRouter.use(requireAdmin);

shippingRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, name, zone, price::float, estimated_days AS "estimatedDays", active, created_at AS "createdAt"
      FROM shipping_methods ORDER BY created_at DESC`);
    response.json({ methods: rows });
  } catch (error) { next(error); }
});

shippingRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const name = String(body.name ?? "").trim(), zone = String(body.zone ?? "Pakistan").trim();
    const estimatedDays = String(body.estimatedDays ?? "3-5 business days").trim();
    const price = Number(body.price);
    if (!name) return response.status(400).json({ error: "Shipping method name is required." });
    if (!zone) return response.status(400).json({ error: "Shipping zone is required." });
    if (!Number.isFinite(price) || price < 0) return response.status(400).json({ error: "Enter a valid shipping price." });
    const { rows } = await pool.query(`INSERT INTO shipping_methods(name,zone,price,estimated_days,active)
      VALUES($1,$2,$3,$4,$5) RETURNING id::text, name, zone, price::float, estimated_days AS "estimatedDays", active, created_at AS "createdAt"`,
      [name, zone, price, estimatedDays, body.active !== false]);
    response.status(201).json({ method: rows[0] });
  } catch (error) { next(error); }
});

shippingRouter.patch("/:id", async (request, response, next) => {
  try {
    const active = request.body?.active;
    if (typeof active !== "boolean") return response.status(400).json({ error: "Active must be true or false." });
    const { rows } = await pool.query("UPDATE shipping_methods SET active=$1, updated_at=NOW() WHERE id=$2 RETURNING id::text, active", [active, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Shipping method not found." });
    response.json({ method: rows[0] });
  } catch (error) { next(error); }
});

shippingRouter.delete("/:id", async (request, response, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM shipping_methods WHERE id=$1", [request.params.id]);
    response.json({ deleted: rowCount });
  } catch (error) { next(error); }
});
