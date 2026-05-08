"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import { agentsApi, properties as propertiesApi, type Agent, type AgentSlide, type Property } from "@/lib/api";
import { MapPin, Mail, Phone, ArrowLeft, Building2, Globe, MessageCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

/* ── Social SVG icons ───────────────────────────────────────────────────── */
function FbIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function IgIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function LiIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.5a6 6 0 0 1 4-1.5z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>; }
function TwIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function WaIcon()  { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>; }

const SOCIALS = [
  { key: "facebook"  as keyof Agent, Icon: FbIcon,        label: "Facebook",  bg: "bg-[#1877F2]" },
  { key: "instagram" as keyof Agent, Icon: IgIcon,        label: "Instagram", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]" },
  { key: "linkedin"  as keyof Agent, Icon: LiIcon,        label: "LinkedIn",  bg: "bg-[#0A66C2]" },
  { key: "twitter"   as keyof Agent, Icon: TwIcon,        label: "Twitter",   bg: "bg-black" },
  { key: "whatsapp"  as keyof Agent, Icon: WaIcon,        label: "WhatsApp",  bg: "bg-[#25D366]" },
  { key: "website"   as keyof Agent, Icon: () => <Globe size={20} />, label: "Website", bg: "bg-gray-700" },
];

function socialHref(key: keyof Agent, val: string): string {
  if (key === "whatsapp") return `https://wa.me/${val.replace(/\D/g, "")}`;
  if (key === "website")  return val.startsWith("http") ? val : `https://${val}`;
  if (key === "facebook")  return val.startsWith("http") ? val : `https://facebook.com/${val}`;
  if (key === "instagram") return val.startsWith("http") ? val : `https://instagram.com/${val}`;
  if (key === "linkedin")  return val.startsWith("http") ? val : `https://linkedin.com/in/${val}`;
  if (key === "twitter")   return val.startsWith("http") ? val : `https://twitter.com/${val}`;
  return val;
}

/* ── Default slide backgrounds ──────────────────────────────────────────── */
const DEFAULT_SLIDES = [
  {
    gradient: "from-[#0f172a] via-[#1e3a8a] to-[#1d4ed8]",
    pattern: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.07) 1px, transparent 0)",
    patternSize: "40px 40px",
    accent: "bg-blue-500/20",
  },
  {
    gradient: "from-[#0f172a] via-[#14532d] to-[#16a34a]",
    pattern: "linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%)",
    patternSize: "60px 60px",
    accent: "bg-green-500/20",
  },
  {
    gradient: "from-[#1e1b4b] via-[#4c1d95] to-[#7c3aed]",
    pattern: "radial-gradient(circle at 3px 3px, rgba(255,255,255,0.06) 1px, transparent 0)",
    patternSize: "28px 28px",
    accent: "bg-violet-500/20",
  },
  {
    gradient: "from-[#0f172a] via-[#7c2d12] to-[#c2410c]",
    pattern: "linear-gradient(135deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%)",
    patternSize: "50px 50px",
    accent: "bg-orange-500/20",
  },
  {
    gradient: "from-[#0c4a6e] via-[#0369a1] to-[#0ea5e9]",
    pattern: "radial-gradient(ellipse at 4px 4px, rgba(255,255,255,0.05) 2px, transparent 0)",
    patternSize: "36px 36px",
    accent: "bg-sky-500/20",
  },
];

function DefaultSlide({ idx }: { idx: number }) {
  const s = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length];
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`}>
      <div className="absolute inset-0" style={{ backgroundImage: s.pattern, backgroundSize: s.patternSize }} />
      {/* Decorative circles */}
      <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${s.accent} blur-3xl`} />
      <div className={`absolute -bottom-16 -left-16 w-64 h-64 rounded-full ${s.accent} blur-2xl`} />
      {/* Diagonal stripe overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
    </div>
  );
}

/* ── Hero Slider ─────────────────────────────────────────────────────────── */
function HeroSlider({ slides, agent }: { slides: AgentSlide[]; agent: Agent }) {
  const active = slides.filter((s) => s.is_active);

  // Pad with default slides: 0 real → 5 defaults, 1 real → 4 defaults appended
  const defaultCount = active.length === 0 ? 5 : active.length === 1 ? 4 : 0;
  const totalCount   = active.length + defaultCount;

  const [cur, setCur] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    if (totalCount > 1) timer.current = setTimeout(() => setCur((c) => (c + 1) % totalCount), 5000);
  }
  useEffect(() => { reset(); return () => { if (timer.current) clearTimeout(timer.current); }; }, [cur, totalCount]);

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">

      {/* Real image slides */}
      {active.map((slide, i) => (
        <div key={`real-${slide.id}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === cur ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <img src={slide.url} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Default gradient slides */}
      {Array.from({ length: defaultCount }, (_, i) => {
        const idx = active.length + i;
        return (
          <div key={`def-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === cur ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <DefaultSlide idx={i} />
          </div>
        );
      })}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

      {/* Arrows */}
      {totalCount > 1 && (
        <>
          <button onClick={() => { setCur((c) => (c - 1 + totalCount) % totalCount); reset(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => { setCur((c) => (c + 1) % totalCount); reset(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-all">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-8 right-6 flex gap-1.5">
            {Array.from({ length: totalCount }, (_, i) => (
              <button key={i} onClick={() => { setCur(i); reset(); }}
                className={`rounded-full transition-all duration-300 ${i === cur ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function AgentLandingPage() {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();

  const [agent,        setAgent]        = useState<Agent | null>(null);
  const [slides,       setSlides]       = useState<AgentSlide[]>([]);
  const [agentProps,   setAgentProps]   = useState<Property[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    agentsApi.get(slug).then(setAgent).catch(() => router.replace("/agents")).finally(() => setLoading(false));
    agentsApi.slides(slug).then(setSlides).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!agent) return;
    propertiesApi.list({ user_id: agent.id, per_page: 50 })
      .then((r) => setAgentProps(r.data)).catch(() => {}).finally(() => setPropsLoading(false));
  }, [agent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const hasSocials = SOCIALS.some(({ key }) => agent[key]);
  const firstName  = agent.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <HeroSlider slides={slides} agent={agent} />

        {/* Back button — floats over hero */}
        <div className="absolute top-5 left-5 z-20">
          <Link href="/agents"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full transition-all">
            <ArrowLeft size={13} /> All Agents
          </Link>
        </div>

        {/* Agent identity — anchored to hero bottom, overlaps into next section */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-6xl mx-auto px-6 pb-0">
            <div className="flex items-end gap-6">
              {/* Avatar — pokes above the white section */}
              <div className="relative shrink-0 translate-y-12">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-[#16a34a] flex items-center justify-center">
                  {agent.avatar
                    ? <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                    : <span className="text-white font-black text-5xl">{agent.name.charAt(0)}</span>}
                </div>
                <div className="absolute bottom-3 right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow" />
              </div>

              {/* Name + title over hero */}
              <div className="pb-5">
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Real Estate Agent</p>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight drop-shadow-lg">
                  {agent.name}
                </h1>
                {(agent.suburb || agent.state) && (
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-2">
                    <MapPin size={13} className="shrink-0" />
                    {[agent.suburb, agent.state, agent.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="bg-[#0f172a] pt-16 pb-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-8 md:gap-16 pl-0 md:pl-44">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{propsLoading ? "—" : agentProps.length}</p>
              <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-wide">Listings</p>
            </div>
            {agent.state && (
              <div className="text-center">
                <p className="text-lg font-black text-white">{agent.state}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-wide">District</p>
              </div>
            )}
            {agent.phone && (
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm">{agent.phone}</p>
                <p className="text-gray-400 text-xs font-medium mt-0.5 uppercase tracking-wide">Phone</p>
              </div>
            )}

            {/* CTA buttons on the right */}
            <div className="flex gap-3 md:ml-auto flex-wrap">
              <a href={`mailto:${agent.email}`}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-green-900/30">
                <Mail size={15} /> Email Agent
              </a>
              {agent.phone && (
                <a href={`tel:${agent.phone}`}
                  className="flex items-center gap-2 border border-white/20 hover:border-white/50 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors backdrop-blur-sm">
                  <Phone size={15} /> Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Social icons ─────────────────────────────────────────────────── */}
      {hasSocials && (
        <div className="bg-[#0f172a] border-t border-white/5 pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap gap-3 pl-0 md:pl-44">
              {SOCIALS.map(({ key, Icon, label, bg }) => {
                const val = agent[key] as string | null;
                if (!val) return null;
                return (
                  <a key={key} href={socialHref(key, val)} target="_blank" rel="noopener noreferrer"
                    title={label}
                    className={`${bg} text-white w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 hover:scale-105 transition-all shadow-md`}>
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── About ────────────────────────────────────────────────────────── */}
      {agent.bio && (
        <section className="bg-white py-16 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-3">About</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                Meet {firstName}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{agent.bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Why work with me ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Local Expertise",    body: `${firstName} knows the local market inside out, giving you accurate valuations and the best opportunities.` },
              { title: "Full-Service Agent", body: "From listing to settlement, every step is handled professionally with your best interests at heart." },
              { title: "Proven Results",     body: `With ${agentProps.length || "multiple"} active listing${agentProps.length !== 1 ? "s" : ""}, ${firstName} has a track record you can trust.` },
            ].map(({ title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <CheckCircle2 size={22} className="text-[#16a34a] mb-3" />
                <h3 className="font-black text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-2">Portfolio</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                {firstName}&apos;s Listings
              </h2>
            </div>
            {!propsLoading && agentProps.length > 0 && (
              <p className="text-sm text-gray-400 font-medium pb-1">
                {agentProps.length} propert{agentProps.length !== 1 ? "ies" : "y"}
              </p>
            )}
          </div>

          {propsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : agentProps.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 py-20 text-center">
              <Building2 size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for {firstName}&apos;s properties.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {agentProps.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#0f172a] py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-3">Get in touch</p>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
            Ready to buy, sell or rent?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Reach out to {firstName} today for a free consultation and expert advice on your next property move.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={`mailto:${agent.email}`}
              className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-900/40">
              <Mail size={16} /> {agent.email}
            </a>
            {agent.phone && (
              <a href={`tel:${agent.phone}`}
                className="flex items-center gap-2 border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
                <Phone size={16} /> {agent.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
