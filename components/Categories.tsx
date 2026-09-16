"use client";

import Link from "next/link";

const categories = [
    { label: "Under Rs. 5000", slug: "under-5000" },
    { label: "New Arrivals", slug: "new-arrivals" },
    { label: "Best Sellers", slug: "best-sellers" },
    { label: "Top Rated", slug: "top-rated" },
    { label: "Rectangle", slug: "rectangle" },
    { label: "Mix Material", slug: "mix-material" },
    { label: "Ray Ban", slug: "ray-ban" },
    { label: "Full Rim", slug: "full-rim" },
    { label: "On Sale", slug: "on-sale" },
    { label: "Men's", slug: "men" },
];
const mobileCategories = [...categories, ...categories];

export default function Categories() {
    return (
        <>
            <div className="pills-wrap shell desktop-categories" aria-label="Shop categories">
                {categories.map((category, index) => <Link className="category-pill" href={`/all-glasses/${category.slug}`} key={`${category.slug}-${index}`}>
                    <img src="./images/HP-pills-under30.avif" alt="" />
                    {category.label}
                </Link>)}
            </div>

            <div className="pills-wrap mobile-categories">
                <div className="pills-track" aria-label="Shop categories carousel">
                    {mobileCategories.map((category, index) => <Link className="category-pill" href={`/all-glasses/${category.slug}`} key={`${category.slug}-${index}`}>
                        <img src="./images/HP-pills-under30.avif" alt="" />
                        {category.label}
                        </Link>)}
                </div>
            </div>
        </>
    );
}
