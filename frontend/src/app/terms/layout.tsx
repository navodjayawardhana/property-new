import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Terms & Conditions | Greenbricks",
  description: "The terms and conditions that govern your use of the Greenbricks property platform, including listings, accounts and acceptable use.",
  keywords: "Greenbricks terms and conditions, terms of use",
  alternates: { canonical: "https://greenbrickz.com/terms" },
  openGraph: {
    title: "Terms & Conditions | Greenbricks",
    description: "The terms and conditions that govern your use of the Greenbricks property platform, including listings, accounts and acceptable use.",
    url: "https://greenbrickz.com/terms",
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
    title: "Terms & Conditions | Greenbricks",
    description: "The terms and conditions that govern your use of the Greenbricks property platform, including listings, accounts and acceptable use.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
