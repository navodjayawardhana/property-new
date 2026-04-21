"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bed, Bath, Car, MapPin, ArrowLeft, Phone, Mail, Heart, Share2, ChevronLeft, ChevronRight, Ruler } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties as propertiesApi, inquiries as inquiriesApi, type Property } from "@/lib/api";
import { formatPrice, getImageUrls } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type EnquiryForm = { name: string; email: string; phone: string; message: string };

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<EnquiryForm>({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  useEffect(() => {
    propertiesApi.get(id)
      .then(setProperty)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-[#121e80]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-gray-500 text-lg">Property not found.</p>
          <button onClick={() => router.back()} className="text-[#121e80] font-semibold hover:underline">
            Go back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getImageUrls(property);
  const prevImg = () => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setEnquiryError("Please fill in your name, email and message.");
      return;
    }
    setEnquiryError("");
    setSending(true);
    try {
      await inquiriesApi.submit(property.id, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
        inquiry_type: property.listing_type === "rent" ? "renting" : "buying",
      }, token ?? undefined);
      setEnquirySent(true);
    } catch {
      setEnquiryError("Failed to send enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm mb-4 transition-colors">
          <ArrowLeft size={15} /> Back to results
        </button>

        {/* Image gallery */}
        <div className="relative rounded-xl overflow-hidden h-64 md:h-[430px] bg-gray-100 mb-4">
          <img src={images[imgIndex]} alt={property.address} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {imgIndex + 1} / {images.length}
              </div>
            </>
          )}
          {property.listing_type === "sold" && (
            <div className="absolute top-4 left-4 bg-gray-900 text-white font-bold px-3 py-1.5 rounded text-sm">
              SOLD {property.sold_date ? new Date(property.sold_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : ""}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIndex(i)}
                className={`w-20 h-14 rounded overflow-hidden border-2 transition ${i === imgIndex ? "border-[#121e80]" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[#121e80] font-black text-3xl">{formatPrice(property)}</p>
                <h1 className="text-gray-900 font-bold text-xl mt-1">{property.address}</h1>
                <p className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                  <MapPin size={13} /> {property.suburb} {property.state} {property.postcode}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setSaved(!saved)}
                  className={`p-2 rounded-full border transition ${saved ? "bg-blue-50 border-[#121e80] text-[#121e80]" : "border-gray-300 text-gray-500 hover:border-gray-500"}`}>
                  <Heart size={17} fill={saved ? "#121e80" : "none"} />
                </button>
                <button className="p-2 rounded-full border border-gray-300 text-gray-500 hover:border-gray-500 transition">
                  <Share2 size={17} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 py-4 border-y border-gray-200 text-gray-700">
              <span className="flex items-center gap-2"><Bed size={19} className="text-gray-400" /><span className="font-bold">{property.beds}</span><span className="text-sm text-gray-500">Beds</span></span>
              <span className="flex items-center gap-2"><Bath size={19} className="text-gray-400" /><span className="font-bold">{property.baths}</span><span className="text-sm text-gray-500">Baths</span></span>
              <span className="flex items-center gap-2"><Car size={19} className="text-gray-400" /><span className="font-bold">{property.cars}</span><span className="text-sm text-gray-500">Cars</span></span>
              {property.land_size && (
                <span className="flex items-center gap-2"><Ruler size={19} className="text-gray-400" /><span className="font-bold">{property.land_size}</span><span className="text-sm text-gray-500">Land</span></span>
              )}
            </div>

            <div className="mt-4">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{property.property_type}</span>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">About this property</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-base font-bold text-gray-900 mb-3">Location</h2>
              <div className="bg-gray-100 rounded-xl h-44 flex items-center justify-center text-gray-400 text-sm gap-2">
                <MapPin size={18} /> {property.suburb}, {property.state} {property.postcode}
              </div>
            </div>
          </div>

          {/* Right — agent + enquiry */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-[#121e80] rounded-full flex items-center justify-center text-white font-bold">
                  {property.agent_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{property.agent_name}</p>
                  <p className="text-gray-400 text-xs">{property.agency_name}</p>
                </div>
              </div>

              {enquirySent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">✓</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">Enquiry sent!</p>
                  <p className="text-gray-400 text-xs mt-1">{property.agent_name} will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry}>
                  <p className="text-xs text-gray-500 mb-3 font-medium">Send an enquiry</p>

                  {enquiryError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-2">{enquiryError}</p>
                  )}

                  <input type="text" placeholder="Your name" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 outline-none focus:border-[#121e80] transition-colors" />
                  <input type="email" placeholder="Email address" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 outline-none focus:border-[#121e80] transition-colors" />
                  <input type="tel" placeholder="Phone number" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 outline-none focus:border-[#121e80] transition-colors" />
                  <textarea rows={3} placeholder="I am interested in this property..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 outline-none focus:border-[#121e80] transition-colors resize-none" />

                  <button type="submit" disabled={sending}
                    className="w-full bg-[#121e80] hover:bg-[#0d1660] disabled:opacity-60 text-white font-bold py-2.5 rounded transition-colors text-sm flex items-center justify-center gap-2">
                    {sending ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                      </svg>
                    ) : "Send enquiry"}
                  </button>
                </form>
              )}

              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1 border border-[#121e80] text-[#121e80] text-sm font-semibold py-2 rounded hover:bg-blue-50 transition-colors">
                  <Phone size={13} /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 border border-[#121e80] text-[#121e80] text-sm font-semibold py-2 rounded hover:bg-blue-50 transition-colors">
                  <Mail size={13} /> Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
