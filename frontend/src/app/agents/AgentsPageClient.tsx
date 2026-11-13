"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { UserAvatar } from "@/components/UserAvatar";
import { agentsApi, type Agent } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

const PROVINCES = [
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

function AgentsContent() {
  const params = useSearchParams();
  const urlSearch = params.get("search") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [province, setProvince] = useState("");
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const query = useDebouncedValue(search, 250).trim();

  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    agentsApi
      .list({ search: query, state: province, page, per_page: 24 })
      .then((result) => {
        if (!active) return;
        setAgents(result.data);
        setTotal(result.total);
        setLastPage(result.last_page);
      })
      .catch(() => {
        if (active) setError("Unable to load agents. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, province, page, retry]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <div className="flex-1">
          <label
            htmlFor="agent-search"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Find an agent or company
          </label>
          <input
            id="agent-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Name, suburb, district or postcode"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-green-600"
          />
        </div>
        <div>
          <label
            htmlFor="agent-province"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Province
          </label>
          <select
            id="agent-province"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
          >
            <option value="">All provinces</option>
            {PROVINCES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <div aria-live="polite" className="text-sm text-gray-500 mb-5">
        {loading
          ? "Loading agents..."
          : error
            ? ""
            : `${total} ${total === 1 ? "profile" : "profiles"} found`}
      </div>
      {error ? (
        <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
          {error}{" "}
          <button
            onClick={() => setRetry((value) => value + 1)}
            className="underline font-semibold"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No agents found. Try another name or location.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => {
            const locations = Array.from(
              new Set(
                (agent.locations ?? [agent])
                  .map(
                    (location) =>
                      location.district || location.suburb || location.state,
                  )
                  .filter(Boolean),
              ),
            );
            return (
              <article
                key={agent.id}
                className="flex flex-col bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-600 hover:shadow-md transition-all min-w-0"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                    <UserAvatar
                      src={agent.avatar}
                      name={agent.name}
                      avatarBg="bg-green-600"
                      textSize="text-2xl"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg text-gray-900 break-words">
                      <Link href={"/agents/" + (agent.slug || agent.id)}>
                        {agent.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-green-700">
                      Real estate agent / company
                    </p>
                  </div>
                </div>
                {locations.length > 0 && (
                  <p className="flex gap-2 text-sm text-gray-600 mb-3">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <span>{locations.join(", ")}</span>
                  </p>
                )}
                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  {agent.email && (
                    <a
                      href={"mailto:" + agent.email}
                      className="flex gap-2 items-center break-all"
                    >
                      <Mail size={15} className="shrink-0" />
                      {agent.email}
                    </a>
                  )}
                  {agent.phone && (
                    <a
                      href={"tel:" + agent.phone}
                      className="flex gap-2 items-center"
                    >
                      <Phone size={15} className="shrink-0" />
                      {agent.phone}
                    </a>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {agent.properties_count ?? 0} listings
                  </span>
                  <Link
                    href={"/agents/" + (agent.slug || agent.id)}
                    className="font-semibold text-green-700 inline-flex items-center gap-2"
                  >
                    View profile <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!loading && !error && lastPage > 1 && (
        <nav
          aria-label="Agent pagination"
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="border rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((value) => value + 1)}
            className="border rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}

export default function AgentsPageClient() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <SearchHero defaultTab="Agents" title="Real Estate Agents in Sri Lanka" />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Agents" }]} />
      <Suspense fallback={<p className="p-8">Loading agents...</p>}>
        <AgentsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
