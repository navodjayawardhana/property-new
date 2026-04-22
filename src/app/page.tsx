"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import NewsCard from "@/components/NewsCard";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, agentsApi, newsApi, type Property, type Agent, type NewsArticleApi } from "@/lib/api";
import { ChevronRight, TrendingUp, Home, Key, Award } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [buyProps, setBuyProps] = useState<Property[]>([]);
  const [rentProps, setRentProps] = useState<Property[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticleApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      propertiesApi.list({ listing_type: "buy", featured: true, per_page: 3 }),
      propertiesApi.list({ listing_type: "rent", per_page: 2 }),
      agentsApi.list({ page: 1 }),
      newsApi.list({ per_page: 4 }),
    ])
      .then(([buyRes, rentRes, agentsRes, newsRes]) => {
        setBuyProps(buyRes.data.slice(0, 3));
        setRentProps(rentRes.data.slice(0, 2));
        setFeaturedAgents(agentsRes.data.slice(0, 8));
        setLatestNews(newsRes.data.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="-mt-20">
        <SearchHero defaultTab="Buy" />
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Home size={18} className="text-[#121e80]" />, value: "120,000+", label: "For sale" },
            { icon: <Key size={18} className="text-[#121e80]" />, value: "55,000+", label: "For rent" },
            { icon: <TrendingUp size={18} className="text-[#121e80]" />, value: "310,000+", label: "Sold this year" },
            { icon: <Award size={18} className="text-[#121e80]" />, value: "32 days", label: "Avg. time on market" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="font-black text-gray-900 text-base leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExploreSection />

      {/* Featured for sale */}
      <section className="max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-[#121e80] uppercase tracking-widest mb-1">Featured listings</p>
            <h2 className="text-2xl font-black text-gray-900">Properties for sale</h2>
          </div>
          <Link href="/buy" className="text-sm font-semibold text-[#121e80] hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : buyProps.length === 0
              ? <p className="col-span-3 text-gray-400 text-center py-10">No properties listed yet.</p>
              : buyProps.map((p) => <PropertyCard key={p.id} property={p} />)
          }
        </div>
      </section>

      {/* Promo banner */}
      <div className="max-w-7xl mx-auto px-4 w-full pb-6">
        <div className="relative rounded-2xl overflow-hidden bg-[#0f172a] px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)" }} />
          <div className="relative">
            <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">Home loans</p>
            <h3 className="text-white font-black text-xl">Explore your home loan options</h3>
            <p className="text-gray-400 text-sm mt-1">Compare rates from 30+ lenders in minutes.</p>
          </div>
          <button className="relative bg-[#121e80] hover:bg-[#0d1660] text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 text-sm">
            Compare loans
          </button>
        </div>
      </div>

      {/* For rent */}
      <section className="max-w-7xl mx-auto px-4 pb-10 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-[#121e80] uppercase tracking-widest mb-1">Rentals</p>
            <h2 className="text-2xl font-black text-gray-900">Properties for rent</h2>
          </div>
          <Link href="/rent" className="text-sm font-semibold text-[#121e80] hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : rentProps.length === 0
              ? <p className="col-span-2 text-gray-400 text-center py-10">No rentals listed yet.</p>
              : rentProps.map((p) => <PropertyCard key={p.id} property={p} />)
          }
        </div>
      </section>

      {/* News */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 w-full">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[#121e80] uppercase tracking-widest mb-1">Stay informed</p>
              <h2 className="text-2xl font-black text-gray-900">Latest property news</h2>
            </div>
            <Link href="/news" className="text-sm font-semibold text-[#121e80] hover:underline flex items-center gap-1">
              All news <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {latestNews.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
      </section>

      {/* Real estate agents */}
      <section className="border-t border-gray-100 bg-gray-50 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#121e80] uppercase tracking-widest mb-1">Connect</p>
              <h2 className="text-2xl font-black text-gray-900">Find a real estate agent</h2>
            </div>
            <Link href="/agents"
              className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:border-[#121e80] hover:text-[#121e80] transition-colors font-medium bg-white">
              View all agents <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-40 border border-gray-200 rounded-xl px-4 py-4 bg-white animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1.5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : featuredAgents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No agents registered yet.{" "}
              <Link href="/join" className="text-[#121e80] font-semibold hover:underline">Join as an agent</Link>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide py-2">
              <div className="flex items-stretch gap-3">
                {featuredAgents.map((agent) => (
                  <Link key={agent.id} href="/agents"
                    className="shrink-0 flex flex-col items-center gap-3 w-40 border border-gray-200 rounded-xl px-4 py-4 cursor-pointer group hover:border-[#121e80] hover:shadow-md transition-all bg-white">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#121e80] flex items-center justify-center group-hover:ring-2 group-hover:ring-[#121e80] group-hover:ring-offset-2 transition-all">
                        {agent.avatar ? (
                          <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-2xl font-black">{agent.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{agent.name}</p>
                      <p className="text-xs text-[#121e80] font-medium mt-0.5">Real Estate Agent</p>
                      {(agent.suburb || agent.state) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[agent.suburb, agent.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
                <div className="shrink-0 flex items-center justify-center w-12">
                  <Link href="/agents"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#121e80] hover:text-[#121e80] transition-colors bg-white shadow-sm">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
