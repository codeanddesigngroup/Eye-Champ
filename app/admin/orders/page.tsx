"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { CalendarDays, ChevronDown, Download, Filter, MoreHorizontal, Search, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { showAuthToast } from "@/components/AuthToast";
import "../products/new/new-product.css";
import "./orders.css";

type Order = { id:string; orderNumber:string; customer:string; email:string; items:number; total:number; payment:string; fulfillment:string; paymentMethod:string; createdAt:string };
const initials = (name:string) => name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

export default function OrdersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("All payments");
  const [fulfillment, setFulfillment] = useState("All fulfillment");
  const [selected, setSelected] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load orders.");
        setOrders(result.orders ?? []);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => orders.filter(order =>
    (payment === "All payments" || order.payment === payment) &&
    (fulfillment === "All fulfillment" || order.fulfillment === fulfillment) &&
    `${order.orderNumber} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase())
  ), [orders, query, payment, fulfillment]);
  const counts = {
    unfulfilled: orders.filter(order => order.fulfillment === "Unfulfilled").length,
    processing: orders.filter(order => order.fulfillment === "Processing").length,
    fulfilled: orders.filter(order => order.fulfillment === "Fulfilled").length,
  };
  const toggle = (id:string) => setSelected(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  const updateOrder = async (id:string, change:Partial<Pick<Order, "payment" | "fulfillment">>, notify = true) => {
    setUpdating(current => [...current, id]);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(change) });
      const result = await response.json() as { order?:Pick<Order, "id" | "payment" | "fulfillment">; error?:string };
      if (!response.ok || !result.order) throw new Error(result.error || "Could not update order status.");
      setOrders(current => current.map(order => order.id === id ? { ...order, payment:result.order!.payment, fulfillment:result.order!.fulfillment } : order));
      if (notify) showAuthToast({ message:"Order status updated.", type:"success" });
      return true;
    } catch (reason) {
      if (notify) showAuthToast({ message:reason instanceof Error ? reason.message : "Could not update order status.", type:"error" });
      return false;
    } finally {
      setUpdating(current => current.filter(orderId => orderId !== id));
    }
  };
  const markSelectedFulfilled = async () => {
    const results = await Promise.all(selected.map(id => updateOrder(id, { fulfillment:"Fulfilled" }, false)));
    const updated = results.filter(Boolean).length;
    if (updated) showAuthToast({ message:`${updated} ${updated === 1 ? "order" : "orders"} marked fulfilled.`, type:"success" });
    if (updated !== selected.length) showAuthToast({ message:"Some orders could not be updated.", type:"error" });
    setSelected([]);
  };

  return <main className="np-admin orders-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="orders-content">
        <div className="orders-head"><div><p>Sales</p><h1>Orders</h1><span>Track, fulfill, and manage customer orders.</span></div><div><button><Download size={16} /> Export orders</button><button className="create-order"><ShoppingBag size={16} /> Create order</button></div></div>
        <section className="orders-summary">
          <article><span>Total orders</span><strong>{orders.length}</strong><small>All database orders</small></article>
          <article><span>Awaiting fulfillment</span><strong>{counts.unfulfilled}</strong><small><i className="orange" /> Ready to process</small></article>
          <article><span>Processing</span><strong>{counts.processing}</strong><small><i className="blue" /> Being prepared</small></article>
          <article><span>Fulfilled</span><strong>{counts.fulfilled}</strong><small>Completed orders</small></article>
        </section>
        <section className="orders-panel">
          <div className="orders-tabs"><div>
            <button className={fulfillment === "All fulfillment" ? "active" : ""} onClick={() => setFulfillment("All fulfillment")}>All <span>{orders.length}</span></button>
            <button className={fulfillment === "Unfulfilled" ? "active" : ""} onClick={() => setFulfillment("Unfulfilled")}>Unfulfilled <span>{counts.unfulfilled}</span></button>
            <button className={fulfillment === "Processing" ? "active" : ""} onClick={() => setFulfillment("Processing")}>Processing <span>{counts.processing}</span></button>
            <button className={fulfillment === "Fulfilled" ? "active" : ""} onClick={() => setFulfillment("Fulfilled")}>Fulfilled <span>{counts.fulfilled}</span></button>
          </div><button><CalendarDays size={15} /> All dates <ChevronDown size={14} /></button></div>
          <div className="orders-tools">
            <label><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order, customer, or email" /></label>
            <select value={payment} onChange={event => setPayment(event.target.value)}><option>All payments</option><option>Paid</option><option>Pending</option><option>Refunded</option></select>
            <select value={fulfillment} onChange={event => setFulfillment(event.target.value)}><option>All fulfillment</option><option>Unfulfilled</option><option>Processing</option><option>Fulfilled</option></select>
            <button><Filter size={15} /> More filters</button>
          </div>
          {selected.length > 0 && <div className="orders-bulk"><strong>{selected.length} orders selected</strong><button onClick={markSelectedFulfilled} disabled={selected.some(id => updating.includes(id))}>Mark fulfilled</button><button>Print packing slips</button><button>Archive</button><button onClick={() => setSelected([])}>Clear</button></div>}
          {loading && <div className="orders-empty"><p>Loading orders...</p></div>}
          {error && <div className="orders-empty"><h2>Unable to load orders</h2><p>{error}</p></div>}
          {!loading && !error && <div className="orders-table"><table><thead><tr><th><input type="checkbox" checked={shown.length > 0 && selected.length === shown.length} onChange={event => setSelected(event.target.checked ? shown.map(order => order.id) : [])} /></th><th>Order</th><th>Date</th><th>Customer</th><th>Payment</th><th>Fulfillment</th><th>Items</th><th>Payment method</th><th>Total</th><th /></tr></thead><tbody>
            {shown.map(order => { const created = new Date(order.createdAt), isUpdating = updating.includes(order.id); return <tr key={order.id}><td><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggle(order.id)} /></td><td><strong className="order-id">{order.orderNumber}</strong></td><td><div className="order-date"><span>{created.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span><small>{created.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" })}</small></div></td><td><div className="order-customer"><span>{initials(order.customer)}</span><div><strong>{order.customer}</strong><small>{order.email}</small></div></div></td><td><select className={`order-status-select ${order.payment.toLowerCase()}`} aria-label={`Payment status for ${order.orderNumber}`} value={order.payment} disabled={isUpdating} onChange={event => updateOrder(order.id, { payment:event.target.value })}><option>Pending</option><option>Paid</option><option>Refunded</option></select></td><td><select className={`order-status-select ${order.fulfillment.toLowerCase()}`} aria-label={`Fulfillment status for ${order.orderNumber}`} value={order.fulfillment} disabled={isUpdating} onChange={event => updateOrder(order.id, { fulfillment:event.target.value })}><option>Unfulfilled</option><option>Processing</option><option>Fulfilled</option><option>Cancelled</option></select></td><td>{order.items} {order.items === 1 ? "item" : "items"}</td><td>{order.paymentMethod}</td><td><strong>Rs {Number(order.total).toLocaleString()}</strong></td><td><button aria-label={`Actions for ${order.orderNumber}`}><MoreHorizontal size={18} /></button></td></tr> })}
          </tbody></table></div>}
          {!loading && !error && shown.length === 0 && <div className="orders-empty"><ShoppingBag size={32} /><h2>No orders found</h2><p>Try adjusting your search or filters.</p><button onClick={() => { setQuery(""); setPayment("All payments"); setFulfillment("All fulfillment"); }}>Clear filters</button></div>}
          <div className="orders-pagination"><span>Showing {shown.length ? 1 : 0}–{shown.length} of {orders.length} orders</span><div><button disabled>←</button><button className="active">1</button><button disabled>→</button></div></div>
        </section>
      </div>
    </section>
  </main>;
}

function Badge({ value }:{ value:string }) { return <span className={`order-badge ${value.toLowerCase()}`}><i />{value}</span>; }
