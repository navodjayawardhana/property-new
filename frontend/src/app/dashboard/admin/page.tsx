"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { CreateListingWizard } from "@/components/CreateListingWizard";
import { useAuth } from "@/lib/auth-context";
import {
  admin as adminApi,
  newsApi,
  slidesApi,
  bankLoanRatesApi,
  type AdminStats,
  type AdminSettings,
  type Slide,
  type PaginatedUsers,
  type PaginatedInquiries,
  type PaginatedProperties,
  type PaginatedNews,
  type PaginatedLoanEnquiries,
  type NewsArticleApi,
  type LoanEnquiry,
  type BankLoanRate,
  type BankLoanRateInput,
  type Property,
  type Inquiry,
  type User,
} from "@/lib/api";
import {
  Users, Home, MessageSquare, Star, TrendingUp, Search, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, Shield, Eye, EyeOff, Check,
  LayoutDashboard, ToggleLeft, ToggleRight, X, AlertTriangle,
  Newspaper, Plus, Edit2, DollarSign, Ban, CheckCircle, Settings, Loader2,
  ImagePlay, Upload, Video, Building2, CreditCard, Calendar, MapPin, Briefcase,
  Phone, Mail, FileText, LogOut, Menu, FilePlus2, Megaphone,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }
function fmtPrice(n: number) { return `LKR${n.toLocaleString()}`; }
function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }); }

const ROLE_COLORS: Record<string, string> = {
  buyer: "bg-blue-100 text-blue-700",
  seller: "bg-green-100 text-green-700",
  agent: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
  advertisement_manager: "bg-amber-100 text-amber-700",
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
    <div className={`${dim} rounded-full overflow-hidden bg-[#16a34a] flex items-center justify-center shrink-0`}>
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
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${current === p ? "bg-[#16a34a] text-white" : "border border-gray-200 text-gray-700 hover:border-[#16a34a]"}`}>{p}</button>
        )}
      <button onClick={() => onChange(current + 1)} disabled={current === last}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
          <Link href="/buy" target="_blank" className="flex items-center gap-2 text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-[#16a34a] hover:text-[#16a34a] transition-colors font-medium">
            <Eye size={14} /> View site
          </Link>
          <Link href="/agents" target="_blank" className="flex items-center gap-2 text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:border-[#16a34a] hover:text-[#16a34a] transition-colors font-medium">
            <Users size={14} /> View agents
          </Link>
          <Link href="/dashboard/properties/new" className="flex items-center gap-2 text-sm bg-[#16a34a] text-white px-4 py-2 rounded-xl hover:bg-[#15803d] transition-colors font-medium">
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
  const [blocking, setBlocking] = useState<number | null>(null);

  const load = useCallback(async (p = page, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.users({ search: s, role: r, page: p, per_page: 5 } as any, token);
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

  async function handleToggleBlock(u: User) {
    setBlocking(u.id);
    try {
      await adminApi.toggleBlockUser(u.id, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setBlocking(null); }
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
                       {loading ? (
  <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
            ) : ( `${data?.total ?? 0} users`)}
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["User", "Role", "Location", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3"><div className="h-3 bg-gray-200 rounded w-14" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1,2,3,4,5].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-28" />
                          <div className="h-3 bg-gray-100 rounded w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-5 py-3.5"><div className="h-6 bg-gray-100 rounded-lg w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
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
                    <td className="px-4 py-3.5">
                      {u.is_blocked
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><Ban size={10} /> Blocked</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Active</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={blocking === u.id}
                          title={u.is_blocked ? "Unblock user" : "Block user"}
                          className={`transition-colors p-1.5 rounded-lg disabled:opacity-50 ${u.is_blocked ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-orange-400 hover:text-orange-600 hover:bg-orange-50"}`}>
                          {u.is_blocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                        <button onClick={() => setConfirm({ id: u.id, name: u.name })}
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

function AdManagerModal({ token, editing, onClose, onSaved }: { token: string; editing?: User | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editing;
  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1.5";

  // On edit, password is optional (blank = keep current). On create it is required.
  const passwordValid = isEdit
    ? (password === "" && passwordConfirmation === "") || (password.length >= 8 && password === passwordConfirmation)
    : (password.length >= 8 && password === passwordConfirmation);
  const ready = !!(name && phone && passwordValid);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (isEdit && editing) {
        await adminApi.updateAdvertisementManager(
          editing.id,
          {
            name,
            email: email || undefined,
            phone,
            ...(password ? { password, password_confirmation: passwordConfirmation } : {}),
          },
          token
        );
      } else {
        await adminApi.createAdvertisementManager(
          { name, email: email || undefined, password, password_confirmation: passwordConfirmation, phone: phone || undefined },
          token
        );
      }
      setDone(true);
    } catch (e: unknown) {
      const err = e as Error & { errors?: Record<string, string[]> };
      setError(err.errors ? Object.values(err.errors).flat().join(' · ') : (err.message ?? 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900">{isEdit ? "Edit Advertisement Manager" : "New Advertisement Manager"}</h3>
          <button onClick={() => { onClose(); if (done) onSaved(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="p-6 space-y-4">
            {isEdit ? (
              <p className="text-sm text-gray-600">Changes saved for <span className="font-semibold">{email || name}</span>.</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">Account created for <span className="font-semibold">{email || name}</span>.</p>
                <p className="text-xs text-gray-400">They can sign in at <span className="font-mono">/advertisement-manager/login</span> with the email and password you set.</p>
              </>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={onSaved} className="bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <div>
              <label className={lbl}>Full Name *</label>
              <input className={inp} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Email (optional)</label>
              <input type="email" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Phone *</label>
              <input className={inp} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>{isEdit ? "New Password" : "Password *"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} className={inp + " pr-10"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? "Leave blank to keep" : "Min. 8 characters"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={lbl}>{isEdit ? "Confirm Password" : "Confirm Password *"}</label>
                <input type={showPassword ? "text" : "password"} className={inp} value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)} />
              </div>
            </div>
            {password && passwordConfirmation && password !== passwordConfirmation && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !ready}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" /> {isEdit ? "Saving…" : "Creating…"}</> : (isEdit ? "Save Changes" : "Create Account")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manager listings drill-down modal ─────────────────────────────────────────
// Shows every listing a single advertisement manager created, with the same
// view/edit/status/feature/delete controls as the main Properties tab.

function ManagerListingsModal({ token, manager, onClose }: { token: string; manager: User; onClose: () => void }) {
  const [data, setData] = useState<PaginatedProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; title: string } | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    try {
      const res = await adminApi.properties({ created_by: manager.id, search: s, page: p, per_page: 5 }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [manager.id, token]);

  useEffect(() => { load(1, ""); }, [load]);

  async function handleToggleFeatured(p: Property) {
    setToggling(p.id);
    try {
      await adminApi.updateProperty(p.id, { is_featured: !p.is_featured }, token);
      load(page, search);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setToggling(null); }
  }

  async function handleStatusChange(p: Property, status: string) {
    try {
      await adminApi.updateProperty(p.id, { status }, token);
      load(page, search);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteProperty(id, token);
      setConfirm(null);
      load(page, search);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar name={manager.name} avatar={manager.avatar} />
            <div>
              <h3 className="font-black text-gray-900 leading-tight">{manager.name}&apos;s Listings</h3>
              <p className="text-xs text-gray-400">{manager.email ?? manager.phone ?? "Advertisement manager"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search))}
                placeholder="Search this manager's listings…"
                className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
              {search && <button onClick={() => { setSearch(""); setPage(1); load(1, ""); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
            </div>
            <button onClick={() => load(page, search)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">{loading ? <span className="inline-block h-4 w-28 bg-gray-200 rounded animate-pulse" /> : `${data?.total ?? 0} listings`}</p>
            </div>

            {loading ? (
              <div className="p-10 text-center"><Loader2 size={22} className="text-gray-300 mx-auto animate-spin" /></div>
            ) : !data?.data.length ? (
              <div className="p-10 text-center">
                <Building2 size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">This manager hasn&apos;t created any listings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Property</th>
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
                                  className="font-semibold text-gray-900 text-sm hover:text-[#16a34a] transition-colors line-clamp-1">{p.title}</Link>
                                <p className="text-xs text-gray-400">{p.suburb}, {p.state}</p>
                              </div>
                            </div>
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
                                className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                                <Eye size={14} />
                              </Link>
                              <Link href={`/dashboard/properties/${p.id}/edit`}
                                className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-green-50 rounded-lg">
                                <Edit2 size={14} />
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

            {data && <div className="px-5 pb-5"><Pagination current={data.current_page} last={data.last_page} onChange={(p) => { setPage(p); load(p, search); }} /></div>}
          </div>
        </div>
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

// ─── Advertisement Managers tab ────────────────────────────────────────────────

function AdvertisementManagersTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; name: string } | null>(null);
  const [blocking, setBlocking] = useState<number | null>(null);
  const [showNewAdManager, setShowNewAdManager] = useState(false);
  const [editManager, setEditManager] = useState<User | null>(null);
  const [viewListingsFor, setViewListingsFor] = useState<User | null>(null);

  const load = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await adminApi.advertisementManagers({ search: s, page: p }, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, token]);

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteUser(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleToggleBlock(u: User) {
    setBlocking(u.id);
    try {
      await adminApi.toggleBlockUser(u.id, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setBlocking(null); }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search))}
            placeholder="Search by name or email…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, ""); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={() => setShowNewAdManager(true)}
          className="flex items-center gap-1.5 text-sm bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-2 rounded-xl transition-colors font-semibold">
          <Plus size={13} /> New Advertisement Manager
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">
            {loading ? (
              <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
            ) : ( `${data?.total ?? 0} advertisement managers`)}
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Manager", "Phone", "Listings", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3"><div className="h-3 bg-gray-200 rounded w-14" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1,2,3].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-28" />
                          <div className="h-3 bg-gray-100 rounded w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-3.5"><div className="h-3 bg-gray-100 rounded w-8" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-5 py-3.5"><div className="h-6 bg-gray-100 rounded-lg w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !data?.data.length ? (
          <div className="p-10 text-center">
            <Megaphone size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No advertisement managers yet. Click &quot;New Advertisement Manager&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Manager</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
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
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-500">
                      {u.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setViewListingsFor(u)}
                        title="View this manager's listings"
                        className="inline-flex items-center gap-1 min-w-[1.5rem] px-2 py-0.5 text-xs font-bold text-[#16a34a] bg-green-50 hover:bg-green-100 rounded-full transition-colors cursor-pointer">
                        <Building2 size={11} /> {u.created_listings_count ?? 0}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-gray-400">
                      {fmtDate((u as User & { created_at: string }).created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.is_blocked
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><Ban size={10} /> Blocked</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Active</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewListingsFor(u)}
                          title="View listings"
                          className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-green-50 rounded-lg">
                          <Building2 size={14} />
                        </button>
                        <button
                          onClick={() => setEditManager(u)}
                          title="Edit manager"
                          className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-green-50 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={blocking === u.id}
                          title={u.is_blocked ? "Unblock user" : "Block user"}
                          className={`transition-colors p-1.5 rounded-lg disabled:opacity-50 ${u.is_blocked ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-orange-400 hover:text-orange-600 hover:bg-orange-50"}`}>
                          {u.is_blocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                        </button>
                        <button onClick={() => setConfirm({ id: u.id, name: u.name })}
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

      {confirm && (
        <ConfirmDialog
          msg={`Delete advertisement manager "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showNewAdManager && (
        <AdManagerModal
          token={token}
          onClose={() => setShowNewAdManager(false)}
          onSaved={() => { setShowNewAdManager(false); load(page); }}
        />
      )}

      {editManager && (
        <AdManagerModal
          token={token}
          editing={editManager}
          onClose={() => setEditManager(null)}
          onSaved={() => { setEditManager(null); load(page); }}
        />
      )}

      {viewListingsFor && (
        <ManagerListingsModal
          token={token}
          manager={viewListingsFor}
          onClose={() => { setViewListingsFor(null); load(page); }}
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
      const res = await adminApi.properties({ search: s, status: st, listing_type: lt, page: p, per_page: 5 } as any, token);
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
          <p className="text-sm font-bold text-gray-900">{loading ? <span className="inline-block h-4 w-28 bg-gray-200 rounded animate-pulse" /> : `${data?.total ?? 0} properties`}</p>
        </div>

        {loading ? (
          <div className="animate-pulse overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Property","Owner","Type","Status","Featured","Price","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-12" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1,2,3,4,5].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-100 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-5 bg-gray-200 rounded-full w-10" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                    <td className="px-5 py-3.5"><div className="h-6 bg-gray-100 rounded-lg w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                              className="font-semibold text-gray-900 text-sm hover:text-[#16a34a] transition-colors line-clamp-1">{p.title}</Link>
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
                            className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/dashboard/properties/${p.id}/edit`}
                            className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-green-50 rounded-lg">
                            <Edit2 size={14} />
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
      const res = await adminApi.inquiries({ search: s, status: st, inquiry_type: it, page: p, per_page: 5 } as any, token);
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
          <p className="text-sm font-bold text-gray-900">{loading ? <span className="inline-block h-4 w-28 bg-gray-200 rounded animate-pulse" /> : `${data?.total ?? 0} inquiries`}</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50 animate-pulse">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 bg-gray-200 rounded w-28" />
                    <div className="h-4 bg-gray-200 rounded-full w-16" />
                    <div className="h-3 bg-gray-100 rounded w-20 ml-auto" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
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
                      <p className="text-xs text-[#16a34a] font-medium mt-0.5 truncate">
                        Re: {inq.property.title}
                      </p>
                    )}
                    <p className={`text-sm text-gray-600 mt-1 ${expanded === inq.id ? "" : "line-clamp-2"}`}>{inq.message}</p>
                    {inq.message.length > 100 && (
                      <button onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                        className="text-xs text-[#16a34a] font-medium mt-0.5 hover:underline">
                        {expanded === inq.id ? "Show less" : "Show more"}
                      </button>
                    )}
                    {/* Mobile-only status + actions */}
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <select value={inq.status} onChange={(e) => handleStatusChange(inq, e.target.value)}
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none bg-white text-gray-700 focus:border-[#16a34a] transition-colors">
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <a href={`mailto:${inq.email}`}
                        className="text-[#16a34a] hover:text-[#15803d] transition-colors p-1.5 hover:bg-green-50 rounded-lg">
                        <TrendingUp size={14} />
                      </a>
                      <button onClick={() => setConfirm({ id: inq.id, name: inq.name })}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Desktop-only right actions — unchanged */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <select value={inq.status} onChange={(e) => handleStatusChange(inq, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white text-gray-700">
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <span className="text-xs text-gray-400 hidden lg:block">{fmtDate(inq.created_at)}</span>
                    <a href={`mailto:${inq.email}`}
                      className="text-[#16a34a] hover:text-[#15803d] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
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

const NEWS_PAGE_SIZE = 5;

function NewsTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; title: string } | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<Partial<NewsArticleApi>>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    setNewsPage(1);
    try {
      const res = await newsApi.adminList({ search: s, is_published: st, page: p, per_page: 100 } as any, token);
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
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#16a34a] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#15803d] transition-colors">
          <Plus size={14} /> New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{loading ? <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" /> : `${data?.total ?? 0} articles`}</p>
        </div>

        {loading ? (
          <div className="animate-pulse overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  {["Article","Category","Status","Published","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-14" /></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1,2,3,4].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-36" />
                          <div className="h-3 bg-gray-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 bg-gray-200 rounded-full w-14" /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-5 py-3.5"><div className="h-6 bg-gray-100 rounded-lg w-20 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {[...data.data].sort((a, b) => a.id - b.id).slice((newsPage - 1) * NEWS_PAGE_SIZE, newsPage * NEWS_PAGE_SIZE).map((a) => (
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
                          className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => openEdit(a)}
                          className="text-gray-400 hover:text-[#16a34a] transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
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

        {data && data.data.length > NEWS_PAGE_SIZE && (
          <div className="px-5 pb-5">
            <Pagination
              current={newsPage}
              last={Math.ceil(data.data.length / NEWS_PAGE_SIZE)}
              onChange={setNewsPage}
            />
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-gray-900">{modal === "create" ? "New Article" : "Edit Article"}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Title *</label>
                <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Excerpt *</label>
                <textarea value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                  <select value={form.category ?? "News"} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a]">
                    {NEWS_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tag (optional)</label>
                  <input value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. INTEREST RATES"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Article Image *</label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#16a34a] transition-colors bg-gray-50 overflow-hidden">
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a]" />
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
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold py-2 rounded-xl transition-colors disabled:opacity-60">
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

// ─── Loan Enquiries tab ───────────────────────────────────────────────────────

const LOAN_STATUS_COLORS: Record<string, string> = {
  new:          "bg-blue-100 text-blue-700",
  in_review:    "bg-yellow-100 text-yellow-700",
  pre_approved: "bg-green-100 text-green-700",
  declined:     "bg-red-100 text-red-700",
};

const LOAN_STATUS_LABELS: Record<string, string> = {
  new:          "New",
  in_review:    "In Review",
  pre_approved: "Pre-Approved",
  declined:     "Declined",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time:     "Full-time",
  part_time:     "Part-time",
  self_employed: "Self-employed",
  casual:        "Casual",
};

const PURPOSE_LABELS: Record<string, string> = {
  buy_home:   "Buy a home",
  investment: "Investment",
  refinance:  "Refinance",
};

// ── Loan enquiry detail modal ─────────────────────────────────────────────────

function LoanDetailModal({ enq, onClose, onStatusChange }: {
  enq: LoanEnquiry;
  onClose: () => void;
  onStatusChange: (enq: LoanEnquiry, status: string) => Promise<void>;
}) {
  const LKR = (n: number | null) =>
    n != null ? n.toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }) : "—";

  function Row({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        {Icon && (
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={13} className="text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">{value || "—"}</p>
        </div>
      </div>
    );
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="mb-5">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{title}</p>
        <div className="bg-gray-50 rounded-xl px-4 divide-y divide-gray-100">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={enq.name} />
            <div>
              <p className="font-black text-gray-900 text-sm">{enq.name}</p>
              <p className="text-xs text-gray-400">{fmtDate(enq.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={enq.status} onChange={(e) => onStatusChange(enq, e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white text-gray-700">
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="pre_approved">Pre-Approved</option>
              <option value="declined">Declined</option>
            </select>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Status badge */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge label={LOAN_STATUS_LABELS[enq.status] ?? enq.status} color={LOAN_STATUS_COLORS[enq.status] ?? "bg-gray-100 text-gray-600"} />
            <Badge label={PURPOSE_LABELS[enq.loan_purpose] ?? enq.loan_purpose} color="bg-indigo-100 text-indigo-700" />
            {enq.selected_bank && <Badge label={enq.selected_bank} color="bg-green-100 text-green-700" />}
          </div>

          <Section title="Personal Details">
            <Row label="Full Name"   value={enq.name}       icon={Users} />
            <Row label="NIC Number"  value={enq.nic_number} icon={CreditCard} />
            <Row label="Email"       value={<a href={`mailto:${enq.email}`} className="text-[#16a34a] hover:underline">{enq.email}</a>} icon={Mail} />
            <Row label="Phone"       value={enq.phone}      icon={Phone} />
          </Section>

          {enq.selected_bank && (
            <Section title="Selected Bank">
              <Row label="Bank Name" value={enq.selected_bank} icon={Building2} />
            </Section>
          )}

          <Section title="Loan Details">
            <Row label="Loan Amount"              value={LKR(enq.loan_amount)}                icon={DollarSign} />
            <Row label="Loan Term"                value={enq.loan_term ? `${enq.loan_term} years` : null} icon={Calendar} />
            <Row label="Deposit Amount"           value={LKR(enq.deposit_amount)}             icon={DollarSign} />
            <Row label="Estimated Property Value" value={LKR(enq.estimated_property_value)}   icon={Home} />
            <Row label="Loan Purpose"             value={PURPOSE_LABELS[enq.loan_purpose] ?? enq.loan_purpose} icon={FileText} />
          </Section>

          <Section title="Employment & Income">
            <Row label="Employment Type" value={EMPLOYMENT_LABELS[enq.employment_type] ?? enq.employment_type} icon={Briefcase} />
            <Row label="Annual Income"   value={LKR(enq.annual_income) + " p.a."} icon={DollarSign} />
          </Section>

          <Section title="Property">
            <Row label="Property Type" value={enq.property_type} icon={Home} />
            <Row label="District"      value={enq.property_state} icon={MapPin} />
          </Section>

          {enq.message && (
            <Section title="Additional Notes">
              <div className="py-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{enq.message}</p>
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <a href={`mailto:${enq.email}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
            <Mail size={14} /> Email Applicant
          </a>
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanEnquiriesTab({ token }: { token: string }) {
  const [data, setData] = useState<PaginatedLoanEnquiries | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; name: string } | null>(null);
  const [viewEnq, setViewEnq] = useState<LoanEnquiry | null>(null);

  const load = useCallback(async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.loanEnquiries({ search: s, status: st, page: p, per_page: 5 } as any, token);
      setData(res);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search, statusFilter, token]);

  useEffect(() => { load(); }, []);

  async function handleStatusChange(enq: LoanEnquiry, status: string) {
    try {
      await adminApi.updateLoanEnquiry(enq.id, status, token);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleDelete(id: number) {
    try {
      await adminApi.deleteLoanEnquiry(id, token);
      setConfirm(null);
      load(page);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  const LKR = (n: number) => n.toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load(1, search, statusFilter))}
            placeholder="Search by name or email…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          {search && <button onClick={() => { setSearch(""); setPage(1); load(1, "", statusFilter); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none text-gray-700">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="pre_approved">Pre-Approved</option>
          <option value="declined">Declined</option>
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 text-gray-600 bg-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{loading ? <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" /> : `${data?.total ?? 0} loan enquiries`}</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50 animate-pulse">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 bg-gray-200 rounded w-28" />
                    <div className="h-4 bg-gray-200 rounded-full w-20" />
                    <div className="h-3 bg-gray-100 rounded w-16 ml-auto" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No loan enquiries yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.data.map((enq) => (
              <div key={enq.id} className="hover:bg-gray-50/30 transition-colors">
                <div className="flex items-start gap-3 px-5 py-4">
                  <Avatar name={enq.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{enq.name}</span>
                      <Badge label={LOAN_STATUS_LABELS[enq.status] ?? enq.status} color={LOAN_STATUS_COLORS[enq.status] ?? "bg-gray-100 text-gray-600"} />
                      <Badge label={PURPOSE_LABELS[enq.loan_purpose] ?? enq.loan_purpose} color="bg-indigo-100 text-indigo-700" />
                      {enq.selected_bank && <Badge label={enq.selected_bank} color="bg-green-100 text-green-700" />}
                    </div>
                    <p className="text-xs text-gray-400">{enq.email}{enq.phone ? ` · ${enq.phone}` : ""}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                      <span><span className="text-gray-400">Loan:</span> <span className="font-semibold">{LKR(enq.loan_amount)}</span></span>
                      {enq.loan_term && <span><span className="text-gray-400">Term:</span> <span className="font-semibold">{enq.loan_term} yrs</span></span>}
                      <span><span className="text-gray-400">Income:</span> <span className="font-semibold">{LKR(enq.annual_income)} p.a.</span></span>
                      <span><span className="text-gray-400">District:</span> <span className="font-semibold">{enq.property_state}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-400 hidden lg:block">{fmtDate(enq.created_at)}</span>
                    <button onClick={() => setViewEnq(enq)} title="View full details"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
                      <Eye size={13} />
                    </button>
                    <select value={enq.status} onChange={(e) => handleStatusChange(enq, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white text-gray-700 hidden sm:block">
                      <option value="new">New</option>
                      <option value="in_review">In Review</option>
                      <option value="pre_approved">Pre-Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                    <button onClick={() => setConfirm({ id: enq.id, name: enq.name })}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-400 hover:border-red-300 hover:text-red-600 transition-colors">
                      <Trash2 size={13} />
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
          msg={`Delete loan enquiry from "${confirm.name}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {viewEnq && (
        <LoanDetailModal
          enq={viewEnq}
          onClose={() => setViewEnq(null)}
          onStatusChange={async (enq, status) => {
            await handleStatusChange(enq, status);
            setViewEnq((prev) => prev ? { ...prev, status: status as LoanEnquiry["status"] } : null);
          }}
        />
      )}
    </div>
  );
}

// ─── Slides tab ──────────────────────────────────────────────────────────────

const MAX_SLIDES = 6;

function SlidesTab({ token }: { token: string }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [slidePage, setSlidePage] = useState(1);
  const SLIDE_PAGE_SIZE = 5;

  const load = () => {
    setLoading(true);
    slidesApi.adminList(token)
      .then((data) => { setSlides(data); setSlidePage(1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith("video"));
    setPreview(URL.createObjectURL(f));
  }

  async function handleAdd(onSuccess?: () => void) {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("media", file);
      if (title) fd.append("title", title);
      if (subtitle) fd.append("subtitle", subtitle);
      await slidesApi.create(fd, token);
      setFile(null); setPreview(null); setIsVideo(false);
      setTitle(""); setSubtitle("");
      if (fileRef.current) fileRef.current.value = "";
      load();
      onSuccess?.();
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this slide?")) return;
    try {
      await slidesApi.destroy(id, token);
      load();
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleToggle(slide: Slide) {
    try {
      await slidesApi.update(slide.id, { is_active: !slide.is_active }, token);
      load();
    } catch (e: unknown) { alert((e as Error).message); }
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const canAdd = slides.length < MAX_SLIDES;
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";

  function openAddModal() {
    setFile(null); setPreview(null); setIsVideo(false);
    setTitle(""); setSubtitle("");
    if (fileRef.current) fileRef.current.value = "";
    setShowAddModal(true);
  }

  const sortedSlides = [...slides].sort((a, b) => a.sort_order - b.sort_order);
  const pagedSlides = sortedSlides.slice((slidePage - 1) * SLIDE_PAGE_SIZE, slidePage * SLIDE_PAGE_SIZE);
  const totalSlidePages = Math.ceil(sortedSlides.length / SLIDE_PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Existing slides */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ImagePlay size={16} className="text-[#16a34a]" /> Homepage Slides
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${slides.length >= MAX_SLIDES ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
              {slides.length} / {MAX_SLIDES} slides
            </span>
            <button onClick={openAddModal} disabled={!canAdd}
              className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
              <Plus size={13} /> Add Slide
            </button>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50 animate-pulse">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-4 h-3 bg-gray-200 rounded shrink-0" />
                <div className="w-20 h-12 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="h-6 bg-gray-100 rounded-lg w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No slides yet — default homepage images are displayed.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pagedSlides.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs text-gray-400 font-bold w-4 shrink-0">{i + 1}</span>
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {s.media_type === "video" ? (
                    <video src={s.media_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={s.media_url} alt={s.title ?? ""} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.title || <span className="text-gray-400 italic">No title</span>}</p>
                  <p className="text-xs text-gray-400 truncate">{s.subtitle || "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.media_type === "video" && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                      <Video size={10} /> Video
                    </span>
                  )}
                  <button onClick={() => handleToggle(s)}
                    title={s.is_active ? "Hide slide" : "Show slide"}
                    className={`transition-colors ${s.is_active ? "text-green-500 hover:text-green-700" : "text-gray-300 hover:text-gray-500"}`}>
                    {s.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="px-5 pb-5">
              <Pagination current={slidePage} last={totalSlidePages} onChange={setSlidePage} />
            </div>
          </div>
        )}
      </div>

      {!canAdd && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium">
          Maximum of {MAX_SLIDES} slides reached. Delete a slide to add a new one.
        </div>
      )}

      {/* Add slide modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><Upload size={15} /> Add New Slide</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Media picker */}
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#16a34a] transition-colors bg-gray-50 overflow-hidden min-h-[140px]">
                {preview ? (
                  isVideo
                    ? <video src={preview} className="w-full max-h-52 object-contain" controls muted />
                    : <img src={preview} alt="" className="w-full max-h-52 object-cover" />
                ) : (
                  <div className="flex flex-col items-center py-8 text-gray-400">
                    <ImagePlay size={28} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload image or video</span>
                    <span className="text-xs mt-1 text-gray-300">JPG, PNG, WEBP, MP4, MOV · max 50 MB</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp,video/mp4,video/mov,video/webm" className="hidden" onChange={handleFilePick} />
              </label>
              {preview && (
                <button onClick={() => { setFile(null); setPreview(null); setIsVideo(false); if (fileRef.current) fileRef.current.value = ""; }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Remove media</button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Title (optional)</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Find Your Dream Home" className={inp} maxLength={100} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Subtitle (optional)</label>
                  <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Search across Sri Lanka" className={inp} maxLength={200} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowAddModal(false)}
                className="border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleAdd(() => setShowAddModal(false))} disabled={!file || saving}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Plus size={14} /> Add Slide</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bank Rates tab ───────────────────────────────────────────────────────────

const LOAN_TYPE_OPTIONS = [
  { value: "variable",      label: "Variable Rate"   },
  { value: "fixed",         label: "Fixed Rate"      },
  { value: "split",         label: "Split Loan"      },
  { value: "interest_only", label: "Interest Only"   },
];

const LOAN_TYPE_COLORS: Record<string, string> = {
  variable:      "bg-green-100 text-green-700",
  fixed:         "bg-blue-100 text-blue-700",
  split:         "bg-purple-100 text-purple-700",
  interest_only: "bg-orange-100 text-orange-700",
};

const LOAN_TYPE_LABELS: Record<string, string> = {
  variable:      "Variable",
  fixed:         "Fixed",
  split:         "Split",
  interest_only: "Interest Only",
};

const EMPTY_FORM: BankLoanRateInput = {
  bank_name: "", loan_type: "variable", interest_rate: 8.5,
  min_loan: 500000, max_loan: 50000000, max_term: 30,
  features: [], is_active: true, sort_order: 0,
};

function BankRatesTab({ token }: { token: string }) {
  const [banks, setBanks] = useState<BankLoanRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BankLoanRateInput>(EMPTY_FORM);
  const [featuresText, setFeaturesText] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [confirm, setConfirm] = useState<{ id: number; name: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [bankPage, setBankPage] = useState(1);
  const BANK_PAGE_SIZE = 5;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBanks(await bankLoanRatesApi.adminList(token));
      setBankPage(1);
    }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function resetLogoState() {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFeaturesText("");
    resetLogoState();
    setShowForm(true);
  }

  function openEdit(b: BankLoanRate) {
    setEditId(b.id);
    setForm({
      bank_name: b.bank_name, loan_type: b.loan_type,
      interest_rate: b.interest_rate, min_loan: b.min_loan,
      max_loan: b.max_loan, max_term: b.max_term,
      features: b.features ?? [], is_active: b.is_active, sort_order: b.sort_order,
    });
    setFeaturesText((b.features ?? []).join(", "));
    setLogoPreview(b.logo_url ?? null);
    setLogoFile(null);
    setRemoveLogo(false);
    setShowForm(true);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
    setRemoveLogo(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const features = featuresText ? featuresText.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (editId !== null) {
        const updated = await bankLoanRatesApi.update(editId,
          { ...form, features, logo: logoFile ?? undefined, remove_logo: removeLogo }, token);
        setBanks((prev) => prev.map((b) => (b.id === editId ? updated : b)));
      } else {
        const created = await bankLoanRatesApi.create({ ...form, features, logo: logoFile ?? undefined }, token);
        setBanks((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleToggleActive(b: BankLoanRate) {
    try {
      const updated = await bankLoanRatesApi.update(b.id, { is_active: !b.is_active }, token);
      setBanks((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
    } catch (e: unknown) { alert((e as Error).message); }
  }

  async function handleDelete(id: number) {
    try {
      await bankLoanRatesApi.destroy(id, token);
      setBanks((prev) => prev.filter((b) => b.id !== id));
      setConfirm(null);
    } catch (e: unknown) { alert((e as Error).message); }
  }

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1.5";

  const sortedBanks = [...banks].sort((a, b) => a.id - b.id);
  const pagedBanks = sortedBanks.slice((bankPage - 1) * BANK_PAGE_SIZE, bankPage * BANK_PAGE_SIZE);
  const totalBankPages = Math.ceil(sortedBanks.length / BANK_PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{banks.length} bank{banks.length !== 1 ? "s" : ""} configured</p>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={14} /> Add Bank
        </button>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-black text-gray-900">{editId !== null ? "Edit Bank Rate" : "Add New Bank"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Bank Name *</label>
                  <input className={inp} value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. Bank of Ceylon" />
                </div>
                <div>
                  <label className={lbl}>Loan Type *</label>
                  <select className={inp} value={form.loan_type}
                    onChange={(e) => setForm({ ...form, loan_type: e.target.value as BankLoanRateInput["loan_type"] })}>
                    {LOAN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Interest Rate (% p.a.) *</label>
                  <input type="number" min={0} max={100} step={0.01} className={inp}
                    value={form.interest_rate}
                    onChange={(e) => setForm({ ...form, interest_rate: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={lbl}>Max Term (years) *</label>
                  <input type="number" min={1} max={30} className={inp}
                    value={form.max_term}
                    onChange={(e) => setForm({ ...form, max_term: parseInt(e.target.value) || 30 })} />
                </div>
                <div>
                  <label className={lbl}>Min Loan (LKR) *</label>
                  <input type="number" min={0} step={100000} className={inp}
                    value={form.min_loan}
                    onChange={(e) => setForm({ ...form, min_loan: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={lbl}>Max Loan (LKR) *</label>
                  <input type="number" min={0} step={1000000} className={inp}
                    value={form.max_loan}
                    onChange={(e) => setForm({ ...form, max_loan: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={lbl}>Sort Order</label>
                  <input type="number" min={0} className={inp}
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <label className="text-xs font-semibold text-gray-600">Active</label>
                  <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
              <div>
                <label className={lbl}>Bank Logo (optional)</label>
                <div className="flex items-center gap-3">
                  {logoPreview && !removeLogo ? (
                    <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                      <img src={logoPreview} alt="logo preview" className="w-full h-full object-contain p-1" />
                      <button type="button" onClick={() => { setRemoveLogo(true); setLogoPreview(null); setLogoFile(null); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                      <Building2 size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleLogoChange}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#16a34a]/10 file:text-[#16a34a] hover:file:bg-[#16a34a]/20 cursor-pointer" />
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — max 2 MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className={lbl}>Features (comma-separated)</label>
                <input className={inp} value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="e.g. Offset account, Redraw facility, Extra repayments" />
                <p className="text-xs text-gray-400 mt-1">Separate features with commas</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.bank_name}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> {editId !== null ? "Update" : "Save"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={14} /> Bank Loan Rates
          </p>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-50 animate-pulse">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-100 rounded-lg w-16" />
              </div>
            ))}
          </div>
        ) : banks.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No banks added yet. Click "Add Bank" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pagedBanks.map((b) => (
              <div key={b.id} className="px-5 py-4 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* Logo */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden mt-0.5 sm:mt-0">
                    {b.logo_url
                      ? <img src={b.logo_url} alt={b.bank_name} className="w-full h-full object-contain p-0.5" />
                      : <Building2 size={16} className="text-gray-300" />}
                  </div>

                  {/* Bank info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{b.bank_name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${LOAN_TYPE_COLORS[b.loan_type] ?? "bg-gray-100 text-gray-600"}`}>
                        {LOAN_TYPE_LABELS[b.loan_type] ?? b.loan_type}
                      </span>
                      {!b.is_active && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {b.interest_rate.toFixed(2)}% p.a. · Max {b.max_term} yrs ·
                      LKR {(b.min_loan / 1000000).toFixed(1)}M – {(b.max_loan / 1000000).toFixed(0)}M
                    </p>
                    {b.features && b.features.length > 0 && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{b.features.join(" · ")}</p>
                    )}

                    {/* Mobile-only: rate + actions row */}
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <span className="text-sm font-black text-[#16a34a]">{b.interest_rate.toFixed(2)}% <span className="text-xs font-medium text-gray-400">p.a.</span></span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button onClick={() => handleToggleActive(b)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-[#16a34a] text-gray-400 hover:text-[#16a34a] transition-colors">
                          {b.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => openEdit(b)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-[#16a34a] text-gray-400 hover:text-[#16a34a] transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setConfirm({ id: b.id, name: b.bank_name })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop-only: rate */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-sm font-black text-[#16a34a]">{b.interest_rate.toFixed(2)}%</p>
                    <p className="text-xs text-gray-400">p.a.</p>
                  </div>

                  {/* Desktop-only: action buttons */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggleActive(b)} title={b.is_active ? "Deactivate" : "Activate"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-[#16a34a] text-gray-400 hover:text-[#16a34a] transition-colors">
                      {b.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => openEdit(b)} title="Edit"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-[#16a34a] text-gray-400 hover:text-[#16a34a] transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setConfirm({ id: b.id, name: b.bank_name })} title="Delete"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-5 pb-5">
              <Pagination current={bankPage} last={totalBankPages} onChange={setBankPage} />
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          msg={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}


// ─── Pricing tab ─────────────────────────────────────────────────────────────

function PricingTab({ token }: { token: string }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [form, setForm] = useState({ listing_fee: 1000, processing_fee_pct: 3.3, payment_gateway_enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [togglingGateway, setTogglingGateway] = useState(false);

  useEffect(() => {
    adminApi.getSettings(token)
      .then((s) => { setSettings(s); setForm({ listing_fee: s.listing_fee, processing_fee_pct: s.processing_fee_pct, payment_gateway_enabled: s.payment_gateway_enabled }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await adminApi.updateSettings({ ...form, commission_pct: 0 }, token);
      setSettings(updated);
      setForm((f) => ({ ...f, payment_gateway_enabled: updated.payment_gateway_enabled }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleToggleGateway() {
    setTogglingGateway(true);
    try {
      const updated = await adminApi.updateSettings({ ...form, payment_gateway_enabled: !form.payment_gateway_enabled, commission_pct: 0 }, token);
      setSettings(updated);
      setForm((f) => ({ ...f, payment_gateway_enabled: updated.payment_gateway_enabled }));
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setTogglingGateway(false); }
  }

  const fee   = form.listing_fee;
  const proc  = parseFloat(((fee * form.processing_fee_pct) / 100).toFixed(2));
  const total = parseFloat((fee + proc).toFixed(2));

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white";
  const lbl = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><CreditCard size={16} className="text-[#16a34a]" /> Payment Gateway</h3>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading…' : form.payment_gateway_enabled
                ? 'Sellers pay a listing fee via PayHere before their listing goes live.'
                : 'Payment is disabled — new listings are submitted directly for admin approval.'}
            </p>
          </div>
          <button onClick={handleToggleGateway} disabled={loading || togglingGateway}
            className="flex items-center gap-2 shrink-0 disabled:opacity-50">
            <span className={`text-xs font-semibold ${form.payment_gateway_enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {form.payment_gateway_enabled ? 'Enabled' : 'Disabled'}
            </span>
            {form.payment_gateway_enabled
              ? <ToggleRight size={28} className="text-green-500" />
              : <ToggleLeft size={28} className="text-gray-300" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><DollarSign size={16} className="text-[#16a34a]" /> Listing Fee Configuration</h3>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
              {[1,2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1,2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-28" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Listing Fee (LKR)</label>
                <input type="number" min={0} step={1} className={inp}
                  value={form.listing_fee}
                  onChange={(e) => setForm({ ...form, listing_fee: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={lbl}>Processing Fee %</label>
                <input type="number" min={0} max={100} step={0.1} className={inp}
                  value={form.processing_fee_pct}
                  onChange={(e) => setForm({ ...form, processing_fee_pct: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Live total */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Price</span>
                <span className="font-semibold">LKR {fmt(fee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Processing Fee ({form.processing_fee_pct}%)</span>
                <span>LKR {fmt(proc)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                <span>Total Price</span>
                <span>LKR {fmt(total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Settings"}
              </button>
              {saved && <span className="text-sm text-green-600 font-medium flex items-center gap-1"><Check size={14} /> Saved</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "properties" | "create-listing" | "inquiries" | "news" | "loans" | "banks" | "slides" | "advertisement-managers" | "pricing";

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",        label: "Overview",          icon: <LayoutDashboard size={16} /> },
  { id: "users",           label: "Users",             icon: <Users size={16} /> },
  { id: "properties",      label: "Properties",        icon: <Home size={16} /> },
  { id: "create-listing",  label: "Create Listing",    icon: <FilePlus2 size={16} /> },
  { id: "inquiries",       label: "Inquiries",         icon: <MessageSquare size={16} /> },
  { id: "news",            label: "News",              icon: <Newspaper size={16} /> },
  { id: "loans",           label: "Loan Applications", icon: <DollarSign size={16} /> },
  { id: "banks",           label: "Bank Rates",        icon: <Building2 size={16} /> },
  { id: "slides",          label: "Slides",            icon: <ImagePlay size={16} /> },
  { id: "advertisement-managers", label: "Ad Managers", icon: <Megaphone size={16} /> },
  { id: "pricing",         label: "Pricing",           icon: <Settings size={16} /> },
];

export default function AdminPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
            <div className="w-16 h-16 rounded-full overflow-hidden bg-red-600 flex items-center justify-center mx-auto mb-3">
              <UserAvatar src={(user as any).avatar ?? null} name={user.name} avatarBg="bg-red-600" textSize="text-xl" />
            </div>
            <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
            <span className="text-xs text-red-400 font-semibold mt-0.5 block">Administrator</span>
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
                  <Shield size={11} /> Admin Dashboard
                </p>
                <h1 className="text-xl font-black text-gray-900 mt-0.5">Site Management</h1>
              </div>
            </div>
            {stats && (
              <div className="flex items-center gap-6">
                {[
                  { label: "Users",      value: fmt(stats.users.total),       color: "text-blue-600"   },
                  { label: "Properties", value: fmt(stats.properties.total),  color: "text-green-600"  },
                  { label: "Inquiries",  value: fmt(stats.inquiries.total),   color: "text-purple-600" },
                  { label: "Featured",   value: fmt(stats.properties.featured), color: "text-yellow-600" },
                ].map((s) => (
                  <div key={s.label} className="text-center hidden sm:block">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 lg:p-6 flex-1">
            {tab === "overview" && (
              stats
                ? <OverviewTab stats={stats} />
                : <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-28" />
                    ))}
                  </div>
            )}
            {tab === "users"          && token && <UsersTab token={token} />}
            {tab === "properties"     && token && <PropertiesTab token={token} />}
            {tab === "create-listing" && token && <CreateListingWizard token={token} />}
            {tab === "inquiries"      && token && <InquiriesTab token={token} />}
            {tab === "news"           && token && <NewsTab token={token} />}
            {tab === "loans"          && token && <LoanEnquiriesTab token={token} />}
            {tab === "banks"          && token && <BankRatesTab token={token} />}
            {tab === "slides"         && token && <SlidesTab token={token} />}
            {tab === "advertisement-managers" && token && <AdvertisementManagersTab token={token} />}
            {tab === "pricing"        && token && <PricingTab token={token} />}
          </div>
        </main>

      </div>
    </div>
  );
}
