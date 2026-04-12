"use client";
import { useState } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="sm" variant="full" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-red-600 transition-colors">Buy</a>
            <a href="#" className="hover:text-red-600 transition-colors">Rent</a>
            <a href="#" className="hover:text-red-600 transition-colors">Sold</a>
            <a href="#" className="hover:text-red-600 transition-colors">Find Agents</a>
            <a href="#" className="hover:text-red-600 transition-colors">News</a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
              Sign In
            </button>
            <button className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-red-700 transition-colors">
              Register
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3 pt-4 text-sm font-medium text-gray-700">
              <a href="#" className="hover:text-red-600">Buy</a>
              <a href="#" className="hover:text-red-600">Rent</a>
              <a href="#" className="hover:text-red-600">Sold</a>
              <a href="#" className="hover:text-red-600">Find Agents</a>
              <a href="#" className="hover:text-red-600">News</a>
              <div className="flex gap-3 pt-2">
                <button className="text-gray-700 font-medium">Sign In</button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">Register</button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
