"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Show the campaign photography from the supplied reference using CSS image windows.
function CampaignImage({ x = 0, y, width = 664, height, alt }: { x?: number; y: number; width?: number; height: number; alt: string }) {
  return <div className={styles.image} role="img" aria-label={alt} style={{ aspectRatio: `${width}/${height}`, backgroundSize: `${664 / width * 100}% auto`, backgroundPosition: `${width === 664 ? 0 : x / (664 - width) * 100}% ${y / (2048 - height) * 100}%` }} />;
}

const stories = [
  { title: "CHANGING LIVES FOR GOOD", text: "With your help, we’ve provided over 10,000,000 glasses to those in need worldwide. When someone desperately needs a free eye exam and a pair of glasses, a clinic or a voucher is often the best way to get them their much-needed glasses.", x: 133, y: 1454, width: 398, height: 204, alt: "A OneSight volunteer helping a child at an eye care clinic" },
  { title: "A CLEARER FUTURE", text: "Access to vision care helps families see the world more clearly. Together, we can bring eye care and glasses to the communities that need them most.", x: 0, y: 543, width: 331, height: 312, alt: "A father and two children wearing glasses" },
  { title: "YOUR SUPPORT MAKES A DIFFERENCE", text: "Donations from customers help make this work possible. Please consider making a donation with your purchase the next time you visit a Ray-Ban store.", x: 332, y: 858, width: 332, height: 314, alt: "A woman wearing glasses holding her hands together in thanks" },
];

export default function OneSight() {
  const [slide, setSlide] = useState(0);
  const previous = (slide + stories.length - 1) % stories.length;
  const next = (slide + 1) % stories.length;
  const story = stories[slide];

  return <main id="top" className={styles.page}>
    <header className={styles.hero}>
      <CampaignImage y={63} height={314} alt="World Sight Day: The Right to See by Steve McCurry. Two children's portraits and the OneSight EssilorLuxottica Foundation logo." />
      <h1 className={styles.srOnly}>OneSight — World Sight Day: The Right to See</h1>
    </header>

    <section className={styles.stats} aria-label="OneSight impact">
      <div><strong>961 Million</strong><span>people with access to vision care</span></div>
      <div><strong>84 Million</strong><span>people equipped with eyeglasses</span></div>
      <div><strong>33 Thousand</strong><span>optical points created in rural communities</span></div>
    </section>
    <h2 className={styles.madePossible}>ALL MADE POSSIBLE BY YOU</h2>

    <section className={styles.storyRow} aria-label="Making vision care accessible">
      <CampaignImage x={0} y={543} width={331} height={312} alt="A father and two children wearing glasses, smiling together" />
      <div className={styles.copy}><p>Uncorrected poor vision affects 1 in 3 people around the world. 90% of these people live in developing communities where there is limited access to vision care and awareness of vision issues. That&apos;s why we work with the OneSight EssilorLuxottica Foundation to create sustainable access to vision care, provide free eye exams and glasses for those most in need, fund local vision care programs and raise awareness of poor vision among policy makers and at a community level.</p></div>
    </section>
    <section className={`${styles.storyRow} ${styles.reverse}`} aria-label="The difference your donation makes">
      <div className={styles.copy}><p>Donations from our customers make this work possible—we can&apos;t do it without people like you. Please consider making a donation with your purchase the next time you visit a Ray-Ban store.</p></div>
      <CampaignImage x={332} y={858} width={332} height={314} alt="A woman wearing glasses and a colorful head covering, holding her hands together" />
    </section>

    <section className={styles.give} aria-labelledby="give-heading">
      <h2 id="give-heading">GIVE SIGHT</h2>
      <div className={styles.stats}>
        <div><strong>$10 =</strong><span>a pair of glasses</span></div>
        <div><strong>$20 =</strong><span>an eye exam</span></div>
        <div><strong>$30 =</strong><span>an eye exam and glasses</span></div>
      </div>
    </section>
    <section className={styles.callout}>
      <h2>TOGETHER WE CAN ELIMINATE UNCORRECTED POOR VISION IN A<br className={styles.desktopBreak} /> GENERATION.</h2>
      <a href="https://www.onesight.essilorluxottica.com/" target="_blank" rel="noopener noreferrer">LEARN MORE ABOUT ONESIGHT ESSILORLUXOTTICA FOUNDATION<span className={styles.srOnly}> (opens in a new tab)</span></a>
    </section>

    <section className={styles.carousel} aria-label="OneSight stories" aria-roledescription="carousel">
      <div className={styles.carouselImages}>
        <div className={styles.preview} aria-hidden="true"><CampaignImage {...stories[previous]} /></div>
        <div className={styles.activeImage} key={slide} role="group" aria-roledescription="slide" aria-label={`${slide + 1} of ${stories.length}`}><CampaignImage {...story} /></div>
        <div className={styles.preview} aria-hidden="true"><CampaignImage {...stories[next]} /></div>
        <button type="button" className={styles.previous} onClick={() => setSlide(previous)} aria-label="Previous OneSight story">PREV.</button>
        <button type="button" className={styles.next} onClick={() => setSlide(next)} aria-label="Next OneSight story">NEXT</button>
      </div>
      <div className={styles.caption} aria-live="polite" aria-atomic="true"><h2>{story.title}</h2><p>{story.text}</p></div>
      <div className={styles.dots} role="group" aria-label="Choose a OneSight story">{stories.map((item, index) => <button type="button" key={item.title} aria-label={item.title} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
    </section>
  </main>;
}
