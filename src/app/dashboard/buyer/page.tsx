"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/lib/auth-context";
import { getSaved } from "@/lib/saved-properties";
import { inquiries as inquiriesApi, favorites as favoritesApi, loanEnquiries as loanEnqApi, bankLoanRatesApi, profile as profileApi, type Inquiry, type Property, type LoanEnquiry } from "@/lib/api";
import { COUNTRY_CODES, parsePhone } from "@/lib/countries";
import {
  Heart, MessageSquare, Home, ExternalLink, Search, ArrowRight, RefreshCw, Building2,
  Camera, Trash2, Check, Eye, EyeOff, Shield, ChevronDown, Loader2, MapPin, Mail, User as UserIcon, Clock, Settings, LogOut, Menu, X,
} from "lucide-react";

const LOAN_STATUS_COLOR: Record<string, string> = {
  new:          "bg-gray-100 text-gray-600",
  in_review:    "bg-blue-100 text-blue-700",
  pre_approved: "bg-green-100 text-green-700",
  declined:     "bg-red-100 text-red-600",
};
const LOAN_STATUS_LABEL: Record<string, string> = {
  new: "New", in_review: "In Review", pre_approved: "Pre-Approved", declined: "Declined",
};
const PURPOSE_LABEL: Record<string, string> = {
  buy_home: "Buy a Home", investment: "Investment", refinance: "Refinance",
};
const LKR = (n: number) =>
  Math.round(n).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const INQUIRY_TYPE_COLOR: Record<string, string> = {
  general: "bg-gray-100 text-gray-600",
  inspection: "bg-purple-100 text-purple-700",
  offer: "bg-teal-100 text-teal-700",
  buying: "bg-blue-100 text-blue-700",
  renting: "bg-teal-100 text-teal-700",
};

export default function BuyerDashboard() {
  const { user, token, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"saved" | "inquiries" | "loans" | "profile" | "settings">("saved");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile state
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+94");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [suburb, setSuburb] = useState("");
  const [userState, setUserState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [myLoans, setMyLoans] = useState<LoanEnquiry[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [bankLogoMap, setBankLogoMap] = useState<Record<string, string | null>>({});

  const [saved, setSaved] = useState<Property[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

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
    if (tab === "loans" && token) {
      setLoadingLoans(true);
      Promise.all([
        loanEnqApi.mine(token),
        bankLoanRatesApi.list(),
      ]).then(([loans, rates]) => {
        setMyLoans(loans);
        const map: Record<string, string | null> = {};
        rates.forEach((r) => { map[r.bank_name] = r.logo_url; });
        setBankLogoMap(map);
      }).catch(() => {}).finally(() => setLoadingLoans(false));
    }
  }, [tab, token]);

  useEffect(() => {
    if (tab === "inquiries" && token) {
      setLoadingInquiries(true);
      inquiriesApi.mine(token)
        .then(setMyInquiries)
        .catch(console.error)
        .finally(() => setLoadingInquiries(false));
    }
  }, [tab, token]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email ?? "");
    if (user.phone) {
      const { dialCode, number } = parsePhone(user.phone);
      setPhoneDialCode(dialCode);
      setPhoneNumber(number);
    }
    setSuburb(user.suburb ?? "");
    setUserState(user.state ?? "");
    setPostcode(user.postcode ?? "");
    setCountry(user.country ?? "");
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarLoading(true);
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      updateUser(await profileApi.uploadAvatar(fd, token));
      setAvatarPreview(null);
    } catch (err: unknown) {
      setAvatarPreview(null);
      alert((err as Error).message ?? "Upload failed");
    } finally {
      setAvatarLoading(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    if (!token || !user?.avatar) return;
    if (!confirm("Remove your profile photo?")) return;
    setAvatarLoading(true);
    try { updateUser(await profileApi.deleteAvatar(token)); }
    catch { /* ignore */ }
    finally { setAvatarLoading(false); }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileMsg(null);
    const rawNumber = phoneNumber.trim().replace(/^0+/, "");
    try {
      updateUser(await profileApi.update({
        name, email,
        phone:    rawNumber ? `${phoneDialCode}${rawNumber}` : null,
        suburb:   suburb    || null,
        state:    userState || null,
        postcode: postcode  || null,
        country:  country   || null,
      }, token));
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setProfileMsg({ type: "err", text: e.errors ? Object.values(e.errors).flat().join(" · ") : (e.message ?? "Update failed") });
    } finally { setSavingProfile(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPw !== confirmPw) { setPwMsg({ type: "err", text: "New passwords do not match." }); return; }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await profileApi.updatePassword({ current_password: currentPw, password: newPw, password_confirmation: confirmPw }, token);
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> };
      setPwMsg({ type: "err", text: e.errors ? Object.values(e.errors).flat().join(" · ") : (e.message ?? "Failed to change password") });
    } finally { setSavingPw(false); }
  }

  if (loading || !user) return null;

  const pendingInquiries = myInquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <Navbar />

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
              <UserAvatar src={user.avatar ?? null} name={user.name} avatarBg="bg-[#16a34a]" textSize="text-xl" />
            </div>
            <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
            <span className="text-xs text-green-400 font-semibold capitalize mt-0.5 block">{user.role}</span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <button
              onClick={() => { setTab("saved"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "saved" ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Heart size={16} className="shrink-0" />
              <span className="flex-1 text-left">Saved Properties</span>
              {saved.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "saved" ? "bg-white/20 text-white" : "bg-slate-600 text-slate-300"}`}>
                  {saved.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setTab("inquiries"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "inquiries" ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="flex-1 text-left">My Inquiries</span>
              {pendingInquiries > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "inquiries" ? "bg-white/20 text-white" : "bg-slate-600 text-slate-300"}`}>
                  {pendingInquiries}
                </span>
              )}
            </button>
            <button
              onClick={() => { setTab("loans"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "loans" ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Building2 size={16} className="shrink-0" />
              <span className="flex-1 text-left">Loan Applications</span>
              {myLoans.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "loans" ? "bg-white/20 text-white" : "bg-slate-600 text-slate-300"}`}>
                  {myLoans.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setTab("profile"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "profile" ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <UserIcon size={16} className="shrink-0" />
              <span className="flex-1 text-left">Profile</span>
            </button>
            <button
              onClick={() => { setTab("settings"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === "settings" ? "bg-[#16a34a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={16} className="shrink-0" />
              <span className="flex-1 text-left">Settings</span>
            </button>
          </nav>

          {/* Bottom links */}
          <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-0.5">
            <Link href="/buy" onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <Search size={16} className="shrink-0" /> Browse Properties
            </Link>
            <Link href="/home-loans" onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <Building2 size={16} className="shrink-0" /> Compare Loans
            </Link>
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
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium hidden sm:block">Buyer Dashboard</p>
                <h1 className="text-base sm:text-xl font-black text-gray-900">Welcome, {user.name.split(" ")[0]}</h1>
              </div>
            </div>
            <Link href="/agents" className="flex items-center gap-2 bg-[#16a34a] text-white text-sm font-bold px-3 sm:px-4 py-2 rounded-xl hover:bg-[#15803d] transition-colors shrink-0">
              <ArrowRight size={14} /> <span className="hidden sm:inline">Find an Agent</span>
            </Link>
          </div>

          <div className="p-4 lg:p-6 flex-1">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Heart size={18} className="text-red-500" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">All time</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{saved.length}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Saved Properties</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MessageSquare size={18} className="text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">All time</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{myInquiries.length}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">My Inquiries</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-orange-500" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">All time</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{pendingInquiries}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Pending</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-[#16a34a]" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">All time</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{myLoans.length}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Loan Apps</p>
              </div>
            </div>

        {/* ── Saved tab ─────────────────────────────────────────────────────── */}
        {tab === "saved" && (
          loadingSaved ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse h-72" />
              ))}
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
                <p className="text-sm text-gray-500 font-medium">
                  {saved.length} saved {saved.length === 1 ? "property" : "properties"}
                </p>
                <button
                  onClick={() => {
                    if (token) {
                      setLoadingSaved(true);
                      favoritesApi.list(token)
                        .then((props) => { if (props.length > 0) setSaved(props); })
                        .catch(() => {})
                        .finally(() => setLoadingSaved(false));
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#16a34a] transition-colors font-medium"
                >
                  <RefreshCw size={11} /> Sync
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            </>
          )
        )}

        {/* ── Inquiries tab ─────────────────────────────────────────────────── */}
        {tab === "inquiries" && (
          loadingInquiries ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : myInquiries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-700 font-bold text-lg">No inquiries yet</p>
              <p className="text-gray-400 text-sm mt-1">Your messages to agents and sellers will appear here</p>
              <Link href="/buy" className="inline-block mt-5 bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium mb-4">
                {myInquiries.length} {myInquiries.length === 1 ? "inquiry" : "inquiries"} sent
              </p>
              {myInquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {(inq.property as (typeof inq.property & { images?: { url: string }[] }))?.images?.[0] ? (
                      <img
                        src={(inq.property as (typeof inq.property & { images?: { url: string }[] }))!.images![0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">
                          {inq.property ? `${inq.property.address}, ${inq.property.suburb}` : `Property #${inq.property_id}`}
                        </p>
                        {inq.property && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{inq.property.title}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[inq.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {inq.status}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${INQUIRY_TYPE_COLOR[inq.inquiry_type] ?? "bg-gray-100 text-gray-600"}`}>
                          {inq.inquiry_type}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{inq.message}</p>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Sent {new Date(inq.created_at).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <Link href={`/property/${inq.property_id}`}
                        className="flex items-center gap-1 text-xs font-semibold text-[#16a34a] hover:underline">
                        View listing <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Loan Applications tab ─────────────────────────────────────────── */}
        {tab === "loans" && (
          loadingLoans ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24 animate-pulse" />)}
            </div>
          ) : myLoans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-700 font-bold text-lg">No loan applications yet</p>
              <p className="text-gray-400 text-sm mt-1">Apply for a home loan to track your applications here</p>
              <Link href="/home-loans" className="inline-block mt-5 bg-[#16a34a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">
                Compare Loans
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium mb-2">{myLoans.length} application{myLoans.length !== 1 ? "s" : ""}</p>
              {myLoans.map((loan) => {
                const logo = loan.selected_bank ? bankLogoMap[loan.selected_bank] : null;
                return (
                  <div key={loan.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
                      <div className="flex items-center gap-3">
                        {/* Bank logo */}
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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${LOAN_STATUS_COLOR[loan.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {LOAN_STATUS_LABEL[loan.status] ?? loan.status}
                      </span>
                    </div>
                    {/* Card stats */}
                    <div className="grid grid-cols-3 gap-0 border-t border-gray-50 divide-x divide-gray-50 text-center">
                      <div className="py-3 px-2">
                        <p className="text-xs text-gray-400">Loan Amount</p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">{LKR(loan.loan_amount)}</p>
                      </div>
                      <div className="py-3 px-2">
                        <p className="text-xs text-gray-400">Term</p>
                        <p className="text-sm font-black text-gray-900 mt-0.5">{loan.loan_term ? `${loan.loan_term} yrs` : "—"}</p>
                      </div>
                      <div className="py-3 px-2">
                        <p className="text-xs text-gray-400">Submitted</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{new Date(loan.created_at).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <div className="space-y-5">
            {/* Avatar banner card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-[#16a34a] to-[#15803d]" />
              <div className="px-6 pb-5">
                {/* Avatar + action buttons row */}
                <div className="flex items-start justify-between -mt-10 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#16a34a] border-4 border-white shadow-lg flex items-center justify-center">
                      <UserAvatar src={avatarPreview ?? user.avatar} name={user.name} avatarBg="bg-[#16a34a]" textSize="text-2xl" />
                    </div>
                    {avatarLoading && (
                      <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                        <Loader2 size={18} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-12">
                    <button type="button" onClick={() => avatarRef.current?.click()} disabled={avatarLoading}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#16a34a] text-white px-3 py-2 rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-50">
                      <Camera size={13} /> Change photo
                    </button>
                    {user.avatar && (
                      <button type="button" onClick={handleRemoveAvatar} disabled={avatarLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                </div>
                {/* Name + role below avatar */}
                <p className="font-black text-gray-900 text-lg leading-tight">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-[#16a34a] bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full capitalize">{user.role}</span>
                  {user.email && <span className="text-xs text-gray-400">{user.email}</span>}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Personal info + Location form */}
            <form onSubmit={handleSaveProfile}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Section: Personal Info */}
                <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#16a34a]/10 rounded-lg flex items-center justify-center shrink-0">
                    <UserIcon size={13} className="text-[#16a34a]" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Personal Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input required className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input required type="email" className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0">
                        <select value={phoneDialCode} onChange={(e) => setPhoneDialCode(e.target.value)}
                          className="h-full pl-3 pr-7 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] bg-white appearance-none cursor-pointer" style={{ minWidth: "88px" }}>
                          {COUNTRY_CODES.map((c) => <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <input type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="400 000 000" />
                    </div>
                  </div>
                </div>

                {/* Section: Location */}
                <div className="px-6 py-3.5 border-y border-gray-100 bg-gray-50/60 flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Location</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                    <div className="relative">
                      <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white appearance-none pr-9 cursor-pointer" value={country} onChange={(e) => setCountry(e.target.value)}>
                        <option value="">Select country</option>
                        {COUNTRY_CODES.map((c) => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State / Region</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={userState} onChange={(e) => setUserState(e.target.value)} placeholder="e.g. Western" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Postcode</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="e.g. 10100" maxLength={10} />
                  </div>
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Suburb / City</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Colombo 03" />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
                  {profileMsg ? (
                    <p className={`text-sm font-medium ${profileMsg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{profileMsg.text}</p>
                  ) : <span />}
                  <button type="submit" disabled={savingProfile}
                    className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shrink-0">
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Settings tab ── */}
        {tab === "settings" && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#16a34a]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-[#16a34a]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Change Password</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Use a strong password you don&apos;t use elsewhere</p>
                </div>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                    <div className="relative">
                      <input required type={showPw ? "text" : "password"} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white pr-10" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                    <input required type={showPw ? "text" : "password"} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" minLength={8} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input required type={showPw ? "text" : "password"} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all bg-white" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
                  {pwMsg ? (
                    <p className={`text-sm font-medium ${pwMsg.type === "ok" ? "text-green-600" : "text-red-600"}`}>{pwMsg.text}</p>
                  ) : <span />}
                  <button type="submit" disabled={savingPw}
                    className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shrink-0">
                    {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />} Update password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
}
