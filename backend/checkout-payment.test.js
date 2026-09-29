import test from "node:test";
import assert from "node:assert/strict";
import { pool } from "./db.js";
import { checkoutRouter } from "./routes/checkout.js";

test("checkout computes delivery, preserves billing and validates payment methods", async () => {
  const originalConnect = pool.connect;
  const smtpHost = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  let inserted;
  pool.connect = async () => ({
    release() {},
    async query(sql, values) {
      if (sql.startsWith("SELECT id::text,title")) return { rows: [{ id: "1", title: "Frame", price: 1000, quantity: 10 }] };
      if (sql.startsWith("INSERT INTO orders")) { inserted = values; return { rows: [{ id: "7" }] }; }
      return { rows: [] };
    },
  });
  const handler = checkoutRouter.stack.find(layer => layer.route?.methods.post).route.stack[0].handle;
  const customer = { name: "Test", email: "test@example.com", phone: "123", address: "Street", city: "Karachi", postalCode: "75300" };
  async function checkout(paymentMethod, billingAddress) {
    let status = 200, body;
    await handler({ body: { customer, paymentMethod, billingAddress, deliveryCharge: 0, items: [{ productId: "1", quantity: 2, framePrice: 1, lensPrice: 0 }] } }, {
      status(value) { status = value; return this; }, json(value) { body = value; },
    }, error => { throw error; });
    return { status, ...body };
  }
  try {
    const cod = await checkout("Cash on Delivery");
    assert.equal(cod.status, 201);
    assert.equal(cod.order.total, 2199);
    assert.equal(inserted[9], 199);
    assert.equal(JSON.parse(inserted[10]).address, "Street");
    const billing = { name: "Billing", address: "Other street", city: "Lahore", postalCode: "54000" };
    const prepaid = await checkout("Bank Transfer", billing);
    assert.equal(prepaid.order.total, 2000);
    assert.equal(inserted[9], 0);
    assert.deepEqual(JSON.parse(inserted[10]), billing);
    assert.match(prepaid.order.paymentNote, /Payment pending/);
    assert.equal((await checkout("Fake method")).status, 400);
    assert.equal((await checkout("Bank Transfer", { name: "Missing fields" })).status, 400);
  } finally {
    pool.connect = originalConnect;
    if (smtpHost === undefined) delete process.env.SMTP_HOST; else process.env.SMTP_HOST = smtpHost;
    await pool.end();
  }
});
