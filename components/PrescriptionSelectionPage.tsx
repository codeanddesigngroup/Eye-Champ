"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Camera, Check, ChevronLeft, ClipboardPenLine, FileText, Info, Pause, Play, Upload, Volume2, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import LensTintOverlay from "./LensTintOverlay";

type Panel = "prescription" | "upload" | "manual";
type LensProduct={productId?:string;name:string;frameColor:string;image:string;frameImageUrl?:string|null;framePrice:number;lensColors?:string[];categories?:string[];returnUrl?:string};
type EyePrescription={sph:string;cyl:string;axis:string;add:string};
type Prescription={right:EyePrescription;left:EyePrescription;pd:string;twoPd:boolean;pdRight:string;pdLeft:string};
const lensOptions = [
  { id: "ordinary-anti-reflection", name: "Ordinary Anti-Reflection", price: 1499, text: "Clear vision with an anti-reflection coating that reduces glare from lights and screens, providing better comfort for everyday use and a cleaner appearance." },
  { id: "emi-silk", name: "EMI Lens with Silk Coating", price: 1999, text: "Premium EMI lens featuring a smooth Silk Coating for enhanced clarity, improved scratch resistance, reduced glare, and easier cleaning. Ideal for daily wear." },
  { id: "blue-cut", name: "Blue Cut Lens", price: 2450, text: "Designed to filter harmful blue light emitted by digital screens, helping reduce eye strain while maintaining clear and comfortable vision. Includes anti-reflection coating." },
  { id: "transition-blue-cut", name: "Transition Blue Cut Lens", price: 3050, text: "Advanced smart lenses that automatically darken in sunlight and become clear indoors. Provides blue light protection from digital screens, UV protection, and comfortable vision throughout the day. Perfect for people who use mobile, computer, and spend time outdoors." },
] as const;
const sunglassesLensOptions = [
  { id: "power-sunglasses", name: "Power Sunglasses Lens", price: 1650, text: "Custom power lenses designed for sunglasses frames, providing clear vision with your required prescription. Offers UV protection and comfortable eye coverage for daily outdoor use." },
  { id: "premium-power-sunglasses", name: "Premium Power Sunglasses Lens", price: 2250, text: "High-quality prescription sunglasses lenses with enhanced clarity, better UV protection, and a premium finish. Ideal for comfortable vision in bright sunlight while matching your personal style." },
] as const;
const tintCssColor = (value:string) => ({ black:"#000000", brown:"#594400", green:"#105e18", blue:"#7395cf", yellow:"#fff06a", red:"#cd5050", gray:"#808080", grey:"#808080", pink:"#db86a4", purple:"#76529a", orange:"#dd7b35", clear:"#eef4f4", gold:"#b79a53", silver:"#aeb7ba" } as Record<string,string>)[value.toLowerCase()] ?? value;

export default function PrescriptionSelectionPage() {
  const router = useRouter();
  const [guideOpen, setGuideOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<Panel | null>("prescription");
  const [fileName, setFileName] = useState("");
  const [prescriptionEntered, setPrescriptionEntered] = useState(false);
  const [prescription,setPrescription]=useState<Prescription>({right:{sph:"0.00",cyl:"0.00",axis:"",add:"n/a"},left:{sph:"0.00",cyl:"0.00",axis:"",add:"n/a"},pd:"62",twoPd:false,pdRight:"31",pdLeft:"31"});
  const [eyesightNote, setEyesightNote] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [step, setStep] = useState<"usage" | "prescription" | "lenses" | "review">("usage");
  const [usage, setUsage] = useState<string | null>(null);
  const [selectedLens, setSelectedLens] = useState<string | null>(null);
  const [selectedTint, setSelectedTint] = useState<string | null>(null);
  const [customTint, setCustomTint] = useState("#808080");
  const [customTintSelected, setCustomTintSelected] = useState(false);
  const [lensConfigured, setLensConfigured] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [product,setProduct]=useState<LensProduct>({name:"Celine CL40248U",frameColor:"Black",image:"/images/product/1.avif",framePrice:15000,returnUrl:"/product"});

  useEffect(()=>{queueMicrotask(()=>{try{const saved=sessionStorage.getItem("eye-champ-lens-product");if(saved){const loaded=JSON.parse(saved) as LensProduct;setProduct(loaded);if(loaded.categories?.some(category=>category.trim().toLowerCase()==="sunglasses")){setStep("prescription");setOpenPanel("upload")}}}catch{}})},[]);

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
  const isSunglasses = product.categories?.some(category => category.trim().toLowerCase() === "sunglasses") ?? false;
  const secondStep = isSunglasses ? "lenses" : "prescription";
  const previewImage = (step === secondStep || (isSunglasses && step === "review")) && product.frameImageUrl ? product.frameImageUrl : product.image;
  const availableLensOptions = isSunglasses ? sunglassesLensOptions : lensOptions;
  const selectedLensOption = availableLensOptions.find(option => option.id === selectedLens);
  const tintColors = [...new Map((product.lensColors ?? []).map(color => color.trim()).filter(Boolean).map(color => [color.toLowerCase(), color])).values()];
  const tintLabel = selectedTint ? customTintSelected ? `Custom color (${selectedTint})` : selectedTint : null;
  const changeStep = (nextStep: "usage" | "prescription" | "lenses" | "review") => {
    if (transitionLoading) return;
    setTransitionLoading(true);
    window.setTimeout(() => {
      setStep(nextStep);
      setTransitionLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  };
  const addToCart = () => {
    if (!selectedLensOption || (isSunglasses && !selectedTint) || transitionLoading) return;
    const cart = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]") as Array<Record<string, unknown>>;
    cart.push({ id: `${product.productId??Date.now()}:${product.frameColor}:${selectedLens}:${Date.now()}`, productId:product.productId, name:product.name, frameColor:product.frameColor, image:product.image, framePrice:product.framePrice, lens: selectedLensOption.name, lensPrice: selectedLensOption.price, ...(isSunglasses && selectedTint ? { tintColor: selectedTint, colorName: tintLabel } : {}), quantity: 1, usage, prescription: usage === "non-prescription" ? null : prescription });
    localStorage.setItem("eye-champ-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("eye-champ-cart-updated"));
    setLensConfigured(true);
    setTransitionLoading(true);
    window.setTimeout(() => router.push("/cart"), 700);
  };

  return <main className={`usage-page${step === "usage" ? " usage-purpose-step" : ""}`}>
    <div className="usage-topline" />
    <div className="usage-layout">
      <section className="usage-product">
        <Link href={product.returnUrl||"/product"} className="usage-back">Back to Product Page</Link>
        <div className="usage-product-image"><div className="lens-preview-stage"><Image src={previewImage} alt={`${product.name} ${product.frameColor}`} width={1000} height={460} priority unoptimized />{isSunglasses && (step === "lenses" || step === "review") && selectedTint && <LensTintOverlay src={previewImage} color={tintCssColor(selectedTint)} />}</div></div>
        <h1>{product.name}</h1>
        <p>{product.frameColor}</p>
        <strong>Rs {Number(product.framePrice).toLocaleString()}</strong>
      </section>

      <section className="usage-form">
        <h2>Usage</h2>
        {step !== "usage" && !(isSunglasses && step === "prescription") && <button type="button" className="usage-step-back" disabled={transitionLoading} onClick={() => changeStep(step === "review" ? "lenses" : step === "lenses" ? "prescription" : "usage")}><ChevronLeft /> Back</button>}
        {step !== "review" && <div className="usage-audio" aria-label="Prescription guidance audio player">
          <audio ref={audioRef} src={step === "usage" ? "/audio/audio-step-1-mp3.mp3" : "/audio/audio-step-2-mp3.mp3"} preload="metadata" onLoadedMetadata={event => setAudioDuration(event.currentTarget.duration)} onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />
          <button type="button" aria-label={playing ? "Pause guidance" : "Play guidance"} onClick={toggleAudio}>{playing ? <Pause /> : <Play />}</button>
          <span>{formatTime(elapsed)}</span>
          <input type="range" min="0" max={audioDuration || 0} step="0.1" value={elapsed} aria-label="Audio progress" onChange={event => { const nextTime = Number(event.target.value); setElapsed(nextTime); if (audioRef.current) audioRef.current.currentTime = nextTime; }} />
          <span>{formatTime(audioDuration)}</span><Volume2 />
        </div>}

        {step === "usage" ? <div className="usage-purpose-list" aria-label="Choose how you will use your lenses">
          {[
            { id: "distance", title: "Distance", description: "General use lenses for seeing things far away" },
            { id: "multifocal", title: "Multifocal", description: "Lenses for seeing things both close and far away" },
            { id: "reading", title: "Reading", description: "General use lenses for seeing things up close" },
            { id: "non-prescription", title: "Non Prescription / No Eyesight", description: "Lenses without any prescription" },
          ].map((option) => <button key={option.id} type="button" className="usage-purpose-card" disabled={transitionLoading} onClick={() => { setUsage(option.id); changeStep("prescription"); }}>
            <span className="usage-purpose-icon" aria-hidden="true">{option.id === "reading" ? <BookOpen /> : <span className="usage-purpose-lens" />}</span>
            <span className="usage-purpose-copy"><strong>{option.title} <Info size={18} aria-hidden="true" /></strong><small>{option.description}</small></span>
          </button>)}
        </div> : step === "prescription" ? <><div className="usage-accordions">
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
            {openPanel === "upload" && <div className="usage-panel"><label className={`usage-dropzone ${fileName ? "has-file" : ""}`}><input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={event => { setFileName(event.target.files?.[0]?.name ?? ""); setValidationError(false); }} />{fileName ? <><Check /><b>{fileName}</b><small>Prescription ready to upload</small></> : <><Upload /><b>{isSunglasses ? "Take image or Upload image max 10 MB" : "Upload Prescription"}</b>{!isSunglasses && <small>Upload image max 10 MB</small>}</>}</label></div>}
          </article>

          <article className={openPanel === "manual" ? "open" : ""}>
            <button className="usage-accordion-head" type="button" onClick={() => togglePanel("manual")}><FileText /><b>Write Eyesight Number</b><span>{openPanel === "manual" ? "−" : "+"}</span></button>
            {openPanel === "manual" && <div className="usage-panel usage-eyesight-note"><label htmlFor="eyesight-note">Write your eyesight number</label><textarea id="eyesight-note" value={eyesightNote} onChange={event => { setEyesightNote(event.target.value); setValidationError(false); }} placeholder="Write your eyesight number here" /></div>}
          </article>
        </div>

        {validationError && <p className="usage-validation-error" role="alert">Please enter your prescription, upload an image, or write your eyesight number before continuing.</p>}
        <button type="button" className="usage-confirm" disabled={transitionLoading} onClick={() => { if (usage !== "non-prescription" && !prescriptionEntered && !fileName && !eyesightNote.trim()) { setValidationError(true); return; } setPlaying(false); setElapsed(0); changeStep("lenses"); }}>Confirm</button></> : step === "lenses" ? <div className="lens-type-list">
          {availableLensOptions.map(option => <Fragment key={option.id}><button type="button" aria-expanded={selectedLens === option.id} className={`lens-type-card ${selectedLens === option.id ? "selected" : ""}`} onClick={() => { setSelectedLens(current => current === option.id ? null : option.id); setLensConfigured(false); }}>
              <span className={`lens-type-swatch ${option.id}`} aria-hidden="true" />
              <span><b>{option.name} <strong>Rs {option.price.toLocaleString()}</strong> <Info /></b><small>{option.text}</small></span>
            </button>
            <div className={`lens-customization-shell ${selectedLens === option.id ? "expanded" : ""}`} aria-hidden={selectedLens !== option.id} inert={selectedLens !== option.id ? true : undefined}><div className="lens-customization">
              {isSunglasses && <fieldset><legend>Tint Color</legend>{tintColors.length > 0 && <div className="tint-swatches">{tintColors.map(color => <button type="button" title={color} aria-label={`Select tint color ${color}`} aria-pressed={selectedTint === color && !customTintSelected} className={selectedTint === color && !customTintSelected ? "selected" : ""} style={{ backgroundColor: tintCssColor(color) }} key={color} onClick={() => { setSelectedTint(color); setCustomTintSelected(false); setLensConfigured(false); }} />)}</div>}<div className="custom-tint"><label htmlFor={`${option.id}-custom-lens-tint`}>Custom color</label><input id={`${option.id}-custom-lens-tint`} type="color" value={customTint} onChange={event => { setCustomTint(event.target.value); setSelectedTint(event.target.value); setCustomTintSelected(true); setLensConfigured(false); }} /><button type="button" className={customTintSelected ? "selected" : ""} onClick={() => { setSelectedTint(customTint); setCustomTintSelected(true); setLensConfigured(false); }}>Use custom color</button></div>{tintLabel && <small className="tint-selected">Selected: {tintLabel}</small>}</fieldset>}
              <button type="button" className="lens-config-confirm" disabled={transitionLoading || (isSunglasses && !selectedTint)} onClick={() => { setLensConfigured(false); changeStep("review"); }}>Confirm</button>
            </div></div>
          </Fragment>)}
        </div> : <div className="lens-review">
          <small className="lens-review-type">{isSunglasses ? "Sunglasses" : product.categories?.[0] ?? "Eyeglasses"}</small>
          <div className="lens-review-product"><span>{product.name} | {product.frameColor}</span><b>Rs {Number(product.framePrice).toLocaleString()}</b></div>
          <h3>{usage === "non-prescription" ? "No prescription needed" : "Your prescription"}</h3>
          {usage !== "non-prescription" && <table className="prescription-summary" aria-label="Prescription summary">
            <thead><tr><th scope="col" /><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">Axis</th><th scope="col">ADD</th><th scope="col">PD</th></tr></thead>
            <tbody>
              <tr><th scope="row">R</th><td>{showPower(prescription.right.sph)}</td><td>{showPower(prescription.right.cyl)}</td><td>{showOptional(prescription.right.axis)}</td><td>{showOptional(prescription.right.add)}</td><td className="summary-pd" rowSpan={prescription.twoPd ? 1 : 2}>{prescription.twoPd ? prescription.pdRight : prescription.pd}</td></tr>
              <tr><th scope="row">L</th><td>{showPower(prescription.left.sph)}</td><td>{showPower(prescription.left.cyl)}</td><td>{showOptional(prescription.left.axis)}</td><td>{showOptional(prescription.left.add)}</td>{prescription.twoPd && <td className="summary-pd">{prescription.pdLeft}</td>}</tr>
            </tbody>
          </table>}
          <h3>Lens details</h3>
          <dl className="lens-review-details">
            <dt>{selectedLensOption?.name}</dt><dd>Rs {(selectedLensOption?.price ?? 0).toLocaleString()}</dd>
            {isSunglasses && tintLabel && <><dt>Tint Color</dt><dd>{tintLabel}</dd></>}
            <dt>Subtotal</dt><dd>Rs {(product.framePrice + (selectedLensOption?.price ?? 0)).toLocaleString()}</dd>
          </dl>
          <div className="lens-review-note"><b>Note:</b><span>We will take 50% advance payment for this order as your lenses are custom made. Place your order our representative will contact you for further details.</span></div>
          <button type="button" className="lens-add-cart" disabled={transitionLoading} onClick={addToCart}>{lensConfigured ? <><Check /> Added to cart</> : "Confirm & add to cart"}</button>
        </div>}
      </section>
    </div>

    {step !== "review" && <footer className="usage-subtotal">Subtotal : <b>{step === "lenses" && selectedLensOption ? `${(product.framePrice + selectedLensOption.price).toLocaleString()} (${product.framePrice.toLocaleString()}+${selectedLensOption.price.toLocaleString()})` : product.framePrice.toLocaleString()}</b></footer>}

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
