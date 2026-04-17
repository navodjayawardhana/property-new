"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { newsArticles } from "@/data/news";

const categories = ["News", "Buying & Building", "Renting", "Insights", "Guides", "Lifestyle", "Video", "Podcasts"];
const subCategories = ["Interest Rates", "Finance", "Industry", "Sustainable Homes", "NSW", "VIC", "QLD", "SA", "WA", "NT", "ACT", "TAS"];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("News");
  const [activeSub, setActiveSub] = useState("Interest Rates");

  const featured = newsArticles[0];
  const secondary = newsArticles.slice(1, 4);
  const rest = newsArticles.slice(4);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* News-specific navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button className="text-gray-700 lg:hidden">
            <Menu size={22} />
          </button>
          <Link href="/" className="flex items-center gap-2 mx-auto lg:mx-0">
            <div className="w-9 h-9 bg-[#121e80] rounded-full flex items-center justify-center shadow-sm overflow-hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold text-sm tracking-tight">Greenbrick.net</span>
          </Link>
          <button className="text-gray-700">
            <Search size={20} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-0 whitespace-nowrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-[#121e80] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-category tags */}
        <div className="overflow-x-auto bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex gap-2 py-2 whitespace-nowrap">
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  activeSub === sub
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero heading */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-gray-900">Latest Property News</h1>
          <p className="text-gray-500 text-sm mt-1">
            Read the latest real estate & finance news, property market trends and housing information and insights.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Featured + secondary layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Large featured */}
          <Link href="/news" className="lg:col-span-2 group block">
            <div className="overflow-hidden rounded-lg">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-3">
              {featured.tag && (
                <span className="text-xs font-bold text-[#121e80] uppercase tracking-wide">{featured.tag}</span>
              )}
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#121e80] transition-colors mt-1 leading-snug">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{featured.excerpt}</p>
              <p className="text-xs text-gray-400 mt-2">{featured.date} · {featured.readTime}</p>
            </div>
          </Link>

          {/* Secondary articles */}
          <div className="flex flex-col gap-5">
            {secondary.map((article) => (
              <Link key={article.id} href="/news" className="group flex gap-3">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-24 h-20 object-cover rounded-lg shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="flex-1 min-w-0">
                  {article.tag && (
                    <span className="text-xs font-bold text-[#121e80] uppercase">{article.tag}</span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#121e80] transition-colors leading-snug line-clamp-3 mt-0.5">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{article.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Rest of articles grid */}
        <div className="border-t border-gray-100 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
