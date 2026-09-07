import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms of Use | Eye Champ",
  description: "Access terms of use and related legal information.",
};

const legalLinks = [
  ["TERMS OF SALE", "https://www.ray-ban.com/global/c/terms-of-sale"],
  ["COPYRIGHT INFORMATION", "https://www.ray-ban.com/global/c/copyright-information"],
  ["TRANSPARENCY IN SUPPLY CHAIN DISCLOSURE", "https://www.ray-ban.com/global/c/transparency-in-supply-chain-disclosure"],
];

export default function TermsOfUsePage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Legal navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>TERMS OF USE</h2>
      <nav aria-label="Legal information">
        <Link href="/terms-of-use" aria-current="page">TERMS OF USE</Link>
        {legalLinks.map(([title, href]) => <a key={title} href={href} target="_blank" rel="noopener noreferrer">{title}<span className={shared.srOnly}> (opens on Ray-Ban in a new tab)</span></a>)}
      </nav>
      <h2>EASY SOLUTIONS</h2>
      <nav aria-label="Help"><Link href="/faq">FAQ</Link></nav>
    </aside>
    <article className={shared.article}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Legal</span><span aria-hidden="true"> / </span><span aria-current="page">Terms of use</span></nav>
      <h1>TERMS OF USE</h1>
      <p>To learn more, please <a className={styles.documentLink} href="https://www.ray-ban.com/global/c/terms-of-use" target="_blank" rel="noopener noreferrer">view Ray-Ban&apos;s terms of use</a>. The page will open in a new tab.</p>
      <Feedback negativeMessage="Visit Get Support to contact customer service for further assistance." />
    </article>
  </main>;
}
