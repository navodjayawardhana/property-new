"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import {
  admin as adminApi,
  newsApi,
  type AdminStats,
  type PaginatedUsers,
  type PaginatedInquiries,
  type PaginatedProperties,
  type PaginatedNews,
  type NewsArticleApi,
  type Property,
  type Inquiry,
  type User,
} from "@/lib/api";
import {
  Users, Home, MessageSquare, Star, TrendingUp, Search, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, Shield, Eye, Check,
  LayoutDashboard, ToggleLeft, ToggleRight, X, AlertTriangle,
  Newspaper, Plus, Edit2,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }
function fmtPrice(n: number) { return `$${n.toLocaleString()}`; }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); }

const ROLE_COLORS: Record<string, string> = {
  buyer: "bg-blue-100 text-blue-700",
  seller: "bg-green-100 text-green-700",
  agent: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  sold: "bg-orange-100 text-orange-700",
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const LISTING_COLORS: Record<string, string> = {
  buy: "bg-indigo-100 text-indigo-700",
  rent: "bg-teal-100 text-teal-700",
  sold: "bg-orange-100 text-orange-700",
};

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${color}`}>{label}</span>;
}

function Avatar({ name, avatar, size = "sm" }: { name: string; avatar?: string | null; size?: "sm" | "xs" }) {
  const dim = size === "sm" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-[#121e80] flex items-center justify-center shrink-0`}>
      {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> :
        <span className="text-white font-bold">{name.charAt(0).toUpperCase()}</span>}
    </div>
  );
}

function Pagination({ current, last, onChange }: { current: number; last: number; onChange: (p: number) => void }) {
  if (last <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#121e80] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: last }, (_, i) => i + 1)
        .filter(p => p === 1 || p === last || Math.abs(p - current) <= 1)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
          acc.push(p); return acc;
        }, [])
        .map((p, i) => p === "…"
          ? <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
          : <button key={p} onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${current === p ? "bg-[#121e80] text-white" : "border border-gray-200 text-gray-700 hover:border-[#121e80]"}`}>{p}</button>
        )}
      <button onClick={() => onChange(current + 1)} disabled={current === last}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#121e80] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function ConfirmDialog({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{msg}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-xl transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: "Total Users", value: fmt(stats.users.total), sub: `+${stats.users.new_this_week} this week`, icon: <Users size={20} />, color: "bg-blue-50 text-blue-600" },
    { label: "Total Properties", value: fmt(stats.properties.total), sub: `+${stats.properties.new_this_week} this week`, icon: <Home size={20} />, color: "bg-green-50 text-green-600" },
    { label: "Total Inquiries", value: fmt(stats.inquiries.total), sub: `+${stats.inquiries.new_this_week} this week`, icon: <MessageSquare size={20} />, color: "bg-purple-50 text-purple-600" },
    { label: "Featured Listings", value: fmt(stats.properties.featured), sub: "Currently featured", icon: <Star size={20} />, color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
            <p className="text-2xl font-black text-gray-900">{c.value}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{c.label}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Users by role */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Users size={14} /> Users by Role</h3>
          <div className="space-y-3">
            {[
              { label: "Buyers", count: stats.users.buyers, color: "bg-blue-500" },
              { label: "Sellers", count: stats.users.sellers, color: "bg-green-500" },
              { label: "Agents", count: stats.users.agents, color: "bg-purple-500" },
              { label: "Admins", count: stats.users.admins, color: "bg-red-500" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`}
                    style={{ width: stats.users.total ? `${(r.count / stats.users.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Home size={14} /> Properties by Status</h3>
          <div className="space-y-3">
            {[
              { label: "Active", count: stats.properties.active, color: "bg-green-500" },
              { label: "Inactive", count: stats.properties.inactive, color: "bg-gray-400" },
              { label: "Sold", count: stats.properties.sold, color: "bg-orange-500" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`}
                    style={{ width: stats.properties.total ? `${(r.count / stats.properties.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiries by status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={14} /> Inquiries by Status</h3>
          <div className="space-y-3">
            {[
              { label: "Pending", count: stats.inquiries.pending, color: "bg-yellow-500" },
              { label: "Contacted", count: stats.inquiries.contacted, color: "bg-blue-500" },
              { label: "Resolved", count: stats.inquiries.resolved, color: "bg-green-500" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`}
                    style={{ width: stats.inquiries.total ? `${(r.count / stats.inquiries.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/buy" target="_blank" className="flex items-center gap-2 text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-[#121e80] hover:text-[#121e80] transition-colors font-medium">
            <Eye size={14} /> View site
          </Link>
          <Link href="/agents" target="_blank" className="flex items-center gap-2 text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-[#121e80] hover:text-[#121e80] transition-colors font-medium">
            <Users size={14} /> View agents
          </Link>
          <Link href="/dashboard/properties/new" className="flex items-center gap-2 text-sm bg-[#121e80] text-white px-4 py-2 rounded-xl hover:bg-[#0d1660] transition-colors font-medium">
            <Home size={14} /> Add property
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; name: string } | null>(null);
  const [editRole, setEditRole] = useState<{ id: number; role: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = page, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.users({ search: s, role: r, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, roleFilter, token]);

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteUser(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    setSaving(true);
    try {
      await adminApi.updateUser(userId, { role: newRole }, token);
      setEditRole(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, roleFilter))}
            placeholder="Search by name or email…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", roleFilter); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700 min-w-[130px]">
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="agent">Agents</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">
            {loading ? "Loading…" : `${data?.total ?? 0} users`}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading users…</div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} avatar={u.avatar} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {editRole?.id === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <select value={editRole.role} onChange={(e) => setEditRole({ id: u.id, role: e.target.value })}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white">
                            {["buyer", "seller", "agent", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button onClick={() => handleRoleChange(u.id, editRole.role)} disabled={saving}
                            className="w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-colors">
                            <Check size={11} />
                          </button>
                          <button onClick={() => setEditRole(null)}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors">
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setEditRole({ id: u.id, role: u.role })}
                          className="hover:opacity-80 transition-opacity">
                          <Badge label={u.role} color={ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-500">
                      {[u.suburb, u.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-gray-400">
                      {fmtDate((u as User & { created_at: string }).created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setConfirm({ id: u.id, name: u.name })}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <div className="px-5 pb-5"><Pagination current={data.current_page} last={data.last_page} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      {confirm && (
        <ConfirmDialog
          msg={`Delete user "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Properties tab ───────────────────────────────────────────────────────────

function PropertiesTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; title: string } | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async (p = page, s = search, st = statusFilter, lt = typeFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.properties({ search: s, status: st, listing_type: lt, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter, token]);

  useEffect(() => { load(); }, []);

  async function handleToggleFeatured(p: Property) {
    setToggling(p.id);
    try {
      await adminApi.updateProperty(p.id, { is_featured: !p.is_featured }, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setToggling(null); }
  }

  async function handleStatusChange(p: Property, status: string) {
    try {
      await adminApi.updateProperty(p.id, { status }, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteProperty(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, statusFilter, typeFilter))}
            placeholder="Search by title, suburb, address…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", statusFilter, typeFilter); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value, typeFilter); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="sold">Sold</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); load(1, search, statusFilter, e.target.value); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All types</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
          <option value="sold">Sold</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{loading ? "Loading…" : `${data?.total ?? 0} properties`}</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading properties…</div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No properties found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Featured</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Price</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((p) => {
                  const thumb = p.images?.[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {thumb ? <img src={thumb} alt={p.title} className="w-full h-full object-cover" /> :
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={16} /></div>}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/property/${p.id}`} target="_blank"
                              className="font-semibold text-gray-900 text-sm hover:text-[#121e80] transition-colors line-clamp-1">{p.title}</Link>
                            <p className="text-xs text-gray-400">{p.suburb}, {p.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {p.user && (
                          <div className="flex items-center gap-2">
                            <Avatar name={p.user.name} avatar={p.user.avatar} size="xs" />
                            <span className="text-xs text-gray-600">{p.user.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge label={p.listing_type} color={LISTING_COLORS[p.listing_type] ?? "bg-gray-100 text-gray-600"} />
                      </td>
                      <td className="px-4 py-3.5">
                        <select value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white text-gray-700">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <button onClick={() => handleToggleFeatured(p)} disabled={toggling === p.id}
                          className={`transition-colors ${p.is_featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-400"} disabled:opacity-50`}>
                          {p.is_featured ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-sm font-semibold text-gray-700">
                        {fmtPrice(p.price)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/property/${p.id}`} target="_blank"
                            className="text-gray-400 hover:text-[#121e80] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => setConfirm({ id: p.id, title: p.title })}
                            className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && <div className="px-5 pb-5"><Pagination current={data.current_page} last={data.last_page} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      {confirm && (
        <ConfirmDialog
          msg={`Delete "${confirm.title}"? All images will be removed.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Inquiries tab ────────────────────────────────────────────────────────────

function InquiriesTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedInquiries | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; name: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async (p = page, s = search, st = statusFilter, it = typeFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.inquiries({ search: s, status: st, inquiry_type: it, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter, token]);

  useEffect(() => { load(); }, []);

  async function handleStatusChange(inq: Inquiry, status: string) {
    try {
      await adminApi.updateInquiry(inq.id, status, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteInquiry(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, statusFilter, typeFilter))}
            placeholder="Search by name, email or message…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", statusFilter, typeFilter); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value, typeFilter); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); load(1, search, statusFilter, e.target.value); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All types</option>
          <option value="buying">Buying</option>
          <option value="renting">Renting</option>
          <option value="general">General</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{loading ? "Loading…" : `${data?.total ?? 0} inquiries`}</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading inquiries…</div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No inquiries found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.data.map((inq) => (
              <div key={inq.id} className="hover:bg-gray-50/30 transition-colors">
                <div className="flex items-start gap-3 px-5 py-4">
                  <Avatar name={inq.name} avatar={inq.user?.avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{inq.name}</span>
                      <Badge label={inq.inquiry_type} color="bg-gray-100 text-gray-600" />
                      <Badge label={inq.status} color={STATUS_COLORS[inq.status] ?? "bg-gray-100 text-gray-600"} />
                    </div>
                    <p className="text-xs text-gray-400">{inq.email}{inq.phone ? ` · ${inq.phone}` : ""}</p>
                    {inq.property && (
                      <p className="text-xs text-[#121e80] font-medium mt-0.5 truncate">
                        Re: {inq.property.title}
                      </p>
                    )}
                    <p className={`text-sm text-gray-600 mt-1 ${expanded === inq.id ? "" : "line-clamp-2"}`}>{inq.message}</p>
                    {inq.message.length > 100 && (
                      <button onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                        className="text-xs text-[#121e80] font-medium mt-0.5 hover:underline">
                        {expanded === inq.id ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select value={inq.status} onChange={(e) => handleStatusChange(inq, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white text-gray-700 hidden sm:block">
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <span className="text-xs text-gray-400 hidden lg:block">{fmtDate(inq.created_at)}</span>
                    <a href={`mailto:${inq.email}`}
                      className="text-[#121e80] hover:text-[#0d1660] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                      <TrendingUp size={14} />
                    </a>
                    <button onClick={() => setConfirm({ id: inq.id, name: inq.name })}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && <div className="px-5 pb-5"><Pagination current={data.current_page} last={data.last_page} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      {confirm && (
        <ConfirmDialog
          msg={`Delete inquiry from "${confirm.name}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── News tab ─────────────────────────────────────────────────────────────────

const NEWS_CATS = ["News", "Buying & Building", "Finance", "Renting", "Guides", "Lifestyle", "Insights"];

const emptyForm: Partial<NewsArticleApi> = {
  title: "", excerpt: "", category: "News", tag: "", image_url: "", read_time: "3 min read", is_published: true,
};

function NewsTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; title: string } | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Partial<NewsArticleApi>>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const res = await newsApi.adminList({ search: s, is_published: st, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter, token]);

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setImageFile(null); setImagePreview(""); setModal("create"); }
  function openEdit(a: NewsArticleApi) { setForm({ ...a }); setImageFile(null); setImagePreview(a.image_url); setModal("edit"); }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, ...(imageFile ? { imageFile } : {}) };
      if (modal === "create") {
        await newsApi.create(payload, token);
      } else if (modal === "edit" && form.id) {
        await newsApi.update(form.id, payload, token);
      }
      setModal(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await newsApi.delete(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleTogglePublish(a: NewsArticleApi) {
    try {
      await newsApi.update(a.id, { is_published: !a.is_published }, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, statusFilter))}
            placeholder="Search articles…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", statusFilter); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#121e80] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#0d1660] transition-colors">
          <Plus size={14} /> New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{loading ? "Loading…" : `${data?.total ?? 0} articles`}</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading articles…</div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No articles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3">Article</th>
                  <th className="px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Published</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={a.image_url} alt="" className="w-12 h-10 object-cover rounded-lg shrink-0 bg-gray-100" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1">{a.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs font-medium text-gray-600">{a.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => handleTogglePublish(a)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${a.is_published ? "text-green-700" : "text-gray-500"}`}>
                        {a.is_published ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        {a.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-gray-500">
                      {a.published_at ? fmtDate(a.published_at) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/news`} target="_blank"
                          className="text-gray-400 hover:text-[#121e80] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => openEdit(a)}
                          className="text-gray-400 hover:text-[#121e80] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setConfirm({ id: a.id, title: a.title })}
                          className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <div className="px-5 pb-5"><Pagination current={data.current_page} last={data.last_page} onChange={(p) => { setPage(p); load(p); }} /></div>}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">{modal === "create" ? "New Article" : "Edit Article"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Title *</label>
                <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#121e80]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Excerpt *</label>
                <textarea value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#121e80] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                  <select value={form.category ?? "News"} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#121e80]">
                    {NEWS_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tag (optional)</label>
                  <input value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. INTEREST RATES"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#121e80]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Article Image *</label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#121e80] transition-colors bg-gray-50 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-36 object-cover" />
                  ) : (
                    <div className="flex flex-col items-center py-6 text-gray-400">
                      <Plus size={22} className="mb-1" />
                      <span className="text-xs font-medium">Click to upload image</span>
                      <span className="text-xs mt-0.5">JPG, PNG, WEBP · max 5 MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImagePick} />
                </label>
                {imagePreview && (
                  <button onClick={() => { setImageFile(null); setImagePreview(""); setForm({ ...form, image_url: "" }); }}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium">
                    Remove image
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Read time</label>
                  <input value={form.read_time ?? ""} onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    placeholder="3 min read"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#121e80]" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published ?? true}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm font-semibold text-gray-700">Publish now</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-bold py-2 rounded-xl transition-colors disabled:opacity-60">
                {saving ? "Saving…" : modal === "create" ? "Create Article" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          msg={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "properties" | "inquiries" | "news";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",    icon: <LayoutDashboard size={16} /> },
  { id: "users",       label: "Users",       icon: <Users size={16} /> },
  { id: "properties",  label: "Properties",  icon: <Home size={16} /> },
  { id: "inquiries",   label: "Inquiries",   icon: <MessageSquare size={16} /> },
  { id: "news",        label: "News",        icon: <Newspaper size={16} /> },
];

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (token) {
      adminApi.stats(token).then(setStats).catch(() => {});
    }
  }, [token]);

  if (loading || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
              <Shield size={11} /> Admin
            </p>
            <h1 className="text-2xl font-black text-gray-900 mt-0.5">Site Management</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === n.id ? "bg-[#121e80] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
              {n.icon}{n.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "overview" && (
          stats
            ? <OverviewTab stats={stats} />
            : <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-28" />
                ))}
              </div>
        )}
        {tab === "users"       && token && <UsersTab token={token} />}
        {tab === "properties"  && token && <PropertiesTab token={token} />}
        {tab === "inquiries"   && token && <InquiriesTab token={token} />}
        {tab === "news"        && token && <NewsTab token={token} />}
      </div>

      <Footer />
    </div>
  );
}
