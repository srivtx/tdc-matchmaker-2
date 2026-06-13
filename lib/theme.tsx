"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { sounds } from "@/lib/sound";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  try { localStorage.setItem("tdc-v2-theme", theme); } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tdc-v2-theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        // Default: always light on first visit (override system preference).
        // Users can still toggle to dark; the choice persists in localStorage.
        setThemeState("light");
        applyTheme("light");
      }
    } catch {}
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    sounds.click();
  }, []);

  const toggle = useCallback(() => {
    setThemeState((cur) => {
      const next = cur === "dark" ? "light" : "dark";
      applyTheme(next);
      sounds.click();
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
