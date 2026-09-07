"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, X } from "lucide-react";
import styles from "./page.module.css";

const scenes = [108, 300, 492, 685];
const productRows = [232, 424, 616, 808];
const icons = [
  { name: "Wayfarer", slug: "wayfarer", code: "wfr", year: "1952", color: "#bccc58", fallback: "/images/Square.webp", description: "A bold silhouette with a place in music, art and street style.", evolution: [["1952", "Original Wayfarer"], ["2003", "New Wayfarer"], ["2017", "Wayfarer Optics"], ["2022", "Mega Wayfarer"], ["2023", "Wayfarer Reverse"]] },
  { name: "Aviator", slug: "aviator", code: "avt", year: "1937", color: "#abc7df", fallback: "/images/Aviator.webp", description: "Born for pilots. A lightweight design that keeps looking ahead.", evolution: [["1937", "Aviator Classic"], ["1939", "Outdoorsman"], ["2016", "Aviator Optics"], ["2022", "New Aviator"], ["2023", "Aviator Reverse"]] },
  { name: "Round", slug: "round", code: "rnd", year: "1989", color: "#e7a578", fallback: "/images/Round.webp", description: "Circular lenses, creative spirits and an unmistakably independent point of view.", evolution: [["1989", "Round Metal"], ["2014", "Round Metal Optics"], ["2016", "Round Double Bridge"], ["2022", "New Round"], ["2023", "RB3809"]] },
  { name: "Clubmaster", slug: "clubmaster", code: "clb", year: "1986", color: "#baa9cc", fallback: "/images/Browline.webp", description: "A distinctive browline that brings vintage character into the present.", evolution: [["1986", "Clubmaster Classic"], ["2009", "Clubmaster Optics"], ["2017", "Clubmaster Metal"], ["2022", "New Clubmaster"], ["2023", "Mega Clubmaster"]] },
];
const decades = [
  ["1930", "Built for flight", "Glare-reducing lenses for pilots."],
  ["1940", "Beyond the cockpit", "Performance eyewear moves outdoors."],
  ["1950", "A new silhouette", "Function becomes everyday fashion."],
  ["1960", "Individual expression", "New shapes meet changing attitudes."],
  ["1970", "Made to move", "Lens innovation meets sporting style."],
  ["1980", "On the big screen", "Cinema puts the icons in focus."],
  ["1990", "Culture in motion", "Music and fashion find a shared signature."],
  ["2000", "New perspectives", "Optical and Junior collections arrive."],
  ["2010", "Make it personal", "Customization opens new possibilities."],
  ["2020", "Your next chapter", "A legacy for a new generation."],
];

// Coordinates use the screenshot's 174 x 2048 preview space.
// CSS windows retain the supplied campaign art without remote asset dependencies.
function ReferenceArt({ x = 0, y, width = 174, height, alt }: { x?: number; y: number; width?: number; height: number; alt: string }) {
  return <div className={styles.referenceArt} role="img" aria-label={alt} style={{ aspectRatio: `${width}/${height}`, backgroundSize: `${174 / width * 100}% auto`, backgroundPosition: `${width === 174 ? 0 : x / (174 - width) * 100}% ${y / (2048 - height) * 100}%` }} />;
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
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState("wayfarer");
  const [decade, setDecade] = useState(0);

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
    <div className={styles.toolbar}><button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Play motion" : "Pause motion"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button><button onClick={() => dialog.current?.showModal()}>Shop icons</button></div>
    <header className={styles.hero} id="icon-series">
      <ReferenceArt y={16} height={80} alt="The Icon Series: black and white campaign portrait" />
      <h1 className={styles.srOnly}>Our Icons History — The Icon Series</h1><a className={styles.explore} href="#wayfarer" aria-label="Explore the icons"><ArrowDown size={20} /></a>
    </header>
    <nav className={styles.chapterNav} aria-label="Icon chapters">{icons.map(icon => <a key={icon.slug} href={`#${icon.slug}`} aria-current={active === icon.slug ? "location" : undefined}>{icon.name}</a>)}<a href="#history" aria-current={active === "history" ? "location" : undefined}>The history</a></nav>
    {icons.map((icon, index) => <section id={icon.slug} data-chapter key={icon.slug} className={styles.chapter}>
      <div className={styles.scene} data-reveal><h2 className={styles.srOnly}>{icon.name}</h2><ReferenceArt y={scenes[index]} height={108} alt={`${icon.name}: campaign portrait and signature eyewear`} /><div className={`${styles.sceneCopy} ${index % 2 ? styles.copyLeft : ""}`}><p>{icon.description}</p><div className={styles.shopLinks}><Link href="/sunglasses/all">Shop sunglasses</Link><Link href="/eyeglasses/all">Shop eyeglasses</Link></div></div></div>
      <Evolution icon={icon} />
    </section>)}
    <div className={styles.historyHeadline}>YOU KNOW THE <span>NAME</span></div>
    <section id="history" data-chapter className={styles.timeline}>
      <div className={styles.scrollTimeline} data-timeline><div className={styles.stickyHistory}><h2>DO YOU KNOW THE STORY?</h2><p className={styles.historyIntro}>From the first aviators to a new generation of originals. Discover the people, designs and decades behind the icons.</p><div className={styles.archiveTrack}>{decades.map(([year, title, description], index) => <article key={year}><ReferenceArt x={index < 6 ? (index % 3) * 46 : (index - 6) * 44} y={index < 6 ? 1400 : 1893} width={43} height={index < 6 ? 43 : 22} alt={`${year}s campaign archive`} /><span>{year}s</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></div>
      <div className={styles.decadeNav} role="group" aria-label="Choose a decade">{decades.map(([year], i) => <button key={year} onClick={() => setDecade(i)} aria-pressed={decade === i}>{year}s</button>)}</div>
      <div className={styles.decadePanel} key={decade}>
        <div className={styles.decadeImage}><ReferenceArt x={decade < 6 ? (decade % 3) * 46 : (decade - 6) * 44} y={decade < 6 ? 1400 : 1893} width={43} height={decade < 6 ? 43 : 22} alt={`Ray-Ban archive: ${decades[decade][0]}s`} /></div>
        <div className={styles.decadeCopy} aria-live="polite" aria-atomic="true"><span>{decades[decade][0]}s</span><h3>{decades[decade][1]}</h3><p>{decades[decade][2]}</p><div className={styles.arrows}><button disabled={decade === 0} onClick={() => setDecade(decade - 1)} aria-label="Previous decade"><ArrowLeft /></button><button disabled={decade === decades.length - 1} onClick={() => setDecade(decade + 1)} aria-label="Next decade"><ArrowRight /></button></div></div>
      </div>
      <a className={styles.backTop} href="#top">Back to top <ArrowUp size={20} /></a>
    </section>
    <dialog ref={dialog} className={styles.shopDialog} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.dialogHeading}><h2>SHOP THE ICONS</h2><button onClick={() => dialog.current?.close()} aria-label="Close shop icons"><X /></button></div>
      <div className={styles.dialogGrid}>{icons.map(icon => <div key={icon.slug}><div className={styles.dialogImage}><Image src={icon.fallback} alt={icon.name} fill sizes="250px" /></div><h3>{icon.name}</h3><p>Prescription available</p><Link href="/sunglasses/all">Shop sunglasses</Link><Link href="/eyeglasses/all">Shop eyeglasses</Link></div>)}</div>
    </dialog>
  </main>;
}
