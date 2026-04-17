import Link from "next/link";
import { Bed, Bath, Car, Heart } from "lucide-react";
import type { Property } from "@/data/properties";

export default function PropertyCard({ property }: { property: Property }) {
  const isSold = property.listingType === "sold";
  const isNew = !isSold && property.daysListed && property.daysListed <= 3;

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isSold && (
              <span className="bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                SOLD {property.soldDate}
              </span>
            )}
            {isNew && (
              <span className="bg-[#121e80] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                NEW
              </span>
            )}
          </div>
          {/* Save button */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-[#121e80] transition-colors shadow-sm"
          >
            <Heart size={14} />
          </button>
          {/* Type badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16" />
          <span className="absolute bottom-2.5 left-3 text-white text-xs font-semibold">{property.propertyType}</span>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-[#121e80] font-black text-xl leading-tight">{property.price}</p>
          <p className="text-gray-900 font-bold text-sm mt-1 leading-snug">{property.address}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {property.suburb} {property.state} {property.postcode}
          </p>

          {/* Features */}
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
            {property.landSize && (
              <span className="ml-auto text-xs text-gray-400 font-medium">{property.landSize}</span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2.5 truncate font-medium">{property.agency}</p>
        </div>
      </div>
    </Link>
  );
}
