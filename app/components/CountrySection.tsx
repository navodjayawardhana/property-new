const countries = [
  { name: "Australia",       flag: "🇦🇺", count: "32,400", color: "from-blue-500 to-blue-700" },
  { name: "USA",             flag: "🇺🇸", count: "28,100", color: "from-red-500 to-red-700" },
  { name: "United Kingdom",  flag: "🇬🇧", count: "19,300", color: "from-indigo-500 to-indigo-700" },
  { name: "Dubai, UAE",      flag: "🇦🇪", count: "14,700", color: "from-emerald-500 to-emerald-700" },
  { name: "Singapore",       flag: "🇸🇬", count: "9,200",  color: "from-red-400 to-pink-600" },
  { name: "France",          flag: "🇫🇷", count: "8,600",  color: "from-blue-400 to-purple-600" },
  { name: "Japan",           flag: "🇯🇵", count: "7,800",  color: "from-rose-400 to-rose-600" },
  { name: "Canada",          flag: "🇨🇦", count: "11,400", color: "from-red-600 to-orange-500" },
];

export default function CountrySection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C8102E] mb-2 block">
            Global Reach
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Browse by Destination</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            Explore curated property listings across the world&apos;s most sought-after locations
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {countries.map((c) => (
            <a
              key={c.name}
              href="#"
              className="group relative overflow-hidden rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-1"
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`}/>

              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-4xl">{c.flag}</span>
                <div>
                  <div className="font-bold text-gray-900 text-sm group-hover:text-[#C8102E] transition-colors">
                    {c.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-semibold">
                    {c.count} listings
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#C8102E] transition-colors">
            View all 50+ countries →
          </a>
        </div>
      </div>
    </section>
  );
}
