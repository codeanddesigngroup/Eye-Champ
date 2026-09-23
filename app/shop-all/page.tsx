"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Heart, House, Plus, SlidersHorizontal, Star, X } from "lucide-react";
import ProductFilters, { productFilterGroups, type ProductFilterSelection, type ProductFilterTitle } from "@/components/ProductFilters";
import Link from "next/link";
import { notFound } from "next/navigation";
import { favoritesUpdatedEvent, getFavorites, toggleFavorite } from "@/lib/favorites";
import "./shop-all.css";

type Media = { name?: string; url: string; primary?: boolean };
type Variant = { name: string; values: string[]; mediaByValue?: Record<string, Media[]> };
type Product = { id: string; title: string; slug: string; price: number; discountPercent: number; quantity: number; rating?: number; reviewCount?: number; shape: string | null; material: string | null; rim: string | null; genders: string[]; categories: string[]; collections: string[]; subcategories: string[]; brands: string[]; media: Media[]; variants: Variant[]; createdAt: string; categorySlug: string | null; subcategorySlug: string | null };

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
const formatMoney = (currency:string, value:number) => `${currency} ${Number(value || 0).toFixed(2)}`;

function Card({ product, categorySlug, subcategorySlug, currency }: { product: Product; categorySlug?: string; subcategorySlug?: string; currency:string }) {
  const [liked, setLiked] = useState(false);
  const frameColors = product.variants.find(variant => variant.name.toLowerCase().includes("frame") && variant.name.toLowerCase().includes("color"));
  const colors = frameColors?.values ?? [];
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const colorMedia = selectedColor ? frameColors?.mediaByValue?.[selectedColor] : undefined;
  const image = colorMedia?.[0]?.url || product.media?.find(item => item.primary)?.url || product.media?.[0]?.url;
  const collection = product.collections?.[0];
  const rating = Number(product.rating ?? 0);
  const reviewCount = Number(product.reviewCount ?? 0);
  const mainPath=categorySlug||product.categorySlug||"shop-all",subPath=(subcategorySlug&&subcategorySlug!=="all"?subcategorySlug:product.subcategorySlug)||"all";
  const salePrice=Number(product.price)*(1-Number(product.discountPercent||0)/100);
  useEffect(()=>{const refresh=()=>setLiked(getFavorites().some(item=>item.id===product.id));refresh();window.addEventListener(favoritesUpdatedEvent,refresh);return()=>window.removeEventListener(favoritesUpdatedEvent,refresh)},[product.id]);
  const toggleLiked=()=>setLiked(toggleFavorite({...product,price:salePrice,categorySlug:mainPath,subcategorySlug:subPath}));
  return <article className={`plp-card ${product.quantity<=0?"is-out-of-stock":""}`}><Link className="plp-card-link" href={`/${mainPath}/${subPath}/${product.slug}`} aria-label={`View ${product.title}`} /><div className="plp-photo">{product.quantity<=0?<span className="plp-stock-badge">Out of stock</span>:collection&&<span className="plp-badge">{collection}</span>}<button type="button" className="plp-heart" onClick={toggleLiked} aria-label={liked?"Remove from favorites":"Add to favorites"}><Heart fill={liked ? "#053f44" : "none"} /></button>{image?<img src={image} alt={product.title}/>:<span className="plp-no-image">No image</span>}</div><div className="plp-card-line"><div className="plp-prices"><div className="plp-price-current"><b>{formatMoney(currency,salePrice)}</b>{Number(product.discountPercent)>0&&<small>Save {Number(product.discountPercent)}%</small>}</div>{Number(product.discountPercent)>0&&<div className="plp-price-was">Was <del>{formatMoney(currency,Number(product.price))}</del></div>}</div>{reviewCount > 0 && <span aria-label={`${rating} out of 5 stars from ${reviewCount} reviews`}><Star fill="currentColor" /> {rating} ({reviewCount})</span>}</div><p>{product.title}</p><strong className="plp-shape">{product.shape || "Classic"}</strong>{colors.length > 0 && <div className="plp-swatches" aria-label="Frame colors">{colors.slice(0, 3).map(color => <button type="button" key={color} className={`color-choice ${selectedColor === color ? "selected" : ""}`} style={{background:frameColor(color)}} onClick={() => setSelectedColor(color)} aria-label={`Select ${color} color`} title={color} aria-pressed={selectedColor === color} />)}{colors.length > 3 && <Link className="more-colors" href={`/${mainPath}/${subPath}/${product.slug}`} aria-label={`View ${product.title} with ${colors.length - 3} additional colors`} title={`${colors.length - 3} more colors`}><Plus aria-hidden="true" /></Link>}</div>}</article>;
}

function GridIcon({ size }: { size: 2 | 3 }) { return <span className={`grid-icon grid-icon-${size}`}>{Array.from({ length: size * size }, (_, i) => <i key={i} />)}</span> }

type CatalogQuery = Partial<Record<"gender"|"collection"|"shape"|"material"|"brand"|"rim"|"maxPrice"|"onSale",string>>;

export default function ShopAll({categorySlug="",subcategorySlug="",catalogTitle="The A-List Collection",catalogQuery={}}:{categorySlug?:string;subcategorySlug?:string;catalogTitle?:string;catalogQuery?:CatalogQuery}) {
  const [filtersOpen, setFiltersOpen] = useState(true), [mobileFiltersOpen, setMobileFiltersOpen] = useState(false), [sort, setSort] = useState("Relevance"), [filters, setFilters] = useState<ProductFilterSelection>({}), [focusGroup, setFocusGroup] = useState<ProductFilterTitle | null>(null), [focusRequest, setFocusRequest] = useState(0), [faq, setFaq] = useState<number | null>(null), [density, setDensity] = useState<"roomy" | "compact">("compact");
  const [missing, setMissing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");
  const [activeOptions, setActiveOptions] = useState<{collections:string[];brands:string[]}>({ collections:[], brands:[] });
  const [currency, setCurrency] = useState("PKR");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => { setSearchTerm(new URLSearchParams(window.location.search).get("search")?.trim() ?? ""); }, []);
  const catalogQueryString=new URLSearchParams(catalogQuery as Record<string,string>).toString();
  useEffect(() => { const params=new URLSearchParams(catalogQueryString);if(categorySlug){params.set("category",categorySlug);params.set("subcategory",subcategorySlug)}const query=params.size?`?${params.toString()}`:""; fetch(`/api/products${query}`, { cache: "no-store" }).then(async response => { const result = await response.json() as { products?: Product[]; error?: string }; if (response.status === 404) { setMissing(true); return; } if (!response.ok) throw new Error(result.error); setProducts(result.products ?? []) }).catch(error => setLoadError(error instanceof Error ? error.message : "Could not load products.")).finally(() => setLoading(false)) }, [categorySlug,subcategorySlug,catalogQueryString]);
  useEffect(() => { fetch("/api/products/categories/navigation", { cache:"no-store" }).then(async response => { const result = await response.json() as { collections?:string[]; brands?:string[] }; if (!response.ok) throw new Error(); setActiveOptions({ collections:result.collections ?? [], brands:result.brands ?? [] }) }).catch(() => setActiveOptions({ collections:[], brands:[] })) }, []);
  useEffect(() => { fetch("/api/products/settings", { cache:"no-store" }).then(async response => { const result = await response.json() as { currency?:string }; if (response.ok && result.currency) setCurrency(result.currency) }).catch(() => undefined) }, []);
  const visible = useMemo(() => {
    const matches=(values:string[]|undefined,value:string|null|undefined)=>!values?.length||(value?values.some(item=>item.toLowerCase()===value.toLowerCase()):false);
    const matchesAny=(selected:string[]|undefined,values:string[])=>!selected?.length||selected.some(item=>values.some(value=>value.toLowerCase()===item.toLowerCase()));
    const inCollection=(product:Product,name:string)=>(product.collections??[]).some(collection=>collection.toLowerCase()===name.toLowerCase());
    const catalogPosition=new Map(products.map((product,index)=>[product.id,index]));
    const list=products.filter(product=>{
      const price=Number(product.price);
      const priceMatch=!filters.Price?.length||filters.Price.some(range=>range==="Under 1000"?price<1000:range==="Under 2000"?price<2000:range==="Under 3000"?price<3000:range==="Above 5000"?price>5000:false);
      const frameColors=product.variants.find(variant=>variant.name.toLowerCase().includes("frame")&&variant.name.toLowerCase().includes("color"))?.values??[];
      const frameSizes=product.variants.filter(variant=>variant.name.toLowerCase().includes("size")).flatMap(variant=>variant.values);
      const searchableText=[product.title,product.shape,product.material,product.rim,...(product.genders??[]),...(product.categories??[]),...(product.subcategories??[]),...(product.collections??[]),...(product.brands??[]),...frameColors].join(" ").toLowerCase();
      const searchMatch=searchTerm.toLowerCase().split(/\s+/).filter(Boolean).every(term=>searchableText.includes(term));
      return searchMatch&&priceMatch&&matchesAny(filters.Size,frameSizes)&&matchesAny(filters.Gender,product.genders??[])&&matches(filters.Material,product.material)&&matchesAny(filters.Collections,product.collections??[])&&matches(filters.Shape,product.shape)&&matches(filters.Rim,product.rim)&&matchesAny(filters.Brand,product.brands??[])&&matchesAny(filters.Color,frameColors);
    });
    if(sort==="Relevance")list.sort((a,b)=>Number(b.quantity>0)-Number(a.quantity>0)||(catalogPosition.get(a.id)??0)-(catalogPosition.get(b.id)??0));
    if(sort==="Price Low to High")list.sort((a,b)=>Number(a.price)-Number(b.price));
    if(sort==="Price High to Low")list.sort((a,b)=>Number(b.price)-Number(a.price));
    if(sort==="New Arrivals")list.sort((a,b)=>Number(inCollection(b,"New Arrivals"))-Number(inCollection(a,"New Arrivals"))||Date.parse(b.createdAt)-Date.parse(a.createdAt));
    if(sort==="Top Rated")list.sort((a,b)=>Number(inCollection(b,"Top Rated"))-Number(inCollection(a,"Top Rated"))||Number(b.quantity)-Number(a.quantity)||Date.parse(b.createdAt)-Date.parse(a.createdAt));
    return list;
  },[products,filters,sort,searchTerm]);
  const toggleFilter=(group:ProductFilterTitle,value:string)=>setFilters(current=>{const values=current[group]??[];return {...current,[group]:values.includes(value)?values.filter(item=>item!==value):[...values,value]}});
  const activeFilters=productFilterGroups.flatMap(([group])=>(filters[group]??[]).map(value=>({group,value})));
  const selectedCount=activeFilters.length;
  const categoryName=categorySlug.split("-").filter(Boolean).map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ");
  const hasSubcategory=Boolean(categorySlug&&catalogTitle.toLowerCase()!==categoryName.toLowerCase());
  const openFilters=(group:ProductFilterTitle|null=null)=>{setFiltersOpen(true);setMobileFiltersOpen(true);setFocusGroup(group);setFocusRequest(current=>current+1)};
  if (missing) notFound();
  return <main className="plp">
    {categorySlug&&<nav className="plp-breadcrumb" aria-label="Breadcrumb">
      <Link href="/" aria-label="Home"><House aria-hidden="true"/><span>Home</span></Link>
      <ChevronRight aria-hidden="true"/>
      {hasSubcategory?<><Link href={`/${categorySlug}/all`}>{categoryName}</Link><ChevronRight aria-hidden="true"/><span aria-current="page">{catalogTitle}</span></>:<span aria-current="page">{categoryName}</span>}
    </nav>}
    <section className="plp-hero">
      <div>
        <h1>{catalogTitle}</h1>
        <p>Featuring fan favorites and breakout hits.</p>
      </div>
    </section>

    <div className={`plp-chips ${filtersOpen ? "" : "filters-collapsed"}`} aria-label="Quick filters">
      <div className="plp-quick-row">
        <button type="button" className="plp-quick-pill" onClick={()=>openFilters()}><SlidersHorizontal aria-hidden="true"/>Filters{selectedCount>0&&<b>{selectedCount}</b>}</button>
        <button type="button" className="plp-quick-pill" onClick={()=>openFilters("Shape")}>Shape{(filters.Shape?.length??0)>0&&<b>{filters.Shape?.length}</b>}<ChevronDown aria-hidden="true"/></button>
        <button type="button" className="plp-quick-pill" onClick={()=>openFilters("Size")}>Size{(filters.Size?.length??0)>0&&<b>{filters.Size?.length}</b>}<ChevronDown aria-hidden="true"/></button>
      </div>
      {selectedCount>0&&<div className="plp-active-filters">{activeFilters.map(({group,value})=><button type="button" key={`${group}-${value}`} className="plp-active-chip" onClick={()=>toggleFilter(group,value)}>{value}<X aria-hidden="true"/></button>)}<button type="button" className="plp-clear-filters" onClick={()=>setFilters({})}>Clear all</button></div>}
    </div>

    <section className="plp-tools">
      <button className="filter-button" onClick={() => openFilters()}><SlidersHorizontal /> Filter & Sort</button>
      <span>{visible.length ? `Showing 1-${visible.length} of ${products.length} results` : `Showing 0 of ${products.length} results`}</span>
      <div className="grid-switch">
        <span className="mobile-grid-label">Grid View</span>
        <button type="button" className={density === "roomy" ? "active" : ""} onClick={() => setDensity("roomy")} aria-label="One-column grid" aria-pressed={density === "roomy"}><GridIcon size={2} /><span className="mobile-grid-icon mobile-grid-roomy" aria-hidden="true"><i /><i /></span></button>
        <button type="button" className={density === "compact" ? "active" : ""} onClick={() => setDensity("compact")} aria-label="Two-column grid" aria-pressed={density === "compact"}><GridIcon size={3} /><span className="mobile-grid-icon mobile-grid-compact" aria-hidden="true"><i /><i /><i /><i /></span></button>
      </div>
      <label>Sort By: <span className="plp-sort-control"><select value={sort} onChange={e => setSort(e.target.value)}>{["Relevance", "New Arrivals", "Top Rated", "Price Low to High", "Price High to Low"].map(x => <option key={x}>{x}</option>)}</select><ChevronDown aria-hidden="true" /></span></label>
    </section>

    <div className={`plp-body ${filtersOpen ? "" : "filters-hidden"}`}>
      {filtersOpen && <ProductFilters selected={filters} onToggle={toggleFilter} onHide={() => { setFiltersOpen(false); setMobileFiltersOpen(false); setFocusGroup(null); }} activeOptions={activeOptions} mobileOpen={mobileFiltersOpen} focusGroup={focusGroup} focusRequest={focusRequest} />}

      <section className={`plp-grid ${density}`}>
        {loading && <p>Loading products...</p>}
        {!loading && loadError && <p>{loadError}</p>}
        {!loading && !loadError && visible.length === 0 && <p>No products found.</p>}
        {visible.map(product => <Card key={product.id} product={product} categorySlug={categorySlug} subcategorySlug={subcategorySlug} currency={currency} />)}
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
