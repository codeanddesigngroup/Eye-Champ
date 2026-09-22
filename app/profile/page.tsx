"use client";

import { ChevronDown, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "./profile.css";
import "./profile-orders.css";

type OrderItem = { id?: string; productId?: string; name?: string; image?: string; frameColor?: string; framePrice?: number; lens?: string; lensPrice?: number; tintStrength?: string; colorName?: string; quantity?: number };
type Order = { orderNumber: string; name: string; phone: string; address: string; city: string; postalCode: string; items: OrderItem[]; total: number; payment: string; fulfillment: string; paymentMethod: string; createdAt: string };
type Profile = { customer: { name: string; email: string; phone: string; address: string; city: string; postalCode: string }; orders: Order[] };

const orderStatuses = [
  { title: "Delivered", matches: (value: string) => value === "Fulfilled" },
  { title: "Canceled", matches: (value: string) => value === "Cancelled" || value === "Canceled" },
  { title: "On its way", matches: (value: string) => value === "Processing" || value === "Unfulfilled" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [marketing, setMarketing] = useState(false);
  const [openStatus, setOpenStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customer-auth/me", { credentials: "include", cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error(result.error || "Unable to load profile.");
        setProfile(result);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load profile."));
  }, [router]);

  useEffect(() => setMarketing(localStorage.getItem("eye-champ-marketing") === "true"), []);

  const addresses = useMemo(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    return profile.orders.filter(order => {
      const key = (order.address + "|" + order.city + "|" + order.postalCode).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [profile]);

  const groupedOrders = useMemo(() => orderStatuses.map(status => ({
    ...status,
    orders: profile?.orders.filter(order => status.matches(order.fulfillment)) ?? [],
  })), [profile]);

  async function logout(all = false) {
    await fetch("/api/customer-auth/" + (all ? "logout-all" : "logout"), { method: "POST", credentials: "include" });
    router.replace("/login");
    router.refresh();
  }

  function buyAgain(order: Order) {
    const existing = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]") as OrderItem[];
    const added = order.items.filter(item => item.productId).map((item, index) => ({ ...item, id: item.productId + "-" + Date.now() + "-" + index, quantity: Number(item.quantity) || 1 }));
    localStorage.setItem("eye-champ-cart", JSON.stringify([...existing, ...added]));
    window.dispatchEvent(new Event("eye-champ-cart-updated"));
    router.push("/cart");
  }

  if (error) return <main className="account-page"><section className="account-state"><h1>Unable to load account</h1><p>{error}</p><Link href="/login">Return to login</Link></section></main>;
  if (!profile) return <main className="account-page"><section className="account-state">Loading account...</section></main>;
  const initial = profile.customer.name.trim().charAt(0).toUpperCase() || "C";

  return <main className="account-page">
    <header className="account-header"><Link href="/" aria-label="Eye Champ home"><Image src="/images/logo.png" alt="Eye Champ" width={150} height={46} priority /></Link><span>{initial}</span></header>
    <div className="account-layout">
      <nav aria-label="Customer account"><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders</button><button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profile</button></nav>
      <section className="account-content">
        {tab === "orders" ? <div className="account-orders">
          {groupedOrders.map(group => {
            const isOpen = openStatus === group.title;
            const panelId = "orders-" + group.title.toLowerCase().replace(/\s+/g, "-");
            return <article className={"account-status-box " + (isOpen ? "is-open" : "")} key={group.title}>
              <h2><button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenStatus(isOpen ? null : group.title)}><span>{group.title}<small>{group.orders.length}</small></span><ChevronDown aria-hidden="true" /></button></h2>
              <div id={panelId} className="account-status-details" hidden={!isOpen}>
                {group.orders.length === 0 ? <p className="account-status-empty">No {group.title.toLowerCase()} orders.</p> : group.orders.map(order => <div className="account-order-entry" key={order.orderNumber}>
                  <div className="account-order-images">{order.items.slice(0, 4).map((item, index) => item.image ? <img src={item.image} alt={item.name || "Ordered product"} key={item.image + "-" + index} /> : <span key={index}>No image</span>)}</div>
                  <div className="account-order-details"><p>{order.orderNumber} · Rs {Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR {order.payment === "Pending" && <em>ⓘ Due</em>}</p></div>
                  <button onClick={() => buyAgain(order)} disabled={!order.items.some(item => item.productId)}>Buy again</button>
                </div>)}
              </div>
            </article>;
          })}
        </div> : <div className="account-profile">
          <section className="account-profile-heading"><h1>{profile.customer.name}</h1></section>
          <div className="account-email"><span>Email</span><strong>{profile.customer.email}</strong></div>
          <h2>Addresses</h2>
          <div className="account-addresses">{addresses.length ? addresses.map((address, index) => <article key={address.address + "-" + index}><span><MapPin size={17} /></span><div><strong>{address.name || profile.customer.name}{index === 0 && <em>Default</em>}</strong><p>{address.address}, {address.city} {address.postalCode}</p></div></article>) : <p>No delivery address found.</p>}</div>
          <h2>Marketing preferences</h2>
          <label className="account-marketing"><Mail size={16} /><span>Email</span><input type="checkbox" checked={marketing} onChange={event => { setMarketing(event.target.checked); localStorage.setItem("eye-champ-marketing", String(event.target.checked)); }} /></label>
          <div className="account-signout"><button onClick={() => logout()}>Sign out</button><button onClick={() => logout(true)}>Sign out of all devices</button></div>
        </div>}
      </section>
    </div>
    <footer className="account-footer"><span>Pakistan</span><Link href="/cancellation-return-and-refund-policy">Return &amp; Exchange Policy</Link><Link href="/shipping-and-delivery-policy">Shipping</Link><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms-and-conditions">Terms of service</Link><Link href="/contact-us">Contact information</Link></footer>
  </main>;
}
