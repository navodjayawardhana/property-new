import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Privacy Settings | Greenbricks",
  description: "Manage your personal privacy and communication preferences on Greenbricks.",
  alternates: { canonical: "https://greenbrickz.com/privacy-settings" },
  robots: "noindex, follow",
  openGraph: {
    title: "Privacy Settings | Greenbricks",
    description: "Manage your personal privacy and communication preferences on Greenbricks.",
    url: "https://greenbrickz.com/privacy-settings",
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
    title: "Privacy Settings | Greenbricks",
    description: "Manage your personal privacy and communication preferences on Greenbricks.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function PrivacySettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
