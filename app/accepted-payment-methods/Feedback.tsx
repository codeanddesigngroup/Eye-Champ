"use client";

import { useId, useState } from "react";
import styles from "./page.module.css";

export default function Feedback({ negativeMessage = "Please check checkout for the payment options available to you." }: { negativeMessage?: string }) {
  const labelId = useId();
  const [answer, setAnswer] = useState<string | null>(null);
  return <div className={styles.feedback}>
    <span id={labelId}>Was this helpful?</span>
    <div role="group" aria-labelledby={labelId} className={styles.feedbackButtons}>
      {["YES", "NO"].map(value => <button key={value} type="button" aria-pressed={answer === value} onClick={() => setAnswer(value)}>{value}</button>)}
    </div>
    <span role="status">{answer === "YES" ? "Glad this helped!" : answer === "NO" ? negativeMessage : ""}</span>
  </div>;
}
