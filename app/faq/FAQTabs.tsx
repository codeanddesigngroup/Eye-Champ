"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import styles from "./page.module.css";

type Category = {
  title: string;
  questions: { question: string; answer: string; href?: string; label?: string }[];
};

export default function FAQTabs({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const available = categories.flatMap((category, i) => category.questions.length ? [i] : []);
    const position = available.indexOf(index);
    let next = index;
    if (event.key === "ArrowRight") next = available[(position + 1) % available.length];
    else if (event.key === "ArrowLeft") next = available[(position - 1 + available.length) % available.length];
    else if (event.key === "Home") next = available[0];
    else if (event.key === "End") next = available[available.length - 1];
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return <div className={styles.categories}>
    <div className={styles.tabs} role="tablist" aria-label="FAQ categories">
      {categories.map((category, index) => <button
        key={category.title} ref={element => { tabs.current[index] = element; }}
        type="button" disabled={!category.questions.length} role="tab" id={`faq-tab-${index}`}
        aria-selected={active === index} aria-controls={`faq-panel-${index}`}
        tabIndex={active === index ? 0 : -1}
        onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}
      >{category.title}</button>)}
    </div>
    {categories.map((category, index) => <div key={category.title}
      role="tabpanel" id={`faq-panel-${index}`} aria-labelledby={`faq-tab-${index}`}
      hidden={active !== index} tabIndex={0} className={styles.panel}
    >
      {category.questions.map(item => <details className={styles.category} key={item.question}>
        <summary>{item.question}<ChevronDown size={18} aria-hidden="true" /></summary>
        <div className={styles.answers}><p>{item.answer}</p>{item.href && item.label && <Link href={item.href}>{item.label}</Link>}</div>
      </details>)}
    </div>)}
  </div>;
}
