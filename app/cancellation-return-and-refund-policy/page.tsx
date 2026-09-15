import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "../accepted-payment-methods/page.module.css";
import returnStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cancellation Return and Refund Policy | Eye Champ",
  description: "Read EyeChamp's cancellation, return, and refund policy, including return eligibility, damaged products, and refund timelines.",
};

export default function CancelOrReturnOrderPage() {
  return <main id="top" className={styles.page}>
    <aside className={styles.sidebar} aria-label="Shipping and returns navigation">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>CANCELLATION, RETURN & REFUND POLICY</h2>
    </aside>
    <article className={`${styles.article} ${returnStyles.article}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shipping &amp; returns</span><span aria-hidden="true"> / </span><span aria-current="page">Cancellation return and refund policy</span></nav>
      <h1>CANCELLATION, RETURN & REFUND POLICY</h1>
      <p>At EyeChamp, we aim to provide customers with correctly supplied and properly delivered eyewear products.</p>

      <section className={styles.section}>
        <h2>Order Cancellation</h2>
        <p>Customers may request cancellation before an order has been dispatched or before customization has started.</p>
        <p>For prescription or customized products, cancellation may not be possible once lens production, fitting, customization, or processing has begun.</p>
        <p>Cancellation requests should be sent to:</p>
        <p><strong><a href="mailto:support@eyechamp.pk">support@eyechamp.pk</a></strong></p>
        <p>Please include your order number and contact details.</p>
      </section>

      <section className={styles.section}>
        <h2>Returns</h2>
        <p>Eligible non-customized products may be returned within <strong>7 days of delivery</strong>, subject to the following conditions:</p>
        <ul>
          <li>Product must be unused and unworn</li>
          <li>Product must be in its original condition</li>
          <li>Original packaging must be included</li>
          <li>Tags and accessories must remain intact</li>
          <li>Product must not have been damaged after delivery</li>
          <li>Proof of purchase must be available</li>
        </ul>
        <p>Returned products may be inspected before approval.</p>
      </section>

      <section className={styles.section}>
        <h2>Prescription &amp; Customized Products</h2>
        <p>Prescription lenses, customized eyewear, specially manufactured lenses, or products prepared according to customer-provided measurements or prescriptions are generally not eligible for return due to change of mind.</p>
        <p>However, a replacement, correction, or refund may be considered where:</p>
        <ul>
          <li>The wrong product was supplied</li>
          <li>The product arrived damaged</li>
          <li>A verified manufacturing defect exists</li>
          <li>The supplied product materially differs from the confirmed order due to an error by EyeChamp</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Contact Lenses &amp; Hygiene-Sensitive Products</h2>
        <p>Opened or used contact lenses and other sealed hygiene-sensitive products cannot normally be returned for health and hygiene reasons.</p>
        <p>They may still qualify for replacement or refund if they were:</p>
        <ul>
          <li>Damaged on arrival</li>
          <li>Defective</li>
          <li>Incorrectly supplied</li>
        </ul>
        <p>Unopened products must remain in their original sealed packaging.</p>
      </section>

      <section id="missing-goods" className={styles.section}>
        <h2>Damaged or Incorrect Products</h2>
        <p>Customers should report damaged, defective, or incorrectly supplied products within <strong>48 hours of delivery</strong>.</p>
        <p>We may request photographs, videos, packaging details, or other reasonable information to verify the issue.</p>
      </section>

      <section className={styles.section}>
        <h2>Refunds</h2>
        <p>Once an eligible return or refund request has been approved, the refund will normally be initiated within <strong>7&ndash;10 business days</strong>.</p>
        <p>Refunds will generally be processed through the original payment method where technically possible.</p>
        <p>Banks, card issuers, mobile wallets, and payment gateways may require additional processing time before the amount appears in the customer&apos;s account.</p>
      </section>

      <section className={styles.section}>
        <h2>Shipping Charges</h2>
        <p>Original delivery charges are generally non-refundable for change-of-mind returns.</p>
        <p>Where EyeChamp has supplied an incorrect, damaged, or defective product, applicable return or replacement delivery charges will be handled by EyeChamp.</p>
      </section>

      <section className={styles.section}>
        <h2>Contact</h2>
        <p>For cancellation, return, exchange, or refund requests:</p>
        <p><strong>Email:</strong> <a href="mailto:support@eyechamp.pk">support@eyechamp.pk</a><br />
          <strong>Phone / WhatsApp:</strong> <a href="https://wa.me/923318099594">+92 331 8099594</a></p>
      </section>
    </article>
  </main>;
}
