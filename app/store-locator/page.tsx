import type { Metadata } from "next";
import StoreLocator from "./StoreLocator";

export const metadata: Metadata = {
  title: "Store Locator | Eye Champ",
  description: "Visit our Karachi store to browse frames in person and get expert fitting help. Find our address and get directions.",
};

export default function StoreLocatorPage() {
  return <StoreLocator />;
}
