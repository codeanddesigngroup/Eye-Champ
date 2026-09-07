import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "./Feedback";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Accepted Payment Methods | Eye Champ",
  description: "Explore accepted payment methods by country and information about credit card authorization.",
};

const cards = "VISA, Mastercard, Diners, Discover, Amex, Maestro, Electron";
const methods = [
  ["Czech Republic", `${cards}, PayPal, PayPal Express, ApplePay, GooglePay`],
  ["Egypt", `${cards}, PayPal, PayPal Express, GooglePay`],
  ["Hungary", `${cards}, PayPal, PayPal Express, ApplePay, GooglePay`],
  ["Morocco", `${cards}, ApplePay, GooglePay`],
  ["Pakistan", `${cards}, GooglePay`],
  ["Romania", `${cards}, PayPal, PayPal Express, ApplePay, GooglePay`],
  ["South Africa", `${cards}, ApplePay, GooglePay`],
  ["Malaysia", `${cards}, JCB, ChinaUnionPay, Duitnow, ApplePay, GooglePay, GrabPay`],
  ["New Zealand", `${cards}, PayPal, PayPal Express, ApplePay, GooglePay`],
  ["Philippines", `${cards}, JCB, ChinaUnionPay, PayPal, PayPal Express, GooglePay, GrabPay, KakaoPay`],
  ["South Korea", `${cards}, PayPal, PayPal Express, GooglePay, KakaoPay`],
  ["Vietnam", `${cards}, JCB, ChinaUnionPay, PayPal, PayPal Express, ApplePay, GooglePay`],
];

export default function AcceptedPaymentMethodsPage() {
  return <main id="top" className={styles.page}>
    <aside className={styles.sidebar} aria-label="Shopping help">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>ACCEPTED PAYMENT METHODS</h2>
      <nav aria-label="Related shopping information">
        <Link href="/accepted-payment-methods" aria-current="page">ACCEPTED PAYMENT METHODS</Link>
        <a href="#payment-faq">FAQ</a>
        <Link href="/size-guide">SIZE GUIDE</Link>
        <Link href="/shop-all">SPECIAL OFFERS</Link>
      </nav>
    </aside>
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shopping online</span><span aria-hidden="true"> / </span><span aria-current="page">Accepted payment methods</span></nav>
      <h1>ACCEPTED PAYMENT METHODS</h1>
      <p>Please refer to the checkout for precise and updated payment methods. Please note that we accept international credit cards.</p>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Accepted payment methods by country</caption>
        <thead><tr><th scope="col">Country</th><th scope="col">Payment Methods</th></tr></thead>
        <tbody>{methods.map(([country, paymentMethods]) => <tr key={country}><th scope="row">{country}</th><td>{paymentMethods}</td></tr>)}</tbody>
      </table>
      <section className={styles.section}>
        <h2>THE RAY-BAN SAFE SHOPPING GUARANTEE</h2>
        <p>The Ray-Ban Safe Shopping Guarantee protects you while you shop at Ray-Ban, so that you never have to worry about credit card safety. We guarantee that every transaction you make at Ray-Ban will be safe. This means you pay nothing if unauthorized charges are made to your card as a result of shopping at Ray-Ban.</p>
      </section>
      <section id="payment-faq" className={styles.section}>
        <h2>AUTHORIZING YOUR CREDIT CARD</h2>
        <p>It is not uncommon for a request for credit card authorization to fail once or twice before the card is finally authorized. We will send you an e-mail if we experience difficulties in authorizing your credit card.</p>
      </section>
      <Feedback />
    </article>
  </main>;
}
