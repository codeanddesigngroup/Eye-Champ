import type { Metadata } from "next";
import TrackOrders from "./TrackOrders";

export const metadata: Metadata = {
  title: "Track Orders | Eye Champ",
  description: "Manage your order using your order number and the email address used at checkout, or get help from customer service.",
};

export default function TrackOrdersPage() {
  return <TrackOrders />;
}
