"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "../products/new/new-product.css";
import "./customers.css";

type Customer = { id:string; name:string; email:string; phone:string; city:string; orders:number; spent:number; customerSince:string; lastOrderAt:string };
const initials = (name:string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "C";

export default function CustomersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("All customers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers", { credentials:"include", cache:"no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not load customers."); setCustomers(result.customers ?? []); })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Could not load customers."))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => customers.filter(customer => {
    const matchesSearch = `${customer.name} ${customer.email} ${customer.phone} ${customer.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesSegment = segment === "All customers" || (segment === "Returning" ? customer.orders > 1 : customer.orders === 1);
    return matchesSearch && matchesSegment;
  }), [customers, query, segment]);
  const returning = customers.filter(customer => customer.orders > 1).length;
  const totalRevenue = customers.reduce((sum, customer) => sum + Number(customer.spent), 0);

  return <main className="np-admin customers-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="customers-content">
        <header className="customers-head"><div><p>People</p><h1>Customers</h1><span>View customers who have placed orders in your store.</span></div></header>
        <section className="customers-summary">
          <article><span>Total customers</span><strong>{customers.length}</strong><small>Unique customer emails</small></article>
          <article><span>Returning customers</span><strong>{returning}</strong><small>Placed more than one order</small></article>
          <article><span>Total customer spend</span><strong>Rs {totalRevenue.toLocaleString()}</strong><small>Across all orders</small></article>
        </section>
        <section className="customers-panel">
          <div className="customers-tabs"><button className={segment === "All customers" ? "active" : ""} onClick={() => setSegment("All customers")}>All <span>{customers.length}</span></button><button className={segment === "New" ? "active" : ""} onClick={() => setSegment("New")}>New <span>{customers.length - returning}</span></button><button className={segment === "Returning" ? "active" : ""} onClick={() => setSegment("Returning")}>Returning <span>{returning}</span></button></div>
          <div className="customers-tools"><label><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, phone, or city" /></label></div>
          {loading && <div className="customers-empty"><p>Loading customers...</p></div>}
          {error && <div className="customers-empty"><h2>Unable to load customers</h2><p>{error}</p></div>}
          {!loading && !error && shown.length > 0 && <div className="customers-table"><table><thead><tr><th>Customer</th><th>Contact</th><th>Location</th><th>Orders</th><th>Total spent</th><th>Last order</th><th>Customer since</th></tr></thead><tbody>{shown.map(customer => <tr key={customer.id}><td><div className="customer-name"><span>{initials(customer.name)}</span><div><strong>{customer.name}</strong><small>{customer.orders > 1 ? "Returning customer" : "New customer"}</small></div></div></td><td><strong>{customer.email}</strong><small>{customer.phone}</small></td><td>{customer.city}</td><td><b>{customer.orders}</b></td><td><b>Rs {Number(customer.spent).toLocaleString()}</b></td><td>{new Date(customer.lastOrderAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</td><td>{new Date(customer.customerSince).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</td></tr>)}</tbody></table></div>}
          {!loading && !error && shown.length === 0 && <div className="customers-empty"><Users size={32}/><h2>No customers found</h2><p>Try changing your search or customer filter.</p><button onClick={() => { setQuery(""); setSegment("All customers"); }}>Clear filters</button></div>}
          <footer className="customers-pagination">Showing {shown.length} of {customers.length} customers</footer>
        </section>
      </div>
    </section>
  </main>;
}
