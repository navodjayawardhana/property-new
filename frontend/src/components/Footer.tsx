"use client";

import Link from "next/link";
import { useState } from "react";

const footerTabs = ["Real estate", "New homes", "Popular areas", "Popular searches"] as const;

const realEstateLinks = [
  "Real estate Colombo", "Real estate Gampaha", "Real estate Kalutara",
  "Real estate Kandy", "Real estate Matale", "Real estate Nuwara Eliya",
  "Real estate Galle", "Real estate Matara", "Real estate Hambantota",
  "Real estate Jaffna", "Real estate Kilinochchi", "Real estate Mannar",
  "Real estate Mullaitivu", "Real estate Vavuniya", "Real estate Trincomalee",
  "Real estate Batticaloa", "Real estate Ampara", "Real estate Kurunegala",
  "Real estate Puttalam", "Real estate Anuradhapura", "Real estate Polonnaruwa",
  "Real estate Badulla", "Real estate Monaragala", "Real estate Ratnapura",
  "Real estate Kegalle",
];

const newHomesLinks = [
  "New apartments Colombo", "New apartments Kandy", "New apartments Galle", "New apartments Negombo",
  "House & land packages Colombo", "House & land packages Kandy", "House & land packages Gampaha",
  "Display homes Colombo", "Display homes Negombo", "Display homes Kandy",
  "Off-the-plan Colombo", "Off-the-plan Kandy", "Off-the-plan Galle",
  "New townhouses Colombo", "New villas Colombo", "New villas Galle",
  "Luxury apartments Colombo", "Condominiums Colombo", "Penthouses Colombo",
  "Serviced apartments Colombo", "Studio apartments Colombo", "Project homes Colombo",
];

const popularAreas = [
  "Colombo 1 – Fort", "Colombo 2 – Slave Island", "Colombo 3 – Kollupitiya", "Colombo 4 – Bambalapitiya",
  "Colombo 5 – Havelock Town", "Colombo 6 – Wellawatta", "Colombo 7 – Cinnamon Gardens", "Colombo 8 – Borella",
  "Colombo 10 – Maradana", "Colombo 11 – Pettah", "Colombo 15 – Modera",
  "Maharagama", "Nugegoda", "Thalawathugoda", "Kottawa", "Piliyandala",
  "Moratuwa", "Dehiwala", "Mount Lavinia", "Nawala", "Battaramulla",
  "Malabe", "Kaduwela", "Sri Jayawardenepura Kotte", "Homagama",
  "Negombo", "Wattala", "Ja-Ela", "Kelaniya", "Gampaha",
  "Kandy", "Peradeniya", "Galle", "Matara", "Hikkaduwa", "Unawatuna",
];

const popularSearches = [
  "Houses for sale", "Apartments for sale", "Townhouses for sale", "Villas for sale",
  "Land for sale", "Commercial property for sale", "Industrial property for sale",
  "Houses for rent", "Apartments for rent", "Villas for rent", "Townhouses for rent",
  "Office space for rent", "Shop for rent", "Warehouse for rent",
  "New homes", "Off-the-plan", "House and land packages", "Display homes",
  "Luxury properties", "Waterfront properties", "Beachfront homes", "Rural properties",
  "Investment properties", "Property management", "Farms for sale",
];

const tabLinks: Record<string, string[]> = {
  "Real estate": realEstateLinks,
  "New homes": newHomesLinks,
  "Popular areas": popularAreas,
  "Popular searches": popularSearches,
};

const tabHeadings: Record<string, string> = {
  "Real estate": "Real estate in Sri Lanka",
  "New homes": "New homes in Sri Lanka",
  "Popular areas": "Popular areas in Sri Lanka",
  "Popular searches": "Popular searches",
};

const SOCIAL = [
  { label: "Facebook",  href: "https://web.facebook.com/greenbricksl/",  path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: "https://www.instagram.com/greenbricksl/", path: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.216 4 20 5.784 20 7.75v8.5C20 18.216 18.216 20 16.25 20h-8.5C5.784 20 4 18.216 4 16.25v-8.5C4 5.784 5.784 4 7.75 4zm9.25 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" },
];

export default function Footer() {
  const [activeTab, setActiveTab] = useState<(typeof footerTabs)[number]>("Real estate");
  const links = tabLinks[activeTab];

  return (
    <footer className="bg-white mt-12">

      {/* ── Tabbed link section ── */}
      <div className="border-t border-gray-200 w-full">
        <div className="w-full border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 w-full">
            {footerTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold text-center whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? "border-[#16a34a] text-gray-900 bg-green-50/40"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-7">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{tabHeadings[activeTab]}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-2.5 gap-x-6">
            {links.map((link) => (
              <Link key={link} href="/"
                className="text-sm text-gray-700 hover:text-[#16a34a] hover:underline underline-offset-2 break-words transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Social + utility bar ── */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {SOCIAL.map(({ label, path, href }) => (
              <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d={path} />
                </svg>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/about"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
              About us
            </Link>
            <Link href="/advertise"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
              Advertise with us
            </Link>
            <Link href="/contact"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
              Contact us
            </Link>
            <Link href="/dashboard/agent"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
              Agent admin
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            © {new Date().getFullYear()} Greenbricks. All rights reserved.{" "}
            By accessing or using our platform, you agree to our{" "}
            <Link href="/terms" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Terms of Use</Link>
            {", "}
            <Link href="/privacy" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Privacy Policy</Link>
            {" and "}
            <Link href="/cookies" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Cookie Policy</Link>.
           {/* <Link href="/" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">Privacy Policy</Link>. */}
              {" "}Developed by{" "}
              <Link href="http://esupport.live/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#16a34a] underline underline-offset-2 transition-colors">eSupport</Link>.
            </p>
        </div>
      </div>

    </footer>
  );
}
