"use client";
import { useState, useEffect } from "react";
import { Menu, X, Heart, ChevronDown } from "lucide-react";

const navLinks = ["Buy", "Rent", "Sold", "New Homes"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = scrolled || open;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <path d="M16 5L27 13.5V27H21V19H11V27H5V13.5L16 5Z" fill="white"/>
                <rect x="12" y="19" width="8" height="8" fill="#C8102E"/>
              </svg>
            </div>
            <div>
              <span className={`font-black text-base tracking-wide block leading-none transition-colors ${isLight ? "text-gray-900" : "text-white"}`}>
                SERENDIB
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-[#C8102E] block">
                REAL ESTATE
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((item) => (
              <a
                key={item}
                href="#"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isLight
                    ? "text-gray-600 hover:text-[#C8102E] hover:bg-red-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item}
              </a>
            ))}
            <a
              href="#"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                isLight
                  ? "text-gray-600 hover:text-[#C8102E] hover:bg-red-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Agents <ChevronDown className="w-3.5 h-3.5 opacity-60"/>
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-colors ${isLight ? "text-gray-500 hover:bg-gray-100" : "text-white/70 hover:bg-white/10"}`}>
              <Heart className="w-4.5 h-4.5"/>
            </button>
            <div className={`w-px h-5 mx-1 ${isLight ? "bg-gray-200" : "bg-white/20"}`}/>
            <button className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${isLight ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}>
              Sign In
            </button>
            <button className="bg-[#C8102E] hover:bg-[#9b0d22] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              List Property
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-lg ${isLight ? "text-gray-700" : "text-white"}`}
          >
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-5 py-4 flex flex-col gap-1">
            {[...navLinks, "Agents"].map((item) => (
              <a key={item} href="#" className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-[#C8102E] hover:bg-red-50">
                {item}
              </a>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700">Sign In</button>
              <button className="flex-1 py-2.5 rounded-lg bg-[#C8102E] text-sm font-bold text-white">List Property</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
