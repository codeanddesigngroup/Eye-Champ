import { Router } from "express";
import { pool } from "../db.js";

export const storefrontProductsRouter = Router();

storefrontProductsRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, title, slug, price::float, quantity, shape,
      categories, brands, media, variants, created_at AS "createdAt"
      FROM products WHERE status = 'Active' ORDER BY created_at DESC`);
    response.json({ products: rows });
  } catch (error) { next(error); }
});
