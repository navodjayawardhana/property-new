/**
 * Authentication context for the admin panel.
 *
 * Manages the admin session:
 *   - On app start: reads the stored Bearer token from AsyncStorage, calls GET /me
 *     to validate it, and only restores the session if role === 'admin'.
 *   - login(): calls POST /login, rejects non-admin roles before storing the token.
 *   - logout(): calls POST /logout on the server then clears local storage.
 *
 * The token is stored under the key 'admin_auth_token' in AsyncStorage.
 * Usage: wrap the app tree in <AuthProvider>, then call useAuth() in any screen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from './api';
import { User } from './types';

const TOKEN_KEY = 'admin_auth_token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY)
      .then(async (stored) => {
        if (!stored) return;

        try {
          const me = await auth.me(stored);
          if (me.role === 'admin') {
            setToken(stored);
            setUser(me);
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login(email, password);
    if (res.user.role !== 'admin') {
      throw new Error('Access denied. Admin credentials required.');
    }
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (token) {
      try {
        await auth.logout(token);
      } catch {
        // Server logout failure is non-fatal; clear local session regardless
      }
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
