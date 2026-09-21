import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greenbrickz.com"),
  title: "Greenbricks – Sri Lanka's No.1 Property Site",
  description: "Search properties for sale, rent, and sold across Sri Lanka. Find houses, apartments, villas, and commercial property from verified agents.",
  keywords: "property Sri Lanka, buy property, rent property, real estate, houses for sale",
  authors: [{ name: "Greenbricks" }],
  creator: "Greenbricks",
  publisher: "Greenbricks",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "https://greenbrickz.com",
    siteName: "Greenbricks",
    title: "Greenbricks – Sri Lanka's No.1 Property Site",
    description: "Search properties for sale, rent, and sold across Sri Lanka. Find houses, apartments, villas, and commercial property from verified agents.",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@greenbrickssl",
    creator: "@greenbrickssl",
    title: "Greenbricks – Sri Lanka's No.1 Property Site",
    description: "Search properties for sale, rent, and sold across Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "RealEstateAgent"],
                  "@id": "https://greenbrickz.com/#organization",
                  "name": "Greenbricks",
                  "description": "Sri Lanka's No.1 property search platform",
                  "url": "https://greenbrickz.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://greenbrickz.com/GreenBricksLogo.png",
                  },
                  "sameAs": [
                    "https://www.facebook.com/greenbrickssl/",
                    "https://www.instagram.com/greenbricksl/",
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "Customer Service",
                    "email": "info@greenbrickz.com",
                    "url": "https://greenbrickz.com/contact",
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "LK",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://greenbrickz.com/#website",
                  "url": "https://greenbrickz.com",
                  "name": "Greenbricks",
                  "publisher": { "@id": "https://greenbrickz.com/#organization" },
                  "inLanguage": "en-LK",
                  // Makes the site eligible for Google's sitelinks search box.
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://greenbrickz.com/buy?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
