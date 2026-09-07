import type { Metadata } from "next";
import TheOnes from "./TheOnes";

export const metadata: Metadata = {
  title: "The Ones | Eye Champ",
  description: "Discover The Ones, explore exclusive eyewear and events, and find out how to join the community.",
};

export default function TheOnesPage() {
  return <TheOnes />;
}
