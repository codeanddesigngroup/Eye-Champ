"use client";

import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ArrowLeft, ArrowRight, Download, Filter, Glasses, LayoutGrid, List, MoreHorizontal, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { showAuthToast } from "@/components/AuthToast";
import "./new/new-product.css";
import "./products.css";

type ApiProduct = { id: string; title: string; sku: string | null; price: number; quantity: number; status: string; categories: string[]; media: { url?: string }[]; variants: { name: string; values: string[] }[] };
type Product = { id: string; name: string; sku: string; type: string; price: number; stock: number; status: string; image: string; colors: string[] };

export default function ProductsPage() {
  const [menuOpen, setMenuOpen] = useState(false), [view, setView] = useState<"table" | "grid">("table"), [query, setQuery] = useState(""), [status, setStatus] = useState("All statuses"), [selected, setSelected] = useState<string[]>([]), [products, setProducts] = useState<Product[]>([]), [deleting, setDeleting] = useState(false), [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  useEffect(() => { fetch("/api/admin/products", { cache: "no-store" }).then(async response => { const result = await response.json() as { products?: ApiProduct[]; error?: string }; if (!response.ok) throw new Error(result.error); setProducts((result.products ?? []).map(product => ({ id: product.id, name: product.title, sku: product.sku || "No SKU", type: product.categories?.[0] || "Uncategorized", price: Number(product.price), stock: product.quantity, status: product.status, image: product.media?.[0]?.url || "/images/Browline.webp", colors: (product.variants ?? []).filter(variant => variant.name.toLowerCase().includes("color")).flatMap(variant => variant.values).map(productColor) }))) }).catch(() => showAuthToast({ message: "Could not load products.", type: "error" })) }, []);
  const shown = useMemo(() => products.filter(p => (status === "All statuses" || p.status === status) && (`${p.name} ${p.sku} ${p.type}`.toLowerCase().includes(query.toLowerCase()))), [products, query, status]);
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const deleteProducts = async () => {
    if (!selected.length) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected }) });
      const result = await response.json() as { deleted?: number; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not delete products.");
      setProducts(current => current.filter(product => !selected.includes(product.id))); setSelected([]); setDeleteConfirmOpen(false);
      showAuthToast({ message: `${result.deleted ?? 0} product${result.deleted === 1 ? "" : "s"} deleted.`, type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not delete products.", type: "error" }); }
    finally { setDeleting(false); }
  };
  return <main className="np-admin pc-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace"><AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="pc-content"><div className="pc-head"><div><p>Catalog</p><h1>Products</h1><span>Manage products, inventory, pricing, and visibility.</span></div><div><button><Download size={16} /> Export</button><Link href="/admin/products/new"><Plus size={17} /> Add product</Link></div></div>
        <section className="pc-summary"><article><span>All products</span><strong>{products.length}</strong><small>Products in database</small></article><article><span>Active</span><strong>{products.filter(product => product.status === "Active").length}</strong><small><i className="green" /> Published in store</small></article><article><span>Low stock</span><strong>{products.filter(product => product.stock > 0 && product.stock < 10).length}</strong><small><i className="orange" /> Needs attention</small></article><article><span>Out of stock</span><strong>{products.filter(product => product.stock === 0).length}</strong><small><i className="red" /> Currently unavailable</small></article></section>
        <section className="pc-catalog"><div className="pc-tabs"><div><button className="active">All <span>{products.length}</span></button><button>Active <span>{products.filter(product => product.status === "Active").length}</span></button><button>Draft <span>{products.filter(product => product.status === "Draft").length}</span></button><button>Archived <span>{products.filter(product => product.status === "Archived").length}</span></button></div><button><SlidersHorizontal size={15} /> Manage columns</button></div>
          <div className="pc-tools"><label><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by product name or SKU" /></label><select value={status} onChange={e => setStatus(e.target.value)}><option>All statuses</option><option>Active</option><option>Draft</option><option>Archived</option></select><select><option>All categories</option>{[...new Set(products.map(product => product.type))].map(type => <option key={type}>{type}</option>)}</select><button className="pc-filter"><Filter size={15} /> More filters</button><div className="pc-view"><button className={view === "table" ? "active" : ""} onClick={() => setView("table")} aria-label="Table view"><List size={17} /></button><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><LayoutGrid size={17} /></button></div></div>
          {selected.length > 0 && <div className="pc-bulk"><strong>{selected.length} selected</strong><button>Set as active</button><button>Archive</button><button onClick={() => setDeleteConfirmOpen(true)}>Delete</button><button onClick={() => setSelected([])}>Clear</button></div>}
          {view === "table" ? <div className="pc-tablewrap"><table><thead><tr><th><input type="checkbox" checked={shown.length > 0 && selected.length === shown.length} onChange={e => setSelected(e.target.checked ? shown.map(p => p.id) : [])} /></th><th>Product</th><th>Status</th><th>Inventory</th><th>Type</th><th>Price</th><th>Colors</th><th /></tr></thead><tbody>{shown.map(p => <tr key={p.id}><td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} /></td><td><div className="pc-product"><span><Image src={p.image} alt="" width={70} height={52} /></span><div><Link href={`/admin/products/${p.id}`}><strong>{p.name}</strong></Link><small>{p.sku}</small></div></div></td><td><Status value={p.status} /></td><td><Stock value={p.stock} /></td><td>{p.type}</td><td><strong>Rs {p.price.toFixed(2)}</strong></td><td><div className="pc-colors">{p.colors.map(c => <i style={{ background: c }} key={c} />)}</div></td><td><button aria-label={`Actions for ${p.name}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div> : <div className="pc-grid">{shown.map(p => <article key={p.id}><label><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} /></label><button className="more"><MoreHorizontal size={18} /></button><div className="photo"><Image src={p.image} alt={p.name} width={240} height={160} /></div><div className="info"><div><Status value={p.status} /><small>{p.sku}</small></div><h2><Link href={`/admin/products/${p.id}`}>{p.name}</Link></h2><p>{p.type}</p><footer><strong>Rs {p.price.toFixed(2)}</strong><Stock value={p.stock} /></footer></div></article>)}</div>}
          {shown.length === 0 && <div className="pc-empty"><Glasses size={32} /><h2>No products found</h2><p>Try changing your search or filter selection.</p><button onClick={() => { setQuery(""); setStatus("All statuses") }}>Clear filters</button></div>}
          <div className="pc-pagination"><span>Showing {shown.length} of {products.length} products</span><div><button disabled aria-label="Previous page"><ArrowLeft size={13} /></button><button className="active">1</button><button disabled aria-label="Next page"><ArrowRight size={13} /></button></div></div>
        </section>
      </div>
    </section>
    {deleteConfirmOpen && <div className="pc-confirm-backdrop" onMouseDown={() => !deleting && setDeleteConfirmOpen(false)}><section className="pc-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-products-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="pc-confirm-close" type="button" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} aria-label="Close"><X size={18}/></button>
      <span className="pc-confirm-icon"><Trash2 size={22}/></span><h2 id="delete-products-title">Delete {selected.length} product{selected.length === 1 ? "" : "s"}?</h2><p>This permanently removes the selected product{selected.length === 1 ? "" : "s"} from your catalog and cannot be undone.</p>
      <footer><button type="button" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Cancel</button><button type="button" className="danger" onClick={deleteProducts} disabled={deleting}>{deleting ? "Deleting..." : "Delete permanently"}</button></footer>
    </section></div>}
  </main>
}
function Status({ value }: { value: string }) { return <span className={`pc-status ${value.toLowerCase()}`}><i />{value}</span> }
function Stock({ value }: { value: number }) { return <span className={`pc-stock ${value === 0 ? "out" : value < 10 ? "low" : ""}`}>{value === 0 ? "Out of stock" : value < 10 ? `${value} in stock` : `${value} in stock`}</span> }
function productColor(value: string) { const colors: Record<string, string> = { black: "#151515", brown: "#795036", blue: "#315f91", navy: "#173a67", red: "#a94747", green: "#49735a", gold: "#b79a53", silver: "#aeb7ba", clear: "#e8eeee", white: "#f4f4f4", pink: "#d9a6ad", tortoiseshell: "#6f431f" }; return value.startsWith("#") ? value : colors[value.toLowerCase()] ?? "#8a999d" }
