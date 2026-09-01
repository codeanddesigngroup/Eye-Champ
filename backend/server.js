import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { hashPassword } from "./auth.js";
import { initializeDatabase, pool } from "./db.js";
import { adminAuthRouter } from "./routes/admin-auth.js";
import { categoriesRouter } from "./routes/categories.js";
import { collectionsRouter } from "./routes/collections.js";
import { brandsRouter } from "./routes/brands.js";

const app = express();
const port = Number(process.env.BACKEND_PORT || 4000);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.get("/api/health", async (_request, response, next) => {
  try { await pool.query("SELECT 1"); response.json({ status: "ok" }); }
  catch (error) { next(error); }
});
app.use("/api/admin", adminAuthRouter);
app.use("/api/admin/categories", categoriesRouter);
app.use("/api/admin/collections", collectionsRouter);
app.use("/api/admin/brands", brandsRouter);
app.use((_request, response) => response.status(404).json({ error: "Route not found." }));
app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error." });
});

async function start() {
  await initializeDatabase();
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);
    await pool.query(`
      INSERT INTO admins (email, name, password_hash) VALUES (LOWER($1), $2, $3)
      ON CONFLICT (email) DO NOTHING
    `, [process.env.ADMIN_EMAIL.trim(), process.env.ADMIN_NAME || "Admin", passwordHash]);
  }
  app.listen(port, () => console.log(`Express API listening on http://localhost:${port}`));
}

start().catch((error) => { console.error("Backend failed to start", error); process.exit(1); });
