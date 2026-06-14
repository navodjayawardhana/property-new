"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. What Are Cookies",
    body: "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide information to website owners about how users interact with their site.",
  },
  {
    title: "2. How Greenbricks Uses Cookies",
    body: "We use cookies on greenbricks.net for the following purposes:",
    subsections: [
      {
        heading: "Essential Cookies",
        text: "These cookies are necessary for the Platform to function correctly. They enable core features such as user login sessions, property search filters, and security. You cannot opt out of essential cookies as the Platform cannot function without them.",
      },
      {
        heading: "Analytics Cookies",
        text: "We use analytics tools such as Google Analytics to understand how users interact with the Platform — including which pages are visited most, how long users stay, and where they come from. This helps us improve the Platform experience. Analytics data is collected in an anonymised form.",
      },
      {
        heading: "Functional Cookies",
        text: "These cookies remember your preferences and settings — such as your saved searches or preferred property type — so you do not have to re-enter them each time you visit.",
      },
      {
        heading: "Marketing and Advertising Cookies",
        text: "We may use cookies to show you relevant property listings or advertising based on your browsing behaviour on the Platform. These cookies may be set by us or by third-party advertising partners.",
      },
    ],
  },
  {
    title: "3. Third-Party Cookies",
    body: "Some cookies on the Platform are set by third-party services such as Google Analytics, Facebook Pixel, and embedded map providers. These third parties have their own privacy and cookie policies, which we encourage you to review.",
  },
  {
    title: "4. Managing Cookies",
    body: "You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies. Please note that blocking certain cookies may affect the functionality of the Platform. For guidance on how to manage cookies in your browser, visit your browser's help documentation.",
  },
  {
    title: "5. Consent",
    body: 'When you first visit greenbricks.net, you will be shown a cookie consent notice. By clicking "Accept All" you consent to the use of all cookies as described in this policy. You may also choose to accept only essential cookies. You can update your preferences at any time by revisiting the cookie settings on the Platform.',
  },
  {
    title: "6. Changes to This Policy",
    body: "We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. Any updates will be posted on this page with a revised effective date.",
  },
  {
    title: "7. Contact Us",
    body: "If you have questions about our use of cookies, please contact us at info@greenbricks.net.",
  },
];

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">

          <p className="text-xs font-semibold text-[#16a34a] uppercase tracking-wider mb-3">Legal</p>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Cookie Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: 2026</p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.body}</p>
                {section.subsections && (
                  <div className="mt-4 space-y-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.heading}>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">{sub.heading}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{sub.text}</p>
                      </div>
                    ))}
                  </div>
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
