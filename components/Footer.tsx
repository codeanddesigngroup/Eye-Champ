import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faPinterestP, faSpotify, faSquareFontAwesomeStroke, faThreads, faTiktok, faTwitter, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { LockKeyhole, Truck } from "lucide-react";
import Link from "next/link";
import styles from "./Footer.module.css";
import ShippingCountry from "./ShippingCountry";

const groups = [
  ["SHOP BY", "ALL SUNGLASSES", "ALL EYEGLASSES", "POLARIZED", "NEW ICONS", "SPECIAL OFFERS"],
  ["SHOPPING ONLINE", "SIZE GUIDE", "ACCEPTED PAYMENT METHODS", "PARTS & SERVICE", "SHIPPING INFORMATION", "CANCEL OR RETURN AN ORDER"],
  ["ABOUT US", "OUR ICONS HISTORY", "RAY-BAN RED", "THE ONES", "ONESIGHT"], ["DO IT IN PERSON", "STORE LOCATOR"],
  ["HOW CAN WE HELP?", "GET SUPPORT", "TRACK ORDERS", "TRACK RETURNS", "FAQ", "REPORT A FAKE"],
];
const shopByLinks: Record<string, string> = {
  "OUR ICONS HISTORY": "/our-icons-history",
  "THE ONES": "/the-ones",
  "ONESIGHT": "/one-sight",
  "GET SUPPORT": "/get-support",
  "TRACK ORDERS": "/track-orders",
  "TRACK RETURNS": "/track-returns",
  "FAQ": "/faq",
  "REPORT A FAKE": "/report-a-fake",
  "STORE LOCATOR": "/store-locator",
  "SIZE GUIDE": "/size-guide",
  "ACCEPTED PAYMENT METHODS": "/accepted-payment-methods",
  "PARTS & SERVICE": "/parts-and-service",
  "SHIPPING INFORMATION": "/shipping-information",
  "CANCEL OR RETURN AN ORDER": "/cancel-or-return-an-order",
  "ALL SUNGLASSES": "/sunglasses/all",
  "ALL EYEGLASSES": "/eyeglasses/all",
  "POLARIZED": "/sunglasses/polarized-sunglasses",
  "NEW ICONS": "/shop-all",
  "SPECIAL OFFERS": "/shop-all",
};
const cards = [["VISA", styles.visa], ["●●", styles.mastercard], ["Diners", styles.diners], ["DISCOVER", styles.discover], ["●●", styles.maestro], ["VISA", styles.electron]];

export default function Footer() {
  return <footer id="help" className={styles.footer}>
    <section className={styles.socialBanner} aria-label="Social media links">
      <FontAwesomeIcon className={styles.socialMark} icon={faSquareFontAwesomeStroke} aria-hidden="true" />
      <strong>Socialize with us</strong>
      <nav>
        <a href="#top" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
        <a href="#top" aria-label="Pinterest"><FontAwesomeIcon icon={faPinterestP} /></a>
        <a href="#top" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
        <a href="#top" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
        <a href="#top" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a>
      </nav>
    </section>
    <section className={styles.assurances} aria-label="Shopping assurances">
      <div><LockKeyhole aria-hidden="true" /><strong>SECURE CHECKOUT</strong></div><Link href="/shipping-information"><Truck aria-hidden="true" /><strong>RESPONSIBLE SHIPPING</strong></Link>
    </section>
    <section className={styles.security}><p><LockKeyhole aria-hidden="true" /> We guarantee every transaction is 100% secure.</p>
      <div className={styles.paymentMarks} aria-label="Accepted payment methods">{cards.map(([label, className], i) => <span className={className} key={`${label}-${i}`}>{label}</span>)}</div>
    </section>
    <section className={styles.linksArea}><div className={styles.linkGrid}>
      {groups.map(([heading, ...links]) => <div className={styles.linkGroup} key={heading}><h2>{heading}</h2>{links.map(label => shopByLinks[label] ? <Link href={shopByLinks[label]} key={label}>{label}</Link> : <a href="#top" key={label}>{label}</a>)}</div>)}
      <div className={`${styles.linkGroup} ${styles.follow}`}><h2>FOLLOW US</h2><div className={styles.socials}>
        <a href="#top" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a><a href="#top" aria-label="TikTok"><FontAwesomeIcon icon={faTiktok} /></a><a href="#top" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a><a href="#top" aria-label="X"><FontAwesomeIcon icon={faXTwitter} /></a><a href="#top" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a><a href="#top" aria-label="Threads"><FontAwesomeIcon icon={faThreads} /></a><a href="#top" aria-label="Spotify"><FontAwesomeIcon icon={faSpotify} /></a><a href="#top" aria-label="Pinterest"><FontAwesomeIcon icon={faPinterestP} /></a>
      </div></div>
    </div>
    </section>
    <section className={styles.legal}>
      <div className={styles.legalTop}><div className={styles.shipping}><span>You&apos;re shipping to:</span><ShippingCountry /></div><nav aria-label="Legal links"><Link href="/internet-privacy-policy">Internet privacy policy</Link><a href="#top">Sitemap</a><Link href="/terms-of-use">Terms of use</Link></nav></div>
      <div className={styles.disclaimer}><p>Pictures and images on this website are for illustration purposes only. No qualities or characteristics of the products depicted herein could be inferred from the relevant pictures. Certain activities undertaken by Luxottica Group S.p.A. may be licensed under US Patent No. 6,624,843. <a href="#top">Copyright ©2026 Luxottica Group S.p.A. - All Rights Reserved</a></p><p>Ray-Ban® Official Store in Czech Republic, Egypt, Hungary, Malaysia, Morocco, New Zealand, Pakistan, Philippines, Romania, South Africa, South Korea, Vietnam.</p><a href="#top">Other sites of the Group</a></div>
    </section>
  </footer>;
}
