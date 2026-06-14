"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. Introduction",
    body: 'Greenbricks ("we", "us", "our") is committed to protecting the privacy of all users of greenbricks.net (the "Platform"). This Privacy Policy explains what personal information we collect, how we use it, and your rights regarding your information. By using the Platform, you consent to the practices described in this policy.',
  },
  {
    title: "2. Information We Collect",
    body: "We may collect the following types of information:",
    list: [
      "Information you provide: name, email address, phone number, and any details submitted through enquiry forms or account registration",
      "Property search data: locations, property types, and search preferences you use on the Platform",
      "Usage data: pages visited, time spent on the Platform, clicks, and browser type",
      "Device data: IP address, device type, operating system, and browser information",
      "Communication records: emails or messages you send to us",
    ],
  },
  {
    title: "3. How We Use Your Information",
    body: "We use the information we collect to:",
    list: [
      "Provide and improve the Platform and its features",
      "Respond to your enquiries and support requests",
      "Connect you with property agents or developers when you submit an enquiry",
      "Send you relevant property updates or newsletters if you have opted in",
      "Analyse Platform usage to improve user experience",
      "Comply with applicable legal obligations",
    ],
  },
  {
    title: "4. Sharing of Information",
    body: "We do not sell your personal information to third parties. We may share your information in the following circumstances:",
    list: [
      "With agents or developers: when you submit a property enquiry, your contact details may be shared with the relevant listing agent or developer to respond to your request",
      "With service providers: we may share data with trusted third-party service providers who assist us in operating the Platform (such as analytics or hosting providers), under strict confidentiality agreements",
      "As required by law: we may disclose information if required to do so by law or in response to valid legal process",
    ],
  },
  {
    title: "5. Cookies",
    body: "We use cookies and similar tracking technologies to improve your experience on the Platform. For full details on how we use cookies, please refer to our Cookie Policy.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your personal information for as long as necessary to fulfil the purposes described in this policy, or as required by applicable law. You may request deletion of your account and associated data by contacting us at info@greenbricks.net.",
  },
  {
    title: "7. Your Rights",
    body: "You have the right to:",
    list: [
      "Access the personal information we hold about you",
      "Request correction of inaccurate or incomplete information",
      "Request deletion of your personal data, subject to legal requirements",
      "Withdraw consent for marketing communications at any time",
      "Lodge a complaint with a relevant data protection authority",
    ],
  },
  {
    title: "8. Data Security",
    body: "We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, or disclosure. However, no internet transmission is completely secure and we cannot guarantee absolute security.",
  },
  {
    title: "9. Children's Privacy",
    body: "The Platform is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a child without parental consent, we will take steps to delete it promptly.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Changes will be published on this page with an updated effective date. We encourage you to review this policy periodically.",
  },
  {
    title: "11. Contact Us",
    body: "If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at info@greenbricks.net.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">

          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider mb-3">Legal</p>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: 2026</p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.body}</p>
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
