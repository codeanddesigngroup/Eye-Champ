import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAdmin);

const pctChange = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
};

dashboardRouter.get("/", async (request, response, next) => {
  try {
    const requestedDays = Number(request.query.days);
    const days = [7, 15, 30].includes(requestedDays) ? requestedDays : 7;
    const [summary, revenueSeries, recentOrders, lowStock] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(subtotal) FILTER (WHERE created_at >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'), 0)::float AS revenue,
          COUNT(*)::int AS orders,
          COUNT(DISTINCT LOWER(email))::int AS customers,
          COALESCE(SUM(subtotal) FILTER (WHERE created_at >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'), 0)::float AS "revenueThisWeek",
          COALESCE(SUM(subtotal) FILTER (WHERE created_at >= CURRENT_DATE - ($1::int * 2 - 1) * INTERVAL '1 day' AND created_at < CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'), 0)::float AS "revenueLastWeek",
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS "ordersThisWeek",
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS "ordersLastWeek",
          COUNT(DISTINCT LOWER(email)) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS "customersThisWeek",
          COUNT(DISTINCT LOWER(email)) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days')::int AS "customersLastWeek",
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS "ordersToday",
          COALESCE(SUM(subtotal) FILTER (WHERE created_at >= CURRENT_DATE), 0)::float AS "revenueToday"
        FROM orders
      `, [days]),
      pool.query(`
        SELECT TO_CHAR(day, 'Mon DD') AS label, COALESCE(SUM(o.subtotal), 0)::float AS revenue
        FROM generate_series(CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day', CURRENT_DATE, INTERVAL '1 day') day
        LEFT JOIN orders o ON o.created_at >= day AND o.created_at < day + INTERVAL '1 day'
        GROUP BY day
        ORDER BY day
      `, [days]),
      pool.query(`
        SELECT id::text, order_number AS "orderNumber", customer_name AS customer, items,
          subtotal::float AS total, payment_status AS payment, fulfillment_status AS fulfillment,
          created_at AS "createdAt"
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT id::text, title AS name, sku, quantity AS stock, media
        FROM products
        WHERE status='Active' AND quantity <= 10
        ORDER BY quantity ASC, updated_at DESC
        LIMIT 5
      `),
    ]);

    const totals = summary.rows[0];
    const orders = recentOrders.rows.map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const first = items[0];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        product: items.length > 1 ? `${first?.name ?? "Multiple products"} +${items.length - 1}` : first?.name ?? "No items",
        total: order.total,
        payment: order.payment,
        fulfillment: order.fulfillment,
        createdAt: order.createdAt,
      };
    });
    const inventory = lowStock.rows.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || "No SKU",
      stock: product.stock,
      image: Array.isArray(product.media) ? product.media[0]?.url || "" : "",
    }));

    response.json({
      metrics: {
        revenue: totals.revenue,
        orders: totals.orders,
        customers: totals.customers,
        ordersToday: totals.ordersToday,
        revenueToday: totals.revenueToday,
        revenueChange: pctChange(totals.revenueThisWeek, totals.revenueLastWeek),
        orderChange: pctChange(totals.ordersThisWeek, totals.ordersLastWeek),
        customerChange: pctChange(totals.customersThisWeek, totals.customersLastWeek),
      },
      revenueSeries: revenueSeries.rows,
      recentOrders: orders,
      lowStock: inventory,
    });
  } catch (error) {
    next(error);
  }
});
