import type { Metadata } from "next";
import SoldPageClient from "./SoldPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedProperties } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Recently Sold Properties in Sri Lanka | Greenbricks",
  description: "Browse recently sold houses, apartments, and land across Sri Lanka to research sale prices and local property market activity.",
  keywords: "sold properties Sri Lanka, recent property sales, Sri Lanka real estate market",
  alternates: { canonical: "https://greenbrickz.com/sold" },
  openGraph: {
    title: "Recently Sold Properties in Sri Lanka | Greenbricks",
    description: "Explore recently sold properties across Sri Lanka on Greenbricks.",
    url: "https://greenbrickz.com/sold",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Sold Properties Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recently Sold Properties in Sri Lanka | Greenbricks",
    description: "View recently sold properties across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function SoldPage() {
  try {
    const res = await serverGet<PaginatedProperties>("/properties?listing_type=sold&per_page=50", { revalidate: 300 });
    return (
      <SoldPageClient
        initialLoaded
        initialItems={res.data ?? []}
        initialTotal={res.total ?? 0}
      />
    );
  } catch {
    return <SoldPageClient />;
  }
}
