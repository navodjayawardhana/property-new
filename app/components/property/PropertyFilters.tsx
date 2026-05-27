"use client";
import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";

interface PropertyFiltersProps {
  listingType: "buy" | "rent" | "sold" | "new";
  onFilterChange: (filters: Record<string, string>) => void;
}

const propertyTypes = ["All", "House", "Apartment", "Villa", "Land", "Commercial", "Rural"];
const priceRangesBuy = ["Any Price", "Under 25M", "25M - 50M", "50M - 100M", "100M - 200M", "200M+"];
const priceRangesRent = ["Any Price", "Under 100K", "100K - 200K", "200K - 500K", "500K+"];
const bedOptions = ["Any Beds", "1+", "2+", "3+", "4+", "5+"];

export default function PropertyFilters({ listingType, onFilterChange }: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeType, setActiveType] = useState("All");
  const [location, setLocation] = useState("");

  const priceRanges = listingType === "rent" ? priceRangesRent : priceRangesBuy;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Main Search Row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 flex items-center gap-2.5 border-2 border-gray-200 focus-within:border-[#4CD137] rounded-xl px-4 py-3 transition-colors bg-gray-50 focus-within:bg-white">
            <MapPin className="w-4 h-4 text-[#4CD137] shrink-0" />
            <input
              type="text"
              placeholder="Search suburb, city, or postcode..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
          </label>

          <select className="sm:w-36 border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-3 text-sm text-gray-600 outline-none bg-gray-50">
            {priceRanges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>

          <select className="sm:w-28 border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-3 text-sm text-gray-600 outline-none bg-gray-50">
            {bedOptions.map((bed) => (
              <option key={bed}>{bed}</option>
            ))}
          </select>

          <button className="flex items-center justify-center gap-2 bg-[#4CD137] hover:bg-[#3da82d] text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#4CD137] font-semibold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showAdvanced ? "Hide Filters" : "More Filters"}
          </button>
          <span className="text-xs text-gray-400">Showing all results</span>
        </div>
      </div>

      {/* Property Type Pills */}
      <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2">
        {propertyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
              activeType === type
                ? "bg-[#4CD137] border-[#4CD137] text-white"
                : "border-gray-200 text-gray-500 bg-white hover:border-[#4CD137] hover:text-[#4CD137]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select className="border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none bg-gray-50">
            <option>Any Baths</option>
            <option>1+</option>
            <option>2+</option>
            <option>3+</option>
          </select>
          <select className="border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none bg-gray-50">
            <option>Any Parking</option>
            <option>1+</option>
            <option>2+</option>
            <option>3+</option>
          </select>
          <select className="border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none bg-gray-50">
            <option>Any Size</option>
            <option>Under 100m²</option>
            <option>100-200m²</option>
            <option>200-500m²</option>
            <option>500m²+</option>
          </select>
          <select className="border-2 border-gray-200 focus:border-[#4CD137] rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none bg-gray-50">
            <option>Sort: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Views</option>
          </select>
        </div>
      )}
    </div>
  );
}
