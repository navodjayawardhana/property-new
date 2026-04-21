"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    auth.me(stored)
      .then(setUser)
      .catch(() => { localStorage.removeItem("auth_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const persist = (u: User, t: string) => {
    localStorage.setItem("auth_token", t);
    setUser(u);
    setToken(t);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    persist(res.user, res.token);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await auth.register(data);
    persist(res.user, res.token);
  }, []);

  const logout = useCallback(async () => {
    if (token) await auth.logout(token).catch(() => {});
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
