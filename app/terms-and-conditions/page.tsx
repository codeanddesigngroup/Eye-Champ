import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms and Conditions | Eye Champ",
  description: "Access terms of use and related legal information.",
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
      <p>To learn more, please <a className={styles.documentLink} href="https://www.ray-ban.com/global/c/terms-of-use" target="_blank" rel="noopener noreferrer">view Ray-Ban&apos;s terms of use</a>. The page will open in a new tab.</p>
    </article>
  </main>;
}
