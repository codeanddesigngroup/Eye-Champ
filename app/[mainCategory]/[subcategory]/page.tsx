"use client";

import ShopAll from "@/app/shop-all/page";
import { use } from "react";

const titleFromSlug = (slug: string) => decodeURIComponent(slug).split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

export default function CategoryProductsPage({params}:{params:Promise<{mainCategory:string;subcategory:string}>}) {
  const {mainCategory,subcategory}=use(params);
  const isNewArrivals=subcategory==="new-arrivals";
  const isUnder5000=subcategory==="under-5000";
  const isSpecialCatalog=isNewArrivals||isUnder5000;
  const categoryTitle=titleFromSlug(mainCategory);
  const title=isNewArrivals?`New Arrival ${categoryTitle}`:isUnder5000?`${categoryTitle} Under Rs. 5000`:subcategory==="all"?categoryTitle:titleFromSlug(subcategory);
  const catalogQuery=isNewArrivals?{collection:"New Arrivals"}:isUnder5000?{maxPrice:"5000"}:{};
  return <ShopAll categorySlug={mainCategory} subcategorySlug={isSpecialCatalog?"":subcategory} catalogTitle={title} catalogQuery={catalogQuery}/>;
}
