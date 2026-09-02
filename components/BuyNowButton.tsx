"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BuyNowButtonProps = {
  productId?: string;
  name?: string;
  frameColor?: string;
  image?: string;
  framePrice?: number;
};

export default function BuyNowButton({ productId, name = "Celine CL40248U", frameColor = "Black", image = "/images/product/1.avif", framePrice = 15000 }: BuyNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const buyNow = () => {
    if (loading) return;
    const cart = JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]") as Array<Record<string, unknown>>;
    const cartId = productId ? `${productId}:${frameColor}` : `${Date.now()}`;
    const existing = cart.find(item => item.id === cartId);
    if (existing) existing.quantity = Number(existing.quantity ?? 1) + 1;
    else cart.push({ id: cartId, productId, name, frameColor, image, framePrice, lens: "", lensPrice: 0, tintStrength: "", tintColor: "", colorName: "", quantity: 1 });
    localStorage.setItem("eye-champ-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("eye-champ-cart-updated"));
    setLoading(true);
    window.setTimeout(() => router.push("/cart"), 700);
  };

  return <>
    <button className="select-lenses" type="button" disabled={loading} onClick={buyNow}>Buy Now</button>
    {loading && <div className="lens-loading-overlay" role="status" aria-live="polite" aria-label="Adding product to cart"><div className="lens-loading-card"><span className="lens-loading-spinner" aria-hidden="true" /><b>Loading...</b><small>Please wait</small></div></div>}
  </>;
}
