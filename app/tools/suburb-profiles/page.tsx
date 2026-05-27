import { Search, TrendingUp, Users, School, TreePine } from "lucide-react";
import Link from "next/link";

const suburbs = [
  { name: "Colombo 7", postcode: "00700", medianPrice: "LKR 150M", growth: "+8.5%", population: "45,000" },
  { name: "Colombo 3", postcode: "00300", medianPrice: "LKR 120M", growth: "+6.2%", population: "62,000" },
  { name: "Rajagiriya", postcode: "10100", medianPrice: "LKR 65M", growth: "+12.3%", population: "38,000" },
  { name: "Battaramulla", postcode: "10120", medianPrice: "LKR 55M", growth: "+15.1%", population: "42,000" },
  { name: "Nugegoda", postcode: "10250", medianPrice: "LKR 48M", growth: "+9.8%", population: "55,000" },
  { name: "Dehiwala", postcode: "10350", medianPrice: "LKR 52M", growth: "+7.4%", population: "78,000" },
  { name: "Colombo 5", postcode: "00500", medianPrice: "LKR 85M", growth: "+5.9%", population: "48,000" },
  { name: "Nawala", postcode: "10100", medianPrice: "LKR 58M", growth: "+11.2%", population: "32,000" },
];

export default function SuburbProfilesPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Suburb Profiles
          </h1>
          <p className="text-white/60 mb-6">
            Research suburbs with detailed market data and demographics
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <label className="flex-1 flex items-center gap-2.5 bg-white rounded-xl px-4 py-3">
              <Search className="w-4 h-4 text-[#4CD137] shrink-0" />
              <input
                type="text"
                placeholder="Search suburb or postcode..."
                className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
              />
            </label>
            <button className="flex items-center justify-center gap-2 bg-[#4CD137] hover:bg-[#3da82d] text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, value: "8.2%", label: "Avg. Price Growth" },
            { icon: <Users className="w-5 h-5" />, value: "2.4M", label: "Population Covered" },
            { icon: <School className="w-5 h-5" />, value: "450+", label: "Schools Mapped" },
            { icon: <TreePine className="w-5 h-5" />, value: "120+", label: "Parks & Recreation" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-[#4CD137]">
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Suburb List */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Suburbs</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Suburb</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Postcode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Median Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Annual Growth</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suburbs.map((suburb) => (
                  <tr key={suburb.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{suburb.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{suburb.postcode}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{suburb.medianPrice}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-[#4CD137]">
                        {suburb.growth}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{suburb.population}</td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-[#4CD137] font-semibold hover:underline">
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4CD137] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Can't Find Your Suburb?
          </h2>
          <p className="text-green-100 mb-6">
            Request a custom suburb report from our research team.
          </p>
          <button className="bg-white text-[#4CD137] font-black px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
            Request Report →
          </button>
        </div>
      </section>
    </main>
  );
}
