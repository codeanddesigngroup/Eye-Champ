import type { Metadata } from "next";
import Image from "next/image";
import fitPetite from "@/public/images/size-guide/fit-petite.jpg";
import fitStandard from "@/public/images/size-guide/fit-standard.jpg";
import fitGenerous from "@/public/images/size-guide/fit-generous.jpg";
import faceWidth1 from "@/public/images/size-guide/face-width-1.avif";
import faceWidth2 from "@/public/images/size-guide/face-width-2.avif";
import faceWidth3 from "@/public/images/size-guide/face-width-3.avif";
import { Glasses, ScanFace, PersonStanding } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Size Guide | Eye Champ",
  description: "Find your eyewear fit with our guide to frame size, face coverage, bridges and nosepads.",
};

// Display only the illustration regions of the supplied reference; all copy is live text.
function Illustration({ x = 0, y, width = 738, height, alt }: {
  x?: number; y: number; width?: number; height: number; alt: string;
}) {
  return <div role="img" aria-label={alt} className={styles.illustration} style={{
    aspectRatio: `${width} / ${height}`,
    backgroundSize: `${738 / width * 100}% auto`,
    backgroundPosition: `${width === 738 ? 0 : x / (738 - width) * 100}% ${y / (2048 - height) * 100}%`,
  }} />;
}

const steps = [
  { title: "GRAB A CARD", description: "Any standard-sized card works: credit, debit, or a loyalty card from your wallet.", image: faceWidth1, alt: "A standard card held vertically." },
  { title: "FACE A MIRROR", description: "Hold the card upright and line one edge with the centre of your nose.", image: faceWidth2, alt: "A person aligning a vertical card with the center of their nose." },
  { title: "READ THE RESULT", description: "Check where the card's far edge falls next to your eye to find your fit.", image: faceWidth3, alt: "Card edge positions compared with the eye: B outside, A at the edge, C inside." },
];

export default function SizeGuidePage() {
  return <main id="top" className={styles.guide}>
    <header className={styles.intro}>
      <h1>SIZE AND FIT GUIDE</h1>
      <p>Finding eyewear that actually fits shouldn&apos;t be guesswork. This guide breaks it down using three simple measurements, so you can shop with confidence.</p>
      <nav className={styles.sectionNav} aria-label="Size guide sections">
        <a href="#frame-size"><Glasses aria-hidden="true" /><span>SIZE</span></a>
        <a href="#face-coverage"><ScanFace aria-hidden="true" /><span>FACE COVERAGE</span></a>
        <a href="#bridge-nosepads"><PersonStanding aria-hidden="true" /><span>BRIDGE AND NOSEPADS</span></a>
      </nav>
    </header>

    <section id="frame-size" className={styles.section}>
      <div className={styles.copy}><h2>WHAT IS FRAME SIZE?</h2>
        <p>Frame size comes down to two numbers &mdash; lens width and bridge width, in millimetres, always in that order. If you&apos;ve ever checked the inside of your temple arm and wondered what those tiny numbers meant, that&apos;s exactly what they are.</p>
      </div>
      <div className={styles.wideIllustration}>
        <img src="/images/en-us.avif" alt="" />
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.copy}><h2>MEASURE YOUR FACE WIDTH</h2><p>Don&apos;t have a pair with measurements already? You can measure your face using a card instead.</p></div>
      <div className={styles.grid}>{steps.map((step, index) => <figure key={step.title}>
        <Image src={step.image} alt={step.alt} className={styles.stepImage} sizes="(max-width: 600px) 100vw, (max-width: 1680px) 33vw, 560px" />
        <figcaption><h3>STEP {index + 1}<br />{step.title}</h3><p>{step.description}</p></figcaption>
      </figure>)}</div>
      <p className={styles.cardTip}>Card extends past your eye &rarr; try petite. Lines up with the outer edge &rarr; try standard. Falls short of it &rarr; try generous.</p>
    </section>

    <section id="face-coverage" className={styles.section}>
      <div className={styles.copy}><h2>WHAT IS FACE COVERAGE?</h2><p>Face coverage is purely about look &mdash; how much of your face a frame covers, independent of fit.</p></div>
      <div className={styles.grid}>{["PETITE", "STANDARD", "GENEROUS"].map((fit, index) => <figure key={fit}>
        <Image src={[fitPetite, fitStandard, fitGenerous][index]} alt={`${fit.toLowerCase()} sunglasses coverage shown on the same face for comparison.`} className={styles.stepImage} sizes="(max-width: 600px) 100vw, (max-width: 1680px) 33vw, 560px" />
        <figcaption><h3>{fit}</h3></figcaption>
      </figure>)}</div>
      <div className={styles.details}><p>Three coverage options are available, separate from frame size &mdash; they&apos;re purely about lens width:</p>
        <ul><li><strong>Petite:</strong> a narrower lens front for a more minimal look.</li><li><strong>Standard:</strong> a mid-width lens front that suits most faces.</li><li><strong>Generous:</strong> a wider lens front for fuller face coverage.</li></ul>
      </div>
    </section>

    <section id="bridge-nosepads" className={styles.section}>
      <div className={styles.copy}><h2>WHAT ARE THE BRIDGE AND NOSEPADS?</h2><p>This covers how a frame actually sits on your nose. Four options are available:</p></div>
      <div className={styles.wideIllustration}>
        <img src="/images/bridge-nose-d.avif" alt="" />
      </div>
      <div className={styles.details}>
        <ul><li><strong>High bridge fit:</strong> built for a higher nose bridge and lower cheekbones &mdash; a good match if your nose bridge sits above your pupils.</li><li><strong>Low bridge fit:</strong> built for a lower nose bridge and higher cheekbones &mdash; a good match if glasses usually slide down, sit too low, or dig into your temples or cheeks.</li><li><strong>Universal fit:</strong> works comfortably across most face shapes.</li><li><strong>Adjustable nosepads:</strong> pads you can widen or narrow to match your nose shape exactly.</li></ul>
      </div>
    </section>
  </main>;
}
