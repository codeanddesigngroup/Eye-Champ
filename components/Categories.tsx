"use client";

import Link from "next/link";

const categories = ["Under Rs. 5000", "New Arrivals", "Best Sellers", "Top Rated", "Rectangle", "Mix Material", "Ray Ban", "Full Rim", "On Sale", "Men's"];
const mobileCategories = [...categories, ...categories];

export default function Categories() {
    return (
        <>
            <div className="pills-wrap shell desktop-categories" aria-label="Shop categories">
                {categories.map((x, index) => <Link className="category-pill" href="" key={`${x}-${index}`}>
                    <img src="./images/HP-pills-under30.avif" alt="" />
                    {x}
                </Link>)}
            </div>

            <div className="pills-wrap mobile-categories">
                <div className="pills-track" aria-label="Shop categories carousel">
                    {mobileCategories.map((x, index) => <Link className="category-pill" href="" key={`${x}-${index}`}>
                        <img src="./images/HP-pills-under30.avif" alt="" />
                        {x}
                        </Link>)}
                </div>
            </div>
        </>
    );
}
