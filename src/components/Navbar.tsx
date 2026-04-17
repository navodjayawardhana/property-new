"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Sold", href: "/sold" },
  { label: "New homes", href: "/buy" },
  { label: "Find agents", href: "/" },
  { label: "Home loans", href: "/" },
  { label: "News", href: "/news" },
  { label: "Commercial", href: "/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Greenbrick.net" width={140} height={44} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}
              className="px-2.5 py-1.5 text-sm text-gray-700 hover:text-[#121e80] rounded transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="/signin" className="text-sm text-gray-700 hover:text-[#121e80] transition-colors font-medium">
            Sign in
          </Link>
          <Link href="/join"
            className="bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors">
            Join
          </Link>
        </div>

        <button className="lg:hidden text-gray-700 ml-auto" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-white px-4 pb-4">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}
              className="block py-2.5 text-sm text-gray-700 border-b border-gray-100 last:border-0"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-3">
            <Link href="/signin" className="text-sm font-medium text-gray-700">Sign in</Link>
            <Link href="/join" className="bg-[#121e80] text-white text-sm font-bold px-4 py-1.5 rounded-full">Join</Link>
          </div>
        </div>
      )}
    </header>
  );
}
