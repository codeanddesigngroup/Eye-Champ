import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import shared from "../accepted-payment-methods/page.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Internet Privacy Policy | Eye Champ",
  description: "Access internet privacy policy information and privacy support.",
};

export default function InternetPrivacyPolicyPage() {
  return <main id="top" className={`${shared.page} ${styles.page}`}>
    <aside className={shared.sidebar} aria-label="Privacy navigation">
      <Link href="/get-support" className={shared.back} aria-label="Back to Get Support"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>INTERNET PRIVACY POLICY</h2>
      <nav aria-label="Privacy and security"><Link href="/internet-privacy-policy" aria-current="page">INTERNET PRIVACY POLICY</Link></nav>
    </aside>
    <article className={shared.article}>
      <nav className={shared.breadcrumb} aria-label="Breadcrumb"><Link href="/get-support">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Privacy &amp; security</span><span aria-hidden="true"> / </span><span aria-current="page">Internet privacy policy</span></nav>
      <h1>INTERNET PRIVACY POLICY</h1>
      <p>Please <a className={styles.policyLink} href="https://www.ray-ban.com/global/c/privacy-policy" target="_blank" rel="noopener noreferrer">view Ray-Ban&apos;s Privacy Policy</a>. The page will open in a new tab.</p>
      <Feedback negativeMessage="Visit Get Support to contact customer service about privacy questions." />
    </article>
  </main>;
}
