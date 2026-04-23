"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import Footer from "@/components/Footer";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { Building2, X } from "lucide-react";

const PROPERTY_TYPES = ["Any", "House", "Apartment", "Townhouse", "Villa", "Land", "Rural"];
const LISTING_TYPES  = ["Any", "For Sale", "For Rent", "Sold"];
const SORT_OPTIONS   = ["Most recent", "Price (low → high)", "Price (high → low)"];

const listingMap: Record<string, "buy" | "rent" | "sold"> = {
  "For Sale": "buy", "For Rent": "rent", "Sold": "sold",
};

function CommercialContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [sort, setSort]   = useState("Most recent");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const buildFilters = useCallback(() => {
    const lt = searchParams.get("listing_type");
    return {
      category:      "commercial" as const,
      listing_type:  lt ? (lt as "buy" | "rent" | "sold") : undefined,
      q:             searchParams.get("q")             || undefined,
      suburb:        searchParams.get("suburb")        || undefined,
      state:         searchParams.get("state")         || undefined,
      postcode:      searchParams.get("postcode")      || undefined,
      property_type: searchParams.get("property_type") || undefined,
      min_price:     searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price:     searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      beds:          searchParams.get("beds")  ? Number(searchParams.get("beds"))  : undefined,
      baths:         searchParams.get("baths") ? Number(searchParams.get("baths")) : undefined,
      per_page: 50,
    };
  }, [searchParams]);

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
    router.push(`/commercial?${p.toString()}`);
  }

  function clearParam(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.push(`/commercial?${p.toString()}`);
  }

  const activeType    = searchParams.get("property_type") ?? "Any";
  const activeListing = searchParams.get("listing_type")  ?? "Any";

  const sorted = [...items].sort((a, b) => {
    if (sort === "Price (low → high)") return a.price - b.price;
    if (sort === "Price (high → low)") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeFilters: { key: string; label: string }[] = [];
  if (searchParams.get("q"))             activeFilters.push({ key: "q",             label: `"${searchParams.get("q")}"` });
  if (searchParams.get("suburb"))        activeFilters.push({ key: "suburb",        label: searchParams.get("suburb")! });
  if (searchParams.get("state"))         activeFilters.push({ key: "state",         label: searchParams.get("state")! });
  if (searchParams.get("postcode"))      activeFilters.push({ key: "postcode",      label: searchParams.get("postcode")! });
  if (searchParams.get("property_type")) activeFilters.push({ key: "property_type", label: searchParams.get("property_type")! });
  if (searchParams.get("listing_type"))  activeFilters.push({ key: "listing_type",  label: LISTING_TYPES.find((l) => listingMap[l] === searchParams.get("listing_type")) ?? "" });
  if (searchParams.get("min_price"))     activeFilters.push({ key: "min_price",     label: `From $${Number(searchParams.get("min_price")).toLocaleString()}` });
  if (searchParams.get("max_price"))     activeFilters.push({ key: "max_price",     label: `To $${Number(searchParams.get("max_price")).toLocaleString()}` });

  return (
    <>
      {/* Hero */}
      <div className="bg-[#052e16] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Commercial &amp; Mixed</p>
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl mb-2">Commercial Properties</h1>
          <p className="text-slate-400 text-sm">Commercial and mixed-use properties across Australia.</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Toolbar */}
        <div className="space-y-3 pb-5 border-b border-gray-200">
          {/* Row 1 — Listing type as segmented control + sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Listing type</p>
              <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1">
                {LISTING_TYPES.map((lt) => {
                  const val = listingMap[lt];
                  const active = lt === "Any" ? !activeListing || activeListing === "Any" : activeListing === val;
                  return (
                    <button key={lt}
                      onClick={() => setParam("listing_type", val ?? null)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        active
                          ? "bg-[#052e16] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}>
                      {lt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">
                {loading ? "..." : <><span className="font-bold text-gray-900">{total}</span> propert{total !== 1 ? "ies" : "y"}</>}
              </span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#16a34a] text-gray-600 bg-white">
                {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 — Property type as chips */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Property type</p>
            <div className="flex gap-2 flex-wrap">
              {PROPERTY_TYPES.map((type) => {
                const active = activeType === type || (type === "Any" && !activeType);
                return (
                  <button key={type}
                    onClick={() => setParam("property_type", type === "Any" ? null : type)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      active
                        ? "bg-[#16a34a] text-white border-[#16a34a]"
                        : "text-gray-600 border-gray-200 bg-white hover:border-[#16a34a] hover:text-[#16a34a]"
                    }`}>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1 bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
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
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={28} className="text-slate-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No commercial properties found</p>
              <p className="text-gray-400 text-sm">Try clearing your filters</p>
              <button onClick={() => router.push("/commercial")}
                className="mt-4 text-sm text-[#16a34a] font-semibold hover:underline">
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

export default function CommercialPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <CommercialContent />
      </Suspense>
      <Footer />
    </div>
  );
}
