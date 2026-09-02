import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";
import sanitizeHtml from "sanitize-html";

export const productsRouter = Router();
productsRouter.use(requireAdmin);

const validStatus = new Set(["Active", "Draft", "Archived"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const array = (value) => Array.isArray(value) ? value.map(String) : [];
const numberOrNull = (value) => value === "" || value === null || value === undefined ? null : Number(value);

productsRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT id::text, title, slug, sku, price::float, quantity, status,
      categories, media, variants, created_at AS "createdAt", updated_at AS "updatedAt" FROM products ORDER BY created_at DESC`);
    response.json({ products: rows });
  } catch (error) { next(error); }
});

productsRouter.get("/:id", async (request, response, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Product not found." });
    response.json({ product: rows[0] });
  } catch (error) { next(error); }
});

productsRouter.patch("/:id", async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const title = String(body.title ?? "").trim(), price = Number(body.price), quantity = Number(body.quantity);
    if (!title) return response.status(400).json({ error: "Product title is required." });
    if (!Number.isFinite(price) || price < 0) return response.status(400).json({ error: "A valid product price is required." });
    if (!Number.isInteger(quantity) || quantity < 0) return response.status(400).json({ error: "Quantity must be a non-negative whole number." });
    if (!validStatus.has(body.status)) return response.status(400).json({ error: "Invalid product status." });
    const description = sanitizeHtml(String(body.description ?? ""), { allowedTags: ["p","br","strong","b","em","i","ul","ol","li","div","span","font"], allowedAttributes: { "*": ["style", "align"], font: ["color","size"] }, allowedStyles: { "*": { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/], "text-align": [/^(left|center|right|justify)$/], "font-size": [/^[0-9.]+(px|rem|em|%)$/] } } });
    const { rows } = await pool.query(`UPDATE products SET title=$1,slug=$2,description=$3,price=$4,quantity=$5,status=$6,sku=$7,
      compare_price=$8,cost=$9,taxable=$10,barcode=$11,track_quantity=$12,continue_selling=$13,shape=$14,material=$15,rim=$16,fit=$17,
      weight=$18,special_feature=$19,measurements=$20::jsonb,lens_compatibility=$21::jsonb,variants=$22::jsonb,genders=$23::jsonb,
      categories=$24::jsonb,subcategories=$25::jsonb,collections=$26::jsonb,brands=$27::jsonb,tags=$28::jsonb,media=$29::jsonb,updated_at=NOW()
      WHERE id=$30 RETURNING id::text,title,slug,price::float,quantity,status`, [title,slugify(title),description,price,quantity,body.status,String(body.sku??"").trim()||null,
      numberOrNull(body.comparePrice),numberOrNull(body.cost),body.taxable===true,String(body.barcode??"").trim()||null,body.trackQuantity===true,body.continueSelling===true,
      body.shape||null,body.material||null,body.rim||null,body.fit||null,numberOrNull(body.weight),String(body.feature??"").trim()||null,JSON.stringify(body.measurements??{}),
      JSON.stringify(array(body.lensCompatibility)),JSON.stringify(body.variants??[]),JSON.stringify(array(body.genders)),JSON.stringify(array(body.categories)),JSON.stringify(array(body.subcategories)),
      JSON.stringify(array(body.collections)),JSON.stringify(array(body.brands)),JSON.stringify(array(body.tags)),JSON.stringify(body.media??[]),request.params.id]);
    if (!rows[0]) return response.status(404).json({ error: "Product not found." });
    response.json({ product: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: error.constraint?.includes("sku") ? "This SKU is already in use." : "A product with this title already exists." });
    next(error);
  }
});

productsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body ?? {};
    if (typeof body.title !== "string" || !body.title.trim()) return response.status(400).json({ error: "Product title is required." });
    const price = numberOrNull(body.price);
    if (price === null || !Number.isFinite(price) || price < 0) return response.status(400).json({ error: "A valid product price is required." });
    if (!validStatus.has(body.status)) return response.status(400).json({ error: "Invalid product status." });
    const quantity = Number(body.quantity ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0) return response.status(400).json({ error: "Quantity must be a non-negative whole number." });
    const slug = slugify(body.title);
    const comparePrice = numberOrNull(body.comparePrice), cost = numberOrNull(body.cost), weight = numberOrNull(body.weight);
    if ([comparePrice, cost, weight].some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
      return response.status(400).json({ error: "Prices, cost, and weight must be valid non-negative numbers." });
    }
    const measurements = body.measurements && typeof body.measurements === "object" ? body.measurements : {};
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const media = Array.isArray(body.media) ? body.media : [];
    const { rows } = await pool.query(`
      INSERT INTO products (
        title,slug,description,price,compare_price,cost,taxable,sku,barcode,track_quantity,quantity,
        continue_selling,shape,material,rim,fit,weight,special_feature,measurements,lens_compatibility,
        variants,status,genders,categories,subcategories,collections,brands,tags,media
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,
        $21::jsonb,$22,$23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,$28::jsonb,$29::jsonb
      ) RETURNING id::text,title,slug,sku,price::float,quantity,status,created_at AS "createdAt"
    `, [
      body.title.trim(), slug, sanitizeHtml(String(body.description ?? ""), { allowedTags: ["p","br","strong","b","em","i","ul","ol","li","div","span","font"], allowedAttributes: { "*": ["style", "align"], font: ["color","size"] }, allowedStyles: { "*": { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/], "text-align": [/^(left|center|right|justify)$/], "font-size": [/^[0-9.]+(px|rem|em|%)$/] } } }), price, comparePrice, cost, body.taxable === true,
      String(body.sku ?? "").trim() || null, String(body.barcode ?? "").trim() || null, body.trackQuantity === true,
      quantity, body.continueSelling === true, body.shape || null, body.material || null, body.rim || null,
      body.fit || null, weight, String(body.feature ?? "").trim() || null, JSON.stringify(measurements),
      JSON.stringify(array(body.lensCompatibility)), JSON.stringify(variants), body.status,
      JSON.stringify(array(body.genders)), JSON.stringify(array(body.categories)), JSON.stringify(array(body.subcategories)),
      JSON.stringify(array(body.collections)), JSON.stringify(array(body.brands)), JSON.stringify(array(body.tags)), JSON.stringify(media),
    ]);
    response.status(201).json({ product: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: error.constraint?.includes("sku") ? "This SKU is already in use." : "A product with this title already exists." });
    next(error);
  }
});

productsRouter.delete("/", async (request, response, next) => {
  try {
    const { ids } = request.body ?? {};
    if (!Array.isArray(ids) || !ids.length) return response.status(400).json({ error: "Product IDs are required." });
    const result = await pool.query("DELETE FROM products WHERE id=ANY($1::bigint[])", [ids]);
    response.json({ deleted: result.rowCount });
  } catch (error) { next(error); }
});
