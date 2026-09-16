import { Router } from "express";
import { normalizeDraft, validDraftIdentity } from "../product-draft.js";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";
import sanitizeHtml from "sanitize-html";
import { unlink } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

export const productsRouter = Router();
productsRouter.use(requireAdmin);

const validStatus = new Set(["Active", "Draft", "Archived"]);
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const array = (value) => Array.isArray(value) ? value.map(String) : [];
const numberOrNull = (value) => value === "" || value === null || value === undefined ? null : Number(value);
const productUploadDirectory = resolve(process.cwd(), "uploads", "products");
const uploadedImagePath = (url) => {
  if (typeof url !== "string") return null;
  let pathname = url.split(/[?#]/, 1)[0];
  try { if (/^https?:\/\//i.test(url)) pathname = new URL(url).pathname; } catch { return null; }
  const prefix = "/uploads/products/";
  if (!pathname.startsWith(prefix)) return null;
  let filename;
  try { filename = decodeURIComponent(pathname.slice(prefix.length)); } catch { return null; }
  if (!filename || basename(filename) !== filename) return null;
  const target = resolve(productUploadDirectory, filename);
  return dirname(target) === productUploadDirectory ? target : null;
};
const collectUploadedImages = (value, paths = new Set()) => {
  if (Array.isArray(value)) value.forEach(item => collectUploadedImages(item, paths));
  else if (value && typeof value === "object") {
    const path = uploadedImagePath(value.url);
    if (path) paths.add(path);
    Object.values(value).forEach(item => collectUploadedImages(item, paths));
  }
  return paths;
};
const hasProductImage = (body) => {
  const media = Array.isArray(body.media) ? body.media : [];
  const variants = Array.isArray(body.variants) ? body.variants : [];
  return media.some((item) => typeof item?.url === "string" && item.url.trim()) || variants.some((variant) => {
    const mediaByValue = variant?.mediaByValue;
    return mediaByValue && typeof mediaByValue === "object" && Object.values(mediaByValue).some((items) =>
      Array.isArray(items) && items.some((item) => typeof item?.url === "string" && item.url.trim())
    );
  });
};

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
    const body = request.body?.status === "Draft" ? normalizeDraft(request.body) : request.body ?? {};
    if (body.status !== "Draft" && !hasProductImage(body)) return response.status(400).json({ error: "At least one product image is required." });
    if (body.status !== "Draft" && (!array(body.genders).length || !array(body.categories).length || !array(body.subcategories).length)) return response.status(400).json({ error: "Gender, category, and sub category are required." });
    if (body.status !== "Draft" && ![body.shape, body.material, body.rim].every(value => typeof value === "string" && value.trim() && !value.startsWith("Select "))) return response.status(400).json({ error: "Frame shape, frame material, and rim are required." });
    const title = String(body.title ?? "").trim(), price = Number(body.price), quantity = Number(body.quantity);
    if (!title) return response.status(400).json({ error: "Product title is required." });
    if (!Number.isFinite(price) || price < 0) return response.status(400).json({ error: "A valid product price is required." });
    if (!Number.isInteger(quantity) || quantity < 0) return response.status(400).json({ error: "Quantity must be a non-negative whole number." });
    if (!validStatus.has(body.status)) return response.status(400).json({ error: "Invalid product status." });
    const discountPercent = Number(body.discountPercent ?? 0);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) return response.status(400).json({ error: "Price off must be between 0 and 100 percent." });
    const existing = await pool.query("SELECT media, variants, slug FROM products WHERE id=$1", [request.params.id]);
    if (!existing.rows[0]) return response.status(404).json({ error: "Product not found." });
    const previousImagePaths = new Set();
    collectUploadedImages(existing.rows[0].media, previousImagePaths);
    collectUploadedImages(existing.rows[0].variants, previousImagePaths);
    const description = sanitizeHtml(String(body.description ?? ""), { allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "div", "span", "font"], allowedAttributes: { "*": ["style", "align"], font: ["color", "size"] }, allowedStyles: { "*": { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/], "text-align": [/^(left|center|right|justify)$/], "font-size": [/^[0-9.]+(px|rem|em|%)$/] } } });
    const { rows } = await pool.query(`UPDATE products SET title=$1,slug=$2,description=$3,price=$4,quantity=$5,status=$6,sku=$7,
      compare_price=$8,cost=$9,taxable=$10,barcode=$11,track_quantity=$12,continue_selling=$13,shape=$14,material=$15,rim=$16,fit=$17,
      weight=$18,special_feature=$19,measurements=$20::jsonb,lens_compatibility=$21::jsonb,variants=$22::jsonb,genders=$23::jsonb,
      categories=$24::jsonb,subcategories=$25::jsonb,collections=$26::jsonb,brands=$27::jsonb,tags=$28::jsonb,media=$29::jsonb,discount_percent=$31,draft_revision=9007199254740991,updated_at=NOW()
      WHERE id=$30 RETURNING id::text,title,slug,price::float,quantity,status`, [title, body.status === "Draft" ? existing.rows[0].slug : slugify(title), description, price, quantity, body.status, String(body.sku ?? "").trim() || null,
      numberOrNull(body.comparePrice), numberOrNull(body.cost), body.taxable === true, String(body.barcode ?? "").trim() || null, true, false,
      body.shape || null, body.material || null, body.rim || null, body.fit || null, numberOrNull(body.weight), String(body.feature ?? "").trim() || null, JSON.stringify(body.measurements ?? {}),
      JSON.stringify(array(body.lensCompatibility)), JSON.stringify(body.variants ?? []), JSON.stringify(array(body.genders)), JSON.stringify(array(body.categories)), JSON.stringify(array(body.subcategories)),
      JSON.stringify(array(body.collections)), JSON.stringify(array(body.brands)), JSON.stringify(array(body.tags)), JSON.stringify(body.media ?? []), request.params.id, discountPercent]);
    if (!rows[0]) return response.status(404).json({ error: "Product not found." });
    const currentImagePaths = new Set();
    collectUploadedImages(body.media, currentImagePaths);
    collectUploadedImages(body.variants, currentImagePaths);
    const removedImagePaths = [...previousImagePaths].filter(path => !currentImagePaths.has(path));
    const retained = await pool.query("SELECT media, variants FROM products");
    const retainedPaths = new Set();
    retained.rows.forEach(product => {
      collectUploadedImages(product.media, retainedPaths);
      collectUploadedImages(product.variants, retainedPaths);
    });
    const pathsToDelete = removedImagePaths.filter(path => !retainedPaths.has(path));
    const cleanup = await Promise.allSettled(pathsToDelete.map(path => unlink(path)));
    cleanup.forEach((result, index) => {
      if (result.status === "rejected" && result.reason?.code !== "ENOENT") console.error(`Could not delete removed product image ${pathsToDelete[index]}`, result.reason);
    });
    response.json({ product: rows[0], imagesDeleted: cleanup.filter(result => result.status === "fulfilled").length });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: error.constraint?.includes("sku") ? "This SKU is already in use." : "A product with this title already exists." });
    next(error);
  }
});

productsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body?.status === "Draft" ? normalizeDraft(request.body) : request.body ?? {};
    const draftKey = body.draftKey ?? null;
    if (draftKey !== null && (body.status !== "Draft" || !validDraftIdentity(draftKey, body.draftRevision))) {
      return response.status(400).json({ error: "Invalid draft save request." });
    }
    if (body.status !== "Draft" && !hasProductImage(body)) return response.status(400).json({ error: "At least one product image is required." });
    if (body.status !== "Draft" && (!array(body.genders).length || !array(body.categories).length || !array(body.subcategories).length)) return response.status(400).json({ error: "Gender, category, and sub category are required." });
    if (body.status !== "Draft" && ![body.shape, body.material, body.rim].every(value => typeof value === "string" && value.trim() && !value.startsWith("Select "))) return response.status(400).json({ error: "Frame shape, frame material, and rim are required." });
    if (typeof body.title !== "string" || !body.title.trim()) return response.status(400).json({ error: "Product title is required." });
    const price = numberOrNull(body.price);
    if (price === null || !Number.isFinite(price) || price < 0) return response.status(400).json({ error: "A valid product price is required." });
    if (!validStatus.has(body.status)) return response.status(400).json({ error: "Invalid product status." });
    const quantity = Number(body.quantity ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0) return response.status(400).json({ error: "Quantity must be a non-negative whole number." });
    const slug = draftKey ? `${slugify(body.title).slice(0, 175)}-${draftKey}` : slugify(body.title);
    const discountPercent = Number(body.discountPercent ?? 0), weight = numberOrNull(body.weight);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) return response.status(400).json({ error: "Price off must be between 0 and 100 percent." });
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return response.status(400).json({ error: "Weight must be a valid non-negative number." });
    }
    const measurements = body.measurements && typeof body.measurements === "object" ? body.measurements : {};
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const media = Array.isArray(body.media) ? body.media : [];
    const { rows } = await pool.query(`
      INSERT INTO products (
        title,slug,description,price,compare_price,cost,taxable,sku,barcode,track_quantity,quantity,
        continue_selling,shape,material,rim,fit,weight,special_feature,measurements,lens_compatibility,
        variants,status,genders,categories,subcategories,collections,brands,tags,media,discount_percent,draft_key,draft_revision
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,
        $21::jsonb,$22,$23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,$28::jsonb,$29::jsonb,$30,$31,$32
      ) ON CONFLICT (draft_key) DO UPDATE SET
        title=EXCLUDED.title, description=EXCLUDED.description, price=EXCLUDED.price,
        quantity=EXCLUDED.quantity, sku=EXCLUDED.sku, shape=EXCLUDED.shape,
        material=EXCLUDED.material, rim=EXCLUDED.rim, fit=EXCLUDED.fit, weight=EXCLUDED.weight,
        special_feature=EXCLUDED.special_feature, measurements=EXCLUDED.measurements,
        lens_compatibility=EXCLUDED.lens_compatibility, variants=EXCLUDED.variants,
        genders=EXCLUDED.genders, categories=EXCLUDED.categories, subcategories=EXCLUDED.subcategories,
        collections=EXCLUDED.collections, brands=EXCLUDED.brands, tags=EXCLUDED.tags,
        media=EXCLUDED.media, discount_percent=EXCLUDED.discount_percent,
        draft_revision=EXCLUDED.draft_revision, updated_at=NOW()
      WHERE products.status='Draft' AND products.draft_revision < EXCLUDED.draft_revision
      RETURNING id::text,title,slug,sku,price::float,quantity,status,created_at AS "createdAt"
    `, [
      body.title.trim(), slug, sanitizeHtml(String(body.description ?? ""), { allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "div", "span", "font"], allowedAttributes: { "*": ["style", "align"], font: ["color", "size"] }, allowedStyles: { "*": { color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/], "text-align": [/^(left|center|right|justify)$/], "font-size": [/^[0-9.]+(px|rem|em|%)$/] } } }), price, null, null, false,
      String(body.sku ?? "").trim() || null, String(body.barcode ?? "").trim() || null, true,
      quantity, false, body.shape || null, body.material || null, body.rim || null,
      body.fit || null, weight, String(body.feature ?? "").trim() || null, JSON.stringify(measurements),
      JSON.stringify(array(body.lensCompatibility)), JSON.stringify(variants), body.status,
      JSON.stringify(array(body.genders)), JSON.stringify(array(body.categories)), JSON.stringify(array(body.subcategories)),
      JSON.stringify(array(body.collections)), JSON.stringify(array(body.brands)), JSON.stringify(array(body.tags)), JSON.stringify(media), discountPercent, draftKey, body.draftRevision ?? 0,
    ]);
    if (!rows[0] && draftKey) {
      const existing = await pool.query("SELECT id::text, status FROM products WHERE draft_key=$1", [draftKey]);
      return response.json({ product: existing.rows[0] });
    }
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
    const { rows } = await pool.query("DELETE FROM products WHERE id=ANY($1::bigint[]) RETURNING media, variants", [ids]);
    const imagePaths = new Set();
    rows.forEach(product => {
      collectUploadedImages(product.media, imagePaths);
      collectUploadedImages(product.variants, imagePaths);
    });
    const retained = await pool.query("SELECT media, variants FROM products");
    const retainedPaths = new Set();
    retained.rows.forEach(product => {
      collectUploadedImages(product.media, retainedPaths);
      collectUploadedImages(product.variants, retainedPaths);
    });
    const pathsToDelete = [...imagePaths].filter(path => !retainedPaths.has(path));
    const cleanup = await Promise.allSettled(pathsToDelete.map(path => unlink(path)));
    cleanup.forEach((result, index) => {
      if (result.status === "rejected" && result.reason?.code !== "ENOENT") console.error(`Could not delete product image ${pathsToDelete[index]}`, result.reason);
    });
    response.json({ deleted: rows.length, imagesDeleted: cleanup.filter(result => result.status === "fulfilled").length });
  } catch (error) { next(error); }
});
