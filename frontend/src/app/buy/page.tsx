import type { Metadata } from "next";
import BuyPageClient from "./BuyPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedNews, PaginatedProperties } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Property & Houses for Sale in Sri Lanka | Greenbricks",
  description: "Browse houses, apartments, villas, and land for sale across Sri Lanka. Filter by district, bedrooms, and price on Greenbricks.",
  keywords: "property for sale in Sri Lanka, houses for sale in Sri Lanka, apartments for sale, land for sale, real estate",
  // Filtered views (?suburb=, ?property_type=, ?min_price= …) all consolidate onto /buy
  alternates: { canonical: "https://greenbrickz.com/buy" },
  openGraph: {
    title: "Property & Houses for Sale in Sri Lanka | Greenbricks",
    description: "Discover houses, apartments, villas, and land for sale across Sri Lanka with search filters on Greenbricks.",
    url: "https://greenbrickz.com/buy",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Buy Properties in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property & Houses for Sale in Sri Lanka | Greenbricks",
    description: "Find properties for sale across Sri Lanka — houses, apartments, villas, and land.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function BuyPage() {
  try {
    const [propsRes, newsRes] = await Promise.all([
      serverGet<PaginatedProperties>("/properties?listing_type=buy&per_page=50", { revalidate: 300 }),
      serverGet<PaginatedNews>("/news?per_page=4", { revalidate: 300 }).catch(() => ({ data: [] })),
    ]);
    return (
      <BuyPageClient
        initialLoaded
        initialItems={propsRes.data ?? []}
        initialTotal={propsRes.total ?? 0}
        initialNews={newsRes.data ?? []}
      />
    );
  } catch {
    return <BuyPageClient />;
  }
}
