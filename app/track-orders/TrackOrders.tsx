"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./page.module.css";

export default function TrackOrders() {
  const [message, setMessage] = useState("");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!String(data.get("orderNumber") ?? "").trim()) {
      setMessage("Please enter your order number.");
      event.currentTarget.querySelector<HTMLInputElement>("#order-number")?.focus();
      return;
    }
    // Customer order lookup is not implemented in the existing backend.
    setMessage("Online order tracking is not available yet. Please contact customer service for your order status. Your details have not been submitted.");
  }

  return <main id="top" className={styles.page}>
    <div className={styles.content}>
      <h1>MANAGE MY ORDER</h1>
      <p className={styles.intro}>Enter your order number and the e-mail address used during the checkout process to access your order details.</p>
      <form className={styles.form} onSubmit={search}>
        <label htmlFor="order-number">Order number*<input id="order-number" name="orderNumber" type="text" required maxLength={100} autoComplete="off" spellCheck={false} /></label>
        <label htmlFor="order-email">E-mail address*<input id="order-email" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <button type="submit" className={styles.search}>SEARCH</button>
      </form>
      <div className={styles.assistance}>
        <p><button className={styles.signIn} type="button" onClick={() => setMessage("Customer sign-in and order history are not available yet. Please contact customer service for help with your order.")}>Sign in</button> to view your full order history.</p>
        <p>For additional information regarding order status please contact Customer Service via the dedicated support page: <Link href="/get-support#contact-support">contact us</Link></p>
      </div>
      <p className={styles.status} role="status">{message}</p>
    </div>
  </main>;
}
