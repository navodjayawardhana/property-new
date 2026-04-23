"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import NewsCard from "@/components/NewsCard";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";

import { properties as propertiesApi, newsApi, type Property, type NewsArticleApi } from "@/lib/api";
import { X } from "lucide-react";

const PROPERTY_TYPES = ["Any", "House", "Apartment", "Townhouse", "Villa", "Land", "Rural"];
const SORT_OPTIONS = ["Most recent", "Price (low → high)", "Price (high → low)"];

function ActiveFilters({ searchParams, onClear }: {
  searchParams: URLSearchParams;
  onClear: (key: string) => void;
}) {
  const labels: { key: string; label: string }[] = [];
  if (searchParams.get("q")) labels.push({ key: "q", label: `"${searchParams.get("q")}"` });
  if (searchParams.get("suburb")) labels.push({ key: "suburb", label: searchParams.get("suburb")! });
  if (searchParams.get("state")) labels.push({ key: "state", label: searchParams.get("state")! });
  if (searchParams.get("postcode")) labels.push({ key: "postcode", label: searchParams.get("postcode")! });
  if (searchParams.get("property_type")) labels.push({ key: "property_type", label: searchParams.get("property_type")! });
  if (searchParams.get("min_price")) labels.push({ key: "min_price", label: `From $${Number(searchParams.get("min_price")).toLocaleString()}` });
  if (searchParams.get("max_price")) labels.push({ key: "max_price", label: `To $${Number(searchParams.get("max_price")).toLocaleString()}` });
  if (searchParams.get("beds")) labels.push({ key: "beds", label: `${searchParams.get("beds")}+ beds` });
  if (searchParams.get("baths")) labels.push({ key: "baths", label: `${searchParams.get("baths")}+ baths` });
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {labels.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1 bg-green-50 border border-[#16a34a]/20 text-[#16a34a] text-xs font-semibold px-2.5 py-1 rounded-full">
          {label}
          <button onClick={() => onClear(key)} className="hover:text-red-500 transition-colors ml-0.5"><X size={11} /></button>
        </span>
      ))}
    </div>
  );
}

function BuyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sort, setSort] = useState("Most recent");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [latestNews, setLatestNews] = useState<NewsArticleApi[]>([]);

  useEffect(() => {
    newsApi.list({ per_page: 4 }).then((res) => setLatestNews(res.data)).catch(() => {});
  }, []);

  const buildFilters = useCallback(() => ({
    listing_type: "buy" as const,
    q: searchParams.get("q") || undefined,
    suburb: searchParams.get("suburb") || undefined,
    state: searchParams.get("state") || undefined,
    postcode: searchParams.get("postcode") || undefined,
    property_type: searchParams.get("property_type") || undefined,
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    beds: searchParams.get("beds") ? Number(searchParams.get("beds")) : undefined,
    baths: searchParams.get("baths") ? Number(searchParams.get("baths")) : undefined,
    per_page: 50,
  }), [searchParams]);

  useEffect(() => {
    setLoading(true);
    propertiesApi.list(buildFilters())
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [buildFilters]);

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value && value !== "Any") p.set(key, value);
    else p.delete(key);
    router.push(`/buy?${p.toString()}`);
  }

  function clearParam(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.push(`/buy?${p.toString()}`);
  }

  const activeType = searchParams.get("property_type") ?? "Any";

  const sorted = [...items].sort((a, b) => {
    if (sort === "Price (low → high)") return a.price - b.price;
    if (sort === "Price (high → low)") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <SearchHero defaultTab="Buy" title="Search properties for sale" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-2 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "..." : <>{total} propert{total !== 1 ? "ies" : "y"}</>}
          </span>
          <div className="flex gap-2 flex-wrap ml-2">
            {PROPERTY_TYPES.map((type) => (
              <button key={type}
                onClick={() => setParam("property_type", type === "Any" ? null : type)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${activeType === type || (type === "Any" && !activeType) ? "bg-gray-900 text-white border-gray-900" : "text-gray-600 border-gray-300 hover:border-gray-500"}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none text-gray-600 bg-white">
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        <ActiveFilters searchParams={searchParams} onClear={clearParam} />

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-base mb-2">No properties found.</p>
              <button onClick={() => router.push("/buy")} className="text-sm text-[#16a34a] font-semibold hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {sorted.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 border border-gray-200">
          <div>
            <p className="text-xs font-semibold text-[#16a34a] mb-1">Greenbrick.net</p>
            <h3 className="text-base font-bold text-gray-900">Explore your home loan options</h3>
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded transition-colors shrink-0">
            Compare loans
          </button>
        </div>
      </section>

      <section className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Latest property news</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {latestNews.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
      </section>
    </>
  );
}

export default function BuyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <BuyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
