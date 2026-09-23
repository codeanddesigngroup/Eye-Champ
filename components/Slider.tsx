"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import Link from "next/link";
import { favoritesUpdatedEvent, getFavorites, toggleFavorite } from "@/lib/favorites";
import "swiper/css";

type Product = { id: string; title: string; slug: string; price: number; discountPercent: number; shape: string | null; media: { url: string; primary?: boolean }[]; variants: { name: string; values: string[]; mediaByValue?: Record<string, { url: string }[]> }[]; categorySlug: string | null; subcategorySlug: string | null };

export default function Slider() {
  const router = useRouter();
  const [category, setCategory] = useState<"Eyeglasses" | "Sunglasses">("Eyeglasses");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState("PKR");
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swiper = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setProducts([]);
    fetch(`/api/products?category=${category.toLowerCase()}&collection=${encodeURIComponent("Best Sellers")}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("Could not load products"); return response.json() as Promise<{ products?: Product[] }> })
      .then(result => setProducts(result.products ?? []))
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) });
    return () => controller.abort();
  }, [category]);

  useEffect(() => { fetch("/api/products/settings").then(response => response.json()).then((result: { currency?: string }) => { if (result.currency) setCurrency(result.currency) }).catch(() => undefined) }, []);
  useEffect(() => { swiper.current?.slideTo(0); setAtStart(true); }, [category]);

  useEffect(() => {
    const refreshSaved = () => setSaved(getFavorites().map(product => product.id));
    refreshSaved();
    window.addEventListener(favoritesUpdatedEvent, refreshSaved);
    window.addEventListener("storage", refreshSaved);
    return () => {
      window.removeEventListener(favoritesUpdatedEvent, refreshSaved);
      window.removeEventListener("storage", refreshSaved);
    };
  }, []);

  const toggleSaved = (product: Product) => {
    toggleFavorite({
      ...product,
      price: Number(product.price) * (1 - Number(product.discountPercent || 0) / 100),
    });
  };

  return (
    <section className="best-sellers featured-slider" aria-labelledby="best-sellers-title">
      <div className="best-sellers-head">
        <div>
          <h2 id="best-sellers-title">BEST SELLERS</h2>
          <div className="best-sellers-tabs" role="tablist" aria-label="Product category">
            {(["Eyeglasses", "Sunglasses"] as const).map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={category === tab} className={category === tab ? "active" : ""} onClick={() => setCategory(tab)}>{tab}</button>
            ))}
          </div>
        </div>
        <div className="best-sellers-actions">
          <Link href="/all-glasses/best-sellers" className="best-sellers-shop">Shop all</Link>
        </div>
      </div>

      <div className="best-sellers-slider-wrap">
        <button className="seller-nav seller-nav-prev" type="button" aria-label="Previous products" disabled={atStart} onClick={() => swiper.current?.slidePrev()}><ChevronLeft /></button>
        <Swiper
          className="best-sellers-rail"
          onSwiper={(instance) => { swiper.current = instance; setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
          onSlideChange={(instance) => { setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
          onResize={(instance) => { setAtStart(instance.isBeginning); setAtEnd(instance.isEnd); }}
          slidesPerView={5}
          spaceBetween={12}
          grabCursor
          breakpoints={{
            0: { slidesPerView: 1.15, spaceBetween: 12 },
            480: { slidesPerView: 1.15, spaceBetween: 12 },
            768: { slidesPerView: 2, spaceBetween: 14 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
            1280: { slidesPerView: 4, spaceBetween: 16 },
            1600: { slidesPerView: 5, spaceBetween: 16 },
          }}
        >
          {(loading || error || products.length === 0) && <SwiperSlide><p className="seller-empty">{loading ? "Loading products..." : error ? "Could not load products." : `No best-selling ${category.toLowerCase()} found.`}</p></SwiperSlide>}
          {products.map((product) => {
            const colors = product.variants?.find(variant => /frame.*color/i.test(variant.name));
            const selectedColor = selectedColors[product.id] ?? colors?.values[0];
            const image = (selectedColor && colors?.mediaByValue?.[selectedColor]?.[0]?.url) || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url;
            const href = `/${product.categorySlug ?? category.toLowerCase()}/${product.subcategorySlug ?? "all"}/${product.slug}`;
            const price = `${currency} ${(Number(product.price) * (1 - Number(product.discountPercent || 0) / 100)).toFixed(2)}`;
            return <SwiperSlide key={product.id}>
              <article
                className="seller-card"
                role="link"
                tabIndex={0}
                aria-label={`View ${product.title} for ${price}`}
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest("button, a")) router.push(href);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.target === event.currentTarget) router.push(href);
                }}
              >
                <div className="seller-visual">
                  <span className="seller-badge">Top rated</span>
                  <button className={`seller-heart ${saved.includes(product.id) ? "saved" : ""}`} type="button" aria-label={saved.includes(product.id) ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleSaved(product)}>
                    <Heart fill={saved.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                  {image ? <img src={image} alt={product.title} /> : <span>No image</span>}
                </div>
                <div className="seller-info">
                  <div className="seller-line">
                    <strong>{price}</strong>
                    </div>
                  <p>{product.title}</p>
                  <div className="seller-colors" aria-label="Available colors">
                    {colors?.values.slice(0, 3).map(color => <button type="button" aria-label={`Select ${color} color`} aria-pressed={selectedColor === color} onClick={() => setSelectedColors(current => ({ ...current, [product.id]: color }))} className={`color-dot ${color.toLowerCase().replace(/\s+/g, "-")} ${selectedColor === color ? "selected" : ""}`} key={color} />)}
                    {(colors?.values.length ?? 0) > 3 && <button type="button" className="color-more" aria-label={`See ${(colors?.values.length ?? 3) - 3} more colors`} onClick={() => router.push(href)}><Plus /></button>}
                  </div>
                </div>
              </article>
            </SwiperSlide>;
          })}
        </Swiper>
        <button className="seller-nav seller-nav-next" type="button" aria-label="Next products" disabled={atEnd} onClick={() => swiper.current?.slideNext()}><ChevronRight /></button>
      </div>
    </section>
  );
}
