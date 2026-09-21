"use client";
import { Heart, HelpCircle, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MegaMenuSlider from "./MegaMenuSlider";
import { favoritesUpdatedEvent, getFavorites } from "@/lib/favorites";

export default function Navbar() {
    const [menu, setMenu] = useState(false);
    const [query, setQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; parentId: string | null }>>([]);
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
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

    useEffect(() => {
        const updateFavoriteCount = () => setFavoriteCount(getFavorites().length);
        updateFavoriteCount();
        window.addEventListener("storage", updateFavoriteCount);
        window.addEventListener(favoritesUpdatedEvent, updateFavoriteCount);
        return () => { window.removeEventListener("storage", updateFavoriteCount); window.removeEventListener(favoritesUpdatedEvent, updateFavoriteCount); };
    }, []);

    useEffect(() => { fetch("/api/products/categories/navigation").then(response => response.ok ? response.json() : Promise.reject()).then((result: { categories?: Array<{ id: string; name: string; slug: string; parentId: string | null }> }) => { const items = result.categories ?? []; setCategories(items); setExpandedCategoryIds(items.filter(item => item.parentId === null).map(item => item.id)); }).catch(() => setCategories([])) }, []);
    useEffect(() => {
        if (!menu) return;
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [menu]);
    const mainCategories = categories.filter(category => category.parentId === null);
    return (
        <>
            <header className="site-header shell">
                <Link className="logo" href="/" aria-label="Eye Champ home">
                    <img src="/images/logo.png" alt="" />
                </Link>
                <label className="search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search our AI recommended frames" /></label>
                <nav className="utility" aria-label="Account links">
                    <Link href="/login" aria-label="Customer login"><UserRound size={18} /><small>Login</small></Link>
                    <Link href="/favorites" aria-label={`Favorites with ${favoriteCount} products`}><Heart size={18} />{favoriteCount > 0 && <b className="cart-count">{favoriteCount}</b>}<small>Favorites</small></Link>
                    <a href="#help" aria-label="Help"><HelpCircle size={18} /><small>Help</small></a>
                    <Link href="/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={18} />{cartCount > 0 && <b className="cart-count">{cartCount}</b>}<small>Cart</small></Link>
                </nav>
                <button className="menu" type="button" onClick={() => setMenu(open => !open)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-shop-menu">{menu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
            </header>

            {menu && <div className="mobile-menu-backdrop" onClick={() => setMenu(false)} aria-hidden="true" />}
            <nav id="mobile-shop-menu" className={`mobile-shop-menu ${menu ? "is-open" : ""}`} aria-label="Mobile shop menu" aria-hidden={!menu}>
                <div className="mobile-shop-menu-title"><b>Eyechamp</b><button type="button" onClick={() => setMenu(false)} aria-label="Close menu"><X aria-hidden="true" /></button></div>
                {mainCategories.map(category => <div className="mobile-shop-menu-group" key={category.id}>
                    <button type="button" className="mobile-shop-menu-heading" aria-expanded={expandedCategoryIds.includes(category.id)} aria-controls={`mobile-category-${category.id}`} onClick={() => setExpandedCategoryIds(current => current.includes(category.id) ? current.filter(id => id !== category.id) : [...current, category.id])}>{category.name}<span aria-hidden="true">{expandedCategoryIds.includes(category.id) ? "−" : "+"}</span></button>
                    <div id={`mobile-category-${category.id}`} className="mobile-shop-menu-children" hidden={!expandedCategoryIds.includes(category.id)}>
                        <Link className="mobile-shop-menu-child" href={`/${category.slug}/all`} onClick={() => setMenu(false)}>All {category.name.toLowerCase()}</Link>
                        {categories.filter(child => child.parentId === category.id).map(child => <Link className="mobile-shop-menu-child" href={`/${category.slug}/${child.slug}`} onClick={() => setMenu(false)} key={child.id}>{child.name}</Link>)}
                    </div>
                </div>)}
                <Link href="/all-glasses/on-sale" onClick={() => setMenu(false)}>Sale</Link>
            </nav>

            <nav className="main-nav" aria-label="Shop categories">
                {mainCategories.map(main => {
                    const children = categories.filter(category => category.parentId === main.id); return <div className="mega-trigger" key={main.id}>
                        <Link className="mega-link" href={`/${main.slug}/all`}>{main.name}</Link>
                        <section className="mega-menu" aria-label={`${main.name} menu`}><div className="mega-inner">
                            <div className="mega-column">
                                <b>{main.name}</b>
                                <Link href={`/${main.slug}/all`}>All {main.name.toLowerCase()}</Link>
                                {children.map(child => <Link href={`/${main.slug}/${child.slug}`} key={child.id}>{child.name}</Link>)}
                                {(["eyeglasses", "sunglasses"].includes(main.slug.toLowerCase()) || ["eyeglasses", "sunglasses"].includes(main.name.toLowerCase())) && <>
                                    {!children.some(child => child.slug === "new-arrivals") && <Link href={`/${main.slug}/new-arrivals`}>New arrivals</Link>}
                                    {!children.some(child => child.slug === "under-5000") && <Link href={`/${main.slug}/under-5000`}>Under 5000</Link>}
                                </>}
                            </div>
                            <MegaMenuSlider />
                        </div>
                        </section>
                    </div>
                })}
                <div className="mega-trigger">
                    <a className="mega-link mega-trending" href="#trending-now">✨ Trending Now</a>
                    <section className="mega-menu" aria-label="Trending Now menu">
                        <div className="mega-inner">
                            <MegaMenuSlider fullWidth />
                        </div>
                    </section>
                </div>
                <Link className="sale-link" href="/all-glasses/on-sale">🛍 Sale</Link>
            </nav>
        </>
    );
}
