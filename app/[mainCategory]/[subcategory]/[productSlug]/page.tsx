"use client";

import ProductPage, { type DatabaseProduct } from "@/app/product/page";
import { use, useEffect, useState } from "react";

export default function DatabaseProductPage({params}:{params:Promise<{mainCategory:string;subcategory:string;productSlug:string}>}){
  const {productSlug}=use(params);
  const [product,setProduct]=useState<DatabaseProduct|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
  useEffect(()=>{fetch(`/api/products/detail/${encodeURIComponent(productSlug)}`,{cache:"no-store"}).then(async response=>{const result=await response.json() as {product?:DatabaseProduct;error?:string};if(!response.ok||!result.product)throw new Error(result.error||"Product not found.");setProduct(result.product)}).catch(reason=>setError(reason instanceof Error?reason.message:"Could not load product.")).finally(()=>setLoading(false))},[productSlug]);
  if(loading)return <main className="pdp productDetails"><div className="wrap" style={{padding:"80px 0"}}>Loading product...</div></main>;
  if(error||!product)return <main className="pdp productDetails"><div className="wrap" style={{padding:"80px 0"}}>{error||"Product not found."}</div></main>;
  return <ProductPage databaseProduct={product}/>;
}
