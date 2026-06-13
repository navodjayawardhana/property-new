"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { auth } from "@/lib/api";

const footerTabs = ["Real estate", "New homes", "Popular areas", "Popular searches"] as const;

const realEstateLinks = [
  "Real estate Colombo", "Real estate Gampaha", "Real estate Kalutara",
  "Real estate Kandy", "Real estate Matale", "Real estate Nuwara Eliya",
  "Real estate Galle", "Real estate Matara", "Real estate Hambantota",
  "Real estate Jaffna", "Real estate Kilinochchi", "Real estate Mannar",
  "Real estate Mullaitivu", "Real estate Vavuniya", "Real estate Trincomalee",
  "Real estate Batticaloa", "Real estate Ampara", "Real estate Kurunegala",
  "Real estate Puttalam", "Real estate Anuradhapura", "Real estate Polonnaruwa",
  "Real estate Badulla", "Real estate Monaragala", "Real estate Ratnapura",
  "Real estate Kegalle",
];

const newHomesLinks = [
  "New apartments Colombo", "New apartments Kandy", "New apartments Galle", "New apartments Negombo",
  "House & land packages Colombo", "House & land packages Kandy", "House & land packages Gampaha",
  "Display homes Colombo", "Display homes Negombo", "Display homes Kandy",
  "Off-the-plan Colombo", "Off-the-plan Kandy", "Off-the-plan Galle",
  "New townhouses Colombo", "New villas Colombo", "New villas Galle",
  "Luxury apartments Colombo", "Condominiums Colombo", "Penthouses Colombo",
  "Serviced apartments Colombo", "Studio apartments Colombo", "Project homes Colombo",
];

const popularAreas = [
  "Colombo 1 – Fort", "Colombo 2 – Slave Island", "Colombo 3 – Kollupitiya", "Colombo 4 – Bambalapitiya",
  "Colombo 5 – Havelock Town", "Colombo 6 – Wellawatta", "Colombo 7 – Cinnamon Gardens", "Colombo 8 – Borella",
  "Colombo 10 – Maradana", "Colombo 11 – Pettah", "Colombo 15 – Modera",
  "Maharagama", "Nugegoda", "Thalawathugoda", "Kottawa", "Piliyandala",
  "Moratuwa", "Dehiwala", "Mount Lavinia", "Nawala", "Battaramulla",
  "Malabe", "Kaduwela", "Sri Jayawardenepura Kotte", "Homagama",
  "Negombo", "Wattala", "Ja-Ela", "Kelaniya", "Gampaha",
  "Kandy", "Peradeniya", "Galle", "Matara", "Hikkaduwa", "Unawatuna",
];

const popularSearches = [
  "Houses for sale", "Apartments for sale", "Townhouses for sale", "Villas for sale",
  "Land for sale", "Commercial property for sale", "Industrial property for sale",
  "Houses for rent", "Apartments for rent", "Villas for rent", "Townhouses for rent",
  "Office space for rent", "Shop for rent", "Warehouse for rent",
  "New homes", "Off-the-plan", "House and land packages", "Display homes",
  "Luxury properties", "Waterfront properties", "Beachfront homes", "Rural properties",
  "Investment properties", "Property management", "Farms for sale",
];

const tabLinks: Record<string, string[]> = {
  "Real estate": realEstateLinks,
  "New homes": newHomesLinks,
  "Popular areas": popularAreas,
  "Popular searches": popularSearches,
};

const tabHeadings: Record<string, string> = {
  "Real estate": "Real estate in Sri Lanka",
  "New homes": "New homes in Sri Lanka",
  "Popular areas": "Popular areas in Sri Lanka",
  "Popular searches": "Popular searches",
};

const SOCIAL = [
  { label: "Facebook", href: "https://web.facebook.com/greenbricksl/", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: "https://www.instagram.com/greenbricksl/", path: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.216 4 20 5.784 20 7.75v8.5C20 18.216 18.216 20 16.25 20h-8.5C5.784 20 4 18.216 4 16.25v-8.5C4 5.784 5.784 4 7.75 4zm9.25 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" },
  { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
];


export default function Footer() {
  const [activeTab, setActiveTab] = useState<(typeof footerTabs)[number]>("Real estate");
  const links = tabLinks[activeTab];
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");

  function handleAdvertise() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("highlightPostAd"));
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactLoading(true);
    setContactError("");
    try {
      await auth.contact(contactForm);
      setContactSent(true);
    } catch {
      setContactError("Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <>
      <footer className="bg-white mt-12">

        {/* ── Tabbed link section ── */}
        <div className="border-t border-gray-200 w-full">
          {/* Tab bar — equal-width buttons spanning full width */}
          <div className="w-full border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full">
                {footerTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-semibold text-center whitespace-nowrap border-b-2 transition-colors -mb-px ${
                    activeTab === tab
                      ? "border-[#16a34a] text-gray-900 bg-green-50/40"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="max-w-7xl mx-auto px-4 py-7">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{tabHeadings[activeTab]}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-2.5 gap-x-6">
              {links.map((link) => (
                <Link key={link} href="/"
                  className="text-sm text-gray-700 hover:text-[#16a34a] hover:underline underline-offset-2 break-words ">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Social + utility bar ── */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ label, path, href }) => (
                <Link key={label} href={href ?? "/"} target={href ? "_blank" : undefined}
                  rel={href ? "noopener noreferrer" : undefined} aria-label={label}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d={path} />
                  </svg>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/advertise"
                className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
                Advertise with us
              </Link>
              <Link href="/contact"
                className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
                Contact us
              </Link>
              {[
                { label: "Agent admin", href: "/agent-admin" },
                { label: "Legal", href: "/legal" },
                { label: "Privacy settings", href: "/privacy-settings" },
                { label: "Privacy centre", href: "/privacy-centre" },
                { label: "Careers", href: "/careers" },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Network & bottom ── */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="space-y-1.5 text-xs text-gray-500 mb-4">
              <div className="flex flex-wrap items-center gap-x-1">
                <span className="font-semibold text-gray-700 mr-1">International sites</span>
                {[{ label: "Sri Lanka" }, { label: "Australia" }, { label: "United Arab Emirates" }].map(({ label }, i, arr) => (
                  <span key={label} className="flex items-center gap-x-1">
                    <Link href="/" className="text-gray-700 hover:text-[#16a34a] hover:underline underline-offset-2 transition-colors">{label}</Link>
                    {i < arr.length - 1 && <span className="text-gray-300">|</span>}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              © {new Date().getFullYear()} Greenbricks.net. All rights reserved.{" "}
              By accessing or using our platform, you agree to our{" "}
              <Link href="/" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Terms of Use</Link>
              {" "}and{" "}
              <Link href="/" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Privacy Policy</Link>.
              {" "}Developed by{" "}
              <Link href="http://esupport.live/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">eSupport</Link>.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Contact modal ── */}
      {contactOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setContactOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
              <X size={18} />
            </button>
            {contactSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-[#16a34a]" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">Message sent!</h3>
                <p className="text-sm text-gray-500 mb-5">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setContactOpen(false)}
                  className="bg-[#16a34a] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-black text-gray-900 mb-1">Contact us</h3>
                <p className="text-xs text-gray-400 mb-5">We'd love to hear from you. Send us a message and we'll respond shortly.</p>
                <div className="flex flex-col gap-3 mb-5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><Mail size={13} className="text-[#16a34a]" /> info@greenbrick.net</div>
                  <div className="flex items-center gap-2"><Phone size={13} className="text-[#16a34a]" /> +94 11 234 5678</div>
                  <div className="flex items-center gap-2"><MapPin size={13} className="text-[#16a34a]" /> Colombo 03, Sri Lanka</div>
                </div>
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  {contactError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{contactError}</p>
                  )}
                  <input required value={contactForm.name}
                    onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                  <input required type="email" value={contactForm.email}
                    onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email address"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                  <textarea required rows={4} value={contactForm.message}
                    onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Your message"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16a34a] transition-colors resize-none" />
                  <button type="submit" disabled={contactLoading}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    {contactLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {contactLoading ? "Sending…" : "Send message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
