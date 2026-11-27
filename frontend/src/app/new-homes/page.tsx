import type { Metadata } from "next";
import NewHomesPageClient from "./NewHomesPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedProperties } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "New Homes & Developments in Sri Lanka | Greenbricks",
  description: "Explore newly built houses, apartments, and residential developments across Sri Lanka. Compare new properties from developers and agents.",
  keywords: "new homes Sri Lanka, brand new house for sale Colombo, new apartments, residential developments",
  alternates: { canonical: "https://greenbrickz.com/new-homes" },
  openGraph: {
    title: "New Homes & Developments in Sri Lanka | Greenbricks",
    description: "Explore newly built homes and residential developments across Sri Lanka.",
    url: "https://greenbrickz.com/new-homes",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - New Homes Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "New Homes & Developments in Sri Lanka | Greenbricks",
    description: "Find newly built houses and apartments across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function NewHomesPage() {
  try {
    const res = await serverGet<PaginatedProperties>("/properties?condition=new&per_page=50", { revalidate: 300 });
    return (
      <NewHomesPageClient
        initialLoaded
        initialItems={res.data ?? []}
        initialTotal={res.total ?? 0}
      />
    );
  } catch {
    return <NewHomesPageClient />;
  }
}
