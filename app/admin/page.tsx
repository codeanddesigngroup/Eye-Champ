"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Download, Eye, MoreHorizontal, Package, Plus, ShoppingBag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./admin.css";

const styles: Record<string, string> = new Proxy({}, { get: (_target, className) => String(className) });

type DashboardOrder = { id:string; orderNumber:string; customer:string; product:string; total:number; payment:string; fulfillment:string; createdAt:string };
type DashboardProduct = { id:string; name:string; sku:string; stock:number; image:string };
type DashboardData = {
  metrics:{ revenue:number; orders:number; customers:number; ordersToday:number; revenueToday:number; revenueChange:number; orderChange:number; customerChange:number };
  revenueSeries:{ label:string; revenue:number }[];
  recentOrders:DashboardOrder[];
  lowStock:DashboardProduct[];
};

const emptyDashboard:DashboardData = {
  metrics:{ revenue:0, orders:0, customers:0, ordersToday:0, revenueToday:0, revenueChange:0, orderChange:0, customerChange:0 },
  revenueSeries:[],
  recentOrders:[],
  lowStock:[],
};
const money = (value:number) => `Rs ${Number(value || 0).toLocaleString("en-PK", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
const initials = (name:string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "C";
const dateLabel = (value:string) => new Date(value).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
const changeText = (value:number) => `${Math.abs(Number(value || 0)).toFixed(1)}%`;

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("Last 7 days");
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials:"include", cache:"no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load dashboard.");
        setDashboard({ ...emptyDashboard, ...result });
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Could not load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const chart = useMemo(() => {
    const values = dashboard.revenueSeries.length ? dashboard.revenueSeries : Array.from({ length:7 }, (_, index) => ({ label:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], revenue:0 }));
    const max = Math.max(...values.map(item => Number(item.revenue)), 1);
    const points = values.map((item, index) => {
      const x = values.length === 1 ? 700 : (index / (values.length - 1)) * 700;
      const y = 180 - (Number(item.revenue) / max) * 150;
      return { ...item, x, y };
    });
    const line = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const area = `${line} L700 210 L0 210Z`;
    return { points, line, area, max };
  }, [dashboard.revenueSeries]);
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return <main className={styles.adminViewport}>
    <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <section className={styles.workspace}>
      <AdminTopbar onMenuOpen={() => setSidebarOpen(true)} />
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <div><p>{today}</p><h1>Hello, Admin</h1><span>{loading ? "Loading your store dashboard..." : "Here's what's happening with your store today."}</span></div>
          <div className={styles.headingActions}><button className={styles.secondaryButton}><Download size={17} /> Export report</button><Link className={styles.primaryButton} href="/admin/products/new"><Plus size={17} /> Add product</Link></div>
        </div>
        {error && <div className={styles.dashboardError}>{error}</div>}

        <section className={styles.metrics} aria-label="Store metrics">
          <Metric icon={<CircleDollarSign />} iconClass={styles.greenIcon} label="Total revenue" value={money(dashboard.metrics.revenue)} change={dashboard.metrics.revenueChange} note={`${money(dashboard.metrics.revenueToday)} today`} />
          <Metric icon={<ShoppingBag />} iconClass={styles.blueIcon} label="Total orders" value={dashboard.metrics.orders.toLocaleString()} change={dashboard.metrics.orderChange} note={`${dashboard.metrics.ordersToday} today`} />
          <Metric icon={<Users />} iconClass={styles.purpleIcon} label="Customers" value={dashboard.metrics.customers.toLocaleString()} change={dashboard.metrics.customerChange} note="Unique order emails" />
          <article><div className={styles.metricTop}><span className={styles.orangeIcon}><Eye /></span><small className={styles.up}><ArrowUpRight /> Live</small></div><p>Low stock items</p><h2>{dashboard.lowStock.length}</h2><span>Active products with 10 or fewer left</span></article>
        </section>

        <section className={styles.insightsGrid}>
          <article className={styles.chartCard}>
            <div className={styles.cardHeading}><div><h3>Revenue overview</h3><p>Your store's revenue performance</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Revenue period"><option>Last 7 days</option></select></div>
            <div className={styles.chartLegend}><span><i /> Revenue</span><strong>{money(dashboard.metrics.revenue)} <small>{changeText(dashboard.metrics.revenueChange)}</small></strong></div>
            <div className={styles.chart} aria-label="Revenue chart for the last 7 days">
              <div className={styles.yAxis}><span>{money(chart.max)}</span><span>{money(chart.max * .66)}</span><span>{money(chart.max * .33)}</span><span>Rs 0</span></div>
              <svg viewBox="0 0 700 210" preserveAspectRatio="none" role="img">
                <defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0d6666" stopOpacity=".24" /><stop offset="1" stopColor="#0d6666" stopOpacity="0" /></linearGradient></defs>
                <path className={styles.area} d={chart.area} />
                <path className={styles.line} d={chart.line} />
                {chart.points.length > 0 && <circle cx={chart.points.at(-1)?.x} cy={chart.points.at(-1)?.y} r="5" />}
              </svg>
              <div className={styles.xAxis}>{chart.points.map(day => <span key={day.label}>{day.label}</span>)}</div>
            </div>
          </article>

          <article className={styles.inventoryCard}>
            <div className={styles.cardHeading}><div><h3>Inventory alerts</h3><p>Products running low on stock</p></div><Link href="/admin/products">View all</Link></div>
            <div className={styles.inventoryList}>{dashboard.lowStock.length ? dashboard.lowStock.map(item => <div className={styles.inventoryItem} key={item.id}><span className={styles.productThumb}>{item.image ? <Image src={item.image} alt="" width={58} height={42} /> : <Package size={20} />}</span><div><strong>{item.name}</strong><small>{item.sku}</small></div><span className={styles.stock}>{item.stock} left</span></div>) : <p className={styles.emptyInline}>No low-stock products.</p>}</div>
            <div className={styles.inventoryFoot}><Package size={17} /><span><strong>{dashboard.lowStock.length} products</strong> need your attention</span><Link href="/admin/products">Manage inventory</Link></div>
          </article>
        </section>

        <section className={styles.ordersCard}>
          <div className={styles.cardHeading}><div><h3>Recent orders</h3><p>Latest orders placed in your store</p></div><Link href="/admin/orders">View all orders <span>→</span></Link></div>
          <div className={styles.tableWrap}><table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th><th /></tr></thead><tbody>{dashboard.recentOrders.map(order => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`}><strong>{order.orderNumber}</strong></Link></td><td><div className={styles.customer}><span>{initials(order.customer)}</span><strong>{order.customer}</strong></div></td><td>{order.product}</td><td><strong>{money(order.total)}</strong></td><td><span className={`${styles.status} ${statusClass(order.payment)}`}>{order.payment}</span></td><td><span className={`${styles.status} ${statusClass(order.fulfillment)}`}>{order.fulfillment}</span></td><td>{dateLabel(order.createdAt)}</td><td><Link href={`/admin/orders/${order.id}`} aria-label={`View ${order.orderNumber}`}><MoreHorizontal size={18} /></Link></td></tr>)}</tbody></table></div>
          {!dashboard.recentOrders.length && <p className={styles.emptyInline}>No orders found in the database.</p>}
        </section>
      </div>
    </section>
  </main>;
}

function Metric({ icon, iconClass, label, value, change, note }:{ icon:ReactNode; iconClass:string; label:string; value:string; change:number; note:string }) {
  const positive = Number(change || 0) >= 0;
  return <article><div className={styles.metricTop}><span className={iconClass}>{icon}</span><small className={positive ? styles.up : styles.down}>{positive ? <ArrowUpRight /> : <ArrowDownRight />} {changeText(change)}</small></div><p>{label}</p><h2>{value}</h2><span>{note}</span></article>;
}

function statusClass(value:string) {
  const key = value.toLowerCase();
  if (key === "paid" || key === "fulfilled") return styles.paid;
  if (key === "processing") return styles.processing;
  if (key === "pending") return styles.pending;
  return styles.unfulfilled;
}
