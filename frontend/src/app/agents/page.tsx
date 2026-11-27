import type { Metadata } from "next";
import AgentsPageClient from "./AgentsPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedAgents } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Real Estate Agents in Sri Lanka | Find & Connect | Greenbricks",
  description: "Browse real estate agents and property agencies across Sri Lanka. Find local agents by district or province to help you buy, sell, or rent.",
  keywords: "real estate agents in Sri Lanka, property agents Sri Lanka, realtors Colombo, find property agent",
  alternates: { canonical: "https://greenbrickz.com/agents" },
  openGraph: {
    title: "Real Estate Agents in Sri Lanka | Greenbricks",
    description: "Connect with real estate agents across Sri Lanka to help with your property search.",
    url: "https://greenbrickz.com/agents",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks Real Estate Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Agents in Sri Lanka | Greenbricks",
    description: "Find real estate agents across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function Page() {
  try {
    const res = await serverGet<PaginatedAgents>("/agents?page=1&per_page=24", { revalidate: 300 });
    return (
      <AgentsPageClient
        initialLoaded
        initialAgents={res.data ?? []}
        initialTotal={res.total ?? 0}
        initialLastPage={res.last_page ?? 1}
      />
    );
  } catch {
    return <AgentsPageClient />;
  }
}
