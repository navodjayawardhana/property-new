"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { properties as propertiesApi, inquiries as inquiriesApi, type Property, type Inquiry } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  Plus, Edit2, Trash2, Loader2, Home, TrendingUp, MessageSquare,
  ChevronDown, ChevronUp, ExternalLink, Phone, Mail, RefreshCw,
} from "lucide-react";

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

export default function AgentDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'listings' | 'inquiries'>('listings');
  const [items, setItems] = useState<Property[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [perPropInquiries, setPerPropInquiries] = useState<Record<number, Inquiry[]>>({});
  const [loadingPerProp, setLoadingPerProp] = useState<number | null>(null);

  const [received, setReceived] = useState<Inquiry[]>([]);
  const [fetchingInq, setFetchingInq] = useState(false);
  const [inqLoaded, setInqLoaded] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'agent' && user.role !== 'admin'))) {
      router.replace('/dashboard/buyer');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    propertiesApi.mine(token)
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [token]);

  useEffect(() => {
    if (tab === 'inquiries' && token && !inqLoaded) {
      loadInquiries();
    }
  }, [tab, token]);

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

  async function handleDelete(id: number) {
    if (!token || !confirm('Delete this listing permanently?')) return;
    setDeletingId(id);
    try {
      await propertiesApi.delete(id, token);
      setItems((prev) => prev.filter((p) => p.id !== id));
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
            className="flex items-center gap-2 bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={16} /> Add Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Listings', value: items.length, icon: Home, color: 'text-[#121e80]', bg: 'bg-[#121e80]/10' },
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
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'listings' ? 'border-[#121e80] text-[#121e80]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Home size={14} /> Client Listings
            {items.length > 0 && <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{items.length}</span>}
          </button>
          <button onClick={() => setTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'inquiries' ? 'border-[#121e80] text-[#121e80]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare size={14} /> Received Inquiries
            {pendingCount > 0 && <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          fetching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Home size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No client listings yet</p>
              <Link href="/dashboard/properties/new"
                className="inline-flex items-center gap-2 mt-5 bg-[#121e80] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#0d1660] transition-colors">
                <Plus size={14} /> Add listing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.address}, {p.suburb} · {formatPrice(p)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => togglePerProp(p.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#121e80] px-2 py-1.5 rounded-lg hover:bg-[#121e80]/5 transition-colors font-medium">
                        <MessageSquare size={12} />
                        {expandedId === p.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      <Link href={`/property/${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <ExternalLink size={14} />
                      </Link>
                      <Link href={`/dashboard/properties/${p.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-[#121e80] hover:bg-[#121e80]/10 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  {expandedId === p.id && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
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
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${INQ_STATUS[inq.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                  {inq.status}
                                </span>
                                <span className="text-xs text-gray-400 capitalize">{inq.inquiry_type}</span>
                                <span className="text-xs text-gray-400 ml-auto">{new Date(inq.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                              </div>
                              <p className="text-gray-600 text-xs mb-2">{inq.message}</p>
                              <div className="flex gap-2">
                                <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-xs text-[#121e80] font-medium hover:underline">
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
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Received Inquiries tab */}
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
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#121e80] transition-colors font-medium">
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
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INQ_STATUS[inq.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {inq.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{inq.inquiry_type}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(inq.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {inq.property && (
                        <div className="flex items-center gap-1 mb-2">
                          <Home size={11} className="text-gray-400 shrink-0" />
                          <Link href={`/property/${inq.property.id}`}
                            className="text-xs text-[#121e80] font-medium hover:underline truncate">
                            {inq.property.address}, {inq.property.suburb} — {inq.property.title}
                          </Link>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed">{inq.message}</p>
                      <div className="flex gap-2 mt-3">
                        <a href={`mailto:${inq.email}?subject=Re: ${inq.property ? `Inquiry about ${inq.property.address}` : 'Your Property Inquiry'}`}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-[#121e80] text-white px-3 py-1.5 rounded-lg hover:bg-[#0d1660] transition-colors">
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
      </div>

      <Footer />
    </div>
  );
}
