"use client";
import { useState } from "react";
import PropertyCard from "./PropertyCard";

const ALL_PROPERTIES = [
  {
    id: 1, type: "House",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80",
    price: "AUD $1.25M", title: "Luxury Beachfront Villa — Gold Coast",
    location: "Gold Coast, Queensland, Australia",
    beds: 4, baths: 3, area: "320m²", badge: "Featured", badgeColor: "bg-amber-500", views: "3.4k",
  },
  {
    id: 2, type: "Apartment",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80",
    price: "USD $850K", title: "Sky-High Penthouse in Manhattan",
    location: "Manhattan, New York, USA",
    beds: 3, baths: 2, area: "210m²", badge: "New", badgeColor: "bg-emerald-500", views: "2.1k",
  },
  {
    id: 3, type: "Villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&q=80",
    price: "SGD $3.2M", title: "Infinity Pool Villa — Sentosa Island",
    location: "Sentosa, Singapore",
    beds: 5, baths: 5, area: "580m²", badge: "Featured", badgeColor: "bg-amber-500", views: "4.8k",
  },
  {
    id: 4, type: "House",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80",
    price: "GBP £920K", title: "Georgian Townhouse — Chelsea",
    location: "Chelsea, London, United Kingdom",
    beds: 5, baths: 4, area: "410m²", views: "1.9k",
  },
  {
    id: 5, type: "Apartment",
    image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=700&q=80",
    price: "EUR €480K", title: "Haussmann Apartment Near Eiffel Tower",
    location: "Paris 7e, France",
    beds: 2, baths: 1, area: "95m²", badge: "Price Drop", badgeColor: "bg-blue-500", views: "2.6k",
  },
  {
    id: 6, type: "Villa",
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=700&q=80",
    price: "AED 4.5M", title: "Palm Villa with Pool & Sea View",
    location: "Palm Jumeirah, Dubai, UAE",
    beds: 5, baths: 5, area: "520m²", badge: "Featured", badgeColor: "bg-amber-500", views: "5.2k",
  },
  {
    id: 7, type: "Land",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80",
    price: "USD $320K", title: "Prime Beachfront Land — Bali",
    location: "Seminyak, Bali, Indonesia",
    beds: 0, baths: 0, area: "1,200m²", badge: "New", badgeColor: "bg-emerald-500", views: "1.4k",
  },
  {
    id: 8, type: "Commercial",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80",
    price: "USD $2.1M", title: "Grade-A Office Floor — DIFC",
    location: "DIFC, Dubai, UAE",
    beds: 0, baths: 4, area: "880m²", views: "987",
  },
  {
    id: 9, type: "Apartment",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=700&q=80",
    price: "JPY ¥98M", title: "Smart Apartment — Shibuya, Tokyo",
    location: "Shibuya, Tokyo, Japan",
    beds: 2, baths: 2, area: "110m²", badge: "New", badgeColor: "bg-emerald-500", views: "3.1k",
  },
];

const FILTERS = ["All", "House", "Apartment", "Villa", "Land", "Commercial"];

export default function FeaturedProperties() {
  const [active, setActive] = useState("All");

  const filtered = active === "All"
    ? ALL_PROPERTIES
    : ALL_PROPERTIES.filter((p) => p.type === active);

  return (
    <section className="py-20 px-5 sm:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label">Hand-Picked</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Featured Properties</h2>
            <p className="text-gray-400 text-sm mt-1.5">Premium international listings curated for you</p>
          </div>
          <a href="#" className="text-sm font-bold text-[#C8102E] hover:underline shrink-0 pb-1">
            View All →
          </a>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                active === f
                  ? "bg-[#C8102E] border-[#C8102E] text-white"
                  : "border-gray-200 text-gray-500 bg-white hover:border-[#C8102E] hover:text-[#C8102E]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <PropertyCard key={p.id} {...p} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-10 text-center">
          <button className="px-8 py-3 rounded-xl border-2 border-[#C8102E] text-[#C8102E] text-sm font-bold hover:bg-[#C8102E] hover:text-white transition-all">
            Load More Properties
          </button>
        </div>
      </div>
    </section>
  );
}
