"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, LogOut, Menu, X, FilePlus2, List, ChevronLeft, ChevronRight, ExternalLink, Search, RefreshCw } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/lib/auth-context";
import { advertisementManagerApi, type PaginatedProperties } from "@/lib/api";
import { CreateListingWizard } from "@/components/CreateListingWizard";

type Tab = "create-listing" | "my-listings";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "create-listing", label: "Create Listing", icon: <FilePlus2 size={16} /> },
  { id: "my-listings",    label: "My Listings",    icon: <List size={16} /> },
];

const TAB_TITLES: Record<Tab, string> = {
  "create-listing": "Create Listing",
  "my-listings": "My Listings",
};

function fmtPrice(n: number) { return `LKR ${n.toLocaleString()}`; }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }); }

function MyListingsTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState<"" | "buy" | "rent" | "sold">("");
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = page, s = search, lt = listingType) => {
    setLoading(true);
    try {
      const res = await advertisementManagerApi.myListings({ search: s || undefined, listing_type: lt || undefined, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, listingType, token]);

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, listingType))}
            placeholder="Search by seller, email, phone or listing title…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", listingType); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={listingType} onChange={(e) => { const v = e.target.value as typeof listingType; setListingType(v); setPage(1); load(1, search, v); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700 min-w-[130px]">
          <option value="">All types</option>
          <option value="buy">For Sale</option>
          <option value="rent">For Rent</option>
          <option value="sold">Sold</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">
          {loading ? (
            <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (`${data?.total ?? 0} listing${data?.total === 1 ? "" : "s"} found`)}
        </p>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-50 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-28" />
              </div>
              <div className="h-6 bg-gray-100 rounded-lg w-16" />
            </div>
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="p-10 text-center">
          <List size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {search || listingType ? "No listings match your search." : "You haven't created any listings yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Seller</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Listing</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900 text-sm">{p.user?.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{p.user?.email} {p.user?.phone ? `· ${p.user.phone}` : ""}</p>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{p.title}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-gray-600">
                    {p.listing_type === "rent" && p.price_per_week ? `${fmtPrice(p.price_per_week)}/week` : fmtPrice(p.price)}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-gray-400">{fmtDate(p.created_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/property/${p.id}`} target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:underline">
                      View <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-1.5 px-5 py-4">
          <button onClick={() => { setPage(page - 1); load(page - 1); }} disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-500 px-2">Page {data.current_page} of {data.last_page}</span>
          <button onClick={() => { setPage(page + 1); load(page + 1); }} disabled={page === data.last_page}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default function AdvertisementManagerDashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("create-listing");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "advertisement_manager" && user.role !== "admin"))) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== "advertisement_manager" && user.role !== "admin") || !token) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <div className="flex flex-1">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#1e293b] flex flex-col shrink-0 min-h-full transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
            <X size={18} />
          </button>
          {/* User card */}
          <div className="px-5 py-6 border-b border-white/10 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#16a34a] flex items-center justify-center mx-auto mb-3">
              <UserAvatar src={(user as any).avatar ?? null} name={user.name} avatarBg="bg-[#16a34a]" textSize="text-xl" />
            </div>
            <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
            <span className="text-xs text-[#4ade80] font-semibold mt-0.5 block">Advertisement Manager</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === n.id ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}>
                <span className="shrink-0">{n.icon}</span>
                <span className="flex-1 text-left">{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Status + logout */}
          <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-0.5">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse" />
              All systems operational
            </div>
            <button onClick={() => { logout(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
              <LogOut size={16} className="shrink-0" /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
                <Menu size={20} />
              </button>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium flex items-center gap-1.5">
                  <Megaphone size={11} /> Advertisement Manager Portal
                </p>
                <h1 className="text-xl font-black text-gray-900 mt-0.5">{TAB_TITLES[tab]}</h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 lg:p-6 flex-1">
            {tab === "create-listing" && (
              <div className="space-y-5">
                <p className="text-sm text-gray-500 max-w-2xl">
                  Register a seller and their property listing — they&apos;ll get an SMS with the listing link and login details.
                </p>
                <CreateListingWizard token={token} submitSellerListing={advertisementManagerApi.createListing} searchUsers={advertisementManagerApi.searchUsers} />
              </div>
            )}
            {tab === "my-listings" && <MyListingsTab token={token} />}
          </div>
        </main>

      </div>
    </div>
  );
}
