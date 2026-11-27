import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Portal | Greenbricks",
  robots: { index: false, follow: false },
};

export default function AgentAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
