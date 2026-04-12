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
    <div className="bg-white rounded-2xl overflow-hidden card-hover border border-gray-100 group flex flex-col">

      {/* Image container — fixed height */}
      <div className="relative overflow-hidden h-52 shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"/>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {badge && (
            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm">
            {type}
          </span>
        </div>

        {/* Heart */}
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow ${
            liked ? "bg-[#C8102E]" : "bg-white/90 hover:bg-white"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "text-white fill-white" : "text-gray-500"}`}/>
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-lg font-black text-white leading-none">{price}</span>
          <span className="flex items-center gap-1 text-[11px] text-white/70 font-medium">
            <Eye className="w-3 h-3"/> {views}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + location */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#C8102E] transition-colors">
            {title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
            <MapPin className="w-3 h-3 text-[#C8102E] shrink-0"/>
            {location}
          </p>
        </div>

        {/* Features */}
        <div className="flex items-center border-t border-gray-100 pt-3 gap-0">
          {[
            { icon: <Bed className="w-3.5 h-3.5"/>,      val: beds  > 0 ? beds  : "—", label: "Beds"  },
            { icon: <Bath className="w-3.5 h-3.5"/>,     val: baths > 0 ? baths : "—", label: "Baths" },
            { icon: <Maximize2 className="w-3.5 h-3.5"/>, val: area,                    label: ""      },
          ].map((f, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              {i > 0 && <span className="absolute w-px h-5 bg-gray-100 self-center"/>}
              <div className="flex items-center gap-1 text-gray-400">{f.icon}</div>
              <span className="text-xs font-bold text-gray-800">{f.val}</span>
              {f.label && <span className="text-[10px] text-gray-400">{f.label}</span>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-[#C8102E] text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-all mt-auto">
          View Property
        </button>
      </div>
    </div>
  );
}
