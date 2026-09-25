import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Accepted Payment Methods | Eye Champ",
  description: "Pay with JazzCash, Safepay or Cash on Delivery in Pakistan. Learn about credit card authorization and our safe shopping guarantee.",
};

export default function AcceptedPaymentMethodsPage() {
  return <main id="top" className={styles.page}>
    <aside className={styles.sidebar} aria-label="Shopping help">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>ACCEPTED PAYMENT METHODS</h2>
    </aside>
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shopping online</span><span aria-hidden="true"> / </span><span aria-current="page">Accepted payment methods</span></nav>
      <h1>ACCEPTED PAYMENT METHODS</h1>
      <p>Here&apos;s exactly how you can pay &mdash; see checkout for the full list at the time of your order.</p>
      <section className={styles.section}>
        <h2>Payment methods in Pakistan</h2>
        <ul className={styles.methods}>
          <li>JazzCash</li>
          <li>Safepay (covers major debit/credit cards)</li>
          <li>Cash on Delivery (COD)</li>
        </ul>
      </section>
      <section className={styles.section}>
        <h2>THE EYE CHAMP SAFE SHOPPING GUARANTEE</h2>
        <p>Every transaction on Eye Champ is protected. If unauthorized charges are ever made using your card because of shopping with us, you pay nothing.</p>
      </section>
      <section id="payment-faq" className={styles.section}>
        <h2>AUTHORIZING YOUR CREDIT CARD</h2>
        <p>It&apos;s not unusual for a card authorization to be declined once or twice before it goes through. If we run into trouble authorizing yours, we&apos;ll email you.</p>
      </section>
    </article>
  </main>;
}
