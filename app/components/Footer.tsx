import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  "Properties": ["Buy Property", "Rent Property", "New Developments", "Commercial", "Rural & Land", "Off the Plan"],
  "Tools": ["Mortgage Calculator", "Property Valuation", "Market Reports", "Currency Converter", "Find an Agent", "Suburb Profiles"],
  "Company": ["About Us", "Careers", "News & Media", "Advertise with Us", "Help Centre", "Contact Us"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0f0c29] text-gray-400">

      {/* CTA Banner */}
      <div className="bg-[#C8102E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white">Ready to List Your Property?</h3>
            <p className="text-red-200 text-sm mt-1">Reach millions of buyers worldwide with Serendib Real Estate.</p>
          </div>
          <button className="bg-white text-[#C8102E] font-black px-8 py-3 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap shadow-lg">
            List for Free →
          </button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Col */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#C8102E] rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
                  <path d="M18 7L30 16V29H23V21H13V29H6V16L18 7Z" fill="white"/>
                  <rect x="14.5" y="21" width="7" height="8" fill="#C8102E"/>
                </svg>
              </div>
              <div>
                <div className="font-black text-white text-lg tracking-tight">SERENDIB</div>
                <div className="text-[10px] font-bold tracking-[3px] text-[#C8102E] -mt-0.5">REAL ESTATE</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted international real estate platform. Connecting buyers, sellers, and investors across 50+ countries.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8102E]"/>
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8102E]"/>
                <span>hello@serendibrealestate.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C8102E]"/>
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {["f", "in", "tw", "li"].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#C8102E] flex items-center justify-center transition-colors text-gray-400 hover:text-white text-xs font-bold">
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
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 Serendib Real Estate. All rights reserved.</p>
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
