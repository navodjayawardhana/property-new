"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { Home, X } from "lucide-react";

const PROPERTY_TYPES = ["Any", "House", "Apartment", "Townhouse", "Villa", "Land", "Rural"];
const SORT_OPTIONS   = ["Most recent", "Price (low → high)", "Price (high → low)"];

function NewHomesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [sort, setSort]   = useState("Most recent");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const buildFilters = useCallback(() => ({
    condition: "new" as const,
    q:            searchParams.get("q")            || undefined,
    suburb:       searchParams.get("suburb")       || undefined,
    state:        searchParams.get("state")        || undefined,
    postcode:     searchParams.get("postcode")     || undefined,
    property_type: searchParams.get("property_type") || undefined,
    min_price:    searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price:    searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    beds:         searchParams.get("beds")  ? Number(searchParams.get("beds"))  : undefined,
    baths:        searchParams.get("baths") ? Number(searchParams.get("baths")) : undefined,
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
    if (value && value !== "Any") p.set(key, value); else p.delete(key);
    router.push(`/new-homes?${p.toString()}`);
  }

  function clearParam(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.push(`/new-homes?${p.toString()}`);
  }

  const activeType = searchParams.get("property_type") ?? "Any";

  const sorted = [...items].sort((a, b) => {
    if (sort === "Price (low → high)") return a.price - b.price;
    if (sort === "Price (high → low)") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // active filter pills
  const activeFilters: { key: string; label: string }[] = [];
  if (searchParams.get("q"))            activeFilters.push({ key: "q",            label: `"${searchParams.get("q")}"` });
  if (searchParams.get("suburb"))       activeFilters.push({ key: "suburb",       label: searchParams.get("suburb")! });
  if (searchParams.get("state"))        activeFilters.push({ key: "state",        label: searchParams.get("state")! });
  if (searchParams.get("postcode"))     activeFilters.push({ key: "postcode",     label: searchParams.get("postcode")! });
  if (searchParams.get("property_type")) activeFilters.push({ key: "property_type", label: searchParams.get("property_type")! });
  if (searchParams.get("min_price"))    activeFilters.push({ key: "min_price",    label: `From $${Number(searchParams.get("min_price")).toLocaleString()}` });
  if (searchParams.get("max_price"))    activeFilters.push({ key: "max_price",    label: `To $${Number(searchParams.get("max_price")).toLocaleString()}` });
  if (searchParams.get("beds"))         activeFilters.push({ key: "beds",         label: `${searchParams.get("beds")}+ beds` });
  if (searchParams.get("baths"))        activeFilters.push({ key: "baths",        label: `${searchParams.get("baths")}+ baths` });

  return (
    <>
      {/* Hero banner */}
      <div className="bg-[#121e80] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Brand new</p>
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl mb-2">New Homes</h1>
          <p className="text-blue-200 text-sm">
            Browse brand-new properties for sale — never been lived in.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-2 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? "..." : <>{total} new propert{total !== 1 ? "ies" : "y"}</>}
          </span>
          <div className="flex gap-2 flex-wrap ml-2">
            {PROPERTY_TYPES.map((type) => (
              <button key={type}
                onClick={() => setParam("property_type", type === "Any" ? null : type)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  activeType === type || (type === "Any" && !activeType)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-600 border-gray-300 hover:border-gray-500"
                }`}>
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

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1 bg-blue-50 border border-[#121e80]/20 text-[#121e80] text-xs font-semibold px-2.5 py-1 rounded-full">
                {label}
                <button onClick={() => clearParam(key)} className="hover:text-red-500 transition-colors ml-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={28} className="text-[#121e80]" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No new homes found</p>
              <p className="text-gray-400 text-sm">Try clearing your filters</p>
              <button onClick={() => router.push("/new-homes")}
                className="mt-4 text-sm text-[#121e80] font-semibold hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {sorted.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function NewHomesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <NewHomesContent />
      </Suspense>
      <Footer />
    </div>
  );
}
