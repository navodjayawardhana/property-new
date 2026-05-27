"use client";
import { useParams } from "next/navigation";
import { getAgentById } from "@/app/lib/data/agents";
import { properties } from "@/app/lib/data/properties";
import { Star, MapPin, Phone, Mail, Award, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import PropertyCard from "@/app/components/PropertyCard";

export default function AgentProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const agent = getAgentById(id);

  if (!agent) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800">Agent not found</h1>
          <Link href="/agents" className="text-[#4CD137] font-semibold mt-4 inline-block">
            ← Back to agents
          </Link>
        </div>
      </main>
    );
  }

  const agentProperties = properties.filter((p) => agent.currentListings.includes(p.id));

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={agent.image}
              alt={agent.name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-1">{agent.name}</h1>
              <p className="text-white/60 mb-1">{agent.title}</p>
              <p className="text-[#4CD137] font-semibold mb-3">{agent.agency}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{agent.stats.rating}</span>
                  <span className="text-white/50">({agent.stats.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <MapPin className="w-4 h-4" />
                  {agent.location}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center gap-2 bg-[#4CD137] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#3da82d] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <a
                href={`mailto:${agent.email}`}
                className="flex items-center gap-2 bg-white text-[#1a1a5e] font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <Award className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                <div className="text-2xl font-black text-gray-900">{agent.stats.propertiesSold}</div>
                <div className="text-xs text-gray-500">Properties Sold</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <Clock className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                <div className="text-2xl font-black text-gray-900">{agent.stats.avgDaysOnMarket}</div>
                <div className="text-xs text-gray-500">Avg Days on Market</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <TrendingUp className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                <div className="text-2xl font-black text-gray-900">{agent.stats.totalSalesValue}</div>
                <div className="text-xs text-gray-500">Total Sales</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                <Star className="w-6 h-6 text-[#4CD137] mx-auto mb-2" />
                <div className="text-2xl font-black text-gray-900">{agent.stats.rating}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About {agent.name}</h2>
              <p className="text-gray-600 leading-relaxed">{agent.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-green-50 text-[#4CD137]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Listings */}
            {agentProperties.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Current Listings</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {agentProperties.map((property) => (
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
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact {agent.name}</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137]"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4CD137] resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-[#4CD137] text-white font-bold py-3 rounded-xl hover:bg-[#3da82d] transition-colors"
                >
                  Send Message
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CD137]"
                >
                  <Phone className="w-4 h-4" />
                  {agent.phone}
                </a>
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CD137]"
                >
                  <Mail className="w-4 h-4" />
                  {agent.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
