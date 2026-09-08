"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type CartItem = { id: string; name: string; frameColor: string; image: string; framePrice: number; lens?: string; lensPrice: number; tintStrength?: string; colorName?: string; quantity: number };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setItems(JSON.parse(localStorage.getItem("eye-champ-cart") ?? "[]")));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const save = (next: CartItem[]) => { setItems(next); localStorage.setItem("eye-champ-cart", JSON.stringify(next)); window.dispatchEvent(new Event("eye-champ-cart-updated")); };
  const subtotal = items.reduce((total, item) => total + (item.framePrice + item.lensPrice) * item.quantity, 0);

  return <main className="cart-page shell">
    <div className="cart-heading"><h1>Your Cart</h1><span>{items.length} {items.length === 1 ? "item" : "items"}</span></div>
    {!items.length ? <div className="cart-empty"><ShoppingBagIcon /><h2>Your cart is empty</h2><p>Add a frame and customize its lenses to get started.</p><Link href="/shop-all">Continue shopping</Link></div> : <div className="cart-layout"><section className="cart-items">{items.map(item => <article className="cart-item" key={item.id}>
      <div className="cart-item-image"><Image src={item.image} alt={item.name} width={300} height={150} /></div>
      <div className="cart-item-info"><h2>{item.name}</h2><p>Frame: {item.frameColor}</p>{item.lens ? <p>{item.lens} · {item.tintStrength} tint · {item.colorName}</p> : <p>Frame only</p>}<strong>Rs {(item.framePrice + item.lensPrice).toLocaleString()}</strong></div>
      <div className="cart-item-actions"><div><button type="button" aria-label="Decrease quantity" onClick={() => item.quantity > 1 && save(items.map(current => current.id === item.id ? { ...current, quantity: current.quantity - 1 } : current))}><Minus /></button><span>{item.quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => save(items.map(current => current.id === item.id ? { ...current, quantity: current.quantity + 1 } : current))}><Plus /></button></div><button type="button" className="cart-remove" aria-label={`Remove ${item.name}`} onClick={() => save(items.filter(current => current.id !== item.id))}><Trash2 /> Remove</button></div>
    </article>)}</section><aside className="cart-summary"><h2>Order summary</h2><p><span>Subtotal</span><b>Rs {subtotal.toLocaleString()}</b></p><p><span>Shipping</span><b>Calculated at checkout</b></p><div><span>Total</span><strong>Rs {subtotal.toLocaleString()}</strong></div><Link className="checkout-button" href="/checkout">Proceed to checkout</Link><Link href="/shop-all">Continue shopping</Link></aside></div>}
  </main>;
}

function ShoppingBagIcon() { return <span className="cart-bag" aria-hidden="true">▢</span>; }

