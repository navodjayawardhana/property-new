"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { agentsApi, type Agent } from "@/lib/api";
import { Search, MapPin, Phone, Mail, X, MessageSquare, ChevronLeft, ChevronRight, User as UserIcon, Users } from "lucide-react";

const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function AgentAvatar({ agent, size = "lg" }: { agent: Agent; size?: "xs" | "sm" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20 text-2xl" : size === "sm" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-[#121e80] flex items-center justify-center shrink-0`}>
      {agent.avatar ? (
        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-black">{agent.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function ConnectModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [current, setCurrent] = useState<Agent>(agent);
  const [message, setMessage] = useState("");
  const [nearby, setNearby] = useState<Agent[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    if (!current.suburb && !current.state) return;
    setNearbyLoading(true);
    agentsApi.list({
      suburb: current.suburb ?? undefined,
      state: current.state ?? undefined,
    })
      .then((res) => {
        setNearby(res.data.filter((a) => a.id !== current.id).slice(0, 6));
      })
      .catch(() => setNearby([]))
      .finally(() => setNearbyLoading(false));
  }, [current.id]);

  function switchAgent(next: Agent) {
    setCurrent(next);
    setMessage("");
  }

  function handleSendEmail() {
    const subject = encodeURIComponent(`Enquiry from Greenbrick.net`);
    const body = encodeURIComponent(message || `Hi ${current.name},\n\nI found your profile on Greenbrick.net and would like to connect.\n\nRegards`);
    window.open(`mailto:${current.email}?subject=${subject}&body=${body}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <AgentAvatar agent={current} />
            <div>
              <h3 className="font-black text-gray-900 text-lg leading-tight">{current.name}</h3>
              <p className="text-sm text-[#121e80] font-semibold">Real Estate Agent</p>
              {(current.suburb || current.state) && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {[current.suburb, current.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Contact buttons */}
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <a href={`mailto:${current.email}`}
              className="flex-1 flex items-center justify-center gap-2 border border-[#121e80] text-[#121e80] font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
              <Mail size={15} /> Email
            </a>
            {current.phone ? (
              <a href={`tel:${current.phone}`}
                className="flex-1 flex items-center justify-center gap-2 border border-green-600 text-green-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                <Phone size={15} /> Call
              </a>
            ) : (
              <button disabled
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-400 font-semibold text-sm py-2.5 rounded-xl cursor-not-allowed">
                <Phone size={15} /> No phone
              </button>
            )}
          </div>

          {/* Message form */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5"><MessageSquare size={11} /> Send a message</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${current.name.split(" ")[0]}, I'd like to connect about...`}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#121e80] transition-colors resize-none"
            />
          </div>

          <button onClick={handleSendEmail}
            className="w-full bg-[#121e80] hover:bg-[#0d1660] text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            <Mail size={14} /> Send message via email
          </button>

          <p className="text-center text-xs text-gray-400">
            Your default email app will open with the message pre-filled.
          </p>
        </div>

        {/* Nearby agents in same suburb */}
        {(nearbyLoading || nearby.length > 0) && (
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Users size={12} />
              Other agents in {current.suburb || current.state}
            </p>
            {nearbyLoading ? (
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-16 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="h-2.5 bg-gray-200 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {nearby.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => switchAgent(a)}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-16 group"
                  >
                    <div className="relative">
                      <AgentAvatar agent={a} size="xs" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight w-full truncate group-hover:text-[#121e80] transition-colors">
                      {a.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async (page = 1, s = search, st = stateFilter) => {
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
  }, [search, stateFilter]);

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
      <div className="bg-[#121e80] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Connect</p>
          <h1 className="text-white font-black text-3xl md:text-4xl mb-3">Find a Real Estate Agent</h1>
          <p className="text-blue-200 text-sm mb-8">Connect with experienced agents across Australia to buy, sell, or rent your property.</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-xl max-w-xl mx-auto">
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
            <button type="submit"
              className="bg-[#121e80] hover:bg-[#0d1660] text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Filters & count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-600">
            {loading ? "Loading agents..." : <><span className="font-bold text-gray-900">{total}</span> agent{total !== 1 ? "s" : ""} available</>}
          </p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <select
              value={stateFilter}
              onChange={(e) => handleStateChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#121e80] bg-white"
            >
              <option value="">All states</option>
              {AU_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No agents found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
            <button onClick={() => { setSearch(""); setStateFilter(""); fetchAgents(1, "", ""); }}
              className="mt-4 text-sm text-[#121e80] font-semibold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div key={agent.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#121e80] hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative shrink-0">
                    <AgentAvatar agent={agent} size="sm" />
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{agent.name}</p>
                    <p className="text-xs text-[#121e80] font-semibold">Real Estate Agent</p>
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

                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="w-full bg-[#121e80] hover:bg-[#0d1660] text-white font-bold text-xs py-2 rounded-xl transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchAgents(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#121e80] hover:text-[#121e80] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <button key={p}
                    onClick={() => fetchAgents(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${currentPage === p ? "bg-[#121e80] text-white" : "border border-gray-200 text-gray-700 hover:border-[#121e80] hover:text-[#121e80]"}`}>
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => fetchAgents(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#121e80] hover:text-[#121e80] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <Footer />

      {selectedAgent && (
        <ConnectModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
