"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart, Plus, Star, Video } from "lucide-react";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import Link from "next/link";
import "swiper/css";

const products = [
  { image: "/images/product/1.avif", price: "Rs 599.00", rating: "4.7", reviews: "221", shape: "Square", colors: ["tortoise", "black"] },
  { image: "/images/product/2.avif", price: "Rs 599.00", rating: "4.5", reviews: "2K+", shape: "Square", delivery: true, colors: ["blue", "clear", "brown", "more"] },
  { image: "/images/product/3.avif", price: "Rs 599.00", rating: "4.6", reviews: "224", shape: "Square", delivery: true, colors: ["black", "tortoise", "gray"] },
  { image: "/images/product/4.avif", price: "Rs 599.00", rating: "4.7", reviews: "168", shape: "Rectangle", colors: ["black", "green"] },
  { image: "/images/product/eyeglasses-front-view.avif", price: "Rs 599.00", rating: "4.5", reviews: "4K+", shape: "Rectangle", delivery: true, colors: ["silver", "multi", "pink", "more"] },
  { image: "/images/product/eyeglasses-front-view.avif", price: "Rs 599.00", rating: "4.5", reviews: "4K+", shape: "Rectangle", delivery: true, colors: ["silver", "multi", "pink", "more"] },
];

export default function Slider() {
  const router = useRouter();
  const [category, setCategory] = useState<"Eyeglasses" | "Sunglasses">("Eyeglasses");
  const [saved, setSaved] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<Record<number, number>>({});
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const swiper = useRef<SwiperInstance | null>(null);

  const toggleSaved = (index: number) => {
    setSaved((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
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
          {products.map((product, index) => (
            <SwiperSlide key={`${category}-${index}`}>
              <article
                className="seller-card"
                role="link"
                tabIndex={0}
                aria-label={`View ${product.shape} ${category.toLowerCase()} for ${product.price}`}
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest("button, a")) router.push("/product");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push("/product");
                }}
              >
                <div className="seller-visual">
                  <span className="seller-badge">Top rated</span>
                  <button className={`seller-heart ${saved.includes(index) ? "saved" : ""}`} type="button" aria-label={saved.includes(index) ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleSaved(index)}>
                    <Heart fill={saved.includes(index) ? "currentColor" : "none"} />
                  </button>
                  <Image src={product.image} alt={`${product.shape} ${category.toLowerCase()}`} width={520} height={280} sizes="(max-width: 600px) 82vw, (max-width: 1000px) 44vw, 20vw" unoptimized />
                  {/* <button className="try-on" type="button"><Video fill="currentColor" aria-hidden="true" />Try on</button> */}
                </div>
                <div className="seller-info">
                  <div className="seller-line">
                    <strong>{product.price}</strong>
                    {/* <span><Star fill="currentColor" aria-hidden="true" /> {product.rating} ({product.reviews})</span> */}
                    </div>
                  <p>{product.shape}</p>
                  {product.delivery && <b className="seller-delivery">Get it as early as Fri, Aug 21</b>}
                  <div className="seller-colors" aria-label="Available colors">
                    {product.colors.map((color, colorIndex) => color === "more" ? <button type="button" className="color-more" aria-label="See more colors" key={`${color}-${colorIndex}`}><Plus /></button> : <button type="button" aria-label={`Select ${color} color`} aria-pressed={(selectedColors[index] ?? 0) === colorIndex} onClick={() => setSelectedColors((current) => ({ ...current, [index]: colorIndex }))} className={`color-dot ${color} ${(selectedColors[index] ?? 0) === colorIndex ? "selected" : ""}`} key={`${color}-${colorIndex}`} />)}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="seller-nav seller-nav-next" type="button" aria-label="Next products" disabled={atEnd} onClick={() => swiper.current?.slideNext()}><ChevronRight /></button>
      </div>
    </section>
  );
}
