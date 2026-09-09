import { Router } from "express";
import { pool } from "../db.js";

export const checkoutRouter = Router();
const lensPrices = new Set([0, 1500, 2500, 6500]);

checkoutRouter.post("/", async (request, response, next) => {
  const client = await pool.connect();
  try {
    const { customer, items, paymentMethod } = request.body ?? {};
    if (paymentMethod !== "Cash on Delivery") return response.status(400).json({ error: "Cash on Delivery is the only available payment method." });
    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim() || !customer?.address?.trim() || !customer?.city?.trim() || !customer?.postalCode?.trim()) return response.status(400).json({ error: "Complete all checkout fields." });
    if (!Array.isArray(items) || !items.length) return response.status(400).json({ error: "Your cart is empty." });

    await client.query("BEGIN");
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error("Invalid cart item."), { status: 400 });
      const { rows } = await client.query("SELECT id::text,title,(price*(1-discount_percent/100))::float AS price,quantity,continue_selling FROM products WHERE id=$1 AND status='Active' FOR UPDATE", [item.productId]);
      const product = rows[0];
      if (!product) throw Object.assign(new Error("A product in your cart is unavailable."), { status: 409 });
      if (product.quantity < quantity) throw Object.assign(new Error(`${product.title} is out of stock or does not have enough stock.`), { status: 409 });
      const lensPrice = Number(item.lensPrice ?? 0);
      if (!lensPrices.has(lensPrice)) throw Object.assign(new Error("Invalid lens price."), { status: 400 });
      subtotal += (product.price + lensPrice) * quantity;
      orderItems.push({ ...item, productId: product.id, name: product.title, framePrice: product.price, lensPrice, quantity });
      if (product.quantity >= quantity) await client.query("UPDATE products SET quantity=quantity-$1,updated_at=NOW() WHERE id=$2", [quantity, product.id]);
    }

    const { rows } = await client.query(
      "INSERT INTO orders(order_number,customer_name,email,phone,address,city,postal_code,items,subtotal,payment_method) VALUES (NULL,$1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9) RETURNING id::text",
      [customer.name.trim(), customer.email.trim().toLowerCase(), customer.phone.trim(), customer.address.trim(), customer.city.trim(), customer.postalCode.trim(), JSON.stringify(orderItems), subtotal, paymentMethod],
    );
    const orderNumber = `EC-${String(rows[0].id).padStart(6, "0")}`;
    await client.query("UPDATE orders SET order_number=$1 WHERE id=$2", [orderNumber, rows[0].id]);
    await client.query("COMMIT");
    response.status(201).json({ order: { id: rows[0].id, orderNumber, subtotal, paymentMethod } });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  } finally {
    client.release();
  }
});
