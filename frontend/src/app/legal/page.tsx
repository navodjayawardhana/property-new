import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    id: "terms",
    title: "1. Terms of Use",
    content: `By accessing or using the Greenbricks.net platform, you agree to be bound by these Terms of Use. If you do not agree to all of the terms, you must not use this platform.\n\nGreenbricks.net is operated by Greenbricks.net (Sri Lanka). We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance of the revised terms.`,
  },
  {
    id: "use",
    title: "2. Acceptable Use",
    content: `You may use our platform only for lawful purposes. You must not:\n\n• Submit false, misleading, or fraudulent property listings\n• Impersonate any person or entity\n• Collect or harvest user data without consent\n• Upload content that infringes intellectual property rights\n• Attempt to gain unauthorised access to our systems\n\nWe reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    id: "listings",
    title: "3. Property Listings",
    content: `All property listings on Greenbricks.net are provided by third-party agents, agencies, and private sellers. Greenbricks.net does not verify the accuracy of listing information and is not responsible for any errors or omissions.\n\nUsers should independently verify all property details before making any decisions. We recommend engaging a qualified solicitor and conducting a full property inspection before any property transaction.`,
  },
  {
    id: "ip",
    title: "4. Intellectual Property",
    content: `All content, trademarks, logos, and software on this platform are the intellectual property of Greenbricks.net or its licensors. You may not copy, reproduce, distribute, or create derivative works without our express written consent.\n\nBy uploading content to the platform, you grant Greenbricks.net a non-exclusive, royalty-free, worldwide licence to use, display, and distribute that content on the platform.`,
  },
  {
    id: "liability",
    title: "5. Limitation of Liability",
    content: `To the maximum extent permitted by law, Greenbricks.net shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.\n\nOur total liability to you for any claim arising from these terms shall not exceed the amounts paid by you to us in the 12 months preceding the claim.`,
  },
  {
    id: "governing",
    title: "6. Governing Law",
    content: `These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.`,
  },
];

export default function LegalPage() {
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
          <h1 className="text-3xl font-black text-gray-900">Legal</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: June 2026</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Sidebar TOC */}
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
                <Link href="/privacy-centre" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Privacy Policy</Link>
                <Link href="/privacy-settings" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Privacy Settings</Link>
                <Link href="/contact" className="block text-sm text-[#16a34a] hover:underline underline-offset-2">Contact us</Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h2 className="text-lg font-black text-gray-900 mb-3">{s.title}</h2>
                <div className="prose prose-sm text-gray-600 max-w-none">
                  {s.content.split("\n").map((line, i) => (
                    <p key={i} className={`leading-relaxed ${line === "" ? "mt-3" : ""}`}>{line}</p>
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
