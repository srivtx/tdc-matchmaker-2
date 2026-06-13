"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { sounds } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const [username, setUsername] = useState("priya.sharma");
  const [password, setPassword] = useState("tdc2024");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    sounds.click();
    setTimeout(() => {
      if (login(username, password)) {
        sounds.success();
        router.push("/dashboard");
      } else {
        sounds.error();
        setError("Invalid credentials. Try priya.sharma / tdc2024");
        setLoading(false);
      }
    }, 450);
  };

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — editorial. Hidden on mobile (the form takes the whole screen
          on small viewports — the editorial hero is for lg+). */}
      <aside
        className="relative overflow-hidden flex-col justify-between p-8 md:p-12 lg:p-16 hidden lg:flex"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #16140f 0%, #0d0c08 100%)"
            : "linear-gradient(160deg, #191712 0%, #0d0c08 100%)",
        }}
      >
        {/* glow */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(200,74,46,0.20) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ background: "var(--ember)" }}
          >
            <span className="font-serif text-white text-xl leading-none">T</span>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
              The Date Crew
            </div>
            <div className="font-serif text-white text-base leading-none mt-1">
              Matchmaker
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ember)] mb-4">
              Triage · 2026 edition
            </div>
            <h1
              className="font-serif text-white"
              style={{ fontSize: "clamp(36px, 4vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              Two lives, one introduction.
              <br />
              <em className="text-[color:var(--ember)]">Done with care,</em> it lasts a lifetime.
            </h1>
            <p className="text-white/55 text-[13px] mt-6 leading-relaxed max-w-[400px]">
              The matchmaker workspace. Built for the decision, not the profile.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-8 max-w-[480px]">
          {[
            { n: "1,847", l: "Introductions" },
            { n: "312",   l: "Marriages (24mo)" },
            { n: "14y",   l: "Avg client tenure" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <div className="font-serif text-3xl text-white leading-none">{s.n}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-2">
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* RIGHT — form. */}
      <main
        className="flex flex-col min-h-screen"
        style={{ background: "var(--bg)" }}
      >
        {/* Top bar — minimal. Brand mark only on mobile (lg:hidden), since
            the left editorial aside already has it on lg+. */}
        <div
          className="flex items-center justify-between lg:justify-end px-5 sm:px-8 lg:px-16 py-5 sm:py-6"
        >
          {/* Brand mark — only on mobile. On lg+ the left aside has the brand. */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "var(--ember)" }}
            >
              <span className="font-serif text-white text-base leading-none">T</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)]">
                The Date Crew
              </div>
              <div className="font-serif text-[15px] text-[color:var(--ink)] leading-none mt-0.5">
                Matchmaker
              </div>
            </div>
          </div>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--ink-soft)",
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Form card area — vertically centered on lg+, top-aligned on mobile. */}
        <div
          className="flex-1 flex flex-col items-center justify-start sm:justify-center px-6 sm:px-10 lg:px-16 pt-2 sm:pt-0 pb-12 sm:pb-16"
        >
          <div className="w-full max-w-[360px]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--ember)] mb-3 text-center sm:text-left">
                Secure workspace
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4 sm:space-y-5"
            >
              <div>
                <h2
                  className="font-serif text-[color:var(--ink)] leading-tight m-0"
                  style={{ fontSize: "clamp(30px, 7vw, 40px)", letterSpacing: "-0.01em" }}
                >
                  Sign in.
                </h2>
                <p className="text-[12.5px] text-[color:var(--ink-muted)] mt-2">
                  Matchmaker credentials.
                </p>
              </div>

              <div>
                <label
                  className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-2"
                >
                  Matchmaker ID
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-3.5 rounded-md text-[14px] outline-none transition-colors"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--ink)",
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div>
                <label
                  className="block font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-2"
                >
                  Passphrase
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full px-3.5 py-3.5 rounded-md text-[14px] outline-none transition-colors font-mono"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--ink)",
                  }}
                  autoComplete="off"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-[11px] text-[color:var(--ember-strong)] font-medium"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 rounded-md font-medium text-[13px] text-white flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: "var(--ember)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>Enter workspace →</>
                )}
              </motion.button>
            </motion.form>

            {/* Demo box — hidden on mobile (the auto-filled inputs are enough
                hint that demo creds are in use) */}
            <div
              className="hidden sm:flex mt-6 p-3 rounded-md items-center justify-between"
              style={{ background: "var(--bg-sunken)", border: "1px solid var(--border)" }}
            >
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[color:var(--ink-muted)]">
                  Demo
                </div>
                <div className="font-mono text-[11px] text-[color:var(--ink)] mt-0.5">
                  priya.sharma / tdc2024
                </div>
              </div>
              <button
                type="button"
                onClick={() => { sounds.click(); setUsername("priya.sharma"); setPassword("tdc2024"); }}
                className="text-[11px] font-medium text-[color:var(--ember)] hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
