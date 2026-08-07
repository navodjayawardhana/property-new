import type { Metadata } from "next";
import CommercialPageClient from "./CommercialPageClient";

export const metadata: Metadata = {
  title: "Commercial Properties in Sri Lanka | Offices, Retail & Warehouses | Greenbricks",
  description: "Browse commercial properties for sale and lease across Sri Lanka. Find offices, retail spaces, warehouses, and more with verified listings and advanced filters.",
  keywords: "commercial property Sri Lanka, office space, retail, warehouses, commercial real estate, business property",
  openGraph: {
    title: "Commercial Properties in Sri Lanka | Greenbricks",
    description: "Discover commercial properties across Sri Lanka - offices, retail spaces, warehouses, and prime business locations.",
    url: "https://greenbricks.net/commercial",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Commercial Properties in Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Properties in Sri Lanka | Greenbricks",
    description: "Find commercial spaces - offices, retail, warehouses across Sri Lanka.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function CommercialPage() {
  return <CommercialPageClient />;
}
