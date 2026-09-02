"use client";
import { Heart, HelpCircle, Search, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MegaMenuSlider from "./MegaMenuSlider";

export default function Navbar() {
    const [menu, setMenu] = useState(false);
    const [query, setQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [categories, setCategories] = useState<Array<{id:string;name:string;slug:string;parentId:string|null}>>([]);
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]") as Array<{ quantity?: number }>;
            setCartCount(cart.reduce((total, item) => total + (item.quantity ?? 1), 0));
        };
        updateCartCount();
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("eye-champ-cart-updated", updateCartCount);
        return () => { window.removeEventListener("storage", updateCartCount); window.removeEventListener("eye-champ-cart-updated", updateCartCount); };
    }, []);
    useEffect(() => { fetch("/api/products/categories/navigation").then(response => response.ok ? response.json() : Promise.reject()).then((result:{categories?:Array<{id:string;name:string;slug:string;parentId:string|null}>}) => setCategories(result.categories ?? [])).catch(() => setCategories([])) }, []);
    const mainCategories = categories.filter(category => category.parentId === null);
    return (
        <>
            <header className="site-header shell">
                <Link className="logo" href="/" aria-label="Eye Champ home">
                    <img src="/images/logo.png" alt="" />
                </Link>
                <label className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search our AI recommended frames" /></label>
                <nav className={`utility ${menu ? "open" : ""}`} aria-label="Account links">
                    <Link href="/admin" aria-label="Login"><UserRound size={18} /><small>Login</small></Link>
                    <a href="#favorites" aria-label="Favorites"><Heart size={18} /><small>Favorites</small></a>
                    <a href="#help" aria-label="Help"><HelpCircle size={18} /><small>Help</small></a>
                    <Link href="/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={18} />{cartCount > 0 && <b className="cart-count">{cartCount}</b>}<small>Cart</small></Link>
                </nav>
                <button className="menu" onClick={() => setMenu(!menu)} aria-label="Toggle menu">☰</button>
            </header>

            <nav className="main-nav" aria-label="Shop categories">
                {mainCategories.map(main => { const children=categories.filter(category=>category.parentId===main.id); return <div className="mega-trigger" key={main.id}>
                    <Link className="mega-link" href={`/${main.slug}/all`}>{main.name}</Link>
                    <section className="mega-menu" aria-label={`${main.name} menu`}><div className="mega-inner">
                        <div className="mega-column"><b>{main.name}</b><Link href={`/${main.slug}/all`}>All {main.name.toLowerCase()}</Link>{children.map(child=><Link href={`/${main.slug}/${child.slug}`} key={child.id}>{child.name}</Link>)}</div>
                        <MegaMenuSlider />
                    </div></section>
                </div>})}
                <div className="mega-trigger">
                    <a className="mega-link mega-trending" href="#trending-now">✨ Trending Now</a>
                    <section className="mega-menu" aria-label="Trending Now menu">
                        <div className="mega-inner">
                            <MegaMenuSlider fullWidth />
                        </div>
                    </section>
                </div>
                <Link className="sale-link" href="#sale">🛍 Sale</Link>
            </nav>
        </>
    );
}
