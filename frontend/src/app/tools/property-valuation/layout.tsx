import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Free Property Valuation in Sri Lanka | Greenbricks",
  description: "Find out what your property is worth. Request a free, no-obligation property valuation from verified Greenbricks agents across Sri Lanka.",
  keywords: "property valuation Sri Lanka, house value, free property appraisal",
  alternates: { canonical: "https://greenbricks.net/tools/property-valuation" },
  openGraph: {
    title: "Free Property Valuation in Sri Lanka | Greenbricks",
    description: "Find out what your property is worth. Request a free, no-obligation property valuation from verified Greenbricks agents across Sri Lanka.",
    url: "https://greenbricks.net/tools/property-valuation",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks — Sri Lanka property portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Property Valuation in Sri Lanka | Greenbricks",
    description: "Find out what your property is worth. Request a free, no-obligation property valuation from verified Greenbricks agents across Sri Lanka.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function ToolsPropertyValuationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
