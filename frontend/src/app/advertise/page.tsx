import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { CheckCircle, TrendingUp, Users, Star, Mail } from "lucide-react";

const PACKAGES = [
  {
    name: "Basic",
    price: "LKR 4,900",
    period: "/ month",
    color: "border-gray-200",
    badge: "",
    features: [
      "1 property listing",
      "10 photos per listing",
      "30-day listing duration",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "LKR 12,900",
    period: "/ month",
    color: "border-[#16a34a]",
    badge: "Most Popular",
    features: [
      "5 property listings",
      "30 photos per listing",
      "60-day listing duration",
      "Featured placement",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    price: "LKR 29,900",
    period: "/ month",
    color: "border-gray-800",
    badge: "Best Value",
    features: [
      "Unlimited listings",
      "Unlimited photos + video",
      "90-day listing duration",
      "Homepage featured slot",
      "Full analytics dashboard",
      "Dedicated account manager",
      "Social media promotion",
    ],
  },
];

const BENEFITS = [
  { icon: TrendingUp, title: "1M+ Monthly Visitors", desc: "Reach Sri Lanka's largest property-seeking audience every month." },
  { icon: Users, title: "Verified Buyers & Renters", desc: "Connect directly with serious, verified property seekers." },
  { icon: Star, title: "Top Search Placement", desc: "Premium listings appear at the top of relevant search results." },
  { icon: CheckCircle, title: "Easy Listing Management", desc: "Update, pause, or boost your listings anytime from your dashboard." },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/GreenBricksLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-[#16a34a] hover:underline">Contact sales</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-green-100 text-[#16a34a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Advertise with us</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Reach Sri Lanka's <span className="text-[#16a34a]">largest</span> property audience
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            List your properties on Greenbricks.net and connect with millions of buyers, sellers, and renters across Sri Lanka.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/join" className="bg-[#16a34a] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
              Get started free
            </Link>
            <Link href="/contact" className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:border-gray-500 transition-colors text-sm">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Why advertise on Greenbricks?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-[#16a34a]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Simple, transparent pricing</h2>
          <p className="text-sm text-gray-500 text-center mb-10">All plans include a 7-day free trial. No credit card required.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className={`bg-white rounded-2xl border-2 ${pkg.color} p-6 relative flex flex-col`}>
                {pkg.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {pkg.badge}
                  </span>
                )}
                <h3 className="font-black text-gray-900 text-lg mb-1">{pkg.name}</h3>
                <div className="mb-5">
                  <span className="text-2xl font-black text-gray-900">{pkg.price}</span>
                  <span className="text-sm text-gray-400">{pkg.period}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-[#16a34a] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/join" className="block text-center bg-[#16a34a] text-white font-bold py-2.5 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <Mail size={32} className="text-[#16a34a] mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Need a custom solution?</h2>
        <p className="text-sm text-gray-500 mb-6">Large agencies and developers — contact our sales team for tailored packages and bulk pricing.</p>
        <Link href="/contact" className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm">
          Contact our sales team
        </Link>
      </section>

      <Footer />
    </div>
  );
}
