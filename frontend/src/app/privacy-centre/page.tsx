import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    content: `Greenbricks.net is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform.\n\nBy using Greenbricks.net, you consent to the practices described in this policy. We encourage you to read this policy carefully.`,
  },
  {
    id: "collection",
    title: "2. Information We Collect",
    content: `We collect information you provide directly:\n\n• Account registration details (name, email, phone number)\n• Property listing information\n• Search preferences and saved properties\n• Communications with agents and our team\n• Payment information (processed securely via third-party providers)\n\nWe also collect information automatically:\n\n• Device and browser information\n• IP address and location data\n• Usage data (pages viewed, time spent, clicks)\n• Cookies and similar tracking technologies`,
  },
  {
    id: "use",
    title: "3. How We Use Your Information",
    content: `We use your personal information to:\n\n• Provide and improve our platform and services\n• Match you with relevant property listings\n• Send property alerts, newsletters, and market updates (with your consent)\n• Process transactions and enquiries\n• Comply with legal obligations\n• Detect and prevent fraud or abuse\n• Analyse usage and improve user experience`,
  },
  {
    id: "sharing",
    title: "4. Sharing Your Information",
    content: `We do not sell your personal information. We may share it with:\n\n• Real estate agents and agencies (when you make an enquiry)\n• Service providers who assist in operating our platform\n• Analytics partners (in aggregated or anonymised form)\n• Legal authorities when required by law\n\nAll third parties are required to handle your data in accordance with applicable privacy laws.`,
  },
  {
    id: "retention",
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time by contacting us.\n\nSome data may be retained for legal, regulatory, or legitimate business purposes even after account closure.`,
  },
  {
    id: "rights",
    title: "6. Your Rights",
    content: `You have the right to:\n\n• Access the personal information we hold about you\n• Correct inaccurate or incomplete information\n• Request deletion of your personal data\n• Opt out of marketing communications\n• Withdraw consent for data processing\n• Lodge a complaint with the relevant data protection authority\n\nTo exercise your rights, please contact us at privacy@greenbricks.net.`,
  },
  {
    id: "security",
    title: "7. Data Security",
    content: `We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your personal information. However, no internet transmission is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "cookies",
    title: "8. Cookies",
    content: `We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences at any time via our Privacy Settings page. Essential cookies cannot be disabled as they are required for the platform to function.`,
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: `For privacy-related enquiries, please contact:\n\nPrivacy Officer\nGreenbricks.net\nNo. 42, Galle Road, Colombo 03, Sri Lanka\nEmail: privacy@greenbricks.net\nPhone: +94 11 234 5678`,
  },
];

export default function PrivacyCentrePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Image src="/GreenBricksLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-gray-900">Privacy Centre</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: June 2026 &nbsp;·&nbsp; Effective: June 2026</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-sm text-gray-600 hover:text-[#16a34a] hover:underline underline-offset-2 py-0.5 transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <Link href="/privacy-settings" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Manage your settings</Link>
                <Link href="/legal" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Terms of Use</Link>
                <Link href="/contact" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Contact us</Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-sm text-gray-700">
              Your privacy matters to us. You can manage your data preferences at any time via{" "}
              <Link href="/privacy-settings" className="text-[#16a34a] font-semibold underline underline-offset-2">Privacy Settings</Link>.
            </div>
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h2 className="text-lg font-black text-gray-900 mb-3">{s.title}</h2>
                <div className="space-y-2">
                  {s.content.split("\n").map((line, i) => (
                    <p key={i} className={`text-sm text-gray-600 leading-relaxed ${line === "" ? "mt-1" : ""}`}>{line}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
