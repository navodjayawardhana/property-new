"use client";

import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import NewsCard from "@/components/NewsCard";
import PropertyCard from "@/components/PropertyCard";
import Footer from "@/components/Footer";
import { newsArticles, brokers } from "@/data/news";
import { properties } from "@/data/properties";
import { ChevronDown, ChevronRight, TrendingUp, Home, Key, Award } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const featuredBuy = properties.filter((p) => p.listingType === "buy").slice(0, 3);
  const featuredRent = properties.filter((p) => p.listingType === "rent").slice(0, 2);
  const latestNews = newsArticles.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Buy" />

      {/* ── Stats bar ── */}
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

      {/* ── Explore section ── */}
      <ExploreSection />

      {/* ── Featured for sale ── */}
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
          {featuredBuy.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      {/* ── Promo banner ── */}
      <div className="max-w-7xl mx-auto px-4 w-full pb-6">
        <div className="relative rounded-2xl overflow-hidden bg-[#0f172a] px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)" }}
          />
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

      {/* ── For rent ── */}
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
          {featuredRent.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      {/* ── News ── */}
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

      {/* ── Mortgage brokers ── */}
      <section className="border-t border-gray-100 bg-gray-50 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#121e80] uppercase tracking-widest mb-1">Connect</p>
              <h2 className="text-2xl font-black text-gray-900">Local mortgage brokers</h2>
            </div>
            <button className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:border-gray-500 transition-colors font-medium bg-white">
              8 Brokers around you <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="overflow-x-auto scrollbar-hide py-2">
            <div className="flex items-stretch gap-3">
              {brokers.map((broker) => (
                <div key={broker.id}
                  className="shrink-0 flex flex-col items-center gap-3 w-40 border border-gray-200 rounded-xl px-4 py-4 cursor-pointer group hover:border-[#121e80] hover:shadow-md transition-all bg-white">
                  <div className="relative">
                    <img src={broker.image} alt={broker.name}
                      className="w-20 h-20 rounded-full object-cover group-hover:ring-2 group-hover:ring-[#121e80] group-hover:ring-offset-2 transition-all" />
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{broker.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{broker.title}</p>
                    <p className="text-xs text-gray-400">{broker.suburb}</p>
                  </div>
                </div>
              ))}
              <div className="shrink-0 flex items-center justify-center w-12">
                <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors bg-white shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#121e80] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-xs font-semibold text-gray-500">Mortgage Choice</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
