"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, type Property } from "@/lib/api";

export default function SoldPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    propertiesApi.list({ listing_type: "sold", per_page: 50 })
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Sold" title="Search sold properties" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "..." : total} recently sold
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No sold properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
