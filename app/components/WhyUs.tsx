import { ShieldCheck, Globe2, Headphones, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Globe2 className="w-6 h-6"/>,
    title: "Global Coverage",
    desc: "Access over 120,000 listings across 50+ countries with real-time updates.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <ShieldCheck className="w-6 h-6"/>,
    title: "Verified Listings",
    desc: "Every property is manually verified to ensure authenticity and accuracy.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <TrendingUp className="w-6 h-6"/>,
    title: "Market Insights",
    desc: "AI-powered market data and pricing trends for smarter decisions.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: <Headphones className="w-6 h-6"/>,
    title: "24/7 Expert Support",
    desc: "Dedicated concierge team to assist buyers, sellers, and investors.",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-2 block">Why Serendib</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">The Smarter Way to Find Property</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
