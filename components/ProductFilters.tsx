"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const groups = [
  ["Gender", ["Men", "Women"]],
  ["Price", ["Under 1000", "Under 2000", "Under 3000", "Above 5000"]],
  ["Material", ["Plastic", "Metal", "Mix material", "Acetate"]],
  ["Collections", ["Under 5000", "New Arrivals", "Best Sellers", "Top Rated"]],
  ["Shape", ["Square", "Rectangle", "Round", "Cat eye", "Browline", "Aviator"]],
  ["Rim", ["Full rim", "Half rim", "Rimless"]],
  ["Brand", ["Ray-Ban", "Cartier", "Montblanc", "Tom Ford", "Moscot", "Oakley", "Prada", "Emporio Armani", "Versace", "Gucci"]],
  ["Color", ["Black", "Pink", "Clear", "Blue", "Tortoiseshell", "Purple", "Green", "Red", "Rainbow", "Gold", "Brown", "White", "Pattern", "Cream", "Multicolor", "Orange", "Gray", "Yellow", "Silver", "Rose Gold"]],
] as const;

type ProductFiltersProps = {
  selectedShapes: string[];
  onToggleShape: (shape: string) => void;
  onHide: () => void;
};

export default function ProductFilters({ selectedShapes, onToggleShape, onHide }: ProductFiltersProps) {
  return <aside className="filters open">
    <div className="filters-title">
      <h2>Filters</h2>
      <button className="hide-filters" onClick={onHide}><SlidersHorizontal /><span>Hide Filters</span></button>
    </div>
    {groups.map(([title, items]) => <FilterGroup key={title} title={title} items={items} selectedShapes={selectedShapes} onToggleShape={onToggleShape} />)}
  </aside>;
}

function FilterGroup({ title, items, selectedShapes, onToggleShape }: { title: string; items: readonly string[]; selectedShapes: string[]; onToggleShape: (shape: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const choose = (item: string) => {
    if (title === "Shape") onToggleShape(item);
    else setSelected(current => current.includes(item) ? current.filter(value => value !== item) : [...current, item]);
  };
  return <details open={title === "Shape" || title === "Color" ? true : undefined}>
    <summary><span>{title}</span><ChevronDown /></summary>
    <div>{items.map(item => <label key={item}>
      <input type="checkbox" checked={title === "Shape" ? selectedShapes.includes(item) : selected.includes(item)} onChange={() => choose(item)} />
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
