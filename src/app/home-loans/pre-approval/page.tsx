"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loanEnquiries } from "@/lib/api";
import {
  User, Mail, Phone, Briefcase, DollarSign, Home,
  MapPin, CheckCircle, ArrowLeft, ArrowRight, ChevronLeft,
} from "lucide-react";

const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const EMPLOYMENT_TYPES = [
  { value: "full_time",     label: "Full-time" },
  { value: "part_time",     label: "Part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "casual",        label: "Casual" },
];

const LOAN_PURPOSES = [
  { value: "buy_home",    label: "Buy a home",  desc: "Purchase your own home to live in" },
  { value: "investment",  label: "Investment",  desc: "Purchase a property to rent out" },
  { value: "refinance",   label: "Refinance",   desc: "Switch or restructure an existing loan" },
];

const PROPERTY_TYPES = ["House", "Unit", "Townhouse", "Land", "Other"];

type FormData = {
  // Step 1
  name: string;
  email: string;
  phone: string;
  // Step 2
  employment_type: string;
  annual_income: string;
  deposit_amount: string;
  loan_amount: string;
  // Step 3
  loan_purpose: string;
  property_type: string;
  property_state: string;
  estimated_property_value: string;
  message: string;
};

const INIT: FormData = {
  name: "", email: "", phone: "",
  employment_type: "full_time",
  annual_income: "", deposit_amount: "", loan_amount: "",
  loan_purpose: "buy_home", property_type: "House",
  property_state: "VIC", estimated_property_value: "", message: "",
};

const AUD = (v: string) => {
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return isNaN(n) ? "" : n.toLocaleString("en-AU");
};

function Field({ label, icon: Icon, error, children }: {
  label: string; icon?: React.ElementType; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {Icon && <span className="inline-flex items-center gap-1.5"><Icon size={13} className="text-gray-400" /> {label}</span>}
        {!Icon && label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">$</span>
      <input
        type="text" inputMode="numeric"
        value={value ? AUD(value) : ""}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors"
      />
    </div>
  );
}

export default function PreApprovalPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep1(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim())               e.name  = "Name is required";
    if (!form.email.trim())              e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Partial<FormData> = {};
    if (!form.annual_income)  e.annual_income  = "Annual income is required";
    if (!form.deposit_amount) e.deposit_amount = "Deposit amount is required";
    if (!form.loan_amount)    e.loan_amount    = "Loan amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      await loanEnquiries.submit({
        name:                     form.name,
        email:                    form.email,
        phone:                    form.phone || null,
        employment_type:          form.employment_type as never,
        annual_income:            parseInt(form.annual_income),
        deposit_amount:           parseInt(form.deposit_amount),
        loan_amount:              parseInt(form.loan_amount),
        loan_purpose:             form.loan_purpose as never,
        property_type:            form.property_type,
        property_state:           form.property_state,
        estimated_property_value: form.estimated_property_value ? parseInt(form.estimated_property_value) : null,
        message:                  form.message || null,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      alert((e as Error).message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS = ["About you", "Your finances", "The property"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#15803d] via-[#16a34a] to-[#166534] py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          <Link href="/home-loans"
            className="inline-flex items-center gap-1.5 text-green-300 text-xs hover:text-white transition-colors mb-4">
            <ChevronLeft size={13} /> Back to Home Loans
          </Link>
          <h1 className="text-white font-black text-3xl mb-2">Get Pre-Approved</h1>
          <p className="text-green-200 text-sm">
            Tell us about yourself and your loan needs — a specialist will be in touch within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10 w-full flex-1">

        {done ? (
          /* ── Success screen ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Application Received!</h2>
            <p className="text-gray-500 text-sm mb-2">
              Thanks <span className="font-semibold text-gray-900">{form.name}</span>! We've received your pre-approval enquiry.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              A specialist will review your details and contact you at <span className="text-gray-700 font-medium">{form.email}</span> within 24–48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/buy"
                className="bg-[#16a34a] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm flex items-center justify-center gap-2">
                <Home size={14} /> Browse Properties
              </Link>
              <Link href="/home-loans"
                className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to Calculators
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Progress bar ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex items-center gap-2 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                      step > i + 1 ? "bg-green-500 text-white" :
                      step === i + 1 ? "bg-[#16a34a] text-white" :
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${step === i + 1 ? "text-[#16a34a]" : "text-gray-400"}`}>
                      {s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Step {step} of {STEPS.length}</p>
                <h2 className="text-lg font-black text-gray-900 mt-0.5">{STEPS[step - 1]}</h2>
              </div>

              <div className="px-7 py-6 space-y-5">

                {/* ── Step 1: About you ── */}
                {step === 1 && (
                  <>
                    <Field label="Full name" icon={User} error={errors.name}>
                      <input value={form.name} onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Sarah Johnson"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </Field>
                    <Field label="Email address" icon={Mail} error={errors.email}>
                      <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </Field>
                    <Field label="Phone number (optional)" icon={Phone}>
                      <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                        placeholder="04XX XXX XXX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors" />
                    </Field>
                  </>
                )}

                {/* ── Step 2: Finances ── */}
                {step === 2 && (
                  <>
                    <Field label="Employment type" icon={Briefcase}>
                      <div className="grid grid-cols-2 gap-2">
                        {EMPLOYMENT_TYPES.map((et) => (
                          <button key={et.value} type="button" onClick={() => set("employment_type", et.value)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                              form.employment_type === et.value
                                ? "bg-[#16a34a] text-white border-[#16a34a]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}>
                            {et.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Annual income (before tax)" icon={DollarSign} error={errors.annual_income}>
                      <MoneyInput value={form.annual_income} onChange={(v) => set("annual_income", v)} placeholder="80,000" />
                    </Field>
                    <Field label="Deposit amount" icon={DollarSign} error={errors.deposit_amount}>
                      <MoneyInput value={form.deposit_amount} onChange={(v) => set("deposit_amount", v)} placeholder="100,000" />
                    </Field>
                    <Field label="Loan amount needed" icon={DollarSign} error={errors.loan_amount}>
                      <MoneyInput value={form.loan_amount} onChange={(v) => set("loan_amount", v)} placeholder="500,000" />
                    </Field>

                    {/* LVR indicator */}
                    {form.loan_amount && form.deposit_amount && (
                      <div className="bg-green-50 rounded-xl p-4">
                        {(() => {
                          const loan = parseInt(form.loan_amount);
                          const dep  = parseInt(form.deposit_amount);
                          const total = loan + dep;
                          const lvr = total > 0 ? Math.round((loan / total) * 100) : 0;
                          const lmiNeeded = lvr > 80;
                          return (
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-bold text-gray-900">LVR: {lvr}%</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {lmiNeeded ? "Lenders Mortgage Insurance (LMI) may apply" : "No LMI required — great deposit!"}
                                </p>
                              </div>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${lmiNeeded ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                                {lvr}%
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}

                {/* ── Step 3: Property ── */}
                {step === 3 && (
                  <>
                    <Field label="Loan purpose" icon={Home}>
                      <div className="space-y-2">
                        {LOAN_PURPOSES.map((lp) => (
                          <button key={lp.value} type="button" onClick={() => set("loan_purpose", lp.value)}
                            className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                              form.loan_purpose === lp.value
                                ? "bg-[#16a34a]/5 border-[#16a34a]"
                                : "bg-white border-gray-200 hover:border-gray-400"
                            }`}>
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                              form.loan_purpose === lp.value ? "border-[#16a34a]" : "border-gray-300"
                            }`}>
                              {form.loan_purpose === lp.value && <div className="w-2 h-2 rounded-full bg-[#16a34a]" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{lp.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{lp.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Property type">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {PROPERTY_TYPES.map((pt) => (
                          <button key={pt} type="button" onClick={() => set("property_type", pt)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              form.property_type === pt
                                ? "bg-[#16a34a] text-white border-[#16a34a]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}>
                            {pt}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Property state / territory" icon={MapPin}>
                      <div className="grid grid-cols-4 gap-1.5">
                        {AU_STATES.map((s) => (
                          <button key={s} type="button" onClick={() => set("property_state", s)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              form.property_state === s
                                ? "bg-[#16a34a] text-white border-[#16a34a]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Estimated property value (optional)" icon={DollarSign}>
                      <MoneyInput value={form.estimated_property_value}
                        onChange={(v) => set("estimated_property_value", v)} placeholder="650,000" />
                    </Field>

                    <Field label="Additional notes (optional)">
                      <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
                        rows={3} placeholder="Any extra information you'd like to share..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors resize-none" />
                    </Field>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="px-7 py-5 border-t border-gray-100 flex gap-3">
                {step > 1 && (
                  <button onClick={back}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button onClick={next}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60">
                    {submitting ? "Submitting…" : "Submit Application"}
                    {!submitting && <CheckCircle size={14} />}
                  </button>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              Your information is kept confidential and used only to process your enquiry.
            </p>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
