"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "../product.css";
import SelectLensesButton from "../../components/SelectLensesButton";
import BuyNowButton from "../../components/BuyNowButton";
import { favoritesUpdatedEvent, getFavorites, toggleFavorite } from "@/lib/favorites";
import Link from "next/link";

const views = ["front", "side", "angle", "sun", "folded"];
const productAssets: Record<string, { src: string; width: number; height: number }> = {
    front: { src: "/images/product/1.avif", width: 1200, height: 428 },
    side: { src: "/images/product/2.avif", width: 84, height: 30 },
    angle: { src: "/images/product/3.avif", width: 84, height: 37 },
    sun: { src: "/images/product/4.avif", width: 84, height: 30 },
    folded: { src: "/images/product/3.avif", width: 84, height: 37 },
    case: { src: "/images/product/eyewear-case.avif", width: 84, height: 30 },
};
type RecommendedProduct = { id: string; title: string; slug: string; price: number; discountPercent: number; shape: string | null; material: string | null; categories: string[]; subcategories: string[]; brands: string[]; categorySlug: string | null; subcategorySlug: string | null; media: Array<{ url: string; primary?: boolean }>; variants: Array<{ name: string; values: string[] }> };
type ProductReview = { id: string; name: string; rating: number; title: string; body: string; fit: string | null; quality: string | null; photoUrl: string | null; createdAt: string };
export type DatabaseProduct = { id: string; title: string; slug: string; description: string; price: number; discountPercent: number; quantity: number; shape: string | null; material: string | null; rim: string | null; fit: string | null; weight: number | null; specialFeature: string | null; measurements: Record<string, string>; lensCompatibility: string[]; genders: string[]; categories: string[]; subcategories: string[]; collections: string[]; brands: string[]; media: Array<{ name?: string; url: string; primary?: boolean }>; variants: Array<{ name: string; values: string[]; mediaByValue?: Record<string, Array<{ name?: string; url: string }>> }> };
function ProductImage({ view, className = "", src, database = false }: { view: string, className?: string, src?: string, database?: boolean }) {
    const asset = productAssets[view] ?? productAssets.front;
    if (database && !src) return <div className={`sprite product-asset product-no-image ${className}`}>No image available</div>;
    return <div className={`sprite product-asset ${className}`}><Image key={src ?? asset.src} src={src ?? asset.src} width={asset.width} height={asset.height} alt={`${view} product view`} unoptimized /></div>
}
function Rating({ value = 5 }: { value?: number }) { return <span className="stars">{[1, 2, 3, 4, 5].map(i => <Star key={i} fill={i <= value ? "currentColor" : "#c7d2d5"} color={i <= value ? "currentColor" : "#c7d2d5"} />)}</span> }
function productColor(value: string) { const normalized = value.toLowerCase().trim(), colors: Record<string, string> = { black: "#111111", white: "#ffffff", blue: "#2158a6", navy: "#172d55", brown: "#795036", clear: "#eef4f4", transparent: "#eef4f4", gray: "#80878a", grey: "#80878a", silver: "#aeb7ba", red: "#ae4040", green: "#427055", pink: "#dc86a5", purple: "#744f91", orange: "#dc7b35", yellow: "#e5c642", gold: "#b79a53", cream: "#eee1bd", "rose gold": "#b98276", tortoise: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)", tortoiseshell: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)", rainbow: "conic-gradient(#e44,#ec3,#4a6,#39d,#85c,#e44)", multicolor: "conic-gradient(#e44,#ec3,#4a6,#39d,#85c,#e44)", pattern: "repeating-linear-gradient(45deg,#222 0 4px,#ddd 4px 8px)" }; if (/^(#[0-9a-f]{3,8}|rgb(a)?\(|hsl(a)?\()/i.test(normalized)) return value; return colors[normalized] ?? "#d9e0e2" }
const formatMoney = (currency: string, value: number) => `${currency} ${Number(value || 0).toFixed(2)}`;

export default function ProductPage({ databaseProduct }: { databaseProduct?: DatabaseProduct } = {}) {
    const productSlider = useRef<SwiperInstance | null>(null);
    const photoSlider = useRef<SwiperInstance | null>(null);
    const gallerySlider = useRef<SwiperInstance | null>(null);
    const [view, setView] = useState("front"), [liked, setLiked] = useState(false), [tab, setTab] = useState("Features"), [color, setColor] = useState(0), [photosOnly, setPhotosOnly] = useState(false), [sideView, setSideView] = useState(false), [sortOpen, setSortOpen] = useState(false), [sortOrder, setSortOrder] = useState("Newest"), [reviewsOpen, setReviewsOpen] = useState(true), [currency, setCurrency] = useState("PKR");
    const [recommended, setRecommended] = useState<RecommendedProduct[]>([]), [recommendLoading, setRecommendLoading] = useState(true), [recommendError, setRecommendError] = useState(false), [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]), [reviewsLoading, setReviewsLoading] = useState(true), [reviewsError, setReviewsError] = useState(false), [reviewPage, setReviewPage] = useState(1), [reviewFormOpen, setReviewFormOpen] = useState(false), [reviewSubmitting, setReviewSubmitting] = useState(false), [reviewMessage, setReviewMessage] = useState("");
    const slideProducts = (direction: number) => direction < 0 ? productSlider.current?.slidePrev() : productSlider.current?.slideNext();
    const sortedReviews = reviews.filter(review => !photosOnly || Boolean(review.photoUrl)).sort((a, b) => sortOrder === "Highest rating" ? b.rating - a.rating : sortOrder === "Lowest rating" ? a.rating - b.rating : Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const reviewPhotos = reviews.filter(review => Boolean(review.photoUrl));
    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({ stars, count: reviews.filter(review => review.rating === stars).length }));
    const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    const averageScale = (values: string[], key: "fit" | "quality") => { const scores = reviews.map(review => values.indexOf(review[key] || "")).filter(index => index >= 0); return scores.length ? `${(scores.reduce((a, b) => a + b, 0) / scores.length) * 50}%` : "50%"; };
    const reviewPageCount = Math.ceil(sortedReviews.length / 5);
    const visibleReviews = sortedReviews.slice((reviewPage - 1) * 5, reviewPage * 5);
    const frameVariant = databaseProduct?.variants.find(variant => variant.name.trim().toLowerCase() === "frame color"), frameColors = frameVariant?.values ?? [];
    const lensColors = databaseProduct?.variants.find(variant => variant.name.toLowerCase() === "lens color")?.values ?? [];
    const productSizes = databaseProduct?.variants.find(variant => variant.name.toLowerCase() === "size")?.values ?? [];
    const displayedLensCompatibility = databaseProduct ? databaseProduct.lensCompatibility : ["Sunglasses", "EyeQLenz™", "Transitions®", "Specialty lenses", "Blokz® blue-light blocking"];
    const selectedFrameColor = frameColors[color] ?? "";
    const rawDatabaseImages = (selectedFrameColor ? frameVariant?.mediaByValue?.[selectedFrameColor] : undefined) ?? databaseProduct?.media ?? [];
    const databaseImages = rawDatabaseImages.filter((image, index, images) => images.findIndex(item => item.url === image.url) === index);
    const databaseImage = (index: number) => databaseImages[index % Math.max(databaseImages.length, 1)]?.url;
    const originalPrice = Number(databaseProduct?.price ?? 599), discountPercent = Number(databaseProduct?.discountPercent ?? 0), hasDiscount = discountPercent > 0;
    const salePrice = originalPrice * (1 - discountPercent / 100);
    const hasProductImages = !databaseProduct || databaseImages.length > 0;
    const showGallerySlider = !databaseProduct || databaseImages.length > 1;
    const outOfStock = Boolean(databaseProduct && databaseProduct.quantity <= 0);
    useEffect(() => { if (!databaseProduct) return; const refresh = () => setLiked(getFavorites().some(item => item.id === databaseProduct.id)); refresh(); window.addEventListener(favoritesUpdatedEvent, refresh); return () => window.removeEventListener(favoritesUpdatedEvent, refresh) }, [databaseProduct]);
    useEffect(() => { fetch("/api/products/settings", { cache: "no-store" }).then(async response => { const result = await response.json() as { currency?: string }; if (response.ok && result.currency) setCurrency(result.currency) }).catch(() => undefined) }, []);
    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/products", { signal: controller.signal, cache: "no-store" })
            .then(async response => { if (!response.ok) throw new Error("Could not load recommendations"); return response.json() as Promise<{ products?: RecommendedProduct[] }> })
            .then(result => {
                const current = databaseProduct;
                const ranked = (result.products ?? []).filter(item => item.id !== current?.id).map(item => ({
                    item, score: current ?
                        (item.categories?.some(value => current.categories?.some(other => other.toLowerCase() === value.toLowerCase())) ? 8 : 0) +
                        (item.subcategories?.some(value => current.subcategories?.some(other => other.toLowerCase() === value.toLowerCase())) ? 5 : 0) +
                        (item.shape && item.shape.toLowerCase() === current.shape?.toLowerCase() ? 4 : 0) +
                        (item.material && item.material.toLowerCase() === current.material?.toLowerCase() ? 2 : 0) +
                        (item.brands?.some(value => current.brands?.some(other => other.toLowerCase() === value.toLowerCase())) ? 2 : 0) : 0
                }));
                ranked.sort((a, b) => b.score - a.score);
                setRecommended(ranked.slice(0, 12).map(({ item }) => item));
            })
            .catch(() => { if (!controller.signal.aborted) setRecommendError(true); })
            .finally(() => { if (!controller.signal.aborted) setRecommendLoading(false); });
        return () => controller.abort();
    }, [databaseProduct]);
    useEffect(() => { const refresh = () => setSavedRecommendations(getFavorites().map(item => item.id)); refresh(); window.addEventListener(favoritesUpdatedEvent, refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener(favoritesUpdatedEvent, refresh); window.removeEventListener("storage", refresh); }; }, []);
    useEffect(() => {
        if (!databaseProduct) { setReviewsLoading(false); return; }
        const controller = new AbortController();
        fetch(`/api/products/${encodeURIComponent(databaseProduct.slug)}/reviews`, { signal: controller.signal, cache: "no-store" })
            .then(async response => { if (!response.ok) throw new Error("Could not load reviews"); return response.json() as Promise<{ reviews?: ProductReview[] }> })
            .then(result => setReviews(result.reviews ?? []))
            .catch(() => { if (!controller.signal.aborted) setReviewsError(true); })
            .finally(() => { if (!controller.signal.aborted) setReviewsLoading(false); });
        return () => controller.abort();
    }, [databaseProduct]);
    useEffect(() => setReviewPage(1), [sortOrder, photosOnly]);
    async function submitReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!databaseProduct) return;
        setReviewSubmitting(true); setReviewMessage("");
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
            const response = await fetch(`/api/products/${encodeURIComponent(databaseProduct.slug)}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error || "Could not submit review.");
            const updated = await fetch(`/api/products/${encodeURIComponent(databaseProduct.slug)}/reviews`, { cache: "no-store" });
            const reviewResult = await updated.json() as { reviews?: ProductReview[] };
            setReviews(reviewResult.reviews ?? []); setReviewFormOpen(false); setReviewPage(1);
        } catch (error) { setReviewMessage(error instanceof Error ? error.message : "Could not submit review."); }
        finally { setReviewSubmitting(false); }
    }
    const toggleLiked = () => { if (!databaseProduct) return setLiked(value => !value); const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); setLiked(toggleFavorite({ ...databaseProduct, price: salePrice, categorySlug: slug(databaseProduct.categories[0] || "shop-all"), subcategorySlug: slug(databaseProduct.subcategories[0] || "all") })) };
    return (
        <main className="pdp productDetails">
            <section className="product-hero wrap">
                <div className="gallery">
                    <button className="gallery-heart" onClick={toggleLiked} aria-label={liked ? "Remove from favorites" : "Add to favorites"}>
                        <Heart fill={liked ? "#0b6068" : "none"} />
                    </button>
                    {hasProductImages ? (showGallerySlider ? <><button type="button" className="gallery-arrow left" onClick={() => gallerySlider.current?.slidePrev()}><ChevronLeft /></button>
                        <Swiper className="gallery-main" loop speed={450} onSwiper={swiper => { gallerySlider.current = swiper }} onSlideChange={swiper => setView(views[swiper.realIndex] ?? "front")}>{databaseProduct ? databaseImages.map((image, index) => <SwiperSlide key={`${image.url}-${index}`}><ProductImage view={views[index] ?? "front"} src={image.url} database /></SwiperSlide>) : views.map(v => <SwiperSlide key={v}><ProductImage view={v} /></SwiperSlide>)}</Swiper>
                        <button type="button" className="gallery-arrow right" onClick={() => gallerySlider.current?.slideNext()}><ChevronRight /></button>
                        <div className="gallery-tools"><button>360°</button><button>▰</button></div>
                        <div className="thumbnails">
                            {databaseProduct ? databaseImages.slice(0, 4).map((image, index) => { const imageView = views[index] ?? "front"; return <button type="button" aria-label={`Show image ${index + 1}`} className={view === imageView ? "active" : ""} key={`${image.url}-${index}`} onClick={() => gallerySlider.current?.slideToLoop(index)}><ProductImage view={imageView} src={image.url} database /></button> }) : views.slice(0, 4).map(v => <button type="button" aria-label={`Show ${v} view`} className={view === v ? "active" : ""} key={v} onClick={() => gallerySlider.current?.slideToLoop(views.indexOf(v))}><ProductImage view={v} /></button>)}
                        </div></> : <div className="gallery-single-image"><ProductImage view="front" src={databaseImage(0)} database /></div>) : <div className="gallery-empty">No image available</div>}
                </div>
                <div className="product-info-panel">
                    <h1>{databaseProduct?.title ?? "Tortoiseshell Square Glasses"}</h1>
                    <div className="title-row">
                        <div>
                            <small>Starting at</small>
                            <div className="product-price-line"><div className={`price ${hasDiscount ? "discounted" : ""}`}>{formatMoney(currency, salePrice)}</div>{hasDiscount && <span className="original-price">{formatMoney(currency, originalPrice)}</span>}</div>
                            {hasDiscount && <strong className="price-off">{Number.isInteger(discountPercent) ? discountPercent : discountPercent.toFixed(1)}% off</strong>}
                        </div>
                        <a className="score" href="#reviews"><Star fill="currentColor" /> <b>{averageRating ? averageRating.toFixed(1) : "—"}</b> <u>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</u></a>
                    </div>
                    <div className="options-card">
                        <div className="size-line"><b>Size:</b> {databaseProduct ? (productSizes.join(", ") || "Not specified") : "large (52 □ 19 - 143)"}</div>
                        {/* <b className="size-pill">Large</b> */}
                        {(!databaseProduct || frameColors.length > 0) && <><p><b>Frame color:</b> {selectedFrameColor || "Tortoiseshell"}</p><div className="swatches" aria-label="Frame colors">{(databaseProduct ? frameColors : ["tortoise", "black", "blue"]).map((c, i) => <button key={c} onClick={() => setColor(i)} style={{ background: productColor(c) }} className={color === i ? "selected" : ""} aria-label={`Select frame color ${c}`} title={c} />)}</div></>}</div>
                    {outOfStock ? <button className="select-lenses" type="button" disabled>Out of stock</button> : <><BuyNowButton productId={databaseProduct?.id} name={databaseProduct?.title} frameColor={selectedFrameColor || undefined} image={databaseImage(0)} framePrice={salePrice} /><SelectLensesButton product={databaseProduct ? { productId: databaseProduct.id, name: databaseProduct.title, frameColor: selectedFrameColor, image: databaseImage(0) || "", framePrice: salePrice, lensColors } : undefined} /></>}
                    <div className="pay-card">Pay over time with PayPal, Affirm or Afterpay. &nbsp;<u><Link href={`/accepted-payment-methods`}>Learn More</Link></u><br />Use your insurance or FSA/HSA benefits. &nbsp;<u><Link href={`/accepted-payment-methods`}>Learn more</Link></u></div>
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
                    <div className="frame-design"><h3>Frame design</h3><dl><dt>Shape</dt><dd><u>{databaseProduct?.shape ?? "Square"}</u></dd><dt>Feature</dt><dd><u>{databaseProduct?.specialFeature ?? "Spring Hinges, Universal Bridge Fit"}</u></dd><dt>Rim</dt><dd><u>{databaseProduct?.rim ?? "Full Rim"}</u></dd><dt>Material</dt><dd><u>{databaseProduct?.material ?? "Acetate"}</u></dd><dt>Weight</dt><dd>{databaseProduct?.weight ? `${databaseProduct.weight} grams` : "(23 grams / 0.8 ounces)"}</dd></dl></div>
                    <div className="lens-list"><h3>Lens compatibility</h3>{displayedLensCompatibility.length ? displayedLensCompatibility.map(item => <p key={item}><span>✓</span><b>{item}</b></p>) : <p>No lens compatibility specified.</p>}</div>
                    <div className="special-list"><h3>What makes it special</h3><div><span>✓</span><p><b>Zenni Promise</b><br />Experience high quality frames at our most affordable prices.</p></div><div><span>✓</span><p><b>Made for all faces</b><br />Designed to accommodate many face shapes and sizes.</p></div><div><span>✓</span><p><b>Luxury Crafted</b><br />Handcrafted acetate delivers vibrant, fade-resistant colors with hypoallergenic durability.</p></div></div>
                </div>}
                {tab === "Description" && <div className="detail-content wrap"><div>{databaseProduct ? <div dangerouslySetInnerHTML={{ __html: databaseProduct.description || "<p>No description provided.</p>" }} /> : <><b>Design:</b><p>Discover timeless sophistication with these full rim square glasses, meticulously crafted from premium acetate to showcase a sleek design and impeccable craftsmanship.</p><b>Fit:</b><p>These glasses feature spring hinges and a universal bridge fit, ensuring superior comfort and a secure fit for everyday wear.</p><b>Recommendation:</b><p>These glasses offer a sophisticated and classic style, perfect for both men and women. With their square frame shape, they are ideal for individuals with heart and oval face shapes.</p></>}</div><ProductImage view="angle" src={databaseImage(2)} database={Boolean(databaseProduct)} /></div>}
            </section>

            <section className="recommend">
                <div className="section-head">
                    <h2>You Might Also Like</h2>
                    <div>
                        <button type="button" aria-label="Previous recommended products" onClick={() => slideProducts(-1)}><ChevronLeft /></button>
                        <button type="button" aria-label="Next recommended products" onClick={() => slideProducts(1)}><ChevronRight /></button>
                    </div>
                </div>
                <Swiper className="product-row" onSwiper={swiper => { productSlider.current = swiper }} spaceBetween={38} slidesPerView={1.2} breakpoints={{ 600: { slidesPerView: 2.4, spaceBetween: 20 }, 900: { slidesPerView: 3.4, spaceBetween: 28 }, 1200: { slidesPerView: 5, spaceBetween: 38 } }}>
                    {(recommendLoading || recommendError || recommended.length === 0) && <SwiperSlide><p className="recommend-status">{recommendLoading ? "Loading similar products..." : recommendError ? "Could not load similar products." : "No other products available yet."}</p></SwiperSlide>}
                    {recommended.map(p => {
                        const href = `/${p.categorySlug || "shop-all"}/${p.subcategorySlug || "all"}/${p.slug}`;
                        const price = Number(p.price) * (1 - Number(p.discountPercent || 0) / 100);
                        const image = p.media?.find(item => item.primary)?.url || p.media?.[0]?.url;
                        const colors = p.variants?.find(variant => variant.name.trim().toLowerCase() === "frame color")?.values ?? [];
                        return <SwiperSlide key={p.id}><article className="product-card">
                            <div className="card-photo">
                                <Link href={href} aria-label={`View ${p.title}`}>{image ? <img src={image} alt={p.title} /> : <span>No image available</span>}</Link>
                                <button type="button" className="recommend-heart" aria-label={savedRecommendations.includes(p.id) ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleFavorite({ ...p, price })}><Heart fill={savedRecommendations.includes(p.id) ? "currentColor" : "none"} /></button>
                            </div>
                            <div className="card-meta"><b>{formatMoney(currency, price)}</b></div>
                            <p><Link href={href}>{p.title}</Link></p>
                            {p.shape && <small>{p.shape}</small>}
                            {colors.length > 0 && <div className="mini-swatches" aria-label="Available frame colors">{colors.slice(0, 4).map(value => <i key={value} title={value} style={{ background: productColor(value) }} />)}</div>}
                        </article></SwiperSlide>;
                    })}
                </Swiper>
            </section>

            <section id="reviews" className={`reviews wrap ${reviewsOpen ? "is-open" : "is-collapsed"}`}>
                <h2><span>Customer Reviews</span><button type="button" aria-expanded={reviewsOpen} aria-label={reviewsOpen ? "Hide customer reviews" : "Show customer reviews"} onClick={() => setReviewsOpen(!reviewsOpen)}><ChevronDown /></button></h2>
                {reviewPhotos.length > 0 && <><div className="photo-head">
                    <b>Customer Photos</b>
                    <div><button type="button" aria-label="Previous customer photos" onClick={() => photoSlider.current?.slidePrev()}><ChevronLeft /></button><button type="button" aria-label="Next customer photos" onClick={() => photoSlider.current?.slideNext()}><ChevronRight /></button><button type="button" onClick={() => { setPhotosOnly(true); document.getElementById("review-list")?.scrollIntoView({ behavior: "smooth" }); }}>View all photos</button></div>
                </div>
                    <Swiper className="customer-photos" onSwiper={swiper => { photoSlider.current = swiper }} slidesPerView={1.5} spaceBetween={14} breakpoints={{ 480: { slidesPerView: 2.4, spaceBetween: 16 }, 768: { slidesPerView: 3.5, spaceBetween: 18 }, 1100: { slidesPerView: 5.2, spaceBetween: 22 } }}>
                        {reviewPhotos.map(review => <SwiperSlide key={review.id}><img className="customer-review-photo" src={review.photoUrl!} alt={`Review photo by ${review.name}`} /></SwiperSlide>)}
                    </Swiper></>}
                <div className="rating-box"><div><b>Overall Rating</b><div className="big-rating">{averageRating ? averageRating.toFixed(1) : "—"} <span><Rating value={Math.round(averageRating)} /><small>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</small></span></div><p>customers</p>{databaseProduct && <button type="button" onClick={() => setReviewFormOpen(open => !open)}>Write a review</button>}</div><div><b>Rating Snapshot</b>{ratingCounts.map(({ stars, count }) => <div className="bar" key={stars}><u>{stars} stars</u><i><em style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }} /></i><u>{count}</u></div>)}</div><div><b>Average Ratings</b><p>Fit</p><div className="scale"><i style={{ left: averageScale(["Tight", "True to Size", "Loose"], "fit") }} /></div><div className="scale-labels"><span>Tight</span><span>True to Size</span><span>Loose</span></div><p>Quality</p><div className="scale"><i style={{ left: averageScale(["Low", "Average", "High"], "quality") }} /></div><div className="scale-labels"><span>Low</span><span>Average</span><span>High</span></div></div></div>
                {reviewFormOpen && <form className="review-form" onSubmit={submitReview}>
                    <h3>Review this product</h3><p>Sign in with the email used for your order. Only purchasers can post a review.</p>
                    <label>Rating <select name="rating" required defaultValue=""><option value="" disabled>Select rating</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}</select></label>
                    <label>Title <input name="title" minLength={3} maxLength={160} required /></label>
                    <label>Your review <textarea name="body" minLength={10} maxLength={3000} required /></label>
                    <label>Fit <select name="fit"><option value="">Not rated</option>{["Tight", "True to Size", "Loose"].map(value => <option key={value}>{value}</option>)}</select></label>
                    <label>Quality <select name="quality"><option value="">Not rated</option>{["Low", "Average", "High"].map(value => <option key={value}>{value}</option>)}</select></label>
                    <label>Photo URL (optional) <input name="photoUrl" type="url" placeholder="https://example.com/photo.jpg" /></label>
                    {reviewMessage && <p role="alert">{reviewMessage} {reviewMessage.includes("Sign in") && <Link href="/login">Sign in</Link>}</p>}
                    <button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit review"}</button>
                </form>}
                <div className="sort">
                    <div className="sort-menu"><button type="button" className="sort-trigger" aria-expanded={sortOpen} onClick={() => setSortOpen(!sortOpen)}>Sort by: {sortOrder} <ChevronDown /></button>{sortOpen && <div className="sort-options" role="menu">{["Newest", "Highest rating", "Lowest rating"].map(option => <button type="button" role="menuitemradio" aria-checked={sortOrder === option} key={option} onClick={() => { setSortOrder(option); setSortOpen(false) }}><span className={sortOrder === option ? "selected" : ""} />{option}</button>)}</div>}</div>
                    <label><input type="checkbox" checked={photosOnly} onChange={e => setPhotosOnly(e.target.checked)} disabled={reviewPhotos.length === 0} /> Reviews with photos</label>
                </div>
                <div className="review-list" id="review-list">{reviewsLoading ? <p>Loading reviews...</p> : reviewsError ? <p>Could not load reviews.</p> : visibleReviews.length === 0 ? <p>{photosOnly ? "No reviews with photos yet." : "No customer reviews yet. Be the first to review this product."}</p> : visibleReviews.map(r => <article key={r.id}><div><Rating value={r.rating} /><p className="reviewer-line"><b>{r.name}</b><ShieldCheck className="verified-icon" fill="currentColor" /><b>Verified purchaser</b></p><h3>{r.title} <small>{new Date(r.createdAt).toLocaleDateString()}</small></h3><p>{r.body}</p>{r.photoUrl && <img className="review-inline-photo" src={r.photoUrl} alt={`Review photo by ${r.name}`} />}</div><aside>{r.fit && <p><b>Fit:</b> {r.fit}</p>}{r.quality && <p><b>Quality:</b> {r.quality}</p>}</aside></article>)}</div>
                {reviewPageCount > 1 && <nav className="pagination" aria-label="Review pages"><button type="button" disabled={reviewPage === 1} onClick={() => setReviewPage(page => page - 1)}><ChevronLeft /> Previous</button><b>{reviewPage} / {reviewPageCount}</b><button type="button" disabled={reviewPage === reviewPageCount} onClick={() => setReviewPage(page => page + 1)}>Next <ChevronRight /></button></nav>}
            </section>
        </main>
    )
}
