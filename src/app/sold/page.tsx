"use client";

import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { getPropertiesByType } from "@/data/properties";

export default function SoldPage() {
  const properties = getPropertiesByType("sold");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Sold" title="Search sold properties" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">{properties.length} recently sold</span>
        </div>
        {properties.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No sold properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
