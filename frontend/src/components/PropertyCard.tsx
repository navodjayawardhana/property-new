"use client";

import Link from "next/link";
import { Bed, Bath, Car, Heart, Ruler, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import type { Property } from "@/lib/api";
import { favorites as favoritesApi } from "@/lib/api";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils";
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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={getPrimaryImageUrl(property)}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isSold && (
              <span className="bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                SOLD {property.sold_date
                  ? new Date(property.sold_date).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })
                  : ""}
              </span>
            )}
            {isNew && (
              <span className="bg-[#16a34a] text-white text-xs font-bold px-2.5 py-1 rounded-lg">NEW</span>
            )}
            {!isSold && !isNew && property.days_listed > 0 && property.days_listed <= 14 && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Clock size={10} /> {property.days_listed}d ago
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm ${saved ? "text-red-500 scale-110" : "text-gray-500 hover:text-red-400 hover:scale-110"}`}
          >
            <Heart size={14} fill={saved ? "currentColor" : "none"} />
          </button>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20" />

          {/* Property type + listing type */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="text-white text-xs font-semibold">{property.property_type}</span>
            {isRent && property.price_per_week && (
              <span className="bg-teal-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-md">FOR RENT</span>
            )}
            {property.is_featured && !isSold && (
              <span className="bg-yellow-400/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-0.5 rounded-md">FEATURED</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[#16a34a] font-black text-xl leading-tight">{formatPrice(property)}</p>
          <p className="text-gray-900 font-bold text-sm mt-1 leading-snug line-clamp-1">{property.address}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {property.suburb} {property.state} {property.postcode}
          </p>

          {/* Specs */}
          <div className="flex items-center gap-3.5 mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Bed size={14} className="text-gray-400" />
              {property.beds ? <span className="text-gray-700">{property.beds}</span> : <span className="text-gray-400 text-xs">N/A</span>}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Bath size={14} className="text-gray-400" />
              {property.baths ? <span className="text-gray-700">{property.baths}</span> : <span className="text-gray-400 text-xs">N/A</span>}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Car size={14} className="text-gray-400" />
              {property.cars ? <span className="text-gray-700">{property.cars}</span> : <span className="text-gray-400 text-xs">N/A</span>}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium ml-auto">
              <Ruler size={11} className="text-gray-400" />
              {property.land_size ? <span className="text-gray-500">{property.land_size}</span> : <span className="text-gray-400">N/A</span>}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2.5 truncate font-medium">{property.agency_name}</p>
        </div>
      </div>
    </Link>
  );
}
