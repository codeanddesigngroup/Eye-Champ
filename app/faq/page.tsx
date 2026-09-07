import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FAQs | Eye Champ",
  description: "Find answers about eyewear, frame sizing, shipping, returns, payments and customer service.",
};

const categories = [
  { title: "PRODUCT RANGE", questions: [
    { question: "How do I find the right size for my glasses?", answer: "Use our size guide to compare lens width, bridge width and face coverage, and learn how to measure your fit.", href: "/size-guide", label: "View the size guide" },
    { question: "Where can I browse sunglasses and eyeglasses?", answer: "Explore our collection to find frames for your style. Product pages provide the details available for each pair.", href: "/shop-all", label: "Shop the collection" },
    { question: "Where can I get help with parts and repairs?", answer: "Our parts and service page explains warranty coverage and how to get assistance with your eyewear.", href: "/parts-and-service", label: "Parts & service" },
  ] },
  { title: "SHIPPING & RETURNS", questions: [
    { question: "How does your shipping policy work?", answer: "Review shipping information for delivery options and rates. Check checkout for the delivery timing and cost for your order.", href: "/shipping-information", label: "Shipping information" },
    { question: "How do I cancel or return an order?", answer: "Visit our returns page for eligibility, packing instructions and information about refunds.", href: "/cancel-or-return-an-order", label: "Cancel or return an order" },
    { question: "How can I get help with tracking?", answer: "Contact our support team for assistance with order or return status. Online tracking is not available yet.", href: "/get-support#contact-support", label: "Contact customer service" },
  ] },
  { title: "BUY ONLINE & CUSTOMER SERVICE", questions: [
    { question: "Which payment methods can I use?", answer: "See our accepted payment methods page for payment information. The available options for your purchase are shown at checkout.", href: "/accepted-payment-methods", label: "Accepted payment methods" },
    { question: "How can I contact customer service?", answer: "Visit Get Support to search our help pages or contact the team for assistance.", href: "/get-support", label: "Get support" },
    { question: "Where can I find special offers?", answer: "Browse the collection to see available products and current displayed offers.", href: "/shop-all", label: "Explore the collection" },
  ] },
];

export default function FAQsPage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Shopping help navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>FAQ</h2>
      <nav aria-label="Shopping online">
        <Link href="/accepted-payment-methods">ACCEPTED PAYMENT METHODS</Link>
        <Link href="/faq" aria-current="page">FAQ</Link>
        <Link href="/size-guide">SIZE GUIDE</Link>
        <Link href="/shop-all">SPECIAL OFFERS</Link>
      </nav>
    </aside>
    <article className={shared.article}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shopping online</span><span aria-hidden="true"> / </span><span aria-current="page">FAQ</span></nav>
      <h1>FAQ</h1>
      <div className={styles.categories}>{categories.map(category => <details className={styles.category} key={category.title}>
        <summary>{category.title}<ChevronDown size={15} aria-hidden="true" /></summary>
        <div className={styles.answers}>{category.questions.map(item => <section key={item.question}><h2>{item.question}</h2><p>{item.answer}</p><Link href={item.href}>{item.label}</Link></section>)}</div>
      </details>)}</div>
      <Feedback negativeMessage="Visit Get Support for more help or to contact customer service." />
    </article>
  </main>;
}
