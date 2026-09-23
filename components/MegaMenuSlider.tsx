"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type Product = {
  id: string; title: string; slug: string; categorySlug: string | null; subcategorySlug: string | null;
  media: Array<{ url: string; primary?: boolean }>;
  variants: Array<{ name: string; values: string[]; mediaByValue?: Record<string, Array<{ url: string }>> }>;
};

type MegaMenuSliderProps = { fullWidth?: boolean; categorySlug?: string };

export default function MegaMenuSlider({ fullWidth = false, categorySlug }: MegaMenuSliderProps) {
  const swiper = useRef<SwiperInstance | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const totalPages = Math.max(1, Math.ceil(products.length / 6));

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ collection: "Best Sellers" });
    if (categorySlug) params.set("category", categorySlug);
    setLoading(true);
    setError(false);
    fetch(`/api/products?${params.toString()}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const result = await response.json() as { products?: Product[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load best sellers.");
        setProducts(result.products ?? []);
      })
      .catch(reason => { if (!controller.signal.aborted) setError(Boolean(reason)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [categorySlug]);

  useEffect(() => {
    setPage(1);
    setAtStart(true);
    requestAnimationFrame(() => swiper.current?.slideTo(0, 0));
  }, [products]);

  const updateState = (instance: SwiperInstance) => {
    setPage(Math.floor(instance.activeIndex / 6) + 1);
    setAtStart(instance.isBeginning);
    setAtEnd(instance.isEnd);
  };

  return <section className={`mega-products${fullWidth ? " mega-products-full" : ""}`} aria-label="Best sellers">
    <div className="mega-products-head">
      <h2>Best Sellers</h2>
      {products.length > 6 && <div className="mega-products-controls">
        <button type="button" aria-label="Previous best sellers" disabled={atStart} onClick={() => swiper.current?.slidePrev(300)}><ChevronLeft /></button>
        <span aria-live="polite">{page}/{totalPages}</span>
        <button type="button" aria-label="Next best sellers" disabled={atEnd} onClick={() => swiper.current?.slideNext(300)}><ChevronRight /></button>
      </div>}
    </div>
    {loading ? <p className="mega-products-status">Loading best sellers...</p> : error ? <p className="mega-products-status">Could not load best sellers.</p> : products.length === 0 ? <p className="mega-products-status">No best sellers available yet.</p> : <Swiper
      className="mega-products-rail" slidesPerView={6} slidesPerGroup={6} spaceBetween={28} speed={300} watchOverflow
      onSwiper={(instance) => { swiper.current = instance; updateState(instance); }} onSlideChange={updateState}
    >
      {products.map(product => {
        const frameColors = product.variants?.find(variant => /frame.*color/i.test(variant.name));
        const firstColor = frameColors?.values[0];
        const image = (firstColor && frameColors?.mediaByValue?.[firstColor]?.[0]?.url) || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url;
        const main = product.categorySlug || categorySlug || "shop-all";
        const sub = product.subcategorySlug || "all";
        return <SwiperSlide key={product.id}><Link className="mega-product" href={`/${main}/${sub}/${product.slug}`}>
          <span className="mega-product-image">{image ? <img src={image} alt={product.title} /> : <small>No image</small>}</span>
          <span>{product.title}</span>
        </Link></SwiperSlide>;
      })}
    </Swiper>}
  </section>;
}
