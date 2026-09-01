"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { showAuthToast } from "@/components/AuthToast";
import { ArrowLeft, Boxes, CircleDollarSign, Package, Tag } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import "../../products/new/new-product.css";
import "./view-product.css";

type Product = {
  id: string; title: string; slug: string; description: string; price: string; compare_price: string | null;
  cost: string | null; taxable: boolean; sku: string | null; barcode: string | null; track_quantity: boolean;
  quantity: number; continue_selling: boolean; shape: string | null; material: string | null; rim: string | null;
  fit: string | null; weight: string | null; special_feature: string | null; measurements: Record<string,string>;
  lens_compatibility: string[]; variants: {name:string;values:string[]}[]; status: string; genders: string[];
  categories: string[]; subcategories: string[]; collections: string[]; brands: string[]; tags: string[];
  media: {name:string;primary:boolean}[]; created_at: string; updated_at: string;
};

export default function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [menuOpen,setMenuOpen]=useState(false),[product,setProduct]=useState<Product|null>(null),[loading,setLoading]=useState(true);
  useEffect(()=>{fetch(`/api/admin/products/${id}`,{cache:"no-store"}).then(async response=>{const result=await response.json() as {product?:Product;error?:string};if(!response.ok||!result.product)throw new Error(result.error);setProduct(result.product)}).catch(error=>showAuthToast({message:error instanceof Error?error.message:"Could not load product.",type:"error"})).finally(()=>setLoading(false))},[id]);

  return <main className="np-admin product-view-admin"><AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/><section className="np-workspace"><AdminTopbar onMenuOpen={()=>setMenuOpen(true)}/><div className="product-view-content">
    <Link className="product-view-back" href="/admin/products"><ArrowLeft size={15}/> Products</Link>
    {loading?<div className="product-view-state">Loading product...</div>:!product?<div className="product-view-state">Product not found.</div>:<>
      <header className="product-view-head"><div><span className={`product-view-status ${product.status.toLowerCase()}`}>{product.status}</span><h1>{product.title}</h1><p>/{product.slug}</p></div><Link href="/admin/products/new">Add another product</Link></header>
      <section className="product-view-metrics"><article><CircleDollarSign/><span>Price<strong>Rs {Number(product.price).toFixed(2)}</strong></span></article><article><Package/><span>Inventory<strong>{product.quantity} available</strong></span></article><article><Boxes/><span>SKU<strong>{product.sku||"Not set"}</strong></span></article><article><Tag/><span>Category<strong>{product.categories.join(", ")||"Uncategorized"}</strong></span></article></section>
      <div className="product-view-grid"><section><h2>Description</h2><p>{product.description||"No description provided."}</p></section><section><h2>Organization</h2><Details rows={[["Gender",product.genders],["Categories",product.categories],["Subcategories",product.subcategories],["Collections",product.collections],["Brands",product.brands],["Tags",product.tags]]}/></section><section><h2>Frame specifications</h2><Details rows={[["Shape",product.shape],["Material",product.material],["Rim",product.rim],["Fit",product.fit],["Weight",product.weight?`${product.weight} g`:null],["Feature",product.special_feature]]}/></section><section><h2>Variants</h2>{product.variants.length?product.variants.map(variant=><div className="product-view-variant" key={variant.name}><strong>{variant.name}</strong><span>{variant.values.join(", ")||"No values"}</span></div>):<p>No variants added.</p>}</section><section><h2>Inventory details</h2><Details rows={[["Barcode",product.barcode],["Track quantity",product.track_quantity?"Yes":"No"],["Continue selling",product.continue_selling?"Yes":"No"],["Taxable",product.taxable?"Yes":"No"]]}/></section><section><h2>Media</h2>{product.media.length?<ul>{product.media.map(item=><li key={item.name}>{item.name}{item.primary?" (Primary)":""}</li>)}</ul>:<p>No media added.</p>}</section></div>
    </>}
  </div></section></main>;
}

function Details({rows}:{rows:[string,string|string[]|null][]}){return <dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{Array.isArray(value)?value.join(", ")||"Not set":value||"Not set"}</dd></div>)}</dl>}
