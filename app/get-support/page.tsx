import type { Metadata } from "next";
import Support from "./Support";

export const metadata: Metadata = {
  title: "Get Support | Eye Champ",
  description: "Find help with orders, shipping, returns, payments, eyewear sizing and care, or contact our support team.",
};

export default function GetSupportPage() {
  return <Support />;
}
