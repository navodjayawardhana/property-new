import type { Metadata } from "next";
import NewsPageClient from "./NewsPageClient";
import { serverGet } from "@/lib/server-api";
import type { PaginatedNews } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Property News & Market Insights Sri Lanka | Greenbricks",
  description: "Read Sri Lankan property news, real estate market updates, housing finance insights, and buyer guides on Greenbricks.",
  keywords: "property news Sri Lanka, real estate news, market trends, housing finance Sri Lanka",
  alternates: { canonical: "https://greenbrickz.com/news" },
  openGraph: {
    title: "Property News & Market Insights Sri Lanka | Greenbricks",
    description: "Latest Sri Lankan real estate news, market trends, and property guides on Greenbricks.",
    url: "https://greenbrickz.com/news",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Property News Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property News & Market Insights Sri Lanka | Greenbricks",
    description: "Read latest Sri Lankan real estate news and property guides.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default async function NewsPage() {
  try {
    const res = await serverGet<PaginatedNews>("/news?per_page=20", { revalidate: 300 });
    return (
      <NewsPageClient
        initialLoaded
        initialArticles={res.data ?? []}
      />
    );
  } catch {
    return <NewsPageClient />;
  }
}
