import type { Metadata } from "next";
import BuyPageClient from "./BuyPageClient";

export const metadata: Metadata = {
  title: "Buy Properties in Sri Lanka | Houses, Apartments & Land | Greenbricks",
  description: "Browse thousands of properties for sale across Sri Lanka. Find your dream home, apartment, villa, or land with advanced filters and verified listings.",
  keywords: "buy property Sri Lanka, houses for sale, apartments, villas, land, property listings, real estate",
  openGraph: {
    title: "Buy Properties in Sri Lanka | Greenbricks",
    description: "Discover thousands of properties for sale across Sri Lanka with verified listings and advanced search filters.",
    url: "https://greenbricks.net/buy",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Buy Properties in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Properties in Sri Lanka | Greenbricks",
    description: "Find properties for sale across Sri Lanka - apartments, houses, villas, and land.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function BuyPage() {
  return <BuyPageClient />;
}
