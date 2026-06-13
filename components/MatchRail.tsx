"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchScore } from "@/lib/types";
import { calculateAge } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { Chevron, Heart } from "@/components/Glyph";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type Tier = "all" | "excellent" | "high" | "good" | "okay";

interface Props {
  matches: MatchScore[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  loading: boolean;
}

const TAG_LABELS: Record<string, string> = {
  valuesAlignment: "Values",
  educationCompatibility: "Education",
  lifestyleCompatibility: "Lifestyle",
  ageCompatibility: "Age",
  incomeCompatibility: "Income",
  locationCompatibility: "Location",
  religionCasteBonus: "Community",
  familyCompatibility: "Family",
  heightCompatibility: "Height",
  languageOverlap: "Language",
};

function topTags(m: MatchScore): string[] {
  return Object.entries(m.breakdown)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([k]) => TAG_LABELS[k] || k);
}

function tierColor(score: number) {
  if (score >= 85) return "var(--moss)";
  if (score >= 70) return "var(--honey)";
  if (score >= 50) return "var(--slate)";
  return "var(--ink-faint)";
}

function tierWord(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "High";
  if (score >= 50) return "Good";
  return "Okay";
}

export function MatchRail({ matches, selectedIdx, onSelect, loading }: Props) {
  const [tier, setTier] = useState<Tier>("all");

  const filtered = useMemo(() => {
    if (tier === "all") return matches;
    if (tier === "excellent") return matches.filter((m) => m.totalScore >= 85);
    if (tier === "high") return matches.filter((m) => m.totalScore >= 70 && m.totalScore < 85);
    if (tier === "good") return matches.filter((m) => m.totalScore >= 50 && m.totalScore < 70);
    return matches.filter((m) => m.totalScore < 50);
  }, [matches, tier]);

  const counts = useMemo(() => ({
    all: matches.length,
    excellent: matches.filter((m) => m.totalScore >= 85).length,
    high: matches.filter((m) => m.totalScore >= 70 && m.totalScore < 85).length,
    good: matches.filter((m) => m.totalScore >= 50 && m.totalScore < 70).length,
    okay: matches.filter((m) => m.totalScore < 50).length,
  }), [matches]);

  return (
    <div className="flex flex-col md:flex-col h-full min-h-0">
      {/* Header + filter tabs — vertical on all sizes */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="font-serif text-lg m-0 text-[color:var(--ink)]" style={{ letterSpacing: "-0.01em" }}>
          Matches
        </h3>
        <div className="font-mono text-[10px] text-[color:var(--ink-faint)]">
          {filtered.length} of {matches.length}
        </div>
      </div>

      {/* Tier tabs — hidden on mobile (single "All" tab on mobile, see below) */}
      <div className="hidden md:flex px-1 sm:px-2 pt-1" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["all", "excellent", "high", "good"] as Tier[]).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className="relative flex-1 px-1.5 sm:px-2 py-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.06em] transition-colors"
            style={{
              color: tier === t ? "var(--ink)" : "var(--ink-muted)",
              background: "transparent",
              border: 0,
            }}
          >
            <span className="inline-flex items-center gap-1">
              {t === "all" ? "All" : t === "excellent" ? "Exc." : t === "high" ? "High" : t === "good" ? "Good" : t}
              <span
                className="font-mono text-[9px] px-1 rounded-sm hidden sm:inline"
                style={{
                  background: "var(--bg-sunken)",
                  color: "var(--ink-muted)",
                }}
              >
                {counts[t]}
              </span>
              <span
                className="font-mono text-[9px] sm:hidden"
                style={{ color: "var(--ink-faint)" }}
              >
                {counts[t]}
              </span>
            </span>
            {tier === t && (
              <motion.div
                layoutId="railTab"
                className="absolute bottom-[-1px] left-1.5 sm:left-2 right-1.5 sm:right-2 h-[2px] rounded-full"
                style={{ background: "var(--ember)" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mobile-only single "All" indicator */}
      <div
        className="md:hidden flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--ember)]">
          All tiers
        </span>
        <span className="font-mono text-[9px] text-[color:var(--ink-faint)]">scroll →</span>
      </div>

      {/* Match list — vertical scroll on md+, horizontal scroll on mobile */}
      <div
        className="md:v2-side-scroll md:overflow-y-auto md:flex-col md:space-y-1 md:p-2
                   flex overflow-x-auto gap-2 p-3"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="md:h-[58px] md:w-full h-[88px] w-[200px] flex-shrink-0 rounded-md" />)
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center w-full">
            <Heart size={18} strokeWidth={1.25} className="text-[color:var(--ink-faint)] mx-auto mb-2" />
            <div className="text-[12px] text-[color:var(--ink-soft)]">No matches in this tier.</div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((m) => {
              const realIdx = matches.findIndex((x) => x.profile.id === m.profile.id);
              const age = calculateAge(m.profile.dateOfBirth);
              const isActive = realIdx === selectedIdx;
              const tColor = tierColor(m.totalScore);

              return (
                <motion.button
                  key={m.profile.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelect(realIdx)}
                  // Mobile: wide compact card, fixed width. md+: full-width row
                  // with a separate score column.
                  className="md:w-full md:grid md:items-center md:gap-2.5 md:p-2.5 md:grid-cols-[1fr_48px]
                             flex-shrink-0 w-[200px] p-2.5 rounded-md transition-colors text-left"
                  style={{
                    background: isActive ? "var(--ember-soft)" : "var(--bg)",
                    border: `1px solid ${isActive ? "var(--border-ember)" : "var(--border)"}`,
                    boxShadow: isActive ? "inset 2px 0 0 var(--ember)" : "none",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <ProfileAvatar
                      avatar={m.profile.avatar}
                      firstName={m.profile.firstName}
                      lastName={m.profile.lastName}
                      gender={m.profile.gender}
                      size={30}
                    />
                    <div className="min-w-0 flex-1">
                      {/* Name in editorial serif (matches the rest of the app's
                          name treatment — CustomerRail, CompareCanvas, etc.).
                          Personal names always use the display typeface. */}
                      <div
                        className="font-serif leading-[1.1] truncate"
                        style={{ fontSize: 16, letterSpacing: "-0.01em" }}
                      >
                        {m.profile.firstName} {m.profile.lastName}
                      </div>
                      <div className="font-mono text-[9px] text-[color:var(--ink-faint)] mt-0.5 font-normal">
                        #{realIdx + 1}
                      </div>
                      <div className="font-mono text-[9px] text-[color:var(--ink-muted)] mt-0.5 truncate">
                        {age}y · {m.profile.city}
                      </div>
                      <div className="hidden md:flex flex gap-1 mt-1.5">
                        {topTags(m).map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-[0.04em]"
                            style={{
                              background: "var(--bg-sunken)",
                              color: "var(--ink-soft)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Score column — only on md+ (mobile shows score inline above) */}
                  <div className="hidden md:block text-right">
                    <div
                      className="font-serif text-2xl leading-none"
                      style={{ color: isActive ? "var(--ember)" : tColor }}
                    >
                      {m.totalScore}
                    </div>
                    <div
                      className="font-mono text-[8px] uppercase tracking-[0.1em] mt-0.5"
                      style={{ color: isActive ? "var(--ember)" : "var(--ink-faint)" }}
                    >
                      {tierWord(m.totalScore)}
                    </div>
                  </div>
                  {/* Mobile: score visible inline below the name */}
                  <div className="md:hidden flex items-baseline gap-1.5 mt-1">
                    <span
                      className="font-serif text-[20px] leading-none"
                      style={{ color: isActive ? "var(--ember)" : tColor }}
                    >
                      {m.totalScore}
                    </span>
                    <span
                      className="font-mono text-[8px] uppercase tracking-[0.1em]"
                      style={{ color: isActive ? "var(--ember)" : "var(--ink-faint)" }}
                    >
                      {tierWord(m.totalScore)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div
        className="hidden md:flex px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[color:var(--ink-faint)] items-center justify-between flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span>↑↓ navigate</span>
        <span>⌘↵ send</span>
      </div>
    </div>
  );
}
