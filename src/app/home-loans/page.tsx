"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Home, TrendingUp, Users, DollarSign, Clock,
  CheckCircle, ArrowRight, ChevronRight, Star,
  Zap, Lock, Building2, Trophy, FileText,
  ChevronUp, ChevronDown, Info,
} from "lucide-react";
import { bankLoanRatesApi, type BankLoanRate } from "@/lib/api";

// ── Formula ───────────────────────────────────────────────────────────────────

function calcMonthly(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LKR = (n: number) =>
  Math.round(n).toLocaleString("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });

function numStr(s: string) {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return isNaN(n) ? "" : n.toLocaleString("en-LK");
}

const LOAN_TYPE_LABELS: Record<string, string> = {
  variable:      "Variable Rate",
  fixed:         "Fixed Rate",
  split:         "Split Loan",
  interest_only: "Interest Only",
};

const LOAN_TYPE_COLORS: Record<string, string> = {
  variable:      "bg-green-100 text-green-700 border-green-200",
  fixed:         "bg-blue-100 text-blue-700 border-blue-200",
  split:         "bg-purple-100 text-purple-700 border-purple-200",
  interest_only: "bg-orange-100 text-orange-700 border-orange-200",
};

// ── Static data ───────────────────────────────────────────────────────────────

const LOAN_TYPES = [
  { icon: TrendingUp, title: "Variable Rate",  rate: "From 7.0% p.a.",     colorIcon: "bg-green-50 text-[#16a34a]",   desc: "Rate moves with the market.",            pros: ["Flexible repayments", "Offset account", "Redraw facility"] },
  { icon: Lock,       title: "Fixed Rate",     rate: "From 8.0% p.a.",     colorIcon: "bg-blue-50 text-blue-700",     desc: "Locked rate for a set period.",          pros: ["Repayment certainty", "Easy budgeting", "Rate protection"]  },
  { icon: Zap,        title: "Split Loan",     rate: "Customise split",    colorIcon: "bg-purple-50 text-purple-700", desc: "Part variable, part fixed.",             pros: ["Manage rate risk", "Partial offset", "Flexible structure"]  },
  { icon: DollarSign, title: "Interest Only",  rate: "From 9.0% p.a.",     colorIcon: "bg-orange-50 text-orange-700", desc: "Pay interest only for an initial period.", pros: ["Lower initial payments", "Popular for investors", "Up to 5 yr IO"] },
];

// ── Sort icon helper ──────────────────────────────────────────────────────────

function SortIcon({ col, sort }: { col: string; sort: { col: string; dir: "asc" | "desc" } }) {
  if (sort.col !== col) return <ChevronUp size={12} className="text-gray-300" />;
  return sort.dir === "asc"
    ? <ChevronUp size={12} className="text-[#16a34a]" />
    : <ChevronDown size={12} className="text-[#16a34a]" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomeLoansPage() {
  const [banks, setBanks]     = useState<BankLoanRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator inputs
  const [amtStr,     setAmtStr]     = useState("5000000");
  const [termStr,    setTermStr]    = useState("20");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort,       setSort]       = useState<{ col: string; dir: "asc" | "desc" }>({ col: "monthly", dir: "asc" });

  const loanAmt = parseInt(amtStr.replace(/\D/g, "") || "5000000");
  const term    = Math.min(30, Math.max(1, parseInt(termStr || "20")));

  useEffect(() => {
    bankLoanRatesApi.list()
      .then(setBanks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loanTypes = useMemo(() => Array.from(new Set(banks.map((b) => b.loan_type))), [banks]);

  const results = useMemo(() => {
    const filtered = typeFilter === "all" ? banks : banks.filter((b) => b.loan_type === typeFilter);
    const rows = filtered
      .filter((b) => loanAmt >= b.min_loan && loanAmt <= b.max_loan && term <= b.max_term)
      .map((b) => {
        const monthly = calcMonthly(loanAmt, b.interest_rate, term);
        return { ...b, monthly, totalPaid: monthly * term * 12, totalInterest: monthly * term * 12 - loanAmt };
      });

    return [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.col === "rate")     return (a.interest_rate - b.interest_rate) * dir;
      if (sort.col === "monthly")  return (a.monthly - b.monthly) * dir;
      if (sort.col === "total")    return (a.totalPaid - b.totalPaid) * dir;
      if (sort.col === "interest") return (a.totalInterest - b.totalInterest) * dir;
      return (a.monthly - b.monthly);
    });
  }, [banks, loanAmt, term, typeFilter, sort]);

  function toggleSort(col: string) {
    setSort((s) => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  }

  const best = results[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#16a34a] pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest">Housing Loan Comparison</p>
          </div>
          <h1 className="text-white font-black text-3xl md:text-4xl mb-2">Compare Home Loan Interest Rates</h1>
          <p className="text-green-200 text-sm">
            Enter your loan amount and period to compare monthly repayments and interest rates across banks in Sri Lanka.
          </p>
        </div>
      </div>

      {/* ── Calculator card (overlaps hero) ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 w-full -mt-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">

            {/* Loan amount */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Loan Amount (LKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none">LKR</span>
                <input
                  type="text" inputMode="numeric"
                  value={numStr(amtStr)}
                  onChange={(e) => setAmtStr(e.target.value.replace(/\D/g, ""))}
                  className="w-full border-2 border-gray-200 focus:border-[#16a34a] rounded-xl pl-12 pr-4 py-3 text-sm font-bold outline-none transition-colors"
                />
              </div>
              <input type="range" min={500000} max={50000000} step={100000}
                value={loanAmt} onChange={(e) => setAmtStr(e.target.value)}
                className="w-full mt-2 h-1.5 accent-[#16a34a] cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>LKR 500K</span><span>LKR 50M</span>
              </div>
            </div>

            {/* Loan period */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Loan Period (Years)</label>
              <div className="relative">
                <input
                  type="number" min={1} max={30}
                  value={termStr}
                  onChange={(e) => setTermStr(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-[#16a34a] rounded-xl px-4 py-3 text-sm font-bold outline-none transition-colors"
                />
              </div>
              <input type="range" min={1} max={30} step={1}
                value={term} onChange={(e) => setTermStr(e.target.value)}
                className="w-full mt-2 h-1.5 accent-[#16a34a] cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1 yr</span><span>30 yrs</span>
              </div>
            </div>

            {/* Loan type + apply */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Loan Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-[#16a34a] rounded-xl px-4 py-3 text-sm font-bold outline-none transition-colors bg-white mb-3">
                <option value="all">All Types</option>
                {loanTypes.map((t) => <option key={t} value={t}>{LOAN_TYPE_LABELS[t] ?? t}</option>)}
              </select>
              <Link href="/home-loans/pre-approval"
                className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm py-3 rounded-xl transition-colors">
                Get Pre-Approved <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary stats ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pt-6 w-full">
        {!loading && best && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Lowest Interest Rate",   value: `${best.interest_rate.toFixed(2)}%`, sub: best.bank_name },
              { label: "Lowest Monthly Payment", value: LKR(best.monthly),                  sub: `${best.bank_name}` },
              { label: "Your Loan Amount",        value: LKR(loanAmt),                       sub: `Over ${term} years` },
              { label: "Banks Compared",          value: String(results.length),             sub: "Active offers" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                <p className="text-lg font-black text-[#16a34a] mt-0.5">{s.value}</p>
                <p className="text-xs text-gray-400 truncate">{s.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Comparison table ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-black text-gray-900">Housing Loan Comparison</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? <span className="inline-block h-3 w-52 bg-gray-200 rounded animate-pulse" /> : `${results.length} loan offer${results.length !== 1 ? "s" : ""} · ${LKR(loanAmt)} over ${term} years`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Info size={12} /> Sort by clicking column headers
            </div>
          </div>

          {/* Desktop table */}
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-40" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-8 bg-gray-100 rounded-lg w-20" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {banks.length === 0 ? "No bank rates configured yet." : "No banks match the selected amount and term."}
              </p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[40px_1fr_130px_150px_150px_140px_110px] gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div>#</div>
                <div>Bank / Loan Type</div>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors" onClick={() => toggleSort("rate")}>
                  Interest Rate <SortIcon col="rate" sort={sort} />
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors" onClick={() => toggleSort("monthly")}>
                  Monthly Payment <SortIcon col="monthly" sort={sort} />
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors" onClick={() => toggleSort("interest")}>
                  Total Interest <SortIcon col="interest" sort={sort} />
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors" onClick={() => toggleSort("total")}>
                  Total Payment <SortIcon col="total" sort={sort} />
                </button>
                <div />
              </div>

              <div className="divide-y divide-gray-50">
                {results.map((b, i) => (
                  <div key={b.id}
                    className={`transition-colors ${i === 0 ? "bg-[#16a34a]/[0.02]" : "hover:bg-gray-50/60"}`}>

                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-[40px_1fr_130px_150px_150px_140px_110px] gap-3 px-5 py-4 items-center">
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        i === 0 ? "bg-[#16a34a] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {i === 0 ? <Trophy size={14} /> : i + 1}
                      </div>

                      {/* Bank name & type */}
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {b.logo_url
                            ? <img src={b.logo_url} alt={b.bank_name} className="w-full h-full object-contain p-0.5" />
                            : <span className="font-black text-gray-400 text-xs">{b.bank_name.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-black text-gray-900 text-sm">{b.bank_name}</span>
                          {i === 0 && (
                            <span className="text-xs font-bold bg-[#16a34a] text-white px-2 py-0.5 rounded-full">Best Rate</span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${LOAN_TYPE_COLORS[b.loan_type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {LOAN_TYPE_LABELS[b.loan_type] ?? b.loan_type}
                          </span>
                        </div>
                        {b.features && b.features.length > 0 && (
                          <p className="text-xs text-gray-400 truncate">{b.features.join(" · ")}</p>
                        )}
                        </div>
                      </div>

                      {/* Interest rate */}
                      <div>
                        <p className={`font-black text-lg ${i === 0 ? "text-[#16a34a]" : "text-gray-900"}`}>
                          {b.interest_rate.toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-400">per annum</p>
                      </div>

                      {/* Monthly */}
                      <div>
                        <p className={`font-black text-sm ${i === 0 ? "text-[#16a34a]" : "text-gray-900"}`}>
                          {LKR(b.monthly)}
                        </p>
                        <p className="text-xs text-gray-400">per month</p>
                      </div>

                      {/* Total interest */}
                      <div>
                        <p className="font-bold text-sm text-gray-900">{LKR(b.totalInterest)}</p>
                        <p className="text-xs text-gray-400">interest cost</p>
                      </div>

                      {/* Total paid */}
                      <div>
                        <p className="font-bold text-sm text-gray-900">{LKR(b.totalPaid)}</p>
                        <p className="text-xs text-gray-400">total repayment</p>
                      </div>

                      {/* Apply */}
                      <Link
                        href={`/home-loans/apply?bank=${encodeURIComponent(b.bank_name)}&rate=${b.interest_rate}&amount=${loanAmt}&term=${term}&monthly=${Math.round(b.monthly)}`}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          i === 0
                            ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                            : "border-2 border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a]/5"
                        }`}>
                        <FileText size={11} /> Apply Now
                      </Link>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden px-4 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            i === 0 ? "bg-[#16a34a] text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {i === 0 ? <Trophy size={13} /> : i + 1}
                          </div>
                          <div className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {b.logo_url
                              ? <img src={b.logo_url} alt={b.bank_name} className="w-full h-full object-contain p-0.5" />
                              : <span className="font-black text-gray-400 text-xs">{b.bank_name.charAt(0)}</span>}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-gray-900 text-sm">{b.bank_name}</span>
                              {i === 0 && <span className="text-xs font-bold bg-[#16a34a] text-white px-1.5 py-0.5 rounded-full">Best</span>}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 inline-block ${LOAN_TYPE_COLORS[b.loan_type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {LOAN_TYPE_LABELS[b.loan_type] ?? b.loan_type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-black text-xl ${i === 0 ? "text-[#16a34a]" : "text-gray-900"}`}>{b.interest_rate.toFixed(2)}%</p>
                          <p className="text-xs text-gray-400">p.a.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-center">
                        <div>
                          <p className="text-xs text-gray-400">Monthly</p>
                          <p className={`font-black text-sm mt-0.5 ${i === 0 ? "text-[#16a34a]" : "text-gray-900"}`}>{LKR(b.monthly)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Interest</p>
                          <p className="font-bold text-sm text-gray-900 mt-0.5">{LKR(b.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-sm text-gray-900 mt-0.5">{LKR(b.totalPaid)}</p>
                        </div>
                      </div>

                      {b.features && b.features.length > 0 && (
                        <p className="text-xs text-gray-400">{b.features.join(" · ")}</p>
                      )}

                      <Link
                        href={`/home-loans/apply?bank=${encodeURIComponent(b.bank_name)}&rate=${b.interest_rate}&amount=${loanAmt}&term=${term}&monthly=${Math.round(b.monthly)}`}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          i === 0
                            ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                            : "border-2 border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a]/5"
                        }`}>
                        <FileText size={13} /> Apply Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <Info size={12} className="text-gray-400 shrink-0" />
                <p className="text-xs text-gray-400">
                  Rates are indicative only. Monthly repayments are calculated on principal & interest basis.
                  Contact the bank for exact figures and eligibility.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Loan types ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-10 w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-gray-900 mb-1">Types of Home Loans</h2>
          <p className="text-gray-400 text-sm">Choose the right structure for your situation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOAN_TYPES.map((lt) => {
            const Icon = lt.icon;
            return (
              <div key={lt.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${lt.colorIcon}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-0.5">{lt.title}</h3>
                <p className="text-xs font-bold text-[#16a34a] mb-2">{lt.rate}</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed flex-1">{lt.desc}</p>
                <ul className="space-y-1.5">
                  {lt.pros.map((p) => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle size={11} className="text-green-500 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-gray-900 mb-1">How to Get a Home Loan</h2>
            <p className="text-gray-400 text-sm">Simple steps from comparison to approval.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2,   n: 1, title: "Compare Banks",      desc: "Use our comparison table to find the best rate and monthly payment for your budget." },
              { icon: FileText,    n: 2, title: "Apply Online",        desc: "Click Apply Now on your preferred bank and fill in the simple online application form." },
              { icon: Users,       n: 3, title: "Get Pre-Approved",    desc: "A specialist reviews your application and contacts you within 24–48 hours." },
              { icon: Home,        n: 4, title: "Buy Your Home",       desc: "With approval in hand, browse thousands of listings across Sri Lanka." },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-14 h-14 bg-[#16a34a]/10 rounded-2xl flex items-center justify-center">
                      <Icon size={22} className="text-[#16a34a]" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#16a34a] text-white text-xs font-black rounded-full flex items-center justify-center">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-black text-gray-900 mb-1.5 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="bg-gradient-to-r from-[#16a34a] to-[#166534] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Star size={26} className="text-yellow-300" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-black text-xl mb-2">Ready to Apply?</h3>
            <p className="text-green-200 text-sm leading-relaxed">
              Choose a bank from the comparison table above and apply in minutes.
              Our specialists will contact you within 24 hours to guide you through the process.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/home-loans/pre-approval"
              className="bg-white text-[#16a34a] font-black text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap flex items-center gap-2">
              Get Pre-Approved <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom links ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-14 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Users,  title: "Find an Agent",     desc: "Connect with local agents who know your market.",      href: "/agents",                  cta: "Browse agents"   },
            { icon: Home,   title: "Browse Properties", desc: "Search thousands of listings across Sri Lanka.",        href: "/buy",                     cta: "View properties" },
            { icon: Clock,  title: "Get Pre-Approved",  desc: "Know your budget before you start property searching.", href: "/home-loans/pre-approval", cta: "Apply now"       },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#16a34a] hover:shadow-sm transition-all group">
                <div className="w-9 h-9 bg-[#16a34a]/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={16} className="text-[#16a34a]" />
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{c.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#16a34a] group-hover:gap-2 transition-all">
                  {c.cta} <ChevronRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
