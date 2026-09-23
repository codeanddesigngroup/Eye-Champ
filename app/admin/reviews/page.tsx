"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { showAuthToast } from "@/components/AuthToast";
import { Check, MessageSquareText, Search, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "../products/new/new-product.css";
import "./reviews.css";

type ReviewStatus = "Pending" | "Approved" | "Disapproved";
type Review = { id:string; productId:string; productTitle:string; productSlug:string; customerName:string; customerEmail:string; rating:number; title:string; body:string; fit:string|null; quality:string|null; photoUrl:string|null; status:ReviewStatus; createdAt:string };

export default function ReviewsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"All" | ReviewStatus>("Pending");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews", { credentials:"include", cache:"no-store" })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not load reviews."); setReviews(result.reviews ?? []); })
      .catch(reason => setError(reason instanceof Error ? reason.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => reviews.filter(review => {
    const matchesTab = tab === "All" || review.status === tab;
    const haystack = `${review.productTitle} ${review.customerName} ${review.customerEmail} ${review.title} ${review.body}`.toLowerCase();
    return matchesTab && haystack.includes(query.toLowerCase());
  }), [reviews, query, tab]);

  async function moderate(id:string, status:"Approved"|"Disapproved") {
    setUpdating(id);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method:"PATCH", credentials:"include", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update review.");
      setReviews(current => current.map(review => review.id === id ? { ...review, status } : review));
      showAuthToast({ type:"success", message: status === "Approved" ? "Review approved and visible on the website." : "Review disapproved and hidden from the website." });
    } catch (reason) {
      showAuthToast({ type:"error", message: reason instanceof Error ? reason.message : "Could not update review." });
    } finally { setUpdating(null); }
  }

  const tabs = ["All", "Pending", "Approved", "Disapproved"] as const;
  return <main className="np-admin reviews-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="reviews-content">
        <header><div><p>Content</p><h1>Product reviews</h1><span>Approve customer reviews before they appear on your storefront.</span></div></header>
        <section className="reviews-summary">
          {(["Pending", "Approved", "Disapproved"] as const).map(status => <article key={status}><span>{status}</span><strong>{reviews.filter(review => review.status === status).length}</strong></article>)}
        </section>
        <section className="reviews-panel">
          <div className="reviews-toolbar"><div className="reviews-tabs">{tabs.map(status => <button className={tab === status ? "active" : ""} onClick={() => setTab(status)} key={status}>{status}<span>{status === "All" ? reviews.length : reviews.filter(review => review.status === status).length}</span></button>)}</div><label><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search reviews" /></label></div>
          {loading && <div className="reviews-empty">Loading reviews...</div>}
          {error && <div className="reviews-empty"><b>Unable to load reviews</b><span>{error}</span></div>}
          {!loading && !error && shown.length === 0 && <div className="reviews-empty"><MessageSquareText/><b>No reviews found</b><span>Reviews matching this view will appear here.</span></div>}
          {!loading && !error && shown.length > 0 && <div className="review-cards">{shown.map(review => <article key={review.id}>
            <div className="review-card-head"><div><strong>{review.productTitle}</strong><span>{review.customerName} · {review.customerEmail}</span></div><em className={`status-${review.status.toLowerCase()}`}>{review.status}</em></div>
            <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{[1,2,3,4,5].map(star => <Star key={star} fill={star <= review.rating ? "currentColor" : "none"}/>)}</div>
            <h2>{review.title}</h2><p>{review.body}</p>
            {(review.fit || review.quality) && <small>{review.fit && `Fit: ${review.fit}`}{review.fit && review.quality && " · "}{review.quality && `Quality: ${review.quality}`}</small>}
            <footer><time>{new Date(review.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</time><div><button className="disapprove" disabled={updating === review.id || review.status === "Disapproved"} onClick={() => moderate(review.id,"Disapproved")}><X/> Disapprove</button><button className="approve" disabled={updating === review.id || review.status === "Approved"} onClick={() => moderate(review.id,"Approved")}><Check/> Approve</button></div></footer>
          </article>)}</div>}
        </section>
      </div>
    </section>
  </main>;
}
