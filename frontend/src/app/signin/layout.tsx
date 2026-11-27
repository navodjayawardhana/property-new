import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Greenbricks",
  description: "Sign in to your Greenbricks account to manage saved properties and listings.",
  robots: { index: false, follow: false },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
