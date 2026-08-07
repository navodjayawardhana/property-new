import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Buy, Rent & Sell Property in Sri Lanka | Greenbricks",
  description: "Sri Lanka's No.1 property portal. Search 120,000+ properties for sale, 55,000+ rentals, and connect with 2,400+ verified agents across all districts.",
  keywords: "property Sri Lanka, buy house, rent apartment, real estate, agents, property search",
  openGraph: {
    title: "Buy, Rent & Sell Property in Sri Lanka | Greenbricks",
    description: "Sri Lanka's No.1 property portal with 120,000+ listings and verified agents.",
    url: "https://greenbricks.net",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Sri Lanka Property Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy, Rent & Sell Property in Sri Lanka | Greenbricks",
    description: "Search properties and connect with verified real estate agents.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function Page() {
  return <HomePageClient />;
}
