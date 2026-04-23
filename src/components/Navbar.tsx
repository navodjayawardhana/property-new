"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, Shield, Home, TrendingUp, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/api";

type Role = User["role"];

const ROLE_META: Record<Role, { label: string; icon: React.ReactNode; ring: string; badge: string; avatar: string }> = {
  buyer:  { label: "Buyer",  icon: <Home      size={11} />, ring: "ring-blue-400",   badge: "bg-blue-100 text-blue-700",    avatar: "bg-blue-700"    },
  seller: { label: "Seller", icon: <TrendingUp size={11} />, ring: "ring-green-400",  badge: "bg-green-100 text-green-700",  avatar: "bg-green-700"   },
  agent:  { label: "Agent",  icon: <Briefcase  size={11} />, ring: "ring-purple-400", badge: "bg-purple-100 text-purple-700",avatar: "bg-purple-700"  },
  admin:  { label: "Admin",  icon: <Shield     size={11} />, ring: "ring-red-400",    badge: "bg-red-100 text-red-700",      avatar: "bg-red-700"     },
};

const navLinks = [
  { label: "Buy", href: "/buy" },
  { label: "Rent", href: "/rent" },
  { label: "Sold", href: "/sold" },
  { label: "New homes", href: "/new-homes" },
  { label: "Find agents", href: "/agents" },
  { label: "Home loans", href: "/home-loans" },
  { label: "News", href: "/news" },
  { label: "Commercial", href: "/commercial" },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHomepage  = pathname === '/';
  const transparent = isHomepage && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-black/30 backdrop-blur-sm border-white/10 border-b"
          : "bg-white border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/GreenBrickLogo.png"
            alt="Greenbrick.net"
            width={170}
            height={56}
            className="h-16 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.label} href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  active
                    ? transparent
                      ? "text-white bg-white/20 font-bold"
                      : "text-[#16a34a] bg-green-50 font-bold"
                    : transparent
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-gray-700 hover:text-[#16a34a] hover:bg-gray-50"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (() => {
            const meta = ROLE_META[user.role];
            return (
              <div className="relative">
                {/* Profile button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all ${
                    transparent
                      ? "hover:bg-white/10 text-white"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  {/* Avatar with role-coloured ring */}
                  <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ${transparent ? "ring-white/50" : meta.ring}`}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${meta.avatar} flex items-center justify-center text-white text-sm font-black`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name + role pill */}
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-bold leading-none">{user.name.split(" ")[0]}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full ${
                      transparent ? "bg-white/20 text-white" : meta.badge
                    }`}>
                      {meta.icon}{meta.label}
                    </span>
                  </div>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 top-13 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl w-56 py-1.5 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${meta.ring} shrink-0`}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full ${meta.avatar} flex items-center justify-center text-white font-black`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email ?? "Phone user"}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${meta.badge}`}>
                            {meta.icon}{meta.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/dashboard/${user.role}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}>
                      <UserIcon size={14} /> Dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/dashboard/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                        onClick={() => setMenuOpen(false)}>
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link href="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}>
                      <UserIcon size={14} /> My Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <>
              <Link href="/signin"
                className={`text-sm font-medium transition-colors ${
                  transparent ? "text-white hover:text-white/80" : "text-gray-700 hover:text-[#16a34a]"
                }`}>
                Sign in
              </Link>
              <Link href="/join"
                className={`text-sm font-bold px-5 py-2 rounded-full transition-colors ${
                  transparent
                    ? "bg-white text-[#16a34a] hover:bg-white/90"
                    : "bg-[#16a34a] text-white hover:bg-[#15803d]"
                }`}>
                Join
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden ml-auto transition-colors ${transparent ? "text-white" : "text-gray-700"}`}
          onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu — always solid white */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 pb-4">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.label} href={link.href}
                className={`block py-2.5 text-sm border-b border-gray-100 last:border-0 transition-colors ${
                  active ? "text-[#16a34a] font-bold" : "text-gray-700"
                }`}
                onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            );
          })}
          <div className="flex gap-3 mt-3">
            {user ? (
              <button onClick={() => logout()} className="text-sm font-medium text-red-600">
                Sign out
              </button>
            ) : (
              <>
                <Link href="/signin" className="text-sm font-medium text-gray-700">Sign in</Link>
                <Link href="/join" className="bg-[#16a34a] text-white text-sm font-bold px-4 py-1.5 rounded-full">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
