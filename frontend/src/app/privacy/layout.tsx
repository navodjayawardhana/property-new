import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Privacy Policy | Greenbricks",
  description: "How Greenbricks collects, uses, stores and protects your personal information when you use our Sri Lankan property search platform.",
  keywords: "Greenbricks privacy policy, data protection",
  alternates: { canonical: "https://greenbrickz.com/privacy" },
  openGraph: {
    title: "Privacy Policy | Greenbricks",
    description: "How Greenbricks collects, uses, stores and protects your personal information when you use our Sri Lankan property search platform.",
    url: "https://greenbrickz.com/privacy",
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
    title: "Privacy Policy | Greenbricks",
    description: "How Greenbricks collects, uses, stores and protects your personal information when you use our Sri Lankan property search platform.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
