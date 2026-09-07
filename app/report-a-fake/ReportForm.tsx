"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Info } from "lucide-react";
import styles from "./page.module.css";

export default function ReportForm() {
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [message, setMessage] = useState("");

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setFileError("");
    setFileName("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFileError("Choose a JPG, PNG or PDF file no larger than 5 MB.");
      event.currentTarget.value = "";
      return;
    }
    setFileName(file.name);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const website = String(data.get("website") ?? "").trim();
    if (!/^https?:\/\//i.test(website)) {
      setMessage("Enter a website address beginning with https:// or http://.");
      event.currentTarget.querySelector<HTMLInputElement>("#report-website")?.focus();
      return;
    }
    if (!String(data.get("description") ?? "").trim()) {
      setMessage("Please describe the website or product you want to report.");
      event.currentTarget.querySelector<HTMLTextAreaElement>("#report-description")?.focus();
      return;
    }
    if (fileError) return;
    // No reporting endpoint or CAPTCHA credentials are configured in this project.
    setMessage("Online reporting is not available yet. Your report and attachment have not been submitted. Please contact our support team for assistance.");
  }

  return <main id="top" className={styles.page}>
    <header className={styles.header}><h1>REPORT A FAKE</h1><p>Help us identify suspected counterfeit products and websites.</p></header>
    <form className={styles.form} onSubmit={submit} onReset={() => { setFileName(""); setFileError(""); setMessage(""); }}>
      <section className={styles.section} aria-labelledby="website-heading">
        <h2 id="website-heading">WEBSITE DETAILS</h2><p>Enter the website address where you found the suspected fake.</p>
        <label className={styles.lineField} htmlFor="report-website">Website address *<input id="report-website" name="website" type="url" autoComplete="url" required maxLength={2048} placeholder="https://" /></label>
      </section>
      <section className={styles.section} aria-labelledby="description-heading">
        <h2 id="description-heading">DESCRIBE THE ISSUE</h2><p>Tell us what you found and why you believe it may be counterfeit.</p>
        <label className={styles.srOnly} htmlFor="report-description">Description *</label><textarea id="report-description" name="description" required maxLength={5000} placeholder="Description *" />
      </section>
      <section className={styles.attachment} aria-labelledby="attachment-heading">
        <h2 id="attachment-heading">ATTACHMENT</h2><input className={styles.fileInput} type="file" id="report-file" name="attachment" accept="image/jpeg,image/png,application/pdf" onChange={chooseFile} aria-describedby="file-help file-error" /><label className={styles.fileButton} htmlFor="report-file">CHOOSE FILE</label>
        <p id="file-help" className={styles.hint}>{fileName || "Optional: JPG, PNG or PDF, up to 5 MB."}</p><p id="file-error" className={styles.error} role="status">{fileError}</p>
      </section>
      <section className={styles.section} aria-labelledby="email-heading">
        <h2 id="email-heading">YOUR CONTACT EMAIL</h2><p>Leave your email address if you would like to be contacted about your report.</p>
        <label className={styles.lineField} htmlFor="report-email">Email address (optional)<input id="report-email" name="email" type="email" autoComplete="email" maxLength={254} /></label>
      </section>
      <p className={styles.notice}><Info size={18} aria-hidden="true" /><span>Online reporting is not yet connected. This form does not send or store your information or attachments.</span></p>
      <div className={styles.actions}><button type="submit">SUBMIT REPORT</button><button type="reset">RESET</button></div>
      {message && <div className={styles.result}><p role="status">{message}</p><Link href="/get-support#contact-support">Contact support</Link></div>}
    </form>
  </main>;
}
