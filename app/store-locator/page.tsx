import type { Metadata } from "next";
import StoreLocator from "./StoreLocator";

export const metadata: Metadata = {
  title: "Store Locator | Eye Champ",
  description: "Search for nearby eyewear stores and get help checking an online reseller.",
};

export default function StoreLocatorPage() {
  return <StoreLocator />;
}
