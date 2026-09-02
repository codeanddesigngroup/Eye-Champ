"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, SlidersHorizontal, Star } from "lucide-react";
import ProductFilters, { type ProductFilterSelection, type ProductFilterTitle } from "@/components/ProductFilters";
import Link from "next/link";
import "./shop-all.css";

type Media = { name?: string; url: string; primary?: boolean };
type Variant = { name: string; values: string[]; mediaByValue?: Record<string, Media[]> };
type Product = { id: string; title: string; slug: string; price: number; quantity: number; shape: string | null; material: string | null; rim: string | null; genders: string[]; categories: string[]; collections: string[]; subcategories: string[]; brands: string[]; media: Media[]; variants: Variant[]; createdAt: string; categorySlug: string | null; subcategorySlug: string | null };

function frameColor(value: string) {
  const normalized = value.toLowerCase().trim();
  const colors: Record<string, string> = {
    black: "#111111", white: "#ffffff", blue: "#2158a6", navy: "#172d55", brown: "#795036",
    clear: "#eef4f4", transparent: "#eef4f4", gray: "#80878a", grey: "#80878a", silver: "#aeb7ba",
    red: "#ae4040", green: "#427055", pink: "#dc86a5", purple: "#744f91", orange: "#dc7b35",
    yellow: "#e5c642", gold: "#b79a53", cream: "#eee1bd", "rose gold": "#b98276",
    tortoise: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)",
    tortoiseshell: "radial-gradient(circle at 70% 25%,#edb02d 0 18%,#2a1708 23% 48%,#aa6819 52%)",
    rainbow: "conic-gradient(#e44,#ec3,#4a6,#39d,#85c,#e44)", multicolor: "conic-gradient(#e44,#ec3,#4a6,#39d,#85c,#e44)",
  };
  if (/^(#[0-9a-f]{3,8}|rgb(a)?\(|hsl(a)?\()/i.test(normalized)) return value;
  return colors[normalized] ?? normalized;
}

const faqs = ["What is the Best Seller Glasses collection?", "What styles and frame types can I find in the Best Seller collection?", "Can best-selling frames be customized with specialty lenses?", "How often is the Best Seller Glasses collection updated?", "Are the best-selling frames chosen based on customer ratings and reviews?"];

function Card({ product, i, categorySlug, subcategorySlug }: { product: Product; i: number; categorySlug?: string; subcategorySlug?: string }) {
  const [liked, setLiked] = useState(false);
  const frameColors = product.variants.find(variant => variant.name.toLowerCase().includes("frame") && variant.name.toLowerCase().includes("color"));
  const colors = frameColors?.values ?? [];
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const colorMedia = selectedColor ? frameColors?.mediaByValue?.[selectedColor] : undefined;
  const image = colorMedia?.[0]?.url || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url || "/images/Browline.webp";
  const mainPath=categorySlug||product.categorySlug||"shop-all",subPath=(subcategorySlug&&subcategorySlug!=="all"?subcategorySlug:product.subcategorySlug)||"all";
  return <article className="plp-card"><Link className="plp-card-link" href={`/${mainPath}/${subPath}/${product.slug}`} aria-label={`View ${product.title}`} /><div className="plp-photo">{i % 3 !== 1 && <span className="plp-badge">New</span>}<button className="plp-heart" onClick={() => setLiked(!liked)} aria-label="Save frame"><Heart fill={liked ? "#053f44" : "none"} /></button><img src={image} alt={product.title} /></div><div className="plp-card-line"><b>Rs {Number(product.price).toFixed(2)}</b><span><Star fill="currentColor" /> New</span></div><p>{product.title}</p>{product.quantity > 0 ? <strong>{product.quantity} in stock</strong> : <strong>Out of stock</strong>}{colors.length > 0 && <div className="plp-swatches" aria-label="Frame colors">{colors.slice(0, 4).map(color => <button type="button" key={color} className={`color-choice ${selectedColor === color ? "selected" : ""}`} style={{background:frameColor(color)}} onClick={() => setSelectedColor(color)} aria-label={`Select ${color} color`} title={color} aria-pressed={selectedColor === color} />)}{colors.length > 4 && <button type="button" className="more-colors" aria-label={`Show ${colors.length - 4} more colors`}>+{colors.length - 4}</button>}</div>}</article>;
}
function GridIcon({ size }: { size: 2 | 3 }) { return <span className={`grid-icon grid-icon-${size}`}>{Array.from({ length: size * size }, (_, i) => <i key={i} />)}</span> }

export default function ShopAll({categorySlug="",subcategorySlug="",catalogTitle="The A-List Collection"}:{categorySlug?:string;subcategorySlug?:string;catalogTitle?:string}) {
  const [filtersOpen, setFiltersOpen] = useState(true), [sort, setSort] = useState("Relevance"), [filters, setFilters] = useState<ProductFilterSelection>({}), [faq, setFaq] = useState<number | null>(null), [density, setDensity] = useState<"roomy" | "compact">("compact");
  const [products, setProducts] = useState<Product[]>([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");
  useEffect(() => { const query=categorySlug?`?category=${encodeURIComponent(categorySlug)}&subcategory=${encodeURIComponent(subcategorySlug)}`:""; fetch(`/api/products${query}`, { cache: "no-store" }).then(async response => { const result = await response.json() as { products?: Product[]; error?: string }; if (!response.ok) throw new Error(result.error); setProducts(result.products ?? []) }).catch(error => setLoadError(error instanceof Error ? error.message : "Could not load products.")).finally(() => setLoading(false)) }, [categorySlug,subcategorySlug]);
  const visible = useMemo(() => {
    const matches=(values:string[]|undefined,value:string|null|undefined)=>!values?.length||(value?values.some(item=>item.toLowerCase()===value.toLowerCase()):false);
    const matchesAny=(selected:string[]|undefined,values:string[])=>!selected?.length||selected.some(item=>values.some(value=>value.toLowerCase()===item.toLowerCase()));
    const inCollection=(product:Product,name:string)=>(product.collections??[]).some(collection=>collection.toLowerCase()===name.toLowerCase());
    const catalogPosition=new Map(products.map((product,index)=>[product.id,index]));
    const list=products.filter(product=>{
      const price=Number(product.price);
      const priceMatch=!filters.Price?.length||filters.Price.some(range=>range==="Under 1000"?price<1000:range==="Under 2000"?price<2000:range==="Under 3000"?price<3000:range==="Above 5000"?price>5000:false);
      const frameColors=product.variants.find(variant=>variant.name.toLowerCase().includes("frame")&&variant.name.toLowerCase().includes("color"))?.values??[];
      return priceMatch&&matchesAny(filters.Gender,product.genders??[])&&matches(filters.Material,product.material)&&matchesAny(filters.Collections,product.collections??[])&&matches(filters.Shape,product.shape)&&matches(filters.Rim,product.rim)&&matchesAny(filters.Brand,product.brands??[])&&matchesAny(filters.Color,frameColors);
    });
    if(sort==="Relevance")list.sort((a,b)=>Number(b.quantity>0)-Number(a.quantity>0)||(catalogPosition.get(a.id)??0)-(catalogPosition.get(b.id)??0));
    if(sort==="Price Low to High")list.sort((a,b)=>Number(a.price)-Number(b.price));
    if(sort==="Price High to Low")list.sort((a,b)=>Number(b.price)-Number(a.price));
    if(sort==="New Arrivals")list.sort((a,b)=>Number(inCollection(b,"New Arrivals"))-Number(inCollection(a,"New Arrivals"))||Date.parse(b.createdAt)-Date.parse(a.createdAt));
    if(sort==="Top Rated")list.sort((a,b)=>Number(inCollection(b,"Top Rated"))-Number(inCollection(a,"Top Rated"))||Number(b.quantity)-Number(a.quantity)||Date.parse(b.createdAt)-Date.parse(a.createdAt));
    return list;
  },[products,filters,sort]);
  const toggleFilter=(group:ProductFilterTitle,value:string)=>setFilters(current=>{const values=current[group]??[];return {...current,[group]:values.includes(value)?values.filter(item=>item!==value):[...values,value]}});
  return <main className="plp">
    <section className="plp-hero">
      <div>
        <small>BEST SELLERS</small>
        <h1>{catalogTitle}</h1>
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
      {filtersOpen && <ProductFilters selected={filters} onToggle={toggleFilter} onHide={() => setFiltersOpen(false)} />}

      <section className={`plp-grid ${density}`}>
        {loading && <p>Loading products...</p>}
        {!loading && loadError && <p>{loadError}</p>}
        {!loading && !loadError && visible.length === 0 && <p>No products found.</p>}
        {visible.map((product, i) => <Card key={product.id} product={product} i={i} categorySlug={categorySlug} subcategorySlug={subcategorySlug} />)}
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


