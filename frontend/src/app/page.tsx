import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { serverGet } from "@/lib/server-api";
import type {
  PaginatedAgents,
  PaginatedNews,
  PaginatedProperties,
} from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
  description:
    "Discover houses, apartments, land, and commercial properties for sale and rent across Sri Lanka, and connect with real estate agents on Greenbricks.",
  keywords:
    "property for sale in Sri Lanka, houses for rent in Colombo, apartments for sale Sri Lanka, land for sale, real estate agents Sri Lanka",
  alternates: { canonical: "https://greenbrickz.com" },
  openGraph: {
    title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
    description:
      "Discover houses, apartments, land, and commercial properties for sale and rent across Sri Lanka on Greenbricks.",
    url: "https://greenbrickz.com",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Sri Lanka Property Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
    description:
      "Search houses, apartments, land, and commercial properties across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function Page() {
  try {
    const [buyRes, rentRes, soldRes, agentsRes, newsRes] = await Promise.all([
      serverGet<PaginatedProperties>("/properties?listing_type=buy&featured=true&per_page=4", { revalidate: 300 }),
      serverGet<PaginatedProperties>("/properties?listing_type=rent&per_page=4", { revalidate: 300 }),
      serverGet<PaginatedProperties>("/properties?listing_type=sold&per_page=1", { revalidate: 300 }),
      serverGet<PaginatedAgents>("/agents?page=1", { revalidate: 300 }),
      serverGet<PaginatedNews>("/news?per_page=4", { revalidate: 300 }),
    ]);

    return (
      <HomePageClient
        initialLoaded
        initialBuyProps={(buyRes.data ?? []).slice(0, 4)}
        initialRentProps={(rentRes.data ?? []).slice(0, 4)}
        initialAgents={(agentsRes.data ?? []).slice(0, 8)}
        initialNews={(newsRes.data ?? []).slice(0, 4)}
        initialCounts={{
          buy: buyRes.total ?? 0,
          rent: rentRes.total ?? 0,
          sold: soldRes.total ?? 0,
          agents: agentsRes.total ?? 0,
        }}
      />
    );
  } catch {
    return <HomePageClient />;
  }
}
