"use client";

import { JourneyStage } from "@/lib/types";

const STAGE_COLORS: Record<JourneyStage, { bg: string; text: string; dot: string }> = {
  "New Lead":                { bg: "var(--slate-soft)", text: "var(--slate)",     dot: "var(--slate)" },
  "Profile Created":         { bg: "var(--honey-soft)", text: "var(--honey)",     dot: "var(--honey)" },
  "Verification Pending":    { bg: "var(--honey-soft)", text: "var(--honey)",     dot: "var(--honey)" },
  "Verified":                { bg: "var(--moss-soft)",  text: "var(--moss)",      dot: "var(--moss)" },
  "Preferences Set":         { bg: "var(--moss-soft)",  text: "var(--moss)",      dot: "var(--moss)" },
  "Actively Matching":       { bg: "var(--ember-soft)", text: "var(--ember-strong)", dot: "var(--ember)" },
  "First Meeting Scheduled": { bg: "var(--ember-soft)", text: "var(--ember-strong)", dot: "var(--ember)" },
  "In Discussion":           { bg: "var(--ember-soft)", text: "var(--ember-strong)", dot: "var(--ember)" },
  "On Hold":                 { bg: "var(--bg-sunken)",  text: "var(--ink-muted)", dot: "var(--ink-faint)" },
  "Matched":                 { bg: "var(--moss-soft)",  text: "var(--moss)",      dot: "var(--moss)" },
};

export function StatusBadge({ stage }: { stage: JourneyStage }) {
  const c = STAGE_COLORS[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded font-medium"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.bg}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {stage}
    </span>
  );
}
