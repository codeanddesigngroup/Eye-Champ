import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import styles from "../accepted-payment-methods/page.module.css";
import shippingStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Shipping Information | Eye Champ",
  description: "View shipping rates and delivery times by destination, delivery tracking information, and help with missing or damaged goods.",
};

const destinations = [
  ["Czech Republic", "5 days", "1-2 days", "Kč306.40"],
  ["Egypt", "7 days", "3-6 days", "1252.66 £E"],
  ["Hungary", "4 days", "1-2 days", "Ft 4980,05"],
  ["South Korea", "8 days", "3-5 days", "₩39051.09"],
  ["Malaysia", "6 days", "3-7 days", "MYR105.53"],
  ["Morocco", "6 days", "2-4 days", "335.22MAD"],
  ["New Zealand", "10 days", "3-7 days", "NZ$ 47.23"],
  ["Pakistan", "7 days", "3-5 days", "USD28.32"],
  ["Philippines", "6 days", "3-7 days", "PHP 1421.50"],
  ["Romania", "7 days", "1-2 days", "62,13RON"],
  ["South Africa", "11 days", "2-10 days", "R 511,03"],
  ["Vietnam", "7 days", "3-4 days", "647599.47 VND"],
];

const contactUrl = "https://www.ray-ban.com/global/contact-us";

export default function ShippingInformationPage() {
  return <main id="top" className={`${styles.page} ${shippingStyles.page}`}>
    <aside className={styles.sidebar} aria-label="Shipping and returns navigation">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>SHIPPING INFORMATION</h2>
      <nav aria-label="Shipping information">
        <Link href="/shipping-information" aria-current="page">SHIPPING INFORMATION</Link>
        <Link href="/cancel-or-return-an-order">RETURNS POLICY</Link>
      </nav>
      <h2>EASY SOLUTIONS</h2>
      <nav aria-label="Shipping help"><a href="#delivery-tracking">FAQ</a></nav>
    </aside>
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shipping &amp; returns</span><span aria-hidden="true"> / </span><span aria-current="page">Shipping information</span></nav>
      <h1>SHIPPING INFORMATION</h1>
      <section className={styles.section} aria-labelledby="rates-heading">
        <h2 id="rates-heading">RATES &amp; POLICIES</h2>
        <p>There are two shipping options for orders. Please refer to the checkout for precise and updated delivery timings and costs.</p>
        <p>- <strong>Express Shipping:</strong> Available for selected standard products.</p>
        <p>- <strong>Standard and Express Shipping:</strong> Available for all products. Free of charge. *The shipping costs are converted daily therefore it is expected to see small fluctuations.</p>
        <div className={shippingStyles.tableScroll} role="region" aria-label="Shipping rates by destination" tabIndex={0}>
          <table className={`${styles.table} ${shippingStyles.rates}`}>
            <caption className={styles.srOnly}>Standard and express shipping delivery times and costs by destination</caption>
            <thead><tr><th scope="col">Destination</th><th scope="col">Standard Shipping Lead Time</th><th scope="col">Standard Shipping Cost</th><th scope="col">Express Shipping Lead Time</th><th scope="col">Express Shipping Cost</th></tr></thead>
            <tbody>{destinations.map(([destination, standard, express, cost]) => <tr key={destination}><th scope="row">{destination}</th><td>{standard}</td><td>Free</td><td>{express}</td><td>{cost}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className={shippingStyles.section} aria-labelledby="shipping-heading">
        <h2 id="shipping-heading">SHIPPING INFORMATION</h2>
        <ul>
          <li>Delivery times shown in the checkout include order processing and transit. Please note that delivery can occasionally be delayed due to unforeseen circumstances.</li>
          <li id="returns-policy">Remember that if you decide to return your item(s), shipping costs will not be refunded.</li>
          <li>All packages are fully insured. When Ray-Ban identifies with the couriers that a parcel has not been delivered or arrived empty, then the same item will be shipped again, free of charge for the customer. No refund can be offered in such circumstances. Please refer to the missing and defective goods policy below.</li>
          <li>We do not ship to PO boxes and/or military bases. Orders to these addresses will be automatically cancelled.</li>
        </ul>
      </section>
      <section id="delivery-tracking" className={shippingStyles.section} aria-labelledby="tracking-heading">
        <h2 id="tracking-heading">DELIVERY TRACKING</h2>
        <ul>
          <li>We will send you an email confirming the carrier&apos;s details and the tracking number as soon as your order is shipped. You can track the delivery status of your order at any time through your My Account page on Ray-Ban.com.</li>
          <li>Remember to check the condition of the package when it&apos;s delivered. You can always refuse it or accept it tentatively if you have any reservations. For all enquiries please <a href={contactUrl}>Contact us</a>.</li>
        </ul>
      </section>
      <section className={shippingStyles.section} aria-labelledby="missing-heading">
        <h2 id="missing-heading">MISSING OR DEFECTIVE GOODS</h2>
        <p>Check your order as soon as it arrives to make sure everything is as expected. If your order is incorrect or an item is missing or damaged:</p>
        <ol>
          <li>Contact our Customer Care team at this link: <a href={contactUrl}>Contact us</a>.</li>
          <li>Indicate your order number. Please consider that you must contact us within 14 days of receiving the shipment as we will not be able to accept responsibility for the item(s) after this time frame.</li>
          <li>Attach clear pictures of the incorrect or damaged item(s) received, including the SKU code of the eyewear (usually found on the inside of the left temple), the delivery note and the packaging.</li>
        </ol>
        <p>Our Customer Care team will assess the information provided and investigate further. We will get back to you as soon as possible with a resolution.</p>
      </section>
      <Feedback negativeMessage="Please use the Contact us link above for further help with shipping or your delivery." />
    </article>
  </main>;
}
