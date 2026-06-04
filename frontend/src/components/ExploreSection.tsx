"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home, Key, Building2, Users,
  Calculator, MapPin, PlusCircle, Banknote, TrendingUp,
} from "lucide-react";
import { properties as propertiesApi, agentsApi } from "@/lib/api";

type Counts = { buy: number; rent: number; sold: number; agents: number };

const ACTIONS = [
  {
    key: "buy",
    href: "/buy",
    title: "Find a property for sale",
    desc: "Find a House, Apartment or Building for sale",
    Icon: Home,
    color: "#dc2626",
  },
  {
    key: "rent",
    href: "/rent",
    title: "Find a property for rent",
    desc: "Find a House, Apartment or Building for rent/lease",
    Icon: Key,
    color: "#dc2626",
  },
  {
    key: "new",
    href: "/new-homes",
    title: "Find new homes",
    desc: "Find newly built homes and off-the-plan developments",
    Icon: Building2,
    color: "#16a34a",
  },
  {
    key: "post",
    href: "/dashboard/properties/new",
    title: "Post your ad",
    desc: "Post your property advertisement",
    Icon: PlusCircle,
    color: "#2563eb",
  },
  {
    key: "loans",
    href: "/home-loans",
    title: "Find the best home loan rates",
    desc: "Compare and find the best home loans for you",
    Icon: Banknote,
    color: "#0891b2",
  },
  {
    key: "sold",
    href: "/sold",
    title: "Find the best investments",
    desc: "Discover investment opportunities available for you",
    Icon: TrendingUp,
    color: "#7c3aed",
  },
  {
    key: "agents",
    href: "/agents",
    title: "Find a real estate agent",
    desc: "Connect with verified real estate agents near you",
    Icon: Users,
    color: "#0f766e",
  },
  {
    key: "calculator",
    href: "/tools/mortgage-calculator",
    title: "Mortgage calculator",
    desc: "Calculate your monthly repayments easily",
    Icon: Calculator,
    color: "#be185d",
  },
  {
    key: "suburbs",
    href: "/tools/suburb-profiles",
    title: "Suburb profiles",
    desc: "Research median prices, sales history and insights",
    Icon: MapPin,
    color: "#d97706",
  },
];

function fmt(n: number): string {
  if (n <= 0) return "";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k+";
  return n + "+";
}

export default function ExploreSection() {
  const [counts, setCounts] = useState<Counts>({ buy: 0, rent: 0, sold: 0, agents: 0 });

  useEffect(() => {
    Promise.all([
      propertiesApi.list({ listing_type: "buy", per_page: 1 }),
      propertiesApi.list({ listing_type: "rent", per_page: 1 }),
      propertiesApi.list({ listing_type: "sold", per_page: 1 }),
      agentsApi.list({ page: 1 }),
    ])
      .then(([buy, rent, sold, agents]) => {
        setCounts({ buy: buy.total, rent: rent.total, sold: sold.total, agents: agents.total });
      })
      .catch(() => {});
  }, []);

  const badge: Record<string, string> = {
    buy: fmt(counts.buy),
    rent: fmt(counts.rent),
    sold: fmt(counts.sold),
    agents: fmt(counts.agents),
  };

  return (
    <section className="bg-gray-50 pt-8 pb-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">What would you like to do?</h2>
          <p className="text-sm text-gray-500 mt-1">Make your property decisions smart and informed.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {ACTIONS.map(({ key, href, title, desc, Icon, color }) => (
            <Link
              key={key}
              href={href}
              className="shrink-0 w-48 bg-white rounded-lg border border-gray-200 p-5
                         flex flex-col gap-3 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <Icon size={38} style={{ color }} strokeWidth={1.5} />

              <div className="flex-1">
                <h3 className="font-bold text-sm leading-snug" style={{ color }}>
                  {title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
              </div>

              {badge[key] && (
                <p className="text-xs font-semibold" style={{ color }}>
                  {badge[key]} listings
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
