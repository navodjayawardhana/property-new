"use client";
import { Property } from "@/app/types";
import PropertyCard from "../PropertyCard";

interface PropertyGridProps {
  properties: Property[];
  columns?: 2 | 3 | 4;
}

export default function PropertyGrid({ properties, columns = 3 }: PropertyGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No properties found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-5`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          image={property.images[0]}
          price={property.price}
          title={property.title}
          location={`${property.location.suburb}, ${property.location.city}`}
          beds={property.features.beds}
          baths={property.features.baths}
          area={property.features.area}
          type={property.type}
          badge={property.badge}
          badgeColor={property.badgeColor}
          views={property.views}
          listingType={property.listingType}
        />
      ))}
    </div>
  );
}
