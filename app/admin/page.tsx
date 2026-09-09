"use client";

import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useState } from "react";
import "./admin.css";

const styles: Record<string, string> = new Proxy({}, {
  get: (_target, className) => String(className),
});

const orders = [
  { id: "#EC-1048", customer: "Aisha Khan", initials: "AK", product: "Avery / Crystal Rose", total: "$128.00", status: "Paid", fulfillment: "Unfulfilled", date: "Aug 25, 10:42 AM" },
  { id: "#EC-1047", customer: "Marcus Chen", initials: "MC", product: "Riley / Matte Black", total: "$94.50", status: "Paid", fulfillment: "Processing", date: "Aug 25, 9:18 AM" },
  { id: "#EC-1046", customer: "Sofia Martinez", initials: "SM", product: "Luna / Tortoiseshell", total: "$176.00", status: "Pending", fulfillment: "Unfulfilled", date: "Aug 24, 7:36 PM" },
  { id: "#EC-1045", customer: "Noah Williams", initials: "NW", product: "Theo / Navy Blue", total: "$82.00", status: "Paid", fulfillment: "Fulfilled", date: "Aug 24, 5:11 PM" },
];

const inventory = [
  { name: "Aviator Classic", sku: "EC-AV-014", stock: 4, image: "/images/Aviator.webp" },
  { name: "Browline Bold", sku: "EC-BR-009", stock: 7, image: "/images/Browline.webp" },
  { name: "Prada PR 17", sku: "EC-PR-022", stock: 9, image: "/images/Prada.webp" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("Last 7 days");

  return (
    <main className={styles.adminViewport}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <section className={styles.workspace}>
        <AdminTopbar onMenuOpen={() => setSidebarOpen(true)} />

        <div className={styles.content}>
          <div className={styles.headingRow}>
            <div><p>Tuesday, August 25</p><h1>Hello, Admin</h1><span>Here’s what’s happening with your store today.</span></div>
            <div className={styles.headingActions}><button className={styles.secondaryButton}><Download size={17} /> Export report</button><Link className={styles.primaryButton} href="/admin/products/new"><Plus size={17} /> Add product</Link></div>
          </div>

          <section className={styles.metrics} aria-label="Store metrics">
            <article><div className={styles.metricTop}><span className={styles.greenIcon}><CircleDollarSign /></span><small className={styles.up}><ArrowUpRight /> 12.5%</small></div><p>Total revenue</p><h2>$24,780.40</h2><span>vs. $22,027 last week</span></article>
            <article><div className={styles.metricTop}><span className={styles.blueIcon}><ShoppingBag /></span><small className={styles.up}><ArrowUpRight /> 8.2%</small></div><p>Total orders</p><h2>384</h2><span>vs. 355 last week</span></article>
            <article><div className={styles.metricTop}><span className={styles.purpleIcon}><Users /></span><small className={styles.up}><ArrowUpRight /> 6.8%</small></div><p>New customers</p><h2>126</h2><span>vs. 118 last week</span></article>
            <article><div className={styles.metricTop}><span className={styles.orangeIcon}><Eye /></span><small className={styles.down}><ArrowDownRight /> 1.4%</small></div><p>Conversion rate</p><h2>3.48%</h2><span>vs. 3.53% last week</span></article>
          </section>

          <section className={styles.insightsGrid}>
            <article className={styles.chartCard}>
              <div className={styles.cardHeading}><div><h3>Revenue overview</h3><p>Your store’s revenue performance</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Revenue period"><option>Last 7 days</option><option>Last 30 days</option><option>This year</option></select></div>
              <div className={styles.chartLegend}><span><i /> Revenue</span><strong>$24,780.40 <small>+12.5%</small></strong></div>
              <div className={styles.chart} aria-label="Revenue chart from Monday through Sunday">
                <div className={styles.yAxis}><span>$6k</span><span>$4k</span><span>$2k</span><span>$0</span></div>
                <svg viewBox="0 0 700 210" preserveAspectRatio="none" role="img">
                  <defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0d6666" stopOpacity=".24" /><stop offset="1" stopColor="#0d6666" stopOpacity="0" /></linearGradient></defs>
                  <path className={styles.area} d="M0 164 C65 150 80 95 145 112 S230 147 290 98 S385 41 435 81 S520 130 575 72 S655 42 700 18 L700 210 L0 210Z" />
                  <path className={styles.line} d="M0 164 C65 150 80 95 145 112 S230 147 290 98 S385 41 435 81 S520 130 575 72 S655 42 700 18" />
                  <circle cx="700" cy="18" r="5" />
                </svg>
                <div className={styles.xAxis}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
              </div>
            </article>

            <article className={styles.inventoryCard}>
              <div className={styles.cardHeading}><div><h3>Inventory alerts</h3><p>Products running low on stock</p></div><button>View all</button></div>
              <div className={styles.inventoryList}>{inventory.map(item => <div className={styles.inventoryItem} key={item.sku}><span className={styles.productThumb}><Image src={item.image} alt="" width={58} height={42} /></span><div><strong>{item.name}</strong><small>{item.sku}</small></div><span className={styles.stock}>{item.stock} left</span></div>)}</div>
              <div className={styles.inventoryFoot}><Package size={17} /><span><strong>4 products</strong> need your attention</span><button>Manage inventory</button></div>
            </article>
          </section>

          <section className={styles.ordersCard}>
            <div className={styles.cardHeading}><div><h3>Recent orders</h3><p>Latest orders placed in your store</p></div><button>View all orders <span>→</span></button></div>
            <div className={styles.tableWrap}><table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th><th /></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div className={styles.customer}><span>{order.initials}</span><strong>{order.customer}</strong></div></td><td>{order.product}</td><td><strong>{order.total}</strong></td><td><span className={`${styles.status} ${order.status === "Paid" ? styles.paid : styles.pending}`}>{order.status}</span></td><td><span className={`${styles.status} ${order.fulfillment === "Fulfilled" ? styles.fulfilled : order.fulfillment === "Processing" ? styles.processing : styles.unfulfilled}`}>{order.fulfillment}</span></td><td>{order.date}</td><td><button aria-label={`More options for ${order.id}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>
          </section>
        </div>
      </section>
    </main>
  );
}
