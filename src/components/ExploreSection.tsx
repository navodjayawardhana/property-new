"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const pills = ["Buying", "Renting", "Selling", "Researching"];

const allCards = [
  {
    for: ["Buying", "Renting", "Selling", "Researching"],
    title: "Get estimated property prices with a realEstimate™",
    desc: "See how much your property's worth in real-time and get alerts as it changes.",
    cta: "Check property values",
    gradient: "from-blue-50 to-blue-100",
    accent: "#16a34a",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <circle cx="40" cy="40" r="36" fill="#fee2e2" />
        <path d="M22 44 L40 26 L58 44" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="28" y="44" width="24" height="20" rx="2" fill="#16a34a" />
        <rect x="35" y="52" width="10" height="12" rx="1" fill="white" />
        <circle cx="58" cy="28" r="10" fill="white" stroke="#16a34a" strokeWidth="2" />
        <path d="M54 28 L57 31 L63 25" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    for: ["Buying", "Renting"],
    title: "Need help with a mortgage?",
    desc: "Compare your finance options and get connected with a broker in minutes.",
    cta: "Explore home loans",
    gradient: "from-orange-50 to-amber-100",
    accent: "#d97706",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <circle cx="40" cy="40" r="36" fill="#fef3c7" />
        <rect x="20" y="30" width="40" height="28" rx="4" fill="#f59e0b" />
        <rect x="20" y="36" width="40" height="6" fill="#d97706" />
        <circle cx="40" cy="52" r="5" fill="white" />
        <path d="M37 52 L39 54 L44 49" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="28" y="22" width="8" height="10" rx="2" fill="#d97706" />
        <rect x="44" y="22" width="8" height="10" rx="2" fill="#d97706" />
      </svg>
    ),
  },
  {
    for: ["Buying", "Renting", "Selling", "Researching"],
    title: "Explore suburb profiles",
    desc: "Discover median prices, recent sales, and lifestyle insights for any suburb.",
    cta: "Research suburbs",
    gradient: "from-blue-50 to-sky-100",
    accent: "#2563eb",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <circle cx="40" cy="40" r="36" fill="#dbeafe" />
        <circle cx="36" cy="36" r="16" fill="white" stroke="#2563eb" strokeWidth="2.5" />
        <circle cx="36" cy="36" r="7" fill="#2563eb" />
        <line x1="47" y1="47" x2="58" y2="58" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
        <circle cx="36" cy="36" r="11" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    for: ["Selling"],
    title: "Ready to sell your property?",
    desc: "Get a free appraisal and connect with top-rated local agents in your area.",
    cta: "Find an agent",
    gradient: "from-blue-50 to-emerald-100",
    accent: "#059669",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <circle cx="40" cy="40" r="36" fill="#d1fae5" />
        <path d="M24 56 L24 36 L40 22 L56 36 L56 56 Z" fill="#10b981" />
        <rect x="32" y="42" width="16" height="14" rx="2" fill="white" />
        <path d="M18 38 L40 18 L62 38" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="55" cy="26" r="9" fill="white" stroke="#059669" strokeWidth="2" />
        <path d="M52 26 L54 28 L59 23" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    for: ["Researching"],
    title: "Track market trends",
    desc: "Stay ahead with real-time data on property prices, auction results and more.",
    cta: "View market insights",
    gradient: "from-purple-50 to-violet-100",
    accent: "#7c3aed",
    icon: (
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <circle cx="40" cy="40" r="36" fill="#ede9fe" />
        <polyline points="18,56 30,38 42,46 56,24" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="18" cy="56" r="3" fill="#7c3aed" />
        <circle cx="30" cy="38" r="3" fill="#7c3aed" />
        <circle cx="42" cy="46" r="3" fill="#7c3aed" />
        <circle cx="56" cy="24" r="3" fill="#7c3aed" />
        <path d="M50 22 L58 22 L58 30" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function ExploreSection() {
  const [active, setActive] = useState("Buying");

  const visibleCards = allCards.filter((c) => c.for.includes(active));

  return (
    <section className="bg-white py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title + pills row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <h2 className="text-xl font-bold text-gray-900">Explore all things property</h2>
          <div className="flex gap-2 flex-wrap">
            {pills.map((p) => (
              <button
                key={p}
                onClick={() => setActive(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active === p
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "text-gray-600 border-gray-300 hover:border-gray-600 hover:text-gray-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((card) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 flex flex-col justify-between min-h-[190px] group hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
                <div className="shrink-0 -mt-1">{card.icon}</div>
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all"
                style={{ color: card.accent }}>
                {card.cta}
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
