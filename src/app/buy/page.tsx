"use client";

import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import NewsCard from "@/components/NewsCard";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { newsArticles } from "@/data/news";
import { getPropertiesByType } from "@/data/properties";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

const propertyTypes = ["Any", "House", "Apartment", "Townhouse", "Land"];
const sortOptions = ["Most recent", "Price (low to high)", "Price (high to low)"];

export default function BuyPage() {
  const [selectedType, setSelectedType] = useState("Any");
  const [sort, setSort] = useState("Most recent");
  const allProperties = getPropertiesByType("buy");
  const filtered = allProperties.filter(
    (p) => selectedType === "Any" || p.propertyType === selectedType
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Buy" title="Search properties for sale" />
      <ExploreSection />

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">{filtered.length} properties</span>
          <div className="flex gap-2 flex-wrap ml-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  selectedType === type
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none text-gray-600"
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
            <button className="flex items-center gap-1.5 text-sm border border-gray-300 rounded px-3 py-1.5 hover:border-gray-500 text-gray-600 transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {filtered.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        {/* Home loan banner */}
        <div className="bg-gray-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 border border-gray-200">
          <div>
            <p className="text-xs font-semibold text-[#121e80] mb-1">Greenbrick.net</p>
            <h3 className="text-base font-bold text-gray-900">Explore your home loan options</h3>
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded transition-colors shrink-0">
            Compare loans
          </button>
        </div>
      </section>

      {/* Latest news */}
      <section className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Latest property news</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newsArticles.slice(0, 4).map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
