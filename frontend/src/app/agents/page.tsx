import type { Metadata } from "next";
import AgentsPageClient from "./AgentsPageClient";

export const metadata: Metadata = {
  title: "Real Estate Agents in Sri Lanka | Find & Connect | Greenbricks",
  description: "Browse 2,400+ verified real estate agents across Sri Lanka. Find experienced agents to help you buy, sell, or rent property with confidence.",
  keywords: "real estate agents Sri Lanka, property agents, realtors, real estate professionals, find agent",
  openGraph: {
    title: "Real Estate Agents in Sri Lanka | Greenbricks",
    description: "Find 2,400+ verified real estate agents across Sri Lanka to help with your property needs.",
    url: "https://greenbricks.net/agents",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks Real Estate Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Estate Agents in Sri Lanka | Greenbricks",
    description: "Find verified agents to help with your property search.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function Page() {
  return <AgentsPageClient />;
}
