import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import styles from "../accepted-payment-methods/page.module.css";
import serviceStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Parts & Service | Eye Champ",
  description: "Find information about eyewear warranty coverage, parts and service, and how to get assistance.",
};

export default function PartsAndServicePage() {
  return <main id="top" className={`${styles.page} ${serviceStyles.page}`}>
    <aside className={styles.sidebar} aria-label="Parts and service navigation">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>PARTS &amp; SERVICE</h2>
      <nav aria-label="Service information">
        <Link href="/parts-and-service" aria-current="page">PARTS &amp; SERVICE</Link>
      </nav>
    </aside>
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Parts &amp; Service</span><span aria-hidden="true"> / </span><span aria-current="page">Parts &amp; service</span>
      </nav>
      <h1>PARTS &amp; SERVICE</h1>
      <section className={styles.section} aria-labelledby="service-heading">
        <h2 id="service-heading">PARTS &amp; SERVICE</h2>
        <p>Luxottica provides a warranty on its products against breakages caused by material or manufacturing defects reported within two years of the date of delivery of the products, provided that Luxottica is notified of such defects within two months of their discovery. Scratching of the lenses is regarded as a normal consequence of wear and is not covered by the warranty, unless you can prove that the product was defective at the time of delivery.</p>
        <p>The guarantee of contractual compliance provided for by law for products purchased by consumers shall apply without restriction.</p>
        <p>If you purchased on Ray-Ban.com and need assistance, please <a className={serviceStyles.contact} href="https://www.ray-ban.com/global/c/contact-us">contact us</a></p>
      </section>
      <section className={styles.section} aria-labelledby="liability-heading">
        <h2 id="liability-heading">OUR LIABILITY IN RELATION TO YOU</h2>
        <p>Nothing in this Warranty Policy shall be interpreted as intended to exclude or limit Luxottica&apos;s liability in the event of (a) death or personal injury caused by Luxottica&apos;s negligence; (b) fraud, false declarations or gross negligence; or (c) any liability that cannot be limited or excluded in accordance with the applicable law.</p>
      </section>
      <Feedback negativeMessage="Please use the contact us link above for further assistance with parts and service." />
    </article>
  </main>;
}
