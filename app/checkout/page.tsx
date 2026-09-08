"use client";

import { showAuthToast } from "@/components/AuthToast";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "./checkout.css";

type Item = { id: string; productId?: string; name: string; frameColor: string; framePrice: number; lensPrice: number; quantity: number; [key: string]: unknown };

export default function CheckoutPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => setItems(JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]")), []);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.framePrice) + Number(item.lensPrice ?? 0)) * item.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: data.get("name"), email: data.get("email"), phone: data.get("phone"), address: data.get("address"), city: data.get("city"), postalCode: data.get("postalCode") },
          items,
          paymentMethod: "Cash on Delivery",
        }),
      });
      const result = await response.json() as { order?: { orderNumber: string }; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error || "Checkout failed.");
      localStorage.removeItem("eye-champ-cart");
      window.dispatchEvent(new Event("eye-champ-cart-updated"));
      setItems([]);
      setOrderNumber(result.order.orderNumber);
      showAuthToast({ message: "Order placed successfully.", type: "success" });
    } catch (error) {
      showAuthToast({ message: error instanceof Error ? error.message : "Checkout failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) return <main className="checkout-page shell"><section className="checkout-success"><h1>Thank you for your order</h1><p>Your order number is <strong>{orderNumber}</strong>.</p><p>Payment method: <strong>Cash on Delivery</strong></p><Link href="/shop-all">Continue shopping</Link></section></main>;

  return <main className="checkout-page shell">
    <Link href="/cart">← Back to cart</Link>
    <h1>Checkout</h1>
    {!items.length ? <section className="checkout-success"><p>Your cart is empty.</p><Link href="/shop-all">Continue shopping</Link></section> :
      <form onSubmit={submit}>
        <section>
          <h2>Contact and shipping information</h2>
          <div className="checkout-fields">
            <label>Full name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Phone<input name="phone" required /></label>
            <label>City<input name="city" required /></label>
            <label className="wide">Address<textarea name="address" required /></label>
            <label>Postal code<input name="postalCode" required /></label>
          </div>
        </section>
        <aside>
          <h2>Order summary</h2>
          {items.map(item => <p key={item.id}><span>{item.name} × {item.quantity}</span><b>Rs {((item.framePrice + item.lensPrice) * item.quantity).toLocaleString()}</b></p>)}
          <div><span>Total</span><strong>Rs {subtotal.toLocaleString()}</strong></div>
          <div className="checkout-payment" style={{ display: "block" }}>
            <h2>Payment method</h2>
            <label><input type="radio" name="paymentMethod" value="Cash on Delivery" defaultChecked /><span><strong>Cash on Delivery</strong><small>Pay in cash when your order is delivered.</small></span></label>
          </div>
          <button disabled={submitting}>{submitting ? "Placing order..." : "Place order"}</button>
        </aside>
      </form>}
  </main>;
}
