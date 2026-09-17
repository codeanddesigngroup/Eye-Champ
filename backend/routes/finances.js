import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const financesRouter = Router();
financesRouter.use(requireAdmin);

financesRouter.get("/", async (_request, response, next) => {
  try {
    const [summary, daily, payments] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(subtotal),0)::float AS "grossSales",
        COALESCE(SUM(subtotal) FILTER (WHERE payment_status='Paid'),0)::float AS paid,
        COALESCE(SUM(subtotal) FILTER (WHERE payment_status='Pending'),0)::float AS pending,
        COALESCE(SUM(subtotal) FILTER (WHERE payment_status='Refunded'),0)::float AS refunded,
        COUNT(*)::int AS orders FROM orders`),
      pool.query(`SELECT TO_CHAR(day, 'Mon DD') AS label, COALESCE(SUM(o.subtotal),0)::float AS total
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') day
        LEFT JOIN orders o ON o.created_at >= day AND o.created_at < day + INTERVAL '1 day'
        GROUP BY day ORDER BY day`),
      pool.query(`SELECT payment_method AS method, COUNT(*)::int AS orders, COALESCE(SUM(subtotal),0)::float AS total
        FROM orders GROUP BY payment_method ORDER BY total DESC`),
    ]);
    response.json({ summary: summary.rows[0], daily: daily.rows, payments: payments.rows });
  } catch (error) { next(error); }
});
