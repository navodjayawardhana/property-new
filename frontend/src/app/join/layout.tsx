import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Greenbricks | Create an Account",
  description: "Register as a buyer, seller, landlord or real estate agent on Greenbricks.",
  robots: { index: false, follow: false },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
