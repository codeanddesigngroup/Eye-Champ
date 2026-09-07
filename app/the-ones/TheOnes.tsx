"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

function ReferenceArt({ x = 0, y, width = 951, height, alt }: { x?: number; y: number; width?: number; height: number; alt: string }) {
  return <div className={styles.art} role="img" aria-label={alt} style={{ aspectRatio: `${width}/${height}`, backgroundSize: `${951 / width * 100}% auto`, backgroundPosition: `${width === 951 ? 0 : x / (951 - width) * 100}% ${y / (2048 - height) * 100}%` }} />;
}

const events = [
  { title: "HEXAGONAL RAY-BAN LIMITED", text: "This limited edition ripped up the rulebook with a special black and gold colorway for The Ones. With just 600 pairs available, this rebel style has been and gone. Sign up to be there for the next drop.", color: "#68402d" },
  { title: "A WAY OF LIVING RAY-BAN", text: "A community for original points of view. Discover The Ones and be there for the next happening.", color: "#394c4e" },
  { title: "FIND YOUR NEXT ORIGINAL", text: "Explore the eyewear collection and discover a style to make your own.", color: "#34343c" },
];

export default function TheOnes() {
  const [slide, setSlide] = useState(0);
  const [message, setMessage] = useState("");
  const year = new Date().getFullYear();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const day = Number(form.get("day"));
    const month = Number(form.get("month"));
    const birthYear = Number(form.get("year"));
    const date = new Date(birthYear, month - 1, day);
    if (date.getFullYear() !== birthYear || date.getMonth() !== month - 1 || date.getDate() !== day || date > new Date()) {
      setMessage("Please enter a valid date of birth.");
      return;
    }
    // No membership endpoint is configured; never imply that data was submitted.
    setMessage("Online registration is not available yet. Your information has not been submitted.");
  }

  return <main id="top" className={styles.page}>
    <section className={styles.hero} aria-labelledby="ones-heading">
      <ReferenceArt y={91} height={430} alt="The Ones campaign: two people wearing Ray-Ban eyewear at an evening event. More than a club, a way of living Ray-Ban." />
      <h1 id="ones-heading" className={styles.srOnly}>The Ones — More than a club, a way of living Ray-Ban.</h1>
      <a href="#join-the-ones" className={styles.heroButton}>SIGN UP NOW</a>
    </section>
    <section className={styles.intro} aria-labelledby="events-heading"><h2 id="events-heading">GONE BUT NEVER FORGOTTEN</h2><p>Check out The Ones past events and make sure you&apos;re with us for the next one.</p></section>
    <section className={styles.carousel} aria-label="The Ones highlights" aria-roledescription="carousel" style={{ backgroundColor: events[slide].color }}>
      <div className={styles.sideCard} aria-hidden="true" />
      <article key={slide} className={styles.event} aria-roledescription="slide" aria-label={`${slide + 1} of ${events.length}`}>
        <div className={styles.eventImage}>
          {slide === 0 ? <ReferenceArt x={112} y={696} width={727} height={214} alt="Limited edition black and gold hexagonal sunglasses" /> : slide === 1 ? <ReferenceArt x={640} y={92} width={310} height={280} alt="The Ones evening campaign" /> : <Image src="/images/brand-banners/ray-ban.webp" alt="Ray-Ban eyewear collection" fill sizes="80vw" />}
        </div>
        <div className={styles.eventCopy} aria-live="polite"><h2>{events[slide].title}</h2><p>{events[slide].text}</p>{slide === 2 && <Link href="/sunglasses/all">SHOP THE COLLECTION</Link>}</div>
      </article>
      <div className={`${styles.sideCard} ${styles.sideRight}`} aria-hidden="true" />
      <button className={styles.previous} onClick={() => setSlide((slide + events.length - 1) % events.length)} aria-label="Previous highlight">PREV.</button>
      <button className={styles.next} onClick={() => setSlide((slide + 1) % events.length)} aria-label="Next highlight">NEXT</button>
      <div className={styles.dots} role="group" aria-label="Choose a highlight">{events.map((item, index) => <button key={item.title} aria-label={item.title} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
    </section>
    <section id="join-the-ones" className={styles.signup} aria-labelledby="signup-heading">
      <header><h2 id="signup-heading">BE THERE AT THE NEXT HAPPENING. SIGN UP TO THE ONES.</h2><p>If you&apos;re signing up for the first time, you can claim an exclusive welcome reward.<br />And that&apos;s not all. As a member of The Ones, you&apos;ll have reserved access to events,<br />pre-releases and limited edition collections all year round.</p><p>Fill in the form below to unlock all the privileges.</p></header>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.lineField}>First Name *<input name="firstName" autoComplete="given-name" required maxLength={100} /></label>
        <label className={styles.lineField}>Last Name<input name="lastName" autoComplete="family-name" maxLength={100} /></label>
        <fieldset className={styles.birth}><legend>Date of birth *</legend><div><label><span className={styles.srOnly}>Day</span><select name="day" autoComplete="bday-day" defaultValue="" required><option value="" disabled>DD</option>{Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label><label><span className={styles.srOnly}>Month</span><select name="month" autoComplete="bday-month" defaultValue="" required><option value="" disabled>MM</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label><label><span className={styles.srOnly}>Year</span><select name="year" autoComplete="bday-year" defaultValue="" required><option value="" disabled>YYYY</option>{Array.from({ length: 121 }, (_, i) => <option key={i} value={year - i}>{year - i}</option>)}</select></label></div></fieldset>
        <label className={styles.lineField}>Email address *<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <fieldset className={styles.gender}><legend>Gender - optional</legend>{["Male", "Female", "Prefer not to say"].map(value => <label key={value}><input type="radio" name="gender" value={value} />{value.toUpperCase()}</label>)}</fieldset>
        <label className={styles.consent}><input type="checkbox" name="consent" required /><span>I agree to the transfer of data abroad for marketing purposes as outlined in the dedicated section of the <a href="#privacy-information">Privacy Policy</a>.*</span></label>
        <p id="privacy-information" className={styles.privacy}>By entering your email and proceeding, you confirm that you are of legal age under the laws of your own country and consent to receive marketing communications. Online registration is not yet connected; this form does not send or store your personal information.</p>
        <button className={styles.submit} type="submit">SUBMIT</button>
        <p className={styles.message} role="status">{message}</p>
      </form>
    </section>
  </main>;
}
