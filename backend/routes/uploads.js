import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/require-admin.js";

export const uploadsRouter = Router();
uploadsRouter.use(requireAdmin);

const uploadDirectory = join(process.cwd(), "uploads", "products");
mkdirSync(uploadDirectory, { recursive: true });
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, done) => done(null, `${Date.now()}-${randomBytes(6).toString("hex")}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { files: 8, fileSize: 2 * 1024 * 1024 },
  fileFilter: (_request, file, done) => done(null, allowedTypes.has(file.mimetype)),
});

uploadsRouter.post("/products", upload.array("images", 8), (request, response) => {
  const files = Array.isArray(request.files) ? request.files : [];
  if (!files.length) return response.status(400).json({ error: "Select at least one supported image." });
  response.status(201).json({ media: files.map((file) => ({ name: file.originalname, url: `/uploads/products/${file.filename}` })) });
});
