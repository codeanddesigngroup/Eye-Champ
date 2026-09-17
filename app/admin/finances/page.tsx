"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { showAuthToast } from "@/components/AuthToast";
import { useEffect, useState } from "react";
import "../products/new/new-product.css";
import "../admin-functional.css";

type FinanceData={summary:{grossSales:number;paid:number;pending:number;refunded:number;orders:number};daily:{label:string;total:number}[];payments:{method:string;orders:number;total:number}[]};
const empty:FinanceData={summary:{grossSales:0,paid:0,pending:0,refunded:0,orders:0},daily:[],payments:[]};
const money=(value:number)=>`Rs ${Number(value||0).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function FinancesPage(){
  const [menuOpen,setMenuOpen]=useState(false),[data,setData]=useState<FinanceData>(empty),[loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/admin/finances",{credentials:"include",cache:"no-store"}).then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error||"Could not load finances.");setData({summary:{...empty.summary,...result.summary},daily:result.daily??[],payments:result.payments??[]})}).catch(error=>showAuthToast({message:error instanceof Error?error.message:"Could not load finances.",type:"error"})).finally(()=>setLoading(false))},[]);
  const max=Math.max(...data.daily.map(item=>Number(item.total)),1);
  return <main className="np-admin"><AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/><section className="np-workspace"><AdminTopbar onMenuOpen={()=>setMenuOpen(true)}/><div className="admin-functional-content">
    <header className="admin-functional-head"><div><p>Management</p><h1>Finances</h1><span>Track payments, payouts, and store financial activity.</span></div></header>
    <section className="admin-functional-summary"><article><span>Gross sales</span><strong>{money(data.summary.grossSales)}</strong><small>{data.summary.orders} orders</small></article><article><span>Paid</span><strong>{money(data.summary.paid)}</strong><small>Collected revenue</small></article><article><span>Pending</span><strong>{money(data.summary.pending)}</strong><small>Awaiting payment</small></article></section>
    <section className="admin-functional-grid"><article className="admin-functional-card"><h2>Last 7 days</h2>{loading?<div className="admin-functional-empty">Loading finances...</div>:<div className="admin-finance-list">{data.daily.map(item=><div key={item.label}><strong>{item.label}</strong><span>{money(item.total)}</span><span style={{display:"block",height:6,marginTop:8,borderRadius:8,background:`linear-gradient(90deg,#0d6666 ${Math.max(3,Number(item.total)/max*100)}%,#edf1f1 0)`}}/></div>)}</div>}</article>
    <article className="admin-functional-card"><h2>Payment methods</h2><div className="admin-functional-table"><table><thead><tr><th>Method</th><th>Orders</th><th>Total</th></tr></thead><tbody>{data.payments.map(item=><tr key={item.method}><td><strong>{item.method}</strong></td><td>{item.orders}</td><td>{money(item.total)}</td></tr>)}</tbody></table></div>{!loading&&!data.payments.length&&<div className="admin-functional-empty">No payments recorded yet.</div>}<section className="admin-functional-summary" style={{gridTemplateColumns:"1fr",marginBottom:0}}><article><span>Refunded</span><strong>{money(data.summary.refunded)}</strong><small>Refunded order value</small></article></section></article></section>
  </div></section></main>
}
