"use client";
import { useState } from "react";
import { Heart, Bed, Bath, Maximize2, MapPin, Eye } from "lucide-react";

interface PropertyCardProps {
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  area: string;
  type: string;
  badge?: string;
  badgeColor?: string;
  views?: string;
}

export default function PropertyCard({
  image, price, title, location,
  beds, baths, area, type,
  badge, badgeColor = "bg-[#C8102E]",
  views = "1.2k",
}: PropertyCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-gray-100 group">
      {/* Image */}
      <div className="relative overflow-hidden h-56">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Top row */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {badge && (
              <span className={`tag-pill text-white ${badgeColor}`}>
                {badge}
              </span>
            )}
            <span className="tag-pill bg-black/50 text-white backdrop-blur-sm">
              {type}
            </span>
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
              liked ? "bg-[#C8102E] text-white" : "bg-white/90 text-gray-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`}/>
          </button>
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{price}</span>
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Eye className="w-3.5 h-3.5"/> {views}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug line-clamp-2 group-hover:text-[#C8102E] transition-colors">
          {title}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0"/>
          {location}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
          <div className="flex-1 flex items-center gap-1.5 justify-center text-xs text-gray-600 font-semibold">
            <Bed className="w-4 h-4 text-gray-400"/>
            <span>{beds}</span>
            <span className="text-gray-400 text-[10px]">Beds</span>
          </div>
          <div className="w-px h-6 bg-gray-100"/>
          <div className="flex-1 flex items-center gap-1.5 justify-center text-xs text-gray-600 font-semibold">
            <Bath className="w-4 h-4 text-gray-400"/>
            <span>{baths}</span>
            <span className="text-gray-400 text-[10px]">Baths</span>
          </div>
          <div className="w-px h-6 bg-gray-100"/>
          <div className="flex-1 flex items-center gap-1.5 justify-center text-xs text-gray-600 font-semibold">
            <Maximize2 className="w-4 h-4 text-gray-400"/>
            <span>{area}</span>
          </div>
        </div>

        {/* CTA */}
        <button className="mt-3 w-full py-2.5 rounded-xl border-2 border-[#C8102E] text-[#C8102E] text-xs font-bold hover:bg-[#C8102E] hover:text-white transition-all">
          View Property →
        </button>
      </div>
    </div>
  );
}
