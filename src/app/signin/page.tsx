"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(204,0,0,0.6)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80)" }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#121e80] rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Greenbrick.net</span>
          </Link>
          <div>
            <h2 className="text-white font-black text-4xl leading-tight mb-4">
              Find your next<br />dream home.
            </h2>
            <p className="text-white/70 text-base">
              Australia&apos;s #1 property platform with over 120,000 listings updated daily.
            </p>
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

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#121e80] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-gray-900 font-semibold text-sm">Greenbrick.net</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your account to continue.{" "}
            <Link href="/join" className="text-[#121e80] font-semibold hover:underline">Create account</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

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
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              ) : (<>Sign in <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/join" className="text-[#121e80] font-semibold hover:underline">Join for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
