import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Contact Greenbricks | Property Enquiries & Support",
  description: "Get in touch with the Greenbricks team. Ask about listing your property, agent partnerships, advertising, or support with your property search in Sri Lanka.",
  keywords: "contact Greenbricks, property enquiry, real estate support Sri Lanka",
  alternates: { canonical: "https://greenbricks.net/contact" },
  openGraph: {
    title: "Contact Greenbricks | Property Enquiries & Support",
    description: "Get in touch with the Greenbricks team. Ask about listing your property, agent partnerships, advertising, or support with your property search in Sri Lanka.",
    url: "https://greenbricks.net/contact",
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
    title: "Contact Greenbricks | Property Enquiries & Support",
    description: "Get in touch with the Greenbricks team. Ask about listing your property, agent partnerships, advertising, or support with your property search in Sri Lanka.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
