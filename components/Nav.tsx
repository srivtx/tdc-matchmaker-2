"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { sounds } from "@/lib/sound";

export default function Nav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isAuthenticated) return null;

  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl"
      style={{
        background: theme === "dark" ? "rgba(13, 12, 8, 0.7)" : "rgba(250, 248, 243, 0.8)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "var(--ember)" }}
          >
            <span className="font-serif text-white text-base leading-none">T</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-[12px] tracking-tight font-serif text-[color:var(--ink)]">
              TDC
            </span>
            <span className="font-mono text-[10px] text-[color:var(--ink-faint)] uppercase tracking-wider">
              Matchmaker
            </span>
          </div>
        </button>

        <div className="flex-1" />

        <button
          onClick={toggle}
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--ink-soft)",
          }}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"}`}
        >
          {mounted ? (
            <motion.div
              key={theme}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </motion.div>
          ) : null}
        </button>

        <div
          className="hidden sm:flex items-center gap-2 pl-3"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] text-white"
            style={{ background: "var(--ember)" }}
          >
            {initials}
          </div>
          <span className="text-[12px] font-medium text-[color:var(--ink)]">
            {user?.name}
          </span>
        </div>

        {/* Compact avatar on mobile (sm:hidden) */}
        <div
          className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center font-mono font-semibold text-[10px] text-white"
          style={{ background: "var(--ember)" }}
        >
          {initials}
        </div>

        <button
          onClick={() => { sounds.click(); logout(); router.push("/login"); }}
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--ink-soft)",
          }}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  );
}
