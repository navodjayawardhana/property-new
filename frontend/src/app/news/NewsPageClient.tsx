"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { newsApi, type NewsArticleApi } from "@/lib/api";

const CATEGORIES = [
  "All",
  "News",
  "Buying & Building",
  "Finance",
  "Renting",
  "Guides",
  "Lifestyle",
  "Insights",
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type NewsInitialProps = {
  initialLoaded?: boolean;
  initialArticles?: NewsArticleApi[];
};

export default function NewsPageClient({
  initialLoaded = false,
  initialArticles = [],
}: NewsInitialProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticleApi[]>(initialArticles);
  const [loading, setLoading] = useState(!initialLoaded);
  const [newsAvailable, setNewsAvailable] = useState<boolean | null>(
    initialLoaded ? initialArticles.length > 0 : null,
  );

  useEffect(() => {
    if (initialLoaded && activeCategory === "All") {
      setArticles(initialArticles);
      setNewsAvailable(initialArticles.length > 0);
      setLoading(false);
      return;
    }
    setLoading(true);
    newsApi
      .list({
        category: activeCategory === "All" ? undefined : activeCategory,
        per_page: 20,
      })
      .then((res) => {
        setArticles(res.data);
        if (activeCategory === "All") setNewsAvailable(res.data.length > 0);
      })
      .catch(() => {
        setArticles([]);
        if (activeCategory === "All") setNewsAvailable(false);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, initialLoaded, initialArticles]);

  const featured = articles[0];
  const secondary = articles.slice(1, 4);
  const rest = articles.slice(4);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* News navbar — fixed height category bar prevents post-hydration CLS */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/GreenBricksLogo.png"
              alt="Greenbricks — Sri Lanka property portal"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/buy"
            className="text-sm font-semibold text-gray-700 hover:text-[#16a34a] transition-colors flex items-center gap-1.5"
          >
            <Search size={16} aria-hidden="true" />
            <span>Browse properties</span>
          </Link>
        </div>

        <nav aria-label="News categories" className="border-t border-gray-100 overflow-x-auto min-h-[45px]">
          <div className="max-w-7xl mx-auto px-4 flex gap-0 whitespace-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-[#16a34a] text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Property News" }]} />

      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <h1 className="text-3xl font-black text-gray-900">
            Property News &amp; Market Insights in Sri Lanka
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Read Sri Lankan real estate and housing finance news, market updates, and property guides.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 animate-pulse">
              <div className="bg-gray-100 rounded-lg h-64 md:h-80 w-full" />
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
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-gray-800 text-lg font-bold mb-1">
              {newsAvailable === false ? "News coming soon" : "No articles found"}
            </p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {newsAvailable === false
                ? "We're working on bringing you the latest Sri Lankan property news and insights."
                : "Try selecting a different category."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <Link
                href={`/news/${featured.id}`}
                className="lg:col-span-2 group block"
              >
                <div className="overflow-hidden rounded-lg bg-gray-100 h-64 md:h-80">
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    width={800}
                    height={320}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-3">
                  {featured.tag && (
                    <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wide">
                      {featured.tag}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#16a34a] transition-colors mt-1 leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {featured.excerpt}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(featured.published_at)} · {featured.read_time}
                  </p>
                </div>
              </Link>

              <div className="flex flex-col gap-5">
                {secondary.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.id}`}
                    className="group flex gap-3"
                  >
                    <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        width={96}
                        height={80}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {article.tag && (
                        <span className="text-xs font-bold text-[#16a34a] uppercase">
                          {article.tag}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#16a34a] transition-colors leading-snug line-clamp-3 mt-0.5">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(article.published_at)}
                      </p>
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
