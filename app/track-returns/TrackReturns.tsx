"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./page.module.css";

export default function TrackReturns() {
  const [message, setMessage] = useState("");

  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!String(data.get("orderNumber") ?? "").trim()) {
      setMessage("Please enter your order number.");
      event.currentTarget.querySelector<HTMLInputElement>("#order-number")?.focus();
      return;
    }
    // The existing backend has no customer return lookup endpoint.
    setMessage("Online return tracking is not available yet. Please contact customer service for your return status. Your details have not been submitted.");
  }

  return <main id="top" className={styles.page}>
    <div className={styles.content}>
      <h1>TRACK MY RETURN</h1>
      <p className={styles.intro}>Please enter your order number and the email address you used at checkout &mdash; we&apos;ll email you the latest status.</p>
      <p className={styles.account}><button type="button" onClick={() => setMessage("Customer sign-in and order history are not available yet. Please contact customer service for assistance.")}>Sign in</button> to view your full order history.</p>
      <form className={styles.form} onSubmit={track}>
        <label htmlFor="order-number">Order number*<input id="order-number" name="orderNumber" type="text" required maxLength={100} autoComplete="off" spellCheck={false} /></label>
        <label htmlFor="return-email">E-mail address*<input id="return-email" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <button type="submit" className={styles.submit}>SUBMIT</button>
      </form>
      {message && <div className={styles.message}><p role="status">{message}</p><Link href="/get-support#contact-support">Contact customer service</Link></div>}
    </div>
  </main>;
}
