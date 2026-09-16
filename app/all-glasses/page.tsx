import type { Metadata } from "next";
import ShopAll from "@/app/shop-all/page";

export const metadata: Metadata = {
  title: "All Glasses | Eye Champ",
  description: "Shop all active glasses available from Eye Champ.",
};

export default function AllGlassesPage() {
  return <ShopAll catalogTitle="All Glasses" />;
}
