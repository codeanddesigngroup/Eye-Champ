"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import Image from "next/image";
import { AlertTriangle, ArrowDownToLine, Boxes, ChevronDown, Download, MoreHorizontal, PackageCheck, Plus, Search, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { showAuthToast } from "@/components/AuthToast";
import "../products/new/new-product.css";
import "./inventory.css";

type InventoryItem = { id:string; name:string; variant:string; sku:string; image:string; category:string; available:number; committed:number; incoming:number; reorder:number; status:string; productStatus:string };

export default function InventoryPage(){
  const [menuOpen,setMenuOpen]=useState(false),[query,setQuery]=useState(""),[stockFilter,setStockFilter]=useState("All stock"),[categoryFilter,setCategoryFilter]=useState("All categories"),[selected,setSelected]=useState<string[]>([]),[adjusting,setAdjusting]=useState<InventoryItem|null>(null);
  const [inventory,setInventory]=useState<InventoryItem[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[adjustment,setAdjustment]=useState({mode:"Add",quantity:1,reason:"Stock received"}),[saving,setSaving]=useState(false);
  const loadInventory=()=>fetch("/api/admin/inventory",{credentials:"include",cache:"no-store"}).then(async response=>{const result=await response.json() as {inventory?:InventoryItem[];error?:string};if(!response.ok)throw new Error(result.error||"Could not load inventory.");setInventory(result.inventory??[])});
  useEffect(()=>{loadInventory().catch(reason=>setError(reason instanceof Error?reason.message:"Could not load inventory.")).finally(()=>setLoading(false))},[]);
  const counts={low:inventory.filter(item=>item.status==="Low stock").length,out:inventory.filter(item=>item.status==="Out of stock").length,incoming:inventory.filter(item=>item.incoming>0).length,totalUnits:inventory.reduce((sum,item)=>sum+Number(item.available||0),0),available:inventory.reduce((sum,item)=>sum+Math.max(Number(item.available||0)-Number(item.committed||0),0),0)};
  const categories=useMemo(()=>["All categories",...[...new Set(inventory.map(item=>item.category).filter(Boolean))]],[inventory]);
  const shown=useMemo(()=>inventory.filter(item=>(stockFilter==="All stock"||(stockFilter==="Incoming"?item.incoming>0:item.status===stockFilter))&&(categoryFilter==="All categories"||item.category===categoryFilter)&&(`${item.name} ${item.variant} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase()))),[inventory,query,stockFilter,categoryFilter]);
  const toggle=(id:string)=>setSelected(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id]);
  const openAdjust=(item:InventoryItem)=>{setAdjusting(item);setAdjustment({mode:"Add",quantity:1,reason:"Stock received"})};
  const saveAdjustment=async()=>{
    if(!adjusting)return;
    setSaving(true);
    try{
      const response=await fetch(`/api/admin/inventory/${adjusting.id}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(adjustment)});
      const result=await response.json() as {product?:{id:string;quantity:number};error?:string};
      if(!response.ok||!result.product)throw new Error(result.error||"Could not update inventory.");
      setInventory(current=>current.map(item=>item.id===adjusting.id?{...item,available:result.product!.quantity,status:result.product!.quantity<=0?"Out of stock":result.product!.quantity<=10?"Low stock":"In stock"}:item));
      setAdjusting(null);showAuthToast({message:"Inventory updated.",type:"success"});
    }catch(reason){showAuthToast({message:reason instanceof Error?reason.message:"Could not update inventory.",type:"error"})}
    finally{setSaving(false)}
  };
  const clearFilters=()=>{setQuery("");setStockFilter("All stock");setCategoryFilter("All categories")};
  return <main className="np-admin inventory-admin">
    <AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>
    <section className="np-workspace">
      <AdminTopbar onMenuOpen={()=>setMenuOpen(true)}/>
      <div className="inventory-content">
        <div className="inventory-head"><div><p>Catalog</p><h1>Inventory</h1><span>Monitor stock levels and keep your products available.</span></div><div><button><Download size={16}/> Export inventory</button><button className="receive-stock"><ArrowDownToLine size={16}/> Receive stock</button></div></div>
        <section className="inventory-summary"><article><span><Boxes size={17}/></span><div><small>Total units</small><strong>{counts.totalUnits.toLocaleString()}</strong><p>Across {inventory.length} products</p></div></article><article><span className="green"><PackageCheck size={17}/></span><div><small>Available</small><strong>{counts.available.toLocaleString()}</strong><p>{counts.totalUnits?Math.round(counts.available/counts.totalUnits*100):0}% of inventory</p></div></article><article><span className="orange"><AlertTriangle size={17}/></span><div><small>Low stock</small><strong>{counts.low}</strong><p>10 or fewer units</p></div></article><article><span className="red"><Warehouse size={17}/></span><div><small>Out of stock</small><strong>{counts.out}</strong><p>Restock required</p></div></article></section>
        <section className="inventory-panel">
          <div className="inventory-tabs"><div><button className={stockFilter==="All stock"?"active":""} onClick={()=>setStockFilter("All stock")}>All inventory <span>{inventory.length}</span></button><button className={stockFilter==="Low stock"?"active":""} onClick={()=>setStockFilter("Low stock")}>Low stock <span>{counts.low}</span></button><button className={stockFilter==="Out of stock"?"active":""} onClick={()=>setStockFilter("Out of stock")}>Out of stock <span>{counts.out}</span></button><button className={stockFilter==="Incoming"?"active":""} onClick={()=>setStockFilter("Incoming")}>Incoming <span>{counts.incoming}</span></button></div></div>
          <div className="inventory-tools"><label><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search product, variant, or SKU"/></label><select value={stockFilter} onChange={event=>setStockFilter(event.target.value)}><option>All stock</option><option>In stock</option><option>Low stock</option><option>Out of stock</option><option>Incoming</option></select><select value={categoryFilter} onChange={event=>setCategoryFilter(event.target.value)}>{categories.map(category=><option key={category}>{category}</option>)}</select></div>
          {selected.length>0&&<div className="inventory-bulk"><strong>{selected.length} products selected</strong><button>Update quantities</button><button>Create transfer</button><button>Export selected</button><button onClick={()=>setSelected([])}>Clear</button></div>}
          {loading&&<div className="inventory-empty"><p>Loading inventory...</p></div>}
          {error&&<div className="inventory-empty"><h2>Unable to load inventory</h2><p>{error}</p><button onClick={()=>{setError("");setLoading(true);loadInventory().catch(reason=>setError(reason instanceof Error?reason.message:"Could not load inventory.")).finally(()=>setLoading(false))}}>Try again</button></div>}
          {!loading&&!error&&<div className="inventory-table"><table><thead><tr><th><input type="checkbox" checked={shown.length>0&&selected.length===shown.length} onChange={event=>setSelected(event.target.checked?shown.map(item=>item.id):[])}/></th><th>Product / variant</th><th>SKU</th><th>Status</th><th>Available</th><th>Committed</th><th>Incoming</th><th>Reorder point</th><th/></tr></thead><tbody>{shown.map(item=><tr key={item.id}><td><input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggle(item.id)}/></td><td><div className="inventory-product"><span>{item.image?<Image src={item.image} alt="" width={68} height={48}/>:<Boxes size={20}/>}</span><div><strong>{item.name}</strong><small>{item.variant}</small></div></div></td><td><code>{item.sku}</code></td><td><StockBadge status={item.status}/></td><td><div className="quantity-cell"><strong>{item.available}</strong><button onClick={()=>openAdjust(item)}><Plus size={13}/> Adjust</button></div></td><td>{item.committed}</td><td>{item.incoming>0?<span className="incoming">+{item.incoming}</span>:"-"}</td><td>{item.reorder}</td><td><button aria-label={`Actions for ${item.name}`}><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table></div>}
          {!loading&&!error&&shown.length===0&&<div className="inventory-empty"><Boxes size={32}/><h2>No inventory found</h2><p>Try changing your search or stock filter.</p><button onClick={clearFilters}>Clear filters</button></div>}
          <div className="inventory-pagination"><span>Showing {shown.length?1:0}-{shown.length} of {inventory.length} products</span><div><button disabled>←</button><button className="active">1</button><button disabled>→</button></div></div>
        </section>
      </div>
    </section>
    {adjusting&&<div className="adjust-backdrop" onClick={()=>!saving&&setAdjusting(null)}><section className="adjust-modal" onClick={event=>event.stopPropagation()}><div><h2>Adjust inventory</h2><button onClick={()=>setAdjusting(null)} disabled={saving}>×</button></div><p>{adjusting.sku} - Eye Champ warehouse</p><label>Adjustment<select value={adjustment.mode} onChange={event=>setAdjustment(current=>({...current,mode:event.target.value}))} disabled={saving}><option>Add</option><option>Remove</option><option>Set exact quantity</option></select></label><label>Quantity<input type="number" min="0" value={adjustment.quantity} onChange={event=>setAdjustment(current=>({...current,quantity:Number(event.target.value)}))} disabled={saving}/></label><label>Reason<select value={adjustment.reason} onChange={event=>setAdjustment(current=>({...current,reason:event.target.value}))} disabled={saving}><option>Stock received</option><option>Inventory correction</option><option>Damaged</option><option>Returned</option></select></label><footer><button onClick={()=>setAdjusting(null)} disabled={saving}>Cancel</button><button className="save" onClick={saveAdjustment} disabled={saving}>{saving?"Saving...":"Save adjustment"}</button></footer></section></div>}
  </main>
}

function StockBadge({status}:{status:string}){return <span className={`inventory-badge ${status.toLowerCase().replaceAll(" ","-")}`}><i/>{status}</span>}
