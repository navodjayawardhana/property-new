"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bed, Bath, Car, MapPin, ArrowLeft, Phone, Mail, Heart, Share2,
  ChevronLeft, ChevronRight, Ruler, CheckCircle, Loader2, User as UserIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { properties as propertiesApi, inquiries as inquiriesApi, type Property } from "@/lib/api";
import { formatPrice, getImageUrls } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { isSaved, toggleSaved } from "@/lib/saved-properties";

type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type: 'buying' | 'renting' | 'general';
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<EnquiryForm>({
    name: "", email: "", phone: "", message: "",
    inquiry_type: "buying",
  });
  const [sending, setSending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  useEffect(() => {
    propertiesApi.get(id)
      .then((p) => {
        setProperty(p);
        setSaved(isSaved(p.id));
        setForm((f) => ({ ...f, inquiry_type: p.listing_type === "rent" ? "renting" : "buying" }));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email ?? "", phone: user.phone ?? "" }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-[#16a34a]" />
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
          <button onClick={() => router.back()} className="text-[#16a34a] font-semibold hover:underline">Go back</button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getImageUrls(property);
  const prevImg = () => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const owner = property.user;
  const ownerPhone = owner?.phone?.replace(/\s/g, '') ?? null;
  const ownerEmail = owner?.email ?? null;

  const handleSave = () => {
    const nowSaved = toggleSaved(property);
    setSaved(nowSaved);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
    }
  };

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
        inquiry_type: form.inquiry_type,
      }, token ?? undefined);
      setEnquirySent(true);
    } catch {
      setEnquiryError("Failed to send enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16a34a] transition-colors";

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
              <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
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
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIndex(i)}
                className={`w-20 h-14 shrink-0 rounded overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-[#16a34a]" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — property details */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[#16a34a] font-black text-3xl">{formatPrice(property)}</p>
                <h1 className="text-gray-900 font-bold text-xl mt-1">{property.address}</h1>
                <p className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                  <MapPin size={13} /> {property.suburb} {property.state} {property.postcode}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleSave}
                  className={`p-2 rounded-full border transition-colors ${saved ? "bg-red-50 border-red-300 text-red-500" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}
                  title={saved ? "Remove from saved" : "Save property"}>
                  <Heart size={17} fill={saved ? "currentColor" : "none"} />
                </button>
                <button onClick={handleShare}
                  className="p-2 rounded-full border border-gray-300 text-gray-500 hover:border-gray-400 transition-colors relative"
                  title="Copy link">
                  <Share2 size={17} />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 py-4 border-y border-gray-200 text-gray-700">
              <span className="flex items-center gap-2">
                <Bed size={19} className="text-gray-400" /><span className="font-bold">{property.beds}</span><span className="text-sm text-gray-500">Beds</span>
              </span>
              <span className="flex items-center gap-2">
                <Bath size={19} className="text-gray-400" /><span className="font-bold">{property.baths}</span><span className="text-sm text-gray-500">Baths</span>
              </span>
              <span className="flex items-center gap-2">
                <Car size={19} className="text-gray-400" /><span className="font-bold">{property.cars}</span><span className="text-sm text-gray-500">Cars</span>
              </span>
              {property.land_size && (
                <span className="flex items-center gap-2">
                  <Ruler size={19} className="text-gray-400" /><span className="font-bold">{property.land_size}</span><span className="text-sm text-gray-500">Land</span>
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{property.property_type}</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full capitalize">{property.listing_type === 'buy' ? 'For sale' : property.listing_type === 'rent' ? 'For rent' : 'Sold'}</span>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">About this property</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-base font-bold text-gray-900 mb-3">Location</h2>
              <div className="bg-gray-100 rounded-xl h-44 flex items-center justify-center text-gray-400 text-sm gap-2">
                <MapPin size={18} /> {property.address}, {property.suburb}, {property.state} {property.postcode}
              </div>
            </div>
          </div>

          {/* Right — agent card + enquiry form */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">

              {/* Agent info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                  {owner?.avatar ? (
                    <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#16a34a] flex items-center justify-center text-white font-bold">
                      {(owner?.name ?? property.agent_name).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{property.agent_name}</p>
                  <p className="text-gray-400 text-xs truncate">{property.agency_name}</p>
                </div>
              </div>

              {/* Call & Email action buttons */}
              <div className="flex gap-2 mb-4">
                {ownerPhone ? (
                  <a href={`tel:${ownerPhone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                    <Phone size={13} /> Call
                  </a>
                ) : (
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed">
                    <Phone size={13} /> Call
                  </button>
                )}

                {ownerEmail ? (
                  <a href={`mailto:${ownerEmail}?subject=${encodeURIComponent(`Inquiry: ${property.address}`)}&body=${encodeURIComponent(`Hi ${property.agent_name},\n\nI am interested in the property at ${property.address}, ${property.suburb} ${property.state} ${property.postcode}.\n\nPlease contact me at your earliest convenience.\n\nThank you.`)}`}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a]/5 text-sm font-semibold py-2.5 rounded-lg transition-colors">
                    <Mail size={13} /> Email
                  </a>
                ) : (
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed">
                    <Mail size={13} /> Email
                  </button>
                )}
              </div>

              {/* Enquiry form */}
              {enquirySent ? (
                <div className="text-center py-5 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-gray-900 text-sm">Enquiry sent!</p>
                  <p className="text-gray-500 text-xs mt-1">{property.agent_name} will be in touch soon.</p>
                  <p className="text-gray-400 text-xs mt-0.5">A notification has been sent to the agent.</p>
                  <button onClick={() => setEnquirySent(false)} className="mt-3 text-xs text-[#16a34a] font-semibold hover:underline">
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquiry}>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Send an enquiry</p>

                  {enquiryError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-2">{enquiryError}</p>
                  )}

                  <div className="space-y-2">
                    <input type="text" placeholder="Your name *" required value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={inp} />
                    <input type="email" placeholder="Email address *" required value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={inp} />
                    <input type="tel" placeholder="Phone number" value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={inp} />

                    <select value={form.inquiry_type}
                      onChange={(e) => setForm((f) => ({ ...f, inquiry_type: e.target.value as EnquiryForm['inquiry_type'] }))}
                      className={inp}>
                      <option value="buying">Buying</option>
                      <option value="renting">Renting</option>
                      <option value="general">General enquiry</option>
                    </select>

                    <textarea rows={3} placeholder="I am interested in this property..." required
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className={inp + " resize-none"} />
                  </div>

                  <button type="submit" disabled={sending}
                    className="w-full mt-3 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : null}
                    {sending ? "Sending…" : "Send enquiry"}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    By submitting you agree to be contacted about this property.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
