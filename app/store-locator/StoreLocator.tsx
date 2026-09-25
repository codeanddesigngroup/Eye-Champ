import Link from "next/link";
import styles from "./page.module.css";

const address = "No 18, Main Rashid Minhas Rd, Block 5 Gulshan-e-Iqbal, Karachi, 75300";
const mapQuery = encodeURIComponent(address);

export default function StoreLocator() {
  return <main id="top" className={styles.page}>
    <section className={styles.locator} aria-labelledby="locator-heading">
      <div className={styles.sidebar}>
        <h1 id="locator-heading">COME SEE US IN KARACHI</h1>
        <p>Visit our Karachi store to browse frames in person and get expert fitting help.</p>
        <address className={styles.address}>{address}</address>
        <a className={styles.button} href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`} target="_blank" rel="noopener noreferrer">Get Directions<span className={styles.srOnly}> (opens in a new tab)</span></a>
      </div>
      <div className={styles.map}><iframe title="Eye Champ Karachi store location" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
    </section>
    <section className={styles.shop}><p>Can&apos;t make it in? Shop the full collection online.</p><Link href="/shop-all" className={styles.button}>SHOP NOW</Link></section>
  </main>;
}
