import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Sri Lanka Suburb Profiles | Area Guides & Market Data | Greenbricks",
  description: "Explore suburb profiles across Sri Lanka — median prices, property types and area guides to help you choose the right neighbourhood before you buy or rent.",
  keywords: "Sri Lanka suburb profiles, area guides, neighbourhood property prices",
  alternates: { canonical: "https://greenbrickz.com/tools/suburb-profiles" },
  openGraph: {
    title: "Sri Lanka Suburb Profiles | Area Guides & Market Data | Greenbricks",
    description: "Explore suburb profiles across Sri Lanka — median prices, property types and area guides to help you choose the right neighbourhood before you buy or rent.",
    url: "https://greenbrickz.com/tools/suburb-profiles",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks — Sri Lanka property portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sri Lanka Suburb Profiles | Area Guides & Market Data | Greenbricks",
    description: "Explore suburb profiles across Sri Lanka — median prices, property types and area guides to help you choose the right neighbourhood before you buy or rent.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function ToolsSuburbProfilesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
