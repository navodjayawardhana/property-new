"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck,
  Home, TrendingUp, Briefcase, ShieldAlert, Phone, ChevronDown, KeyRound, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/api";
import { COUNTRY_CODES } from "@/lib/countries";

function parseApiError(err: unknown, fallback: string): string {
  const e = err as { errors?: Record<string, string[]>; message?: string };
  if (e.errors) {
    const msgs = Object.values(e.errors).flat();
    if (msgs.length) return msgs.join(" ");
  }
  const msg = (e.message ?? fallback).trim();
  const l = msg.toLowerCase();
  if (l.includes("credentials do not match") || l.includes("invalid credentials") || l.includes("wrong password"))
    return "Incorrect email or password. Please try again.";
  if (l.includes("not found") && (l.includes("user") || l.includes("account")))
    return "No account found with this email address.";
  if ((l.includes("otp") || l.includes("code")) && (l.includes("invalid") || l.includes("incorrect")))
    return "Incorrect verification code. Please try again.";
  if ((l.includes("otp") || l.includes("code")) && l.includes("expir"))
    return "This code has expired. Please request a new one.";
  if (l.includes("too many") || l.includes("throttle") || l.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (l.includes("already been taken") || l.includes("already registered") || l.includes("already exists"))
    return "This email is already registered. Try signing in instead.";
  if (l.includes("phone") && l.includes("taken"))
    return "This phone number is already registered.";
  if (l.includes("unauthenticated") || l.includes("unauthorized"))
    return "Session expired. Please sign in again.";
  if (l.includes("network") || l.includes("failed to fetch"))
    return "Connection error. Please check your internet and try again.";
  if (l.includes("server error") || l.includes("500"))
    return "Server error. Please try again in a moment.";
  return msg || fallback;
}

function toGbCountry(isoCode: string): string {
  if (isoCode === "AU") return "AU";
  if (isoCode === "LK") return "LK";
  if (isoCode === "AE") return "UAE";
  return "LK";
}

type Role = "buyer" | "seller" | "agent" | "admin";
type LoginMethod = "email" | "phone";
type Screen = "login" | "otp" | "verify" | "phone-otp" | "forgot" | "reset";

const ROLES: { key: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "buyer",  label: "Buyer",  icon: <Home size={15} />,        desc: "Find a property" },
  { key: "seller", label: "Seller", icon: <TrendingUp size={15} />,  desc: "List a property" },
  { key: "agent",  label: "Agent",  icon: <Briefcase size={15} />,   desc: "Manage listings" },
];

export default function SignInPage() {
  const router = useRouter();
  const { login, verifyOtp, verifyEmail, resendVerification, otpPending, loginWithToken } = useAuth();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [role, setRole]               = useState<Role>("buyer");

  // Email login
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone login
  const [phoneDialCode, setPhoneDialCode] = useState("");
  const [phoneNumber, setPhoneNumber]     = useState("");
  const [maskedPhone, setMaskedPhone]     = useState("");
  const [phoneForOtp, setPhoneForOtp]     = useState("");

  // Screen routing
  const [screen, setScreen]           = useState<Screen>("login");
  const [verifyData, setVerifyData]   = useState<{ email: string; maskedEmail: string } | null>(null);

  // OTP digits (shared across otp / verify / phone-otp screens)
  const [digits, setDigits]           = useState(["", "", "", "", "", ""]);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot / reset password
  const [forgotEmail, setForgotEmail]         = useState("");
  const [forgotMasked, setForgotMasked]       = useState("");
  const [resetPassword, setResetPassword]     = useState("");
  const [resetConfirm, setResetConfirm]       = useState("");
  const [showResetPw, setShowResetPw]         = useState(false);
  const [resetDone, setResetDone]             = useState(false);

  const [loading, setLoading]         = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown]     = useState(60);
  const [countdownKey, setCountdownKey] = useState(0);
  const [error, setError]             = useState("");

  // Countdown for verify / phone-otp / reset screens
  useEffect(() => {
    if (screen !== "verify" && screen !== "phone-otp" && screen !== "reset") return;
    setCountdown(60);
    const id = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [screen, countdownKey]);

  // Auto-detect dial code from IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const found = COUNTRY_CODES.find((c) => c.code === data.country_code);
        if (found) setPhoneDialCode(found.dial);
      })
      .catch(() => {});
  }, []);

  // â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ email login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const result = await login(email, password);
      if (result.status === "done") router.push("/");
      if (result.status === "otp") { resetDigits(); setScreen("otp"); }
      if (result.status === "verify") {
        setVerifyData({ email: result.email, maskedEmail: result.maskedEmail });
        resetDigits(); setScreen("verify");
      }
    } catch (err: unknown) {
      setError(parseApiError(err, "Sign in failed. Please check your credentials and try again."));
    } finally { setLoading(false); }
  };

  const handleEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      await verifyOtp(otp);
      router.push("/");
    } catch (err: unknown) {
      setError(parseApiError(err, "Incorrect verification code. Please try again.")); resetDigits();
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyData) return;
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      await verifyEmail(verifyData.email, otp);
      router.push("/");
    } catch (err: unknown) {
      setError(parseApiError(err, "Incorrect verification code. Please try again.")); resetDigits();
    } finally { setLoading(false); }
  };

  const handleResendEmail = async (emailAddr: string) => {
    setResendLoading(true); setError(""); setDigits(["", "", "", "", "", ""]);
    try { await resendVerification(emailAddr); setCountdownKey((k) => k + 1); }
    catch { setError("Failed to resend. Please try again."); }
    finally { setResendLoading(false); }
  };

  // â”€â”€ phone login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const isSriLanka = phoneDialCode === "+94";
  const phoneMaxLength = isSriLanka ? 9 : 15;

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, "");
    if (!digits) { setError("Please enter your phone number."); return; }
    if (isSriLanka && digits.length !== 9) { setError("Sri Lankan numbers must be exactly 9 digits (e.g. 712345678)."); return; }
    if (!isSriLanka && digits.length < 6) { setError("Please enter a valid phone number."); return; }
    const fullPhone = `${phoneDialCode}${digits.replace(/^0+/, "")}`;
    setError(""); setLoading(true);
    try {
      const res = await auth.sendPhoneOtp(fullPhone, role);
      setMaskedPhone(res.masked_phone);
      setPhoneForOtp(fullPhone);
      if (res.dev_otp) {
        setDigits(res.dev_otp.split(""));
      } else {
        resetDigits();
      }
      setScreen("phone-otp");
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to send OTP. Please check your phone number and try again."));
    } finally { setLoading(false); }
  };

  const handlePhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    try {
      const countryEntry = COUNTRY_CODES.find((c) => c.dial === phoneDialCode);
      const res = await auth.verifyPhoneOtp({
        phone: phoneForOtp,
        otp,
        country: countryEntry?.name,
      });
      if (countryEntry) {
        localStorage.setItem("gb_country", toGbCountry(countryEntry.code));
      }
      await loginWithToken(res.token);
      router.push("/");
    } catch (err: unknown) {
      setError(parseApiError(err, "Incorrect verification code. Please try again.")); resetDigits();
    } finally { setLoading(false); }
  };

  const handleResendPhone = async () => {
    setResendLoading(true); setError(""); setDigits(["", "", "", "", "", ""]);
    try { await auth.sendPhoneOtp(phoneForOtp); setCountdownKey((k) => k + 1); }
    catch { setError("Failed to resend. Please try again."); }
    finally { setResendLoading(false); }
  };

  // â”€â”€ forgot / reset password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError("Please enter your email address."); return; }
    setError(""); setLoading(true);
    try {
      const res = await auth.forgotPassword(forgotEmail.trim());
      setForgotMasked(res.masked_email);
      resetDigits();
      setScreen("reset");
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to send reset code. Please check your email address."));
    } finally { setLoading(false); }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword !== resetConfirm) { setError("Passwords do not match."); return; }
    if (resetPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter the 6-digit code."); return; }
    setError(""); setLoading(true);
    try {
      await auth.resetPassword({
        email: forgotEmail.trim(),
        otp,
        password: resetPassword,
        password_confirmation: resetConfirm,
      });
      setResetDone(true);
    } catch (err: unknown) {
      setError(parseApiError(err, "Password reset failed. Please check your code and try again."));
      resetDigits();
    } finally { setLoading(false); }
  };

  const handleResendReset = async () => {
    setResendLoading(true); setError(""); setDigits(["", "", "", "", "", ""]);
    try {
      const res = await auth.forgotPassword(forgotEmail.trim());
      setForgotMasked(res.masked_email);
      setCountdownKey((k) => k + 1);
    } catch { setError("Failed to resend. Please try again."); }
    finally { setResendLoading(false); }
  };

  // â”€â”€ shared UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const spinner = (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  );

  const leftPanel = (
    <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(204,0,0,0.6)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80)" }}>
      <div className="absolute inset-0 flex flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/GreenBrickLogo.png" alt="Greenbrick" width={120} height={40} className="h-10 w-auto" />
        </Link>
        <div>
          <h2 className="text-white font-black text-4xl leading-tight mb-4">Find your next<br />dream home.</h2>
          <p className="text-white/70 text-base">Sri Lanka&apos;s #1 property platform with thousands of listings updated daily.</p>
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
    <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden">
      <Image src="/GreenBrickLogo.png" alt="Greenbrick" width={120} height={40} className="h-10 w-auto" />
    </Link>
  );

  const digitInputs = (
    <div className="flex gap-3 justify-center" onPaste={handleDigitPaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { digitRefs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleDigitKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all" />
      ))}
    </div>
  );

  const resendCountdown = (onResend: () => void) => (
    <div className="text-center mt-5">
      {countdown > 0 ? (
        <p className="text-xs text-gray-400">
          Resend available in <span className="font-semibold text-gray-600">{countdown}s</span>
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          Didn&apos;t receive it?{" "}
          <button type="button" disabled={resendLoading} onClick={onResend}
            className="text-[#16a34a] font-semibold hover:underline disabled:opacity-50">
            {resendLoading ? "Sendingâ€¦" : "Resend code"}
          </button>
        </p>
      )}
    </div>
  );

  // â”€â”€ OTP screen (email 2FA) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (screen === "otp" && otpPending) {
    return (
      <div className="h-screen bg-gray-50 flex">{leftPanel}
        <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
          <div className="w-full max-w-md">{logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} className="text-[#16a34a]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Check your email</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              We sent a 6-digit code to <span className="font-semibold text-gray-700">{otpPending.maskedEmail}</span>.<br />
              It expires in 10 minutes.
            </p>
            <form onSubmit={handleEmailOtp} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}
              {digitInputs}
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Email verification screen (unverified account) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (screen === "verify" && verifyData) {
    return (
      <div className="h-screen bg-gray-50 flex">{leftPanel}
        <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
          <div className="w-full max-w-md">{logo}
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
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}
              {digitInputs}
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>
            {resendCountdown(() => handleResendEmail(verifyData.email))}
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Phone OTP screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (screen === "phone-otp") {
    return (
      <div className="h-screen bg-gray-50 flex">{leftPanel}
        <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
          <div className="w-full max-w-md">{logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Phone size={30} className="text-[#16a34a]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Check your phone</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              We sent a 6-digit code via SMS to <span className="font-semibold text-gray-700">{maskedPhone}</span>.<br />
              It expires in 10 minutes.
            </p>
            <form onSubmit={handlePhoneOtp} className="space-y-6">
              {error && (
                error.toLowerCase().includes("blocked") ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5 flex gap-3 items-start">
                    <ShieldAlert size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-800">Account Blocked</p>
                      <p className="text-xs text-orange-700 mt-0.5">Your account has been blocked. Contact us for more information.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                    <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 leading-snug">{error}</p>
                  </div>
                )
              )}
              {digitInputs}
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Verify &amp; Sign in <ArrowRight size={16} /></>)}
              </button>
            </form>
            {resendCountdown(handleResendPhone)}
            <p className="text-center text-xs text-gray-400 mt-3">
              <button type="button" onClick={() => { setScreen("login"); setError(""); }}
                className="text-[#16a34a] font-semibold hover:underline">
                â† Back to sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Forgot password screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (screen === "forgot") {
    return (
      <div className="h-screen bg-gray-50 flex">{leftPanel}
        <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
          <div className="w-full max-w-md">{logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <KeyRound size={30} className="text-[#16a34a]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Forgot password?</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">Enter your email and we'll send a 6-digit reset code.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com" autoFocus
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Send reset code <ArrowRight size={16} /></>)}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-5">
              <button type="button" onClick={() => { setScreen("login"); setError(""); }}
                className="text-[#16a34a] font-semibold hover:underline">â† Back to sign in</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Reset password screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (screen === "reset") {
    if (resetDone) {
      return (
        <div className="h-screen bg-gray-50 flex">{leftPanel}
          <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
            <div className="w-full max-w-md text-center">{logo}
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Password reset!</h1>
              <p className="text-gray-500 text-sm mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <button onClick={() => { setScreen("login"); setError(""); setResetDone(false); setResetPassword(""); setResetConfirm(""); setDigits(["","","","","",""]); }}
                className="bg-[#16a34a] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#15803d] transition-colors text-sm">
                Sign in now
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="h-screen bg-gray-50 flex">{leftPanel}
        <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
          <div className="w-full max-w-md">{logo}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={30} className="text-[#16a34a]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">Reset password</h1>
            <p className="text-gray-500 text-sm mb-2 text-center">
              We sent a code to <span className="font-semibold text-gray-700">{forgotMasked}</span>.
            </p>
            <p className="text-gray-400 text-xs mb-6 text-center">Enter it below along with your new password.</p>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2.5 items-start">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}
              {digitInputs}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">New password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showResetPw ? "text" : "password"} value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)} placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                  <button type="button" onClick={() => setShowResetPw(!showResetPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm new password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showResetPw ? "text" : "password"} value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)} placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Reset password <ArrowRight size={16} /></>)}
              </button>
            </form>
            {resendCountdown(handleResendReset)}
            <p className="text-center text-xs text-gray-400 mt-3">
              <button type="button" onClick={() => { setScreen("forgot"); setError(""); }}
                className="text-[#16a34a] font-semibold hover:underline">â† Change email</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Login form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="h-screen bg-gray-50 flex">{leftPanel}
      <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto scrollbar-hide lg:justify-center">
        <div className="w-full max-w-md">{logo}

          <h1 className="text-2xl font-black text-gray-900 mb-0.5">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-4">
            Sign in to your account to continue.{" "}
            <Link href="/join" className="text-[#16a34a] font-semibold hover:underline">Create account</Link>
          </p>

          {/* Email / Phone toggle */}
          <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl">
            {([["email", "Email", <Mail key="m" size={14} />], ["phone", "Phone", <Phone key="p" size={14} />]] as const).map(([m, label, icon]) => (
              <button key={m} type="button"
                onClick={() => { setLoginMethod(m as LoginMethod); setError(""); if (m === "phone" && role === "admin") setRole("buyer"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${loginMethod === m ? "bg-white text-[#16a34a] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Role tabs â€” all roles for email, no admin for phone */}
          <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-xl">
            {ROLES.filter((r) => loginMethod === "phone" ? r.key !== "admin" : true).map((r) => (
              <button key={r.key} type="button"
                onClick={() => { setRole(r.key); setError(""); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${role === r.key ? "bg-white text-[#16a34a] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {r.icon}
                <span>{r.label}</span>
                <span className="text-[10px] font-normal text-gray-400">{r.desc}</span>
              </button>
            ))}
          </div>

          {/* OTP hint */}
          {loginMethod === "email" && role !== "admin" && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-2.5 rounded-xl mb-3">
              <ShieldCheck size={14} className="shrink-0" />
              <span>A verification code will be sent to your email after sign in.</span>
            </div>
          )}
          {loginMethod === "phone" && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-2.5 rounded-xl mb-4">
              <Phone size={14} className="shrink-0" />
              <span>A 6-digit code will be sent to your phone via SMS.</span>
            </div>
          )}

          {error && (
            error.toLowerCase().includes("blocked") ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5 mb-3 flex gap-3 items-start">
                <ShieldAlert size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-800">Account Blocked</p>
                  <p className="text-xs text-orange-700 mt-0.5">Your account has been blocked. Contact us for more information.</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3 flex gap-2.5 items-start">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-snug">{error}</p>
              </div>
            )
          )}

          {/* Email form */}
          {loginMethod === "email" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Password</label>
                  <button type="button" onClick={() => { setError(""); setForgotEmail(email); setScreen("forgot"); }} className="text-xs text-[#16a34a] hover:underline font-medium">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
                {loading ? spinner : (<>Sign in as {ROLES.find(r => r.key === role)?.label} <ArrowRight size={16} /></>)}
              </button>
            </form>
          )}

          {/* Phone form */}
          {loginMethod === "phone" && (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone number</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      value={phoneDialCode}
                      onChange={(e) => { setPhoneDialCode(e.target.value); setPhoneNumber(""); setError(""); }}
                      className="h-full pl-3 pr-7 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] bg-white appearance-none cursor-pointer"
                      style={{ minWidth: "90px" }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, phoneMaxLength))}
                      placeholder={isSriLanka ? "712345678" : "Phone number"}
                      maxLength={phoneMaxLength}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? spinner : (<>Send OTP <ArrowRight size={16} /></>)}
              </button>
            </form>
          )}

          {/* Google + join link â€” email non-admin only */}
          {loginMethod === "email" && role !== "admin" && (
            <>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/redirect?role=${role}`}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>
              <p className="text-center text-xs text-gray-400 mt-3">
                Don&apos;t have an account?{" "}
                <Link href="/join" className="text-[#16a34a] font-semibold hover:underline">Join for free</Link>
              </p>
            </>
          )}

          {loginMethod === "phone" && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Don&apos;t have an account?{" "}
              <Link href="/join" className="text-[#16a34a] font-semibold hover:underline">Join for free</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
