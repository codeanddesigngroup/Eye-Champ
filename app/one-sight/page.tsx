import type { Metadata } from "next";
import OneSight from "./OneSight";

export const metadata: Metadata = {
  title: "One Sight | Eye Champ",
  description: "Discover the OneSight EssilorLuxottica Foundation and how access to eye care and glasses changes lives.",
};

export default function OneSightPage() {
  return <OneSight />;
}
