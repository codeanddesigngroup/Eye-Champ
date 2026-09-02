"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
export const productFilterGroups = [
  ["Gender", ["Men", "Women"]],
  ["Price", ["Under 1000", "Under 2000", "Under 3000", "Above 5000"]],
  ["Material", ["Plastic", "Metal", "Mix material", "Acetate"]],
  ["Collections", ["Under 5000", "New Arrivals", "Best Sellers", "Top Rated"]],
  ["Shape", ["Square", "Rectangle", "Round", "Cat eye", "Browline", "Aviator"]],
  ["Rim", ["Full rim", "Half rim", "Rimless"]],
  ["Brand", ["Ray-Ban", "Cartier", "Montblanc", "Tom Ford", "Moscot", "Oakley", "Prada", "Emporio Armani", "Versace", "Gucci"]],
  ["Color", ["Black", "Pink", "Clear", "Blue", "Tortoiseshell", "Purple", "Green", "Red", "Rainbow", "Gold", "Brown", "White", "Pattern", "Cream", "Multicolor", "Orange", "Gray", "Yellow", "Silver", "Rose Gold"]],
] as const;

export type ProductFilterTitle = typeof productFilterGroups[number][0];
export type ProductFilterSelection = Partial<Record<ProductFilterTitle, string[]>>;

type ProductFiltersProps = {
  selected: ProductFilterSelection;
  onToggle: (group: ProductFilterTitle, value: string) => void;
  onHide: () => void;
};

export default function ProductFilters({ selected, onToggle, onHide }: ProductFiltersProps) {
  return <aside className="filters open">
    <div className="filters-title">
      <h2>Filters</h2>
      <button className="hide-filters" onClick={onHide}><SlidersHorizontal /><span>Hide Filters</span></button>
    </div>
    {productFilterGroups.map(([title, items]) => <FilterGroup key={title} title={title} items={items} selected={selected[title] ?? []} onToggle={value => onToggle(title, value)} />)}
  </aside>;
}

function FilterGroup({ title, items, selected, onToggle }: { title: ProductFilterTitle; items: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <details open={title === "Shape" || title === "Color" ? true : undefined}>
    <summary><span>{title}</span><ChevronDown /></summary>
    <div>{items.map(item => <label key={item}>
      <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} />
      {title === "Shape" && <ShapeIcon shape={item} />}
      {title === "Color" && <ColorDot color={item} />}
      <span>{item}</span>
    </label>)}</div>
  </details>;
}

function ShapeIcon({ shape }: { shape: string }) {
  const files: Record<string, string> = {
    Square: "square-shape.svg", "Cat eye": "catEye-shape.svg", Round: "round-shape.svg",
    Rectangle: "rectangle-shape.svg", Aviator: "aviator-shape.svg", Browline: "browline-shape.svg",
  };
  return <img className="shape-icon" src={`/images/shapes/${files[shape]}`} alt="" aria-hidden="true" />;
}

function ColorDot({ color }: { color: string }) {
  return <i className={`filter-color color-${color.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true" />;
}
