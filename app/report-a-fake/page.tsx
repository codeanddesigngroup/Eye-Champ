import type { Metadata } from "next";
import ReportForm from "./ReportForm";

export const metadata: Metadata = {
  title: "Report a Fake | Eye Champ",
  description: "Report a website or product you suspect may be counterfeit, with a description and optional supporting attachment.",
};

export default function ReportAFakePage() {
  return <ReportForm />;
}
