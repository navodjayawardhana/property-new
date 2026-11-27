import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Google Analytics 4 (property greenbrickz.com in the eSupport Technologies account).
const GA_MEASUREMENT_ID = "G-490EYY02DT";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greenbrickz.com"),
  title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
  description: "Discover houses, apartments, land and commercial properties for sale and rent across Sri Lanka with Greenbricks.",
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
    title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
    description: "Discover houses, apartments, land and commercial properties for sale and rent across Sri Lanka with Greenbricks.",
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
    site: "@GreenBricks12",
    creator: "@GreenBricks12",
    title: "Property for Sale & Rent in Sri Lanka | Greenbricks",
    description: "Search properties for sale, rent, and commercial real estate across Sri Lanka.",
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
                  "@type": "Organization",
                  "@id": "https://greenbrickz.com/#organization",
                  "name": "Greenbricks",
                  "description": "Sri Lanka's real estate marketplace connecting property buyers, renters, landlords, sellers, and agents across all 25 districts.",
                  "url": "https://greenbrickz.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://greenbrickz.com/GreenBricksLogo.png",
                  },
                  "sameAs": [
                    "https://web.facebook.com/GreenBrickz",
                    "https://www.instagram.com/greenbricksl/",
                    "https://x.com/GreenBricks12",
                    "https://www.youtube.com/@Greenbricks12",
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
