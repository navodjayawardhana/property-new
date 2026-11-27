import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertisement Manager | Greenbricks",
  robots: { index: false, follow: false },
};

export default function AdvertisementManagerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
