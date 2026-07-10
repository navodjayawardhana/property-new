"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdvertisementManagerLoginPage() {
  const router = useRouter();
  const { login, verifyOtp, otpPending, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [screen, setScreen] = useState<"login" | "otp">("login");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "advertisement_manager" || user.role === "admin") router.replace("/dashboard/advertisement-manager");
      else router.replace("/");
    }
  }, [authLoading, user, router]);

  const resetDigits = () => {
    setDigits(["", "", "", "", "", ""]);
    setTimeout(() => digitRefs.current[0]?.focus(), 50);
  };

  const handleDigitChange = (i: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const result = await login(email, password);
      if (result.status === "done") {
        router.push("/dashboard/advertisement-manager");
      } else if (result.status === "otp") {
        resetDigits();
        setScreen("otp");
      } else {
        setError("This account requires a verified email.");
      }
    } catch (err: unknown) {
      const e2 = err as { errors?: Record<string, string[]>; message?: string };
      const first = e2.errors ? Object.values(e2.errors)[0]?.[0] : undefined;
      setError(first ?? e2.message ?? "Sign in failed.");
    } finally { setLoading(false); }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      await verifyOtp(otp);
      router.push("/dashboard/advertisement-manager");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code.");
      resetDigits();
    } finally { setLoading(false); }
  };

  const spinner = (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  );

  const digitInputs = (
    <div className="flex gap-3 justify-center" onPaste={handleDigitPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { digitRefs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleDigitKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-50 transition-all" />
      ))}
    </div>
  );

  if (screen === "otp" && otpPending) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-950 rounded-full flex items-center justify-center">
              <ShieldCheck size={32} className="text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-1 text-center">Check your email</h1>
          <p className="text-gray-400 text-sm mb-8 text-center">
            We sent a 6-digit code to <span className="font-semibold text-gray-200">{otpPending.maskedEmail}</span>.
          </p>
          <form onSubmit={handleOtp} className="space-y-6">
            {error && <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
            {digitInputs}
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-4">
            <button type="button" onClick={() => { setScreen("login"); setError(""); }}
              className="text-green-400 font-semibold hover:underline">← Back</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/40">
            <Megaphone size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white mb-1 text-center">Advertisement Manager Portal</h1>
        <p className="text-gray-500 text-sm mb-8 text-center">Restricted access. Authorised personnel only.</p>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {error && (
            error.toLowerCase().includes("blocked") ? (
              <div className="bg-orange-950 border border-orange-800 rounded-xl px-4 py-3.5 mb-4 flex gap-3 items-start">
                <ShieldCheck size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-300">Account Blocked</p>
                  <p className="text-xs text-orange-400 mt-0.5">This account has been blocked.</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-950 transition-all placeholder-gray-600" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-950 transition-all placeholder-gray-600" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? spinner : (<>Sign in <ArrowRight size={16} /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
