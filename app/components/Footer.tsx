import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              {/* White-tinted logo for dark background */}
              <svg width="200" height="44" viewBox="0 0 242 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="8" fill="#C8102E"/>
                <path d="M22 8L36 18.5V36H27V26H17V36H8V18.5L22 8Z" fill="white"/>
                <rect x="19" y="26" width="6" height="10" fill="#C8102E"/>
                <text x="52" y="23" fontFamily="Georgia, serif" fontSize="16" fontWeight="700" fill="white" letterSpacing="1.5">SERENDIB</text>
                <text x="52" y="36" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="400" fill="#aaaaaa" letterSpacing="3">REAL  ESTATE</text>
                <rect x="52" y="39" width="123" height="2" rx="1" fill="#C8102E" opacity="0.5"/>
              </svg>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted platform for international property search, buying, and renting.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">News & Media</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Properties</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Buy Property</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Rent Property</a></li>
              <li><a href="#" className="hover:text-white transition-colors">New Developments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Commercial</a></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Tools & Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Mortgage Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Property Valuation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Insights</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Find an Agent</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 RealEstate International. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
