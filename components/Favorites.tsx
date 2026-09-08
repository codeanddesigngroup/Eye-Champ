"use client";

import { Heart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { favoritesUpdatedEvent, getFavorites, toggleFavorite, type FavoriteProduct } from "@/lib/favorites";
import "./Favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  useEffect(() => {
    const refresh = () => setFavorites(getFavorites());
    refresh();
    window.addEventListener(favoritesUpdatedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(favoritesUpdatedEvent, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  return <section className="home-favorites page shell" id="favorites">
    <div className="section-title left"><h2><Heart fill="currentColor" /> FAVORITES</h2><p>Your saved frames, all in one place.</p></div>
    {favorites.length === 0 ? <div className="favorites-empty"><Heart /><p>Click the heart on a product to save it here.</p><Link href="/shop-all">Shop all products</Link></div> :
      <div className="favorites-grid">{favorites.map(product => {
        const image = product.media?.find(item => item.primary)?.url || product.media?.[0]?.url || "/images/Browline.webp";
        const main = product.categorySlug || "shop-all";
        const sub = product.subcategorySlug || "all";
        return <article key={product.id}>
          <Link href={`/${main}/${sub}/${product.slug}`}><img src={image} alt={product.title} /><strong>{product.title}</strong><span>Rs {Number(product.price).toFixed(2)}</span><small>{product.shape || "Classic"}</small></Link>
          <button type="button" onClick={() => toggleFavorite(product)} aria-label={`Remove ${product.title} from favorites`}><X /></button>
        </article>;
      })}</div>}
  </section>;
}
