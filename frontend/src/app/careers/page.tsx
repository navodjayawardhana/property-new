import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { MapPin, Clock, Briefcase, Heart, Zap, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at Greenbricks | Join Our Team",
  description: "Join the Greenbricks team! Explore career opportunities in real estate, technology, and business. Build your future with Sri Lanka's No.1 property platform.",
  keywords: "careers, jobs, employment, real estate jobs, Greenbricks",
  openGraph: {
    title: "Careers at Greenbricks",
    description: "Join the Greenbricks team and build your career in real estate.",
    url: "https://greenbricks.net/careers",
    type: "website",
  },
};

const JOBS = [
  {
    title: "Senior Frontend Developer",
    team: "Engineering",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    title: "Backend Engineer (Laravel)",
    team: "Engineering",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    tags: ["PHP", "Laravel", "MySQL"],
  },
  {
    title: "Product Designer (UI/UX)",
    team: "Design",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    tags: ["Figma", "User Research", "Prototyping"],
  },
  {
    title: "Digital Marketing Executive",
    team: "Marketing",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    tags: ["SEO", "Google Ads", "Social Media"],
  },
  {
    title: "Customer Success Specialist",
    team: "Operations",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    tags: ["CRM", "Property Industry", "Client Relations"],
  },
  {
    title: "Mobile App Developer (React Native)",
    team: "Engineering",
    type: "Full-time",
    location: "Remote / Colombo",
    tags: ["React Native", "iOS", "Android"],
  },
];

const VALUES = [
  { icon: Zap, title: "Move fast", desc: "We ship quickly, learn from feedback, and iterate without bureaucracy." },
  { icon: Heart, title: "People first", desc: "We care deeply about our team, users, and the communities we serve." },
  { icon: Users, title: "Collaborate openly", desc: "Ideas come from everywhere. We value diverse perspectives and candid debate." },
  { icon: Briefcase, title: "Own your work", desc: "We trust our team to make decisions and take real ownership of outcomes." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/GreenBricksLogo.png" alt="Greenbricks" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-[#16a34a] hover:underline">Get in touch</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-white to-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-green-100 text-[#16a34a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">We're hiring</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Build Sri Lanka's <span className="text-[#16a34a]">property future</span> with us
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Join the team behind Sri Lanka's fastest-growing property platform. We're looking for passionate people who want to make a real impact.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">How we work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-[#16a34a]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Open positions</h2>
          <p className="text-sm text-gray-500 mb-8">{JOBS.length} roles available · Colombo, Sri Lanka</p>
          <div className="space-y-3">
            {JOBS.map((job) => (
              <div key={job.title} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                    <span className="text-[10px] bg-green-100 text-[#16a34a] font-bold px-2 py-0.5 rounded-full">{job.team}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href={`/contact`}
                  className="flex items-center gap-1.5 bg-[#16a34a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#15803d] transition-colors text-xs whitespace-nowrap shrink-0">
                  Apply now <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Don't see the right role?</h2>
        <p className="text-sm text-gray-500 mb-6">We're always open to hearing from talented people. Send us your CV and we'll keep you in mind for future opportunities.</p>
        <Link href="/contact" className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors text-sm">
          Send us your CV
        </Link>
      </section>

      <Footer />
    </div>
  );
}
