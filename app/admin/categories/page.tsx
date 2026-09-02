"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpDown, ArrowUpRight, ChevronDown, ChevronRight, Filter, Layers3, MoreHorizontal, Plus, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { showAuthToast } from "@/components/AuthToast";
import "../products/new/new-product.css";
import "./categories.css";

type Category = { id: string; name: string; slug: string; parentId: string | null; description: string; products: number; status: string; type: string; image: string; updated: string };
export default function CategoriesPage() {
  const [menuOpen, setMenuOpen] = useState(false), [query, setQuery] = useState(""), [status, setStatus] = useState("All statuses"), [selected, setSelected] = useState<string[]>([]), [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]), [expanded, setExpanded] = useState<string[]>([]), [name, setName] = useState(""), [parentId, setParentId] = useState(""), [newStatus, setNewStatus] = useState("Active"), [newType, setNewType] = useState("Manual"), [, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false), [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    fetch("/api/admin/categories", { cache: "no-store" }).then(async response => {
      const result = await response.json() as { categories?: Category[]; error?: string };
      if (!response.ok) throw new Error(result.error);
      const loaded = result.categories ?? [];
      setCategories(loaded); setExpanded(loaded.filter(category => category.parentId === null).map(category => category.id));
    }).catch(() => showAuthToast({ message: "Could not load categories.", type: "error" })).finally(() => setLoading(false));
  }, []);
  
  const shown = useMemo(() => {
    const matches = (category: Category) => (status === "All statuses" || category.status === status) && (`${category.name} ${category.slug}`.toLowerCase().includes(query.toLowerCase()));
    if (query || status !== "All statuses") return categories.filter(matches);
    return categories.filter(category => category.parentId === null).flatMap(parent => [parent, ...(expanded.includes(parent.id) ? categories.filter(category => category.parentId === parent.id) : [])]);
  }, [categories, expanded, query, status]);
  const toggle = (id: string) => setSelected(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  const toggleParent = (id: string) => setExpanded(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
  async function createCategory() {
    const trimmed = name.trim(); if (!trimmed) return;
    try {
      const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: trimmed, parentId: parentId || null, status: newStatus, type: newType }) });
      const result = await response.json() as { category?: Category; error?: string };
      if (!response.ok || !result.category) throw new Error(result.error || "Could not create category.");
      setCategories(value => [...value, result.category!]);
      if (parentId) setExpanded(value => value.includes(parentId) ? value : [...value, parentId]);
      setName(""); setParentId(""); setNewStatus("Active"); setNewType("Manual"); setModalOpen(false);
      showAuthToast({ message: "Category created successfully.", type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not create category.", type: "error" }); }
  }
  async function bulkStatus(nextStatus: "Active" | "Draft") {
    const ids = categories.filter(category => selected.includes(category.slug)).map(category => category.id);
    const response = await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, status: nextStatus }) });
    if (!response.ok) return showAuthToast({ message: "Could not update categories.", type: "error" });
    setCategories(value => value.map(category => selected.includes(category.slug) ? { ...category, status: nextStatus, updated: "Just now" } : category)); setSelected([]);
    showAuthToast({ message: `Categories set to ${nextStatus.toLowerCase()}.`, type: "success" });
  }
  
  async function bulkDelete() {
    const ids = categories.filter(category => selected.includes(category.slug)).map(category => category.id);
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      if (!response.ok) throw new Error("Could not delete categories.");
      setCategories(value => value.filter(category => !selected.includes(category.slug))); setSelected([]); setDeleteConfirmOpen(false);
      showAuthToast({ message: "Categories deleted successfully.", type: "success" });
    } catch (error) { showAuthToast({ message: error instanceof Error ? error.message : "Could not delete categories.", type: "error" }); }
    finally { setDeleting(false); }
  }

  return <main className="np-admin categories-admin">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={() => setMenuOpen(true)} />
      <div className="categories-content">
        <div className="categories-head"><div><p>Catalog</p><h1>Categories</h1><span>Organize products into browsable groups for your storefront.</span></div><button onClick={() => setModalOpen(true)}><Plus size={17} /> Create category</button></div>
        <section className="categories-summary"><article><span><Layers3 size={17} /></span><div><small>Total categories</small><strong>{categories.length}</strong><p>{categories.filter(item => item.status === "Active").length} active, {categories.filter(item => item.status === "Draft").length} drafts</p></div></article><article><span className="green"><Sparkles size={17} /></span><div><small>Smart categories</small><strong>{categories.filter(item => item.type === "Smart").length}</strong><p>Automatically organized</p></div></article><article><span className="blue"><ArrowUpRight size={17} /></span><div><small>Most popular</small><strong>{categories.reduce((best, item) => item.products > best.products ? item : best, categories[0] ?? { name: "None", products: 0 }).name}</strong><p>{Math.max(0, ...categories.map(item => item.products))} active products</p></div></article></section>
        <section className="categories-panel">
          <div className="categories-tabs"><div><button className="active">All <span>{categories.length}</span></button><button>Active <span>{categories.filter(item => item.status === "Active").length}</span></button><button>Draft <span>{categories.filter(item => item.status === "Draft").length}</span></button></div><button>Sort: Newest <ArrowUpDown size={12}/></button></div>
          <div className="categories-tools"><label><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search categories" /></label><select value={status} onChange={event => setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Draft</option></select><select><option>All types</option><option>Manual</option><option>Smart</option></select><button><Filter size={15} /> More filters</button></div>
          {selected.length > 0 && <div className="categories-bulk"><strong>{selected.length} categories selected</strong><button onClick={() => bulkStatus("Active")}>Set active</button><button onClick={() => bulkStatus("Draft")}>Set draft</button><button onClick={() => setDeleteConfirmOpen(true)}>Delete</button><button onClick={() => setSelected([])}>Clear</button></div>}
          <div className="categories-table"><table><thead><tr><th><input type="checkbox" checked={shown.length > 0 && selected.length === shown.length} onChange={event => setSelected(event.target.checked ? shown.map(item => item.slug) : [])} /></th><th>Category</th><th>Products</th><th>Type</th><th>Status</th><th>Last updated</th><th /></tr></thead><tbody>{shown.map(category => { const childCount = categories.filter(item => item.parentId === category.id).length; return <tr className={category.parentId ? "subcategory-row" : ""} key={category.slug}><td><input type="checkbox" checked={selected.includes(category.slug)} onChange={() => toggle(category.slug)} /></td><td><div className="category-cell">{category.parentId ? <span className="category-branch">&#9492;</span> : childCount > 0 ? <button className="category-expand" onClick={() => toggleParent(category.id)} aria-label={`${expanded.includes(category.id) ? "Collapse" : "Expand"} ${category.name}`}>{expanded.includes(category.id) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button> : <span className="category-expand-spacer" />}<span className="category-photo"><Image src={category.image} alt="" width={68} height={50} /></span><div><strong>{category.name}</strong>{category.parentId && <em>Subcategory</em>}<small>/{category.slug}</small><p>{category.description}</p></div></div></td><td><strong>{category.products}</strong> products{childCount > 0 && <small className="child-count">{childCount} subcategories</small>}</td><td><span className={`category-type ${category.type.toLowerCase()}`}>{category.type === "Smart" && <Sparkles size={11} />} {category.type}</span></td><td><span className={`category-status ${category.status.toLowerCase()}`}><i />{category.status}</span></td><td>{category.updated}</td><td><button aria-label={`Actions for ${category.name}`}><MoreHorizontal size={18} /></button></td></tr> })}</tbody></table></div>
          {shown.length === 0 && <div className="categories-empty"><Layers3 size={32} /><h2>No categories found</h2><p>Try changing your search or status filter.</p><button onClick={() => { setQuery(""); setStatus("All statuses") }}>Clear filters</button></div>}
          <div className="categories-pagination"><span>Showing {shown.length} of {categories.length} categories</span><div><button disabled aria-label="Previous page"><ArrowLeft size={13}/></button><button className="active">1</button><button disabled aria-label="Next page"><ArrowRight size={13}/></button></div></div>
        </section>
      </div>
    </section>
    {modalOpen && <div className="category-modal-backdrop" onClick={() => setModalOpen(false)}><section className="category-modal" onClick={event => event.stopPropagation()}><header><div><h2>Create category</h2><p>Create a main category or place it beneath an existing one.</p></div><button onClick={() => setModalOpen(false)} aria-label="Close"><X size={19} /></button></header><form onSubmit={event => { event.preventDefault(); createCategory() }}><label>Category name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Polarized sunglasses" /></label><label>Parent category<select value={parentId} onChange={event => setParentId(event.target.value)}><option value="">None - create main category</option>{categories.filter(category => category.parentId === null).map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select><small>{parentId ? "This category will appear nested beneath its parent." : "Main categories appear at the top level."}</small></label><label>Description<textarea placeholder="Describe this category..." /></label><div className="category-form-row"><label>Category type<select value={newType} onChange={event => setNewType(event.target.value)}><option>Manual</option><option>Smart</option></select></label><label>Status<select value={newStatus} onChange={event => setNewStatus(event.target.value)}><option>Active</option><option>Draft</option></select></label></div><label className="category-image"><span>Category image</span><div><Plus size={18} /><strong>Upload image</strong><small>PNG, JPG or WEBP</small></div></label><footer><button type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="save">Create category</button></footer></form></section></div>}
    <DeleteConfirmDialog open={deleteConfirmOpen} count={selected.length} singular="category" plural="categories" deleting={deleting} onCancel={() => setDeleteConfirmOpen(false)} onConfirm={bulkDelete} />
  </main>
}




