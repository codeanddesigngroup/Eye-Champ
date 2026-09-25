import type { Metadata } from "next";
import TrackReturns from "./TrackReturns";

export const metadata: Metadata = {
  title: "Track Returns | Eye Champ",
  description: "Track your return using your order number and the email address used at checkout.",
};

export default function TrackReturnsPage() {
  return <TrackReturns />;
}
