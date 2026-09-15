import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms and Conditions | Eye Champ",
  description: "Read EyeChamp.pk's terms and conditions for products, prescription orders, payments, delivery, returns, and website use.",
};

export default function TermsOfUsePage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Legal navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>TERMS AND CONDITIONS</h2>
    </aside>
    <article className={shared.article}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Legal</span><span aria-hidden="true"> / </span><span aria-current="page">Terms and Conditions</span></nav>
      <h1>TERMS AND CONDITIONS</h1>
      <div className={styles.termsContent}>
        <p>Welcome to <strong>EyeChamp.pk</strong>.</p>
        <p>By accessing this website, placing an order, or purchasing products from EyeChamp, you agree to these Terms &amp; Conditions.</p>

        <section className={shared.section}>
          <h2>Products</h2>
          <p>EyeChamp offers eyewear and related products, which may include:</p>
          <ul>
            <li>Eyeglasses</li>
            <li>Sunglasses</li>
            <li>Optical frames</li>
            <li>Prescription lenses</li>
            <li>Contact lenses</li>
            <li>Eyewear accessories</li>
            <li>Other optical products</li>
          </ul>
          <p>Product availability may change without prior notice.</p>
          <p>We make reasonable efforts to ensure that product images, descriptions, specifications, sizes, and colors are accurate. However, actual product appearance may vary slightly due to photography, screen settings, manufacturing differences, or customization.</p>
        </section>

        <section className={shared.section}>
          <h2>Prescription Orders</h2>
          <p>Customers ordering prescription eyewear or lenses are responsible for providing accurate and complete prescription information.</p>
          <p>EyeChamp may contact the customer to verify prescription details before processing an order.</p>
          <p>EyeChamp will not be responsible for issues resulting from incorrect or incomplete prescription information provided by the customer.</p>
        </section>

        <section className={shared.section}>
          <h2>Pricing</h2>
          <p>All prices displayed on EyeChamp.pk are in <strong>Pakistani Rupees (PKR)</strong> unless otherwise stated.</p>
          <p>Prices may be updated from time to time.</p>
          <p>The price applicable to an order will normally be the price displayed at the time the order is placed.</p>
          <p>In case of an obvious pricing, technical, or product-listing error, EyeChamp reserves the right to correct or cancel the affected order.</p>
        </section>

        <section className={shared.section}>
          <h2>Payments</h2>
          <p>Customers may use the payment methods displayed during checkout.</p>
          <p>Payments may be processed through authorized third-party payment gateways, banking institutions, mobile wallets, or other approved payment providers.</p>
          <p>An order may remain subject to payment verification before it is confirmed or processed.</p>
        </section>

        <section className={shared.section}>
          <h2>Order Acceptance</h2>
          <p>Submitting an order does not automatically guarantee acceptance.</p>
          <p>EyeChamp may refuse, cancel, or hold an order due to:</p>
          <ul>
            <li>Product unavailability</li>
            <li>Incorrect product information</li>
            <li>Pricing errors</li>
            <li>Payment authorization failure</li>
            <li>Suspected fraudulent activity</li>
            <li>Incomplete customer information</li>
            <li>Prescription verification issues</li>
          </ul>
          <p>If payment has already been received for an order cancelled by EyeChamp, an applicable refund will be processed according to our Refund Policy.</p>
        </section>

        <section className={shared.section}>
          <h2>Shipping &amp; Delivery</h2>
          <p>Orders are delivered in accordance with our <strong>Shipping &amp; Delivery Policy</strong>.</p>
          <p>Delivery times are estimates and may be affected by courier operations, public holidays, remote delivery locations, product availability, prescription processing, or other circumstances outside our reasonable control.</p>
        </section>

        <section className={shared.section}>
          <h2>Returns &amp; Refunds</h2>
          <p>Cancellations, returns, exchanges, and refunds are governed by our <strong>Cancellation, Return &amp; Refund Policy</strong>.</p>
        </section>

        <section className={shared.section}>
          <h2>Website Use</h2>
          <p>Customers must not:</p>
          <ul>
            <li>Use the website for unlawful activities</li>
            <li>Submit fraudulent orders</li>
            <li>Attempt unauthorized access to the website</li>
            <li>Interfere with website security or operation</li>
            <li>Misuse website content or systems</li>
          </ul>
        </section>

        <section className={shared.section}>
          <h2>Intellectual Property</h2>
          <p>Content available on EyeChamp.pk, including logos, graphics, website design, text, photographs owned by EyeChamp, and other original materials, may not be reproduced or commercially used without authorization.</p>
          <p>Third-party trademarks and brand names remain the property of their respective owners.</p>
        </section>

        <section className={shared.section}>
          <h2>Limitation of Liability</h2>
          <p>To the extent permitted by applicable law, EyeChamp will not be responsible for indirect or consequential losses arising from:</p>
          <ul>
            <li>Incorrect information provided by customers</li>
            <li>Improper use of products</li>
            <li>Prescription information supplied incorrectly</li>
            <li>Courier or service interruptions outside our reasonable control</li>
          </ul>
          <p>Nothing in these Terms is intended to limit any consumer rights available under applicable laws of Pakistan.</p>
        </section>

        <section className={shared.section}>
          <h2>Governing Law</h2>
          <p>These Terms &amp; Conditions are governed by the applicable laws of <strong>Pakistan</strong>.</p>
        </section>

        <section className={shared.section}>
          <h2>Contact</h2>
          <p>For questions regarding these Terms:</p>
          <p><strong>Email:</strong> <a className={styles.documentLink} href="mailto:support@eyechamp.pk">support@eyechamp.pk</a><br />
            <strong>Phone / WhatsApp:</strong> <a className={styles.documentLink} href="https://wa.me/923318099594">+92 331 8099594</a></p>
        </section>
      </div>
    </article>
  </main>;
}
