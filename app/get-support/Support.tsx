"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { PackageSearch, PackageCheck, Store, CreditCard, HandHeart } from "lucide-react";
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
  { title: "MY ORDERS", description: "Check your order status or start a return.", label: "GO TO ORDERS", href: "/track-orders", icon: PackageSearch },
  { title: "TRACK RETURNS", description: "Get help with a return or refund.", label: "GO TO RETURNS", href: "/track-returns", icon: PackageCheck },
  { title: "STORE FINDER", description: "Locate our store and plan your visit.", label: "PLAN A VISIT IN STORE", href: "/store-locator", icon: Store },
  { title: "PAYMENT", description: "See which payment methods we accept.", label: "GO TO PAYMENTS", href: "/accepted-payment-methods", icon: CreditCard },
  { title: "PRODUCT HELP, CARE AND FITTING", description: "Get fitting tips and care advice for your glasses.", label: "GO TO PRODUCT CARE", href: "/parts-and-service", icon: HandHeart },
];

const groups = [
  {
    "title": "SHIPPING & RETURNS",
    "questions": [
      [
        "What are the delivery times for services all over Pakistan?",
        "Non-prescription sunglasses ship anywhere in Pakistan within 1\u20133 working days. Prescription eyeglasses and contact lenses are made to order and typically take 5\u20137 working days."
      ],
      [
        "Does cash on delivery (COD) apply?",
        "Yes \u2014 choose online payment or cash on delivery at checkout, anywhere in Pakistan."
      ],
      [
        "May I return or exchange my order?",
        "Non-prescription items can be returned or exchanged within our stated window if unused and in original packaging. Prescription eyeglasses and contact lenses are made to order and follow a separate returns and warranty policy \u2014 see our Returns & Warranty page."
      ],
      [
        "Is it possible to track the order?",
        "Yes \u2014 once your order ships, we'll update you by WhatsApp or email. You can also check status anytime on our Track Order page."
      ],
      [
        "If my order is shipped damaged or incorrect, what should I do?",
        "Send us photos within 48 hours of delivery and we'll arrange a replacement or refund."
      ]
    ]
  },
  {
    "title": "SHOPPING ONLINE",
    "questions": [
      [
        "Do I need a prescription to order eyeglasses or contact lenses?",
        "Yes, a current prescription (within 2 years) is required for prescription eyeglasses and contact lenses. Sunglasses and sports glasses don't need one."
      ],
      [
        "What is the meaning of my prescription?",
        "Your Rx includes sphere (SPH), cylinder (CYL), axis, and sometimes pupillary distance (PD). Not sure what yours says? WhatsApp us a photo of it and we'll go through it with you."
      ]
    ]
  },
  {
    "title": "PARTS & SERVICE",
    "questions": [
      [
        "Are your sunglasses and eyeglasses genuine?",
        "Yes \u2014 every frame comes from an authorised source and is checked for authenticity before it's listed. No replicas, no unauthorised imports."
      ],
      [
        "Are your sunglasses truly UV blocking?",
        "Yes \u2014 our sunglasses use genuine UV-protective lenses, with polarized options on select styles. Tested for real UV protection, not just tinted glass."
      ],
      [
        "What's covered under warranty?",
        "Frames and lenses are covered for manufacturing defects. Normal wear and tear or misuse isn't covered."
      ],
      [
        "Daily vs. monthly contact lenses \u2014 which should I pick?",
        "Daily lenses suit occasional wearers; monthly lenses suit everyday wearers. We carry both, including coloured options, made to your prescription."
      ]
    ]
  },
  {
    "title": "PRIVACY",
    "questions": []
  },
  {
    "title": "LEGAL",
    "questions": []
  }
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>(["SHIPPING & RETURNS"]);
  const terms = (search ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const results = pages.filter(page => terms.some(term => `${page.title} ${page.description} ${page.keywords}`.toLowerCase().includes(term)));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(query.trim());
  }

  return <main id="top" className={styles.page}>
    <header className={styles.intro}>
      <h1>HOW CAN WE HELP?</h1>
      <p>Need a hand? Tell us what you&apos;re looking for below and we&apos;ll point you to the right page.</p>
      <form role="search" aria-label="Search help pages" className={styles.search} onSubmit={submit}>
        <label className={styles.srOnly} htmlFor="support-query">Search help pages</label>
        <input id="support-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search help pages" maxLength={200} required />
        <button type="submit" className={styles.button}>SEARCH</button>
      </form>
      {search !== null && <section className={styles.results} aria-label="Search results"><p role="status">{!search ? "Enter a topic to search our help pages." : results.length ? `${results.length} help ${results.length === 1 ? "page" : "pages"} found for “${search}”.` : `No help pages found for “${search}”. Try shipping, returns, payment, size or warranty.`}</p>{results.map(page => <Link key={page.href} href={page.href}><strong>{page.title}</strong><span>{page.description}</span></Link>)}{results.length === 0 && <a href="#contact-support">Contact our team for help</a>}</section>}
    </header>

    <section aria-labelledby="more-help-heading">
      <div className={styles.sectionIntro}><h2 id="more-help-heading">NEED MORE HELP?</h2><p>Not sure where to start? Browse the categories below &mdash; everything&apos;s organised so you can find your answer fast.</p></div>
      <div className={styles.grid}>{cards.map(({ icon: Icon, ...card }) => <article className={styles.card} key={card.title}><Icon aria-hidden="true" strokeWidth={1.5} /><h3>{card.title}</h3><p>{card.description}</p><Link href={card.href}>{card.label}</Link></article>)}</div>
    </section>

    <section className={styles.helpPages} aria-labelledby="help-pages-heading">
      <div className={styles.sectionIntro}><h2 id="help-pages-heading">HELP PAGES</h2></div>
      <div className={styles.accordions}>{groups.map((group, index) => {
        const expanded = open.includes(group.title);
        return <div className={styles.accordion} key={group.title}><h3><button id={`help-heading-${index}`} type="button" disabled={!group.questions.length} aria-expanded={expanded} aria-controls={`help-panel-${index}`} onClick={() => setOpen(current => expanded ? current.filter(item => item !== group.title) : [...current, group.title])}>{group.title}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button></h3><div id={`help-panel-${index}`} role="region" aria-labelledby={`help-heading-${index}`} hidden={!expanded}>{group.questions.map(([question, answer]) => <div className={styles.answer} key={question}><h4>{question}</h4><p>{answer}</p></div>)}</div></div>;
      })}</div>
    </section>

    <section id="contact-support" className={styles.contact}><h2>NEED TO GET IN TOUCH?</h2><p>Need more assistance?<br />Send us a message and our dedicated team will be in touch.</p><a href="https://wa.me/923338888888" target="_blank" rel="noopener noreferrer" className={styles.button}>CONTACT US<span className={styles.srOnly}> (opens in a new tab)</span></a></section>
  </main>;
}
