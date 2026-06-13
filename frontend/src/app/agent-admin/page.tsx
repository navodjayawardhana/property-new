import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { LayoutDashboard, ListChecks, BarChart2, Bell, Settings, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: ListChecks, title: "Manage Listings", desc: "Add, edit, or remove property listings in real time from your agent dashboard." },
  { icon: BarChart2, title: "Performance Analytics", desc: "Track views, enquiries, and lead conversions for every listing you manage." },
  { icon: Bell, title: "Lead Notifications", desc: "Receive instant alerts when buyers or renters enquire about your properties." },
  { icon: Settings, title: "Profile & Settings", desc: "Update your agent profile, contact details, and notification preferences anytime." },
];

export default function AgentAdminPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/GreenBrickLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <Link href="/signin" className="text-sm font-semibold text-[#16a34a] hover:underline">Sign in</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-5">
            <LayoutDashboard size={12} /> Agent Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Your professional <span className="text-[#4ade80]">agent dashboard</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Manage all your listings, track performance, and respond to leads — all from one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/agent" className="bg-[#16a34a] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm flex items-center gap-2 justify-center">
              Go to dashboard <ArrowRight size={15} />
            </Link>
            <Link href="/join" className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Create agent account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Everything you need to manage your business</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#16a34a]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 border-t border-green-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to grow your business?</h2>
          <p className="text-sm text-gray-500 mb-6">Join thousands of agents already using Greenbricks.net to connect with buyers and renters across Sri Lanka.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/agent" className="bg-[#16a34a] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
              Access my dashboard
            </Link>
            <Link href="/contact" className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:border-gray-500 transition-colors text-sm">
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
