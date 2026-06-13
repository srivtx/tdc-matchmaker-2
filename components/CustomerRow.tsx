"use client";

import { motion } from "framer-motion";
import { CustomerProfile, JourneyStage } from "@/lib/types";
import { calculateAge, formatCurrency } from "@/lib/utils";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Chevron } from "@/components/Glyph";

interface Props {
  customer: CustomerProfile;
  onClick: () => void;
}

const STAGE_LEFT_BORDER: Record<JourneyStage, string> = {
  "New Lead":                "var(--slate)",
  "Profile Created":         "var(--honey)",
  "Verification Pending":    "var(--honey)",
  "Verified":                "var(--moss)",
  "Preferences Set":         "var(--moss)",
  "Actively Matching":       "var(--ember)",
  "First Meeting Scheduled": "var(--ember)",
  "In Discussion":           "var(--ember)",
  "On Hold":                 "var(--ink-faint)",
  "Matched":                 "var(--moss)",
};

const STAGE_DOT: Record<JourneyStage, string> = {
  "New Lead":                "var(--slate)",
  "Profile Created":         "var(--honey)",
  "Verification Pending":    "var(--honey)",
  "Verified":                "var(--moss)",
  "Preferences Set":         "var(--moss)",
  "Actively Matching":       "var(--ember)",
  "First Meeting Scheduled": "var(--ember)",
  "In Discussion":           "var(--ember)",
  "On Hold":                 "var(--ink-faint)",
  "Matched":                 "var(--moss)",
};

// Stages that should look "stale" or low-priority in the queue
const STALE_STAGES: Set<JourneyStage> = new Set<JourneyStage>(["On Hold", "Matched"]);
// Stages that should look "active" / recent
const ACTIVE_STAGES: Set<JourneyStage> = new Set<JourneyStage>(["New Lead", "Actively Matching", "First Meeting Scheduled", "In Discussion"]);

export function CustomerRow({ customer, onClick }: Props) {
  const age = calculateAge(customer.dateOfBirth);
  const leftBorder = STAGE_LEFT_BORDER[customer.stage];
  const stageDot = STAGE_DOT[customer.stage];
  const isStale = STALE_STAGES.has(customer.stage);
  const isActive = ACTIVE_STAGES.has(customer.stage);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.997 }}
      className="w-full text-left relative grid items-center gap-3 pl-3 pr-4 py-3 rounded-md transition-all group"
      style={{
        // Mobile: 1 col with internal grid. md+: full 6-col table.
        gridTemplateColumns: "1fr",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${leftBorder}`,
        opacity: isStale ? 0.78 : 1,
      }}
      whileHover={{ borderColor: "var(--border-strong)" }}
    >
      {/* Top row — always visible, even on mobile: avatar + name + chevron */}
      <div className="flex items-center gap-3 min-w-0">
        <ProfileAvatar
          avatar={customer.avatar}
          firstName={customer.firstName}
          lastName={customer.lastName}
          gender={customer.gender}
          size={32}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 text-[13px] font-medium text-[color:var(--ink)] truncate">
            {customer.firstName} {customer.lastName}
            <span className="font-mono text-[10px] text-[color:var(--ink-faint)] font-normal">{age}y</span>
          </div>
          <div className="text-[10.5px] text-[color:var(--ink-muted)] truncate">
            {customer.designation}
          </div>
        </div>
        {/* Mobile: income pill (compact) + chevron */}
        <div className="flex items-center gap-2 md:hidden flex-shrink-0">
          <span
            className="font-mono text-[10px] text-[color:var(--ink-soft)]"
            style={{ opacity: isActive ? 1 : 0.85 }}
          >
            {formatCurrency(customer.income)}
          </span>
          <Chevron
            size={12}
            strokeWidth={1.25}
            className="text-[color:var(--ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--ink-muted)]"
          />
        </div>
      </div>

      {/* Bottom row — stage + city (visible on mobile as a small mono strip;
          hidden on md+ where the columns take over) */}
      <div className="flex items-center gap-2 md:hidden text-[10px] font-mono text-[color:var(--ink-muted)] pl-[44px]">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: stageDot }}
        />
        <span className="uppercase tracking-[0.06em]">{customer.stage}</span>
        <span className="text-[color:var(--ink-faint)]">·</span>
        <span className="truncate">{customer.city}</span>
      </div>

      {/* md+ columns — stage, city, community, income, chevron (each in its own cell) */}
      <div
        className="hidden md:grid items-center gap-3 min-w-0"
        style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1.1fr) 56px 20px" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: stageDot }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[color:var(--ink-soft)] truncate">
            {customer.stage}
          </span>
        </div>

        <div className="font-mono text-[11px] text-[color:var(--ink-soft)] truncate">
          {customer.city}
        </div>

        <div className="text-[11px] text-[color:var(--ink-soft)] truncate">
          {customer.religion} · {customer.caste}
        </div>

        <div className="font-mono text-[11px] text-[color:var(--ink-soft)] text-right truncate" style={{ opacity: isActive ? 1 : 0.85 }}>
          {formatCurrency(customer.income)}
        </div>

        <Chevron
          size={12}
          strokeWidth={1.25}
          className="text-[color:var(--ink-faint)] justify-self-end transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--ink-muted)]"
        />
      </div>
    </motion.button>
  );
}
