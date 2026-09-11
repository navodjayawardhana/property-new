import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { DISTRICTS } from "@/lib/districts";

export const metadata: Metadata = {
  title: "Site Map | Every Page on Greenbricks",
  description:
    "Browse every section of Greenbricks — property for sale and rent in all 25 Sri Lankan districts, commercial listings, new homes, agents, home loans and tools.",
  keywords: "Greenbricks site map, property search Sri Lanka, all districts",
  alternates: { canonical: "https://greenbrickz.com/sitemap-page" },
  openGraph: {
    title: "Site Map | Greenbricks",
    description: "Every section of Greenbricks in one place.",
    url: "https://greenbrickz.com/sitemap-page",
    type: "website",
    images: [
      {
        url: "https://greenbrickz.com/GreenBricksLogo.png",
        width: 1200,
        height: 630,
        alt: "Greenbricks — Sri Lanka property portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Map | Greenbricks",
    description: "Every section of Greenbricks in one place.",
    images: ["https://greenbrickz.com/GreenBricksLogo.png"],
  },
};

const SECTIONS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Search property",
    links: [
      { label: "Property for sale", href: "/buy" },
      { label: "Property for rent", href: "/rent" },
      { label: "Recently sold property", href: "/sold" },
      { label: "New homes & off-plan", href: "/new-homes" },
      { label: "Commercial property", href: "/commercial" },
    ],
  },
  {
    heading: "Agents & finance",
    links: [
      { label: "Find a real estate agent", href: "/agents" },
      { label: "Compare home loan rates", href: "/home-loans" },
      { label: "Get home loan pre-approval", href: "/home-loans/pre-approval" },
      { label: "Apply for a home loan", href: "/home-loans/apply" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Mortgage calculator", href: "/tools/mortgage-calculator" },
      { label: "Property valuation", href: "/tools/property-valuation" },
      { label: "Suburb profiles", href: "/tools/suburb-profiles" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Greenbricks", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Property news", href: "/news" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Privacy centre", href: "/privacy-centre" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
      { label: "Legal information", href: "/legal" },
    ],
  },
];

/**
 * Human-readable site map. Complements /sitemap.xml by giving every district
 * landing page at least one crawlable internal link from a static page, so
 * nothing depends on the footer's tabbed UI to be discovered.
 */
export default function SiteMapPage() {
  const byProvince = DISTRICTS.reduce<Record<string, typeof DISTRICTS>>((acc, d) => {
    (acc[d.province] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Site Map" }]} />

      <main className="max-w-7xl mx-auto px-4 pb-14 w-full flex-1">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Site Map</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Every section of Greenbricks in one place — including property for sale and rent in
          all 25 districts of Sri Lanka.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                {section.heading}
              </h2>
              <ul className="space-y-2">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-600 hover:text-[#16a34a] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Property by district</h2>
          <p className="text-sm text-gray-500 mb-6">
            All 25 districts, grouped by province.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(byProvince).map(([province, districts]) => (
              <div key={province}>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  {province} Province
                </h3>
                <ul className="space-y-2">
                  {districts.map((d) => (
                    <li key={d.slug} className="text-sm">
                      <Link href={`/buy/${d.slug}`} className="text-gray-700 hover:text-[#16a34a] hover:underline font-medium">
                        {d.name}
                      </Link>
                      <span className="text-gray-300 mx-1.5">·</span>
                      <Link href={`/buy/${d.slug}`} className="text-gray-500 hover:text-[#16a34a] hover:underline">
                        for sale
                      </Link>
                      <span className="text-gray-300 mx-1.5">·</span>
                      <Link href={`/rent/${d.slug}`} className="text-gray-500 hover:text-[#16a34a] hover:underline">
                        for rent
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
