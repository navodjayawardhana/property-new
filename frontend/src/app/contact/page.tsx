"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Mail, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/api";

const SUBJECTS = [
  "General Enquiry",
  "List a Property",
  "Agent Registration",
  "Advertising",
  "Report an Issue",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.contact({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message,
      });
      setSent(true);
    } catch {
      setError("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Image src="/GreenBricksLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-gray-900">We are here to help.</h1>
          <p className="text-gray-500 text-sm mt-1">Get in touch with the Greenbricks team.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Info sidebar */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Whether you are a property seeker, an agent, a developer, or simply have a question about how Greenbricks works — we would love to hear from you. Fill in the form and our team will get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Mail,    label: "Email",    value: "info@greenbricks.net" },
                  { icon: MapPin,  label: "Location", value: "Sri Lanka" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#16a34a]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  </div>
                ))}
                {/* Social */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#16a34a]">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Facebook</p>
                    <Link href="https://web.facebook.com/greenbricksl/" target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#16a34a] hover:underline underline-offset-2">
                      facebook.com/greenbricksl
                    </Link>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#16a34a]">
                      <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.216 4 20 5.784 20 7.75v8.5C20 18.216 18.216 20 16.25 20h-8.5C5.784 20 4 18.216 4 16.25v-8.5C4 5.784 5.784 4 7.75 4zm9.25 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Instagram</p>
                    <Link href="https://www.instagram.com/greenbricksl/" target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#16a34a] hover:underline underline-offset-2">
                      instagram.com/greenbricksl
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* For agents */}
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2">For Agents &amp; Developers</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Interested in listing your properties on Greenbricks or advertising on the platform? Visit our Advertise With Us page for packages and pricing details.
              </p>
              <Link href="/advertise" className="text-xs font-semibold text-[#16a34a] hover:underline underline-offset-2">
                Advertise with us →
              </Link>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              We aim to respond to all enquiries within 1–2 business days. For urgent matters, please reach out via our social media channels.
            </p>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-[#16a34a]" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message sent!</h3>
                <p className="text-sm text-gray-500 mb-6">Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="text-sm font-semibold text-[#16a34a] hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="font-black text-gray-900 text-lg mb-6">Send us a message</h2>
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
                      <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
                      <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@email.com"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+94 77 000 0000"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                      <select required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors bg-white">
                        <option value="" disabled>Select a subject</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us more about your enquiry…"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm flex items-center gap-2">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
