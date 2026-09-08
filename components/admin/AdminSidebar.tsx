"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Boxes, ChevronDown, CircleDollarSign, Glasses, Grid2X2, HelpCircle, Layers3, LibraryBig, MoreHorizontal, Settings, ShoppingBag, Tag, Truck, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./AdminSidebar.css";

type AdminSidebarProps = { open: boolean; onClose: () => void };
let cachedUnreadOrders = 0;
const seenOrdersKey = "eye-champ-seen-order-count";

const workspaceItems = [
  { label: "Overview", icon: Grid2X2, href: "/admin" },
  { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { label: "Inventory", icon: Boxes, href: "/admin/inventory", badge: "4" },
  { label: "Categories", icon: Layers3, href: "/admin/categories" },
  { label: "Collections", icon: LibraryBig, href: "/admin/collections" },
  { label: "Brands", icon: BadgeCheck, href: "/admin/brands" },
  { label: "Customers", icon: Users, href: "#" },
  { label: "Discounts", icon: Tag, href: "#" },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const onProductRoute = pathname.startsWith("/admin/products");
  const [productsOpen, setProductsOpen] = useState(onProductRoute);
  const [unreadOrders, setUnreadOrders] = useState(cachedUnreadOrders);

  useEffect(() => {
    let cancelled = false;
    const refreshOrderCount = () => fetch("/api/admin/orders/count", { credentials: "include" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(result => {
        if (cancelled) return;
        const count = Number(result.count) || 0;
        if (pathname === "/admin/orders") {
          localStorage.setItem(seenOrdersKey, String(count));
          cachedUnreadOrders = 0;
        } else {
          const saved = localStorage.getItem(seenOrdersKey);
          const seenCount = saved === null ? 0 : Number(saved) || 0;
          cachedUnreadOrders = Math.max(0, count - seenCount);
        }
        setUnreadOrders(cachedUnreadOrders);
      })
      .catch(() => undefined);
    refreshOrderCount();
    const interval = window.setInterval(refreshOrderCount, 15000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [pathname]);

  return <>
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <div className="admin-sidebar-brand">
        <Link href="/" aria-label="Eye Champ home"><Image src="/images/logo.png" alt="Eye Champ" width={150} height={46} priority /></Link>
        <button onClick={onClose} aria-label="Close navigation"><X size={20}/></button>
      </div>
      <nav aria-label="Admin navigation">
        <p>Workspace</p>
        {workspaceItems.slice(0, 2).map(({label,icon:Icon,href,badge}) => {const visibleBadge=label==="Orders"?unreadOrders:badge;return <Link className={pathname === href ? "active" : ""} href={href} key={label} onClick={onClose}><Icon size={19}/><span>{label}</span>{pathname!==href&&Boolean(visibleBadge)&&<em>{visibleBadge}</em>}</Link>})}
        <button className={onProductRoute ? "active product-toggle" : "product-toggle"} onClick={() => setProductsOpen(value => !value)} aria-expanded={productsOpen}>
          <Glasses size={19}/><span>Products</span><ChevronDown className={productsOpen ? "open" : ""} size={16}/>
        </button>
        {productsOpen && <div className="admin-product-subnav">
          <Link className={pathname === "/admin/products" ? "current" : ""} href="/admin/products" onClick={onClose}>View products</Link>
          <Link className={pathname === "/admin/products/new" ? "current" : ""} href="/admin/products/new" onClick={onClose}>Add product</Link>
        </div>}
        {workspaceItems.slice(2).map(({label,icon:Icon,href,badge}) => <Link className={pathname === href ? "active" : ""} href={href} key={label} onClick={onClose}><Icon size={19}/><span>{label}</span>{pathname !== href && badge && <em>{badge}</em>}</Link>)}
        <p>Management</p>
        <a href="#"><Truck size={19}/><span>Shipping</span></a>
        <a href="#"><CircleDollarSign size={19}/><span>Finances</span></a>
        <a href="#"><Settings size={19}/><span>Settings</span></a>
      </nav>
      <div className="admin-sidebar-store"><span>EC</span><div><strong>Eye Champ</strong><small><i/> Store is live</small></div><MoreHorizontal size={18}/></div>
    </aside>
    {open && <button className="admin-sidebar-scrim" onClick={onClose} aria-label="Close navigation"/>}
  </>;
}
