"use client";

import { useEffect, useState } from "react";

export default function Topbar() {
    const [promo, setPromo] = useState({ enabled: true, text: "", code: "" });
    useEffect(() => {
        fetch("/api/products/settings", { cache: "no-store" })
            .then(async response => { if (!response.ok) throw new Error("Could not load announcement"); return response.json() as Promise<{ promoEnabled?: boolean; promoText?: string; promoCode?: string }> })
            .then(settings => setPromo({ enabled: settings.promoEnabled !== false, text: settings.promoText ?? "", code: settings.promoCode ?? "" }))
            .catch(() => undefined);
    }, []);
    if (!promo.enabled || (!promo.text && !promo.code)) return null;
    return (
        <div className="promo">{promo.text}{promo.code && <> <b>Use {promo.code}</b></>}</div>
    );
}
