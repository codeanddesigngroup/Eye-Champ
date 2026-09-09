import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { pool } from "../db.js";

export const customerAuthRouter = Router();
const cookieName = "eye_champ_customer_session";
const sessionSeconds = 60 * 60 * 24 * 7;
const hash = value => createHash("sha256").update(value).digest("hex");
const normalizeEmail = value => String(value ?? "").trim().toLowerCase();

const requestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });

function mailer() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

customerAuthRouter.post("/request-otp", requestLimiter, async (request, response, next) => {
  try {
    const email = normalizeEmail(request.body?.email);
    if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: "Enter a valid email address." });
    const existing = await pool.query("SELECT 1 FROM orders WHERE LOWER(email)=$1 LIMIT 1", [email]);
    if (!existing.rowCount) return response.status(404).json({ error: "No orders were found for this email address." });
    const transport = mailer();
    if (!transport) return response.status(503).json({ error: "Email delivery is not configured. Add the SMTP settings to your .env file." });

    const id = randomBytes(32).toString("hex");
    const code = String(randomInt(100000, 1000000));
    await pool.query("DELETE FROM customer_otp_challenges WHERE email=$1 OR expires_at<=NOW()", [email]);
    await pool.query("INSERT INTO customer_otp_challenges(id,email,code_hash,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '10 minutes')", [id, email, hash(`${id}:${code}`)]);
    try {
      await transport.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Your Eye Champ verification code",
        text: `Your Eye Champ verification code is ${code}. It expires in 10 minutes.`,
        html: `<div style="font-family:Arial,sans-serif"><h2>Eye Champ</h2><p>Your verification code is:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
      });
    } catch (error) {
      await pool.query("DELETE FROM customer_otp_challenges WHERE id=$1", [id]);
      throw error;
    }
    response.json({ challengeId: id, email, expiresIn: 600 });
  } catch (error) { next(error); }
});

customerAuthRouter.post("/verify-otp", verifyLimiter, async (request, response, next) => {
  try {
    const challengeId = String(request.body?.challengeId ?? "");
    const code = String(request.body?.code ?? "");
    if (!/^[a-f0-9]{64}$/.test(challengeId) || !/^\d{6}$/.test(code)) return response.status(400).json({ error: "Enter the complete 6-digit code." });
    const { rows } = await pool.query("SELECT id,email,code_hash,attempts FROM customer_otp_challenges WHERE id=$1 AND expires_at>NOW()", [challengeId]);
    const challenge = rows[0];
    if (!challenge) return response.status(400).json({ error: "This code has expired. Request a new code." });
    if (challenge.attempts >= 5) return response.status(429).json({ error: "Too many incorrect attempts. Request a new code." });
    const actual = Buffer.from(hash(`${challengeId}:${code}`), "hex");
    const expected = Buffer.from(challenge.code_hash, "hex");
    if (!timingSafeEqual(actual, expected)) {
      await pool.query("UPDATE customer_otp_challenges SET attempts=attempts+1 WHERE id=$1", [challengeId]);
      return response.status(400).json({ error: "Incorrect verification code." });
    }
    const token = randomBytes(32).toString("base64url");
    await pool.query("DELETE FROM customer_otp_challenges WHERE id=$1", [challengeId]);
    await pool.query("DELETE FROM customer_sessions WHERE expires_at<=NOW()");
    await pool.query("INSERT INTO customer_sessions(token_hash,email,expires_at) VALUES($1,$2,NOW()+($3*INTERVAL '1 second'))", [hash(token), challenge.email, sessionSeconds]);
    response.cookie(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: sessionSeconds * 1000, path: "/" });
    response.json({ ok: true });
  } catch (error) { next(error); }
});

customerAuthRouter.get("/me", async (request, response, next) => {
  try {
    const token = request.cookies[cookieName];
    if (!token) return response.status(401).json({ error: "Not authenticated." });
    const session = await pool.query("SELECT email FROM customer_sessions WHERE token_hash=$1 AND expires_at>NOW()", [hash(token)]);
    if (!session.rowCount) return response.status(401).json({ error: "Session expired." });
    const email = session.rows[0].email;
    const { rows } = await pool.query(`SELECT order_number AS "orderNumber",customer_name AS name,phone,address,city,postal_code AS "postalCode",items,subtotal::float AS total,payment_status AS payment,fulfillment_status AS fulfillment,payment_method AS "paymentMethod",created_at AS "createdAt" FROM orders WHERE LOWER(email)=$1 ORDER BY created_at DESC`, [email]);
    response.json({ customer: { email, name: rows[0]?.name ?? "Customer", phone: rows[0]?.phone ?? "", address: rows[0]?.address ?? "", city: rows[0]?.city ?? "", postalCode: rows[0]?.postalCode ?? "" }, orders: rows });
  } catch (error) { next(error); }
});

customerAuthRouter.post("/logout", async (request, response, next) => {
  try {
    const token = request.cookies[cookieName];
    if (token) await pool.query("DELETE FROM customer_sessions WHERE token_hash=$1", [hash(token)]);
    response.clearCookie(cookieName, { path: "/" });
    response.json({ ok: true });
  } catch (error) { next(error); }
});
