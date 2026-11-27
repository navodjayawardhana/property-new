import type { Metadata } from "next";
import CommercialPageClient from "./CommercialPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedProperties } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Commercial Property for Sale & Rent Sri Lanka | Greenbricks",
  description: "Browse commercial properties for sale and lease across Sri Lanka. Find office spaces, retail shops, warehouses, and business premises on Greenbricks.",
  keywords: "commercial property Sri Lanka, commercial property for rent in Colombo, office space, retail, warehouses",
  alternates: { canonical: "https://greenbrickz.com/commercial" },
  openGraph: {
    title: "Commercial Property for Sale & Rent Sri Lanka | Greenbricks",
    description: "Discover commercial properties across Sri Lanka — offices, retail spaces, and warehouses.",
    url: "https://greenbrickz.com/commercial",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Commercial Properties in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Property for Sale & Rent Sri Lanka | Greenbricks",
    description: "Find commercial spaces — offices, retail, and warehouses across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function CommercialPage() {
  try {
    const res = await serverGet<PaginatedProperties>("/properties?category=commercial&per_page=50", { revalidate: 300 });
    return (
      <CommercialPageClient
        initialLoaded
        initialItems={res.data ?? []}
        initialTotal={res.total ?? 0}
      />
    );
  } catch {
    return <CommercialPageClient />;
  }
}
