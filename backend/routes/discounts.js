import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const discountsRouter = Router();
discountsRouter.use(requireAdmin);

const statuses = new Set(["Active", "Draft", "Expired"]);
const types = new Set(["Percentage", "Fixed amount"]);

discountsRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, code, type, value::float, status,
      starts_at AS "startsAt", ends_at AS "endsAt", usage_limit AS "usageLimit", created_at AS "createdAt"
      FROM discounts ORDER BY created_at DESC`);
    response.json({ discounts: rows });
  } catch (error) { next(error); }
});

discountsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const code = String(body.code ?? "").trim().toUpperCase();
    const type = String(body.type ?? "Percentage");
    const status = String(body.status ?? "Active");
    const value = Number(body.value);
    const usageLimit = body.usageLimit === "" || body.usageLimit === undefined ? null : Number(body.usageLimit);
    if (!code) return response.status(400).json({ error: "Discount code is required." });
    if (!types.has(type)) return response.status(400).json({ error: "Invalid discount type." });
    if (!statuses.has(status)) return response.status(400).json({ error: "Invalid discount status." });
    if (!Number.isFinite(value) || value < 0 || (type === "Percentage" && value > 100)) return response.status(400).json({ error: "Enter a valid discount value." });
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0)) return response.status(400).json({ error: "Usage limit must be a non-negative whole number." });
    const { rows } = await pool.query(`INSERT INTO discounts(code,type,value,status,starts_at,ends_at,usage_limit)
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING id::text, code, type, value::float, status, starts_at AS "startsAt", ends_at AS "endsAt", usage_limit AS "usageLimit", created_at AS "createdAt"`,
      [code, type, value, status, body.startsAt || null, body.endsAt || null, usageLimit]);
    response.status(201).json({ discount: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "This discount code already exists." });
    next(error);
  }
});

discountsRouter.patch("/:id", async (request, response, next) => {
  try {
    const status = String(request.body?.status ?? "");
    if (!statuses.has(status)) return response.status(400).json({ error: "Invalid discount status." });
    const { rows } = await pool.query("UPDATE discounts SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id::text, status", [status, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Discount not found." });
    response.json({ discount: rows[0] });
  } catch (error) { next(error); }
});

discountsRouter.delete("/:id", async (request, response, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM discounts WHERE id=$1", [request.params.id]);
    response.json({ deleted: rowCount });
  } catch (error) { next(error); }
});
