import type { Metadata } from "next";

// page.tsx in this segment is a client component and cannot export metadata,
// so it lives here instead.
export const metadata: Metadata = {
  title: "Home Loan Pre-Approval in Sri Lanka | Greenbricks",
  description: "Get pre-approved for a home loan before you start house hunting. Submit one form and a lending specialist will confirm your borrowing power within 24–48 hours.",
  keywords: "home loan pre-approval Sri Lanka, mortgage pre-approval, borrowing power",
  alternates: { canonical: "https://greenbricks.net/home-loans/pre-approval" },
  openGraph: {
    title: "Home Loan Pre-Approval in Sri Lanka | Greenbricks",
    description: "Get pre-approved for a home loan before you start house hunting. Submit one form and a lending specialist will confirm your borrowing power within 24–48 hours.",
    url: "https://greenbricks.net/home-loans/pre-approval",
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
    title: "Home Loan Pre-Approval in Sri Lanka | Greenbricks",
    description: "Get pre-approved for a home loan before you start house hunting. Submit one form and a lending specialist will confirm your borrowing power within 24–48 hours.",
    images: ["https://greenbricks.net/GreenBricksLogo.png"],
  },
};

export default function HomeLoansPreApprovalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
