"use client";
import { useParams } from "next/navigation";
import { getPropertyById } from "@/app/lib/data/properties";
import { Heart, Share2, Bed, Bath, Car, Maximize2, MapPin, Calendar, Eye, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RentPropertyDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const property = getPropertyById(id);
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800">Property not found</h1>
          <Link href="/rent" className="text-[#4CD137] font-semibold mt-4 inline-block">
            ← Back to rentals
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-[#4CD137]">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/rent" className="text-gray-400 hover:text-[#4CD137]">Rent</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-medium truncate">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="bg-[#1a1a5e]">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[400px] sm:h-[500px]">
            <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
              {currentImage + 1} / {property.images.length}
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${liked ? "bg-[#4CD137]" : "bg-white/90 hover:bg-white"}`}
              >
                <Heart className={`w-5 h-5 ${liked ? "text-white fill-white" : "text-gray-600"}`} />
              </button>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                {property.badge && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${property.badgeColor}`}>
                    {property.badge}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#1a1a5e]">{property.type}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-teal-500">For Rent</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">{property.title}</h1>
              <p className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4 text-[#4CD137]" />
                {property.location.address}, {property.location.suburb}, {property.location.city}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <div className="text-3xl font-black text-[#4CD137]">{property.price}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Property Features</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{property.features.beds || "—"}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{property.features.baths || "—"}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Car className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{property.features.parking || "—"}</div>
                  <div className="text-xs text-gray-500">Parking</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Maximize2 className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{property.features.area}</div>
                  <div className="text-xs text-gray-500">Floor Area</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-[#4CD137]" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Property Manager</h3>
              <div className="flex items-center gap-4 mb-4">
                <img src={property.agent.image} alt={property.agent.name} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-gray-900">{property.agent.name}</div>
                  <div className="text-sm text-[#4CD137] font-semibold">{property.agent.agency}</div>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#4CD137] text-white font-bold hover:bg-[#3da82d] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {property.agent.phone}
                </a>
                <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#4CD137] text-[#4CD137] font-bold hover:bg-[#4CD137] hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
