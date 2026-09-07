import type { Metadata } from "next";
import TrackReturns from "./TrackReturns";

export const metadata: Metadata = {
  title: "Track Returns | Eye Champ",
  description: "Track your return using your return number and the email address used at checkout.",
};

export default function TrackReturnsPage() {
  return <TrackReturns />;
}
