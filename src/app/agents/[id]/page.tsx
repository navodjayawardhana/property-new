"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { agentsApi, properties as propertiesApi, type Agent, type Property } from "@/lib/api";
import { MapPin, Mail, Phone, ArrowLeft, Building2, Users } from "lucide-react";

function AgentAvatar({ agent, size = "lg" }: { agent: Agent; size?: "sm" | "lg" | "xl" }) {
  const dim =
    size === "xl" ? "w-28 h-28 text-4xl" :
    size === "lg" ? "w-20 h-20 text-2xl" :
                   "w-12 h-12 text-base";
  return (
    <div className={`${dim} rounded-full overflow-hidden bg-[#121e80] flex items-center justify-center shrink-0`}>
      {agent.avatar ? (
        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-black">{agent.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function AgentProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [agent,        setAgent]        = useState<Agent | null>(null);
  const [agentProps,   setAgentProps]   = useState<Property[]>([]);
  const [nearbyAgents, setNearbyAgents] = useState<Agent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [propsLoading, setPropsLoading] = useState(true);

  // Fetch agent info
  useEffect(() => {
    agentsApi.get(Number(id))
      .then(setAgent)
      .catch(() => router.replace("/agents"))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch agent's properties + nearby agents once agent is loaded
  useEffect(() => {
    if (!agent) return;

    setPropsLoading(true);
    propertiesApi.list({ user_id: agent.id, per_page: 50 })
      .then((res) => setAgentProps(res.data))
      .catch(() => setAgentProps([]))
      .finally(() => setPropsLoading(false));

    agentsApi.list({ suburb: agent.suburb ?? undefined, state: agent.state ?? undefined })
      .then((res) => setNearbyAgents(res.data.filter((a) => a.id !== agent.id).slice(0, 8)))
      .catch(() => setNearbyAgents([]));
  }, [agent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#121e80] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Back */}
        <Link href="/agents"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#121e80] transition-colors mb-6">
          <ArrowLeft size={14} /> Back to agents
        </Link>

        {/* Agent hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <AgentAvatar agent={agent} size="xl" />
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{agent.name}</h1>
              <p className="text-[#121e80] font-semibold text-sm mt-0.5">Real Estate Agent</p>
              {(agent.suburb || agent.state) && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={13} className="shrink-0" />
                  {[agent.suburb, agent.state, agent.postcode].filter(Boolean).join(", ")}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                <a href={`mailto:${agent.email}`}
                  className="flex items-center gap-2 bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Mail size={14} /> Email agent
                </a>
                {agent.phone && (
                  <a href={`tel:${agent.phone}`}
                    className="flex items-center gap-2 border border-green-600 text-green-700 hover:bg-green-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    <Phone size={14} /> {agent.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-6 text-center shrink-0">
              <div>
                <p className="text-2xl font-black text-gray-900">{agentProps.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Listings</p>
              </div>
              {nearbyAgents.length > 0 && (
                <div>
                  <p className="text-2xl font-black text-gray-900">{nearbyAgents.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nearby agents</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-[#121e80]" />
              <h2 className="text-lg font-black text-gray-900">
                {agent.name.split(" ")[0]}&apos;s Listings
              </h2>
              {!propsLoading && (
                <span className="ml-auto text-xs text-gray-400 font-medium">{agentProps.length} propert{agentProps.length !== 1 ? "ies" : "y"}</span>
              )}
            </div>

            {propsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : agentProps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No listings yet</p>
                <p className="text-gray-400 text-sm mt-1">This agent hasn&apos;t listed any properties.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agentProps.map((p) => <PropertyCard key={p.id} property={p} />)}
              </div>
            )}
          </div>

          {/* Nearby agents — 1/3 width */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#121e80]" />
              <h2 className="text-lg font-black text-gray-900">
                Agents in {agent.suburb || agent.state || "the area"}
              </h2>
            </div>

            {nearbyAgents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Users size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No other agents in this area.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyAgents.map((a) => (
                  <Link key={a.id} href={`/agents/${a.id}`}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-[#121e80] hover:shadow-sm transition-all group">
                    <div className="relative shrink-0">
                      <AgentAvatar agent={a} size="sm" />
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#121e80] transition-colors">{a.name}</p>
                      <p className="text-xs text-[#121e80] font-medium">Real Estate Agent</p>
                      {(a.suburb || a.state) && (
                        <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 truncate">
                          <MapPin size={9} className="shrink-0" />
                          {[a.suburb, a.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <Mail size={14} className="text-gray-300 group-hover:text-[#121e80] shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
