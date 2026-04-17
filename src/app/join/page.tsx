"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from "lucide-react";

const accountTypes = [
  { id: "buyer", label: "Buyer / Renter", desc: "Search and save properties" },
  { id: "seller", label: "Seller / Landlord", desc: "List and manage properties" },
  { id: "agent", label: "Agent / Broker", desc: "Manage client listings" },
];

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (step === 1) { setStep(2); return; }
    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!agree) { setError("Please accept the terms to continue."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1800);
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Account created!</h2>
        <p className="text-gray-500 text-sm mb-6">Welcome to Greenbrick.net. Your account is ready to use.</p>
        <Link href="/" className="inline-block bg-[#121e80] hover:bg-[#0d1660] text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors">
          Start exploring
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(204,0,0,0.6)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)" }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#121e80] rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-white font-semibold text-sm">Greenbrick.net</span>
          </Link>

          <div>
            <h2 className="text-white font-black text-4xl leading-tight mb-4">
              Join Australia's<br />largest property<br />community.
            </h2>
            <div className="space-y-3 mt-8">
              {["Save and track your favourite properties","Get instant alerts on new listings","Connect with top agents and brokers","Access exclusive market insights"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#121e80] rounded-full flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#121e80] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-gray-900 font-semibold text-sm">Greenbrick.net</span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-[#121e80] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > s ? <Check size={13} /> : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                  {s === 1 ? "Account type" : "Your details"}
                </span>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-[#121e80]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {step === 1 ? "Create an account" : "Your details"}
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            {step === 1 ? "Choose how you'll use Greenbrick.net" : "Almost there — fill in your info below"}{" "}
            <Link href="/signin" className="text-[#121e80] font-semibold hover:underline">Sign in instead</Link>
          </p>

          {/* Step 1 — account type */}
          {step === 1 && (
            <div className="space-y-3">
              {accountTypes.map((t) => (
                <button key={t.id} onClick={() => setAccountType(t.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${accountType === t.id ? "border-[#121e80] bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <div>
                    <p className={`text-sm font-bold ${accountType === t.id ? "text-[#121e80]" : "text-gray-900"}`}>{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${accountType === t.id ? "border-[#121e80] bg-[#121e80]" : "border-gray-300"}`}>
                    {accountType === t.id && <Check size={11} className="text-white" />}
                  </div>
                </button>
              ))}

              <button onClick={handleNext}
                className="w-full bg-[#121e80] hover:bg-[#0d1660] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-4">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2 — details */}
          {step === 2 && (
            <div className="space-y-4">
              {error && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {[
                { key: "name", label: "Full name", placeholder: "Jane Smith", icon: <User size={15} className="text-gray-400" />, type: "text" },
                { key: "email", label: "Email address", placeholder: "you@example.com", icon: <Mail size={15} className="text-gray-400" />, type: "email" },
                { key: "phone", label: "Phone (optional)", placeholder: "+61 400 000 000", icon: <Phone size={15} className="text-gray-400" />, type: "tel" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{field.icon}</span>
                    <input type={field.type} value={form[field.key as keyof typeof form]}
                      onChange={(e) => update(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#121e80] focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#121e80] focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#121e80] focus:ring-2 focus:ring-green-100 transition-all placeholder-gray-400" />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setAgree(!agree)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? "bg-[#121e80] border-[#121e80]" : "border-gray-300 hover:border-gray-500"}`}>
                  {agree && <Check size={11} className="text-white" />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/" className="text-[#121e80] hover:underline font-medium">Terms of Use</Link>
                  {" "}and{" "}
                  <Link href="/" className="text-[#121e80] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} disabled={loading}
                  className="flex-1 bg-[#121e80] hover:bg-[#0d1660] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
                    : <> Create account <ArrowRight size={16} /> </>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
