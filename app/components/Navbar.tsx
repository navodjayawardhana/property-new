"use client";
import { useState, useEffect } from "react";
import { Search, Menu, X, Bell, Heart, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-9 h-9">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                <rect width="36" height="36" rx="9" fill="#C8102E"/>
                <path d="M18 7L30 16V29H23V21H13V29H6V16L18 7Z" fill="white"/>
                <rect x="14.5" y="21" width="7" height="8" fill="#C8102E"/>
                <circle cx="26" cy="10" r="4" fill="#D4AF37"/>
                <text x="24.3" y="12.5" fontFamily="Arial" fontSize="5.5" fontWeight="800" fill="white">S</text>
              </svg>
            </div>
            <div className="leading-tight">
              <div className={`font-black text-lg tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
                SERENDIB
              </div>
              <div className={`text-[10px] font-semibold tracking-[3px] -mt-0.5 transition-colors ${scrolled ? "text-[#C8102E]" : "text-red-300"}`}>
                REAL ESTATE
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {["Buy", "Rent", "Sold", "New Homes"].map((item) => (
              <a
                key={item}
                href="#"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                  scrolled ? "text-gray-700 hover:text-[#C8102E] hover:bg-red-50" : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {item}
              </a>
            ))}
            <a
              href="#"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                scrolled ? "text-gray-700 hover:text-[#C8102E] hover:bg-red-50" : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Find Agents <ChevronDown className="w-3.5 h-3.5"/>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-colors ${scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/10"}`}>
              <Heart className="w-5 h-5"/>
            </button>
            <button className={`p-2 rounded-lg transition-colors ${scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/10"}`}>
              <Bell className="w-5 h-5"/>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"/>
            <button className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}>
              Sign In
            </button>
            <button className="bg-[#C8102E] hover:bg-[#9b0d22] text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-red-900/20">
              List Property
            </button>
          </div>

          {/* Mobile */}
          <button
            className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-gray-800" : "text-white"}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <nav className="flex flex-col p-4 gap-1">
            {["Buy", "Rent", "Sold", "New Homes", "Find Agents"].map((item) => (
              <a key={item} href="#" className="px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#C8102E] hover:bg-red-50 transition-colors">
                {item}
              </a>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 flex gap-2">
              <button className="flex-1 text-center py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700">Sign In</button>
              <button className="flex-1 text-center py-2.5 rounded-xl bg-[#C8102E] text-sm font-bold text-white">List Property</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
