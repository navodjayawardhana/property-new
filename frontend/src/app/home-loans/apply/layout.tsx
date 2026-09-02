import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Apply for a Home Loan in Sri Lanka | Greenbricks",
  description: "Apply online for a home loan with your chosen Sri Lankan bank. Compare your rate, monthly repayment and term, then submit your application in minutes.",
  keywords: "apply home loan Sri Lanka, housing loan application, bank home loan",
  alternates: { canonical: "https://greenbricks.net/home-loans/apply" },
  openGraph: {
    title: "Apply for a Home Loan in Sri Lanka | Greenbricks",
    description: "Apply online for a home loan with your chosen Sri Lankan bank. Compare your rate, monthly repayment and term, then submit your application in minutes.",
    url: "https://greenbricks.net/home-loans/apply",
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
    title: "Apply for a Home Loan in Sri Lanka | Greenbricks",
    description: "Apply online for a home loan with your chosen Sri Lankan bank. Compare your rate, monthly repayment and term, then submit your application in minutes.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function HomeLoansApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
