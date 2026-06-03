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

function shortPrice(p: string): string {
  if (p === "Any") return "Any";
  const digits = p.replace(/[^0-9]/g, "");
  if (!digits) return p;
  const n = parseInt(digits, 10);
  const plus = p.includes("+") ? "+" : "";
  const mo = p.includes("/mo") ? "/mo" : "";
  if (n >= 1_000_000) return `${n / 1_000_000}M${plus}`;
  if (n >= 1_000) return `${n / 1_000}K${mo}${plus}`;
  return p;
}

function PriceRangeSlider({ minValue, maxValue, onMinChange, onMaxChange, options }: {
  minValue: string; maxValue: string;
  onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
  options: string[];
}) {
  const last = options.length - 1;
  const minIdx = options.indexOf(minValue) < 0 ? 0 : options.indexOf(minValue);
  const maxIdx = (maxValue === "Any" || options.indexOf(maxValue) < 0) ? last : options.indexOf(maxValue);
  const minPct = (minIdx / last) * 100;
  const maxPct = (maxIdx / last) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  // stateRef lets event listeners always read fresh values without re-registering
  const s = useRef({ minIdx, maxIdx, onMinChange, onMaxChange, last, options, dragging: null as 'min' | 'max' | null });
  s.current = { ...s.current, minIdx, maxIdx, onMinChange, onMaxChange, last, options };

  function getIdx(clientX: number) {
    const el = trackRef.current;
    if (!el) return 0;
    const { left, width } = el.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (clientX - left) / width)) * s.current.last);
  }

  function move(clientX: number) {
    const { dragging, minIdx, maxIdx, last, options, onMinChange, onMaxChange } = s.current;
    if (!dragging) return;
    const idx = getIdx(clientX);
    if (dragging === 'min' && idx < maxIdx) onMinChange(options[idx]);
    if (dragging === 'max' && idx > minIdx) onMaxChange(idx === last ? 'Any' : options[idx]);
  }

  function start(clientX: number) {
    const idx = getIdx(clientX);
    const { minIdx, maxIdx } = s.current;
    s.current.dragging = Math.abs(idx - minIdx) <= Math.abs(idx - maxIdx) ? 'min' : 'max';
    move(clientX);
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => move(e.clientX);
    const onTouch = (e: TouchEvent) => move(e.touches[0].clientX);
    const onEnd = () => { s.current.dragging = null; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('touchend', onEnd);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouch);
      document.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <div>
      {/* Inline min / max values */}
      <div className="flex justify-between items-center mb-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[80px]">
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-0.5">Min</p>
          <p className="text-xs font-bold text-gray-800">{shortPrice(options[minIdx])}</p>
        </div>
        <div className="flex-1 mx-2 h-px bg-gray-200" />
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-center min-w-[80px]">
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-0.5">Max</p>
          <p className="text-xs font-bold text-gray-800">{maxIdx === last ? 'No limit' : shortPrice(options[maxIdx])}</p>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative py-2.5 cursor-pointer select-none"
        onMouseDown={(e) => { e.preventDefault(); start(e.clientX); }}
        onTouchStart={(e) => start(e.touches[0].clientX)}
      >
        <div className="h-1.5 bg-gray-200 rounded-full" />
        <div className="absolute h-1.5 bg-[#16a34a] rounded-full pointer-events-none"
          style={{ top: '50%', transform: 'translateY(-50%)', left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        <div className="absolute w-4 h-4 bg-white border-2 border-[#16a34a] rounded-full shadow-md pointer-events-none"
          style={{ top: '50%', left: `${minPct}%`, transform: 'translate(-50%,-50%)' }} />
        <div className="absolute w-4 h-4 bg-white border-2 border-[#16a34a] rounded-full shadow-md pointer-events-none"
          style={{ top: '50%', left: `${maxPct}%`, transform: 'translate(-50%,-50%)' }} />
      </div>

      {/* Bound labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{shortPrice(options[0])}</span>
        <span className="text-[10px] text-gray-400">{shortPrice(options[last])}</span>
      </div>
    </div>
  );
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
              <div className="flex border-b border-gray-100 px-2 pt-2 overflow-x-auto scrollbar-none">
                {(["Buy","Rent","Sold","Address","Agents"] as SearchTab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`pb-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                      tab === t
                        ? "border-[#16a34a] text-[#16a34a]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-4">
                <MapPin size={17} className="text-gray-400 shrink-0" />
                <div className="relative flex-1 min-w-0">
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
                  <button onClick={() => { setQuery(""); setShowSugs(false); }} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                    <X size={15} />
                  </button>
                )}
                {tab !== "Agents" && (
                  <>
                    <div className="w-px h-5 bg-gray-200 shrink-0" />
                    <button onClick={() => setShowModal(true)}
                      className={`flex items-center gap-1.5 text-sm font-medium px-2 sm:px-3 py-2 rounded-lg border transition-colors shrink-0 ${
                        activeFilterCount > 0
                          ? "bg-green-50 border-[#16a34a] text-[#16a34a]"
                          : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                      }`}>
                      <SlidersHorizontal size={14} />
                      <span className="hidden sm:inline">Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-[#16a34a] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <button onClick={handleSearch}
                  className="bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white text-sm font-bold px-3 sm:px-6 py-2.5 rounded-xl transition-all shrink-0 flex items-center gap-2">
                  <Search size={15} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 sm:px-4 py-3 text-center">
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

          <div className="relative bg-white w-full max-w-sm sm:max-w-lg rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Search filters</h2>
              <button onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pt-3 pb-2 space-y-3">

              {/* Price range */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Price range</h3>
                <PriceRangeSlider
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                  options={priceRanges}
                />
              </div>

              {/* Beds + Baths side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Bedrooms</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {bedroomOptions.map((b) => (
                      <button key={b} onClick={() => setMinBeds(b)}
                        className={`text-xs py-1.5 rounded-lg border font-semibold transition-colors ${minBeds === b ? "bg-[#16a34a] text-white border-[#16a34a]" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Bathrooms</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {bedroomOptions.map((b) => (
                      <button key={b} onClick={() => setMinBaths(b)}
                        className={`text-xs py-1.5 rounded-lg border font-semibold transition-colors ${minBaths === b ? "bg-[#16a34a] text-white border-[#16a34a]" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Property type */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Property type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {propertyTypes.map((type) => (
                    <button key={type} onClick={() => toggleType(type)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors text-left ${selectedTypes.includes(type) ? "bg-green-50 border-[#16a34a] text-[#16a34a]" : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"}`}>
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${selectedTypes.includes(type) ? "bg-[#16a34a] border-[#16a34a]" : "border-gray-300"}`}>
                        {selectedTypes.includes(type) && (
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 rounded-b-2xl">
              <button onClick={clearAll} className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2">
                Clear all
              </button>
              <button onClick={() => { setShowModal(false); handleSearch(); }}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold px-6 py-2 rounded-xl transition-colors">
                {activeFilterCount > 0 ? `Show results (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""})` : "Show results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
