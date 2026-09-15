import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faSquareFontAwesomeStroke, faTwitter, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { LockKeyhole, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const groups = [
  ["SHOP BY", "ALL SUNGLASSES", "ALL EYEGLASSES", "POLARIZED", "NEW ARRIVALS", "SPECIAL OFFERS"],
  ["SHOPPING ONLINE", "SIZE GUIDE", "ACCEPTED PAYMENT METHODS", "PARTS & SERVICE", "SHIPPING AND DELIVERY POLICY", "CANCELLATION, RETURN & REFUND POLICY"],
  ["ABOUT US", "OUR STORY", "BLOG"], ["DO IT IN PERSON", "STORE LOCATOR"],
  ["HOW CAN WE HELP?", "GET SUPPORT", "CONTACT US", "TRACK ORDERS", "TRACK RETURNS", "FAQ"],
];
const shopByLinks: Record<string, string> = {
  "OUR STORY": "/our-story",
  "BLOG": "#top",
  "GET SUPPORT": "/get-support",
  "CONTACT US": "/contact-us",
  "TRACK ORDERS": "/track-orders",
  "TRACK RETURNS": "/track-returns",
  "FAQ": "/faq",
  "STORE LOCATOR": "/store-locator",
  "SIZE GUIDE": "/size-guide",
  "ACCEPTED PAYMENT METHODS": "/accepted-payment-methods",
  "PARTS & SERVICE": "/parts-and-service",
  "SHIPPING AND DELIVERY POLICY": "/shipping-and-delivery-policy",
  "CANCELLATION, RETURN & REFUND POLICY": "/cancellation-return-and-refund-policy",
  "ALL SUNGLASSES": "/sunglasses/all",
  "ALL EYEGLASSES": "/eyeglasses/all",
  "POLARIZED": "/sunglasses/polarized-sunglasses",
  "NEW ARRIVALS": "/shop-all",
  "SPECIAL OFFERS": "/shop-all",
};

const cards = [["JazzCash", styles.jazzcash], ["VISA", styles.visa], ["●●", styles.mastercard]];

export default function Footer() {
  return <footer id="help" className={styles.footer}>
    <section className={styles.socialBanner} aria-label="Social media links">
      <FontAwesomeIcon className={styles.socialMark} icon={faSquareFontAwesomeStroke} aria-hidden="true" />
      <strong>Socialize with us</strong>
      <nav>
        <a href="#top" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
        <a href="#top" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
        <a href="#top" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
        <a href="#top" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a>
      </nav>
    </section>
    <section className={styles.assurances} aria-label="Shopping assurances">
      <div><LockKeyhole aria-hidden="true" /><strong>SECURE CHECKOUT</strong></div><Link href="/shipping-and-delivery-policy"><Truck aria-hidden="true" /><strong>RESPONSIBLE SHIPPING</strong></Link>
    </section>
    <section className={styles.security}><p><LockKeyhole aria-hidden="true" /> We guarantee every transaction is 100% secure.</p>
      <div className={styles.paymentMarks} aria-label="Accepted payment methods">{cards.map(([label, className], i) => <span className={className} key={`${label}-${i}`}>{label === "JazzCash" ? <Image src="/images/payments/jazzcash.png" alt="JazzCash" width={24} height={24} /> : label}</span>)}</div>
    </section>
    <section className={styles.linksArea}><div className={styles.linkGrid}>
      {groups.map(([heading, ...links]) => <div className={styles.linkGroup} key={heading}><h2>{heading}</h2>{links.map(label => shopByLinks[label] ? <Link href={shopByLinks[label]} key={label}>{label}</Link> : <a href="#top" key={label}>{label}</a>)}</div>)}
      <div className={`${styles.linkGroup} ${styles.follow}`}><h2>FOLLOW US</h2><div className={styles.socials}>
        <a href="#top" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a><a href="#top" aria-label="YouTube"><FontAwesomeIcon icon={faYoutube} /></a><a href="#top" aria-label="X"><FontAwesomeIcon icon={faXTwitter} /></a><a href="#top" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
      </div></div>
    </div>
    </section>
    <section className={styles.legal}>
      <div className={styles.legalTop}><nav aria-label="Legal links"><Link href="/privacy-policy">privacy policy</Link><a href="#top">Sitemap</a><Link href="/terms-and-conditions">Terms and Conditions</Link></nav></div>
      <div className={styles.disclaimer}>
        <p>
          Product images are for illustration purposes only; actual colour and finish may vary slightly on screen. Eye Champ is an independent multi-brand eyewear retailer based in Pakistan. All brand names and logos displayed are the property of their respective owners. © 2026 Eye Champ. All rights reserved.
        </p>
      </div>
    </section>
  </footer>;
}
