"use client";
import { useState } from "react";

const tabs = ["Buy", "Rent", "Sold"];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState("Buy");

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80')",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
          Find Your Dream Property
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Explore thousands of properties across the globe
        </p>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-red-600 border-b-2 border-red-600 bg-red-50"
                    : "text-gray-600 hover:text-red-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Location */}
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Enter suburb, city or country..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Property Type */}
              <select className="sm:w-44 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-red-400 bg-white">
                <option value="">Property Type</option>
                <option>House</option>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Land</option>
                <option>Commercial</option>
              </select>

              {/* Search Button */}
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["Any Price", "Any Beds", "Any Baths", "More Filters"].map((f) => (
                <button
                  key={f}
                  className="text-xs text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-red-400 hover:text-red-600 transition-colors"
                >
                  {f} ▾
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
          <span>🏠 <strong className="text-white">120,000+</strong> Properties</span>
          <span>🌍 <strong className="text-white">50+</strong> Countries</span>
          <span>🏢 <strong className="text-white">8,000+</strong> Agents</span>
        </div>
      </div>
    </section>
  );
}
