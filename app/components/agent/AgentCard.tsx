import Link from "next/link";
import { Star, MapPin, Phone } from "lucide-react";
import { Agent } from "@/app/types";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <img
            src={agent.image}
            alt={agent.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <Link href={`/agents/${agent.id}`}>
              <h3 className="font-bold text-gray-900 group-hover:text-[#4CD137] transition-colors">
                {agent.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">{agent.title}</p>
            <p className="text-xs font-semibold text-[#4CD137] mt-1">{agent.agency}</p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-gray-800">{agent.stats.rating}</span>
              <span className="text-xs text-gray-400">({agent.stats.reviews} reviews)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#4CD137]" />
            {agent.location}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg py-2">
              <div className="text-lg font-black text-gray-900">{agent.stats.propertiesSold}</div>
              <div className="text-[10px] text-gray-500">Properties Sold</div>
            </div>
            <div className="bg-gray-50 rounded-lg py-2">
              <div className="text-lg font-black text-gray-900">{agent.stats.avgDaysOnMarket}</div>
              <div className="text-[10px] text-gray-500">Avg Days on Market</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <a
            href={`tel:${agent.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#4CD137] text-white text-xs font-bold hover:bg-[#3da82d] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <Link
            href={`/agents/${agent.id}`}
            className="flex-1 py-2.5 rounded-xl border-2 border-[#4CD137] text-[#4CD137] text-xs font-bold text-center hover:bg-[#4CD137] hover:text-white transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
