"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const SETTINGS = [
  {
    id: "essential",
    title: "Essential cookies",
    desc: "Required for the platform to function. These cannot be disabled.",
    locked: true,
    default: true,
  },
  {
    id: "analytics",
    title: "Analytics & performance",
    desc: "Help us understand how visitors interact with the platform so we can improve it.",
    locked: false,
    default: true,
  },
  {
    id: "personalisation",
    title: "Personalisation",
    desc: "Allow us to remember your preferences and show personalised property recommendations.",
    locked: false,
    default: true,
  },
  {
    id: "marketing",
    title: "Marketing & advertising",
    desc: "Enable relevant property ads from Greenbricks.net and our advertising partners.",
    locked: false,
    default: false,
  },
  {
    id: "thirdparty",
    title: "Third-party integrations",
    desc: "Allow third-party services (e.g. maps, mortgage calculators) to function on this platform.",
    locked: false,
    default: true,
  },
];

const COMMS = [
  { id: "property_alerts", label: "Property alerts & saved searches" },
  { id: "market_updates", label: "Market reports & price updates" },
  { id: "newsletters", label: "Weekly property newsletter" },
  { id: "promotions", label: "Promotional offers & events" },
];

export default function PrivacySettingsPage() {
  const [cookies, setCookies] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((s) => [s.id, s.default]))
  );
  const [comms, setComms] = useState<Record<string, boolean>>(
    Object.fromEntries(COMMS.map((c) => [c.id, true]))
  );
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-gray-900">Privacy settings</h1>
          <p className="text-gray-500 text-sm mt-1">Control how Greenbricks.net collects and uses your data.</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full space-y-10">

        {/* Cookie preferences */}
        <section>
          <h2 className="text-lg font-black text-gray-900 mb-1">Cookie preferences</h2>
          <p className="text-sm text-gray-500 mb-5">
            We use cookies to improve your experience. Manage your preferences below. See our{" "}
            <Link href="/privacy-centre" className="text-[#16a34a] underline underline-offset-2">Privacy Policy</Link> for details.
          </p>
          <div className="space-y-3">
            {SETTINGS.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    {s.locked && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Always on</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
                <button
                  disabled={s.locked}
                  onClick={() => setCookies(p => ({ ...p, [s.id]: !p[s.id] }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    cookies[s.id] ? "bg-[#16a34a]" : "bg-gray-200"
                  } ${s.locked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${cookies[s.id] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Communication preferences */}
        <section>
          <h2 className="text-lg font-black text-gray-900 mb-1">Communication preferences</h2>
          <p className="text-sm text-gray-500 mb-5">Choose which emails you'd like to receive from us.</p>
          <div className="space-y-3">
            {COMMS.map((c) => (
              <label key={c.id} className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">{c.label}</span>
                <input type="checkbox" checked={comms[c.id]}
                  onChange={() => setComms(p => ({ ...p, [c.id]: !p[c.id] }))}
                  className="w-4 h-4 accent-[#16a34a] shrink-0" />
              </label>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-4 pt-2">
          <button onClick={handleSave}
            className="bg-[#16a34a] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
            Save preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#16a34a] font-semibold">
              <CheckCircle size={15} /> Saved!
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 text-xs text-gray-400 space-y-1">
          <p>To request deletion of your personal data, please <Link href="/contact" className="text-[#16a34a] underline underline-offset-2">contact us</Link>.</p>
          <p>Read our full <Link href="/privacy-centre" className="text-[#16a34a] underline underline-offset-2">Privacy Policy</Link> and <Link href="/legal" className="text-[#16a34a] underline underline-offset-2">Terms of Use</Link>.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
