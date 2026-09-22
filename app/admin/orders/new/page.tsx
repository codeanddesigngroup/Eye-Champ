"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { showAuthToast } from "@/components/AuthToast";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import "../../products/new/new-product.css";
import "./new-order.css";

type Product = { id:string; title:string; sku:string|null; price:number; discountPercent?:number; quantity:number; status:string };
const initialForm = { name:"", email:"", phone:"", address:"", city:"", postalCode:"", productId:"", quantity:1, paymentMethod:"Cash on Delivery", payment:"Pending", fulfillment:"Unfulfilled" };

export default function NewOrderPage() {
  const router = useRouter();
  const [menuOpen,setMenuOpen] = useState(false);
  const [products,setProducts] = useState<Product[]>([]);
  const [form,setForm] = useState(initialForm);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/products", { credentials:"include", cache:"no-store" })
      .then(async response => {
        const result = await response.json() as { products?:Product[]; error?:string };
        if (!response.ok) throw new Error(result.error || "Could not load products.");
        setProducts((result.products ?? []).filter(product => product.status === "Active"));
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(() => products.find(product => product.id === form.productId), [products,form.productId]);
  const unitPrice = selectedProduct ? Number(selectedProduct.price) * (1 - Number(selectedProduct.discountPercent || 0) / 100) : 0;
  const total = unitPrice * Number(form.quantity || 0);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({
        customer:{ name:form.name, email:form.email, phone:form.phone, address:form.address, city:form.city, postalCode:form.postalCode },
        productId:form.productId, quantity:Number(form.quantity), paymentMethod:form.paymentMethod, payment:form.payment, fulfillment:form.fulfillment,
      }) });
      const result = await response.json() as { order?:{id:string;orderNumber:string}; error?:string };
      if (!response.ok || !result.order) throw new Error(result.error || "Could not create order.");
      showAuthToast({ message:"Order " + result.order.orderNumber + " created.", type:"success" });
      router.push("/admin/orders/" + result.order.id);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not create order.";
      setError(message);
      showAuthToast({ message, type:"error" });
    } finally { setSaving(false); }
  }

  return <main className="np-admin new-order-admin">
    <AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={()=>setMenuOpen(true)} />
      <div className="new-order-content">
        <Link className="new-order-back" href="/admin/orders"><ArrowLeft size={16}/> Orders</Link>
        <header><div><p>Sales</p><h1>Create order</h1><span>Add a customer order and reserve inventory.</span></div></header>
        <form onSubmit={submit}>
          <div className="new-order-main">
            <section className="new-order-card"><h2>Customer</h2><div className="new-order-grid">
              <label>Full name<input value={form.name} onChange={event=>setForm({...form,name:event.target.value})} required /></label>
              <label>Email<input type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} required /></label>
              <label>Phone<input value={form.phone} onChange={event=>setForm({...form,phone:event.target.value})} required /></label>
              <label>City<input value={form.city} onChange={event=>setForm({...form,city:event.target.value})} required /></label>
              <label className="wide">Address<input value={form.address} onChange={event=>setForm({...form,address:event.target.value})} required /></label>
              <label>Postal code<input value={form.postalCode} onChange={event=>setForm({...form,postalCode:event.target.value})} required /></label>
            </div></section>
            <section className="new-order-card"><h2>Product</h2>{loading?<p>Loading products...</p>:<div className="new-order-grid">
              <label className="wide">Product<select value={form.productId} onChange={event=>setForm({...form,productId:event.target.value})} required><option value="">Select a product</option>{products.map(product=><option value={product.id} key={product.id} disabled={product.quantity<=0}>{product.title} ({product.sku || "No SKU"}) — {product.quantity} available</option>)}</select></label>
              <label>Quantity<input type="number" min={1} max={selectedProduct?.quantity || 1} value={form.quantity} onChange={event=>setForm({...form,quantity:Number(event.target.value)})} required /></label>
            </div>}</section>
            <section className="new-order-card"><h2>Payment and fulfillment</h2><div className="new-order-grid">
              <label>Payment method<select value={form.paymentMethod} onChange={event=>setForm({...form,paymentMethod:event.target.value})}><option>Cash on Delivery</option><option>Bank Transfer</option><option>Card</option></select></label>
              <label>Payment status<select value={form.payment} onChange={event=>setForm({...form,payment:event.target.value})}><option>Pending</option><option>Paid</option><option>Refunded</option></select></label>
              <label>Fulfillment status<select value={form.fulfillment} onChange={event=>setForm({...form,fulfillment:event.target.value})}><option>Unfulfilled</option><option>Processing</option><option>Fulfilled</option><option>Cancelled</option></select></label>
            </div></section>
          </div>
          <aside className="new-order-summary"><ShoppingBag/><h2>Order summary</h2><div><span>Unit price</span><strong>Rs {unitPrice.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></div><div><span>Quantity</span><strong>{form.quantity || 0}</strong></div><div className="total"><span>Total</span><strong>Rs {total.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></div>{error&&<p role="alert">{error}</p>}<button type="submit" disabled={saving||loading||!form.productId}>{saving?"Creating...":"Create order"}</button></aside>
        </form>
      </div>
    </section>
  </main>;
}
