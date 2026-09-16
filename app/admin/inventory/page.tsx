"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Image from "next/image";
import { AlertTriangle, ArrowDownToLine, Boxes, ChevronDown, Download, Filter, MoreHorizontal, PackageCheck, Plus, Search, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import "../products/new/new-product.css";
import "./inventory.css";

const inventory = [
  {name:"Avery Crystal",variant:"Crystal Rose / Medium",sku:"EC-AV-014-RS",image:"/images/product/1.avif",category:"Eyeglasses",available:42,committed:6,incoming:20,reorder:12,status:"In stock"},
  {name:"Luna Tortoise",variant:"Tortoise / Medium",sku:"EC-LU-022-TO",image:"/images/product/2.avif",category:"Eyeglasses",available:18,committed:4,incoming:0,reorder:10,status:"In stock"},
  {name:"Theo Navy",variant:"Navy / Wide",sku:"EC-TH-009-NV",image:"/images/product/3.avif",category:"Eyeglasses",available:0,committed:0,incoming:30,reorder:8,status:"Out of stock"},
  {name:"Nova Cat Eye",variant:"Matte Black / Narrow",sku:"EC-NO-031-BK",image:"/images/product/4.avif",category:"Sunglasses",available:7,committed:3,incoming:15,reorder:10,status:"Low stock"},
  {name:"Aviator Classic",variant:"Gold / Medium",sku:"EC-AV-028-GD",image:"/images/Aviator.webp",category:"Sunglasses",available:4,committed:2,incoming:12,reorder:10,status:"Low stock"},
  {name:"Browline Bold",variant:"Black / Wide",sku:"EC-BR-018-BK",image:"/images/Browline.webp",category:"Eyeglasses",available:23,committed:5,incoming:0,reorder:10,status:"In stock"},
  {name:"Prada PR 17",variant:"Gloss Black / Medium",sku:"EC-PR-044-BK",image:"/images/Prada.webp",category:"Designer",available:9,committed:1,incoming:8,reorder:6,status:"In stock"},
  {name:"Riley Round",variant:"Amber / Narrow",sku:"EC-RI-016-AM",image:"/images/Round.webp",category:"Blue-light",available:3,committed:1,incoming:0,reorder:8,status:"Low stock"},
];

export default function InventoryPage(){
  const [menuOpen,setMenuOpen]=useState(false),[query,setQuery]=useState(""),[stockFilter,setStockFilter]=useState("All stock"),[selected,setSelected]=useState<string[]>([]),[adjusting,setAdjusting]=useState<string|null>(null);
  const shown=useMemo(()=>inventory.filter(item=>(stockFilter==="All stock"||item.status===stockFilter)&&(`${item.name} ${item.variant} ${item.sku}`.toLowerCase().includes(query.toLowerCase()))),[query,stockFilter]);
  const toggle=(sku:string)=>setSelected(value=>value.includes(sku)?value.filter(item=>item!==sku):[...value,sku]);
  return <main className="np-admin inventory-admin">
    <AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={()=>setMenuOpen(true)}/>
      <div className="inventory-content">
        <div className="inventory-head"><div><p>Catalog</p><h1>Inventory</h1><span>Monitor stock levels and keep your products available.</span></div><div><button><Download size={16}/> Export inventory</button><button className="receive-stock"><ArrowDownToLine size={16}/> Receive stock</button></div></div>
        <section className="inventory-summary"><article><span><Boxes size={17}/></span><div><small>Total units</small><strong>2,486</strong><p>Across 128 products</p></div></article><article><span className="green"><PackageCheck size={17}/></span><div><small>Available</small><strong>2,118</strong><p>85.2% of inventory</p></div></article><article><span className="orange"><AlertTriangle size={17}/></span><div><small>Low stock</small><strong>9</strong><p>Below reorder point</p></div></article><article><span className="red"><Warehouse size={17}/></span><div><small>Out of stock</small><strong>3</strong><p>Restock required</p></div></article></section>
        <section className="inventory-panel">
          <div className="inventory-tabs"><div><button className="active">All inventory <span>128</span></button><button>Low stock <span>9</span></button><button>Out of stock <span>3</span></button><button>Incoming <span>14</span></button></div><button><Warehouse size={15}/> Eye Champ warehouse <ChevronDown size={14}/></button></div>
          <div className="inventory-tools"><label><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search product, variant, or SKU"/></label><select value={stockFilter} onChange={event=>setStockFilter(event.target.value)}><option>All stock</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select><select><option>All categories</option><option>Eyeglasses</option><option>Sunglasses</option><option>Designer</option><option>Blue-light</option></select></div>
          {selected.length>0&&<div className="inventory-bulk"><strong>{selected.length} variants selected</strong><button>Update quantities</button><button>Create transfer</button><button>Export selected</button><button onClick={()=>setSelected([])}>Clear</button></div>}
          <div className="inventory-table"><table><thead><tr><th><input type="checkbox" checked={shown.length>0&&selected.length===shown.length} onChange={event=>setSelected(event.target.checked?shown.map(item=>item.sku):[])}/></th><th>Product / variant</th><th>SKU</th><th>Status</th><th>Available</th><th>Committed</th><th>Incoming</th><th>Reorder point</th><th/></tr></thead><tbody>{shown.map(item=><tr key={item.sku}><td><input type="checkbox" checked={selected.includes(item.sku)} onChange={()=>toggle(item.sku)}/></td><td><div className="inventory-product"><span><Image src={item.image} alt="" width={68} height={48}/></span><div><strong>{item.name}</strong><small>{item.variant}</small></div></div></td><td><code>{item.sku}</code></td><td><StockBadge status={item.status}/></td><td><div className="quantity-cell"><strong>{item.available}</strong><button onClick={()=>setAdjusting(item.sku)}><Plus size={13}/> Adjust</button></div></td><td>{item.committed}</td><td>{item.incoming>0?<span className="incoming">+{item.incoming}</span>:"—"}</td><td>{item.reorder}</td><td><button aria-label={`Actions for ${item.name}`}><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table></div>
          {shown.length===0&&<div className="inventory-empty"><Boxes size={32}/><h2>No inventory found</h2><p>Try changing your search or stock filter.</p><button onClick={()=>{setQuery("");setStockFilter("All stock")}}>Clear filters</button></div>}
          <div className="inventory-pagination"><span>Showing 1–{shown.length} of 128 variants</span><div><button disabled>←</button><button className="active">1</button><button>2</button><button>3</button><button>…</button><button>16</button><button>→</button></div></div>
        </section>
      </div>
    </section>
    {adjusting&&<div className="adjust-backdrop" onClick={()=>setAdjusting(null)}><section className="adjust-modal" onClick={event=>event.stopPropagation()}><div><h2>Adjust inventory</h2><button onClick={()=>setAdjusting(null)}>×</button></div><p>{adjusting} · Eye Champ warehouse</p><label>Adjustment<select><option>Add</option><option>Remove</option><option>Set exact quantity</option></select></label><label>Quantity<input type="number" min="0" defaultValue="1"/></label><label>Reason<select><option>Stock received</option><option>Inventory correction</option><option>Damaged</option><option>Returned</option></select></label><footer><button onClick={()=>setAdjusting(null)}>Cancel</button><button className="save" onClick={()=>setAdjusting(null)}>Save adjustment</button></footer></section></div>}
  </main>
}

function StockBadge({status}:{status:string}){return <span className={`inventory-badge ${status.toLowerCase().replaceAll(" ","-")}`}><i/>{status}</span>}
