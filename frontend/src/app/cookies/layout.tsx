import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Cookie Policy | Greenbricks",
  description: "How Greenbricks uses cookies and similar technologies, what each category is used for, and how you can manage your preferences.",
  keywords: "Greenbricks cookie policy, cookies",
  alternates: { canonical: "https://greenbrickz.com/cookies" },
  openGraph: {
    title: "Cookie Policy | Greenbricks",
    description: "How Greenbricks uses cookies and similar technologies, what each category is used for, and how you can manage your preferences.",
    url: "https://greenbrickz.com/cookies",
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
    title: "Cookie Policy | Greenbricks",
    description: "How Greenbricks uses cookies and similar technologies, what each category is used for, and how you can manage your preferences.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
