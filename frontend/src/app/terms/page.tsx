"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: 'By accessing or using greenbricks.net (the "Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including visitors, registered members, property listers, and advertising agents.',
  },
  {
    title: "2. About the Platform",
    body: "Greenbricks is an online property listing platform operated in Sri Lanka. The Platform allows users to search, view, and enquire about residential and commercial properties, and allows agents and developers to list properties for sale or rent.",
  },
  {
    title: "3. Use of the Platform",
    body: "You agree to use the Platform only for lawful purposes and in a manner that does not infringe the rights of others. You must not:",
    list: [
      "Post false, misleading, or fraudulent property listings",
      "Impersonate any person, agent, or organisation",
      "Use the Platform to send unsolicited communications or spam",
      "Attempt to gain unauthorised access to any part of the Platform",
      "Scrape, copy, or reproduce Platform content without written permission",
      "Use the Platform in any way that may damage, disable, or impair its operation",
    ],
  },
  {
    title: "4. Property Listings",
    body: "Greenbricks provides a platform for agents, developers, and private sellers to list properties. We do not own, manage, or verify every listed property. All listing information is provided by the advertiser and Greenbricks makes no warranty regarding the accuracy or completeness of any listing.\n\nGreenbricks reserves the right to remove any listing that violates these terms, contains false information, or is reported as fraudulent, without prior notice.",
  },
  {
    title: "5. User Accounts",
    body: "To access certain features of the Platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately if you suspect any unauthorised use of your account.",
  },
  {
    title: "6. Intellectual Property",
    body: "All content on the Platform including text, graphics, logos, images, and software is the property of Greenbricks or its content suppliers and is protected under applicable intellectual property laws. You may not reproduce, distribute, or use any content from this Platform without prior written permission.",
  },
  {
    title: "7. Disclaimer of Warranties",
    body: 'The Platform is provided on an "as is" and "as available" basis. Greenbricks makes no representations or warranties of any kind, express or implied, regarding the operation of the Platform or the accuracy of the information provided. We do not guarantee that the Platform will be uninterrupted, error-free, or free of viruses.',
  },
  {
    title: "8. Limitation of Liability",
    body: "To the fullest extent permitted by applicable law, Greenbricks shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of data, loss of revenue, or property transaction disputes.",
  },
  {
    title: "9. Third-Party Links",
    body: "The Platform may contain links to third-party websites. These links are provided for convenience only. Greenbricks does not endorse and is not responsible for the content, accuracy, or practices of any third-party websites.",
  },
  {
    title: "10. Modifications to Terms",
    body: "Greenbricks reserves the right to update or modify these Terms of Use at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised terms.",
  },
  {
    title: "11. Governing Law",
    body: "These Terms of Use are governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.",
  },
  {
    title: "12. Contact",
    body: "For questions regarding these Terms of Use, please contact us at info@greenbricks.net.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">

          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider mb-3">Legal</p>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Terms of Use</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: 2026</p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-gray-900 mb-2">{section.title}</h2>
                {section.body.split("\n\n").map((para, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-2">{para}</p>
                ))}
                {section.list && (
                  <ul className="mt-2 space-y-1.5">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                        <span className="text-[#16a34a] font-bold mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
