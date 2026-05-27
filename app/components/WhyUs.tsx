import { ShieldCheck, Globe2, Headphones, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Globe2 className="w-5 h-5"/>,
    title: "Global Coverage",
    desc: "120,000+ listings across 50+ countries with real-time updates.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <ShieldCheck className="w-5 h-5"/>,
    title: "Verified Listings",
    desc: "Every property manually verified for accuracy and authenticity.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <TrendingUp className="w-5 h-5"/>,
    title: "Market Insights",
    desc: "AI-powered pricing data and trends for smarter decisions.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: <Headphones className="w-5 h-5"/>,
    title: "24/7 Support",
    desc: "Expert concierge team ready to assist buyers and investors.",
    color: "bg-orange-50 text-orange-600",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-10">
          <span className="section-label">Why GreenBrick</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">The Smarter Way to Find Property</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
