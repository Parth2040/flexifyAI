"use client";

import { useCallback, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

/**
 * Client hook for the current auth state. Reads the session from the server
 * (the session cookie is httpOnly, so the client can't read it directly).
 */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, isLoggedIn: !!user, loading, refresh, logout };
}
