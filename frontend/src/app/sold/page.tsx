import type { Metadata } from "next";
import SoldPageClient from "./SoldPageClient";

export const metadata: Metadata = {
  title: "Recently Sold Properties in Sri Lanka | Market Insights | Greenbricks",
  description: "Browse recently sold properties across Sri Lanka. Get insights into market trends, sold prices, and sale history to inform your property decisions.",
  keywords: "sold properties Sri Lanka, recent sales, property market, sold listings, real estate trends",
  alternates: { canonical: "https://greenbrickz.com/sold" },
  openGraph: {
    title: "Recently Sold Properties in Sri Lanka | Greenbricks",
    description: "Explore recently sold properties and market insights across Sri Lanka.",
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
    description: "View recently sold properties and market insights across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function SoldPage() {
  return <SoldPageClient />;
}
