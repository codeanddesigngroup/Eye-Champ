"use client";
import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, ShieldCheck, Star, ThumbsUp, Video } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "../product.css";
import SelectLensesButton from "../../components/SelectLensesButton";
import BuyNowButton from "../../components/BuyNowButton";

const views = ["front", "side", "angle", "sun", "folded"];
const productAssets: Record<string, { src: string; width: number; height: number }> = {
    front: { src: "/images/product/1.avif", width: 1200, height: 428 },
    side: { src: "/images/product/2.avif", width: 84, height: 30 },
    angle: { src: "/images/product/3.avif", width: 84, height: 37 },
    sun: { src: "/images/product/4.avif", width: 84, height: 30 },
    folded: { src: "/images/product/3.avif", width: 84, height: 37 },
    case: { src: "/images/product/eyewear-case.avif", width: 84, height: 30 },
};
const products = [["Rs 599.00", "4.7", "586", "front"], ["Rs 599.00", "4.6", "224", "side"], ["Rs 599.00", "4.5", "1961", "sun"], ["Rs 599.00", "4.5", "417", "angle"], ["Rs 599.00", "4.5", "221", "front"], ["Rs 599.00", "4.8", "312", "angle"], ["Rs 599.00", "4.6", "148", "side"], ["Rs 599.00", "4.9", "93", "sun"]];
const reviews = [[5, "starseed03", "Great quality", "4 days ago", "I got them delivered earlier that expected. The frame was sturdy and of good quality.", "True to Size", "High", 0], [5, "Reviewer1948161032", "Great pair of glasses", "7 days ago", "The experience was great! The glasses are much better quality than the ones I usually get at Costco, and they were less expensive. I’m very happy with my purchase!", "True to Size", "Average", 0], [3, "Olivia", "Not true to color", "7 days ago", "I really love the size and shape of these frames, but if you’re someone who can’t wear really dark frames then these aren’t for you! I still like them overall.", "True to Size", "High", 1], [1, "craigbruckner", "Big ugly frames", "12 days ago", "These frames are way too big for my face. My wife laughed when she saw them. Oh well, I can wear them when I work outside as safety glasses.", "Loose", "Low", 0]] as const;
export type DatabaseProduct = { id:string; title:string; slug:string; description:string; price:number; quantity:number; shape:string|null; material:string|null; rim:string|null; fit:string|null; weight:number|null; specialFeature:string|null; measurements:Record<string,string>; lensCompatibility:string[]; genders:string[]; categories:string[]; subcategories:string[]; collections:string[]; brands:string[]; media:Array<{name?:string;url:string;primary?:boolean}>; variants:Array<{name:string;values:string[];mediaByValue?:Record<string,Array<{name?:string;url:string}>>}> };
function ProductImage({ view, className = "", src }: { view: string, className?: string, src?:string }) {
    const asset = productAssets[view] ?? productAssets.front;
    return <div className={`sprite product-asset ${className}`}><Image key={src??asset.src} src={src??asset.src} width={asset.width} height={asset.height} alt={`${view} product view`} unoptimized /></div>
}
function Rating({ value = 5 }: { value?: number }) { return <span className="stars">{[1, 2, 3, 4, 5].map(i => <Star key={i} fill={i <= value ? "currentColor" : "#c7d2d5"} color={i <= value ? "currentColor" : "#c7d2d5"} />)}</span> }

export default function ProductPage({databaseProduct}:{databaseProduct?:DatabaseProduct}={}) {
    const productSlider = useRef<SwiperInstance | null>(null);
    const photoSlider = useRef<SwiperInstance | null>(null);
    const gallerySlider = useRef<SwiperInstance | null>(null);
    const [view, setView] = useState("front"), [liked, setLiked] = useState(false), [tab, setTab] = useState("Features"), [color, setColor] = useState(0), [photosOnly, setPhotosOnly] = useState(false), [sideView, setSideView] = useState(false), [sortOpen, setSortOpen] = useState(false), [sortOrder, setSortOrder] = useState("Newest"), [reviewsOpen, setReviewsOpen] = useState(true);
    const slideProducts = (direction: number) => direction < 0 ? productSlider.current?.slidePrev() : productSlider.current?.slideNext();
    const sortedReviews = [...reviews].sort((a, b) => sortOrder === "Highest rating" ? b[0] - a[0] : sortOrder === "Lowest rating" ? a[0] - b[0] : sortOrder === "Most helpful" ? b[7] - a[7] : 0);
    const frameVariant=databaseProduct?.variants.find(variant=>variant.name.toLowerCase()==="frame color"),frameColors=frameVariant?.values??[];
    const selectedFrameColor=frameColors[color]??"";
    const databaseImages=(selectedFrameColor?frameVariant?.mediaByValue?.[selectedFrameColor]:undefined)??databaseProduct?.media??[];
    const databaseImage=(index:number)=>databaseImages[index%Math.max(databaseImages.length,1)]?.url;
    return (
        <main className="pdp productDetails">
            <section className="product-hero wrap">
                <div className="gallery">
                    <button className="gallery-heart" onClick={() => setLiked(!liked)} aria-label="Save product">
                        <Heart fill={liked ? "#0b6068" : "none"} />
                    </button>
                    <button type="button" className="gallery-arrow left" onClick={() => gallerySlider.current?.slidePrev()}><ChevronLeft /></button>
                    <Swiper className="gallery-main" loop speed={450} onSwiper={swiper => { gallerySlider.current = swiper }} onSlideChange={swiper => setView(views[swiper.realIndex])}>{views.map((v,index) => <SwiperSlide key={v}><ProductImage view={v} src={databaseImage(index)} /></SwiperSlide>)}</Swiper>
                    <button type="button" className="gallery-arrow right" onClick={() => gallerySlider.current?.slideNext()}><ChevronRight /></button>
                    <div className="gallery-tools"><button>360°</button><button>▰</button></div>
                    <div className="thumbnails">
                        {views.slice(0, 4).map((v,index) => <button type="button" aria-label={`Show ${v} view`} className={view === v ? "active" : ""} key={v} onClick={() => gallerySlider.current?.slideToLoop(views.indexOf(v))}><ProductImage view={v} src={databaseImage(index)} /></button>)}
                    </div>
                </div>
                <div className="product-info-panel">
                    <h1>{databaseProduct?.title??"Tortoiseshell Square Glasses"}</h1>
                    <div className="title-row">
                        <div>
                            <small>Starting at</small>
                            <div className="price">Rs {Number(databaseProduct?.price??599).toFixed(2)}</div>
                        </div>
                        <a className="score" href="#reviews"><Star fill="currentColor" /> <b>4.7</b> <u>221 reviews</u></a>
                    </div>
                    <div className="options-card">
                        <div className="size-line"><b>Size:</b> large (52 □ 19 - 143)</div>
                        {/* <b className="size-pill">Large</b> */}
                        <p><b>Color:</b> {selectedFrameColor||"Tortoiseshell"}</p><div className="swatches">{(frameColors.length?frameColors:["tortoise","black","blue"]).map((c, i) => <button key={c} onClick={() => setColor(i)} style={databaseProduct?{background:c}:undefined} className={`${databaseProduct?"":c} ${color === i ? "selected" : ""}`} aria-label={c} />)}</div></div>
                    <BuyNowButton productId={databaseProduct?.id} name={databaseProduct?.title} frameColor={selectedFrameColor||undefined} image={databaseImage(0)} framePrice={databaseProduct?.price} />
                    <SelectLensesButton />
                    <div className="pay-card">Pay over time with PayPal, Affirm or Afterpay. &nbsp;<u>Learn More</u><br />Use your insurance or FSA/HSA benefits. &nbsp;<u>Learn more</u></div>
                    <div className="includes"><h3>ZENNI WOW PRICE INCLUDES:</h3><p>✓ High-quality frame<br />✓ Basic prescription lenses*<br />✓ Anti-scratch coating<br />✓ UV protection</p><i>*multifocal or readers lenses start at additional cost</i></div>
                    <div className="bought">
                        <h2>Customers also bought</h2>
                        <div><ProductImage view="case" />
                            <section><b>Deluxe Eyewear Case</b><p>Protect your eyewear wherever life takes you with this reliable case. <u>read more</u></p><button>Add to cart Rs299.00</button></section></div></div>
                </div>
            </section>

            <section id="details" className="details">
                <div className="tabs wrap">
                    {["Features", "Description"].map(t => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}
                </div>
                {tab === "Features" && <div className="feature-content wrap">
                    <div className="frame-design"><h3>Frame design</h3><dl><dt>Shape</dt><dd><u>{databaseProduct?.shape??"Square"}</u></dd><dt>Feature</dt><dd><u>{databaseProduct?.specialFeature??"Spring Hinges, Universal Bridge Fit"}</u></dd><dt>Rim</dt><dd><u>{databaseProduct?.rim??"Full Rim"}</u></dd><dt>Material</dt><dd><u>{databaseProduct?.material??"Acetate"}</u></dd><dt>Weight</dt><dd>{databaseProduct?.weight?`${databaseProduct.weight} grams`:"(23 grams / 0.8 ounces)"}</dd></dl></div>
                    <div className="lens-list"><h3>Lens compatibility</h3>{["Sunglasses", "EyeQLenz™", "Transitions®", "Specialty lenses", "Blokz® blue-light blocking"].map(item => <p key={item}><span>✓</span><b>{item}</b></p>)}</div>
                    <div className="special-list"><h3>What makes it special</h3><div><span>✓</span><p><b>Zenni Promise</b><br />Experience high quality frames at our most affordable prices.</p></div><div><span>✓</span><p><b>Made for all faces</b><br />Designed to accommodate many face shapes and sizes.</p></div><div><span>✓</span><p><b>Luxury Crafted</b><br />Handcrafted acetate delivers vibrant, fade-resistant colors with hypoallergenic durability.</p></div></div>
                </div>}
                {tab === "Description" && <div className="detail-content wrap"><div>{databaseProduct?<div dangerouslySetInnerHTML={{__html:databaseProduct.description||"<p>No description provided.</p>"}}/>:<><b>Design:</b><p>Discover timeless sophistication with these full rim square glasses, meticulously crafted from premium acetate to showcase a sleek design and impeccable craftsmanship.</p><b>Fit:</b><p>These glasses feature spring hinges and a universal bridge fit, ensuring superior comfort and a secure fit for everyday wear.</p><b>Recommendation:</b><p>These glasses offer a sophisticated and classic style, perfect for both men and women. With their square frame shape, they are ideal for individuals with heart and oval face shapes.</p></>}</div><ProductImage view="angle" src={databaseImage(2)} /></div>}
            </section>

            <section className="recommend">
                <div className="section-head">
                    <h2>You Might Also Like</h2>
                    <div>
                        <button type="button" aria-label="Previous recommended products" onClick={() => slideProducts(-1)}><ChevronLeft /></button>
                        <button type="button" aria-label="Next recommended products" onClick={() => slideProducts(1)}><ChevronRight /></button>
                    </div>
                </div>
                <Swiper className="product-row" onSwiper={swiper => { productSlider.current = swiper }} spaceBetween={38} slidesPerView={1.2} breakpoints={{ 600: { slidesPerView: 2.4, spaceBetween: 20 }, 900: { slidesPerView: 3.4, spaceBetween: 28 }, 1200: { slidesPerView: 5, spaceBetween: 38 } }}>{products.map((p, i) => <SwiperSlide key={i}><article className="product-card">
                    <div className="card-photo">
                        <Heart />
                        <img src={'/images/product/1.avif'} />
                    </div>
                    <div className="card-meta">
                        <b>{p[0]}</b>
                        <span><Star fill="currentColor" /> {p[1]} ({p[2]})</span>
                    </div>
                    <p>Square</p>
                    <strong>Get it as early as Thu, Aug 20</strong>
                    <div className="mini-swatches"><i /><i /><i /></div>
                </article></SwiperSlide>)}
                </Swiper>
            </section>
            <section id="reviews" className={`reviews wrap ${reviewsOpen ? "is-open" : "is-collapsed"}`}>
                <h2><span>Customer Reviews</span><button type="button" aria-expanded={reviewsOpen} aria-label={reviewsOpen ? "Hide customer reviews" : "Show customer reviews"} onClick={() => setReviewsOpen(!reviewsOpen)}><ChevronDown /></button></h2>
                <div className="photo-head">
                    <b>Customer Photos</b>
                    <div><button type="button" aria-label="Previous customer photos" onClick={() => photoSlider.current?.slidePrev()}><ChevronLeft /></button><button type="button" aria-label="Next customer photos" onClick={() => photoSlider.current?.slideNext()}><ChevronRight /></button><u>View all photos</u></div>
                </div>
                <Swiper className="customer-photos" onSwiper={swiper => { photoSlider.current = swiper }} slidesPerView={1.5} spaceBetween={14} breakpoints={{ 480: { slidesPerView: 2.4, spaceBetween: 16 }, 768: { slidesPerView: 3.5, spaceBetween: 18 }, 1100: { slidesPerView: 5.2, spaceBetween: 22 } }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => <SwiperSlide key={n}><div className={`person person-${i % 6 + 1}`}></div></SwiperSlide>)}
                </Swiper>
                <div className="rating-box"><div><b>Overall Rating</b><div className="big-rating">4.7 <span><Rating /><small>Reviews</small></span></div><p>customers</p><button>Write a review</button></div><div><b>Rating Snapshot</b>{[[5, 185], [4, 24], [3, 6], [2, 3], [1, 3]].map(([s, n]) => <div className="bar" key={s}><u>{s} stars</u><i><em style={{ width: `${s === 5 ? 84 : s * 6}%` }} /></i><u>{n}</u></div>)}</div><div><b>Average Ratings</b><p>Fit</p><div className="scale"><i style={{ left: "55%" }} /></div><div className="scale-labels"><span>Tight</span><span>True to Size</span><span>Loose</span></div><p>Quality</p><div className="scale"><i style={{ left: "90%" }} /></div><div className="scale-labels"><span>Low</span><span>Average</span><span>High</span></div></div></div>
                <div className="sort">
                    <div className="sort-menu"><button type="button" className="sort-trigger" aria-expanded={sortOpen} onClick={() => setSortOpen(!sortOpen)}>Sort by: {sortOrder} <ChevronDown /></button>{sortOpen && <div className="sort-options" role="menu">{["Newest", "Highest rating", "Lowest rating", "Most helpful"].map(option => <button type="button" role="menuitemradio" aria-checked={sortOrder === option} key={option} onClick={() => { setSortOrder(option); setSortOpen(false) }}><span className={sortOrder === option ? "selected" : ""} />{option}</button>)}</div>}</div>
                    <label><input type="checkbox" checked={photosOnly} onChange={e => setPhotosOnly(e.target.checked)} /> Reviews with photos</label>
                </div>
                <div className="review-list">{sortedReviews.map(r => <article key={r[1]}><div><Rating value={r[0]} /><p className="reviewer-line"><b>{r[1]}</b><ShieldCheck className="verified-icon" fill="currentColor" /><b>Verified customer</b></p><h3>{r[2]} <small>{r[3]}</small></h3><p>{r[4]}</p><footer><b>Was this review helpful?</b> <ThumbsUp /> {r[7]}</footer></div><aside><p><b>Fit:</b> {r[5]}</p><p><b>Quality:</b> {r[6]}</p></aside></article>)}</div>
                <nav className="pagination"><button disabled><ChevronLeft /> Previous</button><b>1</b><span>2</span><span>3</span><span>…</span><span>56</span><button>Next <ChevronRight /></button></nav>
            </section>
        </main>
    )
}
