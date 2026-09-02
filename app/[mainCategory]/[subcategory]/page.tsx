"use client";

import ShopAll from "@/app/shop-all/page";
import { use } from "react";

const titleFromSlug = (slug: string) => decodeURIComponent(slug).split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

export default function CategoryProductsPage({params}:{params:Promise<{mainCategory:string;subcategory:string}>}) {
  const {mainCategory,subcategory}=use(params);
  const title=subcategory==="all"?titleFromSlug(mainCategory):titleFromSlug(subcategory);
  return <ShopAll categorySlug={mainCategory} subcategorySlug={subcategory} catalogTitle={title}/>;
}
