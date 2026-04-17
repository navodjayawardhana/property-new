"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, MapPin } from "lucide-react";

type SearchTab = "Buy" | "Rent" | "Sold" | "Address" | "Agents";

const tabRoutes: Record<string, string> = {
  Buy: "/buy", Rent: "/rent", Sold: "/sold", Address: "/buy", Agents: "/",
};

const priceRangesBuy = ["Any","$200,000","$300,000","$400,000","$500,000","$600,000","$700,000","$800,000","$900,000","$1,000,000","$1,250,000","$1,500,000","$2,000,000","$3,000,000+"];
const priceRangesRent = ["Any","$200/wk","$300/wk","$400/wk","$500/wk","$600/wk","$700/wk","$800/wk","$1,000/wk","$1,500/wk+"];
const bedroomOptions = ["Any","1+","2+","3+","4+","5+"];
const propertyTypes = ["House","Apartment / Unit","Townhouse","Villa","Land","Rural","Block of Units","Retirement Living"];
const suggestions = ["Sydney NSW","Melbourne VIC","Brisbane QLD","Perth WA","Adelaide SA","Gold Coast QLD","Hobart TAS"];

type Props = { defaultTab?: SearchTab; title?: string };

export default function SearchHero({ defaultTab = "Buy", title }: Props) {
  const [tab, setTab] = useState<SearchTab>(defaultTab);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [minPrice, setMinPrice] = useState("Any");
  const [maxPrice, setMaxPrice] = useState("Any");
  const [minBeds, setMinBeds] = useState("Any");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const router = useRouter();

  const priceRanges = tab === "Rent" ? priceRangesRent : priceRangesBuy;

  // lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const handleSearch = () => { setShowSuggestions(false); router.push(tabRoutes[tab]); };
  const toggleType = (t: string) => setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  const clearAll = () => { setMinPrice("Any"); setMaxPrice("Any"); setMinBeds("Any"); setSelectedTypes([]); };

  const activeFilterCount = [minPrice !== "Any", maxPrice !== "Any", minBeds !== "Any", selectedTypes.length > 0].filter(Boolean).length;

  const placeholder = tab === "Agents" ? "Search by agent name, suburb or postcode" : tab === "Address" ? "Enter a street address" : "Search suburb, postcode or state";

  return (
    <>
      {/* ── Hero card ── */}
      <div className="max-w-7xl mx-auto px-4 py-5 w-full">
        <div
          className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.42),rgba(0,0,0,0.32)), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)",
          }}
        >
          <div className="relative w-full max-w-2xl mx-auto px-4 py-10">
            <div className="bg-white rounded-xl shadow-2xl overflow-visible">
              {/* Title */}
              <div className="px-5 pt-4 pb-1">
                <p className="text-sm font-semibold text-gray-800">
                  {title ?? `Search properties for ${tab === "Buy" ? "sale" : tab === "Rent" ? "rent" : tab === "Sold" ? "sold" : tab === "Address" ? "sale" : "agents"}`}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex px-5 pt-1 border-b border-gray-200">
                {(["Buy","Rent","Sold","Address","Agents"] as SearchTab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-[#121e80] text-[#121e80]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <div className="relative flex-1">
                  <input
                    type="text" value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
                    onFocus={() => setShowSuggestions(query.length > 0)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={placeholder}
                    className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase())).map((s) => (
                        <button key={s} onClick={() => { setQuery(s); setShowSuggestions(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                          <MapPin size={13} className="text-gray-400 shrink-0" />{s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {query && <button onClick={() => { setQuery(""); setShowSuggestions(false); }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}

                <div className="w-px h-5 bg-gray-200 shrink-0" />

                {/* Filters → opens modal */}
                <button
                  onClick={() => setShowModal(true)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded border transition-colors shrink-0 ${activeFilterCount > 0 ? "bg-blue-50 border-[#121e80] text-[#121e80]" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#121e80] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{activeFilterCount}</span>
                  )}
                </button>

                <button onClick={handleSearch}
                  className="bg-[#121e80] hover:bg-[#0d1660] active:scale-95 text-white text-sm font-bold px-5 py-1.5 rounded transition-all shrink-0">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Price range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                    <div className="relative">
                      <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full appearance-none text-sm border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#121e80] bg-white text-gray-700 cursor-pointer">
                        {priceRanges.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                    <div className="relative">
                      <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full appearance-none text-sm border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-[#121e80] bg-white text-gray-700 cursor-pointer">
                        {priceRanges.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Bedrooms</h3>
                <div className="flex gap-2">
                  {bedroomOptions.map((b) => (
                    <button key={b} onClick={() => setMinBeds(b)}
                      className={`flex-1 text-sm py-2.5 rounded-lg border font-medium transition-colors ${minBeds === b ? "bg-[#121e80] text-white border-[#121e80]" : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Property type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map((type) => (
                    <button key={type} onClick={() => toggleType(type)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${selectedTypes.includes(type) ? "bg-blue-50 border-[#121e80] text-[#121e80]" : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selectedTypes.includes(type) ? "bg-[#121e80] border-[#121e80]" : "border-gray-300"}`}>
                        {selectedTypes.includes(type) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={clearAll} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors underline">
                Clear all
              </button>
              <button
                onClick={() => { setShowModal(false); handleSearch(); }}
                className="bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-bold px-8 py-2.5 rounded-lg transition-colors">
                {activeFilterCount > 0 ? `Show results (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""})` : "Show results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
