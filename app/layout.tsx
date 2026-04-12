import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serendib Real Estate — Find Properties Worldwide",
  description: "Search international properties for sale and rent with Serendib Real Estate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
