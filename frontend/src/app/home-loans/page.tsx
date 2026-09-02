import type { Metadata } from "next";
import HomeLoansPageClient from "./HomeLoansPageClient";

export const metadata: Metadata = {
  title: "Compare Home Loan Rates in Sri Lanka | Best Mortgage Rates | Greenbricks",
  description: "Compare home loan interest rates from top banks in Sri Lanka. Use our mortgage calculator to estimate monthly payments and find the best loan offer for your budget.",
  keywords: "home loans Sri Lanka, mortgage rates, home loan calculator, bank interest rates, housing loan, pre-approval",
  openGraph: {
    title: "Compare Home Loan Rates in Sri Lanka | Greenbricks",
    description: "Compare mortgage rates from multiple banks and calculate monthly payments using our home loan calculator.",
    url: "https://greenbricks.net/home-loans",
    type: "website",
    images: [
      {
        url: "https://greenbricks.net/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks - Compare Home Loan Rates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Home Loan Rates in Sri Lanka | Greenbricks",
    description: "Find the best mortgage rates and compare home loans from Sri Lankan banks.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function HomeLoansPage() {
  return <HomeLoansPageClient />;
}
