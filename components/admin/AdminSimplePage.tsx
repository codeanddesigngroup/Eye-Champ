"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useState } from "react";
import "./AdminSimplePage.css";

type AdminSimplePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards: { label: string; value: string; note: string }[];
};

export default function AdminSimplePage({ eyebrow, title, description, cards }: AdminSimplePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="np-admin admin-simple">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="admin-simple-content">
        <header className="admin-simple-head"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div></header>
        <section className="admin-simple-summary">
          {cards.map(card => <article key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></article>)}
        </section>
        <section className="admin-simple-panel">
          <h2>{title}</h2>
          <p>This page is ready for managing {title.toLowerCase()} from the admin dashboard.</p>
        </section>
      </div>
    </section>
  </main>;
}
