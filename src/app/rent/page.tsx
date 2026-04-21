"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { X } from "lucide-react";

const PROPERTY_TYPES = ["Any", "House", "Apartment", "Townhouse", "Villa", "Land"];
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
  if (searchParams.get("min_price")) labels.push({ key: "min_price", label: `From $${Number(searchParams.get("min_price")).toLocaleString()}/wk` });
  if (searchParams.get("max_price")) labels.push({ key: "max_price", label: `To $${Number(searchParams.get("max_price")).toLocaleString()}/wk` });
  if (searchParams.get("beds")) labels.push({ key: "beds", label: `${searchParams.get("beds")}+ beds` });
  if (searchParams.get("baths")) labels.push({ key: "baths", label: `${searchParams.get("baths")}+ baths` });
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {labels.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1 bg-blue-50 border border-[#121e80]/20 text-[#121e80] text-xs font-semibold px-2.5 py-1 rounded-full">
          {label}
          <button onClick={() => onClear(key)} className="hover:text-red-500 transition-colors ml-0.5"><X size={11} /></button>
        </span>
      ))}
    </div>
  );
}

function RentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sort, setSort] = useState("Most recent");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const buildFilters = useCallback(() => ({
    listing_type: "rent" as const,
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
    router.push(`/rent?${p.toString()}`);
  }

  function clearParam(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.push(`/rent?${p.toString()}`);
  }

  const activeType = searchParams.get("property_type") ?? "Any";

  const sorted = [...items].sort((a, b) => {
    const pa = a.price_per_week ?? a.price;
    const pb = b.price_per_week ?? b.price;
    if (sort === "Price (low → high)") return pa - pb;
    if (sort === "Price (high → low)") return pb - pa;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <SearchHero defaultTab="Rent" title="Search properties for rent" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-2 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "..." : <>{total} rental{total !== 1 ? "s" : ""}</>}
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
          <div className="ml-auto">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none text-gray-600 bg-white">
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <ActiveFilters searchParams={searchParams} onClear={clearParam} />

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-base mb-2">No rental properties found.</p>
              <button onClick={() => router.push("/rent")} className="text-sm text-[#121e80] font-semibold hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sorted.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function RentPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <RentContent />
      </Suspense>
      <Footer />
    </div>
  );
}
