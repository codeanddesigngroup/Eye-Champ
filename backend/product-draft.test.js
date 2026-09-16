import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "./db.js";
import { productsRouter } from "./routes/products.js";

test("incomplete drafts, retries, stale requests, and publishing", async () => {
  const client = await pool.connect();
  const originalQuery = pool.query;
  try {
    await client.query("BEGIN");
    // All writes go to a temporary table, never the site's product records.
    await client.query("CREATE TEMP TABLE products (LIKE public.products INCLUDING ALL) ON COMMIT DROP");
    await client.query("CREATE TEMP SEQUENCE draft_test_ids");
    await client.query("ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('draft_test_ids')");
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS draft_key UUID, ADD COLUMN IF NOT EXISTS draft_revision BIGINT NOT NULL DEFAULT 0");
    await client.query("CREATE UNIQUE INDEX ON products(draft_key)");
    pool.query = (...args) => client.query(...args);
    async function request(method, body, id) {
      const handler = productsRouter.stack.find(layer => layer.route?.path === (id ? "/:id" : "/") && layer.route.methods[method]).route.stack[0].handle;
      let status = 200, result;
      await handler({ body, params: { id } }, {
        status(code) { status = code; return this; },
        json(value) { result = value; return this; },
      }, error => { throw error; });
      return { status, ...result };
    }
    const draft = { status: "Draft", draftKey: randomUUID(), draftRevision: 1, description: "An unfinished frame" };
    const first = await request("post", draft);
    assert.equal(first.status, 201);
    assert.equal(first.product.title, "Untitled product");
    assert.equal(first.product.status, "Draft");
    const second = await request("post", { ...draft, draftRevision: 2, title: "Latest title" });
    assert.equal(second.product.id, first.product.id);
    await request("post", draft);
    const stored = await client.query("SELECT title FROM products");
    assert.equal(stored.rows.length, 1);
    assert.equal(stored.rows[0].title, "Latest title");
    assert.equal((await request("post", { status: "Active", title: "Incomplete" })).status, 400);
    assert.equal((await request("post", { ...draft, draftKey: "invalid" })).status, 400);
    const published = await request("patch", {
      title: "Published frame", status: "Active", price: 20, quantity: 1,
      genders: ["Unisex"], categories: ["Glasses"], subcategories: ["Frames"],
      shape: "Round", material: "Metal", rim: "Full rim",
      media: [{ url: "/test.jpg" }],
    }, first.product.id);
    assert.equal(published.status, 200);
    assert.equal(published.product.status, "Active");
    await request("post", { ...draft, draftRevision: 3, title: "Delayed draft" });
    const final = await client.query("SELECT title,status FROM products");
    assert.deepEqual(final.rows, [{ title: "Published frame", status: "Active" }]);
  } finally {
    pool.query = originalQuery;
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
