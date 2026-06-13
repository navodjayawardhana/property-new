"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, Shield, Home, TrendingUp, Briefcase, AlertCircle, Plus, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/lib/api";
import { UserAvatar } from "@/components/UserAvatar";

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
  const [open, setOpen]               = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [buyerAlert, setBuyerAlert]   = useState(false);
  const [highlightPostAd, setHighlightPostAd] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  function handlePostAd() {
    if (!user) { router.push('/signin'); return; }
    if (user.role === 'buyer') { setBuyerAlert(true); return; }
    router.push('/dashboard/properties/new');
  }

  const profileIncomplete =
    !!user &&
    user.role !== 'admin' &&
    !bannerDismissed &&
    !pathname.startsWith('/dashboard') &&
    (!user.phone || !user.country || !user.suburb);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = () => {
      setHighlightPostAd(true);
      setTimeout(() => setHighlightPostAd(false), 3000);
    };
    window.addEventListener("highlightPostAd", handler);
    return () => window.removeEventListener("highlightPostAd", handler);
  }, []);

  const isHomepage  = pathname === '/';
  const transparent = isHomepage && !scrolled && !open;

  return (
    <>
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
                className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  active
                    ? transparent
                      ? "text-white border-white font-bold"
                      : "text-[#16a34a] border-[#16a34a] font-bold"
                    : transparent
                      ? "text-white/90 hover:text-white border-transparent hover:border-white/40"
                      : "text-gray-700 hover:text-[#16a34a] border-transparent"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Post Ad button — desktop */}
        <button
          onClick={handlePostAd}
          className={`hidden lg:flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-colors shrink-0 ${
            transparent
              ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
              : "bg-[#16a34a] text-white hover:bg-[#15803d]"
          } ${highlightPostAd ? "ring-2 ring-offset-2 ring-[#16a34a]" : ""}`}>
          <Plus size={14} />
          Post Ad
        </button>

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
                    <UserAvatar src={user.avatar} name={user.name} avatarBg={meta.avatar} textSize="text-sm" />
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
                          <UserAvatar src={user.avatar} name={user.name} avatarBg={meta.avatar} />
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
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                      onClick={() => setMenuOpen(false)}>
                      <UserIcon size={14} /> My Dashboard
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
            <Link href="/signin"
              className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                transparent
                  ? "border-white/50 text-white hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden transition-colors ${transparent ? "text-white" : "text-gray-700"}`}
          onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Profile completion banner */}
      {profileIncomplete && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium truncate">
              Your profile is incomplete — add your phone number and location to get the most out of Greenbrick.net.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href={`/dashboard/${user.role}?tab=profile`} className="text-xs font-bold text-amber-700 hover:underline whitespace-nowrap">
              Complete profile →
            </Link>
            <button onClick={() => setBannerDismissed(true)} className="text-amber-500 hover:text-amber-700 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu — always solid white */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 pb-4">
          <button
            onClick={() => { handlePostAd(); setOpen(false); }}
            className={`mt-4 mb-2 w-full flex items-center justify-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm py-2.5 rounded-lg transition-colors active:scale-95 ${highlightPostAd ? "ring-2 ring-offset-2 ring-[#16a34a]" : ""}`}>
            <Plus size={14} /> Post Ad
          </button>
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
          {user ? (
            <div className="mt-4 space-y-2">
              <Link href={`/dashboard/${user.role}`} onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 justify-center bg-[#16a34a] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">
                <UserIcon size={15} /> My Dashboard
              </Link>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full border border-red-200 text-red-600 font-semibold text-sm py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/signin" onClick={() => setOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Sign In
              </Link>
              <Link href="/join" onClick={() => setOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>

    {/* Buyer alert modal */}
    {buyerAlert && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBuyerAlert(false)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Buyer Account</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Your account is registered as a <span className="font-semibold text-gray-700">Buyer</span>. Only Sellers, Agents, and Admins can post property listings.
            <br /><br />
            To post an ad, please create a new account as a <span className="font-semibold text-gray-700">Seller</span> or <span className="font-semibold text-gray-700">Agent</span>.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setBuyerAlert(false)}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Close
            </button>
            <Link
              href="/join"
              onClick={() => setBuyerAlert(false)}
              className="flex-1 bg-[#16a34a] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#15803d] transition-colors">
              Create Seller Account
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
