import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { pool } from "./db.js";

const scrypt = promisify(nodeScrypt);
export const SESSION_COOKIE = "eye_champ_admin_session";
const SHORT_SESSION_SECONDS = 60 * 60 * 8;
const LONG_SESSION_SECONDS = 60 * 60 * 24 * 30;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const tokenHash = (token) => createHash("sha256").update(token).digest("hex");

export async function createSession(adminId, remember) {
  const token = randomBytes(32).toString("base64url");
  const maxAge = remember ? LONG_SESSION_SECONDS : SHORT_SESSION_SECONDS;
  await pool.query("DELETE FROM admin_sessions WHERE expires_at <= NOW()");
  await pool.query(
    "INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'))",
    [tokenHash(token), adminId, maxAge],
  );
  return { token, maxAge };
}

export async function findSession(token) {
  if (!token) return null;
  const { rows } = await pool.query(`
    SELECT a.id, a.email, a.name, s.expires_at
    FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
    WHERE s.token_hash = $1 AND s.expires_at > NOW()
  `, [tokenHash(token)]);
  return rows[0] ?? null;
}

export async function deleteSession(token) {
  if (token) await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [tokenHash(token)]);
}
