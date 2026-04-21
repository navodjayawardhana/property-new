"use client";

import Link from "next/link";
import { Bed, Bath, Car, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import type { Property } from "@/lib/api";
import { formatPrice, getPrimaryImageUrl } from "@/lib/utils";
import { isSaved, toggleSaved } from "@/lib/saved-properties";

export default function PropertyCard({ property }: { property: Property }) {
  const isSold = property.listing_type === "sold";
  const isNew = !isSold && property.days_listed <= 3;
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSaved(isSaved(property.id)); }, [property.id]);

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="relative overflow-hidden h-52">
          <img
            src={getPrimaryImageUrl(property)}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {isSold && (
              <span className="bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                SOLD {property.sold_date ? new Date(property.sold_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </span>
            )}
            {isNew && (
              <span className="bg-[#121e80] text-white text-xs font-bold px-2.5 py-1 rounded-lg">NEW</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setSaved(toggleSaved(property)); }}
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm ${saved ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
          >
            <Heart size={14} fill={saved ? "currentColor" : "none"} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16" />
          <span className="absolute bottom-2.5 left-3 text-white text-xs font-semibold">{property.property_type}</span>
        </div>

        <div className="p-4">
          <p className="text-[#121e80] font-black text-xl leading-tight">{formatPrice(property)}</p>
          <p className="text-gray-900 font-bold text-sm mt-1 leading-snug">{property.address}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {property.suburb} {property.state} {property.postcode}
          </p>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-gray-700 text-sm font-medium">
              <Bed size={14} className="text-gray-400" /> {property.beds}
            </span>
            <span className="flex items-center gap-1.5 text-gray-700 text-sm font-medium">
              <Bath size={14} className="text-gray-400" /> {property.baths}
            </span>
            <span className="flex items-center gap-1.5 text-gray-700 text-sm font-medium">
              <Car size={14} className="text-gray-400" /> {property.cars}
            </span>
            {property.land_size && (
              <span className="ml-auto text-xs text-gray-400 font-medium">{property.land_size}</span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2.5 truncate font-medium">{property.agency_name}</p>
        </div>
      </div>
    </Link>
  );
}
