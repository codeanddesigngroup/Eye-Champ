"use client";

import { CircleCheck, CircleX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./AuthToast.css";

type Toast = { message: string; type: "success" | "error" };
export const AUTH_TOAST_KEY = "eye-champ-auth-toast";

export function showAuthToast(toast: Toast) {
  window.dispatchEvent(new CustomEvent<Toast>("auth-toast", { detail: toast }));
}

export default function AuthToast() {
  const pathname = usePathname();
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_TOAST_KEY);
    if (stored) {
      sessionStorage.removeItem(AUTH_TOAST_KEY);
      try { setToast(JSON.parse(stored) as Toast); } catch { /* Ignore invalid browser data. */ }
    }
  }, [pathname]);

  useEffect(() => {
    function show(event: Event) { setToast((event as CustomEvent<Toast>).detail); }
    window.addEventListener("auth-toast", show);
    return () => window.removeEventListener("auth-toast", show);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;
  const Icon = toast.type === "success" ? CircleCheck : CircleX;
  return <div className={`auth-toast ${toast.type}`} role="status" aria-live="polite">
    <Icon size={20}/><span>{toast.message}</span><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15}/></button>
  </div>;
}
