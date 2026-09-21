"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import Slider from "react-slick";
import type { CustomArrowProps, Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    name: "cartier",
    alt: "Cartier eyewear campaign",
    desktop: "/images/brand-banners/cartier.webp",
    mobile: "/images/brand-banners/mobile/cartier.PNG",
  },
  {
    name: "emporio-armani",
    alt: "Emporio Armani eyewear campaign",
    desktop: "/images/brand-banners/emporio-armani.png",
    mobile: "/images/brand-banners/mobile/emporio-armani.png",
  },
  {
    name: "gucci",
    alt: "Gucci eyewear campaign",
    desktop: "/images/brand-banners/gucci.webp",
    mobile: "/images/brand-banners/mobile/gucci.PNG",
  },
  {
    name: "mont-blanc",
    alt: "Montblanc eyewear campaign",
    desktop: "/images/brand-banners/mont-blanc.webp",
    mobile: "/images/brand-banners/mobile/mont-blanc.png",
  },
  {
    name: "moscot",
    alt: "Moscot eyewear campaign",
    desktop: "/images/brand-banners/moscot.webp",
    mobile: "/images/brand-banners/mobile/moscot.PNG",
  },
  {
    name: "oakley",
    alt: "Oakley eyewear campaign",
    desktop: "/images/brand-banners/oakley.png",
    mobile: "/images/brand-banners/mobile/oakley.PNG",
  },
  {
    name: "prada",
    alt: "Prada eyewear campaign",
    desktop: "/images/brand-banners/prada.webp",
    mobile: "/images/brand-banners/mobile/prada.PNG",
  },
  {
    name: "ray-ban",
    alt: "Ray-Ban eyewear campaign",
    desktop: "/images/brand-banners/ray-ban.webp",
    mobile: "/images/brand-banners/mobile/ray-ban.PNG",
  },
  {
    name: "tom-ford",
    alt: "Tom Ford eyewear campaign",
    desktop: "/images/brand-banners/tom-ford.png",
    mobile: "/images/brand-banners/mobile/tom-ford.png",
  },
  {
    name: "versace",
    alt: "Versace eyewear campaign",
    desktop: "/images/brand-banners/versace.webp",
    mobile: "/images/brand-banners/mobile/versace.PNG",
  },
] as const;


function PrevArrow({ onClick }: CustomArrowProps) {
  return (
    <button type="button" className="slider-arrow prev-arrow" onClick={onClick} aria-label="Previous promotion">
      <ChevronLeft aria-hidden="true" />
    </button>
  );
}

function NextArrow({ onClick }: CustomArrowProps) {
  return (
    <button type="button" className="slider-arrow next-arrow" onClick={onClick} aria-label="Next promotion">
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

export default function ImageSlider() {
  const desktopSlider = useRef<Slider>(null);
  const mobileSlider = useRef<Slider>(null);
  const [playing, setPlaying] = useState(true);

  const togglePlayback = () => {
    const sliders = [desktopSlider.current, mobileSlider.current];
    sliders.forEach((slider) => {
      if (playing) slider?.slickPause();
      else slider?.slickPlay();
    });
    setPlaying((current) => !current);
  };

  const sharedSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    pauseOnHover: true,
    cssEase: "cubic-bezier(.22,.61,.36,1)",
  };

  const desktopSettings: Settings = {
    ...sharedSettings,
    slidesToShow: 2,
    centerPadding: "6.75%",
  };

  const mobileSettings: Settings = {
    ...sharedSettings,
    slidesToShow: 1,
    centerPadding: "12%",
  };

  return (
    <section className="brand-band" aria-label="Featured eyewear promotions">
      <div className="desktop-image-slider">
        <Slider ref={desktopSlider} {...desktopSettings} className="image-slider">
          {slides.map((slide) => (
            <article key={slide.name} className="image-slide">
              <Image
                src={slide.desktop}
                alt={slide.alt}
                fill
                unoptimized
                sizes="38vw"
              />
            </article>
          ))}
        </Slider>

      </div>
      <div className="mobile-image-slider">
        <Slider ref={mobileSlider} {...mobileSettings} className="image-slider">
          {slides.map((slide) => (
            <article key={slide.name} className="image-slide">
              <Image
                src={slide.mobile}
                alt={slide.alt}
                fill
                unoptimized
                sizes="76vw"
              />
            </article>
          ))}
        </Slider>

      </div>
      <button
        type="button"
        className="slider-pause"
        onClick={togglePlayback}
        aria-label={playing ? "Pause automatic slideshow" : "Play automatic slideshow"}
        aria-pressed={!playing}
      >
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
    </section>
  );
}
