"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, inquiries as inquiriesApi, loanEnquiries as loanEnqApi, favorites as favoritesApi, bankLoanRatesApi, agentSlidesApi, profile as profileApi, type Property, type Inquiry, type LoanEnquiry, type AgentSlide } from "@/lib/api";
import { getSaved } from "@/lib/saved-properties";
import PropertyCard from "@/components/PropertyCard";
import { formatPrice } from "@/lib/utils";
import {
  Plus, Edit2, Trash2, Loader2, Home, TrendingUp, MessageSquare,
  ChevronDown, ChevronUp, ExternalLink, Phone, Mail, RefreshCw,
  ChevronLeft, ChevronRight, Building2, Heart, User, Upload, X,
  Globe, MessageCircle, Save,
} from "lucide-react";

function FbIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function IgIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function LiIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>; }
function TwIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }

const LOAN_STATUS_COLOR: Record<string, string> = {
  new: "bg-gray-100 text-gray-600", in_review: "bg-blue-100 text-blue-700",
  pre_approved: "bg-green-100 text-green-700", declined: "bg-red-100 text-red-600",
};
const LOAN_STATUS_LABEL: Record<string, string> = {
  new: "New", in_review: "In Review", pre_approved: "Pre-Approved", declined: "Declined",
};
const PURPOSE_LABEL: Record<string, string> = {
  buy_home: "Buy a Home", investment: "Investment", refinance: "Refinance",
};
const LKR_fmt = (n: number) =>
  Math.round(n).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  sold: "bg-blue-100 text-blue-700",
};

const INQ_STATUS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

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

export default function AgentDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'listings' | 'saved' | 'inquiries' | 'loans' | 'profile'>('listings');
  const [myLoans, setMyLoans] = useState<LoanEnquiry[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [bankLogoMap, setBankLogoMap] = useState<Record<string, string | null>>({});
  const [saved, setSaved] = useState<Property[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [items, setItems] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [perPropInquiries, setPerPropInquiries] = useState<Record<number, Inquiry[]>>({});
  const [loadingPerProp, setLoadingPerProp] = useState<number | null>(null);

  const [received, setReceived] = useState<Inquiry[]>([]);
  const [fetchingInq, setFetchingInq] = useState(false);
  const [inqLoaded, setInqLoaded] = useState(false);

  // Profile & Branding tab
  const [slides, setSlides] = useState<AgentSlide[]>([]);
  const [slidesLoaded, setSlidesLoaded] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [deletingSlideId, setDeletingSlideId] = useState<number | null>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState({ bio: '', facebook: '', instagram: '', linkedin: '', whatsapp: '', twitter: '', website: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'agent' && user.role !== 'admin'))) {
      router.replace('/dashboard/buyer');
    }
  }, [loading, user, router]);

  const loadListings = useCallback((p: number) => {
    if (!token) return;
    setFetching(true);
    propertiesApi.mine(token, p)
      .then((res) => {
        setItems(res.data);
        setPage(res.current_page);
        setLastPage(res.last_page);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [token]);

  useEffect(() => { loadListings(1); }, [loadListings]);

  useEffect(() => {
    setSaved(getSaved());
    if (token) {
      setLoadingSaved(true);
      favoritesApi.list(token)
        .then((props) => { if (props.length > 0) setSaved(props); })
        .catch(() => {})
        .finally(() => setLoadingSaved(false));
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'loans' && token) {
      setLoadingLoans(true);
      Promise.all([loanEnqApi.mine(token), bankLoanRatesApi.list()])
        .then(([loans, rates]) => {
          setMyLoans(loans);
          const map: Record<string, string | null> = {};
          rates.forEach((r) => { map[r.bank_name] = r.logo_url; });
          setBankLogoMap(map);
        }).catch(() => {}).finally(() => setLoadingLoans(false));
    }
    if (tab === 'inquiries' && token && !inqLoaded) loadInquiries();
    if (tab === 'profile' && token && !slidesLoaded) loadSlides();
  }, [tab, token]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        bio:       (user as unknown as Record<string, string>).bio       ?? '',
        facebook:  (user as unknown as Record<string, string>).facebook  ?? '',
        instagram: (user as unknown as Record<string, string>).instagram ?? '',
        linkedin:  (user as unknown as Record<string, string>).linkedin  ?? '',
        whatsapp:  (user as unknown as Record<string, string>).whatsapp  ?? '',
        twitter:   (user as unknown as Record<string, string>).twitter   ?? '',
        website:   (user as unknown as Record<string, string>).website   ?? '',
      });
    }
  }, [user]);

  function loadInquiries() {
    if (!token) return;
    setFetchingInq(true);
    inquiriesApi.received(token)
      .then((data) => { setReceived(data); setInqLoaded(true); })
      .catch(console.error)
      .finally(() => setFetchingInq(false));
  }

  async function togglePerProp(propertyId: number) {
    if (expandedId === propertyId) { setExpandedId(null); return; }
    setExpandedId(propertyId);
    if (perPropInquiries[propertyId] || !token) return;
    setLoadingPerProp(propertyId);
    try {
      const data = await inquiriesApi.forProperty(propertyId, token);
      setPerPropInquiries((prev) => ({ ...prev, [propertyId]: data }));
    } catch { /* ignore */ }
    finally { setLoadingPerProp(null); }
  }

  function loadSlides() {
    if (!token) return;
    agentSlidesApi.list(token)
      .then((data) => { setSlides(data); setSlidesLoaded(true); })
      .catch(() => {});
  }

  async function handleSlideUpload(files: FileList | null) {
    if (!files || !token) return;
    setUploadingSlide(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('sort_order', String(slides.length));
        const slide = await agentSlidesApi.upload(fd, token);
        setSlides((prev) => [...prev, slide]);
      }
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Upload failed');
    } finally {
      setUploadingSlide(false);
    }
  }

  async function handleSlideDelete(id: number) {
    if (!token || !confirm('Remove this slide?')) return;
    setDeletingSlideId(id);
    try {
      await agentSlidesApi.remove(id, token);
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
    finally { setDeletingSlideId(null); }
  }

  async function toggleSlideActive(slide: AgentSlide) {
    if (!token) return;
    const updated = await agentSlidesApi.update(slide.id, { is_active: !slide.is_active }, token);
    setSlides((prev) => prev.map((s) => s.id === slide.id ? updated : s));
  }

  async function handleProfileSave() {
    if (!token) return;
    setProfileSaving(true);
    try {
      await profileApi.update(profileForm, token);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Save failed');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token || !confirm('Delete this listing permanently?')) return;
    setDeletingId(id);
    try {
      await propertiesApi.delete(id, token);
      loadListings(page);
    } catch (e: unknown) {
      alert((e as Error).message ?? 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading || !user) return null;

  const active = items.filter((p) => p.status === 'active').length;
  const pendingCount = received.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Agent Dashboard</p>
            <h1 className="text-2xl font-black text-gray-900 mt-0.5">Welcome, {user.name.split(' ')[0]}</h1>
          </div>
          <Link href="/dashboard/properties/new"
            className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={16} /> Add Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Listings', value: total, icon: Home, color: 'text-[#16a34a]', bg: 'bg-[#16a34a]/10' },
            { label: 'Active', value: active, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'New Inquiries', value: pendingCount, icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button onClick={() => setTab('listings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'listings' ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Home size={14} /> Client Listings
            {total > 0 && <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{total}</span>}
          </button>
          <button onClick={() => setTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'saved' ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Heart size={14} /> Saved Properties
            {saved.length > 0 && <span className="bg-[#16a34a] text-white text-xs px-1.5 py-0.5 rounded-full">{saved.length}</span>}
          </button>
          <button onClick={() => setTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'inquiries' ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare size={14} /> Received Inquiries
            {pendingCount > 0 && <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>
          <button onClick={() => setTab('loans')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'loans' ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Building2 size={14} /> Loan Applications
            {myLoans.length > 0 && <span className="bg-[#16a34a] text-white text-xs px-1.5 py-0.5 rounded-full">{myLoans.length}</span>}
          </button>
          <button onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'profile' ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <User size={14} /> Profile & Branding
          </button>
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          fetching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : total === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Home size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No client listings yet</p>
              <Link href="/dashboard/properties/new"
                className="inline-flex items-center gap-2 mt-5 bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">
                <Plus size={14} /> Add listing
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">{total} listing{total !== 1 ? 's' : ''} · page {page} of {lastPage}</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                              {p.images[0] ? (
                                <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home size={16} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.address}, {p.suburb}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.property_type}</td>
                        <td className="px-4 py-3 font-semibold text-[#16a34a] hidden sm:table-cell">{formatPrice(p)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => togglePerProp(p.id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#16a34a] px-2 py-1.5 rounded-lg hover:bg-[#16a34a]/5 transition-colors font-medium">
                              <MessageSquare size={12} />
                              {expandedId === p.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            <Link href={`/property/${p.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                              <ExternalLink size={14} />
                            </Link>
                            <Link href={`/dashboard/properties/${p.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-[#16a34a] hover:bg-[#16a34a]/10 rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </Link>
                            <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                              {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Inquiry expand rows */}
                {items.map((p) => expandedId === p.id && (
                  <div key={`inq-${p.id}`} className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {loadingPerProp === p.id ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                        <Loader2 size={14} className="animate-spin" /> Loading…
                      </div>
                    ) : (perPropInquiries[p.id] ?? []).length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">No inquiries for this listing yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {(perPropInquiries[p.id] ?? []).map((inq) => (
                          <div key={inq.id} className="bg-white rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">{inq.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${INQ_STATUS[inq.status] ?? 'bg-gray-100 text-gray-500'}`}>{inq.status}</span>
                              <span className="text-xs text-gray-400 capitalize">{inq.inquiry_type}</span>
                              <span className="text-xs text-gray-400 ml-auto">{new Date(inq.created_at).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <p className="text-gray-600 text-xs mb-2">{inq.message}</p>
                            <div className="flex gap-2">
                              <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-xs text-[#16a34a] font-medium hover:underline">
                                <Mail size={10} /> {inq.email}
                              </a>
                              {inq.phone && (
                                <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-xs text-gray-500 font-medium hover:underline">
                                  <Phone size={10} /> {inq.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Pagination current={page} last={lastPage} onChange={(p) => loadListings(p)} />
            </>
          )
        )}

        {/* Received Inquiries tab */}
        {tab === 'saved' && (
          loadingSaved ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse h-72" />)}
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Heart size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-700 font-bold text-lg">No saved properties yet</p>
              <p className="text-gray-400 text-sm mt-1">Tap the heart icon on any listing to save it here</p>
              <div className="flex gap-3 justify-center mt-5">
                <Link href="/buy" className="bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">Browse for sale</Link>
                <Link href="/rent" className="border border-gray-300 text-gray-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:border-gray-400 transition-colors">Browse rentals</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">{saved.length} saved {saved.length === 1 ? 'property' : 'properties'}</p>
                <button onClick={() => {
                  if (token) {
                    setLoadingSaved(true);
                    favoritesApi.list(token).then((p) => { if (p.length > 0) setSaved(p); }).catch(() => {}).finally(() => setLoadingSaved(false));
                  }
                }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#16a34a] transition-colors font-medium">
                  <RefreshCw size={11} /> Sync
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            </>
          )
        )}

        {tab === 'inquiries' && (
          fetchingInq ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : received.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No inquiries received yet</p>
              <p className="text-gray-400 text-sm mt-1">Inquiries from buyers will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{received.length} {received.length === 1 ? 'inquiry' : 'inquiries'} received</p>
                <button onClick={() => { setInqLoaded(false); loadInquiries(); }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#16a34a] transition-colors font-medium">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              {received.map((inq) => (
                <div key={inq.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      {inq.user?.avatar ? (
                        <img src={inq.user.avatar} alt={inq.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {inq.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{inq.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INQ_STATUS[inq.status] ?? 'bg-gray-100 text-gray-500'}`}>{inq.status}</span>
                        <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{inq.inquiry_type}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(inq.created_at).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {inq.property && (
                        <div className="flex items-center gap-1 mb-2">
                          <Home size={11} className="text-gray-400 shrink-0" />
                          <Link href={`/property/${inq.property.id}`}
                            className="text-xs text-[#16a34a] font-medium hover:underline truncate">
                            {inq.property.address}, {inq.property.suburb} — {inq.property.title}
                          </Link>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed">{inq.message}</p>
                      <div className="flex gap-2 mt-3">
                        <a href={`mailto:${inq.email}?subject=Re: ${inq.property ? `Inquiry about ${inq.property.address}` : 'Your Property Inquiry'}`}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-[#16a34a] text-white px-3 py-1.5 rounded-lg hover:bg-[#15803d] transition-colors">
                          <Mail size={11} /> Reply by email
                        </a>
                        {inq.phone && (
                          <a href={`tel:${inq.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-colors">
                            <Phone size={11} /> {inq.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        {tab === 'loans' && (
          loadingLoans ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24 animate-pulse" />)}</div>
          ) : myLoans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-700 font-bold text-lg">No loan applications yet</p>
              <p className="text-gray-400 text-sm mt-1">Apply for a home loan to track your applications here</p>
              <a href="/home-loans" className="inline-block mt-5 bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">Compare Loans</a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium mb-2">{myLoans.length} application{myLoans.length !== 1 ? "s" : ""}</p>
              {myLoans.map((loan) => {
                const logo = loan.selected_bank ? bankLogoMap[loan.selected_bank] : null;
                return (
                  <div key={loan.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {logo
                            ? <img src={logo} alt={loan.selected_bank ?? ""} className="w-full h-full object-contain p-1" />
                            : loan.selected_bank
                              ? <span className="font-black text-gray-400 text-base">{loan.selected_bank.charAt(0)}</span>
                              : <Building2 size={18} className="text-gray-300" />}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-tight">{loan.selected_bank ?? "Home Loan"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{PURPOSE_LABEL[loan.loan_purpose] ?? loan.loan_purpose}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${LOAN_STATUS_COLOR[loan.status] ?? "bg-gray-100 text-gray-600"}`}>{LOAN_STATUS_LABEL[loan.status] ?? loan.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-0 border-t border-gray-50 divide-x divide-gray-50 text-center">
                      <div className="py-3 px-2"><p className="text-xs text-gray-400">Loan Amount</p><p className="text-sm font-black text-gray-900 mt-0.5">{LKR_fmt(loan.loan_amount)}</p></div>
                      <div className="py-3 px-2"><p className="text-xs text-gray-400">Term</p><p className="text-sm font-black text-gray-900 mt-0.5">{loan.loan_term ? `${loan.loan_term} yrs` : "—"}</p></div>
                      <div className="py-3 px-2"><p className="text-xs text-gray-400">Submitted</p><p className="text-sm font-semibold text-gray-700 mt-0.5">{new Date(loan.created_at).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        {/* Profile & Branding tab */}
        {tab === 'profile' && (
          <div className="space-y-8">

            {/* Slider management */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-900">Banner / Slideshow</h3>
                  <p className="text-xs text-gray-400 mt-0.5">These images appear at the top of your public agent profile page</p>
                </div>
                <button
                  onClick={() => slideFileRef.current?.click()}
                  disabled={uploadingSlide}
                  className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                  {uploadingSlide ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingSlide ? 'Uploading…' : 'Upload Slide'}
                </button>
                <input ref={slideFileRef} type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden"
                  onChange={(e) => handleSlideUpload(e.target.files)} />
              </div>

              {slides.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No slides yet. Upload images to create a banner slideshow.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slides.map((slide) => (
                    <div key={slide.id} className="relative rounded-xl overflow-hidden border border-gray-100 group aspect-video bg-gray-100">
                      <img src={slide.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleSlideActive(slide)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${slide.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                          {slide.is_active ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => handleSlideDelete(slide.id)}
                          disabled={deletingSlideId === slide.id}
                          className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                          {deletingSlideId === slide.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                        </button>
                      </div>
                      {!slide.is_active && (
                        <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Hidden</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio & Social links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-1">About & Social Links</h3>
              <p className="text-xs text-gray-400 mb-5">Displayed on your public profile page</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Bio / About</label>
                  <textarea rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell buyers and sellers about yourself, your experience, and what areas you specialise in…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16a34a] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'facebook',  icon: FbIcon,        label: 'Facebook',  placeholder: 'username or full URL' },
                    { key: 'instagram', icon: IgIcon,        label: 'Instagram', placeholder: 'username or full URL' },
                    { key: 'linkedin',  icon: LiIcon,        label: 'LinkedIn',  placeholder: 'username or full URL' },
                    { key: 'twitter',   icon: TwIcon,        label: 'Twitter/X', placeholder: 'username or full URL' },
                    { key: 'whatsapp',  icon: MessageCircle, label: 'WhatsApp',  placeholder: 'Phone number with country code' },
                    { key: 'website',   icon: Globe,         label: 'Website',   placeholder: 'https://yoursite.com' },
                  ].map(({ key, icon: Icon, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                        <Icon size={12} /> {label}
                      </label>
                      <input
                        value={profileForm[key as keyof typeof profileForm]}
                        onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16a34a] transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {profileSaved && <p className="text-sm text-green-600 font-semibold">Saved successfully!</p>}
                  <div className="ml-auto">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
                      {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
