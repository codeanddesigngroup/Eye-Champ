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

ordersRouter.post("/", async (request, response, next) => {
  const client = await pool.connect();
  try {
    const body = request.body ?? {};
    const customer = body.customer ?? {};
    const productId = String(body.productId ?? "");
    const quantity = Number(body.quantity);
    const paymentMethod = String(body.paymentMethod ?? "Cash on Delivery");
    const payment = paymentStatuses.has(body.payment) ? body.payment : "Pending";
    const fulfillment = fulfillmentStatuses.has(body.fulfillment) ? body.fulfillment : "Unfulfilled";
    if (!customer.name?.trim() || !customer.email?.trim() || !customer.phone?.trim() || !customer.address?.trim() || !customer.city?.trim() || !customer.postalCode?.trim()) return response.status(400).json({ error: "Complete all customer and delivery fields." });
    if (!/^\d+$/.test(productId) || !Number.isInteger(quantity) || quantity < 1) return response.status(400).json({ error: "Select a product and valid quantity." });
    await client.query("BEGIN");
    const productResult = await client.query(`SELECT id::text,title,(price*(1-discount_percent/100))::float AS price,quantity,media
      FROM products WHERE id=$1 AND status='Active' FOR UPDATE`, [productId]);
    const product = productResult.rows[0];
    if (!product) throw Object.assign(new Error("The selected product is unavailable."), { status: 409 });
    if (product.quantity < quantity) throw Object.assign(new Error(`${product.title} only has ${product.quantity} available.`), { status: 409 });
    const image = Array.isArray(product.media) ? product.media.find(item => item.primary)?.url || product.media[0]?.url || "" : "";
    const items = [{ productId:product.id, name:product.title, framePrice:product.price, lensPrice:0, quantity, image }];
    const subtotal = product.price * quantity;
    const { rows } = await client.query(`INSERT INTO orders(order_number,customer_name,email,phone,address,city,postal_code,items,subtotal,payment_status,fulfillment_status,payment_method)
      VALUES(NULL,$1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11) RETURNING id::text`,
      [customer.name.trim(), customer.email.trim().toLowerCase(), customer.phone.trim(), customer.address.trim(), customer.city.trim(), customer.postalCode.trim(), JSON.stringify(items), subtotal, payment, fulfillment, paymentMethod]);
    const orderNumber = `EC-${String(rows[0].id).padStart(6, "0")}`;
    await client.query("UPDATE orders SET order_number=$1 WHERE id=$2", [orderNumber, rows[0].id]);
    await client.query("UPDATE products SET quantity=quantity-$1,updated_at=NOW() WHERE id=$2", [quantity, product.id]);
    await client.query("COMMIT");
    response.status(201).json({ order:{ id:rows[0].id, orderNumber } });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.status) return response.status(error.status).json({ error:error.message });
    next(error);
  } finally { client.release(); }
});

ordersRouter.get("/:id", async (request, response, next) => {
  try {
    if (!/^\d+$/.test(request.params.id)) return response.status(400).json({ error: "Invalid order ID." });
    const { rows } = await pool.query(`
      SELECT id::text, order_number AS "orderNumber", customer_name AS customer, email, phone,
        address, city, postal_code AS "postalCode", items, subtotal::float AS total,
        payment_status AS payment, fulfillment_status AS fulfillment,
        payment_method AS "paymentMethod", created_at AS "createdAt"
      FROM orders WHERE id=$1
    `, [request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Order not found." });
    response.json({ order: rows[0] });
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

ordersRouter.delete("/:id", async (request, response, next) => {
  try {
    if (!/^\d+$/.test(request.params.id)) return response.status(400).json({ error: "Invalid order ID." });
    const { rows } = await pool.query("DELETE FROM orders WHERE id=$1 RETURNING id::text, order_number AS \"orderNumber\"", [request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Order not found." });
    response.json({ order: rows[0] });
  } catch (error) { next(error); }
});
