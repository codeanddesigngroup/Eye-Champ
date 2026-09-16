"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { showAuthToast } from "@/components/AuthToast";
import { ArrowLeft, Box, CreditCard, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import "../../products/new/new-product.css";
import "./order-detail.css";

type OrderItem = { id?:string; productId?:string; name?:string; image?:string; frameColor?:string; framePrice?:number; lens?:string; lensPrice?:number; tintStrength?:string; colorName?:string; quantity?:number };
type Order = { id:string; orderNumber:string; customer:string; email:string; phone:string; address:string; city:string; postalCode:string; items:OrderItem[]; total:number; payment:string; fulfillment:string; paymentMethod:string; createdAt:string };

export default function OrderDetailPage({ params }:{ params:Promise<{id:string}> }) {
  const { id } = use(params);
  const [menuOpen, setMenuOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${encodeURIComponent(id)}`, { credentials:"include", cache:"no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok || !result.order) throw new Error(result.error || "Could not load order."); setOrder(result.order); })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Could not load order."))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (change:{ payment?:string; fulfillment?:string }) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(change) });
      const result = await response.json();
      if (!response.ok || !result.order) throw new Error(result.error || "Could not update order status.");
      setOrder(current => current ? { ...current, payment:result.order.payment, fulfillment:result.order.fulfillment } : current);
      showAuthToast({ message:"Order status updated.", type:"success" });
    } catch (reason) {
      showAuthToast({ message:reason instanceof Error ? reason.message : "Could not update order status.", type:"error" });
    } finally { setUpdating(false); }
  };

  return <main className="np-admin order-detail-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="order-detail-content">
        <Link className="order-detail-back" href="/admin/orders"><ArrowLeft size={16}/> Back to orders</Link>
        {loading && <section className="order-detail-state">Loading order...</section>}
        {error && <section className="order-detail-state"><h1>Unable to load order</h1><p>{error}</p></section>}
        {!loading && !error && order && <>
          <header className="order-detail-head"><div><p>Order</p><h1>{order.orderNumber}</h1><span>Placed {new Date(order.createdAt).toLocaleString("en-US", { month:"long", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" })}</span></div><div className="order-detail-statuses"><label>Payment<select className={`order-detail-select ${order.payment.toLowerCase()}`} value={order.payment} disabled={updating} onChange={event => updateStatus({ payment:event.target.value })}><option>Pending</option><option>Paid</option><option>Refunded</option></select></label><label>Fulfillment<select className={`order-detail-select ${order.fulfillment.toLowerCase()}`} value={order.fulfillment} disabled={updating} onChange={event => updateStatus({ fulfillment:event.target.value })}><option>Unfulfilled</option><option>Processing</option><option>Fulfilled</option><option>Cancelled</option></select></label></div></header>
          <div className="order-detail-layout"><div className="order-detail-main">
            <section className="order-detail-card"><header><Box size={18}/><div><h2>Order items</h2><p>{order.items.length} {order.items.length === 1 ? "item" : "items"}</p></div></header><div className="order-detail-items">{order.items.map((item, index) => { const quantity = Number(item.quantity) || 1, framePrice = Number(item.framePrice) || 0, lensPrice = Number(item.lensPrice) || 0; return <article key={`${item.productId || item.id || "item"}-${index}`}>{item.image ? <img src={item.image} alt=""/> : <span className="order-item-placeholder"><Box size={20}/></span>}<div><h3>{item.name || "Product"}</h3>{item.frameColor && <p>Frame color: {item.frameColor}</p>}{item.lens ? <p>{item.lens}{item.tintStrength ? ` · ${item.tintStrength} tint` : ""}{item.colorName ? ` · ${item.colorName}` : ""}</p> : <p>Frame only</p>}<small>Quantity: {quantity}</small></div><strong>Rs {((framePrice + lensPrice) * quantity).toLocaleString()}</strong></article>})}</div></section>
            <section className="order-detail-card order-payment-summary"><header><CreditCard size={18}/><div><h2>Payment summary</h2><p>{order.paymentMethod}</p></div></header><dl><div><dt>Subtotal</dt><dd>Rs {Number(order.total).toLocaleString()}</dd></div><div><dt>Shipping</dt><dd>Free</dd></div><div className="total"><dt>Total</dt><dd>Rs {Number(order.total).toLocaleString()}</dd></div></dl></section>
          </div><aside className="order-detail-aside">
            <section className="order-detail-card"><header><User size={18}/><div><h2>Customer</h2><p>Order contact</p></div></header><h3>{order.customer}</h3><a href={`mailto:${order.email}`}><Mail size={14}/>{order.email}</a><a href={`tel:${order.phone}`}><Phone size={14}/>{order.phone}</a></section>
            <section className="order-detail-card"><header><MapPin size={18}/><div><h2>Delivery address</h2><p>Shipping destination</p></div></header><address>{order.customer}<br/>{order.address}<br/>{order.city}, {order.postalCode}</address></section>
          </aside></div>
        </>}
      </div>
    </section>
  </main>;
}
