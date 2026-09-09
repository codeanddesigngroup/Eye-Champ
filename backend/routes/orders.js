import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const ordersRouter = Router();
ordersRouter.use(requireAdmin);

const paymentStatuses = new Set(["Pending", "Paid", "Refunded"]);
const fulfillmentStatuses = new Set(["Unfulfilled", "Processing", "Fulfilled", "Cancelled"]);

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

ordersRouter.patch("/:id", async (request, response, next) => {
  try {
    const payment = request.body?.payment;
    const fulfillment = request.body?.fulfillment;
    if (payment === undefined && fulfillment === undefined) return response.status(400).json({ error: "A payment or fulfillment status is required." });
    if (payment !== undefined && !paymentStatuses.has(payment)) return response.status(400).json({ error: "Invalid payment status." });
    if (fulfillment !== undefined && !fulfillmentStatuses.has(fulfillment)) return response.status(400).json({ error: "Invalid fulfillment status." });
    const { rows } = await pool.query(`UPDATE orders SET
      payment_status=COALESCE($1,payment_status), fulfillment_status=COALESCE($2,fulfillment_status)
      WHERE id=$3 RETURNING id::text, payment_status AS payment, fulfillment_status AS fulfillment`,
      [payment ?? null, fulfillment ?? null, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Order not found." });
    response.json({ order: rows[0] });
  } catch (error) {
    next(error);
  }
});
