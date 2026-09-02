import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Legal Information | Greenbricks",
  description: "Legal notices, disclaimers and company information for the Greenbricks property platform in Sri Lanka.",
  keywords: "Greenbricks legal, disclaimers",
  alternates: { canonical: "https://greenbricks.net/legal" },
  openGraph: {
    title: "Legal Information | Greenbricks",
    description: "Legal notices, disclaimers and company information for the Greenbricks property platform in Sri Lanka.",
    url: "https://greenbricks.net/legal",
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
    title: "Legal Information | Greenbricks",
    description: "Legal notices, disclaimers and company information for the Greenbricks property platform in Sri Lanka.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
