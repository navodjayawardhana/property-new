"use client";
import { useState, useEffect } from "react";
import { Menu, X, Heart, ChevronDown, Calculator, FileText, MapPin } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Sold", href: "/sold" },
  { label: "New Homes", href: "/new-homes" },
];

const toolsLinks = [
  { label: "Mortgage Calculator", href: "/tools/mortgage-calculator", icon: Calculator },
  { label: "Property Valuation", href: "/tools/property-valuation", icon: FileText },
  { label: "Suburb Profiles", href: "/tools/suburb-profiles", icon: MapPin },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="GreenBrick.net" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/agents"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50 transition-colors"
            >
              Agents
            </Link>
            <Link
              href="/news"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50 transition-colors"
            >
              News
            </Link>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTools(!showTools)}
                onBlur={() => setTimeout(() => setShowTools(false), 150)}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50 transition-colors flex items-center gap-1"
              >
                Tools <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${showTools ? "rotate-180" : ""}`}/>
              </button>
              {showTools && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {toolsLinks.map((tool) => (
                    <Link
                      key={tool.label}
                      href={tool.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-[#4CD137] hover:bg-green-50"
                    >
                      <tool.icon className="w-4 h-4" />
                      {tool.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-500 hover:text-[#4CD137] hover:bg-green-50 transition-colors">
              <Heart className="w-5 h-5"/>
            </button>
            <div className="w-px h-5 mx-1 bg-gray-200"/>
            <button className="text-sm font-semibold px-3 py-1.5 rounded-lg text-gray-700 hover:text-[#4CD137] hover:bg-green-50 transition-colors">
              Sign In
            </button>
            <Link href="/tools/property-valuation" className="bg-[#4CD137] hover:bg-[#3da82d] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm">
              List Property
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-green-50"
          >
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-5 py-4 flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50">
                {item.label}
              </Link>
            ))}
            <Link href="/agents" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50">
              Agents
            </Link>
            <Link href="/news" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50">
              News
            </Link>
            <div className="border-t border-gray-100 mt-2 pt-2">
              <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Tools</p>
              {toolsLinks.map((tool) => (
                <Link key={tool.label} href={tool.href} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#4CD137] hover:bg-green-50 flex items-center gap-2">
                  <tool.icon className="w-4 h-4" />
                  {tool.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-[#4CD137] hover:text-[#4CD137]">Sign In</button>
              <Link href="/tools/property-valuation" className="flex-1 py-2.5 rounded-lg bg-[#4CD137] text-sm font-bold text-white text-center hover:bg-[#3da82d]">List Property</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
