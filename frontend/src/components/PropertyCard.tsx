"use client";

import Link from "next/link";
import { Bed, Bath, Car, Heart, Ruler, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import type { Property } from "@/lib/api";
import { favorites as favoritesApi } from "@/lib/api";
import { formatPrice, getPrimaryImageUrl, formatLandSize } from "@/lib/utils";
import { isSaved, toggleSaved } from "@/lib/saved-properties";
import { useAuth } from "@/lib/auth-context";

export default function PropertyCard({ property }: { property: Property }) {
  const isSold = property.listing_type === "sold";
  const isNew = !isSold && property.days_listed <= 3;
  const isRent = property.listing_type === "rent";
  const [saved, setSaved] = useState(false);
  const { token } = useAuth();

  useEffect(() => { setSaved(isSaved(property.id)); }, [property.id]);

  async function handleSaveToggle(e: React.MouseEvent) {
    e.preventDefault();
    const newState = toggleSaved(property);
    setSaved(newState);
    if (token) {
      try {
        await favoritesApi.toggle(property.id, token);
      } catch { /* ignore — localStorage is source of truth */ }
    }
  }

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative overflow-hidden h-32 sm:h-36">
          <img
            src={getPrimaryImageUrl(property)}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isSold && (
              <span className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                SOLD {property.sold_date
                  ? new Date(property.sold_date).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })
                  : ""}
              </span>
            )}
            {isNew && (
              <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">NEW</span>
            )}
            {!isSold && !isNew && property.days_listed > 0 && property.days_listed <= 14 && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock size={9} /> {property.days_listed}d ago
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            className={`absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${saved ? "text-red-500 scale-110" : "text-gray-500 hover:text-red-400 hover:scale-110"}`}
          >
            <Heart size={12} fill={saved ? "currentColor" : "none"} />
          </button>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-14" />

          {/* Property type + listing type */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
            <span className="text-white text-[10px] font-semibold">{property.property_type}</span>
            {isRent && property.price_per_week && (
              <span className="bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">FOR RENT</span>
            )}
            {property.is_featured && !isSold && (
              <span className="bg-yellow-400/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded">FEATURED</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[#16a34a] font-black text-base leading-tight">{formatPrice(property)}</p>
          <p className="text-gray-900 font-bold text-xs mt-0.5 leading-snug line-clamp-1">{property.address}</p>
          <p className="text-gray-400 text-[10px] mt-0.5 leading-none">
            {property.suburb} {property.state} {property.postcode}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Bed size={12} className="text-gray-400" />
              {property.beds ? <span className="text-gray-700">{property.beds}</span> : <span className="text-gray-400 text-[10px]">—</span>}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Bath size={12} className="text-gray-400" />
              {property.baths ? <span className="text-gray-700">{property.baths}</span> : <span className="text-gray-400 text-[10px]">—</span>}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Car size={12} className="text-gray-400" />
              {property.cars ? <span className="text-gray-700">{property.cars}</span> : <span className="text-gray-400 text-[10px]">—</span>}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium ml-auto">
              <Ruler size={10} className="text-gray-400" />
              {formatLandSize(property.land_size) ? <span className="text-gray-500">{formatLandSize(property.land_size)}</span> : <span className="text-gray-400">—</span>}
            </span>
          </div>

          <p className="text-[10px] text-gray-400 mt-1.5 truncate font-medium">{property.agency_name}</p>
        </div>
      </div>
    </Link>
  );
}
