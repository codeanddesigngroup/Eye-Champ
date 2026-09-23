import { Router } from "express";
import { pool } from "../db.js";
import { createMailer } from "../mailer.js";

export const checkoutRouter = Router();
const lensPrices = new Set([0, 1500, 2500, 6500]);
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const money = (currency, value) => `${currency} ${Number(value || 0).toFixed(2)}`;

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
    const settings = await client.query("SELECT value->>'currency' AS currency, value->>'storeName' AS name FROM store_settings WHERE key='general'");
    const currency = settings.rows[0]?.currency || "PKR";
    const storeName = settings.rows[0]?.name || "Eye Champ";
    await client.query("COMMIT");

    let emailSent = false;
    const transport = createMailer();
    if (transport) {
      const itemRows = orderItems.map(item => {
        const itemTotal = (Number(item.framePrice) + Number(item.lensPrice || 0)) * Number(item.quantity);
        return `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb"><strong>${escapeHtml(item.name)}</strong>${item.frameColor ? `<br><span style="color:#667085">Color: ${escapeHtml(item.frameColor)}</span>` : ""}${item.lens ? `<br><span style="color:#667085">Lens: ${escapeHtml(item.lens)}</span>` : ""}</td><td style="padding:10px;text-align:center;border-bottom:1px solid #e5e7eb">${Number(item.quantity)}</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid #e5e7eb">${escapeHtml(money(currency, itemTotal))}</td></tr>`;
      }).join("");
      const textItems = orderItems.map(item => `- ${item.name} x ${item.quantity}: ${money(currency, (Number(item.framePrice) + Number(item.lensPrice || 0)) * Number(item.quantity))}`).join("\n");
      try {
        await transport.sendMail({
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: customer.email.trim().toLowerCase(),
          subject: `${storeName} order confirmation ${orderNumber}`,
          text: `Thank you for your order, ${customer.name.trim()}.\n\nOrder: ${orderNumber}\nPayment: ${paymentMethod}\n\n${textItems}\n\nTotal: ${money(currency, subtotal)}\n\nDelivery address:\n${customer.address.trim()}, ${customer.city.trim()} ${customer.postalCode.trim()}\nPhone: ${customer.phone.trim()}`,
          html: `<div style="max-width:640px;margin:auto;color:#172b34;font-family:Arial,sans-serif"><h1 style="font-size:26px">Thank you for your order</h1><p>Hi ${escapeHtml(customer.name.trim())}, we received your order and will contact you when it is on its way.</p><div style="margin:24px 0;padding:16px;border-radius:10px;background:#f3f7f7"><strong>Order ${escapeHtml(orderNumber)}</strong><br><span>Payment: ${escapeHtml(paymentMethod)}</span></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemRows}</tbody></table><p style="font-size:18px;text-align:right"><strong>Total: ${escapeHtml(money(currency, subtotal))}</strong></p><h2 style="font-size:16px">Delivery details</h2><p>${escapeHtml(customer.address.trim())}<br>${escapeHtml(customer.city.trim())}, ${escapeHtml(customer.postalCode.trim())}<br>${escapeHtml(customer.phone.trim())}</p></div>`,
        });
        emailSent = true;
      } catch (error) {
        console.error("Order confirmation email delivery failed", { orderNumber, code: error.code, command: error.command, responseCode: error.responseCode });
      }
    } else {
      console.warn("Order confirmation email skipped because SMTP is not configured", { orderNumber });
    }
    response.status(201).json({ order: { id: rows[0].id, orderNumber, subtotal, paymentMethod, emailSent } });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  } finally {
    client.release();
  }
});
