import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import model from "@/public/images/our-story/wfr_talent_d.avif";
import styles from "./story.module.css";

export const metadata: Metadata = {
  title: "Our Story | Eye Champ",
  description: "Since 2022, Eye Champ has brought genuine, multi-brand eyewear to Pakistan, with authentic frames, expert fitting and nationwide delivery.",
};

const categories = [
  ["Eyeglasses", "Prescription eyeglasses in metal, acetate and titanium frames, fitted with precision lenses for everyday clarity."],
  ["Sunglasses", "Premium, multi-brand sunglasses with polarized, UV-protected lenses for everyday wear and travel."],
  ["Contact Lenses", "Daily and monthly contact lenses, including coloured options, fitted to your prescription and comfort."],
  ["Sports Eyewear", "Impact-resistant, wraparound sports sunglasses built for running, cycling and outdoor activity."],
];
const reasons = [
  ["Authentic, multi-brand stock", "Every frame is sourced from authorized distributors and checked before it reaches you ? no replicas, no guesswork."],
  ["UV-protected, polarized lenses", "Sunglasses and sports eyewear are lens-tested for real UV protection, not just tinted glass."],
  ["Accurate prescriptions", "Eyeglasses and contact lenses are made to your exact prescription, checked by our team before dispatch."],
  ["Nationwide delivery, COD available", "We ship across Pakistan with online payment or cash on delivery, whichever you prefer."],
  ["Easy returns and warranty", "A straightforward return, exchange and warranty policy on every order ? no fine print surprises."],
  ["Real support, not a chatbot script", "Message us directly on WhatsApp for help choosing frames or lenses, before or after you buy."],
];

export default function OurStoryPage() {
  return <main className={styles.page}>
    <header className={styles.hero}>
      <h1>See life like a champ</h1>
      <p>Since 2022, we&apos;ve brought genuine, multi-brand eyewear under one roof ? eyeglasses, sunglasses, contact lenses and sports eyewear, picked for people who want quality they can trust and a fit that actually suits them.</p>
      <Link className={styles.button} href="/shop-all">Explore the collection</Link>
    </header>
    <div className={styles.banner}><Image src={model} alt="Model wearing black sunglasses" sizes="100vw" className={styles.image} /></div>
    <p className={styles.summary}>Eye Champ is a multi-brand optical store in Pakistan offering premium sunglasses, prescription eyeglasses, contact lenses and sports eyewear, with authentic frames, UV-protected lenses and nationwide delivery.</p>
    <section className={styles.section}>
      <h2>How it started</h2>
      <div className={styles.copy}>
        <p>It started with a simple frustration: finding genuine, multi-brand eyewear in Pakistan usually meant choosing between overpriced boutiques or online sellers with questionable stock. In 2022, we opened our doors to change that.</p>
        <p>We built Eye Champ around one idea ? premium eyewear shouldn&apos;t mean compromise. Whether it&apos;s prescription glasses for daily wear, polarized sunglasses for the outdoors, or contact lenses for everyday comfort, every product we carry is sourced from authorized distributors, checked for authenticity, and backed by real after-sales support.</p>
        <p>What began as a small optical counter has grown into a go-to destination for multi-brand eyewear in Pakistan ? for customers who want international quality without the guesswork of buying eyewear online.</p>
      </div>
    </section>
    <section className={styles.section}>
      <h2>Where we&apos;ve been</h2>
      <div className={styles.timeline}>
        <article><h3>2022 ? Our first optical counter</h3><p>Opened with a small, carefully curated selection of genuine multi-brand frames ? no unauthorized stock, no guesswork.</p></article>
        <article><h3>2026 ? Today ? A full online optical store</h3><p>Now shipping premium eyewear nationwide across Pakistan, with the same standards we started with in 2022.</p></article>
      </div>
    </section>
    <section className={styles.section}>
      <h2>What we carry</h2><p>Every category, one standard: authentic, quality-checked, and fitted right.</p>
      <div className={styles.grid}>{categories.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className={styles.section}>
      <h2>Why people buy from us</h2><p>The details that matter more than the frame.</p>
      <div className={styles.grid}>{reasons.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className={styles.section}>
      <h2>Common questions</h2>
      <details className={styles.question} open><summary>How do I know which lenses are right for me?</summary><p>Our team can guide you through lens options ? anti-glare, polarized, blue-light or prescription ? over WhatsApp before you order.</p></details>
      <details className={styles.question} open><summary>What if my order doesn&apos;t fit or arrives faulty?</summary><p>We offer a clear return, exchange and warranty policy ? reach out within the stated window and we&apos;ll sort it out.</p></details>
    </section>
    <section className={styles.cta}><h2>Ready to find your next pair?</h2><Link className={styles.button} href="/shop-all">Shop the collection</Link></section>
  </main>;
}
