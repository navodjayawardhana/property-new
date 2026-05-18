"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { agentsApi, type Agent } from "@/lib/api";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const fetchAgents = useCallback(
    async (page = 1, s = search, st = stateFilter) => {
      setLoading(true);
      try {
        const res = await agentsApi.list({ search: s, state: st, page });
        setAgents(res.data);
        setTotal(res.total);
        setLastPage(res.last_page);
        setCurrentPage(res.current_page);
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [search, stateFilter],
  );

  useEffect(() => {
    fetchAgents(1, search, stateFilter);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    fetchAgents(1, search, stateFilter);
  }

  function handleStateChange(val: string) {
    setStateFilter(val);
    setCurrentPage(1);
    fetchAgents(1, search, val);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#16a34a] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <UserIcon size={18} className="text-white" />
            </div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest">
              Connect
            </p>
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl mb-2">
            Find a Real Estate Agent
          </h1>
          <p className="text-green-200 text-sm mb-8">
            Connect with experienced agents across Sri Lanka to buy, sell, or
            rent your property.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-xl max-w-xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by agent name..."
                className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Filters & count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-600">
            {loading ? (
              <svg
                className="w-4 h-4 animate-spin text-gray-400 inline-block"
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
              <>
                <span className="font-bold text-gray-900">{total}</span> agent
                {total !== 1 ? "s" : ""} available
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
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agents grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
              >
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
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No agents found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStateFilter("");
                fetchAgents(1, "", "");
              }}
              className="mt-4 text-sm text-[#16a34a] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
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
                    {(agent.suburb || agent.state) && (
                      <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 truncate">
                        <MapPin size={9} className="shrink-0" />
                        {[agent.suburb, agent.state].filter(Boolean).join(", ")}
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
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchAgents(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] hover:text-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
                  acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-gray-400 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => fetchAgents(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${currentPage === p ? "bg-[#16a34a] text-white" : "border border-gray-200 text-gray-700 hover:border-[#16a34a] hover:text-[#16a34a]"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => fetchAgents(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] hover:text-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
