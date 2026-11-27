import type { Metadata } from "next";
import HomeLoansPageClient from "./HomeLoansPageClient";

export const metadata: Metadata = {
  title: "Home Loan Rates in Sri Lanka | Compare Mortgages | Greenbricks",
  description: "Compare indicative home loan interest rates from Sri Lankan banks and estimate monthly housing loan repayments with our mortgage calculator.",
  keywords: "home loans Sri Lanka, property loan Sri Lanka, mortgage rates, housing loan calculator",
  alternates: { canonical: "https://greenbrickz.com/home-loans" },
  openGraph: {
    title: "Home Loan Rates in Sri Lanka | Compare Mortgages | Greenbricks",
    description: "Compare mortgage rates across Sri Lankan banks and calculate monthly repayments.",
    url: "https://greenbrickz.com/home-loans",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Compare Home Loan Rates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Loan Rates in Sri Lanka | Compare Mortgages | Greenbricks",
    description: "Compare housing loan rates and estimate monthly repayments in Sri Lanka.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

export default function HomeLoansPage() {
  return <HomeLoansPageClient />;
}
