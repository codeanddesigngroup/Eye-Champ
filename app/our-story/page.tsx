import type { Metadata } from "next";
import HistoryExperience from "./HistoryExperience";

export const metadata: Metadata = {
  title: "Our Icons History | Eye Champ",
  description: "Explore Wayfarer, Aviator, Round and Clubmaster, and travel through the decades of Ray-Ban eyewear.",
};

export default function OurIconsHistoryPage() {
  return <HistoryExperience />;
}
