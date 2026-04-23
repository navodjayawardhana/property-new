"use client";

"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const accountTypes = [
  { id: "buyer",  label: "Buyer / Renter",     desc: "Search and save properties" },
  { id: "seller", label: "Seller / Landlord",   desc: "List and manage properties" },
  { id: "agent",  label: "Agent / Broker",      desc: "Manage client listings" },
];

export default function JoinPage() {
  const router = useRouter();
  const { register, verifyEmail, resendVerification } = useAuth();

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [countdownKey, setCountdownKey] = useState(0);
  const [error, setError] = useState("");

  // Step 3: email verification
  const [verifyEmail_, setVerifyEmail_] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start/restart 60-second countdown when entering step 3 or after resend
  useEffect(() => {
    if (step !== 3) return;
    setCountdown(60);
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step, countdownKey]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleDigitChange = (i: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus();
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    digitRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleNext = async () => {
    if (step === 1) { setStep(2); return; }

    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!agree) { setError("Please accept the terms to continue."); return; }

    setError("");
    setLoading(true);
    try {
      const { email, maskedEmail } = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirm,
        phone: form.phone || undefined,
        role: accountType,
      });
      setVerifyEmail_(email);
      setMaskedEmail(maskedEmail);
      setStep(3);
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string[]>; message?: string };
      if (apiErr.errors) {
        const first = Object.values(apiErr.errors)[0];
        setError(first?.[0] ?? "Registration failed.");
      } else {
        setError(apiErr.message ?? "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setDigits(["", "", "", "", "", ""]);
    try {
      await resendVerification(verifyEmail_);
      setCountdownKey((k) => k + 1); // restarts the useEffect countdown
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyEmail(verifyEmail_, otp);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      setDigits(["", "", "", "", "", ""]);
      digitRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div
      className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(204,0,0,0.6)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)" }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#16a34a] rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          </div>
          <span className="text-white font-semibold text-sm">Greenbrick.net</span>
        </Link>
        <div>
          <h2 className="text-white font-black text-4xl leading-tight mb-4">
            Join Australia&apos;s<br />largest property<br />community.
          </h2>
          <div className="space-y-3 mt-8">
            {["Save and track your favourite properties", "Get instant alerts on new listings", "Connect with top agents and brokers", "Access exclusive market insights"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Email verification OTP ────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              </div>
              <span className="text-gray-900 font-semibold text-sm">Greenbrick.net</span>
            </Link>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Verify your email</h1>
            <p className="text-gray-500 text-sm mb-2 text-center">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700">{maskedEmail}</span>.
            </p>
            <p className="text-gray-400 text-xs mb-8 text-center">Enter it below to activate your account.</p>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <div className="flex gap-3 justify-center" onPaste={handleDigitPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { digitRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (<>Verify &amp; activate account <ArrowRight size={16} /></>)}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              {countdown > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend available in <span className="font-semibold text-gray-600">{countdown}s</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Didn&apos;t receive it?{" "}
                  <button type="button" disabled={resendLoading} onClick={handleResend}
                    className="text-[#16a34a] font-semibold hover:underline disabled:opacity-50">
                    {resendLoading ? "Sending…" : "Resend code"}
                  </button>
                </p>
              )}
              <p className="text-xs text-gray-400">
                Already verified?{" "}
                <Link href="/signin" className="text-[#16a34a] font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1 & 2 ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {leftPanel}

      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-gray-900 font-semibold text-sm">Greenbrick.net</span>
          </Link>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-[#16a34a] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > s ? <Check size={13} /> : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                  {s === 1 ? "Account type" : "Your details"}
                </span>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-[#16a34a]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {step === 1 ? "Create an account" : "Your details"}
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            {step === 1 ? "Choose how you'll use Greenbrick.net" : "Almost there — fill in your info below"}{" "}
            <Link href="/signin" className="text-[#16a34a] font-semibold hover:underline">Sign in instead</Link>
          </p>

          {step === 1 && (
            <div className="space-y-3">
              {accountTypes.map((t) => (
                <button key={t.id} onClick={() => setAccountType(t.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left ${accountType === t.id ? "border-[#16a34a] bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <div>
                    <p className={`text-sm font-bold ${accountType === t.id ? "text-[#16a34a]" : "text-gray-900"}`}>{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${accountType === t.id ? "border-[#16a34a] bg-[#16a34a]" : "border-gray-300"}`}>
                    {accountType === t.id && <Check size={11} className="text-white" />}
                  </div>
                </button>
              ))}
              <button onClick={handleNext}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-4">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              {[
                { key: "name",  label: "Full name",        placeholder: "Jane Smith",        icon: <User size={15} className="text-gray-400" />,  type: "text" },
                { key: "email", label: "Email address",    placeholder: "you@example.com",   icon: <Mail size={15} className="text-gray-400" />,  type: "email" },
                { key: "phone", label: "Phone (optional)", placeholder: "+61 400 000 000",   icon: <Phone size={15} className="text-gray-400" />, type: "tel" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{field.icon}</span>
                    <input type={field.type} value={form[field.key as keyof typeof form]}
                      onChange={(e) => update(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setAgree(!agree)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agree ? "bg-[#16a34a] border-[#16a34a]" : "border-gray-300 hover:border-gray-500"}`}>
                  {agree && <Check size={11} className="text-white" />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/" className="text-[#16a34a] hover:underline font-medium">Terms of Use</Link>
                  {" "}and{" "}
                  <Link href="/" className="text-[#16a34a] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} disabled={loading}
                  className="flex-1 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading
                    ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
                    : <>Create account <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
