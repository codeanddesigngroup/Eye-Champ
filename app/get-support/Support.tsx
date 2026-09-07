"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { PackageSearch, PackageCheck, Store, CreditCard, HandHeart, Glasses } from "lucide-react";
import styles from "./page.module.css";

const pages = [
  { title: "Track returns", href: "/track-returns", description: "Look up your return using your return number and checkout email address.", keywords: "track tracking return refund status number email" },
  { title: "Track orders", href: "/track-orders", description: "Access your order using your order number and checkout email address.", keywords: "track tracking order status number email manage" },
  { title: "Shipping information", href: "/shipping-information", description: "Delivery times, shipping rates and tracking your delivery.", keywords: "shipping delivery track order tracking package courier" },
  { title: "Cancel or return an order", href: "/cancel-or-return-an-order", description: "Return instructions, refunds and help with missing or damaged items.", keywords: "orders cancellation cancel return refund exchange damaged missing" },
  { title: "Accepted payment methods", href: "/accepted-payment-methods", description: "Payment options and credit card authorization.", keywords: "payment pay card visa mastercard authorization" },
  { title: "Size guide", href: "/size-guide", description: "Find the right frame size, face coverage and bridge fit.", keywords: "size fit fitting sunglasses eyeglasses nosepads bridge width" },
  { title: "Parts & service", href: "/parts-and-service", description: "Warranty information and assistance with your eyewear.", keywords: "parts service repair care warranty broken accessories lens lenses" },
];

const cards = [
  { title: "MY ORDERS", description: "Track your order or create a return.", label: "GO TO ORDERS", href: "/track-orders", icon: PackageSearch },
  { title: "TRACK RETURNS", description: "Find help with your returns and refunds.", label: "GO TO RETURNS", href: "/track-returns", icon: PackageCheck },
  { title: "STORE FINDER", description: "Find a store and plan your visit.", label: "PLAN A VISIT IN STORE", href: "/store-locator", icon: Store },
  { title: "PAYMENT", description: "Discover all our accepted payment methods.", label: "GO TO PAYMENTS", href: "/accepted-payment-methods", icon: CreditCard },
  { title: "PRODUCT HELP CARE AND FITTING", description: "Find your fit and how to take care of your pair.", label: "GO TO PRODUCT CARE", href: "/parts-and-service", icon: HandHeart },
  { title: "ACCESSORIES", description: "Find help with care items, accessories and more.", label: "GO TO ACCESSORIES", href: "/parts-and-service", icon: Glasses },
];

const groups = [
  { title: "MOST ASKED QUESTIONS", links: [
    { title: "WHAT LENS SHOULD I BUY?", href: "/parts-and-service" },
    { title: "HOW DOES YOUR SHIPPING POLICY WORK?", href: "/shipping-information" },
    { title: "HOW DO I KNOW THE RIGHT SIZE FOR MY SUNGLASSES?", href: "/size-guide" },
  ] },
  { title: "SHIPPING & RETURNS", links: [{ title: "SHIPPING INFORMATION", href: "/shipping-information" }, { title: "CANCEL OR RETURN AN ORDER", href: "/cancel-or-return-an-order" }] },
  { title: "SHOPPING ONLINE", links: [{ title: "ACCEPTED PAYMENT METHODS", href: "/accepted-payment-methods" }, { title: "SIZE GUIDE", href: "/size-guide" }] },
  { title: "PARTS & SERVICE", links: [{ title: "WARRANTY AND SERVICE", href: "/parts-and-service" }, { title: "FRAME FITTING", href: "/size-guide" }] },
  { title: "PRIVACY", links: [{ title: "CONTACT US ABOUT YOUR PERSONAL DATA", href: "#contact-support" }] },
  { title: "LEGAL", links: [{ title: "WARRANTY AND LIABILITY", href: "/parts-and-service" }, { title: "RETURNS POLICY", href: "/cancel-or-return-an-order" }] },
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>(["MOST ASKED QUESTIONS"]);
  const terms = (search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const results = pages.filter(page => terms.some(term => `${page.title} ${page.description} ${page.keywords}`.toLowerCase().includes(term)));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(query.trim());
  }

  return <main id="top" className={styles.page}>
    <header className={styles.intro}>
      <h1>HOW CAN WE HELP?</h1>
      <p>Need a hand? No problem. Just let us know what you need in the search box below<br />and we&apos;ll direct you to the most relevant help page.</p>
      <form role="search" aria-label="Search help pages" className={styles.search} onSubmit={submit}>
        <label className={styles.srOnly} htmlFor="support-query">Search help pages</label>
        <input id="support-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Type your query here..." maxLength={200} required />
        <button type="submit" className={styles.button}>SEARCH</button>
      </form>
      {search !== null && <section className={styles.results} aria-label="Search results"><p role="status">{!search ? "Enter a topic to search our help pages." : results.length ? `${results.length} help ${results.length === 1 ? "page" : "pages"} found for “${search}”.` : `No help pages found for “${search}”. Try shipping, returns, payment, size or warranty.`}</p>{results.map(page => <Link key={page.href} href={page.href}><strong>{page.title}</strong><span>{page.description}</span></Link>)}{results.length === 0 && <a href="#contact-support">Contact our team for help</a>}</section>}
    </header>

    <section aria-labelledby="more-help-heading">
      <div className={styles.sectionIntro}><h2 id="more-help-heading">NEED MORE HELP?</h2><p>Not sure what to type? Then check out our help areas below. With all the information<br />categorized, finding the right answer is quick and easy.</p></div>
      <div className={styles.grid}>{cards.map(({ icon: Icon, ...card }) => <article className={styles.card} key={card.title}><Icon aria-hidden="true" strokeWidth={1.5} /><h3>{card.title}</h3><p>{card.description}</p><Link href={card.href}>{card.label}</Link></article>)}</div>
    </section>

    <section className={styles.helpPages} aria-labelledby="help-pages-heading">
      <div className={styles.sectionIntro}><h2 id="help-pages-heading">HELP PAGES</h2><p>Still not found what you&apos;re looking for? Check the support areas below and head<br />straight to the right page for you.</p></div>
      <div className={styles.accordions}>{groups.map((group, index) => {
        const expanded = open.includes(group.title);
        return <div className={styles.accordion} key={group.title}><h3><button id={`help-heading-${index}`} type="button" aria-expanded={expanded} aria-controls={`help-panel-${index}`} onClick={() => setOpen(current => expanded ? current.filter(item => item !== group.title) : [...current, group.title])}>{group.title}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button></h3><div id={`help-panel-${index}`} role="region" aria-labelledby={`help-heading-${index}`} hidden={!expanded}>{group.links.map(link => <Link key={link.title} href={link.href}>{link.title}</Link>)}</div></div>;
      })}</div>
    </section>

    <section id="contact-support" className={styles.contact}><h2>NEED TO GET IN TOUCH?</h2><p>Need more assistance?<br />Send us a message and our dedicated team will be in touch.</p><a href="https://wa.me/923338888888" target="_blank" rel="noopener noreferrer" className={styles.button}>CONTACT US<span className={styles.srOnly}> on WhatsApp (opens in a new tab)</span></a></section>
  </main>;
}
