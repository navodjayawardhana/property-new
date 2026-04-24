"use client";

import Link from "next/link";
import { useState } from "react";

const footerTabs = [
  "Real estate",
  "New homes",
  "Popular areas",
  "Popular searches",
] as const;

const stateLinks = [
  "Real estate Colombo",
  "Real estate Gampaha",
  "Real estate Kalutara",
  "Real estate Kandy",
  "Real estate Matale",
  "Real estate Nuwara Eliya",
  "Real estate Galle",
  "Real estate Matara",
  "Real estate Hambantota",
  "Real estate Jaffna",
  "Real estate Kilinochchi",
  "Real estate Mannar",
  "Real estate Mullaitivu",
  "Real estate Vavuniya",
  "Real estate Trincomalee",
  "Real estate Batticaloa",
  "Real estate Ampara",
  "Real estate Kurunegala",
  "Real estate Puttalam",
  "Real estate Anuradhapura",
  "Real estate Polonnaruwa",
  "Real estate Badulla",
  "Real estate Monaragala",
  "Real estate Ratnapura",
  "Real estate Kegalle",
];

const buyLinks = [
  "Property for sale Colombo",
  "Property for sale Gampaha",
  "Property for sale Kalutara",
  "Property for sale Kandy",
  "Property for sale Matale",
  "Property for sale Nuwara Eliya",
  "Property for sale Galle",
  "Property for sale Matara",
  "Property for sale Hambantota",
  "Property for sale Jaffna",
  "Property for sale Kilinochchi",
  "Property for sale Mannar",
  "Property for sale Mullaitivu",
  "Property for sale Vavuniya",
  "Property for sale Trincomalee",
  "Property for sale Batticaloa",
  "Property for sale Ampara",
  "Property for sale Kurunegala",
  "Property for sale Puttalam",
  "Property for sale Anuradhapura",
  "Property for sale Polonnaruwa",
  "Property for sale Badulla",
  "Property for sale Monaragala",
  "Property for sale Ratnapura",
  "Property for sale Kegalle",
];

const popularAreas = [
  "Colombo 1",
  "Colombo 2",
  "Colombo 3",
  "Colombo 4",
  "Colombo 5",
  "Colombo 6",
  "Colombo 7",
  "Colombo 8",
  "Colombo 9",
  "Colombo 10",
  "Colombo 11",
  "Colombo 12",
  "Colombo 13",
  "Colombo 14",
  "Colombo 15",
  "Maharagama",
  "Thalawathugoda",
  "Mount Lavinia",
  "Nugegoda",
  "Kottawa",
  "Piliyandala",
  "Homagama",
  "Ratnapura",
  "Kurunegala",
  "Kandy",
  "Galle",
  "Matara",
  "Hikkaduwa",
  "Kalutara",
  "Bandarawela",
  "Anuradhapura",
  "Trincomalee",
  "Negombo",
  "Gampaha",
  "Nuwara Eliya",
  "Moratuwa",
  "Dehiwala",
  "Nawala",
];

const popularSearches = [
  "Houses for sale",
  "Apartments for sale",
  "Townhouses for sale",
  "Land for sale",
  "Rural properties",
  "Houses for rent",
  "Apartments for rent",
  "Townhouses for rent",
  "New houses",
  "New apartments",
  "Off-the-plan",
  "House and land packages",
  "Acreage for sale",
  "Farms for sale",
  "Waterfront properties",
  "Beachfront homes",
];

const tabLinks: Record<string, string[]> = {
  "Real estate": stateLinks,
  "New homes": buyLinks,
  "Popular areas": popularAreas,
  "Popular searches": popularSearches,
};

const tabHeadings: Record<string, string> = {
  "Real estate": "Real estate in Sri Lanka",
  "New homes": "Properties for sale in Sri Lanka",
  "Popular areas": "Popular areas in Sri Lanka",
  "Popular searches": "Popular searches",
};

export default function Footer() {
  const [activeTab, setActiveTab] =
    useState<(typeof footerTabs)[number]>("Real estate");
  const links = tabLinks[activeTab];

  return (
    <footer className="bg-white mt-12">
      {/* Tabbed link section */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tab headers */}
          <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
            {footerTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#16a34a] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Links grid */}
          <div className="py-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">
              {tabHeadings[activeTab]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-3 gap-x-8">
              {links.map((link) => (
                <Link
                  key={link}
                  href="/"
                  className="text-sm text-gray-900 hover:underline hover:text-gray-600"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social + utility links */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              {
                label: "Facebook",
                href: "https://web.facebook.com/greenbricksl/",
                path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/greenbricksl/",
                path: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.216 4 20 5.784 20 7.75v8.5C20 18.216 18.216 20 16.25 20h-8.5C5.784 20 4 18.216 4 16.25v-8.5C4 5.784 5.784 4 7.75 4zm9.25 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
              },
              {
                label: "X",
                path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
              },
              {
                label: "Pinterest",
                path: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z",
              },
              {
                label: "LinkedIn",
                path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
              },
              {
                label: "YouTube",
                path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
              },
            ].map(({ label, path }) => (
              <Link
                key={label}
                href="/"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={path} />
                </svg>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {[
              "Advertise with us",
              "Contact us",
              // "Ignite",
              "Agent admin",
              // "Media sales",
              "Legal",
              "Privacy settings",
              "Privacy centre",
              "Site map",
              "Careers",
            ].map((item) => (
              <Link
                key={item}
                href="/"
                className="hover:text-gray-800 hover:underline whitespace-nowrap"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* REA Group logos + bottom */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          {/* Logos */}
          <div className="flex flex-wrap items-center gap-5 mb-4">
            {[
              { name: "REA Group", color: "#16a34a" },
              { name: "Greenbrick.net", color: "#16a34a" },
              { name: "realcommercial.com.au", color: "#0066cc" },
              { name: "PropTrack", color: "#222" },
              { name: "Flatmates", color: "#e55c00" },
              { name: "Mortgage Choice", color: "#003366" },
              { name: "property", color: "#333" },
            ].map((brand) => (
              <span
                key={brand.name}
                className="text-xs font-bold px-2 py-1 border border-gray-300 rounded"
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            ))}
          </div>

          {/* International + partner */}
          <div className="text-xs text-gray-500 space-y-1.5">
            <div>
              <span className="font-semibold text-gray-700">
                International sites
              </span>{" "}
              <Link
                href="/"
                className="text-gray-900 hover:underline hover:text-gray-600"
              >
                Sri Lanka
              </Link>
              {" | "}
              <Link
                href="/"
                className="text-gray-900 hover:underline hover:text-gray-600"
              >
                Australia
              </Link>
              {" | "}
              <Link
                href="/"
                className="text-gray-900 hover:underline hover:text-gray-600"
              >
                United Arab Emirates{" "}
              </Link>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Partner sites</span>{" "}
              {[
                "news.com.au",
                "foxsports.com.au",
                "Mansion Global",
                "askizzy.org.au",
                "proptiger.com",
              ].map((s, i, arr) => (
                <span key={s}>
                  <Link
                    href="/"
                    className="text-gray-900 hover:underline hover:text-gray-600"
                  >
                    {s}
                  </Link>
                  {i < arr.length - 1 && " | "}
                </span>
              ))}
            </div>
            <p className="text-gray-400 pt-1">
              Greenbrick.net is owned and operated by ASX-listed REA Group Ltd
              (REA:ASX) © REA Group Ltd. By accessing or using our platform, you
              agree to our{" "}
              <Link
                href="/"
                className="text-gray-900 hover:underline hover:text-gray-600"
              >
                Terms of Use.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
