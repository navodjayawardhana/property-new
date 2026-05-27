import { agents } from "@/app/lib/data/agents";
import AgentCard from "@/app/components/agent/AgentCard";
import { Search, MapPin } from "lucide-react";

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Find a Real Estate Agent
          </h1>
          <p className="text-white/60 mb-6">
            Connect with experienced agents in your area
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <label className="flex-1 flex items-center gap-2.5 bg-white rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-[#4CD137] shrink-0" />
              <input
                type="text"
                placeholder="Search by location or agent name..."
                className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
              />
            </label>
            <button className="flex items-center justify-center gap-2 bg-[#4CD137] hover:bg-[#3da82d] text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-800">{agents.length}</span> agents found
          </p>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none">
            <option>Sort: Top Rated</option>
            <option>Most Sales</option>
            <option>Name A-Z</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#4CD137] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Are You a Real Estate Agent?
          </h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            Join GreenBrick.net and connect with thousands of potential buyers and sellers.
          </p>
          <button className="bg-white text-[#4CD137] font-black px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
            Join Our Network →
          </button>
        </div>
      </section>
    </main>
  );
}
