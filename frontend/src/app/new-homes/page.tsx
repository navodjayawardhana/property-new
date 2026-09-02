import type { Metadata } from "next";
import NewHomesPageClient from "./NewHomesPageClient";

export const metadata: Metadata = {
  title: "New Homes & Off-Plan Properties in Sri Lanka | Developers | Greenbricks",
  description: "Browse new homes and off-plan developments from leading developers across Sri Lanka. Find pre-launch apartments, villas, and residential projects.",
  keywords: "new homes Sri Lanka, off-plan property, new developments, residential projects, pre-launch, developers",
  openGraph: {
    title: "New Homes in Sri Lanka | Greenbricks",
    description: "Explore new homes and off-plan properties from top developers across Sri Lanka.",
    url: "https://greenbricks.net/new-homes",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - New Homes Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "New Homes in Sri Lanka | Greenbricks",
    description: "Find new homes and off-plan developments from Sri Lankan developers.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function NewHomesPage() {
  return <NewHomesPageClient />;
}
