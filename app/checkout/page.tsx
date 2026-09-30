"use client";

import { showAuthToast } from "@/components/AuthToast";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "./checkout.css";

type Item = { id: string; productId?: string; name: string; frameColor: string; framePrice: number; lensPrice: number; quantity: number;[key: string]: unknown };

export default function CheckoutPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [sameBilling, setSameBilling] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentNote, setPaymentNote] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { const cart = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]"); setItems(Array.isArray(cart) ? cart : []); }
      catch { setItems([]); }
    });
    return () => { active = false; };
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.framePrice) + Number(item.lensPrice ?? 0)) * item.quantity, 0);

  const delivery = paymentMethod === "Cash on Delivery" ? 250 : 0;
  const total = subtotal + delivery;

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
          customer: { name: [data.get("firstName"), data.get("lastName")].map(value => String(value ?? "").trim()).filter(Boolean).join(" "), email: data.get("email"), phone: data.get("phone"), address: [data.get("address"), data.get("apartment")].map(value => String(value ?? "").trim()).filter(Boolean).join(", "), city: data.get("city"), postalCode: data.get("postalCode") },
          items,
          paymentMethod,
          billingAddress: sameBilling ? null : { name: [data.get("billingFirstName"), data.get("billingLastName")].map(value => String(value ?? "").trim()).filter(Boolean).join(" "), address: [data.get("billingAddress"), data.get("billingApartment")].map(value => String(value ?? "").trim()).filter(Boolean).join(", "), city: data.get("billingCity"), postalCode: data.get("billingPostalCode") },
        }),
      });
      const result = await response.json() as { order?: { orderNumber: string; emailSent?: boolean; paymentNote?: string }; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error || "Checkout failed.");
      localStorage.removeItem("eye-champ-cart");
      window.dispatchEvent(new Event("eye-champ-cart-updated"));
      setItems([]);
      setOrderNumber(result.order.orderNumber);
      setPaymentNote(result.order.paymentNote ?? "");
      setConfirmationEmail(result.order.emailSent ? String(data.get("email") ?? "") : "");
      showAuthToast({ message: result.order.emailSent ? "Order placed and confirmation email sent." : "Order placed successfully.", type: "success" });
    } catch (error) {
      showAuthToast({ message: error instanceof Error ? error.message : "Checkout failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) return <main className="checkout-page shell"><section className="checkout-success"><h1>Thank you for your order</h1><p>Your order number is <strong>{orderNumber}</strong>.</p>{confirmationEmail && <p>A confirmation email was sent to <strong>{confirmationEmail}</strong>.</p>}<p>Payment method: <strong>{paymentMethod}</strong></p><p>{paymentNote}</p><Link href="/shop-all">Continue shopping</Link></section></main>;

  return <main className="checkout-page shell">
    <Link href="/cart">← Back to cart</Link>
    <h1>Checkout</h1>
    {!items.length ? <section className="checkout-success"><p>Your cart is empty.</p><Link href="/shop-all">Continue shopping</Link></section> :
      <form onSubmit={submit}>
        <section>
          <h2>Contact and shipping information</h2>
          <div className="checkout-fields">
            <label>First name<input name="firstName" autoComplete="given-name" required /></label>
            <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Phone<input name="phone" required /></label>
            <label>City<input name="city" required /></label>
            <label>Address<textarea name="address" autoComplete="address-line1" required /></label>
            <label>Apartment - optional<input name="apartment" autoComplete="address-line2" /></label>
            <label>Postal code<input name="postalCode" required /></label>
          </div>
          <section className="checkout-payment-options" aria-label="Payment and delivery">
            <fieldset className="checkout-choices"><legend className="checkout-sr-only">Payment method</legend>
              <label className={paymentMethod === "Bank Transfer" ? "selected" : ""}><input type="radio" name="paymentMethod" value="Bank Transfer" checked={paymentMethod === "Bank Transfer"} onChange={event => setPaymentMethod(event.target.value)} /><strong>Online Payment | Free Delivery</strong><b>FREE</b></label>
              <label className={paymentMethod === "Cash on Delivery" ? "selected" : ""}><input type="radio" name="paymentMethod" value="Cash on Delivery" checked={paymentMethod === "Cash on Delivery"} onChange={event => setPaymentMethod(event.target.value)} /><strong>Cash on Delivery | Delivery Charges</strong><b>Rs 250.00</b></label>
            </fieldset>
            <h2>Payment</h2>
            <p className="checkout-prepaid">Enjoy Free Shipping on Prepaid orders</p>
            <div className="checkout-payment-details">
              <h3>{paymentMethod === "Cash on Delivery" ? "Cash on Delivery (COD)" : "Bank Transfer"}</h3>
              {paymentMethod === "Cash on Delivery" ? <div><p>Cash on Delivery (COD) Order Confirmation</p><p>Rs. 250 shipping fee is required online to confirm your COD order.</p><p>Send Rs. 250 to: +92 331 8099594</p><p>After payment, please send us a screenshot of the payment. Once we verify it, we’ll confirm and process your order.</p><p>Your remaining order amount will be payable on delivery.</p></div> : <div><p>Free delivery on prepaid orders.</p><p role="status">Pay by manual bank transfer. Your order remains payment pending until your transfer is confirmed.</p></div>}
            </div>
            <h3 className="checkout-billing-heading">Billing address</h3>
            <fieldset className="checkout-choices"><legend className="checkout-sr-only">Billing address</legend>
              <label className={sameBilling ? "selected" : ""}><input type="radio" name="billing" checked={sameBilling} onChange={() => setSameBilling(true)} /><strong>Same as shipping address</strong></label>
              <label className={!sameBilling ? "selected" : ""}><input type="radio" name="billing" checked={!sameBilling} onChange={() => setSameBilling(false)} /><strong>Use a different billing address</strong></label>
            </fieldset>
            {!sameBilling && <div className="checkout-fields"><label>First name<input name="billingFirstName" autoComplete="billing given-name" required /></label><label>Last name<input name="billingLastName" autoComplete="billing family-name" required /></label><label>City<input name="billingCity" required /></label><label>Address<textarea name="billingAddress" autoComplete="billing address-line1" required /></label><label>Apartment - optional<input name="billingApartment" autoComplete="billing address-line2" /></label><label>Postal code<input name="billingPostalCode" required /></label></div>}
            <button className="checkout-complete" disabled={submitting}>{submitting ? "Placing order..." : "Complete order"}</button>
          </section>
        </section>
        <aside>
          <h2>Order summary</h2>
          {items.map(item => <p key={item.id}><span>{item.name} × {item.quantity}</span><b>Rs {((item.framePrice + item.lensPrice) * item.quantity).toLocaleString()}</b></p>)}
          <div><span>Subtotal</span><strong>Rs {subtotal.toLocaleString()}</strong></div>
          <div><span>Delivery</span><strong>{delivery ? `Rs ${delivery.toFixed(2)}` : "FREE"}</strong></div>
          <div><span>Total</span><strong>Rs {total.toLocaleString()}</strong></div>
        </aside>
      </form>}
  </main>;
}
