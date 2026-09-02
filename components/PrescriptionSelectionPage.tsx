"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronLeft, ClipboardPenLine, FileText, Info, Pause, Play, Upload, Volume2, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

type Panel = "prescription" | "upload" | "manual";
type LensProduct={productId?:string;name:string;frameColor:string;image:string;framePrice:number;lensColors?:string[];returnUrl?:string};
const lensColorValue=(value:string)=>({black:"#000000",brown:"#594400",green:"#105e18",blue:"#7395cf",yellow:"#fff06a",red:"#cd5050",gray:"#808080",grey:"#808080",pink:"#db86a4",purple:"#76529a",orange:"#dd7b35",clear:"#eef4f4",gold:"#b79a53",silver:"#aeb7ba"} as Record<string,string>)[value.toLowerCase()]??(/^#[0-9a-f]{6}$/i.test(value)?value:"#808080");

export default function PrescriptionSelectionPage() {
  const router = useRouter();
  const [guideOpen, setGuideOpen] = useState(true);
  const [openPanel, setOpenPanel] = useState<Panel | null>("prescription");
  const [fileName, setFileName] = useState("");
  const [prescriptionEntered, setPrescriptionEntered] = useState(false);
  const [eyesightNote, setEyesightNote] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [step, setStep] = useState<"prescription" | "lenses" | "review">("prescription");
  const [selectedLens, setSelectedLens] = useState<string | null>("basic");
  const [tintStrength, setTintStrength] = useState("dark");
  const [tintColor, setTintColor] = useState("#000000");
  const [lensConfigured, setLensConfigured] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [product,setProduct]=useState<LensProduct>({name:"Celine CL40248U",frameColor:"Black",image:"/images/product/1.avif",framePrice:15000,returnUrl:"/product"});

  useEffect(()=>{try{const saved=sessionStorage.getItem("eye-champ-lens-product");if(saved){const loaded=JSON.parse(saved) as LensProduct;setProduct(loaded);if(loaded.lensColors?.length)setTintColor(loaded.lensColors[0])}}catch{}},[]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.load();
    setPlaying(false);
    setElapsed(0);
    setAudioDuration(0);
  }, [step]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const togglePanel = (panel: Panel) => setOpenPanel(current => current === panel ? null : panel);
  const changeStep = (nextStep: "prescription" | "lenses" | "review") => {
    if (transitionLoading) return;
    setTransitionLoading(true);
    window.setTimeout(() => {
      setStep(nextStep);
      setTransitionLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  };
  const addToCart = () => {
    if (!selectedLens || transitionLoading) return;
    const lensNames = { basic: "Basic Lens", medium: "Medium lens", gradient: "Gradient lens", polarized: "Polarized Lens" } as Record<string, string>;
    const lensPrices = { basic: 1500, medium: 2500, gradient: 2500, polarized: 6500 } as Record<string, number>;
    const colorNames = { "#000000": "Black", "#594400": "Brown", "#105e18": "Green", "#7395cf": "Blue", "#fff06a": "Yellow", "#cd5050": "Red" } as Record<string, string>;
    const cart = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]") as Array<Record<string, unknown>>;
    cart.push({ id: `${product.productId??Date.now()}:${product.frameColor}:${selectedLens}:${Date.now()}`, productId:product.productId, name:product.name, frameColor:product.frameColor, image:product.image, framePrice:product.framePrice, lens: lensNames[selectedLens], lensPrice: lensPrices[selectedLens], tintStrength, tintColor, colorName: colorNames[tintColor] ?? tintColor, quantity: 1, prescription: { sphereRight: "+0.00", sphereLeft: "+0.00", cylinderRight: "+0.00", cylinderLeft: "+0.00", pd: "62" } });
    localStorage.setItem("eye-champ-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("eye-champ-cart-updated"));
    setLensConfigured(true);
    setTransitionLoading(true);
    window.setTimeout(() => router.push("/cart"), 700);
  };

  return <main className="usage-page">
    <div className="usage-topline" />
    <div className="usage-layout">
      <section className="usage-product">
        <Link href={product.returnUrl||"/product"} className="usage-back">Back to Product Page</Link>
        <div className="usage-product-image"><Image src={product.image} alt={`${product.name} ${product.frameColor}`} width={1000} height={460} priority unoptimized /></div>
        <h1>{product.name}</h1>
        <p>{product.frameColor}</p>
        <strong>Rs {Number(product.framePrice).toLocaleString()}</strong>
      </section>

      <section className="usage-form">
        <h2>Usage</h2>
        {step !== "prescription" && <button type="button" className="usage-step-back" disabled={transitionLoading} onClick={() => changeStep(step === "review" ? "lenses" : "prescription")}><ChevronLeft /> Back</button>}
        {step !== "review" && <div className="usage-audio" aria-label="Prescription guidance audio player">
          <audio ref={audioRef} src={step === "prescription" ? "/audio/audio-step-1-mp3.mp3" : "/audio/audio-step-2-mp3.mp3"} preload="metadata" onLoadedMetadata={event => setAudioDuration(event.currentTarget.duration)} onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />
          <button type="button" aria-label={playing ? "Pause guidance" : "Play guidance"} onClick={toggleAudio}>{playing ? <Pause /> : <Play />}</button>
          <span>{formatTime(elapsed)}</span>
          <input type="range" min="0" max={audioDuration || 0} step="0.1" value={elapsed} aria-label="Audio progress" onChange={event => { const nextTime = Number(event.target.value); setElapsed(nextTime); if (audioRef.current) audioRef.current.currentTime = nextTime; }} />
          <span>{formatTime(audioDuration)}</span><Volume2 />
        </div>}

        {step === "prescription" ? <><div className="usage-accordions">
          <article className={openPanel === "prescription" ? "open" : ""}>
            <button className="usage-accordion-head" type="button" onClick={() => togglePanel("prescription")}><ClipboardPenLine /><b>Prescription</b><span>{openPanel === "prescription" ? "−" : "+"}</span></button>
            {openPanel === "prescription" && <div className="usage-panel prescription-entry">
              <div className="prescription-head"><span /><b>Sphere (SPH)</b><b>Cylinder (CYL)</b><b>Axis</b><b>ADD</b></div>
              {[{ code: "OD", label: "Right eye" }, { code: "OS", label: "Left eye" }].map(eye => <div className="prescription-row" key={eye.code}>
                <b>{eye.code}<small>({eye.label})</small></b>
                <select aria-label={`${eye.label} sphere`} defaultValue="0.00" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }}><option>0.00</option><option>-0.25</option><option>-0.50</option><option>-0.75</option><option>-1.00</option><option>+0.25</option><option>+0.50</option></select>
                <select aria-label={`${eye.label} cylinder`} defaultValue="0.00" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }}><option>0.00</option><option>-0.25</option><option>-0.50</option><option>-0.75</option><option>-1.00</option></select>
                <input aria-label={`${eye.label} axis`} type="number" min="0" max="180" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }} />
                <select aria-label={`${eye.label} ADD`} defaultValue="n/a" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }}><option>n/a</option><option>+0.75</option><option>+1.00</option><option>+1.25</option><option>+1.50</option><option>+2.00</option></select>
              </div>)}
              <div className="prescription-pd">
                <b>PD<small>(Pupillary Distance)</small></b>
                <select aria-label="Pupillary distance" defaultValue="62" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }}>{Array.from({ length: 41 }, (_, index) => <option key={index}>{40 + index}</option>)}</select>
                <label><input type="checkbox" onChange={() => { setPrescriptionEntered(true); setValidationError(false); }} /> Two PD numbers</label>
              </div>
            </div>}
          </article>

          <article className={openPanel === "upload" ? "open" : ""}>
            <button className="usage-accordion-head" type="button" onClick={() => togglePanel("upload")}><Camera /><b>Upload Prescription Image</b><span>{openPanel === "upload" ? "−" : "+"}</span></button>
            {openPanel === "upload" && <div className="usage-panel"><label className={`usage-dropzone ${fileName ? "has-file" : ""}`}><input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={event => { setFileName(event.target.files?.[0]?.name ?? ""); setValidationError(false); }} />{fileName ? <><Check /><b>{fileName}</b><small>Prescription ready to upload</small></> : <><Upload /><b>Upload Prescription</b><small>Upload image max 10 MB</small></>}</label></div>}
          </article>

          <article className={openPanel === "manual" ? "open" : ""}>
            <button className="usage-accordion-head" type="button" onClick={() => togglePanel("manual")}><FileText /><b>Write Eyesight Number</b><span>{openPanel === "manual" ? "−" : "+"}</span></button>
            {openPanel === "manual" && <div className="usage-panel usage-eyesight-note"><label htmlFor="eyesight-note">Write your eyesight number</label><textarea id="eyesight-note" value={eyesightNote} onChange={event => { setEyesightNote(event.target.value); setValidationError(false); }} placeholder="Write your eyesight number here" /></div>}
          </article>
        </div>

        {validationError && <p className="usage-validation-error" role="alert">Please enter your prescription, upload an image, or write your eyesight number before continuing.</p>}
        <button type="button" className="usage-confirm" disabled={transitionLoading} onClick={() => { if (!prescriptionEntered && !fileName && !eyesightNote.trim()) { setValidationError(true); return; } setPlaying(false); setElapsed(0); changeStep("lenses"); }}>Confirm</button></> : step === "lenses" ? <div className="lens-type-list">
          {[
            { id: "basic", name: "Basic Lens", price: 1500, text: "Choose from these classic colors to make your own sunglasses in dark, medium or light tone." },
            { id: "medium", name: "Medium lens", price: 2500, text: "Choose from these cool tint or customise lens color according to your demand." },
            { id: "gradient", name: "Gradient lens", price: 2500, text: "Combine fashion with function with trendy gradient lenses that go from dark on the top to light on the bottom." },
            { id: "polarized", name: "Polarized Lens", price: 6500, text: "Polarized lenses reduce extra bright light glares and hazy vision. An option that offers superior clarity and eye protection." },
          ].map(option => <Fragment key={option.id}><button type="button" aria-expanded={selectedLens === option.id} className={`lens-type-card ${selectedLens === option.id ? "selected" : ""}`} onClick={() => { setSelectedLens(current => current === option.id ? null : option.id); setLensConfigured(false); }}>
              <span className={`lens-type-swatch ${option.id}`} aria-hidden="true" />
              <span><b>{option.name} <strong>Rs {option.price}</strong> <Info /></b><small>{option.text}</small></span>
            </button>
            <div className={`lens-customization-shell ${selectedLens === option.id ? "expanded" : ""}`} aria-hidden={selectedLens !== option.id} inert={selectedLens !== option.id ? true : undefined}><div className="lens-customization">
              <fieldset><legend>Tint Strength:</legend><div>{[{ id: "dark", label: "Dark (80%)" }, { id: "medium", label: "Medium (50%)" }, { id: "light", label: "Light (20%)" }].map(strength => <label key={strength.id}><input type="radio" name="tint-strength" checked={tintStrength === strength.id} onChange={() => { setTintStrength(strength.id); setLensConfigured(false); }} /> {strength.label}</label>)}</div></fieldset>
              <fieldset><legend>Tint Color</legend><div className="tint-swatches">{(product.lensColors?.length?product.lensColors:["#000000", "#594400", "#105e18", "#7395cf", "#fff06a", "#cd5050"]).map(color => <button type="button" title={color} aria-label={`Select tint color ${color}`} aria-pressed={tintColor === color} className={tintColor === color ? "selected" : ""} style={{ backgroundColor: lensColorValue(color) }} key={color} onClick={() => { setTintColor(color); setLensConfigured(false); }} />)}</div></fieldset>
              <div className="custom-tint"><label htmlFor={`custom-tint-${option.id}`}>Customize Color:</label><input id={`custom-tint-${option.id}`} type="color" value={lensColorValue(tintColor)} onChange={event => { setTintColor(event.target.value); setLensConfigured(false); }} /></div>
              <button type="button" className="lens-config-confirm" disabled={transitionLoading} onClick={() => { setLensConfigured(false); changeStep("review"); }}>Confirm</button>
            </div></div>
          </Fragment>)}
        </div> : <div className="lens-review">
          <small className="lens-review-type">Sunglasses</small>
          <div className="lens-review-product"><span>{product.name} | {product.frameColor}</span><b>Rs {Number(product.framePrice).toLocaleString()}</b></div>
          <h3>Your prescription</h3>
          <div className="prescription-summary" role="table" aria-label="Prescription summary">
            <div className="summary-row summary-head" role="row"><span /><b>SPH</b><b>CYL</b><b>Axis</b><b>ADD</b><b>PD</b></div>
            <div className="summary-row" role="row"><b>R</b><span>+0.00</span><span>+0.00</span><span>--</span><span>--</span><strong>62</strong></div>
            <div className="summary-row" role="row"><b>L</b><span>+0.00</span><span>+0.00</span><span>--</span><span>--</span><strong>62</strong></div>
          </div>
          <h3>Lens details</h3>
          <dl className="lens-review-details">
            <dt>{({ basic: "Basic Lens", medium: "Medium lens", gradient: "Gradient lens", polarized: "Polarized Lens" } as Record<string, string>)[selectedLens ?? ""]}</dt><dd>Rs {(({ basic: 1500, medium: 2500, gradient: 2500, polarized: 6500 } as Record<string, number>)[selectedLens ?? ""] ?? 0).toLocaleString()}</dd>
            <dt>Color</dt><dd>{({ "#000000": "Black", "#594400": "Brown", "#105e18": "Green", "#7395cf": "Blue", "#fff06a": "Yellow", "#cd5050": "Red" } as Record<string, string>)[tintColor] ?? tintColor}</dd>
            <dt>Subtotal</dt><dd>Rs {(product.framePrice + (({ basic: 1500, medium: 2500, gradient: 2500, polarized: 6500 } as Record<string, number>)[selectedLens ?? ""] ?? 0)).toLocaleString()}</dd>
          </dl>
          <div className="lens-review-note"><b>Note:</b><span>We will take 50% advance payment for this order as your lenses are custom made. Place your order our representative will contact you for further details.</span></div>
          <button type="button" className="lens-add-cart" disabled={transitionLoading} onClick={addToCart}>{lensConfigured ? <><Check /> Added to cart</> : "Confirm & add to cart"}</button>
        </div>}
      </section>
    </div>

    {step !== "review" && <footer className="usage-subtotal">Subtotal : <b>{step === "lenses" && selectedLens ? `${(product.framePrice + (({ basic: 1500, medium: 2500, gradient: 2500, polarized: 6500 } as Record<string, number>)[selectedLens] ?? 0)).toLocaleString()} (${product.framePrice.toLocaleString()}+${(({ basic: 1500, medium: 2500, gradient: 2500, polarized: 6500 } as Record<string, number>)[selectedLens] ?? 0).toLocaleString()})` : product.framePrice.toLocaleString()}</b></footer>}

    {guideOpen && <div className="usage-guide-overlay" role="presentation">
      <div className="usage-guide" role="dialog" aria-modal="true" aria-label="Audio guidance">
        <button type="button" aria-label="Close message" onClick={() => setGuideOpen(false)}><X /></button>
        <p>Please listen recorded audio <Volume2 /> which will help in Choose options.</p>
      </div>
    </div>}
    {transitionLoading && <div className="lens-loading-overlay" role="status" aria-live="polite" aria-label="Loading next step">
      <div className="lens-loading-card">
        <span className="lens-loading-spinner" aria-hidden="true" />
        <b>Loading...</b>
        <small>Please wait</small>
      </div>
    </div>}
  </main>;
}
