"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/lib/auth-context";
import { getSaved } from "@/lib/saved-properties";
import { inquiries as inquiriesApi, favorites as favoritesApi, type Inquiry, type Property } from "@/lib/api";
import {
  Heart, MessageSquare, Home, ExternalLink, Search, ArrowRight, RefreshCw,
} from "lucide-react";

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
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"saved" | "inquiries">("saved");

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
    if (tab === "inquiries" && token) {
      setLoadingInquiries(true);
      inquiriesApi.mine(token)
        .then(setMyInquiries)
        .catch(console.error)
        .finally(() => setLoadingInquiries(false));
    }
  }, [tab, token]);

  if (loading || !user) return null;

  const pendingInquiries = myInquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Buyer Dashboard</p>
            <h1 className="text-2xl font-black text-gray-900 mt-0.5">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/buy"
              className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
              <Search size={14} /> Browse properties
            </Link>
            <Link href="/agents"
              className="flex items-center gap-2 bg-[#16a34a] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#15803d] transition-colors">
              <ArrowRight size={14} /> Find an agent
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Saved Properties", value: saved.length, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
            { label: "My Inquiries", value: myInquiries.length, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button onClick={() => setTab("saved")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === "saved" ? "border-[#16a34a] text-[#16a34a]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Heart size={14} /> Saved Properties
            {saved.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-[#16a34a] text-white">{saved.length}</span>
            )}
          </button>
          <button onClick={() => setTab("inquiries")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === "inquiries" ? "border-[#16a34a] text-[#16a34a]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <MessageSquare size={14} /> My Inquiries
            {pendingInquiries > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-orange-500 text-white">{pendingInquiries}</span>
            )}
          </button>
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
      </div>

      <Footer />
    </div>
  );
}
