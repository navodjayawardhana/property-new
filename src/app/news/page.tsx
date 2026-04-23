"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { newsApi, type NewsArticleApi } from "@/lib/api";

const CATEGORIES = ["All", "News", "Buying & Building", "Finance", "Renting", "Guides", "Lifestyle", "Insights"];
const SUB_CATEGORIES = ["Interest Rates", "Finance", "Industry", "Sustainable Homes", "NSW", "VIC", "QLD", "SA", "WA", "NT", "ACT", "TAS"];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSub, setActiveSub] = useState("");
  const [articles, setArticles] = useState<NewsArticleApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    newsApi.list({ category: activeCategory === "All" ? undefined : activeCategory, per_page: 20 })
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const featured = articles[0];
  const secondary = articles.slice(1, 4);
  const rest = articles.slice(4);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* News navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button className="text-gray-700 lg:hidden">
            <Menu size={22} />
          </button>
          <Link href="/" className="flex items-center gap-2 mx-auto lg:mx-0">
            <div className="w-9 h-9 bg-[#16a34a] rounded-full flex items-center justify-center shadow-sm overflow-hidden">
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

        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-0 whitespace-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-[#16a34a] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex gap-2 py-2 whitespace-nowrap">
            {SUB_CATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(activeSub === sub ? "" : sub)}
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

      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-gray-900">Latest Property News</h1>
          <p className="text-gray-500 text-sm mt-1">
            Read the latest real estate & finance news, property market trends and housing information and insights.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 animate-pulse">
              <div className="bg-gray-100 rounded-lg h-80 w-full" />
              <div className="mt-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-24 h-20 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg font-medium">No articles found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <Link href={`/news/${featured.id}`} className="lg:col-span-2 group block">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3">
                  {featured.tag && (
                    <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wide">{featured.tag}</span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#16a34a] transition-colors mt-1 leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{featured.excerpt}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(featured.published_at)} · {featured.read_time}</p>
                </div>
              </Link>

              <div className="flex flex-col gap-5">
                {secondary.map((article) => (
                  <Link key={article.id} href={`/news/${article.id}`} className="group flex gap-3">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-24 h-20 object-cover rounded-lg shrink-0 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="flex-1 min-w-0">
                      {article.tag && (
                        <span className="text-xs font-bold text-[#16a34a] uppercase">{article.tag}</span>
                      )}
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#16a34a] transition-colors leading-snug line-clamp-3 mt-0.5">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(article.published_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {rest.length > 0 && (
              <div className="border-t border-gray-100 pt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {rest.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
