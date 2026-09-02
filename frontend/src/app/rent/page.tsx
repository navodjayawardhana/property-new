import type { Metadata } from "next";
import RentPageClient from "./RentPageClient";

export const metadata: Metadata = {
  title: "Rent Properties in Sri Lanka | Apartments, Houses & Villas | Greenbricks",
  description: "Find rental properties in Sri Lanka. Browse 55,000+ apartments, houses, villas, and commercial spaces for rent from verified real estate agents.",
  keywords: "rent property Sri Lanka, apartments for rent, house rental, villa rental, rental listings",
  openGraph: {
    title: "Rent Properties in Sri Lanka | Greenbricks",
    description: "Search and rent from 55,000+ properties across Sri Lanka with verified agents.",
    url: "https://greenbricks.net/rent",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks Rental Properties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent Properties in Sri Lanka | Greenbricks",
    description: "Find rental properties from verified agents.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function Page() {
  return <RentPageClient />;
}
