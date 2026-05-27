"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import ExploreSection from "@/components/ExploreSection";
import Footer from "@/components/Footer";
import { agentsApi, type Agent } from "@/lib/api";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  ArrowRight,
} from "lucide-react";

const AU_STATES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "Sabaragamuwa",
  "North Western",
  "North Central",
  "Uva",
];

function AgentAvatar({
  agent,
  size = "lg",
}: {
  agent: Agent;
  size?: "xs" | "sm" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-20 h-20 text-2xl"
      : size === "sm"
        ? "w-14 h-14 text-lg"
        : "w-10 h-10 text-sm";
  return (
    <div
      className={`${dim} rounded-full overflow-hidden bg-[#16a34a] flex items-center justify-center shrink-0`}
    >
      {agent.avatar ? (
        <img
          src={agent.avatar}
          alt={agent.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-black">
          {agent.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

const INITIAL_LIMIT = 12;

function AgentsContent() {
  const searchParams = useSearchParams();

  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [stateFilter, setStateFilter] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchAgents = useCallback(async (st = stateFilter) => {
    setLoading(true);
    setShowAll(false);
    try {
      const res = await agentsApi.list({ state: st, per_page: 100 } as any);
      setAllAgents(res.data);
    } catch {
      setAllAgents([]);
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);

  useEffect(() => { fetchAgents(stateFilter); }, []);

  // Sync search input when URL ?search= param changes (from hero search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setSearch(urlSearch);
    setShowAll(false);
  }, [searchParams.get("search")]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setShowAll(false);
  }

  function handleStateChange(val: string) {
    setStateFilter(val);
    fetchAgents(val);
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? allAgents.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        (a.suburb ?? "").toLowerCase().includes(q) ||
        (a.postcode ?? "").toLowerCase().includes(q)
      )
    : allAgents;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px] max-w-sm">
            <div className="flex flex-1 items-center gap-2 border border-gray-300 rounded px-3 py-1.5 bg-white">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                placeholder="Search by name, suburb or postcode..."
                className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-4 py-1.5 rounded transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 ml-auto">
            <p className="text-sm text-gray-600">
              {loading ? (
                <svg
                  className="w-4 h-4 animate-spin text-gray-400 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span className="font-bold text-gray-900">{filtered.length}</span> agent
                  {filtered.length !== 1 ? "s" : ""} available
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              <select
                value={stateFilter}
                onChange={(e) => handleStateChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#16a34a] bg-white"
              >
                <option value="">All states</option>
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agents grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No agents found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => { setSearch(""); setStateFilter(""); fetchAgents(""); }}
              className="mt-4 text-sm text-[#16a34a] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(showAll ? filtered : filtered.slice(0, INITIAL_LIMIT)).map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.slug ?? agent.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#16a34a] hover:shadow-md transition-all group flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative shrink-0">
                    <AgentAvatar agent={agent} size="sm" />
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate group-hover:text-[#16a34a] transition-colors">
                      {agent.name}
                    </p>
                    <p className="text-xs text-[#16a34a] font-semibold">
                      Real Estate Agent
                    </p>
                    {(agent.district || agent.state) && (
                      <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 truncate">
                        <MapPin size={9} className="shrink-0" />
                        {[agent.district || agent.suburb, agent.state].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail size={11} className="shrink-0 text-gray-400" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} className="shrink-0 text-gray-400" />
                      <span>{agent.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between text-xs font-bold text-[#16a34a] group-hover:text-[#15803d]">
                  <span>View profile</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          {filtered.length > INITIAL_LIMIT && (
            <div className="mt-10 mb-4 text-center">
              {!showAll ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 max-w-xs mx-auto">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${(INITIAL_LIMIT / filtered.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{INITIAL_LIMIT} of {filtered.length}</span>
                  </div>
                  <button onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors shadow-md">
                    View {filtered.length - INITIAL_LIMIT} more
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
  );
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Agents" title="Find a real estate agent" />
      <ExploreSection />
      <Suspense fallback={null}>
        <AgentsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
