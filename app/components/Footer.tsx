import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  "Properties": [
    { label: "Buy Property", href: "/buy" },
    { label: "Rent Property", href: "/rent" },
    { label: "New Developments", href: "/new-homes" },
    { label: "Sold Properties", href: "/sold" },
    { label: "Commercial", href: "/buy" },
    { label: "Land", href: "/buy" },
  ],
  "Tools": [
    { label: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
    { label: "Property Valuation", href: "/tools/property-valuation" },
    { label: "Suburb Profiles", href: "/tools/suburb-profiles" },
    { label: "Find an Agent", href: "/agents" },
    { label: "Market News", href: "/news" },
  ],
  "Company": [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "News & Media", href: "/news" },
    { label: "Advertise with Us", href: "#" },
    { label: "Help Centre", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a1a5e] text-gray-400">

      {/* CTA Banner */}
      <div className="bg-[#4CD137]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">Ready to List Your Property?</h3>
            <p className="text-green-100 text-sm mt-1">Reach millions of buyers worldwide with GreenBrick.net.</p>
          </div>
          <Link href="/tools/property-valuation" className="bg-white text-[#4CD137] font-black px-8 py-3 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap shadow-lg">
            List for Free →
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Col */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="GreenBrick.net" className="h-12 w-auto" />
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted real estate platform. Connecting buyers, sellers, and investors across Sri Lanka.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#4CD137]"/>
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#4CD137]"/>
                <span>hello@greenbrick.net</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4CD137]"/>
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {["f", "in", "tw", "li"].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#4CD137] flex items-center justify-center transition-colors text-gray-400 hover:text-white text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 GreenBrick.net. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
