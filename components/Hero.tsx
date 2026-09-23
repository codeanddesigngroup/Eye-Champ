"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

export default function Hero() {
    return (
        <section className="hero card hero-mobile">
            <div className="hero-copy"><h1>MADE FOR DIGITAL<br />MOMENTS</h1><p>GlareGuard helps filter blue light during digital learning.</p><Link className="btn" href="/all-glasses">SHOP NOW</Link></div>
            <span className="hero-badge"><Tag aria-hidden="true" />Frames</span>
        </section>
    );
}
