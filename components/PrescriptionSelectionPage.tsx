"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronLeft, ClipboardPenLine, FileText, Info, Pause, Play, Upload, Volume2, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

type Panel = "prescription" | "upload" | "manual";
type LensProduct={productId?:string;name:string;frameColor:string;image:string;framePrice:number;lensColors?:string[];returnUrl?:string};
type EyePrescription={sph:string;cyl:string;axis:string;add:string};
type Prescription={right:EyePrescription;left:EyePrescription;pd:string;twoPd:boolean;pdRight:string;pdLeft:string};
const lensColorValue=(value:string)=>({black:"#000000",brown:"#594400",green:"#105e18",blue:"#7395cf",yellow:"#fff06a",red:"#cd5050",gray:"#808080",grey:"#808080",pink:"#db86a4",purple:"#76529a",orange:"#dd7b35",clear:"#eef4f4",gold:"#b79a53",silver:"#aeb7ba"} as Record<string,string>)[value.toLowerCase()]??(/^#[0-9a-f]{6}$/i.test(value)?value:"#808080");

export default function PrescriptionSelectionPage() {
  const router = useRouter();
  const [guideOpen, setGuideOpen] = useState(true);
  const [openPanel, setOpenPanel] = useState<Panel | null>("prescription");
  const [fileName, setFileName] = useState("");
  const [prescriptionEntered, setPrescriptionEntered] = useState(false);
  const [prescription,setPrescription]=useState<Prescription>({right:{sph:"0.00",cyl:"0.00",axis:"",add:"n/a"},left:{sph:"0.00",cyl:"0.00",axis:"",add:"n/a"},pd:"62",twoPd:false,pdRight:"31",pdLeft:"31"});
  const [eyesightNote, setEyesightNote] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [step, setStep] = useState<"prescription" | "lenses" | "review">("prescription");
  const [selectedLens, setSelectedLens] = useState<string | null>("basic");
  const [tintColor, setTintColor] = useState("#000000");
  const [lensConfigured, setLensConfigured] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [product,setProduct]=useState<LensProduct>({name:"Celine CL40248U",frameColor:"Black",image:"/images/product/1.avif",framePrice:15000,returnUrl:"/product"});

  useEffect(()=>{queueMicrotask(()=>{try{const saved=sessionStorage.getItem("eye-champ-lens-product");if(saved){const loaded=JSON.parse(saved) as LensProduct;setProduct(loaded);if(loaded.lensColors?.length)setTintColor(loaded.lensColors[0])}}catch{}})},[]);

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
  const updateEye=(eye:"right"|"left",field:keyof EyePrescription,value:string)=>{setPrescription(current=>({...current,[eye]:{...current[eye],[field]:value}}));setPrescriptionEntered(true);setValidationError(false)};
  const showPower=(value:string)=>value==="0.00"?"+0.00":value;
  const showOptional=(value:string)=>!value||value==="n/a"?"--":value;
  const lensPreviewStyle=undefined;
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
    cart.push({ id: `${product.productId??Date.now()}:${product.frameColor}:${selectedLens}:${Date.now()}`, productId:product.productId, name:product.name, frameColor:product.frameColor, image:product.image, framePrice:product.framePrice, lens: lensNames[selectedLens], lensPrice: lensPrices[selectedLens], tintColor, colorName: colorNames[tintColor] ?? tintColor, quantity: 1, prescription });
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
        <div className="usage-product-image"><div className="lens-preview-stage"><Image src={product.image} alt={`${product.name} ${product.frameColor}`} width={1000} height={460} priority unoptimized />{step!=="prescription"&&selectedLens&&<svg className={`live-lens-tint ${selectedLens}`} style={lensPreviewStyle} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="live-tint-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--lens-tint)" stopOpacity="0.88"/><stop offset="0.46" stopColor="var(--lens-tint)"/><stop offset="1" stopColor="var(--lens-tint)" stopOpacity="0.82"/></linearGradient><linearGradient id="live-tint-shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.24"/><stop offset="0.22" stopColor="#fff" stopOpacity="0.07"/><stop offset="0.5" stopColor="#fff" stopOpacity="0"/></linearGradient></defs><path className="lens-fill left" d="M14.2 17 C18.5 8.5 37.5 7.5 43.8 15.5 C46 18.5 46.5 23 46.2 29 L44.8 65 C44.3 79 38.4 88 27.8 88.7 C18.5 89.2 13.4 83.5 12.2 72 L10.7 31 C10.4 24 11.5 20 14.2 17 Z"/><path className="lens-fill right" d="M85.8 17 C81.5 8.5 62.5 7.5 56.2 15.5 C54 18.5 53.5 23 53.8 29 L55.2 65 C55.7 79 61.6 88 72.2 88.7 C81.5 89.2 86.6 83.5 87.8 72 L89.3 31 C89.6 24 88.5 20 85.8 17 Z"/><path className="lens-shine left" d="M14.2 17 C18.5 8.5 37.5 7.5 43.8 15.5 C46 18.5 46.5 23 46.2 29 L44.8 65 C44.3 79 38.4 88 27.8 88.7 C18.5 89.2 13.4 83.5 12.2 72 L10.7 31 C10.4 24 11.5 20 14.2 17 Z"/><path className="lens-shine right" d="M85.8 17 C81.5 8.5 62.5 7.5 56.2 15.5 C54 18.5 53.5 23 53.8 29 L55.2 65 C55.7 79 61.6 88 72.2 88.7 C81.5 89.2 86.6 83.5 87.8 72 L89.3 31 C89.6 24 88.5 20 85.8 17 Z"/></svg>}</div></div>
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
              {[{ code: "OD", label: "Right eye",key:"right" as const }, { code: "OS", label: "Left eye",key:"left" as const }].map(eye => <div className="prescription-row" key={eye.code}>
                <b>{eye.code}<small>({eye.label})</small></b>
                <select aria-label={`${eye.label} sphere`} value={prescription[eye.key].sph} onChange={event=>updateEye(eye.key,"sph",event.target.value)}><option>0.00</option><option>-0.25</option><option>-0.50</option><option>-0.75</option><option>-1.00</option><option>+0.25</option><option>+0.50</option></select>
                <select aria-label={`${eye.label} cylinder`} value={prescription[eye.key].cyl} onChange={event=>updateEye(eye.key,"cyl",event.target.value)}><option>0.00</option><option>-0.25</option><option>-0.50</option><option>-0.75</option><option>-1.00</option></select>
                <input aria-label={`${eye.label} axis`} type="number" min="0" max="180" value={prescription[eye.key].axis} onChange={event=>updateEye(eye.key,"axis",event.target.value)} />
                <select aria-label={`${eye.label} ADD`} value={prescription[eye.key].add} onChange={event=>updateEye(eye.key,"add",event.target.value)}><option>n/a</option><option>+0.75</option><option>+1.00</option><option>+1.25</option><option>+1.50</option><option>+2.00</option></select>
              </div>)}
              <div className="prescription-pd">
                <b>PD<small>(Pupillary Distance)</small></b>
                {prescription.twoPd?<div className="prescription-dual-pd"><select aria-label="Right eye pupillary distance" value={prescription.pdRight} onChange={event=>{setPrescription(current=>({...current,pdRight:event.target.value}));setPrescriptionEntered(true)}}>{Array.from({length:21},(_,index)=><option key={index}>{20+index}</option>)}</select><select aria-label="Left eye pupillary distance" value={prescription.pdLeft} onChange={event=>{setPrescription(current=>({...current,pdLeft:event.target.value}));setPrescriptionEntered(true)}}>{Array.from({length:21},(_,index)=><option key={index}>{20+index}</option>)}</select></div>:<select aria-label="Pupillary distance" value={prescription.pd} onChange={event=>{setPrescription(current=>({...current,pd:event.target.value}));setPrescriptionEntered(true);setValidationError(false)}}>{Array.from({ length: 41 }, (_, index) => <option key={index}>{40 + index}</option>)}</select>}
                <label><input type="checkbox" checked={prescription.twoPd} onChange={event=>{setPrescription(current=>({...current,twoPd:event.target.checked}));setPrescriptionEntered(true);setValidationError(false)}} /> Two PD numbers</label>
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
            { id: "basic", name: "Basic Lens", price: 1500, text: "A classic tinted lens designed for comfortable everyday use." },
            { id: "medium", name: "Medium lens", price: 2500, text: "A comfortable upgraded lens for daily sun protection." },
            { id: "gradient", name: "Gradient lens", price: 2500, text: "Combine fashion with function with trendy gradient lenses that go from dark on the top to light on the bottom." },
            { id: "polarized", name: "Polarized Lens", price: 6500, text: "Polarized lenses reduce extra bright light glares and hazy vision. An option that offers superior clarity and eye protection." },
          ].map(option => <Fragment key={option.id}><button type="button" aria-expanded={selectedLens === option.id} className={`lens-type-card ${selectedLens === option.id ? "selected" : ""}`} onClick={() => { setSelectedLens(current => current === option.id ? null : option.id); setLensConfigured(false); }}>
              <span className={`lens-type-swatch ${option.id}`} aria-hidden="true" />
              <span><b>{option.name} <strong>Rs {option.price}</strong> <Info /></b><small>{option.text}</small></span>
            </button>
            <div className={`lens-customization-shell ${selectedLens === option.id ? "expanded" : ""}`} aria-hidden={selectedLens !== option.id} inert={selectedLens !== option.id ? true : undefined}><div className="lens-customization">
              <fieldset><legend>Tint Color</legend><div className="tint-swatches">{(product.lensColors?.length?product.lensColors:["#000000", "#594400", "#105e18", "#7395cf", "#fff06a", "#cd5050"]).map(color => <button type="button" title={color} aria-label={`Select tint color ${color}`} aria-pressed={tintColor === color} className={tintColor === color ? "selected" : ""} style={{ backgroundColor: lensColorValue(color) }} key={color} onClick={() => { setTintColor(color); setLensConfigured(false); }} />)}</div></fieldset>
              <button type="button" className="lens-config-confirm" disabled={transitionLoading} onClick={() => { setLensConfigured(false); changeStep("review"); }}>Confirm</button>
            </div></div>
          </Fragment>)}
        </div> : <div className="lens-review">
          <small className="lens-review-type">Sunglasses</small>
          <div className="lens-review-product"><span>{product.name} | {product.frameColor}</span><b>Rs {Number(product.framePrice).toLocaleString()}</b></div>
          <h3>Your prescription</h3>
          <div className="prescription-summary" role="table" aria-label="Prescription summary">
            <div className="summary-row summary-head" role="row"><span /><b>SPH</b><b>CYL</b><b>Axis</b><b>ADD</b><b>PD</b></div>
            <div className="summary-row" role="row"><b>R</b><span>{showPower(prescription.right.sph)}</span><span>{showPower(prescription.right.cyl)}</span><span>{showOptional(prescription.right.axis)}</span><span>{showOptional(prescription.right.add)}</span><strong>{prescription.twoPd?prescription.pdRight:prescription.pd}</strong></div>
            <div className="summary-row" role="row"><b>L</b><span>{showPower(prescription.left.sph)}</span><span>{showPower(prescription.left.cyl)}</span><span>{showOptional(prescription.left.axis)}</span><span>{showOptional(prescription.left.add)}</span><strong>{prescription.twoPd?prescription.pdLeft:prescription.pd}</strong></div>
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
