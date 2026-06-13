"use client";

import { motion } from "framer-motion";
import { JourneyStage } from "@/lib/types";

const STAGES: { key: JourneyStage; label: string }[] = [
  { key: "New Lead",                 label: "Lead received" },
  { key: "Profile Created",          label: "Profile created" },
  { key: "Verification Pending",     label: "Verification" },
  { key: "Verified",                 label: "Verified" },
  { key: "Preferences Set",          label: "Preferences set" },
  { key: "Actively Matching",        label: "Matching" },
  { key: "First Meeting Scheduled",  label: "Intro sent" },
  { key: "In Discussion",            label: "First meeting" },
  { key: "Matched",                  label: "Outcome" },
];

const STAGE_INDEX: Record<JourneyStage, number> = {
  "New Lead": 0,
  "Profile Created": 1,
  "Verification Pending": 2,
  "Verified": 3,
  "Preferences Set": 4,
  "Actively Matching": 5,
  "First Meeting Scheduled": 6,
  "In Discussion": 7,
  "On Hold": -1,
  "Matched": 8,
};

interface Props { currentStage: JourneyStage }

export function JourneyStepper({ currentStage }: Props) {
  const currentIdx = STAGE_INDEX[currentStage];
  const onHold = currentStage === "On Hold";

  return (
    <div className="flex flex-col gap-0">
      {STAGES.map((s, i) => {
        const done = !onHold && i < currentIdx;
        const current = !onHold && i === currentIdx;
        return (
          <div
            key={s.key}
            className="flex items-center gap-3 py-1.5 text-[11px] relative"
            style={{ color: current ? "var(--ink)" : "var(--ink-muted)" }}
          >
            {i < STAGES.length - 1 && (
              <div
                aria-hidden
                className="absolute left-[5px] top-[18px] bottom-[-6px] w-px"
                style={{
                  background: done ? "var(--moss)" : "var(--border)",
                  opacity: done ? 0.6 : 1,
                }}
              />
            )}
            <motion.span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative z-[1]"
              style={{
                background: done ? "var(--moss)" : current ? "var(--ember)" : "var(--bg-elevated)",
                border: done ? "none" : current ? "2px solid var(--ember)" : "1px solid var(--border-strong)",
                boxShadow: current ? "0 0 0 4px var(--ember-soft)" : "none",
              }}
              animate={current ? { scale: [1, 1.1, 1] } : {}}
              transition={current ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            />
            <span className={current ? "font-medium" : ""}>{s.label}</span>
            {current && (
              <span className="font-mono text-[9px] text-[color:var(--ember)] uppercase tracking-[0.08em] ml-auto">
                now
              </span>
            )}
          </div>
        );
      })}
      {onHold && (
        <div
          className="flex items-center gap-3 py-1.5 text-[11px] relative"
          style={{ color: "var(--ink-soft)" }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative z-[1]"
            style={{ background: "var(--ink-faint)", border: "1px solid var(--ink-faint)" }}
          />
          <span>On hold</span>
          <span className="font-mono text-[9px] text-[color:var(--ink-faint)] uppercase tracking-[0.08em] ml-auto">
            paused
          </span>
        </div>
      )}
    </div>
  );
}
