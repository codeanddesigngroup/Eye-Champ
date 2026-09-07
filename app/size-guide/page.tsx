import type { Metadata } from "next";
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
  { title: "TAKE A CREDIT CARD", description: "Get a credit, debit or loyalty card.", x: 0, alt: "A standard card held vertically." },
  { title: "STAND IN FRONT OF A MIRROR", description: "Hold the card steady and align one edge with the center of your nose.", x: 247, alt: "A person aligning a vertical card with the center of their nose." },
  { title: "CHECK THE CARD POSITION", description: "See where the opposite edge of the card lines up with your eye to find your fit.", x: 494, alt: "Card edge positions compared with the eye: B outside, A at the edge, C inside." },
];

export default function SizeGuidePage() {
  return <main id="top" className={styles.guide}>
    <header className={styles.intro}>
      <h1>SIZE AND FIT GUIDE</h1>
      <p>Choosing the right eyewear can be a complex process. This guide will help you find your best match.<br />All eyewear has different functional and aesthetic characteristics, so we use three pieces of information to determine the following:</p>
      <nav className={styles.sectionNav} aria-label="Size guide sections">
        <a href="#frame-size"><Glasses aria-hidden="true" /><span>SIZE</span></a>
        <a href="#face-coverage"><ScanFace aria-hidden="true" /><span>FACE COVERAGE</span></a>
        <a href="#bridge-nosepads"><PersonStanding aria-hidden="true" /><span>BRIDGE AND NOSEPADS</span></a>
      </nav>
    </header>

    <section id="frame-size" className={styles.section}>
      <div className={styles.copy}><h2>WHAT IS FRAME SIZE?</h2>
        <p>Frame size is defined by lens and bridge width. These values are always displayed in that order, in millimeters. If you wear glasses, you&apos;ve likely noticed some numbers on the temple and wondered what they mean. These numbers indicate the <strong>lens and bridge width</strong>, which determine the frame size.</p>
      </div>
      <div className={styles.wideIllustration}><Illustration y={310} height={196} alt="Frame measurements: lens width across one lens and bridge width between the lenses. The temple marking 55 square 22 indicates a 55 mm lens and 22 mm bridge." /></div>
    </section>

    <section className={styles.section}>
      <div className={styles.copy}><h2>MEASURE YOUR FACE WIDTH</h2><p>If you don&apos;t already own a pair of glasses with measurements, you can measure your face using a card.</p></div>
      <div className={styles.grid}>{steps.map((step, index) => <figure key={step.title}>
        <Illustration x={step.x} y={610} width={244} height={189} alt={step.alt} />
        <figcaption><h3>STEP {index + 1}<br />{step.title}</h3><p>{step.description}</p></figcaption>
      </figure>)}</div>
      <p className={styles.cardTip}>If the card reaches beyond your eye, try a petite fit. If it aligns with the outer edge, try standard. If it falls inside the outer edge, try generous.</p>
    </section>

    <section id="face-coverage" className={styles.section}>
      <div className={styles.copy}><h2>WHAT IS FACE COVERAGE?</h2><p>Face coverage is aesthetic information which determines how much of the face is covered by each given size.</p></div>
      <div className={styles.grid}>{["PETITE", "STANDARD", "GENEROUS"].map((fit, index) => <figure key={fit}>
        <Illustration x={[0, 247, 494][index]} y={965} width={244} height={188} alt={`${fit.toLowerCase()} sunglasses coverage shown on the same face for comparison.`} />
        <figcaption><h3>{fit}</h3></figcaption>
      </figure>)}</div>
      <div className={styles.details}><p>There are three different fits available to choose from. These are unrelated to size and instead refer to lens width.</p><p>The three possible fittings are:</p>
        <ul><li><strong>Petite:</strong> a small lens front for those who prefer to cover a smaller portion of the face.</li><li><strong>Standard:</strong> a medium lens front designed for those who prefer to cover an average portion of the face.</li><li><strong>Generous:</strong> a larger lens front designed for those who prefer to cover a greater portion of the face.</li></ul>
      </div>
    </section>

    <section id="bridge-nosepads" className={styles.section}>
      <div className={styles.copy}><h2>WHAT ARE THE BRIDGE AND NOSEPADS?</h2><p>This functional information describes the different types of the bridge and the nosepads.</p></div>
      <div className={styles.wideIllustration}><Illustration y={1400} height={215} alt="Close-up illustrations of a molded frame bridge and adjustable nosepads, with the nose contact areas outlined in red." /></div>
      <div className={styles.details}><p>The four possible bridge and nosepads options are:</p>
        <ul><li><strong>High bridge fit:</strong> offers a more secure and comfortable fit for those with a high nose bridge and lower cheekbones. A good choice if the bridge of your nose is above the level of your pupils.</li><li><strong>Low bridge fit:</strong> offers a more secure and comfortable fit for those with a low nose bridge and higher cheekbones. A good choice if eyewear tends to slide down your nose, sit too low, or press on your temples or cheeks.</li><li><strong>Universal fit:</strong> this option accommodates most face shapes.</li><li><strong>Adjustable nosepads:</strong> nosepads that can be widened or narrowed to fit your unique nose shape.</li></ul>
      </div>
    </section>
  </main>;
}
