"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { slidesApi, type Slide } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin,
  ChevronLeft, ChevronRight,
} from "lucide-react";

type SearchTab = "Buy" | "Rent" | "Sold" | "Address" | "Agents";

const tabRoutes: Record<string, string> = {
  Buy: "/buy", Rent: "/rent", Sold: "/sold", Address: "/buy", Agents: "/agents",
};

const AU_STATES = ["Western", "Central", "Southern", "Northern", "Eastern", "Sabaragamuwa", "North Western", "North Central", "Uva"];
const priceRangesBuy  = ["Any","Rs 2,000,000","Rs 5,000,000","Rs 10,000,000","Rs 15,000,000","Rs 20,000,000","Rs 30,000,000","Rs 50,000,000","Rs 75,000,000","Rs 100,000,000","Rs 150,000,000","Rs 200,000,000+"];
const priceRangesRent = ["Any","Rs 15,000/mo","Rs 25,000/mo","Rs 40,000/mo","Rs 60,000/mo","Rs 80,000/mo","Rs 100,000/mo","Rs 150,000/mo","Rs 200,000/mo+"];
const bedroomOptions  = ["Any","1+","2+","3+","4+","5+"];
const propertyTypes   = ["House","Apartment / Unit","Townhouse","Villa","Land","Rural","Block of Units","Retirement Living"];
const suggestions     = [
  "Colombo","Kandy","Galle","Negombo","Jaffna",
  "Matara","Kurunegala","Anuradhapura","Trincomalee","Batticaloa",
  "Ratnapura","Badulla","Hambantota","Polonnaruwa","Nuwara Eliya",
];

const STATS = [
  { value: "120,000+", label: "Properties for sale" },
  { value: "55,000+",  label: "Rentals" },
  { value: "2,400+",   label: "Verified agents" },
  { value: "25 days",  label: "Avg. days on market" },
];

type SlideItem =
  | { type: "image"; src: string; label: string; sub: string }
  | { type: "video"; src: string; label: string; sub: string };

const SLIDES: SlideItem[] = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    label: "Find Your Dream Home",
    sub: "Search thousands of properties for sale across Sri Lanka",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1761679296778-7f245d39148d?w=1920&q=80",
    label: "Modern Living",
    sub: "Luxury smart homes with cutting-edge design and technology",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1606333832385-2c97b1dd2f5d?w=1920&q=80",
    label: "Premium Estates",
    sub: "Grand estates nestled in jungle, mountain and ocean landscapes",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=80",
    label: "Resort-Style Living",
    sub: "Overwater villas and tropical retreats — live like a Maldives getaway",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80",
    label: "City Apartments",
    sub: "Urban living at its finest — right where you want to be",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1920&q=80",
    label: "Coastal Properties",
    sub: "Beachfront homes where the ocean meets your doorstep",
  },
];

const INTERVAL_MS = 5500;

function parsePrice(p: string): number | null {
  if (!p || p === "Any" || p.endsWith("+")) return null;
  const n = parseInt(p.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? null : n;
}

type Props = { defaultTab?: SearchTab; title?: string };

export default function SearchHero({ defaultTab = "Buy", title }: Props) {
  const router = useRouter();

  const [slides, setSlides] = useState<SlideItem[]>(SLIDES);

  useEffect(() => {
    slidesApi.list().then((data: Slide[]) => {
      if (data.length > 0) {
        setSlides(data.map((s) => ({
          type: s.media_type,
          src: s.media_url,
          label: s.title ?? "",
          sub: s.subtitle ?? "",
        })));
      }
    }).catch(() => {});
  }, []);

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, INTERVAL_MS);
  }, [slides.length]);

  useEffect(() => {
    setCurrent(0);
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  function goTo(idx: number) { setCurrent(idx); startTimer(); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }
  function next() { goTo((current + 1) % slides.length); }

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
    tab === "Agents"  ? "Search by agent name or suburb" :
    tab === "Address" ? "Enter a street address" :
    "Search suburb, postcode or city";

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full h-screen min-h-[600px] overflow-hidden">

        {/* Slides */}
        {slides.map((slide, i) => (
          <div key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}>
            {slide.type === "video" ? (
              <video autoPlay muted loop playsInline className="w-full h-full object-cover" src={slide.src} />
            ) : (
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${slide.src})` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          </div>
        ))}

        {/* Center content — headline + search together */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">

          {/* Headline */}
          <div className="text-center mb-8 pointer-events-none">
            {slides.map((slide, i) => (
              <div key={i}
                className={`absolute inset-x-0 text-center transition-all duration-700 px-4 ${i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                  Sri Lanka&apos;s No.1 Property Site
                </p>
                <h1 className="text-white font-black text-4xl sm:text-5xl md:text-6xl drop-shadow-2xl leading-tight">
                  {slide.label}
                </h1>
                <p className="text-white/75 text-base sm:text-lg mt-3 font-medium max-w-xl mx-auto">
                  {slide.sub}
                </p>
              </div>
            ))}
            {/* Spacer matching headline height */}
            <div className="opacity-0 pointer-events-none">
              <p className="text-sm mb-3">placeholder</p>
              <h1 className="text-5xl leading-tight">placeholder</h1>
              <p className="text-lg mt-3">placeholder</p>
            </div>
          </div>

          {/* Search card */}
          <div className="w-full max-w-3xl mt-32 sm:mt-28">
            <div className="bg-white rounded-2xl shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-2 pt-2">
                {(["Buy","Rent","Sold","Address","Agents"] as SearchTab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                      tab === t
                        ? "border-[#16a34a] text-[#16a34a]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <MapPin size={17} className="text-gray-400 shrink-0" />
                <div className="relative flex-1">
                  <input
                    type="text" value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSugs(e.target.value.length > 0); }}
                    onFocus={() => setShowSugs(query.length > 0)}
                    onBlur={() => setTimeout(() => setShowSugs(false), 150)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={placeholder}
                    className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {filteredSuggestions.slice(0, 6).map((s) => (
                        <button key={s} onMouseDown={() => { setQuery(s); setShowSugs(false); }}
                          className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left">
                          <MapPin size={13} className="text-gray-400 shrink-0" /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {query && (
                  <button onClick={() => { setQuery(""); setShowSugs(false); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                    <X size={15} />
                  </button>
                )}
                {tab !== "Agents" && (
                  <>
                    <div className="w-px h-5 bg-gray-200 shrink-0" />
                    <button onClick={() => setShowModal(true)}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors shrink-0 ${
                        activeFilterCount > 0
                          ? "bg-green-50 border-[#16a34a] text-[#16a34a]"
                          : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                      }`}>
                      <SlidersHorizontal size={14} />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="bg-[#16a34a] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <button onClick={handleSearch}
                  className="bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2">
                  <Search size={15} />
                  Search
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-4 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-white font-black text-lg leading-none">{s.value}</p>
                  <p className="text-white/65 text-xs mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
          ))}
        </div>

        {/* Arrows */}
        <button onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-105">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-105">
          <ChevronRight size={20} />
        </button>
      </section>

      {/* ── Filter modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-bold text-gray-900">Search filters</h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Price range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price range</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["Minimum", minPrice, setMinPrice], ["Maximum", maxPrice, setMaxPrice]].map(([label, val, setter]) => (
                    <div key={label as string}>
                      <label className="text-xs text-gray-500 mb-1.5 block font-medium">{label as string}</label>
                      <div className="relative">
                        <select value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                          className="w-full appearance-none text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#16a34a] bg-white text-gray-700 cursor-pointer">
                          {priceRanges.map((p) => <option key={p}>{p}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beds */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Bedrooms (min)</h3>
                <div className="flex gap-2">
                  {bedroomOptions.map((b) => (
                    <button key={b} onClick={() => setMinBeds(b)}
                      className={`flex-1 text-sm py-2.5 rounded-xl border font-semibold transition-colors ${minBeds === b ? "bg-[#16a34a] text-white border-[#16a34a]" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baths */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Bathrooms (min)</h3>
                <div className="flex gap-2">
                  {bedroomOptions.map((b) => (
                    <button key={b} onClick={() => setMinBaths(b)}
                      className={`flex-1 text-sm py-2.5 rounded-xl border font-semibold transition-colors ${minBaths === b ? "bg-[#16a34a] text-white border-[#16a34a]" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"}`}>
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
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${selectedTypes.includes(type) ? "bg-green-50 border-[#16a34a] text-[#16a34a]" : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"}`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selectedTypes.includes(type) ? "bg-[#16a34a] border-[#16a34a]" : "border-gray-300"}`}>
                        {selectedTypes.includes(type) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={clearAll} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2">
                Clear all
              </button>
              <button onClick={() => { setShowModal(false); handleSearch(); }}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold px-8 py-2.5 rounded-xl transition-colors">
                {activeFilterCount > 0 ? `Show results (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""})` : "Show results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
