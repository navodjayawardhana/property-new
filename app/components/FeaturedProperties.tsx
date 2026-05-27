"use client";
import { useState } from "react";
import Link from "next/link";
import PropertyCard from "./PropertyCard";
import { properties } from "@/app/lib/data/properties";

const FILTERS = ["All", "House", "Apartment", "Villa", "Land", "Commercial"];

export default function FeaturedProperties() {
  const [active, setActive] = useState("All");

  const buyProperties = properties.filter((p) => p.listingType === "buy");
  const filtered = active === "All"
    ? buyProperties
    : buyProperties.filter((p) => p.type === active);

  return (
    <section className="py-20 px-5 sm:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label">Hand-Picked</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Featured Properties</h2>
            <p className="text-gray-400 text-sm mt-1.5">Premium listings curated for you</p>
          </div>
          <Link href="/buy" className="text-sm font-bold text-[#4CD137] hover:underline shrink-0 pb-1">
            View All →
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                active === f
                  ? "bg-[#4CD137] border-[#4CD137] text-white"
                  : "border-gray-200 text-gray-500 bg-white hover:border-[#4CD137] hover:text-[#4CD137]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.slice(0, 6).map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              image={p.images[0]}
              price={p.price}
              title={p.title}
              location={`${p.location.suburb}, ${p.location.city}`}
              beds={p.features.beds}
              baths={p.features.baths}
              area={p.features.area}
              type={p.type}
              badge={p.badge}
              badgeColor={p.badgeColor}
              views={p.views}
              listingType={p.listingType}
            />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-10 text-center">
          <Link href="/buy" className="inline-block px-8 py-3 rounded-xl border-2 border-[#4CD137] text-[#4CD137] text-sm font-bold hover:bg-[#4CD137] hover:text-white transition-all">
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
