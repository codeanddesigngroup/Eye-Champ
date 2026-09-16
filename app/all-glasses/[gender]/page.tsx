import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopAll from "@/app/shop-all/page";

type Gender = "Men" | "Women";

function parseGender(value: string): Gender | null {
  if (value.toLowerCase() === "men") return "Men";
  if (value.toLowerCase() === "women") return "Women";
  return null;
}

export function generateStaticParams() {
  return [{ gender: "men" }, { gender: "women" }];
}

export async function generateMetadata({ params }: { params: Promise<{ gender: string }> }): Promise<Metadata> {
  const gender = parseGender((await params).gender);
  if (!gender) return {};
  return {
    title: `${gender}'s Glasses | Eye Champ`,
    description: `Shop all active ${gender.toLowerCase()}'s glasses available from Eye Champ.`,
  };
}

export default async function GenderGlassesPage({ params }: { params: Promise<{ gender: string }> }) {
  const gender = parseGender((await params).gender);
  if (!gender) notFound();
  return <ShopAll gender={gender} catalogTitle={`${gender}'s Glasses`} />;
}
