import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Mortgage Calculator Sri Lanka | Estimate Monthly Repayments | Greenbricks",
  description: "Free mortgage calculator for Sri Lanka. Estimate your monthly home loan repayment, total interest and total cost by loan amount, interest rate and term.",
  keywords: "mortgage calculator Sri Lanka, home loan repayment calculator, loan interest calculator",
  alternates: { canonical: "https://greenbricks.net/tools/mortgage-calculator" },
  openGraph: {
    title: "Mortgage Calculator Sri Lanka | Estimate Monthly Repayments | Greenbricks",
    description: "Free mortgage calculator for Sri Lanka. Estimate your monthly home loan repayment, total interest and total cost by loan amount, interest rate and term.",
    url: "https://greenbricks.net/tools/mortgage-calculator",
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
    title: "Mortgage Calculator Sri Lanka | Estimate Monthly Repayments | Greenbricks",
    description: "Free mortgage calculator for Sri Lanka. Estimate your monthly home loan repayment, total interest and total cost by loan amount, interest rate and term.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function ToolsMortgageCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
