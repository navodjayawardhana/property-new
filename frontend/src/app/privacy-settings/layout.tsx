import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Privacy Settings | Greenbricks",
  description: "Manage your personal privacy and communication preferences on Greenbricks.",
  alternates: { canonical: "https://greenbricks.net/privacy-settings" },
  robots: "noindex, follow",
  openGraph: {
    title: "Privacy Settings | Greenbricks",
    description: "Manage your personal privacy and communication preferences on Greenbricks.",
    url: "https://greenbricks.net/privacy-settings",
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
    title: "Privacy Settings | Greenbricks",
    description: "Manage your personal privacy and communication preferences on Greenbricks.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function PrivacySettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
