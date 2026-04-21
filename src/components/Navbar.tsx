"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Sold", href: "/sold" },
  { label: "New homes", href: "/buy" },
  { label: "Find agents", href: "/agents" },
  { label: "Home loans", href: "/" },
  { label: "News", href: "/news" },
  { label: "Commercial", href: "/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#121e80] transition-colors font-medium"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#121e80] flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span>{user.name.split(" ")[0]}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link href={`/dashboard/${user.role}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <UserIcon size={14} /> Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/dashboard/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                      <Shield size={14} /> Admin Panel
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <UserIcon size={14} /> My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-gray-700 hover:text-[#121e80] transition-colors font-medium">
                Sign in
              </Link>
              <Link href="/join"
                className="bg-[#121e80] hover:bg-[#0d1660] text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors">
                Join
              </Link>
            </>
          )}
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
            {user ? (
              <button onClick={() => logout()} className="text-sm font-medium text-red-600">
                Sign out
              </button>
            ) : (
              <>
                <Link href="/signin" className="text-sm font-medium text-gray-700">Sign in</Link>
                <Link href="/join" className="bg-[#121e80] text-white text-sm font-bold px-4 py-1.5 rounded-full">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
