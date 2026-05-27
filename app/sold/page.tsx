"use client";
import { properties } from "@/app/lib/data/properties";
import PropertyFilters from "@/app/components/property/PropertyFilters";
import PropertyGrid from "@/app/components/property/PropertyGrid";

export default function SoldPage() {
  const soldProperties = properties.filter((p) => p.listingType === "sold");

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Recently Sold Properties
          </h1>
          <p className="text-white/60">
            Research recent sales to understand market values
          </p>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <PropertyFilters listingType="sold" onFilterChange={() => {}} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-800">{soldProperties.length}</span> sold properties
            </p>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none">
              <option>Sort: Recently Sold</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <PropertyGrid properties={soldProperties} />
        </div>
      </section>
    </main>
  );
}
