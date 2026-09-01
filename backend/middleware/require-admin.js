import { findSession, SESSION_COOKIE } from "../auth.js";

export async function requireAdmin(request, response, next) {
  try {
    const admin = await findSession(request.cookies[SESSION_COOKIE]);
    if (!admin) return response.status(401).json({ error: "Not authenticated." });
    request.admin = admin;
    return next();
  } catch (error) { return next(error); }
}
