import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const inventoryRouter = Router();
inventoryRouter.use(requireAdmin);

inventoryRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`
      WITH committed AS (
        SELECT (item->>'productId') AS product_id, SUM(COALESCE((item->>'quantity')::int, 0))::int AS quantity
        FROM orders o
        CROSS JOIN LATERAL jsonb_array_elements(o.items) item
        WHERE o.fulfillment_status IN ('Unfulfilled', 'Processing')
        GROUP BY item->>'productId'
      )
      SELECT p.id::text, p.title AS name, p.sku, p.quantity AS available, p.status,
        p.categories, p.variants, p.media, COALESCE(c.quantity, 0)::int AS committed
      FROM products p
      LEFT JOIN committed c ON c.product_id = p.id::text
      ORDER BY p.updated_at DESC
    `);
    const inventory = rows.map((product) => ({
      id: product.id,
      name: product.name,
      variant: [product.categories?.[0], product.variants?.find?.((variant) => String(variant.name).toLowerCase().includes("color"))?.values?.[0]].filter(Boolean).join(" / ") || "Default",
      sku: product.sku || "No SKU",
      image: Array.isArray(product.media) ? product.media[0]?.url || "" : "",
      category: product.categories?.[0] || "Uncategorized",
      available: product.available,
      committed: product.committed,
      incoming: 0,
      reorder: 10,
      status: product.available <= 0 ? "Out of stock" : product.available <= 10 ? "Low stock" : "In stock",
      productStatus: product.status,
    }));
    response.json({ inventory });
  } catch (error) {
    next(error);
  }
});

inventoryRouter.patch("/:id", async (request, response, next) => {
  try {
    const mode = String(request.body?.mode || "");
    const amount = Number(request.body?.quantity);
    if (!["Add", "Remove", "Set exact quantity"].includes(mode)) return response.status(400).json({ error: "Invalid adjustment type." });
    if (!Number.isInteger(amount) || amount < 0) return response.status(400).json({ error: "Quantity must be a non-negative whole number." });
    const expression = mode === "Add" ? "quantity + $1" : mode === "Remove" ? "GREATEST(quantity - $1, 0)" : "$1";
    const { rows } = await pool.query(`UPDATE products SET quantity=${expression}, updated_at=NOW() WHERE id=$2 RETURNING id::text, quantity`, [amount, request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Product not found." });
    response.json({ product: rows[0] });
  } catch (error) {
    next(error);
  }
});
