"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loanEnquiries } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  User, Mail, Phone, Briefcase, DollarSign, Home,
  MapPin, CheckCircle, ChevronLeft, CreditCard,
  FileText, Calendar, Loader2,
} from "lucide-react";

// ── Sri Lankan districts ──────────────────────────────────────────────────────

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Trincomalee", "Batticaloa", "Ampara",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const EMPLOYMENT_TYPES = [
  { value: "full_time",     label: "Full-time"     },
  { value: "part_time",     label: "Part-time"     },
  { value: "self_employed", label: "Self-employed" },
  { value: "casual",        label: "Casual"        },
];

const LOAN_PURPOSES = [
  { value: "buy_home",   label: "Buy a Home",  desc: "Purchase your own home" },
  { value: "investment", label: "Investment",  desc: "Buy to rent out"        },
  { value: "refinance",  label: "Refinance",   desc: "Switch existing loan"   },
];

const PROPERTY_TYPES = ["House", "Apartment", "Townhouse", "Land", "Commercial", "Other"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function numStr(s: string) {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return isNaN(n) ? "" : n.toLocaleString("en-LK");
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, error, required, children }: {
  label: string; icon?: React.ElementType; error?: string;
  required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
        {Icon && <Icon size={13} className="text-gray-400" />}
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold pointer-events-none">LKR</span>
      <input
        type="text" inputMode="numeric"
        value={value ? numStr(value) : ""}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors"
      />
    </div>
  );
}

const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors";

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 bg-[#16a34a]/10 rounded-lg flex items-center justify-center">
          <Icon size={14} className="text-[#16a34a]" />
        </div>
        <h3 className="font-black text-gray-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────

type FormData = {
  name: string; nic_number: string; email: string; phone: string;
  employment_type: string;
  annual_income: string; deposit_amount: string; loan_amount: string; loan_term: string;
  loan_purpose: string; property_type: string; property_state: string;
  estimated_property_value: string; message: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const INIT: FormData = {
  name: "", nic_number: "", email: "", phone: "",
  employment_type: "full_time",
  annual_income: "", deposit_amount: "", loan_amount: "", loan_term: "",
  loan_purpose: "buy_home", property_type: "House",
  property_state: "Colombo", estimated_property_value: "", message: "",
};

export default function PreApprovalPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim())  e.name  = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.annual_income)  e.annual_income  = "Annual income is required";
    if (!form.deposit_amount) e.deposit_amount = "Deposit amount is required";
    if (!form.loan_amount)    e.loan_amount    = "Loan amount is required";
    if (!form.loan_term || parseInt(form.loan_term) < 1 || parseInt(form.loan_term) > 30)
      e.loan_term = "Enter a loan term between 1 and 30 years";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name:                     form.name,
        selected_bank:            null,
        nic_number:               form.nic_number || null,
        email:                    form.email,
        phone:                    form.phone || null,
        employment_type:          form.employment_type as never,
        annual_income:            parseInt(form.annual_income),
        deposit_amount:           parseInt(form.deposit_amount),
        loan_amount:              parseInt(form.loan_amount),
        loan_term:                parseInt(form.loan_term) || null,
        loan_purpose:             form.loan_purpose as never,
        property_type:            form.property_type,
        property_state:           form.property_state,
        estimated_property_value: form.estimated_property_value ? parseInt(form.estimated_property_value) : null,
        message:                  form.message || null,
      };
      if (token) {
        await loanEnquiries.submitAuth(payload, token);
      } else {
        await loanEnquiries.submit(payload);
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      alert((err as Error).message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success ───────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-lg w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Application Received!</h2>
            <p className="text-gray-500 text-sm mb-2">
              Thanks <span className="font-semibold text-gray-900">{form.name}</span>! We've received your pre-approval enquiry.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              A specialist will review your details and contact you at{" "}
              <span className="text-gray-700 font-medium">{form.email}</span> within 24–48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/buy"
                className="bg-[#16a34a] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm flex items-center justify-center gap-2">
                <Home size={14} /> Browse Properties
              </Link>
              <Link href="/home-loans"
                className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                <ChevronLeft size={14} /> Back to Loans
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Page ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#15803d] via-[#16a34a] to-[#166534] py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/home-loans"
            className="inline-flex items-center gap-1.5 text-green-300 text-xs hover:text-white transition-colors mb-4">
            <ChevronLeft size={13} /> Back to Home Loans
          </Link>
          <h1 className="text-white font-black text-3xl mb-2">Get Pre-Approved</h1>
          <p className="text-green-200 text-sm max-w-md mx-auto">
            Tell us about yourself and your loan needs — a specialist will be in touch within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Section icon={User} title="Personal Details">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={User} required error={errors.name}>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Nushfa Fathima" className={inp} />
                </Field>
                <Field label="NIC Number" icon={CreditCard} error={errors.nic_number}>
                  <input value={form.nic_number} onChange={(e) => set("nic_number", e.target.value)}
                    placeholder="e.g. 200012345678" className={inp} />
                </Field>
                <Field label="Email Address" icon={Mail} required error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com" className={inp} />
                </Field>
                <Field label="Phone Number" icon={Phone} required error={errors.phone}>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    placeholder="07X XXX XXXX" className={inp} />
                </Field>
              </div>
            </Section>
          </div>

          {/* Loan details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Section icon={DollarSign} title="Loan Details">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Loan Amount" icon={DollarSign} required error={errors.loan_amount}>
                  <MoneyInput value={form.loan_amount} onChange={(v) => set("loan_amount", v)} placeholder="5,000,000" />
                </Field>
                <Field label="Loan Term (years)" icon={Calendar} required error={errors.loan_term}>
                  <input type="number" min={1} max={30} value={form.loan_term}
                    onChange={(e) => set("loan_term", e.target.value)}
                    placeholder="e.g. 20" className={inp} />
                </Field>
                <Field label="Deposit Amount" icon={DollarSign} required error={errors.deposit_amount}>
                  <MoneyInput value={form.deposit_amount} onChange={(v) => set("deposit_amount", v)} placeholder="1,000,000" />
                </Field>
                <Field label="Estimated Property Value (optional)" icon={Home}>
                  <MoneyInput value={form.estimated_property_value}
                    onChange={(v) => set("estimated_property_value", v)} placeholder="8,000,000" />
                </Field>
              </div>

              <Field label="Loan Purpose" icon={FileText}>
                <div className="grid grid-cols-3 gap-2">
                  {LOAN_PURPOSES.map((lp) => (
                    <button key={lp.value} type="button" onClick={() => set("loan_purpose", lp.value)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                        form.loan_purpose === lp.value
                          ? "bg-[#16a34a]/5 border-[#16a34a] text-[#16a34a]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      <span className="text-xs font-bold">{lp.label}</span>
                      <span className="text-xs text-gray-400 leading-tight">{lp.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
          </div>

          {/* Employment & income */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Section icon={Briefcase} title="Employment & Income">
              <Field label="Employment Type" icon={Briefcase}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EMPLOYMENT_TYPES.map((et) => (
                    <button key={et.value} type="button" onClick={() => set("employment_type", et.value)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.employment_type === et.value
                          ? "bg-[#16a34a] text-white border-[#16a34a]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}>
                      {et.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Annual Income (before tax)" icon={DollarSign} required error={errors.annual_income}>
                <MoneyInput value={form.annual_income} onChange={(v) => set("annual_income", v)} placeholder="600,000" />
              </Field>
            </Section>
          </div>

          {/* Property details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Section icon={Home} title="Property Details">
              <Field label="Property Type">
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((pt) => (
                    <button key={pt} type="button" onClick={() => set("property_type", pt)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        form.property_type === pt
                          ? "bg-[#16a34a] text-white border-[#16a34a]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="District" icon={MapPin}>
                <select value={form.property_state} onChange={(e) => set("property_state", e.target.value)} className={inp}>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </Section>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Section icon={FileText} title="Additional Notes">
              <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
                rows={3} placeholder="Any additional information you'd like to share..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a] transition-colors resize-none" />
            </Section>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black text-base px-6 py-4 rounded-2xl transition-colors">
            {submitting
              ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
              : <><CheckCircle size={18} /> Submit Pre-Approval Request</>}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your information is kept confidential and used only to process your enquiry.
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
