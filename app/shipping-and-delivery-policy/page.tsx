import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "../accepted-payment-methods/page.module.css";
import shippingStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Shipping and Delivery Policy | Eye Champ",
  description: "Learn about EyeChamp delivery throughout Pakistan, order processing, estimated delivery times, delivery charges, and tracking.",
};

export default function ShippingInformationPage() {
  return <main id="top" className={`${styles.page} ${shippingStyles.page}`}>
    <aside className={styles.sidebar} aria-label="Shipping and returns navigation">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>SHIPPING AND DELIVERY POLICY</h2>
    </aside>
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shipping &amp; returns</span><span aria-hidden="true"> / </span><span aria-current="page">Shipping and Delivery Policy</span></nav>
      <h1>SHIPPING AND DELIVERY POLICY</h1>
      <p>EyeChamp delivers eligible eyewear products throughout <strong>Pakistan</strong>, subject to courier availability.</p>

      <section className={styles.section}>
        <h2>Order Processing</h2>
        <p>Orders are processed after successful order confirmation and, where applicable, payment verification.</p>
        <p>Prescription and customized eyewear may require additional processing time depending on:</p>
        <ul>
          <li>Prescription requirements</li>
          <li>Lens type</li>
          <li>Lens availability</li>
          <li>Coating or customization</li>
          <li>Frame fitting requirements</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Estimated Delivery Time</h2>
        <p><strong>Standard Products:</strong> Approximately <strong>3&ndash;7 business days</strong></p>
        <p><strong>Prescription / Customized Products:</strong> Approximately <strong>5&ndash;10 business days</strong></p>
        <p>Delivery estimates begin after order confirmation and required prescription information has been received.</p>
        <p>These delivery periods are estimates and may vary.</p>
      </section>

      <section className={styles.section}>
        <h2>Delivery Charges</h2>
        <p>Applicable delivery charges, if any, will be displayed during checkout or communicated before order confirmation.</p>
        <p><strong>Delivery Charges:</strong> Subject to city and area</p>
      </section>

      <section className={styles.section}>
        <h2>Delivery Delays</h2>
        <p>Delivery may be affected by circumstances including:</p>
        <ul>
          <li>Public holidays</li>
          <li>Courier delays</li>
          <li>Weather conditions</li>
          <li>Remote delivery locations</li>
          <li>Product availability</li>
          <li>Prescription processing</li>
          <li>Incorrect delivery information</li>
          <li>Events outside our reasonable control</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Customer Information</h2>
        <p>Customers are responsible for providing accurate:</p>
        <ul>
          <li>Full name</li>
          <li>Phone number</li>
          <li>Complete delivery address</li>
          <li>City</li>
          <li>Area or postal information where applicable</li>
        </ul>
        <p>EyeChamp will not be responsible for delays caused by materially incorrect or incomplete delivery details provided by the customer.</p>
      </section>

      <section id="delivery-tracking" className={styles.section}>
        <h2>Order Tracking</h2>
        <p>Where tracking is available, customers may receive tracking information through email, SMS, WhatsApp, or another available communication method.</p>
      </section>

      <section className={styles.section}>
        <h2>Delivery Issues</h2>
        <p>For assistance regarding an order or delivery:</p>
        <p><strong>Email:</strong> <a href="mailto:support@eyechamp.pk">support@eyechamp.pk</a><br />
          <strong>Phone / WhatsApp:</strong> <a href="https://wa.me/923318099594">+92 331 8099594</a></p>
        <p>Please provide your order number when contacting support.</p>
      </section>
    </article>
  </main>;
}
