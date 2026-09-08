import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const ordersRouter = Router();
ordersRouter.use(requireAdmin);

ordersRouter.get("/count", async (_request, response, next) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM orders");
    response.json({ count: rows[0].count });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id::text, order_number AS "orderNumber", customer_name AS customer, email,
        jsonb_array_length(items) AS items, subtotal::float AS total,
        payment_status AS payment, fulfillment_status AS fulfillment,
        payment_method AS "paymentMethod", created_at AS "createdAt"
      FROM orders
      ORDER BY created_at DESC
    `);
    response.json({ orders: rows });
  } catch (error) {
    next(error);
  }
});
