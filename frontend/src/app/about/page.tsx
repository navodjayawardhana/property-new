import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Greenbricks | Sri Lanka's No.1 Property Site",
  description: "Learn about Greenbricks, Sri Lanka's leading property portal. Discover our mission, vision, and commitment to connecting buyers and sellers.",
  keywords: "about Greenbricks, real estate platform, property company",
  openGraph: {
    title: "About Greenbricks",
    description: "Learn about Greenbricks, Sri Lanka's leading property portal.",
    url: "https://greenbricks.net/about",
    type: "website",
  },
};

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">

          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider mb-3">About Us</p>
          <h1 className="text-3xl font-black text-gray-900 leading-snug mb-10">
            We believe finding your perfect property in Sri Lanka should be simple, transparent, and stress-free.
          </h1>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Greenbricks is Sri Lanka&apos;s No.1 property search platform, built to connect buyers, renters, sellers, and developers in one place. Whether you are searching for your first home, a commercial space, or the right investment property, Greenbricks gives you access to thousands of verified listings across the island.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are a Sri Lankan platform, built for Sri Lankan property seekers. Our team understands the local market — from Colombo&apos;s bustling apartment scene to land opportunities in the Southern and Western Provinces — and we are committed to making every property search faster, clearer, and more reliable.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">What We Offer</h2>
            <ul className="space-y-2.5">
              {[
                "Thousands of properties for sale, rent, and lease across Sri Lanka",
                "New homes and off-plan developments from leading developers",
                "Commercial property listings including offices, retail spaces, and warehouses",
                "A growing network of verified real estate agents",
                "Tools to help you make smarter property decisions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="text-[#16a34a] font-bold mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To make Sri Lanka&apos;s property market more accessible, more honest, and easier to navigate — for every buyer, renter, seller, and agent on the island.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Why Greenbricks</h2>
            <ul className="space-y-2.5">
              {[
                "Sri Lankan platform built for the local market",
                "Easy-to-use search with detailed filters",
                "Listings directly from agents and developers",
                "Tools including mortgage calculator and suburb profiles",
                "Trusted by thousands of property seekers across Sri Lanka",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="text-[#16a34a] font-bold mt-0.5 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-gray-600 mb-4">
              Have a question or want to list your property? Visit our Contact page or reach us through our social channels. We are always happy to help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#16a34a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors text-sm"
            >
              Contact Us
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
