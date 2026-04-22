"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, type User } from "@/lib/api";

export type OtpPending = { email: string; maskedEmail: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  otpPending: OtpPending | null;
  login: (email: string, password: string) => Promise<"otp" | "verify" | "done">;
  verifyOtp: (otp: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ email: string; maskedEmail: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role?: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpPending, setOtpPending] = useState<OtpPending | null>(null);

  const restoreSession = (t: string) => {
    setToken(t);
    auth.me(t)
      .then(setUser)
      .catch(() => { localStorage.removeItem("auth_token"); setToken(null); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    if (!stored) { setLoading(false); return; }
    restoreSession(stored);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" && e.newValue) restoreSession(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (u: User, t: string) => {
    localStorage.setItem("auth_token", t);
    setUser(u);
    setToken(t);
  };

  const login = useCallback(async (email: string, password: string): Promise<"otp" | "verify" | "done"> => {
    const res = await auth.login({ email, password });
    if ("requires_otp" in res) {
      setOtpPending({ email: res.email, maskedEmail: res.masked_email });
      return "otp";
    }
    if ("requires_verification" in res) {
      return "verify";
    }
    persist(res.user, res.token);
    return "done";
  }, []);

  const verifyOtp = useCallback(async (otp: string) => {
    if (!otpPending) throw new Error("No OTP pending");
    const res = await auth.verifyOtp({ email: otpPending.email, otp });
    setOtpPending(null);
    persist(res.user, res.token);
  }, [otpPending]);

  // Called from join page after registration OTP
  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const res = await auth.verifyEmail({ email, otp });
    persist(res.user, res.token);
  }, []);

  // Returns { email, maskedEmail } so join page can show the OTP step
  const register = useCallback(async (data: RegisterData): Promise<{ email: string; maskedEmail: string }> => {
    const res = await auth.register(data);
    return { email: res.email, maskedEmail: res.masked_email };
  }, []);

  const logout = useCallback(async () => {
    if (token) await auth.logout(token).catch(() => {});
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  }, [token]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, otpPending, login, verifyOtp, verifyEmail, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
