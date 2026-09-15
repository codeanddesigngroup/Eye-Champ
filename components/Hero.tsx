"use client";

import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero card hero-mobile">
            <div className="hero-copy"><h1>MADE FOR DIGITAL<br />MOMENTS</h1><p>GlareGuard helps filter blue light during digital learning.</p><Link className="btn" href="/product">SHOP NOW</Link></div>
        </section>
    );
}
