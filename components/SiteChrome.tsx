"use client";

import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import styles from "./SiteChrome.module.css";
import Topbar from "./Topbar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLensSelection = pathname === "/product/select-lenses" || pathname.endsWith("/select-lenses");

  return <>
    {!isLensSelection && <><Topbar /><Navbar /></>}
    {children}
    {!isLensSelection && <Footer />}
    <a
      className={styles.whatsapp}
      href="https://wa.me/923338888888"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
    </a>
  </>;
}
