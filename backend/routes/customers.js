import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const customersRouter = Router();
customersRouter.use(requireAdmin);

customersRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT LOWER(email) AS id, LOWER(email) AS email,
        MAX(customer_name) AS name, MAX(phone) AS phone, MAX(city) AS city,
        COUNT(*)::int AS orders, COALESCE(SUM(subtotal), 0)::float AS spent,
        MIN(created_at) AS "customerSince", MAX(created_at) AS "lastOrderAt"
      FROM orders
      GROUP BY LOWER(email)
      ORDER BY MAX(created_at) DESC
    `);
    response.json({ customers: rows });
  } catch (error) {
    next(error);
  }
});
