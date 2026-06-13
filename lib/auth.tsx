"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { matchmakers } from "@/data/matchmakers";
import { MatchmakerUser } from "./types";

interface AuthContextType {
  user: MatchmakerUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MatchmakerUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tdc-matchmaker-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setMounted(true);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const found = matchmakers.find(
      (m) => m.username === username && m.password === password
    );
    if (found) {
      setUser(found);
      localStorage.setItem("tdc-matchmaker-user", JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("tdc-matchmaker-user");
  }, []);

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
