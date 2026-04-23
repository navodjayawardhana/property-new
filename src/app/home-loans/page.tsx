"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calculator, Home, TrendingUp, Shield, Users,
  DollarSign, Clock, CheckCircle, ArrowRight,
  ChevronRight, Star, Zap, Lock,
} from "lucide-react";

// ── Stamp duty (indicative, state-specific brackets) ──────────────────────

function calcStampDuty(value: number, state: string, firstHome: boolean): number {
  let duty = 0;

  switch (state) {
    case "VIC":
      if (value <= 25000)        duty = value * 0.014;
      else if (value <= 130000)  duty = 350    + (value - 25000)  * 0.024;
      else if (value <= 960000)  duty = 2870   + (value - 130000) * 0.06;
      else                       duty = value * 0.055;
      if (firstHome && value <= 600000) duty = 0;
      else if (firstHome && value <= 750000) duty = duty * ((value - 600000) / 150000);
      break;

    case "NSW":
      if (value <= 14000)        duty = value * 0.0125;
      else if (value <= 30000)   duty = 175    + (value - 14000)   * 0.015;
      else if (value <= 80000)   duty = 415    + (value - 30000)   * 0.0175;
      else if (value <= 300000)  duty = 1290   + (value - 80000)   * 0.035;
      else if (value <= 1000000) duty = 8990   + (value - 300000)  * 0.045;
      else if (value <= 3000000) duty = 40490  + (value - 1000000) * 0.055;
      else                       duty = 150490 + (value - 3000000) * 0.07;
      if (firstHome && value <= 800000)  duty = 0;
      else if (firstHome && value <= 1000000) duty = duty * ((value - 800000) / 200000);
      break;

    case "QLD":
      if (value <= 5000)         duty = 0;
      else if (value <= 75000)   duty = (value - 5000)  * 0.015;
      else if (value <= 540000)  duty = 1050   + (value - 75000)   * 0.035;
      else if (value <= 1000000) duty = 17325  + (value - 540000)  * 0.045;
      else                       duty = 38025  + (value - 1000000) * 0.0575;
      if (firstHome && value <= 500000) duty = 0;
      else if (firstHome && value <= 550000) duty = duty * ((value - 500000) / 50000);
      break;

    case "WA":
      if (value <= 120000)       duty = value * 0.019;
      else if (value <= 150000)  duty = 2280   + (value - 120000)  * 0.0285;
      else if (value <= 360000)  duty = 3135   + (value - 150000)  * 0.038;
      else if (value <= 725000)  duty = 11115  + (value - 360000)  * 0.0475;
      else                       duty = 28453  + (value - 725000)  * 0.0515;
      if (firstHome && value <= 430000) duty = 0;
      else if (firstHome && value <= 530000) duty = duty * ((value - 430000) / 100000);
      break;

    case "SA":
      if (value <= 12000)        duty = value * 0.01;
      else if (value <= 30000)   duty = 120    + (value - 12000)   * 0.02;
      else if (value <= 50000)   duty = 480    + (value - 30000)   * 0.03;
      else if (value <= 100000)  duty = 1080   + (value - 50000)   * 0.035;
      else if (value <= 200000)  duty = 2830   + (value - 100000)  * 0.04;
      else if (value <= 250000)  duty = 6830   + (value - 200000)  * 0.0425;
      else if (value <= 300000)  duty = 8955   + (value - 250000)  * 0.0475;
      else if (value <= 500000)  duty = 11330  + (value - 300000)  * 0.05;
      else                       duty = 21330  + (value - 500000)  * 0.055;
      break;

    case "TAS":
      if (value <= 3000)         duty = 0;
      else if (value <= 25000)   duty = 50;
      else if (value <= 75000)   duty = 50     + (value - 25000)   * 0.0175;
      else if (value <= 200000)  duty = 925    + (value - 75000)   * 0.0225;
      else if (value <= 375000)  duty = 3737   + (value - 200000)  * 0.035;
      else if (value <= 725000)  duty = 9862   + (value - 375000)  * 0.04;
      else                       duty = 23862  + (value - 725000)  * 0.045;
      if (firstHome && value <= 400000) duty = duty * 0.5;
      break;

    case "ACT":
      if (value <= 200000)       duty = 20     + value             * 0.0034;
      else if (value <= 300000)  duty = 700    + (value - 200000)  * 0.022;
      else if (value <= 500000)  duty = 2900   + (value - 300000)  * 0.034;
      else if (value <= 750000)  duty = 9700   + (value - 500000)  * 0.0432;
      else if (value <= 1000000) duty = 20500  + (value - 750000)  * 0.059;
      else                       duty = 35250  + (value - 1000000) * 0.064;
      if (firstHome && value <= 607000) duty = 0;
      break;

    case "NT": {
      const V = value / 1000;
      duty = 0.06571441 * V * V + 15 * V;
      if (firstHome) duty = Math.max(0, duty - 18601);
      break;
    }

    default:
      duty = value * 0.04;
  }

  return Math.max(0, Math.round(duty));
}

// ── Repayment formula ──────────────────────────────────────────────────────

function calcMonthly(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Helpers ────────────────────────────────────────────────────────────────

const AUD = (n: number) =>
  Math.round(n).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

// ── Data ───────────────────────────────────────────────────────────────────

const LOAN_TYPES = [
  {
    icon: TrendingUp,
    title: "Variable Rate",
    rate: "From 5.99% p.a.",
    colorIcon: "bg-green-50 text-[#16a34a]",
    desc: "Rate moves with the market. Repayments can fall if rates drop — great flexibility.",
    pros: ["Flexible extra repayments", "Offset account", "Redraw facility"],
  },
  {
    icon: Lock,
    title: "Fixed Rate",
    rate: "From 6.29% p.a.",
    colorIcon: "bg-green-50 text-green-700",
    desc: "Lock in your rate for 1–5 years. Know exactly what you pay each month.",
    pros: ["Repayment certainty", "Easy budgeting", "Protection from rate rises"],
  },
  {
    icon: Zap,
    title: "Split Loan",
    rate: "Customise your split",
    colorIcon: "bg-purple-50 text-purple-700",
    desc: "Part variable, part fixed. Flexibility and certainty — best of both worlds.",
    pros: ["Manage rate risk", "Partial offset account", "Flexible structure"],
  },
  {
    icon: DollarSign,
    title: "Interest Only",
    rate: "From 6.59% p.a.",
    colorIcon: "bg-orange-50 text-orange-700",
    desc: "Pay interest only for an initial period. Lower repayments short-term.",
    pros: ["Lower initial repayments", "Popular for investors", "Up to 5 yr IO period"],
  },
];

const STEPS = [
  { icon: Calculator, n: 1, title: "Calculate",          desc: "Use our free calculators to understand repayments, borrowing power, and stamp duty." },
  { icon: Users,      n: 2, title: "Talk to a specialist", desc: "Connect with a local agent or mortgage broker to explore your options." },
  { icon: CheckCircle,n: 3, title: "Get pre-approved",   desc: "Get conditional approval so you know your exact budget before searching." },
  { icon: Home,       n: 4, title: "Find your home",     desc: "Browse thousands of listings across Australia with full confidence." },
];

const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

// ── SliderInput ────────────────────────────────────────────────────────────

function SliderInput({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm font-black text-[#16a34a]">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#16a34a] cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomeLoansPage() {
  const [tab, setTab] = useState<"repayment" | "borrowing" | "stamp">("repayment");

  // Repayment
  const [loanAmt, setLoanAmt]   = useState(500000);
  const [rate,    setRate]       = useState(6.0);
  const [term,    setTerm]       = useState(30);

  // Borrowing power
  const [income,   setIncome]   = useState(80000);
  const [expenses, setExpenses] = useState(2000);
  const [bpRate,   setBpRate]   = useState(6.0);
  const [bpTerm,   setBpTerm]   = useState(30);

  // Stamp duty
  const [propVal,   setPropVal]   = useState(600000);
  const [sdState,   setSdState]   = useState("VIC");
  const [firstHome, setFirstHome] = useState(false);

  // Derived
  const monthly      = useMemo(() => calcMonthly(loanAmt, rate, term), [loanAmt, rate, term]);
  const totalPaid    = monthly * term * 12;
  const totalInterest = totalPaid - loanAmt;

  const borrowPower = useMemo(() => {
    const maxMonthly = (income / 12) * 0.30 - expenses;
    if (maxMonthly <= 0) return 0;
    const r = bpRate / 100 / 12;
    const n = bpTerm * 12;
    if (r === 0) return maxMonthly * n;
    return maxMonthly * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  }, [income, expenses, bpRate, bpTerm]);

  const duty = useMemo(() => calcStampDuty(propVal, sdState, firstHome), [propVal, sdState, firstHome]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#15803d] via-[#16a34a] to-[#166534] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-green-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <Home size={12} /> Home Loans
          </div>
          <h1 className="text-white font-black text-4xl md:text-5xl mb-4 leading-tight">
            Find the right home loan<br className="hidden sm:block" /> for you
          </h1>
          <p className="text-green-200 text-base mb-8 max-w-xl mx-auto">
            Calculate your repayments, understand your borrowing power, and connect with a specialist — all in one place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/home-loans/pre-approval"
              className="bg-white text-[#16a34a] font-black px-6 py-3 rounded-xl hover:bg-green-50 transition-colors text-sm flex items-center gap-2">
              Get pre-approved <ArrowRight size={14} />
            </Link>
            <a href="#calculators"
              className="border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Use calculators
            </a>
          </div>
        </div>
      </div>

      {/* ── Quick stats bar ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Variable rates from", value: "5.99% p.a." },
            { label: "Fixed rates from",    value: "6.29% p.a." },
            { label: "Max loan term",        value: "30 years"   },
            { label: "Approval in",          value: "24–48 hrs"  },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-black text-[#16a34a]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calculators ──────────────────────────────────────────────────── */}
      <div id="calculators" className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Home Loan Calculators</h2>
          <p className="text-gray-500 text-sm">Instant estimates to help plan your purchase.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5 mb-8 max-w-lg mx-auto">
          {(["repayment", "borrowing", "stamp"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-xs sm:text-sm font-bold py-2.5 rounded-xl transition-all ${
                tab === t ? "bg-white text-[#16a34a] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t === "repayment" ? "Repayments" : t === "borrowing" ? "Borrow Power" : "Stamp Duty"}
            </button>
          ))}
        </div>

        {/* Calculator panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* ── Repayment ── */}
          {tab === "repayment" && (
            <div className="grid md:grid-cols-2">
              <div className="p-8 space-y-7">
                <h3 className="font-black text-gray-900 text-lg">Repayment Calculator</h3>
                <SliderInput label="Loan amount" value={loanAmt} min={50000} max={3000000} step={10000}
                  format={AUD} onChange={setLoanAmt} />
                <SliderInput label="Interest rate (p.a.)" value={rate} min={1} max={15} step={0.1}
                  format={(v) => `${v.toFixed(1)}%`} onChange={setRate} />
                <SliderInput label="Loan term" value={term} min={5} max={30} step={1}
                  format={(v) => `${v} yrs`} onChange={setTerm} />
              </div>
              <div className="bg-[#16a34a] p-8 flex flex-col justify-center gap-5">
                <p className="text-green-300 text-xs font-bold uppercase tracking-widest">Your estimate</p>
                <div>
                  <p className="text-green-200 text-sm mb-1">Monthly repayment</p>
                  <p className="text-white font-black text-4xl">{AUD(monthly)}</p>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  {[
                    { label: "Fortnightly",        val: AUD(monthly / 2)      },
                    { label: "Weekly",             val: AUD(monthly / 4.33)   },
                    { label: "Total interest",     val: AUD(totalInterest)    },
                    { label: "Total amount paid",  val: AUD(totalPaid)        },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-green-200">{r.label}</span>
                      <span className="text-white font-bold">{r.val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-green-300/50 text-xs">* Indicative only. Principal & interest loan.</p>
              </div>
            </div>
          )}

          {/* ── Borrowing power ── */}
          {tab === "borrowing" && (
            <div className="grid md:grid-cols-2">
              <div className="p-8 space-y-7">
                <h3 className="font-black text-gray-900 text-lg">Borrowing Power Calculator</h3>
                <SliderInput label="Annual income (before tax)" value={income} min={20000} max={500000} step={5000}
                  format={AUD} onChange={setIncome} />
                <SliderInput label="Monthly living expenses" value={expenses} min={0} max={10000} step={100}
                  format={AUD} onChange={setExpenses} />
                <SliderInput label="Interest rate (p.a.)" value={bpRate} min={1} max={15} step={0.1}
                  format={(v) => `${v.toFixed(1)}%`} onChange={setBpRate} />
                <SliderInput label="Loan term" value={bpTerm} min={5} max={30} step={1}
                  format={(v) => `${v} yrs`} onChange={setBpTerm} />
              </div>
              <div className="bg-[#16a34a] p-8 flex flex-col justify-center gap-5">
                <p className="text-green-300 text-xs font-bold uppercase tracking-widest">Estimated borrowing power</p>
                {borrowPower > 0 ? (
                  <>
                    <div>
                      <p className="text-green-200 text-sm mb-1">You could borrow up to</p>
                      <p className="text-white font-black text-4xl">{AUD(borrowPower)}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4 space-y-2.5">
                      {[
                        { label: "Max monthly repayment", val: AUD((income / 12) * 0.3 - expenses) },
                        { label: "Annual income",         val: `${AUD(income)} p.a.` },
                        { label: "Monthly expenses",      val: AUD(expenses) },
                      ].map((r) => (
                        <div key={r.label} className="flex justify-between text-sm">
                          <span className="text-green-200">{r.label}</span>
                          <span className="text-white font-bold">{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-white font-black text-lg mb-2">Expenses too high</p>
                    <p className="text-green-200 text-sm">Reduce monthly expenses or increase your income to see estimated borrowing power.</p>
                  </div>
                )}
                <p className="text-green-300/50 text-xs">* Based on 30% of gross income rule. Indicative only — lenders apply their own criteria.</p>
              </div>
            </div>
          )}

          {/* ── Stamp duty ── */}
          {tab === "stamp" && (
            <div className="grid md:grid-cols-2">
              <div className="p-8 space-y-7">
                <h3 className="font-black text-gray-900 text-lg">Stamp Duty Calculator</h3>
                <SliderInput label="Property value" value={propVal} min={50000} max={5000000} step={10000}
                  format={AUD} onChange={setPropVal} />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State / Territory</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {AU_STATES.map((s) => (
                      <button key={s} onClick={() => setSdState(s)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          sdState === s
                            ? "bg-[#16a34a] text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setFirstHome(!firstHome)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${firstHome ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${firstHome ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">First home buyer</span>
                </label>
              </div>

              <div className="bg-[#16a34a] p-8 flex flex-col justify-center gap-5">
                <p className="text-green-300 text-xs font-bold uppercase tracking-widest">Stamp duty estimate</p>
                <div>
                  <p className="text-green-200 text-sm mb-1">Stamp duty payable</p>
                  <p className="text-white font-black text-4xl">{AUD(duty)}</p>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  {[
                    { label: "Property value",    val: AUD(propVal)            },
                    { label: "Total upfront cost", val: AUD(propVal + duty)    },
                    { label: "Effective duty rate", val: `${propVal > 0 ? ((duty / propVal) * 100).toFixed(2) : "0.00"}%` },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-green-200">{r.label}</span>
                      <span className="text-white font-bold">{r.val}</span>
                    </div>
                  ))}
                  {duty === 0 && firstHome && (
                    <div className="flex items-center gap-2 bg-green-500/20 rounded-xl p-3 mt-1">
                      <CheckCircle size={13} className="text-green-400 shrink-0" />
                      <p className="text-green-300 text-xs font-semibold">First home buyer exemption applied!</p>
                    </div>
                  )}
                  {sdState === "SA" && firstHome && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 rounded-xl p-3 mt-1">
                      <Star size={13} className="text-yellow-300 shrink-0" />
                      <p className="text-yellow-200 text-xs">SA has no stamp duty exemption, but a $15,000 First Home Owner Grant may apply for new homes.</p>
                    </div>
                  )}
                </div>
                <p className="text-green-300/50 text-xs">* Indicative only. Does not include conveyancing, legal, or other fees.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Loan types ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-12 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Types of Home Loans</h2>
          <p className="text-gray-500 text-sm">Choose the right structure for your situation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOAN_TYPES.map((lt) => {
            const Icon = lt.icon;
            return (
              <div key={lt.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${lt.colorIcon}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-black text-gray-900 mb-0.5">{lt.title}</h3>
                <p className="text-xs font-bold text-[#16a34a] mb-3">{lt.rate}</p>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed flex-1">{lt.desc}</p>
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
      <div className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">How it works</h2>
            <p className="text-gray-500 text-sm">From calculation to settlement — we're with you every step.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => {
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
                  <h3 className="font-black text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── First home buyer banner ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="bg-gradient-to-r from-[#16a34a] to-[#166534] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Star size={28} className="text-yellow-300" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-black text-xl mb-2">First Home Buyer?</h3>
            <p className="text-green-200 text-sm leading-relaxed">
              You may be eligible for stamp duty exemptions, the First Home Owner Grant (FHOG),
              and the First Home Guarantee — letting you buy with just a 5% deposit. Use our
              Stamp Duty calculator above with "First home buyer" toggled on to see your potential savings.
            </p>
          </div>
          <Link href="/home-loans/pre-approval"
            className="bg-white text-[#16a34a] font-black text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shrink-0 whitespace-nowrap flex items-center gap-2">
            Apply now <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Bottom CTA cards ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Users,      title: "Find an agent",     desc: "Connect with local agents who know your market.",             href: "/agents",     cta: "Browse agents"    },
            { icon: Home,       title: "Browse properties", desc: "Search thousands of listings across Australia.",               href: "/buy", cta: "View properties"  },
            { icon: Clock,      title: "Get pre-approved",  desc: "Know your budget before you start property searching.",        href: "/home-loans/pre-approval", cta: "Apply now"   },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#16a34a] hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-[#16a34a]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#16a34a]" />
                </div>
                <h3 className="font-black text-gray-900 mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{c.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#16a34a] group-hover:gap-2 transition-all">
                  {c.cta} <ChevronRight size={13} />
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
