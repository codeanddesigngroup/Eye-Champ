import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopAll from "@/app/shop-all/page";

const catalogs = {
  men: { title: "Men's Glasses", query: { gender: "Men" } },
  women: { title: "Women's Glasses", query: { gender: "Women" } },
  "under-5000": { title: "Glasses Under Rs. 5000", query: { maxPrice: "5000" } },
  "new-arrivals": { title: "New Arrivals", query: { collection: "New Arrivals" } },
  "best-sellers": { title: "All Best Sellers", query: { collection: "Best Sellers" } },
  "top-rated": { title: "Top Rated Glasses", query: { collection: "Top Rated" } },
  rectangle: { title: "Rectangle Glasses", query: { shape: "Rectangle" } },
  "mix-material": { title: "Mix Material Glasses", query: { material: "Mix Material" } },
  "ray-ban": { title: "Ray-Ban Glasses", query: { brand: "Ray-Ban" } },
  "full-rim": { title: "Full Rim Glasses", query: { rim: "Full Rim" } },
  "on-sale": { title: "Glasses On Sale", query: { onSale: "true" } },
} as const;

type CatalogSlug = keyof typeof catalogs;

function getCatalog(value: string) {
  return catalogs[value.toLowerCase() as CatalogSlug];
}

export function generateStaticParams() {
  return Object.keys(catalogs).map(filter => ({ filter }));
}

export async function generateMetadata({ params }: { params: Promise<{ filter: string }> }): Promise<Metadata> {
  const catalog = getCatalog((await params).filter);
  if (!catalog) return {};
  return { title: `${catalog.title} | Eye Champ`, description: `Shop ${catalog.title.toLowerCase()} available from Eye Champ.` };
}

export default async function FilteredGlassesPage({ params }: { params: Promise<{ filter: string }> }) {
  const catalog = getCatalog((await params).filter);
  if (!catalog) notFound();
  return <ShopAll catalogTitle={catalog.title} catalogQuery={catalog.query} />;
}
