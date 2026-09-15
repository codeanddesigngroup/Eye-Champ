import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact Us | EyeChamp",
  description: "Contact EyeChamp for help with products, prescriptions, orders, payments, deliveries, returns, and refunds.",
};

export default function ContactUsPage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Support navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>CONTACT US</h2>
    </aside>
    <article className={`${shared.article} ${styles.article}`}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span aria-current="page">Contact us</span></nav>
      <h1>CONTACT US</h1>
      <p>For questions regarding products, prescriptions, orders, payments, deliveries, returns, or refunds, customers may contact the EyeChamp support team.</p>
      <dl className={styles.details}>
        <div><dt>Business Name:</dt><dd>EyeChamp</dd></div>
        <div><dt>Website:</dt><dd><a href="https://eyechamp.pk">EyeChamp.pk</a></dd></div>
        <div><dt>Email:</dt><dd><a href="mailto:support@eyechamp.pk">support@eyechamp.pk</a></dd></div>
        <div><dt>Phone / WhatsApp:</dt><dd><a href="https://wa.me/923318099594">+92 331 8099594</a></dd></div>
        <div><dt>Business Address:</dt><dd><a href="https://maps.google.com/maps/place//data=!4m2!3m1!1s0x3eb3396046bdf8dd:0x4f123d5bf1469b68?entry=s&amp;sa=X&amp;ved=2ahUKEwiZqJWW0u-WAxV1RqQEHRjxA_4Q4kB6BAgXEAA&amp;hl=en">No 18, Main Rashid Minhas Rd, Block 5 Gulshan-e-Iqbal, Karachi, 75300</a></dd></div>
        <div><dt>Support Hours:</dt><dd>11.30 am - 11.30 pm</dd></div>
      </dl>
      <p>For order-related inquiries, customers should provide their <strong>order number</strong> to help us respond efficiently.</p>
    </article>
  </main>;
}
