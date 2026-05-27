"use client";
import { useState } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const tabs = ["Buy", "Rent", "Sold", "New Homes"];

const propertyTypes = [
  {
    label: "House",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <path d="M24 8L42 22V42H30V30H18V42H6V22L24 8Z" fill="currentColor" opacity="0.9"/>
        <rect x="18" y="30" width="12" height="12" fill="white" opacity="0.35"/>
      </svg>
    ),
  },
  {
    label: "Apartment",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect x="8" y="6" width="32" height="38" rx="2" fill="currentColor" opacity="0.9"/>
        <rect x="13" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="22" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="31" y="11" width="4" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="13" y="21" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="22" y="21" width="6" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="31" y="21" width="4" height="6" rx="1" fill="white" opacity="0.5"/>
        <rect x="18" y="31" width="12" height="13" rx="1" fill="white" opacity="0.35"/>
      </svg>
    ),
  },
  {
    label: "Villa",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <path d="M24 6L40 18H36V28H28V20H20V28H12V18H8L24 6Z" fill="currentColor" opacity="0.9"/>
        <rect x="10" y="28" width="28" height="14" rx="1" fill="currentColor" opacity="0.7"/>
        <rect x="19" y="33" width="10" height="9" fill="white" opacity="0.35"/>
        <rect x="13" y="31" width="6" height="6" rx="0.5" fill="white" opacity="0.4"/>
        <rect x="29" y="31" width="6" height="6" rx="0.5" fill="white" opacity="0.4"/>
      </svg>
    ),
  },
  {
    label: "Land",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <ellipse cx="24" cy="34" rx="18" ry="6" fill="currentColor" opacity="0.4"/>
        <rect x="6" y="34" width="36" height="8" rx="2" fill="currentColor" opacity="0.8"/>
        <path d="M16 34V24M24 34V16M32 34V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="24" cy="13" r="4" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "Commercial",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <rect x="10" y="10" width="28" height="32" rx="2" fill="currentColor" opacity="0.85"/>
        <rect x="4" y="18" width="8" height="24" rx="1" fill="currentColor" opacity="0.5"/>
        <rect x="36" y="18" width="8" height="24" rx="1" fill="currentColor" opacity="0.5"/>
        <rect x="14" y="15" width="5" height="5" rx="0.5" fill="white" opacity="0.55"/>
        <rect x="22" y="15" width="5" height="5" rx="0.5" fill="white" opacity="0.55"/>
        <rect x="30" y="15" width="4" height="5" rx="0.5" fill="white" opacity="0.55"/>
        <rect x="14" y="24" width="5" height="5" rx="0.5" fill="white" opacity="0.55"/>
        <rect x="22" y="24" width="5" height="5" rx="0.5" fill="white" opacity="0.55"/>
        <rect x="18" y="32" width="12" height="10" fill="white" opacity="0.35"/>
      </svg>
    ),
  },
  {
    label: "Rural",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
        <path d="M24 8L32 16H28V26H20V16H16L24 8Z" fill="currentColor" opacity="0.9"/>
        <rect x="6" y="32" width="36" height="10" rx="2" fill="currentColor" opacity="0.6"/>
        <path d="M8 32C8 32 12 24 18 24C24 24 24 32 24 32" fill="currentColor" opacity="0.35"/>
        <path d="M24 32C24 32 28 24 34 24C40 24 40 32 40 32" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  },
];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [activeType, setActiveType] = useState("House");

  return (
    <section className="hero-bg min-h-screen flex flex-col justify-center relative overflow-hidden">

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#4CD137]/10 rounded-full blur-[120px]"/>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/20 rounded-full blur-[80px]"/>
        <div className="absolute top-10 right-0 w-64 h-64 bg-[#4CD137]/8 rounded-full blur-[80px]"/>
      </div>

      <div className="relative max-w-4xl mx-auto w-full px-5 sm:px-8 pt-24 pb-16 flex flex-col items-center text-center gap-6">

        {/* Badge */}
        <div className="glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          120,000+ properties listed worldwide
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Find Your Perfect
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight gradient-text">
            Property Abroad
          </h1>
        </div>

        <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed">
          Premium international real estate — curated listings across 50+ countries
        </p>

        {/* Search Box */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden mt-2">
          {/* Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                  activeTab === tab ? "bg-white text-[#4CD137]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#4CD137] rounded-full"/>
                )}
              </button>
            ))}
          </div>

          {/* Inputs Row */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center gap-2.5 border-2 border-gray-150 focus-within:border-[#4CD137] rounded-xl px-4 py-3 transition-colors bg-gray-50 focus-within:bg-white">
                <MapPin className="w-4 h-4 text-[#4CD137] shrink-0"/>
                <input
                  type="text"
                  placeholder="City, suburb or country..."
                  className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
                />
              </label>

              <select className="sm:w-36 border-2 border-gray-150 focus:border-[#4CD137] rounded-xl px-3 py-3 text-sm text-gray-600 outline-none bg-gray-50">
                <option>Any Price</option>
                <option>Under $500K</option>
                <option>$500K–$1M</option>
                <option>$1M–$2M</option>
                <option>$2M+</option>
              </select>

              <select className="sm:w-28 border-2 border-gray-150 focus:border-[#4CD137] rounded-xl px-3 py-3 text-sm text-gray-600 outline-none bg-gray-50">
                <option>Any Beds</option>
                <option>1+ Bed</option>
                <option>2+ Beds</option>
                <option>3+ Beds</option>
                <option>4+ Beds</option>
              </select>

              <button className="flex items-center justify-center gap-2 bg-[#4CD137] hover:bg-[#3da82d] text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                <Search className="w-4 h-4"/>
                Search
              </button>
            </div>

            <div className="flex items-center justify-between mt-3">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#4CD137] font-semibold transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5"/>
                Advanced Filters
              </button>
              <span className="text-xs text-gray-300">50+ countries</span>
            </div>
          </div>
        </div>

        {/* Property Type Grid — 3 × 2 */}
        <div className="w-full">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Property Type</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {propertyTypes.map((pt) => (
              <button
                key={pt.label}
                onClick={() => setActiveType(pt.label)}
                className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border transition-all duration-200 ${
                  activeType === pt.label
                    ? "bg-[#4CD137] border-[#4CD137] text-white scale-[1.04] shadow-lg shadow-green-900/40"
                    : "glass border-white/10 text-white/60 hover:text-white hover:border-white/25"
                }`}
              >
                <span className={activeType === pt.label ? "text-white" : "text-white/50"}>
                  {pt.icon}
                </span>
                <span className="text-[11px] font-bold leading-none">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 pt-2">
          {[
            { val: "120K+", label: "Listings" },
            { val: "50+",   label: "Countries" },
            { val: "8K+",   label: "Agents" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-8">
              {i > 0 && <div className="w-px h-8 bg-white/10"/>}
              <div className="text-center">
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-xs text-white/40 font-semibold">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
