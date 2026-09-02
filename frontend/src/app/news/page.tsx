import type { Metadata } from "next";
import NewsPageClient from "./NewsPageClient";

export const metadata: Metadata = {
  title: "Property News & Real Estate Insights in Sri Lanka | Greenbricks",
  description: "Read the latest property news, real estate market trends, finance updates, and housing insights for Sri Lanka. Stay informed with Greenbricks news hub.",
  keywords: "property news Sri Lanka, real estate news, market trends, housing news, finance updates, property insights",
  openGraph: {
    title: "Property News & Insights | Greenbricks",
    description: "Latest real estate news, market trends, and property insights for Sri Lanka.",
    url: "https://greenbricks.net/news",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Property News Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property News & Insights | Greenbricks",
    description: "Read latest real estate news and market insights for Sri Lanka.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function NewsPage() {
  return <NewsPageClient />;
}
