"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin,
  ChevronLeft, ChevronRight,
} from "lucide-react";

type SearchTab = "Buy" | "Rent" | "Sold" | "Address" | "Agents";

const tabRoutes: Record<string, string> = {
  Buy: "/buy", Rent: "/rent", Sold: "/sold", Address: "/buy", Agents: "/agents",
};

const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const priceRangesBuy  = ["Any","$200,000","$300,000","$400,000","$500,000","$600,000","$700,000","$800,000","$900,000","$1,000,000","$1,250,000","$1,500,000","$2,000,000","$3,000,000+"];
const priceRangesRent = ["Any","$200/wk","$300/wk","$400/wk","$500/wk","$600/wk","$700/wk","$800/wk","$1,000/wk","$1,500/wk+"];
const bedroomOptions  = ["Any","1+","2+","3+","4+","5+"];
const propertyTypes   = ["House","Apartment / Unit","Townhouse","Villa","Land","Rural","Block of Units","Retirement Living"];
const suggestions     = [
  "Sydney NSW","Melbourne VIC","Brisbane QLD","Perth WA","Adelaide SA",
  "Gold Coast QLD","Hobart TAS","Canberra ACT","Darwin NT","Newcastle NSW",
  "Geelong VIC","Sunshine Coast QLD","Wollongong NSW","Cairns QLD","Toowoomba QLD",
];

type SlideItem =
  | { type: "image"; src: string; label: string; sub: string }
  | { type: "video"; src: string; label: string; sub: string };

const SLIDES: SlideItem[] = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    label: "Find Your Dream Home",
    sub: "Search over 120,000 properties for sale across Australia",
  },
  {
    type: "video",
    src: "https://assets.mixkit.co/videos/preview/mixkit-modern-house-exterior-1573-large.mp4",
    label: "Modern Living",
    sub: "Discover contemporary homes built for the way you live",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
    label: "Premium Estates",
    sub: "Exclusive properties for discerning buyers",
  },
  {
    type: "video",
    src: "https://assets.mixkit.co/videos/preview/mixkit-swimming-pool-in-a-luxury-home-2068-large.mp4",
    label: "Resort-Style Living",
    sub: "Experience luxury every single day",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=80",
    label: "City Apartments",
    sub: "Urban living at its finest — right where you want to be",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80",
    label: "Coastal Properties",
    sub: "Wake up to ocean views and seaside serenity",
  },
];

const INTERVAL_MS = 5000;

function parsePrice(p: string): number | null {
  if (!p || p === "Any" || p.endsWith("+")) return null;
  const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}

type Props = { defaultTab?: SearchTab; title?: string };

export default function SearchHero({ defaultTab = "Buy", title }: Props) {
  const router = useRouter();

  // ── Slider state ─────────────────────────────────────────────────────────────
  const [current, setCurrent]   = useState(0);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, INTERVAL_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  function goTo(idx: number) {
    setCurrent(idx);
    startTimer(); // reset auto-slide on manual nav
  }
  function prev() { goTo((current - 1 + SLIDES.length) % SLIDES.length); }
  function next() { goTo((current + 1) % SLIDES.length); }

  // ── Search state ──────────────────────────────────────────────────────────────
  const [tab, setTab]                   = useState<SearchTab>(defaultTab);
  const [query, setQuery]               = useState("");
  const [showSuggestions, setShowSugs]  = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [minPrice, setMinPrice]         = useState("Any");
  const [maxPrice, setMaxPrice]         = useState("Any");
  const [minBeds, setMinBeds]           = useState("Any");
  const [minBaths, setMinBaths]         = useState("Any");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const priceRanges = tab === "Rent" ? priceRangesRent : priceRangesBuy;

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const handleSearch = () => {
    setShowSugs(false);
    setShowModal(false);
    const params = new URLSearchParams();
    const trimmed = query.trim();

    if (tab === "Agents") {
      if (trimmed) params.set("search", trimmed);
      router.push(`/agents${params.toString() ? "?" + params.toString() : ""}`);
      return;
    }

    if (trimmed) {
      const stateMatch = trimmed.match(new RegExp(`^(.+?)\\s+(${AU_STATES.join("|")})$`, "i"));
      if (stateMatch) {
        params.set("suburb", stateMatch[1].trim());
        params.set("state", stateMatch[2].toUpperCase());
      } else if (/^\d{4}$/.test(trimmed)) {
        params.set("postcode", trimmed);
      } else if (AU_STATES.includes(trimmed.toUpperCase())) {
        params.set("state", trimmed.toUpperCase());
      } else {
        params.set("q", trimmed);
      }
    }

    const min = parsePrice(minPrice);
    const max = parsePrice(maxPrice);
    if (min !== null) params.set("min_price", String(min));
    if (max !== null) params.set("max_price", String(max));
    if (minBeds  !== "Any") params.set("beds",  minBeds.replace("+", ""));
    if (minBaths !== "Any") params.set("baths", minBaths.replace("+", ""));
    if (selectedTypes.length > 0) params.set("property_type", selectedTypes.join(","));

    router.push(`${tabRoutes[tab]}${params.toString() ? "?" + params.toString() : ""}`);
  };

  const toggleType = (t: string) =>
    setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const clearAll = () => {
    setMinPrice("Any"); setMaxPrice("Any");
    setMinBeds("Any"); setMinBaths("Any");
    setSelectedTypes([]);
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const activeFilterCount = [
    minPrice !== "Any", maxPrice !== "Any",
    minBeds !== "Any", minBaths !== "Any",
    selectedTypes.length > 0,
  ].filter(Boolean).length;

  const placeholder =
    tab === "Agents"  ? "Search by agent name, suburb or postcode" :
    tab === "Address" ? "Enter a street address" :
    "Search suburb, postcode or state";

  return (
    <>
      {/* ── Full-screen hero ────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen overflow-hidden">

        {/* Slides */}
        {SLIDES.map((slide, i) => (
          <div key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}>
            {slide.type === "video" ? (
              <video
                autoPlay muted loop playsInline
                className="w-full h-full object-cover"
                src={slide.src}
              />
            ) : (
              <div className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.src})` }} />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/65" />
          </div>
        ))}

        {/* Slide headline */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pb-36 pointer-events-none">
          {SLIDES.map((slide, i) => (
            <div key={i}
              className={`absolute text-center transition-all duration-700 ${i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <h1 className="text-white font-black text-4xl md:text-6xl drop-shadow-2xl leading-tight">
                {slide.label}
              </h1>
              <p className="text-white/80 text-base md:text-lg mt-3 drop-shadow font-medium">
                {slide.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Search box — sits above dots */}
        <div className="absolute bottom-20 left-0 right-0 z-20 px-4 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-visible">
            <div className="px-5 pt-4 pb-1">
              <p className="text-sm font-semibold text-gray-800">
                {title ??
                  (tab === "Buy"     ? "Search properties for sale" :
                   tab === "Rent"    ? "Search properties for rent" :
                   tab === "Sold"    ? "Search sold properties"     :
                   tab === "Address" ? "Search by address"          :
                   "Find a real estate agent")}
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
                  onChange={(e) => { setQuery(e.target.value); setShowSugs(e.target.value.length > 0); }}
                  onFocus={() => setShowSugs(query.length > 0)}
                  onBlur={() => setTimeout(() => setShowSugs(false), 150)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={placeholder}
                  className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {filteredSuggestions.slice(0, 6).map((s) => (
                      <button key={s} onMouseDown={() => { setQuery(s); setShowSugs(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <MapPin size={13} className="text-gray-400 shrink-0" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {query && (
                <button onClick={() => { setQuery(""); setShowSugs(false); }} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
              <div className="w-px h-5 bg-gray-200 shrink-0" />
              {tab !== "Agents" && (
                <button onClick={() => setShowModal(true)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded border transition-colors shrink-0 ${activeFilterCount > 0 ? "bg-blue-50 border-[#121e80] text-[#121e80]" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#121e80] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{activeFilterCount}</span>
                  )}
                </button>
              )}
              <button onClick={handleSearch}
                className="bg-[#121e80] hover:bg-[#0d1660] active:scale-95 text-white text-sm font-bold px-5 py-1.5 rounded transition-all shrink-0">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"}`} />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <button onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
          <ChevronLeft size={22} />
        </button>
        <button onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
          <ChevronRight size={22} />
        </button>

        {/* Slide counter */}
        <div className="absolute top-4 right-4 z-20 text-white/70 text-xs font-semibold bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {current + 1} / {SLIDES.length}
        </div>
      </section>

      {/* ── Filter modal ────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                <h3 className="text-sm font-bold text-gray-900 mb-3">Bedrooms (min)</h3>
                <div className="flex gap-2 flex-wrap">
                  {bedroomOptions.map((b) => (
                    <button key={b} onClick={() => setMinBeds(b)}
                      className={`flex-1 min-w-[52px] text-sm py-2.5 rounded-lg border font-medium transition-colors ${minBeds === b ? "bg-[#121e80] text-white border-[#121e80]" : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Bathrooms (min)</h3>
                <div className="flex gap-2 flex-wrap">
                  {bedroomOptions.map((b) => (
                    <button key={b} onClick={() => setMinBaths(b)}
                      className={`flex-1 min-w-[52px] text-sm py-2.5 rounded-lg border font-medium transition-colors ${minBaths === b ? "bg-[#121e80] text-white border-[#121e80]" : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"}`}>
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
                        {selectedTypes.includes(type) && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={clearAll} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors underline">
                Clear all
              </button>
              <button onClick={() => { setShowModal(false); handleSearch(); }}
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
