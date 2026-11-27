import type { Metadata } from "next";
import RentPageClient from "./RentPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedProperties } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Houses & Apartments for Rent in Sri Lanka | Greenbricks",
  description: "Find houses, apartments, villas, and residential properties for rent across Sri Lanka. Filter rentals by district, bedrooms, and monthly budget.",
  keywords: "house for rent in Sri Lanka, apartments for rent, house for rent in Colombo, rental listings Sri Lanka",
  alternates: { canonical: "https://greenbrickz.com/rent" },
  openGraph: {
    title: "Houses & Apartments for Rent in Sri Lanka | Greenbricks",
    description: "Search houses, apartments, and villas for rent across Sri Lanka on Greenbricks.",
    url: "https://greenbrickz.com/rent",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks Rental Properties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Houses & Apartments for Rent in Sri Lanka | Greenbricks",
    description: "Find houses and apartments for rent across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function Page() {
  try {
    const res = await serverGet<PaginatedProperties>("/properties?listing_type=rent&per_page=50", { revalidate: 300 });
    return (
      <RentPageClient
        initialLoaded
        initialItems={res.data ?? []}
        initialTotal={res.total ?? 0}
      />
    );
  } catch {
    return <RentPageClient />;
  }
}
