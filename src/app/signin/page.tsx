"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Home, TrendingUp, Briefcase, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type Role = "buyer" | "seller" | "agent" | "admin";

const ROLES: { key: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "buyer",  label: "Buyer",  icon: <Home size={15} />,        desc: "Find a property" },
  { key: "seller", label: "Seller", icon: <TrendingUp size={15} />,  desc: "List a property" },
  { key: "agent",  label: "Agent",  icon: <Briefcase size={15} />,   desc: "Manage listings" },
  { key: "admin",  label: "Admin",  icon: <ShieldAlert size={15} />, desc: "Site admin" },
];

type Screen = "login" | "otp" | "verify";

export default function SignInPage() {
  const router = useRouter();
  const { login, verifyOtp, verifyEmail, resendVerification, otpPending } = useAuth();

  const [role, setRole] = useState<Role>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Which screen is active
  const [screen, setScreen] = useState<Screen>("login");
  // For the verify screen (unverified account) — holds email + masked email
  const [verifyData, setVerifyData] = useState<{ email: string; maskedEmail: string } | null>(null);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [countdownKey, setCountdownKey] = useState(0);
  const [error, setError] = useState("");

  // 60-second countdown for the verify screen resend button
  useEffect(() => {
    if (screen !== "verify") return;
    setCountdown(60);
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [screen, countdownKey]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const resetDigits = () => {
    setDigits(["", "", "", "", "", ""]);
    setTimeout(() => digitRefs.current[0]?.focus(), 50);
  };

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
    setDigits(pasted.split("").concat(Array(6).fill("")).slice(0, 6));
    digitRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── handlers ─────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.status === "done") router.push("/");
      if (result.status === "otp") setScreen("otp");
      if (result.status === "verify") {
        setVerifyData({ email: result.email, maskedEmail: result.maskedEmail });
        setScreen("verify");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyOtp(otp);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      resetDigits();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyData) return;
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyEmail(verifyData.email, otp);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      resetDigits();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (emailToResend: string) => {
    setResendLoading(true);
    setError("");
    setDigits(["", "", "", "", "", ""]);
    try {
      await resendVerification(emailToResend);
      setCountdownKey((k) => k + 1);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ── shared UI ─────────────────────────────────────────────────────────────────

  const leftPanel = (
    <div
      className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(204,0,0,0.6)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80)" }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#121e80] rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          </div>
          <span className="text-white font-semibold text-sm">Greenbrick.net</span>
        </Link>
        <div>
          <h2 className="text-white font-black text-4xl leading-tight mb-4">Find your next<br />dream home.</h2>
          <p className="text-white/70 text-base">Australia&apos;s #1 property platform with over 120,000 listings updated daily.</p>
          <div className="flex gap-8 mt-8">
            {[{ v: "120K+", l: "For sale" }, { v: "55K+", l: "For rent" }, { v: "2M+", l: "Members" }].map((s) => (
              <div key={s.l}>
                <p className="text-white font-black text-2xl">{s.v}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const logo = (
    <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
      <div className="w-8 h-8 bg-[#121e80] rounded-full flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
      </div>
      <span className="text-gray-900 font-semibold text-sm">Greenbrick.net</span>
    </Link>
  );

  const digitInputs = (onPaste: React.ClipboardEventHandler) => (
    <div className="flex gap-3 justify-center" onPaste={onPaste}>
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
          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl outline-none focus:border-[#121e80] focus:ring-2 focus:ring-blue-50 transition-all"
        />
      ))}
    </div>
  );

  const spinner = (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  );

  // ── Login OTP step (2FA after successful login) ───────────────────────────────
  if (screen === "otp" && otpPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} className="text-[#121e80]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Check your email</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700">{otpPending.maskedEmail}</span>.<br />
              It expires in 10 minutes.
            </p>
            <form onSubmit={handleOtp} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              {digitInputs(handleDigitPaste)}
              <button type="submit" disabled={loading}
                className="w-full bg-[#121e80] hover:bg-[#0d1660] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Email verification step (unverified account tried to login) ───────────────
  if (screen === "verify" && verifyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} className="text-amber-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Verify your email</h1>
            <p className="text-gray-500 text-sm mb-2 text-center">
              Your account isn&apos;t verified yet. We sent a code to{" "}
              <span className="font-semibold text-gray-700">{verifyData.maskedEmail}</span>.
            </p>
            <p className="text-gray-400 text-xs mb-8 text-center">Enter it below to verify and sign in.</p>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              {digitInputs(handleDigitPaste)}
              <button type="submit" disabled={loading}
                className="w-full bg-[#121e80] hover:bg-[#0d1660] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>

            <div className="text-center mt-5">
              {countdown > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend available in <span className="font-semibold text-gray-600">{countdown}s</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Didn&apos;t receive it?{" "}
                  <button type="button" disabled={resendLoading}
                    onClick={() => handleResend(verifyData.email)}
                    className="text-[#121e80] font-semibold hover:underline disabled:opacity-50">
                    {resendLoading ? "Sending…" : "Resend code"}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {leftPanel}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {logo}

          <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to your account to continue.{" "}
            <Link href="/join" className="text-[#121e80] font-semibold hover:underline">Create account</Link>
          </p>

          {/* Role tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            {ROLES.map((r) => (
              <button key={r.key} type="button"
                onClick={() => { setRole(r.key); setError(""); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  role === r.key ? "bg-white text-[#121e80] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {r.icon}
                <span>{r.label}</span>
                <span className="text-[10px] font-normal text-gray-400">{r.desc}</span>
              </button>
            ))}
          </div>

          {role !== "admin" && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-2.5 rounded-xl mb-4">
              <ShieldCheck size={14} className="shrink-0" />
              <span>A verification code will be sent to your email after sign in.</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#121e80] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <Link href="/" className="text-xs text-[#121e80] hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#121e80] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#121e80] hover:bg-[#0d1660] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? spinner : (<>Sign in as {ROLES.find(r => r.key === role)?.label} <ArrowRight size={16} /></>)}
            </button>
          </form>

          {role !== "admin" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <a href={`http://localhost:8000/auth/google/redirect?role=${role}`}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>

              <p className="text-center text-xs text-gray-400 mt-5">
                Don&apos;t have an account?{" "}
                <Link href="/join" className="text-[#121e80] font-semibold hover:underline">Join for free</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
