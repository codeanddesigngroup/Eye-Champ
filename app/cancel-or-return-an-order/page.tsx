import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Feedback from "../accepted-payment-methods/Feedback";
import styles from "../accepted-payment-methods/page.module.css";
import returnStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cancel or Return an Order | Eye Champ",
  description: "Learn about returns, packing your order, refunds, and assistance with missing or defective goods.",
};

const contactUrl = "https://www.ray-ban.com/global/contact-us";

export default function CancelOrReturnOrderPage() {
  return <main id="top" className={styles.page}>
    <aside className={styles.sidebar} aria-label="Shipping and returns navigation">
      <Link href="/" className={styles.back} aria-label="Back to home"><ChevronLeft size={22} strokeWidth={1.5} /></Link>
      <h2>CANCEL OR RETURN AN ORDER</h2>
      <nav aria-label="Shipping and returns">
        <Link href="/shipping-information">SHIPPING INFORMATION</Link>
        <Link href="/cancel-or-return-an-order" aria-current="page">RETURNS POLICY</Link>
      </nav>
      <h2>EASY SOLUTIONS</h2>
      <nav aria-label="Returns help"><a href="#missing-goods">FAQ</a></nav>
    </aside>
    <article className={`${styles.article} ${returnStyles.article}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/#help">GET SUPPORT</Link><span aria-hidden="true"> / </span><span>Shipping &amp; returns</span><span aria-hidden="true"> / </span><span aria-current="page">Cancel or return an order</span></nav>
      <h1>CANCEL OR RETURN AN ORDER</h1>
      <section className={styles.section} aria-labelledby="satisfaction-heading">
        <h2 id="satisfaction-heading">YOUR SATISFACTION IS GUARANTEED.</h2>
        <p>When shopping at Ray-Ban you can always change your mind. If you are not happy with any product(s) purchased on our website for any reason, you can decide to return it within 45 days from receiving the shipment.</p>
        <p>We only accept returns on items purchased from ray-ban.com, customized (REMIX) frames excluded. Items purchased from Authorized Ray-Ban retailers must be returned to the place of purchase.</p>
      </section>
      <section className={styles.section} aria-labelledby="steps-heading">
        <h2 id="steps-heading">JUST FOLLOW THESE SIMPLE STEPS:</h2>
        <ol>
          <li>On the My Orders page enter your order number and the email address used when placing your order.</li>
          <li>Follow the guided procedure and print the Return Label &amp; Authorization.</li>
          <li>Pack item(s) in the original packaging including any documentation, accessories and manuals received with the product — make sure the package is secure and that the contents do not risk being damaged during shipping.</li>
          <li>Attach the Return Label on the outside of the package covering any previous address label.</li>
        </ol>
        <div className={returnStyles.orderAction}><a className={returnStyles.orderButton} href="https://www.ray-ban.com/global/my-orders">MY ORDERS</a></div>
        <p>An email notification will be sent to the email address used when placing the order confirming that the refund has been issued. All refunds will occur via the original payment method. Please be aware that Express Delivery costs will not be refunded. For further assistance, you can contact our Customer Care team at this link: <a href={contactUrl}>Contact us</a>, indicating your order number and which item(s) you wish to return.</p>
      </section>
      <section id="missing-goods" className={styles.section} aria-labelledby="missing-heading">
        <h2 id="missing-heading">MISSING OR DEFECTIVE GOODS</h2>
        <p>Check your order as soon as it arrives to make sure everything is as expected. If your order is incorrect or an item is missing or damaged:</p>
        <ol>
          <li>Contact our Customer Care team at this link: <a href={contactUrl}>Contact us</a>.</li>
          <li>Indicate your order number. Please consider that you must contact us within 14 days of receiving the shipment as we will not be able to accept responsibility for the item(s) after this time frame.</li>
          <li>Attach clear pictures of the incorrect or damaged item(s) received, including the SKU code of the eyewear (usually found on the inside of the left temple), the delivery note and the packaging.</li>
        </ol>
        <p>Our Customer Care team will assess the information provided and investigate further. We will get back to you as soon as possible with a resolution.</p>
      </section>
      <Feedback negativeMessage="Please use the Contact us link above for further assistance with your return." />
    </article>
  </main>;
}
