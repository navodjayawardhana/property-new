const countries = [
  { name: "Australia", flag: "🇦🇺", count: "32,400" },
  { name: "USA", flag: "🇺🇸", count: "28,100" },
  { name: "United Kingdom", flag: "🇬🇧", count: "19,300" },
  { name: "Dubai, UAE", flag: "🇦🇪", count: "14,700" },
  { name: "Singapore", flag: "🇸🇬", count: "9,200" },
  { name: "France", flag: "🇫🇷", count: "8,600" },
  { name: "Canada", flag: "🇨🇦", count: "11,400" },
  { name: "New Zealand", flag: "🇳🇿", count: "6,300" },
];

export default function CountrySection() {
  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by Country</h2>
          <p className="text-gray-500 text-sm mt-1">Find properties in popular international destinations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {countries.map((c) => (
            <a
              key={c.name}
              href="#"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all group"
            >
              <span className="text-3xl">{c.flag}</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-red-600 transition-colors">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500">{c.count} listings</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
