"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { favoritesUpdatedEvent, getFavorites, toggleFavorite } from "@/lib/favorites";
import "swiper/css";

type Product = {
  id: string; title: string; slug: string; price: number; discountPercent: number;
  shape: string | null; categorySlug: string | null; subcategorySlug: string | null;
  media: { url: string; primary?: boolean }[];
  variants: { name: string; values: string[]; mediaByValue?: Record<string, { url: string }[]> }[];
};

const swatchColors: Record<string, string> = {
  black: "#111", white: "#fff", clear: "#e8f1f3", blue: "#2158a6", navy: "#172d55",
  brown: "#795036", gray: "#80878a", grey: "#80878a", silver: "#aeb7ba", red: "#ae4040",
  green: "#427055", pink: "#dc86a5", purple: "#744f91", orange: "#dc7b35", yellow: "#e5c642",
  gold: "#b79a53", tortoise: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)",
  tortoiseshell: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)",
};

export default function UnderSlider() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currency, setCurrency] = useState("PKR");
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swiper = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products?maxPrice=5000", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Could not load products");
        return response.json() as Promise<{ products?: Product[] }>;
      })
      .then(result => setProducts(result.products ?? []))
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch("/api/products/settings").then(response => response.json())
      .then((result: { currency?: string }) => { if (result.currency) setCurrency(result.currency); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const refresh = () => setSaved(getFavorites().map(item => item.id));
    refresh();
    window.addEventListener(favoritesUpdatedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(favoritesUpdatedEvent, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  return <section className="best-sellers featured-slider under-slider" aria-labelledby="under-5000-title">
    <div className="best-sellers-head">
      <div><h2 id="under-5000-title">UNDER 5000 PICKS</h2></div>
      <div className="best-sellers-actions"><Link href="/all-glasses/under-5000" className="best-sellers-shop">Shop all</Link></div>
    </div>
    <div className="best-sellers-slider-wrap">
      <button className="seller-nav seller-nav-prev" type="button" aria-label="Previous products" disabled={atStart} onClick={() => swiper.current?.slidePrev()}><ChevronLeft /></button>
      <Swiper className="best-sellers-rail"
        onSwiper={instance => { swiper.current = instance; setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
        onSlideChange={instance => { setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
        onResize={instance => { setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
        slidesPerView={5} spaceBetween={12} grabCursor
        breakpoints={{ 0: { slidesPerView: 1.15, spaceBetween: 12 }, 480: { slidesPerView: 1.15, spaceBetween: 12 }, 768: { slidesPerView: 2, spaceBetween: 14 }, 1024: { slidesPerView: 3, spaceBetween: 16 }, 1280: { slidesPerView: 4, spaceBetween: 16 }, 1600: { slidesPerView: 5, spaceBetween: 16 } }}>
        {(loading || error || products.length === 0) && <SwiperSlide><p className="seller-empty">{loading ? "Loading products..." : error ? "Could not load products." : "No products under Rs. 5,000 found."}</p></SwiperSlide>}
        {products.map(product => {
          const frameColors = product.variants?.find(variant => /frame.*color/i.test(variant.name));
          const selectedColor = selectedColors[product.id] ?? frameColors?.values[0];
          const image = (selectedColor && frameColors?.mediaByValue?.[selectedColor]?.[0]?.url) || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url;
          const price = Number(product.price) * (1 - Number(product.discountPercent || 0) / 100);
          const href = `/${product.categorySlug || "shop-all"}/${product.subcategorySlug || "all"}/${product.slug}`;
          return <SwiperSlide key={product.id}><article className="seller-card" role="link" tabIndex={0}
            aria-label={`View ${product.title} for ${currency} ${price.toFixed(2)}`}
            onClick={event => { if (!(event.target as HTMLElement).closest("button, a")) router.push(href); }}
            onKeyDown={event => { if (event.key === "Enter" && event.target === event.currentTarget) router.push(href); }}>
            <div className="seller-visual">
              <span className="seller-badge">Under 5000</span>
              <button className={`seller-heart ${saved.includes(product.id) ? "saved" : ""}`} type="button"
                aria-label={saved.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite({ ...product, price })}><Heart fill={saved.includes(product.id) ? "currentColor" : "none"} /></button>
              {image ? <img src={image} alt={product.title} /> : <span>No image</span>}
            </div>
            <div className="seller-info">
              <div className="seller-line"><strong>{currency} {price.toFixed(2)}</strong></div>
              <p>{product.title}</p>
              {product.shape && <p>{product.shape}</p>}
              {frameColors && <div className="seller-colors" aria-label="Available colors">
                {frameColors.values.slice(0, 4).map(color => <button type="button" key={color}
                  className={`color-dot ${selectedColor === color ? "selected" : ""}`}
                  style={{ background: swatchColors[color.toLowerCase()] ?? color }}
                  aria-label={`Select ${color} color`} aria-pressed={selectedColor === color}
                  onClick={() => setSelectedColors(current => ({ ...current, [product.id]: color }))} />)}
                {frameColors.values.length > 4 && <button type="button" className="color-more" aria-label="See more colors" onClick={() => router.push(href)}><Plus /></button>}
              </div>}
            </div>
          </article></SwiperSlide>;
        })}
      </Swiper>
      <button className="seller-nav seller-nav-next" type="button" aria-label="Next products" disabled={atEnd} onClick={() => swiper.current?.slideNext()}><ChevronRight /></button>
    </div>
  </section>;
}
