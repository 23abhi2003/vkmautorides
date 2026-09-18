"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AUTH_STORAGE_KEY } from "@/lib/api";

export interface AuthUser {
  name?: string;
  phone: string;
}

interface StoredSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** True until the stored session (if any) has been read from localStorage. */
  loading: boolean;
  login: (phone: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Default (hardcoded) sign-in credentials.
 * NOTE: this lives in client-side JS, so it's visible to anyone who opens
 * dev tools. Fine for a single-owner internal tool; move this check to the
 * backend if it ever needs real security. Change these before deploying.
 */
const DEFAULT_PHONE = "9999999999";
const DEFAULT_PIN = "1234";

function readStoredSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setToken(stored.token);
      setUser(stored.user);
    }
    setLoading(false);
  }, []);

  async function login(phone: string, pin: string): Promise<{ ok: boolean; error?: string }> {
    if (phone.trim() === DEFAULT_PHONE && pin.trim() === DEFAULT_PIN) {
      const nextUser: AuthUser = { phone: DEFAULT_PHONE, name: "Owner" };
      const session: StoredSession = { token: "local-" + Date.now().toString(36), user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(session.token);
      setUser(session.user);
      return { ok: true };
    }
    return { ok: false, error: "Invalid phone number or PIN." };
  }

  function logout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
