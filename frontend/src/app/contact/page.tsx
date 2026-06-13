"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.contact({ name: form.name, email: form.email, message: `Subject: ${form.subject}\n\n${form.message}` });
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
            <Image src="/GreenBrickLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-gray-900">Contact us</h1>
          <p className="text-gray-500 text-sm mt-1">We'd love to hear from you. Our team usually responds within 24 hours.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-black text-gray-900 text-lg mb-4">Get in touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "info@greenbricks.net" },
                  { icon: Phone, label: "Phone", value: "+94 11 234 5678" },
                  { icon: MapPin, label: "Address", value: "No. 42, Galle Road, Colombo 03, Sri Lanka" },
                  { icon: Clock, label: "Office hours", value: "Mon – Fri, 9:00 AM – 6:00 PM" },
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
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Quick links</h3>
              <div className="space-y-2">
                {[
                  { label: "Advertise your property", href: "/advertise" },
                  { label: "Find an agent", href: "/agents" },
                  { label: "Home loan enquiry", href: "/home-loans" },
                  { label: "Privacy centre", href: "/privacy-centre" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="block text-sm text-[#16a34a] hover:underline underline-offset-2">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-[#16a34a]" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message sent!</h3>
                <p className="text-sm text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
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
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                    <input required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
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
                    {loading ? "Sending…" : "Send message"}
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
