"use client";

import Categories from "@/components/Categories";
import Hero from "@/components/Hero";
import ImageSlider from "@/components/ImageSlider";
import Slider from "@/components/Slider";
import UnderSlider from "@/components/UnderSlider";
import Link from "next/link";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const shapes = [
  { name: "Square", url: "/square" },
  { name: "Rectangle", url: "/rectangle" },
  { name: "Round", url: "/round" },
  { name: "Cat eye", url: "/cateye" },
  { name: "Browline", url: "/browline" },
  { name: "Aviator", url: "/aviator" }
];

const shapeImages = ["/images/Square.webp", "/images/Rectangle.webp", "/images/Round.webp", "/images/cateye.png", "/images/Browline.webp", "/images/Aviator.webp"];
const trendBanners = ["/images/trend-banners/1.png", "/images/trend-banners/2.png", "/images/trend-banners/3.png"];
const mobileTrendBanners = ["/images/trend-banners/mobile/1.png", "/images/trend-banners/mobile/2.png", "/images/trend-banners/mobile/3.png"];

export default function Home() {
  const [trendIndex, setTrendIndex] = useState(1);
  const [mobileTrendIndex, setMobileTrendIndex] = useState(1);
  useEffect(() => { const timer = setInterval(() => { setTrendIndex(c => (c + 1) % trendBanners.length); setMobileTrendIndex(c => (c + 1) % mobileTrendBanners.length); }, 5000); return () => clearInterval(timer); }, []);

  return <main>
    <Categories />

    <div className="page shell" id="top">
      <Hero />
      <section className="gender-grid">
        <article className="gender-card" id="men">
          <div>
            <span>FOR</span>
            <h2>MEN</h2>
            <Link className="btn" href="/all-glasses/men">SHOP NOW</Link>
          </div>
          <span className="gender-badge"><Tag aria-hidden="true" />Frames</span>
        </article>
        <article className="gender-card" id="women">
          <div>
            <span>FOR</span>
            <h2>WOMEN</h2>
            <Link className="btn" href="/all-glasses/women">SHOP NOW</Link>
          </div>
          <span className="gender-badge"><Tag aria-hidden="true" />Frames</span>
        </article>
      </section>
    </div>

    <Slider />

    <div className="page shell">
      <section className="everyone">
        <div className="section-title">
          <h2>EYEWEAR FOR EVERYONE</h2>
          <p>Style & clarity made for you.</p>
        </div>

        <div className="benefits">
          <div>
            <img className="benefit-image" src="/images/benefits/free-shiping.png" alt="" />
            <img className="benefit-image-hover" src="/images/benefits/hover/free-shiping.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <img className="benefit-image" src="/images/benefits/prescription-accuracy.png" alt="" />
            <img className="benefit-image-hover" src="/images/benefits/hover/prescription-accuracy.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <img className="benefit-image" src="/images/benefits/secure-online-payments.png" alt="" />
            <img className="benefit-image-hover" src="/images/benefits/hover/secure-online-payments.png" alt="" aria-hidden="true" />
          </div>
          <div>
            <img className="benefit-image" src="/images/benefits/transparent-pricing.png" alt="" />
            <img className="benefit-image-hover" src="/images/benefits/hover/transparent-pricing.png" alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="deal card">
        <div className="deal-content">
          <h2>BUY ONE,<br />GET ONE 20% OFF</h2>
          <p>Use code <b>GET20</b></p>
          <Link className="btn" href="/all-glasses">SHOP NOW</Link>
        </div>
        <span className="deal-badge"><Tag aria-hidden="true" />Frames</span>
      </section>

      <section className="shape-shop">
        <div className="section-title left">
          <h2>SHOP BY FRAME SHAPE</h2>
          <p>Versatile shapes made for every mood and moment.</p>
        </div>
        <div className="shape-grid">
          {shapes.map((shape, i) => (
            <Link href={`/all-glasses${shape.url}`} key={shape.name}>
              <div>
                <img
                  src={shapeImages[i]}
                  alt={shape.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1.25vw",
                  }}
                />
              </div>
              <b>{shape.name}</b>
            </Link>
          ))}
        </div>

      </section>
    </div>

    <ImageSlider />

    <div className="page shell">
      <section className="trend card">
        <div key={`${trendBanners[trendIndex]}-${mobileTrendBanners[mobileTrendIndex]}`} className="trend-bg" style={{ "--trend-desktop-image": `url(${trendBanners[trendIndex]})`, "--trend-mobile-image": `url(${mobileTrendBanners[mobileTrendIndex]})` } as CSSProperties} /><div className="trend-content"><h2>THE TREND SHOP</h2><p>Curated styles, fresh colors, and must-see edits.</p><Link className="btn" href="/shop-all">SHOP NOW</Link></div><span className="trend-badge"><Tag aria-hidden="true" />Frames</span>
      </section>
    </div>
    
    <UnderSlider />
  </main>;
}
