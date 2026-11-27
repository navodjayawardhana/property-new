import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Greenbricks",
  robots: { index: false, follow: false },
};

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
