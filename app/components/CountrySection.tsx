const countries = [
  { name: "Australia",      flag: "🇦🇺", count: "32,400" },
  { name: "USA",            flag: "🇺🇸", count: "28,100" },
  { name: "United Kingdom", flag: "🇬🇧", count: "19,300" },
  { name: "Dubai, UAE",     flag: "🇦🇪", count: "14,700" },
  { name: "Singapore",      flag: "🇸🇬", count: "9,200"  },
  { name: "France",         flag: "🇫🇷", count: "8,600"  },
  { name: "Japan",          flag: "🇯🇵", count: "7,800"  },
  { name: "Canada",         flag: "🇨🇦", count: "11,400" },
];

export default function CountrySection() {
  return (
    <section className="py-20 px-5 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-label">Global Reach</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Browse by Destination</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
            Curated listings across the world&apos;s most sought-after locations
          </p>
        </div>

        {/* 4 × 2 grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {countries.map((c) => (
            <a
              key={c.name}
              href="#"
              className="group flex items-center gap-3.5 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#C8102E]/30 hover:bg-red-50/30 transition-all"
            >
              <span className="text-3xl leading-none">{c.flag}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-[#C8102E] transition-colors truncate">
                  {c.name}
                </p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{c.count} listings</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 font-semibold">
          <a href="#" className="hover:text-[#C8102E] transition-colors">View all 50+ countries →</a>
        </p>
      </div>
    </section>
  );
}
