"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart, SlidersHorizontal, Star } from "lucide-react";
import "./shop-all.css";

type Media = { name?: string; url: string; primary?: boolean };
type Variant = { name: string; values: string[]; mediaByValue?: Record<string, Media[]> };
type Product = { id: string; title: string; slug: string; price: number; quantity: number; shape: string | null; categories: string[]; brands: string[]; media: Media[]; variants: Variant[]; createdAt: string };

const groups = [
  ["Gender", ["Men", "Women"]],
  ["Price", ["Under 1000", "Under 2000", "Under 3000", "Above 5000"]],
  ["Material", ["Plastic", "Metal", "Mix material", "Acetate"]],
  ["Shape", ["Square", "Rectangle", "Round", "Cat eye", "Browline", "Aviator"]],
  ["Rim", ["Full rim", "Half rim", "Rimless"]],
  ["Brand", ["Ray-Ban", "Cartier", "Montblanc", "Tom Ford", "Moscot", "Oakley", "Prada", "Emporio Armani", "Versace", "Gucci"]],
  ["Color", ["Black", "Pink", "Clear", "Blue", "Tortoiseshell", "Purple", "Green", "Red", "Rainbow", "Gold", "Brown", "White", "Pattern", "Cream", "Multicolor", "Orange", "Gray", "Yellow", "Silver", "Rose Gold"]],
] as const;

const faqs = ["What is the Best Seller Glasses collection?", "What styles and frame types can I find in the Best Seller collection?", "Can best-selling frames be customized with specialty lenses?", "How often is the Best Seller Glasses collection updated?", "Are the best-selling frames chosen based on customer ratings and reviews?"];

function Card({ product, i }: { product: Product; i: number }) {
  const [liked, setLiked] = useState(false);
  const frameColors = product.variants.find(variant => variant.name.toLowerCase().includes("frame") && variant.name.toLowerCase().includes("color"));
  const colors = frameColors?.values ?? [];
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const colorMedia = selectedColor ? frameColors?.mediaByValue?.[selectedColor] : undefined;
  const image = colorMedia?.[0]?.url || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url || "/images/Browline.webp";
  return <article className="plp-card"><div className="plp-photo">{i % 3 !== 1 && <span className="plp-badge">New</span>}<button className="plp-heart" onClick={() => setLiked(!liked)} aria-label="Save frame"><Heart fill={liked ? "#053f44" : "none"} /></button><img src={image} alt={product.title} /></div><div className="plp-card-line"><b>Rs {Number(product.price).toFixed(2)}</b><span><Star fill="currentColor" /> New</span></div><p>{product.title}</p>{product.quantity > 0 ? <strong>{product.quantity} in stock</strong> : <strong>Out of stock</strong>}{colors.length > 0 && <div className="plp-swatches" aria-label="Frame colors">{colors.map(color => <button type="button" key={color} className={`color-choice ${color.toLowerCase().replaceAll(" ", "-")} ${selectedColor === color ? "selected" : ""}`} onClick={() => setSelectedColor(color)} aria-label={`Select ${color} color`} aria-pressed={selectedColor === color} />)}{colors.length > 4 && <button type="button" className="more-colors" aria-label={`Show ${colors.length - 4} more colors`}>+{colors.length - 4}</button>}</div>}</article>;
}
function ShapeIcon({ shape }: { shape: string }) {
  const files: Record<string, string> = {
    Square: "square-shape.svg", "Cat eye": "catEye-shape.svg", Round: "round-shape.svg",
    Rectangle: "rectangle-shape.svg", Aviator: "aviator-shape.svg", Browline: "browline-shape.svg",
    Geometric: "geometric-shape.svg", Oval: "oval-shape.svg", Heart: "heart-shape.svg",
    "Wrap-Around": "Sports-Shield-Wraparound.svg", "Full Rim": "fullRim.svg",
    "Half Rim": "halfRim.svg", Rimless: "rimless.svg",
  };
  return <img className="shape-icon" src={`/images/shapes/${files[shape]}`} alt="" aria-hidden="true" />;
}

function ColorDot({ color }: { color: string }) {
  return <i className={`filter-color color-${color.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true" />;
}

function FilterGroup({ title, items, shape, toggle }: { title: string; items: readonly string[]; shape: string[]; toggle: (x: string) => void }) {
  const help = title === "Frame Sizes - Adult" || title === "Pupillary Distance";
  const [selected, setSelected] = useState<string[]>([]);
  const choose = (item: string) => {
    if (title === "Shape") toggle(item);
    else setSelected(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  };
  return <details open={title === "Shape" || title === "Color" || title === "Comfort Features" ? true : undefined}><summary><span>{title}{help && <b className="filter-help">?</b>}</span><ChevronDown /></summary><div>{items.map(item => <label key={item}><input type="checkbox" checked={title === "Shape" ? shape.includes(item) : selected.includes(item)} onChange={() => choose(item)} />{title === "Shape" && <ShapeIcon shape={item} />}{title === "Color" && <ColorDot color={item} />}<span>{item}{item === "Universal Bridge Fit" && <b className="filter-help">?</b>}</span></label>)}</div></details>;
}
function GridIcon({ size }: { size: 2 | 3 }) { return <span className={`grid-icon grid-icon-${size}`}>{Array.from({ length: size * size }, (_, i) => <i key={i} />)}</span> }

export default function ShopAll() {
  const [filtersOpen, setFiltersOpen] = useState(true), [sort, setSort] = useState("Relevance"), [shape, setShape] = useState<string[]>([]), [faq, setFaq] = useState<number | null>(null), [density, setDensity] = useState<"roomy" | "compact">("compact");
  const [products, setProducts] = useState<Product[]>([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");
  useEffect(() => { fetch("/api/products", { cache: "no-store" }).then(async response => { const result = await response.json() as { products?: Product[]; error?: string }; if (!response.ok) throw new Error(result.error); setProducts(result.products ?? []) }).catch(error => setLoadError(error instanceof Error ? error.message : "Could not load products.")).finally(() => setLoading(false)) }, []);
  const visible = useMemo(() => { const list = shape.length ? products.filter(product => product.shape && shape.includes(product.shape)) : [...products]; if (sort === "Price Low to High") list.sort((a, b) => Number(a.price) - Number(b.price)); if (sort === "Price High to Low") list.sort((a, b) => Number(b.price) - Number(a.price)); if (sort === "New Arrivals") list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)); return list }, [products, shape, sort]);
  const toggle = (x: string) => setShape(s => s.includes(x) ? s.filter(v => v !== x) : [...s, x]);
  return <main className="plp">
    <section className="plp-hero">
      <div>
        <small>BEST SELLERS</small>
        <h1>The A-List Collection</h1>
        <p>Featuring fan favorites and breakout hits.</p>
      </div>
    </section>

    <div className="plp-chips">
      {["Frames"].map((x, i) => <button key={x} className={i === 0 ? "active" : ""}>{x}</button>)}
    </div>

    <section className="plp-tools">
      <button className="filter-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal /> Filter & Sort</button>
      <span>{visible.length ? `Showing 1-${visible.length} of ${products.length} results` : `Showing 0 of ${products.length} results`}</span>
      <div className="grid-switch">
        <button className={density === "roomy" ? "active" : ""} onClick={() => setDensity("roomy")} aria-label="Roomy grid"><GridIcon size={2} /></button>
        <button className={density === "compact" ? "active" : ""} onClick={() => setDensity("compact")} aria-label="Compact grid"><GridIcon size={3} /></button>
      </div>
      <label>Sort By: <select value={sort} onChange={e => setSort(e.target.value)}>{["Relevance", "New Arrivals", "Top Rated", "Price Low to High", "Price High to Low"].map(x => <option key={x}>{x}</option>)}</select></label>
    </section>

    <div className={`plp-body ${filtersOpen ? "" : "filters-hidden"}`}>
      {filtersOpen && <aside className="filters open">
        <div className="filters-title">
          <h2>Filters</h2>
          <button className="hide-filters" onClick={() => setFiltersOpen(false)}>
            <SlidersHorizontal />
            <span>Hide Filters</span>
          </button>
        </div>

        {groups.map(([title, items]) => <FilterGroup key={title} title={title} items={items} shape={shape} toggle={toggle} />)}
      </aside>}

      <section className={`plp-grid ${density}`}>
        {loading && <p>Loading products...</p>}
        {!loading && loadError && <p>{loadError}</p>}
        {!loading && !loadError && visible.length === 0 && <p>No products found.</p>}
        {visible.map((product, i) => <Card key={product.id} product={product} i={i} />)}
      </section>
    </div>

    <section className="plp-faq">
      <h2>Frequently Asked Questions about Best Seller Glasses</h2>
      {faqs.map((q, i) => <article key={q}>
        <button onClick={() => setFaq(faq === i ? null : i)}>{q}<span>{faq === i ? "−" : "+"}</span></button>
        {faq === i && <p>Explore our curated selection of popular, customizable frames in a wide range of styles, sizes, and materials.</p>}
      </article>)}
    </section>
  </main>;
}
