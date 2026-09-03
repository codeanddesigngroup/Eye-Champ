import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createSession, deleteSession, findSession, SESSION_COOKIE, verifyPassword } from "../auth.js";
import { pool } from "../db.js";

export const adminAuthRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again in 15 minutes." },
});

adminAuthRouter.post("/login", loginLimiter, async (request, response, next) => {
  try {
    const { email, password, remember = false } = request.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.includes("@") || password.length < 6) {
      return response.status(400).json({ error: "Enter a valid email and password." });
    }
    const result = await pool.query(
      "SELECT id, email, name, password_hash FROM admins WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email.trim()],
    );
    const admin = result.rows[0];
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    const session = await createSession(admin.id, remember === true);
    response.cookie(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production",
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: session.maxAge * 1000,
    });
    return response.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) { return next(error); }
});

adminAuthRouter.get("/session", async (request, response, next) => {
  try {
    const admin = await findSession(request.cookies[SESSION_COOKIE]);
    if (!admin) return response.status(401).json({ error: "Not authenticated." });
    return response.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) { return next(error); }
});

adminAuthRouter.post("/logout", async (request, response, next) => {
  try {
    await deleteSession(request.cookies[SESSION_COOKIE]);
    response.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
    return response.json({ ok: true });
  } catch (error) { return next(error); }
});
