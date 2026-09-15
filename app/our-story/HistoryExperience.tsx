"use client";

import Image from "next/image";
import wayfarerTalent from "@/public/images/our-story/wfr_talent_d.avif";
import archive1930 from "@/public/images/our-story/1930.jpg";
import archive1940 from "@/public/images/our-story/1940.webp";
import archive1950 from "@/public/images/our-story/1950.avif";
import archive1960 from "@/public/images/our-story/1960.webp";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, X } from "lucide-react";
import styles from "./page.module.css";

const scenes = [108, 300, 492, 685];
const productRows = [232, 424, 616, 808];
const icons = [
  { name: "Wayfarer", slug: "wayfarer", code: "wfr", year: "1952", color: "#bccc58", fallback: "/images/Square.webp", description: "A bold silhouette with a place in music, art and street style.", evolution: [["1952", "Original Wayfarer"], ["2003", "New Wayfarer"], ["2017", "Wayfarer Optics"], ["2022", "Mega Wayfarer"], ["2023", "Wayfarer Reverse"]] }
];
const decades = [
  ["1930", "Built for flight", "Glare-reducing lenses for pilots."],
  ["1940", "Beyond the cockpit", "Performance eyewear moves outdoors."],
  ["1950", "A new silhouette", "Function becomes everyday fashion."],
  ["1960", "Individual expression", "New shapes meet changing attitudes."]
];

// Coordinates use the screenshot's 174 x 2048 preview space.
// CSS windows retain the supplied campaign art without remote asset dependencies.
function ReferenceArt({ x = 0, y, width = 174, height, alt }: { x?: number; y: number; width?: number; height: number; alt: string }) {
  return <div className={styles.referenceArt} role="img" aria-label={alt} style={{ aspectRatio: `${width}/${height}`, backgroundSize: `${174 / width * 100}% auto`, backgroundPosition: `${width === 174 ? 0 : x / (174 - width) * 100}% ${y / (2048 - height) * 100}%` }} />;
}

const archiveImages = [archive1930, archive1940, archive1950, archive1960];

function DecadeArt({ index }: { index: number }) {
  const image = archiveImages[index];
  const alt = `Ray-Ban archive: ${decades[index][0]}s`;
  return image ? <Image src={image} alt={alt} className={styles.archiveImage} sizes="(max-width: 700px) 85vw, 450px" /> : <ReferenceArt x={index < 6 ? (index % 3) * 46 : (index - 6) * 44} y={index < 6 ? 1400 : 1893} width={43} height={index < 6 ? 43 : 22} alt={alt} />;
}

function Evolution({ icon }: { icon: typeof icons[number] }) {
  const track = useRef<HTMLDivElement>(null);
  function move(direction: number) {
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className={styles.evolution}>
    <div className={styles.evolutionHeading}><h3>The evolution</h3><div className={styles.arrows}><button onClick={() => move(-1)} aria-label={`Previous ${icon.name} designs`}><ArrowLeft /></button><button onClick={() => move(1)} aria-label={`Next ${icon.name} designs`}><ArrowRight /></button></div></div>
    <div ref={track} className={styles.cards} tabIndex={0} role="region" aria-label={`${icon.name} evolution, scroll to explore`}>
      {icon.evolution.map(([year, name], index) => <Link href={name.includes("Optics") ? "/eyeglasses/all" : "/sunglasses/all"} className={styles.card} key={name}><div className={styles.cardArt}>{index < 3 ? <ReferenceArt x={7 + index * 49} y={productRows[icons.indexOf(icon)]} width={39} height={17} alt={name} /> : <Image src={icon.fallback} alt={`${icon.name} frame silhouette`} fill sizes="300px" />}</div><span className={styles.cardYear}>{year}</span><h4>{name}</h4><span className={styles.cardShop}>Shop now</span></Link>)}
    </div>
  </div>;
}

export default function HistoryExperience() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heroVideo = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState("wayfarer");
  const [decade, setDecade] = useState(0);

  useEffect(() => {
    const video = heroVideo.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      if (paused || reducedMotion.matches) {
        video.pause();
      } else {
        void video.play().catch(() => { video.controls = true; });
      }
      if (reducedMotion.matches) video.controls = true;
    };
    updatePlayback();
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      reducedMotion.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, [paused]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add(styles.visible); reveal.unobserve(entry.target); }
    }), { threshold: 0.12 });
    element.querySelectorAll("[data-reveal]").forEach(item => { item.classList.add(styles.reveal); reveal.observe(item); });
    const chapters = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    }), { rootMargin: "-20% 0px -55% 0px" });
    element.querySelectorAll("[data-chapter]").forEach(item => chapters.observe(item));
    return () => { reveal.disconnect(); chapters.disconnect(); };
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--progress", `${Math.min(100, Math.max(0, -rect.top / (rect.height - innerHeight) * 100))}%`);
      element.querySelectorAll<HTMLElement>("[data-parallax]").forEach(item => {
        const offset = (item.getBoundingClientRect().top - innerHeight / 2) * 0.08;
        item.style.setProperty("--shift", `${Math.max(-50, Math.min(50, offset))}px`);
      });
      const timeline = element.querySelector<HTMLElement>("[data-timeline]");
      if (timeline) {
        const bounds = timeline.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -bounds.top / (bounds.height - innerHeight)));
        timeline.style.setProperty("--travel", `${progress * -76}%`);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [paused]);

  return <main ref={root} id="top" className={`${styles.history} ${paused ? styles.paused : ""}`}>
    <div className={styles.toolbar}>
      <button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
      <button onClick={() => dialog.current?.showModal()}>Shop icons</button>
    </div>

    <header className={styles.hero} id="icon-series">
      <video ref={heroVideo} className={styles.heroVideo} muted loop playsInline preload="metadata" aria-label="The Icon Series campaign video">
        <source src="/video/Hero_D.mp4" type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      <h1 className={styles.heroTitle}>The Icon Series</h1><a className={styles.explore} href="#wayfarer" aria-label="Explore the icons"><ArrowDown size={20} /></a>
    </header>

    <nav className={styles.chapterNav} aria-label="Icon chapters">{icons.map(icon => <a key={icon.slug} href={`#${icon.slug}`} aria-current={active === icon.slug ? "location" : undefined}>{icon.name}</a>)}<a href="#history" aria-current={active === "history" ? "location" : undefined}>The history</a></nav>
    {icons.map((icon, index) => <section id={icon.slug} data-chapter key={icon.slug} className={styles.chapter}>
      {icon.slug === "wayfarer" ? <>
        <div className={styles.wayfarerScene} data-reveal>
          <div className={styles.wayfarerScroll} tabIndex={0} role="region" aria-label="Wayfarer portrait — scroll to explore">
            <Image src={wayfarerTalent} alt="Wayfarer campaign portrait" className={styles.wayfarerPortrait} sizes="(max-width: 700px) 80vw, 56vw" />
          </div>
          <h2 className={styles.wayfarerTitle}>{icon.name}</h2>
        </div>
        <div className={styles.wayfarerCopy}><p>{icon.description}</p><div className={styles.shopLinks}><Link href="/sunglasses/all">Shop sunglasses</Link><Link href="/eyeglasses/all">Shop eyeglasses</Link></div></div>
      </> : <div className={styles.scene} data-reveal><h2 className={styles.srOnly}>{icon.name}</h2><ReferenceArt y={scenes[index]} height={108} alt={`${icon.name}: campaign portrait and signature eyewear`} /><div className={`${styles.sceneCopy} ${index % 2 ? styles.copyLeft : ""}`}><p>{icon.description}</p><div className={styles.shopLinks}><Link href="/sunglasses/all">Shop sunglasses</Link><Link href="/eyeglasses/all">Shop eyeglasses</Link></div></div></div>}
      <Evolution icon={icon} />
    </section>)}

    <div className={styles.historyHeadline}>YOU KNOW THE <span>NAME</span></div>
    <section id="history" data-chapter className={styles.timeline}>
      <div className={styles.scrollTimeline} data-timeline><div className={styles.stickyHistory}><h2>DO YOU KNOW THE STORY?</h2><p className={styles.historyIntro}>From the first aviators to a new generation of originals. Discover the people, designs and decades behind the icons.</p><div className={styles.archiveTrack}>{decades.map(([year, title, description], index) => <article key={year}><DecadeArt index={index} /><span>{year}s</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></div>
    </section>

  </main>;
}
