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

const SORT_OPTIONS = [
  "Price (low â†’ high)",
  "Price (high â†’ low)",
];
const INITIAL_LIMIT = 12;

function ActiveFilters({
  searchParams,
  onClear,
}: {
  searchParams: URLSearchParams;
  onClear: (key: string) => void;
}) {
  const labels: { key: string; label: string }[] = [];
  if (searchParams.get("q"))
    labels.push({ key: "q", label: `"${searchParams.get("q")}"` });
  if (searchParams.get("suburb"))
    labels.push({ key: "suburb", label: searchParams.get("suburb")! });
  if (searchParams.get("state"))
    labels.push({ key: "state", label: searchParams.get("state")! });
  if (searchParams.get("postcode"))
    labels.push({ key: "postcode", label: searchParams.get("postcode")! });
  if (searchParams.get("min_price"))
    labels.push({
      key: "min_price",
      label: `From Rs ${Number(searchParams.get("min_price")).toLocaleString()}`,
    });
  if (searchParams.get("max_price"))
    labels.push({
      key: "max_price",
      label: `To Rs ${Number(searchParams.get("max_price")).toLocaleString()}`,
    });
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {labels.map(({ key, label }) => (
        <span
          key={key}
          className="flex items-center gap-1 bg-green-50 border border-[#16a34a]/20 text-[#16a34a] text-xs font-semibold px-2.5 py-1 rounded-full"
        >
          {label}
          <button
            onClick={() => onClear(key)}
            className="hover:text-red-500 transition-colors ml-0.5"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

function SoldContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sort, setSort] = useState("");
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const buildFilters = useCallback(
    () => ({
      listing_type: "sold" as const,
      q: searchParams.get("q") || undefined,
      suburb: searchParams.get("suburb") || undefined,
      state: searchParams.get("state") || undefined,
      postcode: searchParams.get("postcode") || undefined,
      min_price: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,
      max_price: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,
      beds: searchParams.get("beds")
        ? Number(searchParams.get("beds"))
        : undefined,
      per_page: 50,
    }),
    [searchParams],
  );

  useEffect(() => {
    setShowAll(false);
    setLoading(true);
    propertiesApi
      .list(buildFilters())
      .then((res) => {
        setItems(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [buildFilters]);

  function clearParam(key: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.push(`/sold?${p.toString()}`);
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === "Price (low â†’ high)") return a.price - b.price;
    if (sort === "Price (high â†’ low)") return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <SearchHero defaultTab="Sold" title="Search sold properties" />
      <ExploreSection />

      <section className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-2 pb-5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {loading ? (
              <svg
                className="w-4 h-4 animate-spin text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              <>{total} recently sold</>
            )}
          </span>
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1.5 outline-none text-gray-400 bg-white"
            >
              <option value="" disabled>Sort</option>
              {SORT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <ActiveFilters searchParams={searchParams} onClear={clearParam} />

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-base mb-2">
                No sold properties found.
              </p>
              <button
                onClick={() => router.push("/sold")}
                className="text-sm text-[#16a34a] font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(showAll ? sorted : sorted.slice(0, INITIAL_LIMIT)).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              {sorted.length > INITIAL_LIMIT && (
                <div className="mt-10 mb-4 text-center">
                  {!showAll ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 max-w-xs mx-auto">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${(INITIAL_LIMIT / sorted.length) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{INITIAL_LIMIT} of {sorted.length}</span>
                      </div>
                      <button onClick={() => setShowAll(true)}
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors shadow-md">
                        View {sorted.length - INITIAL_LIMIT} more
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setShowAll(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-400 text-gray-600 font-bold text-sm px-7 py-3 rounded-xl transition-colors">
                      View less
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function SoldPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <SoldContent />
      </Suspense>
      <Footer />
    </div>
  );
}
