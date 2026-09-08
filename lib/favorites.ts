export const favoritesKey = "eye-champ-favorites";
export const favoritesUpdatedEvent = "eye-champ-favorites-updated";

export type FavoriteProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  shape?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  categories?: string[];
  subcategories?: string[];
  media?: Array<{ url:string; primary?:boolean }>;
};

export function getFavorites(): FavoriteProduct[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(favoritesKey) ?? "[]"); }
  catch { return []; }
}

export function toggleFavorite(product: FavoriteProduct) {
  const current = getFavorites();
  const saved = current.some(item => item.id === product.id);
  const next = saved ? current.filter(item => item.id !== product.id) : [product, ...current];
  localStorage.setItem(favoritesKey, JSON.stringify(next));
  window.dispatchEvent(new Event(favoritesUpdatedEvent));
  return !saved;
}
