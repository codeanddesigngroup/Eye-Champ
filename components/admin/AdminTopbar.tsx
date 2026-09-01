"use client";

import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AUTH_TOAST_KEY, showAuthToast } from "@/components/AuthToast";
import "./AdminTopbar.css";

export default function AdminTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      sessionStorage.setItem(AUTH_TOAST_KEY, JSON.stringify({ message: "Logged out successfully.", type: "success" }));
      router.replace("/admin/login");
      router.refresh();
    } catch {
      showAuthToast({ message: "Could not log out. Please try again.", type: "error" });
      setLoggingOut(false);
    }
  }

  return <header className="admin-topbar">
    <button className="admin-topbar-menu" onClick={onMenuOpen} aria-label="Open navigation"><Menu size={22} /></button>
    <label className="admin-topbar-search"><Search size={18} /><input aria-label="Search admin" placeholder="Search orders, products, customers..." /><kbd>⌘ K</kbd></label>
    <div className="admin-topbar-actions">
      <button className="admin-topbar-notifications" aria-label="Notifications"><Bell size={20} /><i /></button>
      <span className="admin-topbar-divider" />
      <div className="admin-topbar-account" ref={accountRef}>
        <button className="admin-topbar-profile" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-haspopup="menu">
          <span>A</span><div><strong>Admin</strong><small>Administrator</small></div><ChevronDown className={menuOpen ? "is-open" : ""} size={15} />
        </button>
        {menuOpen && <div className="admin-profile-menu" role="menu">
          <button type="button" role="menuitem" onClick={logout} disabled={loggingOut}><LogOut size={16} /><span>{loggingOut ? "Signing out..." : "Log out"}</span></button>
        </div>}
      </div>
    </div>
  </header>;
}
