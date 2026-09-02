import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Privacy Centre | Greenbricks",
  description: "Understand and control how your data is handled on Greenbricks — access your information, manage consent and review our privacy commitments.",
  keywords: "Greenbricks privacy centre, data controls",
  alternates: { canonical: "https://greenbricks.net/privacy-centre" },
  openGraph: {
    title: "Privacy Centre | Greenbricks",
    description: "Understand and control how your data is handled on Greenbricks — access your information, manage consent and review our privacy commitments.",
    url: "https://greenbricks.net/privacy-centre",
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
    title: "Privacy Centre | Greenbricks",
    description: "Understand and control how your data is handled on Greenbricks — access your information, manage consent and review our privacy commitments.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function PrivacyCentreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
