"use client";
import { useState } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const tabs = ["Buy", "Rent", "Sold", "New Homes"];

const propertyTypes = [
  {
    label: "House",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <path d="M20 6L36 18V34H26V24H14V34H4V18L20 6Z" fill="currentColor"/>
        <rect x="15.5" y="24" width="9" height="10" fill="white" opacity="0.6"/>
      </svg>
    ),
  },
  {
    label: "Apartment",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <rect x="6" y="4" width="28" height="32" rx="2" fill="currentColor"/>
        <rect x="10" y="8" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="17.5" y="8" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="25" y="8" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="10" y="17" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="17.5" y="17" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="25" y="17" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
        <rect x="15" y="27" width="10" height="9" rx="1" fill="white" opacity="0.6"/>
      </svg>
    ),
  },
  {
    label: "Villa",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <path d="M20 4L34 14V20H6V14L20 4Z" fill="currentColor"/>
        <rect x="4" y="20" width="32" height="16" rx="1" fill="currentColor" opacity="0.8"/>
        <rect x="9" y="24" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
        <rect x="25" y="24" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
        <rect x="16" y="26" width="8" height="10" fill="white" opacity="0.5"/>
        <ellipse cx="32" cy="14" rx="4" ry="6" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  },
  {
    label: "Land",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <rect x="4" y="26" width="32" height="10" rx="2" fill="currentColor"/>
        <path d="M4 26C4 26 10 20 20 20C30 20 36 26 36 26" fill="currentColor" opacity="0.4"/>
        <path d="M12 20V14M20 20V10M28 20V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="20" cy="8" r="3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Commercial",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <rect x="8" y="8" width="24" height="28" rx="2" fill="currentColor"/>
        <rect x="2" y="14" width="8" height="22" rx="1" fill="currentColor" opacity="0.6"/>
        <rect x="30" y="14" width="8" height="22" rx="1" fill="currentColor" opacity="0.6"/>
        <rect x="12" y="12" width="4" height="4" rx="0.5" fill="white" opacity="0.7"/>
        <rect x="20" y="12" width="4" height="4" rx="0.5" fill="white" opacity="0.7"/>
        <rect x="12" y="20" width="4" height="4" rx="0.5" fill="white" opacity="0.7"/>
        <rect x="20" y="20" width="4" height="4" rx="0.5" fill="white" opacity="0.7"/>
        <rect x="15" y="28" width="10" height="8" fill="white" opacity="0.5"/>
      </svg>
    ),
  },
  {
    label: "Rural",
    icon: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <path d="M20 8L28 16H24V28H16V16H12L20 8Z" fill="currentColor"/>
        <rect x="4" y="28" width="32" height="8" rx="2" fill="currentColor" opacity="0.5"/>
        <path d="M6 28C6 28 10 22 14 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M34 28C34 28 30 22 26 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [activeType, setActiveType] = useState("House");

  return (
    <section className="hero-bg min-h-[100vh] flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-10 px-4">

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl pointer-events-none"/>

      <div className="relative w-full max-w-5xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-white/80 font-semibold mb-6 fade-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          120,000+ Properties Listed Worldwide
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4 fade-up">
          Find Your Perfect<br/>
          <span className="gradient-text">Home Abroad</span>
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto fade-up">
          Discover premium international real estate — from beachfront villas to city penthouses
        </p>

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden fade-up">

          {/* Tab Bar */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-bold transition-all relative ${
                  activeTab === tab
                    ? "text-[#C8102E] bg-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#C8102E] rounded-full"/>
                )}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Location */}
              <div className="flex-1 flex items-center gap-2 border-2 border-gray-200 focus-within:border-[#C8102E] rounded-xl px-4 py-3 transition-colors">
                <MapPin className="w-5 h-5 text-[#C8102E] shrink-0"/>
                <input
                  type="text"
                  placeholder="City, suburb, or country..."
                  className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                />
              </div>

              {/* Price */}
              <select className="sm:w-40 border-2 border-gray-200 focus:border-[#C8102E] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white">
                <option>Any Price</option>
                <option>Under $500K</option>
                <option>$500K–$1M</option>
                <option>$1M–$2M</option>
                <option>$2M+</option>
              </select>

              {/* Beds */}
              <select className="sm:w-32 border-2 border-gray-200 focus:border-[#C8102E] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white">
                <option>Any Beds</option>
                <option>1+ Bed</option>
                <option>2+ Beds</option>
                <option>3+ Beds</option>
                <option>4+ Beds</option>
              </select>

              {/* Search Btn */}
              <button className="bg-[#C8102E] hover:bg-[#9b0d22] text-white font-bold px-7 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-red-900/30">
                <Search className="w-5 h-5"/>
                Search
              </button>
            </div>

            {/* Advanced filter link */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#C8102E] transition-colors font-semibold">
                <SlidersHorizontal className="w-4 h-4"/>
                Advanced Filters
              </button>
              <span className="text-xs text-gray-400">50+ countries available</span>
            </div>
          </div>
        </div>

        {/* Property Type Icons */}
        <div className="mt-8 fade-up">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">Browse by Property Type</p>
          <div className="flex flex-wrap justify-center gap-3">
            {propertyTypes.map((pt) => (
              <button
                key={pt.label}
                onClick={() => setActiveType(pt.label)}
                className={`flex flex-col items-center gap-2 px-5 py-3.5 rounded-2xl transition-all border-2 min-w-[80px] ${
                  activeType === pt.label
                    ? "bg-[#C8102E] border-[#C8102E] text-white shadow-lg shadow-red-900/40 scale-105"
                    : "glass border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className={activeType === pt.label ? "text-white" : "text-white/60"}>
                  {pt.icon}
                </span>
                <span className="text-xs font-bold">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto fade-up">
          {[
            { val: "120K+", label: "Listings" },
            { val: "50+", label: "Countries" },
            { val: "8K+", label: "Agents" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs text-white/50 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
