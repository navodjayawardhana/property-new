"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/lib/auth-context";
import { getSaved } from "@/lib/saved-properties";
import { inquiries as inquiriesApi, type Inquiry, type Property } from "@/lib/api";
import { Heart, MessageSquare, Home, ExternalLink } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export default function BuyerDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'saved' | 'inquiries'>('saved');
  const [saved, setSaved] = useState<Property[]>([]);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/signin');
  }, [loading, user, router]);

  useEffect(() => {
    setSaved(getSaved());
  }, []);

  useEffect(() => {
    if (tab === 'inquiries' && token) {
      setLoadingInquiries(true);
      inquiriesApi.mine(token)
        .then(setMyInquiries)
        .catch(console.error)
        .finally(() => setLoadingInquiries(false));
    }
  }, [tab, token]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Buyer Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Welcome back, {user.name.split(' ')[0]}</h1>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button onClick={() => setTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'saved' ? 'border-[#121e80] text-[#121e80]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Heart size={14} /> Saved Properties
            {saved.length > 0 && <span className="bg-[#121e80] text-white text-xs px-1.5 py-0.5 rounded-full">{saved.length}</span>}
          </button>
          <button onClick={() => setTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${tab === 'inquiries' ? 'border-[#121e80] text-[#121e80]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare size={14} /> My Inquiries
          </button>
        </div>

        {tab === 'saved' && (
          <>
            {saved.length === 0 ? (
              <div className="text-center py-20">
                <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No saved properties yet</p>
                <p className="text-gray-400 text-sm mt-1">Tap the heart icon on any listing to save it here</p>
                <div className="flex gap-3 justify-center mt-5">
                  <Link href="/buy" className="bg-[#121e80] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#0d1660] transition-colors">Browse for sale</Link>
                  <Link href="/rent" className="border border-gray-300 text-gray-700 text-sm font-bold px-5 py-2 rounded-full hover:border-gray-500 transition-colors">Browse rentals</Link>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{saved.length} saved {saved.length === 1 ? 'property' : 'properties'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'inquiries' && (
          <>
            {loadingInquiries ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : myInquiries.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No inquiries yet</p>
                <p className="text-gray-400 text-sm mt-1">Your messages to agents will appear here</p>
                <Link href="/buy" className="inline-block mt-5 bg-[#121e80] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#0d1660] transition-colors">
                  Browse properties
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myInquiries.map((inq) => (
                  <div key={inq.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#121e80]/10 flex items-center justify-center shrink-0">
                      <Home size={16} className="text-[#121e80]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {inq.property ? `${inq.property.address}, ${inq.property.suburb}` : `Property #${inq.property_id}`}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[inq.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {inq.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{inq.inquiry_type}</span>
                      </div>
                      {inq.property && (
                        <p className="text-xs text-gray-400 mt-0.5">{inq.property.title}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{inq.message}</p>
                      <p className="text-xs text-gray-400 mt-1.5">{new Date(inq.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <Link href={`/property/${inq.property_id}`} className="text-gray-400 hover:text-[#121e80] transition-colors shrink-0">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
