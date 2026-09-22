import { Router } from "express";
import { hashPassword, verifyPassword } from "../auth.js";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const settingsRouter = Router();
settingsRouter.use(requireAdmin);

const defaultSettings = {
  storeName: "Eye Champ",
  supportEmail: "support@eyechamp.com",
  supportPhone: "",
  currency: "PKR",
  storeStatus: "Live",
  orderNotifications: true,
  promoEnabled: true,
  promoText: "Buy one, get one 20% off.",
  promoCode: "GET20",
};

settingsRouter.get("/", async (_request, response, next) => {
  try {
    const { rows } = await pool.query("SELECT value FROM store_settings WHERE key='general'");
    response.json({ settings: { ...defaultSettings, ...(rows[0]?.value ?? {}) } });
  } catch (error) { next(error); }
});

settingsRouter.put("/", async (request, response, next) => {
  try {
    const body = request.body ?? {};
    const settings = {
      storeName: String(body.storeName ?? defaultSettings.storeName).trim() || defaultSettings.storeName,
      supportEmail: String(body.supportEmail ?? defaultSettings.supportEmail).trim(),
      supportPhone: String(body.supportPhone ?? "").trim(),
      currency: String(body.currency ?? defaultSettings.currency).trim() || defaultSettings.currency,
      storeStatus: String(body.storeStatus ?? defaultSettings.storeStatus) === "Paused" ? "Paused" : "Live",
      orderNotifications: body.orderNotifications !== false,
      promoEnabled: body.promoEnabled !== false,
      promoText: String(body.promoText ?? defaultSettings.promoText).trim().slice(0, 200),
      promoCode: String(body.promoCode ?? defaultSettings.promoCode).trim().slice(0, 40),
    };
    const { rows } = await pool.query(`INSERT INTO store_settings(key,value) VALUES('general',$1::jsonb)
      ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()
      RETURNING value`, [JSON.stringify(settings)]);
    response.json({ settings: rows[0].value });
  } catch (error) { next(error); }
});

settingsRouter.put("/account", async (request, response, next) => {
  try {
    const email = String(request.body?.email ?? "").trim().toLowerCase();
    const currentPassword = String(request.body?.currentPassword ?? "");
    const newPassword = String(request.body?.newPassword ?? "");
    const confirmPassword = String(request.body?.confirmPassword ?? "");
    if (!email || !email.includes("@")) return response.status(400).json({ error: "Enter a valid admin email address." });
    if (!currentPassword) return response.status(400).json({ error: "Current password is required." });
    if (newPassword && newPassword.length < 6) return response.status(400).json({ error: "New password must be at least 6 characters." });
    if (newPassword && newPassword !== confirmPassword) return response.status(400).json({ error: "New password and confirmation do not match." });
    const adminResult = await pool.query("SELECT id, email, name, password_hash FROM admins WHERE id=$1", [request.admin.id]);
    const admin = adminResult.rows[0];
    if (!admin || !(await verifyPassword(currentPassword, admin.password_hash))) return response.status(401).json({ error: "Current password is incorrect." });
    const passwordHash = newPassword ? await hashPassword(newPassword) : admin.password_hash;
    const { rows } = await pool.query(
      "UPDATE admins SET email=$1, password_hash=$2 WHERE id=$3 RETURNING id::text, email, name",
      [email, passwordHash, admin.id],
    );
    response.json({ admin: rows[0] });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "This admin email is already in use." });
    next(error);
  }
});
