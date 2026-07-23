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

const footerLinkMap: Record<string, string> = {
  // Real estate links - map to buy page with suburb filter
  "Real estate Colombo": "/buy?suburb=Colombo",
  "Real estate Gampaha": "/buy?suburb=Gampaha",
  "Real estate Kalutara": "/buy?suburb=Kalutara",
  "Real estate Kandy": "/buy?suburb=Kandy",
  "Real estate Matale": "/buy?suburb=Matale",
  "Real estate Nuwara Eliya": "/buy?suburb=Nuwara%20Eliya",
  "Real estate Galle": "/buy?suburb=Galle",
  "Real estate Matara": "/buy?suburb=Matara",
  "Real estate Hambantota": "/buy?suburb=Hambantota",
  "Real estate Jaffna": "/buy?suburb=Jaffna",
  "Real estate Kilinochchi": "/buy?suburb=Kilinochchi",
  "Real estate Mannar": "/buy?suburb=Mannar",
  "Real estate Mullaitivu": "/buy?suburb=Mullaitivu",
  "Real estate Vavuniya": "/buy?suburb=Vavuniya",
  "Real estate Trincomalee": "/buy?suburb=Trincomalee",
  "Real estate Batticaloa": "/buy?suburb=Batticaloa",
  "Real estate Ampara": "/buy?suburb=Ampara",
  "Real estate Kurunegala": "/buy?suburb=Kurunegala",
  "Real estate Puttalam": "/buy?suburb=Puttalam",
  "Real estate Anuradhapura": "/buy?suburb=Anuradhapura",
  "Real estate Polonnaruwa": "/buy?suburb=Polonnaruwa",
  "Real estate Badulla": "/buy?suburb=Badulla",
  "Real estate Monaragala": "/buy?suburb=Monaragala",
  "Real estate Ratnapura": "/buy?suburb=Ratnapura",
  "Real estate Kegalle": "/buy?suburb=Kegalle",

  // New homes links
  "New apartments Colombo": "/new-homes?suburb=Colombo",
  "New apartments Kandy": "/new-homes?suburb=Kandy",
  "New apartments Galle": "/new-homes?suburb=Galle",
  "New apartments Negombo": "/new-homes?suburb=Negombo",
  "House & land packages Colombo": "/new-homes?type=House%20%26%20land",
  "House & land packages Kandy": "/new-homes?type=House%20%26%20land&suburb=Kandy",
  "House & land packages Gampaha": "/new-homes?type=House%20%26%20land&suburb=Gampaha",
  "Display homes Colombo": "/new-homes?type=Display%20homes",
  "Display homes Negombo": "/new-homes?type=Display%20homes&suburb=Negombo",
  "Display homes Kandy": "/new-homes?type=Display%20homes&suburb=Kandy",
  "Off-the-plan Colombo": "/new-homes?type=Off-plan",
  "Off-the-plan Kandy": "/new-homes?type=Off-plan&suburb=Kandy",
  "Off-the-plan Galle": "/new-homes?type=Off-plan&suburb=Galle",
  "New townhouses Colombo": "/new-homes?property_type=Townhouse",
  "New villas Colombo": "/new-homes?property_type=Villa",
  "New villas Galle": "/new-homes?property_type=Villa&suburb=Galle",
  "Luxury apartments Colombo": "/new-homes?type=Luxury",
  "Condominiums Colombo": "/new-homes?property_type=Apartment",
  "Penthouses Colombo": "/new-homes?type=Penthouses",
  "Serviced apartments Colombo": "/new-homes?type=Serviced",
  "Studio apartments Colombo": "/new-homes?property_type=Studio",
  "Project homes Colombo": "/new-homes?type=Project%20homes",

  // Popular areas - link to buy with suburb
  "Colombo 1 – Fort": "/buy?suburb=Colombo%201",
  "Colombo 2 – Slave Island": "/buy?suburb=Colombo%202",
  "Colombo 3 – Kollupitiya": "/buy?suburb=Colombo%203",
  "Colombo 4 – Bambalapitiya": "/buy?suburb=Colombo%204",
  "Colombo 5 – Havelock Town": "/buy?suburb=Colombo%205",
  "Colombo 6 – Wellawatta": "/buy?suburb=Colombo%206",
  "Colombo 7 – Cinnamon Gardens": "/buy?suburb=Colombo%207",
  "Colombo 8 – Borella": "/buy?suburb=Colombo%208",
  "Colombo 10 – Maradana": "/buy?suburb=Colombo%2010",
  "Colombo 11 – Pettah": "/buy?suburb=Colombo%2011",
  "Colombo 15 – Modera": "/buy?suburb=Colombo%2015",
  "Maharagama": "/buy?suburb=Maharagama",
  "Nugegoda": "/buy?suburb=Nugegoda",
  "Thalawathugoda": "/buy?suburb=Thalawathugoda",
  "Kottawa": "/buy?suburb=Kottawa",
  "Piliyandala": "/buy?suburb=Piliyandala",
  "Moratuwa": "/buy?suburb=Moratuwa",
  "Dehiwala": "/buy?suburb=Dehiwala",
  "Mount Lavinia": "/buy?suburb=Mount%20Lavinia",
  "Nawala": "/buy?suburb=Nawala",
  "Battaramulla": "/buy?suburb=Battaramulla",
  "Malabe": "/buy?suburb=Malabe",
  "Kaduwela": "/buy?suburb=Kaduwela",
  "Sri Jayawardenepura Kotte": "/buy?suburb=Sri%20Jayawardenepura%20Kotte",
  "Homagama": "/buy?suburb=Homagama",
  "Negombo": "/buy?suburb=Negombo",
  "Wattala": "/buy?suburb=Wattala",
  "Ja-Ela": "/buy?suburb=Ja-Ela",
  "Kelaniya": "/buy?suburb=Kelaniya",
  "Gampaha": "/buy?suburb=Gampaha",
  "Kandy": "/buy?suburb=Kandy",
  "Peradeniya": "/buy?suburb=Peradeniya",
  "Galle": "/buy?suburb=Galle",
  "Matara": "/buy?suburb=Matara",
  "Hikkaduwa": "/buy?suburb=Hikkaduwa",
  "Unawatuna": "/buy?suburb=Unawatuna",

  // Popular searches
  "Houses for sale": "/buy?property_type=House",
  "Apartments for sale": "/buy?property_type=Apartment",
  "Townhouses for sale": "/buy?property_type=Townhouse",
  "Villas for sale": "/buy?property_type=Villa",
  "Land for sale": "/buy?property_type=Land",
  "Commercial property for sale": "/commercial",
  "Industrial property for sale": "/commercial?type=Industrial",
  "Houses for rent": "/rent?property_type=House",
  "Apartments for rent": "/rent?property_type=Apartment",
  "Villas for rent": "/rent?property_type=Villa",
  "Townhouses for rent": "/rent?property_type=Townhouse",
  "Office space for rent": "/commercial?type=Office",
  "Shop for rent": "/commercial?type=Shop",
  "Warehouse for rent": "/commercial?type=Warehouse",
  "New homes": "/new-homes",
  "Off-the-plan": "/new-homes?type=Off-plan",
  "House and land packages": "/new-homes?type=House%20%26%20land",
  "Display homes": "/new-homes?type=Display%20homes",
  "Luxury properties": "/buy?price_range=luxury",
  "Waterfront properties": "/buy?feature=waterfront",
  "Beachfront homes": "/buy?feature=beachfront",
  "Rural properties": "/buy?property_type=Rural",
  "Investment properties": "/buy?feature=investment",
  "Property management": "/contact",
  "Farms for sale": "/buy?property_type=Rural",
};

const SOCIAL = [
  { label: "Facebook",  href: "https://web.facebook.com/greenbrickssl/",   path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Instagram", href: "https://www.instagram.com/greenbricksl/",   path: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5C18.216 4 20 5.784 20 7.75v8.5C20 18.216 18.216 20 16.25 20h-8.5C5.784 20 4 18.216 4 16.25v-8.5C4 5.784 5.784 4 7.75 4zm9.25 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" },
  { label: "LinkedIn",  href: "#", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "TikTok",   href: "#", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { label: "YouTube",  href: "#", path: "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
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
                    : "border-transparent text-gray-500 hover:text-[#16a34a] hover:bg-gray-50"
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
              <Link key={link} href={footerLinkMap[link] || "/"}
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
              <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Visit Greenbricks on ${label}`} title={`Follow us on ${label}`}
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
            <Link href="/agent-admin"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-2 whitespace-nowrap transition-colors">
              Agent admin
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between sm:items-center">
          {/* copyright */}
          <p className="text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Greenbricks.&nbsp;&nbsp;All rights reserved.
          </p>

          {/* mobile: stacked center | desktop: single row right */}
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-x-3 text-[11px] text-gray-500">
            <div className="flex items-center gap-x-3">
              <Link href="/privacy" className="hover:text-[#16a34a] transition-colors">Privacy Policy</Link>
              <span className="text-gray-300">·</span>
              <Link href="/terms" className="hover:text-[#16a34a] transition-colors">Terms &amp; Conditions</Link>
              <span className="text-gray-300">·</span>
              <Link href="/cookies" className="hover:text-[#16a34a] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
