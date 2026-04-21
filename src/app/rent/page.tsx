"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { SlidersHorizontal } from "lucide-react";

const propertyTypes = ["Any", "House", "Apartment", "Townhouse"];
const sortOptions = ["Most recent", "Price (low to high)", "Price (high to low)"];

export default function RentPage() {
  const [selectedType, setSelectedType] = useState("Any");
  const [sort, setSort] = useState("Most recent");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    propertiesApi.list({
      listing_type: "rent",
      property_type: selectedType !== "Any" ? selectedType : undefined,
      per_page: 50,
    })
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedType]);

  const sorted = [...items].sort((a, b) => {
    if (sort === "Price (low to high)") return (a.price_per_week ?? a.price) - (b.price_per_week ?? b.price);
    if (sort === "Price (high to low)") return (b.price_per_week ?? b.price) - (a.price_per_week ?? a.price);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Rent" title="Search properties for rent" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">{loading ? "..." : total} rentals</span>
          <div className="flex gap-2 flex-wrap ml-2">
            {propertyTypes.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  selectedType === type ? "bg-gray-900 text-white border-gray-900" : "text-gray-600 border-gray-300 hover:border-gray-500"
                }`}>
                {type}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none text-gray-600">
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <button className="flex items-center gap-1.5 text-sm border border-gray-300 rounded px-3 py-1.5 hover:border-gray-500 text-gray-600 transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No rental properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
