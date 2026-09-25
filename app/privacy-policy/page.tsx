import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Eye Champ",
  description: "Learn how EyeChamp collects, uses, and protects your personal information when you shop at EyeChamp.pk.",
};

export default function InternetPrivacyPolicyPage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Privacy navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>PRIVACY POLICY</h2>
    </aside>
    <article className={shared.article}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Privacy &amp; security</span><span aria-hidden="true"> / </span><span aria-current="page">Internet privacy policy</span></nav>
      <h1>PRIVACY POLICY</h1>
      <div className={styles.policyContent}>
        <p>At <strong>EyeChamp</strong>, we value your privacy and are committed to protecting the personal information you provide when using our website, placing an order, or communicating with us.</p>

        <section className={shared.section}>
          <h2>Information We Collect</h2>
          <p>We may collect information including:</p>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and delivery address</li>
            <li>Order and purchase information</li>
            <li>Eyewear or prescription details submitted for an order</li>
            <li>Payment transaction references and payment status</li>
            <li>Browser, device, and website usage information</li>
          </ul>
        </section>

        <section className={shared.section}>
          <h2>How We Use Your Information</h2>
          <p>Your information may be used to:</p>
          <ul>
            <li>Process and fulfill orders</li>
            <li>Verify prescription or product information</li>
            <li>Process payments</li>
            <li>Arrange delivery</li>
            <li>Provide customer support</li>
            <li>Send order confirmations and status updates</li>
            <li>Prevent fraudulent or unauthorized transactions</li>
            <li>Improve our website and services</li>
            <li>Meet applicable legal and regulatory requirements</li>
          </ul>
        </section>

        <section className={shared.section}>
          <h2>Payments</h2>
          <p>Payments made through EyeChamp.pk may be processed through authorized third-party payment gateways and financial service providers.</p>
          <p>EyeChamp does not require customers to share payment PINs, passwords, or OTPs with our staff.</p>
          <p>Sensitive payment information is processed through the secure systems of the applicable payment provider.</p>
        </section>

        <section className={shared.section}>
          <h2>Sharing of Information</h2>
          <p>We may share necessary customer information with trusted third parties involved in completing an order, including:</p>
          <ul>
            <li>Payment processors</li>
            <li>Banks and financial institutions</li>
            <li>Courier and delivery companies</li>
            <li>Technology and website service providers</li>
            <li>Regulatory or government authorities where legally required</li>
          </ul>
          <p>We do not sell customers&apos; personal information to third parties.</p>
        </section>

        <section className={shared.section}>
          <h2>Cookies</h2>
          <p>EyeChamp.pk may use cookies and similar technologies to operate the website, remember customer preferences, understand website activity, and improve the shopping experience.</p>
          <p>Customers may manage cookies through their browser settings.</p>
        </section>

        <section className={shared.section}>
          <h2>Data Security</h2>
          <p>We take reasonable technical and organizational measures to protect customer information against unauthorized access, loss, misuse, or disclosure.</p>
        </section>

        <section className={shared.section}>
          <h2>Data Retention</h2>
          <p>Customer information may be retained for as long as reasonably necessary to:</p>
          <ul>
            <li>Complete transactions</li>
            <li>Maintain order records</li>
            <li>Provide customer support</li>
            <li>Resolve disputes</li>
            <li>Prevent fraud</li>
            <li>Meet legal or regulatory requirements</li>
          </ul>
        </section>

        <section className={shared.section}>
          <h2>Your Information</h2>
          <p>Customers may contact us to request correction or clarification regarding their personal information.</p>
          <p><strong>Email:</strong> <a className={styles.policyLink} href="mailto:support@eyechamp.pk">support@eyechamp.pk</a></p>
        </section>

        <section className={shared.section}>
          <h2>Changes to This Policy</h2>
          <p>EyeChamp may update this Privacy Policy when necessary. Updated versions will be published on this page with a revised effective date.</p>
        </section>
      </div>
    </article>
  </main>;
}
