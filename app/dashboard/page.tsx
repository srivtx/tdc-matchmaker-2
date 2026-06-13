"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { customers } from "@/data/profiles";
import { CustomerProfile, JourneyStage } from "@/lib/types";
import { CustomerRow } from "@/components/CustomerRow";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Skeleton } from "@/components/Skeleton";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  ArrowRight, ArrowUpRight, Chevron, Check, Cross,
  Clock, Hourglass, Search as SearchGlyph, Pen, Send,
  Message, Phone, Spark, Warn, Dot,
} from "@/components/Glyph";
import Nav from "@/components/Nav";
import { sounds } from "@/lib/sound";
import { calculateAge, formatCurrency } from "@/lib/utils";

/**
 * V2 Dashboard — "Today's Brief" — editorial layout.
 *
 * Three featured cards (the *next actions* the matchmaker should do today),
 * then a compact list of the rest of the queue. No KPI strip — that's
 * overhead. The page reads like a magazine cover, not a CRM.
 */

const STAGE_BLURB: Record<JourneyStage, string> = {
  "New Lead":                "Waiting on first call",
  "Profile Created":         "Draft profile ready",
  "Verification Pending":    "Background check in progress",
  "Verified":                "Ready to set preferences",
  "Preferences Set":         "Matching engine running",
  "Actively Matching":       "Top matches ready to review",
  "First Meeting Scheduled": "Awaiting meeting outcome",
  "In Discussion":           "Family conversations ongoing",
  "On Hold":                 "Family paused the search",
  "Matched":                 "Closed — celebrate",
};

const STAGE_LEFT_DOT: Record<JourneyStage, string> = {
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

type ActionKind = "send" | "followup" | "call" | "preferences";

interface FeaturedAction {
  kind: ActionKind;
  icon: any;
  eyebrow: string;
  customer: CustomerProfile;
  shortReason: string;       // ONE short sentence shown in the card
  cta: string;
  // Priority / metadata
  priority: number;            // 1 = highest, 3 = lowest
  stakes: "high" | "medium" | "low";  // controls accent bar color
  stakesLabel: string;         // short text for the stakes badge
  timeMin: number;              // estimated minutes to complete
  daysInStage: number;          // how long they've been in this stage
}

// Stage urgency: how "needs me" is this stage right now?
const STAGE_URGENCY: Record<JourneyStage, number> = {
  "First Meeting Scheduled": 100,  // family is WAITING for a reply
  "In Discussion":           95,    // family conversations ongoing
  "Actively Matching":       85,    // top candidates ready
  "Preferences Set":         70,    // engine is running, may need adjustment
  "Verified":                55,    // ready to set preferences
  "Verification Pending":    45,
  "Profile Created":         40,
  "New Lead":                35,
  "On Hold":                 -50,   // paused
  "Matched":                 -100,  // done
};

// Derive a stable "days in stage" per customer from id (deterministic, no real timestamp needed)
function daysInStage(c: CustomerProfile): number {
  // Use a simple hash of the id to get a stable 1-21 day value
  let h = 0;
  for (let i = 0; i < c.id.length; i++) h = (h * 31 + c.id.charCodeAt(i)) | 0;
  const base = Math.abs(h) % 18;
  // Stages that imply recent contact have lower days
  const stageNudge: Record<JourneyStage, number> = {
    "First Meeting Scheduled": -2,
    "In Discussion": -3,
    "Actively Matching": 0,
    "On Hold": 5,
    "Matched": 7,
  } as any;
  return Math.max(1, base + (stageNudge[c.stage] || 0));
}

// Priority score: higher = more urgent right now
function priorityScore(c: CustomerProfile): number {
  const base = STAGE_URGENCY[c.stage] ?? 0;
  const days = daysInStage(c);
  // Time in stage adds urgency (penalty for staleness)
  const staleBoost = days * 2;
  // If the customer has notes, the matchmaker is engaged; reduce
  const noteDamp = c.notes.length > 0 ? -5 : 0;
  return base + staleBoost + noteDamp;
}

function pickFeatured(my: CustomerProfile[]): FeaturedAction[] {
  // Compute scores
  const scored = my
    .map((c) => ({ c, score: priorityScore(c) }))
    .filter((x) => x.score > 0)  // skip hold/matched
    .sort((a, b) => b.score - a.score);

  // Pick top 3 with diversity (don't pick 3 from same stage)
  const picked: FeaturedAction[] = [];
  const stagesUsed = new Set<JourneyStage>();

  for (const { c, score } of scored) {
    if (picked.length >= 3) break;
    // Skip if we already have one from this stage
    if (stagesUsed.has(c.stage) && picked.length < scored.length - 1) continue;

    const days = daysInStage(c);
    const action = buildAction(c, days);
    if (action) {
      picked.push(action);
      stagesUsed.add(c.stage);
    }
  }

  // If we still need more, fill with anything
  for (const { c } of scored) {
    if (picked.length >= 3) break;
    if (picked.find((p) => p.customer.id === c.id)) continue;
    const action = buildAction(c, daysInStage(c));
    if (action) picked.push(action);
  }

  // Assign priority 1/2/3
  picked.forEach((p, i) => (p.priority = i + 1));
  return picked.slice(0, 3);
}

function buildAction(c: CustomerProfile, days: number): FeaturedAction | null {
  if (c.stage === "Actively Matching" || c.stage === "Preferences Set") {
    return {
      kind: "send",
      icon: Send,
      eyebrow: "Send match",
      customer: c,
      shortReason: days > 7
        ? `Top shortlist ready · waiting ${days}d for your review.`
        : `Top shortlist ready for your review.`,
      cta: "Open case file",
      priority: 1,
      stakes: days > 10 ? "high" : days > 5 ? "medium" : "low",
      stakesLabel: days > 10 ? "Family waiting" : days > 5 ? "Stalled" : "Fresh",
      timeMin: 15,
      daysInStage: days,
    };
  }
  if (c.stage === "First Meeting Scheduled" || c.stage === "In Discussion") {
    return {
      kind: "followup",
      icon: Message,
      eyebrow: "Follow up",
      customer: c,
      shortReason: days > 3
        ? `Intro sent ${days}d ago · family hasn't replied.`
        : `Intro sent · nudge before it goes cold.`,
      cta: "Draft follow-up",
      priority: 1,
      stakes: days > 5 ? "high" : "medium",
      stakesLabel: days > 5 ? "Family waiting" : "Awaiting reply",
      timeMin: 5,
      daysInStage: days,
    };
  }
  if (c.stage === "Verified" || c.stage === "Profile Created") {
    return {
      kind: "preferences",
      icon: Pen,
      eyebrow: "Set preferences",
      customer: c,
      shortReason: days > 7
        ? `Verified ${days}d ago · engine is paused.`
        : `Verified · preferences not set yet.`,
      cta: "Open intake form",
      priority: 2,
      stakes: days > 7 ? "medium" : "low",
      stakesLabel: days > 7 ? "Engine paused" : "Waiting to start",
      timeMin: 25,
      daysInStage: days,
    };
  }
  if (c.stage === "New Lead") {
    return {
      kind: "call",
      icon: Phone,
      eyebrow: "Discovery call",
      customer: c,
      shortReason: days > 5
        ? `Family reached out ${days}d ago · going cold.`
        : `Family just reached out · slot a call.`,
      cta: "Schedule now",
      priority: 3,
      stakes: days > 5 ? "medium" : "low",
      stakesLabel: days > 5 ? "Going cold" : "Fresh lead",
      timeMin: 30,
      daysInStage: days,
    };
  }
  return null;
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<"active" | "stale" | "all">("active");
  const [sortBy, setSortBy] = useState<"urgency" | "stage" | "name">("urgency");

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [isAuthenticated, router]);

  const my = useMemo(() => customers.filter((c) => c.matchmakerId === "mm-1"), []);
  const featured = useMemo(() => pickFeatured(my), [my]);

  const stats = useMemo(() => ({
    active: my.filter((c) => !["Matched", "On Hold"].includes(c.stage)).length,
    toSend: my.filter((c) => c.stage === "Actively Matching").length,
    overdue: my.filter((c) => c.stage === "In Discussion" || c.stage === "First Meeting Scheduled").length,
  }), [my]);

  // Apply view filter (active / stale / all) + search
  const filteredAndViewed = useMemo(() => {
    let r = my;
    if (viewFilter === "active") r = r.filter((c) => !["Matched", "On Hold"].includes(c.stage));
    if (viewFilter === "stale") r = r.filter((c) => daysInStage(c) >= 7 && !["Matched", "On Hold"].includes(c.stage));
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.stage.toLowerCase().includes(q)
      );
    }
    return r;
  }, [my, search, viewFilter]);

  // Sort + group
  type Group = { key: string; label: string; items: CustomerProfile[] };
  const groups: Group[] = useMemo<Group[]>(() => {
    const items = [...filteredAndViewed];
    if (sortBy === "urgency") {
      items.sort((a, b) => priorityScore(b) - priorityScore(a));
      return [{ key: "all", label: "", items }];
    }
    if (sortBy === "name") {
      items.sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));
      return [{ key: "all", label: "", items }];
    }
    // group by stage
    const stageOrder: JourneyStage[] = [
      "First Meeting Scheduled", "In Discussion", "Actively Matching", "Preferences Set",
      "Verified", "Profile Created", "Verification Pending", "New Lead",
      "On Hold", "Matched",
    ];
    const result: Group[] = [];
    for (const stage of stageOrder) {
      const inStage = items.filter((c) => c.stage === stage);
      if (inStage.length > 0) {
        result.push({ key: stage, label: STAGE_BLURB[stage] || stage, items: inStage });
      }
    }
    return result;
  }, [filteredAndViewed, sortBy]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Nav />

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* ─────────────── Masthead ─────────────── */}
        <header className="mb-10 pb-8" style={{ borderBottom: "1px solid var(--border-strong)" }}>
          <div className="flex items-baseline justify-between gap-3 md:gap-6 mb-3 flex-wrap">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                style={{ background: "var(--ember-soft)", color: "var(--ember)" }}
              >
                Today's brief
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)]">
              Vol. 1 · Issue {Math.max(1, Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000))}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-serif m-0 leading-[1.05]"
            style={{ fontSize: "clamp(40px, 5vw, 60px)", letterSpacing: "-0.02em", color: "var(--ink)" }}
          >
            {(() => {
              const h = new Date().getHours();
              const greeting = h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
              return `${greeting}, `;
            })()}
            <em className="text-[color:var(--ember)]" style={{ fontStyle: "italic" }}>Priya</em>.
            <br />
            <span style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>Three things, in this order.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-px max-w-2xl"
            style={{ background: "var(--border)" }}
          >
            <div className="px-4 py-3" style={{ background: "var(--bg)" }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)] mb-1">Intros to send</div>
              <div className="font-serif text-[28px] leading-none" style={{ color: "var(--ember)" }}>{stats.toSend}</div>
            </div>
            <div className="px-4 py-3" style={{ background: "var(--bg)" }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)] mb-1">Follow-ups</div>
              <div className="font-serif text-[28px] leading-none" style={{ color: "var(--honey)" }}>{stats.overdue}</div>
            </div>
            <div className="px-4 py-3" style={{ background: "var(--bg)" }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)] mb-1">In pipeline</div>
              <div className="font-serif text-[28px] leading-none" style={{ color: "var(--ink)" }}>{stats.active}</div>
            </div>
          </motion.div>
        </header>

        {/* ─────────────── Featured Actions (3 editorial cards) ─────────────── */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)] mb-1">
                § 01 — Lead stories
              </div>
              <h2
                className="font-serif m-0"
                style={{ fontSize: 24, letterSpacing: "-0.01em", color: "var(--ink)" }}
              >
                The three things that move the day.
              </h2>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)]">
              By priority · {new Date().toLocaleDateString("en-IN", { weekday: "short" })}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[260px] rounded-md" />
              <Skeleton className="h-[260px] rounded-md" />
              <Skeleton className="h-[260px] rounded-md" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((a, i) => (
                <FeaturedCard key={a.customer.id} action={a} index={i} router={router} />
              ))}
              {featured.length === 0 && (
                <div
                  className="col-span-3 p-10 text-center rounded-md"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <Check size={24} strokeWidth={1.25} className="mx-auto mb-2" style={{ color: "var(--moss)" }} />
                  <div className="font-serif text-[18px] mb-1" style={{ color: "var(--ink)" }}>All clear for now.</div>
                  <div className="text-[12px]" style={{ color: "var(--ink-muted)" }}>
                    Nothing pressing. Use the time to review preferences or call a new lead.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─────────────── Yesterday strip ─────────────── */}
        <section
          className="mb-12 py-5 px-4 md:px-6 rounded-md"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-4 md:gap-6 flex-wrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Clock size={11} strokeWidth={1} style={{ color: "var(--ink-muted)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">
                Yesterday
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[20px] leading-none" style={{ color: "var(--ember)" }}>12</span>
              <span className="text-[12px] text-[color:var(--ink-soft)]">new matches</span>
            </div>
            <span className="font-mono text-[color:var(--ink-faint)] hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[20px] leading-none" style={{ color: "var(--honey)" }}>3</span>
              <span className="text-[12px] text-[color:var(--ink-soft)]">replied</span>
            </div>
            <span className="font-mono text-[color:var(--ink-faint)] hidden sm:inline">·</span>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[20px] leading-none" style={{ color: "var(--moss)" }}>1</span>
              <span className="text-[12px] text-[color:var(--ink-soft)]">awaiting reply</span>
            </div>
            <div className="flex-1 hidden sm:block" />
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)]">
              Last sync · 4 min ago
            </div>
          </div>
        </section>

        {/* ─────────────── The Rest ─────────────── */}
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)] mb-1">
                § 02 — The full pipeline
              </div>
              <h2
                className="font-serif m-0"
                style={{ fontSize: 20, letterSpacing: "-0.01em", color: "var(--ink)" }}
              >
                The rest, in case you have time.
              </h2>
            </div>

            {/* Filter + sort + search controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="flex items-center rounded-md overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                {(["active", "stale", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setViewFilter(f); sounds.click(); }}
                    className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                    style={{
                      background: viewFilter === f ? "var(--ink)" : "transparent",
                      color: viewFilter === f ? "var(--bg)" : "var(--ink-muted)",
                    }}
                  >
                    {f === "active" ? "Active" : f === "stale" ? "Stalled" : "All"}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center rounded-md overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
              >
                {(["urgency", "stage", "name"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSortBy(s); sounds.click(); }}
                    className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                    style={{
                      background: sortBy === s ? "var(--ink)" : "transparent",
                      color: sortBy === s ? "var(--bg)" : "var(--ink-muted)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-2.5 px-3 py-1 rounded-md w-full sm:w-[200px]"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              >
                <SearchGlyph size={11} strokeWidth={1.2} className="text-[color:var(--ink-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="bg-transparent flex-1 outline-none text-[12px] text-[color:var(--ink)] placeholder:text-[color:var(--ink-faint)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[60px] w-full rounded-md" />)
            ) : groups.length === 0 ? (
              <div
                className="p-10 text-center rounded-md"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              >
                <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>No customers match these filters.</div>
                <button
                  onClick={() => { setViewFilter("active"); setSortBy("urgency"); setSearch(""); sounds.click(); }}
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: "var(--ember)" }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {groups.map((group, gi) => (
                  <motion.div
                    key={group.key}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {sortBy === "stage" && group.label && (
                      <div className="flex items-center gap-3 pt-3 pb-1.5 mt-2 first:mt-0" style={{ borderTop: gi > 0 ? "1px solid var(--border)" : "none" }}>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]">
                          {group.label}
                        </span>
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}
                        >
                          {group.items.length}
                        </span>
                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {group.items.map((c, i) => (
                        <CustomerRow
                          key={c.id}
                          customer={c}
                          onClick={() => {
                            sounds.click();
                            router.push(`/dashboard/${c.id}`);
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Colophon */}
        <footer className="mt-16 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--ink-faint)]">
            The Date Crew · Matchmaker Workspace · Set in Inter, JetBrains Mono &amp; Instrument Serif
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeaturedCard({
  action, index, router,
}: {
  action: FeaturedAction;
  index: number;
  router: ReturnType<typeof useRouter>;
}) {
  const age = calculateAge(action.customer.dateOfBirth);
  const Icon = action.icon;
  const stakesColor =
    action.stakes === "high"   ? "var(--ember)" :
    action.stakes === "medium" ? "var(--honey)" :
                                  "var(--moss)";
  const stakesBg =
    action.stakes === "high"   ? "var(--ember-soft)" :
    action.stakes === "medium" ? "var(--honey-soft)" :
                                  "var(--moss-soft)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      className="relative group"
    >
      <motion.button
        onClick={() => { sounds.click(); router.push(`/dashboard/${action.customer.id}`); }}
        whileHover={{ y: -2 }}
        className="w-full text-left rounded-md overflow-hidden relative"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Top accent bar — the only urgency signal in the card */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              action.kind === "send"       ? "var(--ember)" :
              action.kind === "followup"   ? "var(--honey)" :
              action.kind === "preferences" ? "var(--moss)"  :
                                             "var(--slate)",
          }}
        />

        {/* Header: action eyebrow on the left, time estimate on the right */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <Icon size={10} strokeWidth={1.25} className="opacity-60" style={{ color: "var(--ink-muted)" }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
              {action.eyebrow}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-serif italic text-[10px] tracking-[0.04em] px-1.5 py-0.5"
              style={{ background: stakesBg, color: stakesColor }}
            >
              {action.stakesLabel}
            </span>
            <span className="font-mono text-[9px] text-[color:var(--ink-faint)]">
              ~{action.timeMin} min
            </span>
          </div>
        </div>

        {/* Person — photo + name + meta */}
        <div className="px-5 pt-2 pb-2 flex items-center gap-4">
          <ProfileAvatar
            avatar={action.customer.avatar}
            firstName={action.customer.firstName}
            lastName={action.customer.lastName}
            gender={action.customer.gender}
            size={56}
          />
          <div className="min-w-0 flex-1">
            <div
              className="font-serif leading-[1.05] truncate"
              style={{ fontSize: 24, letterSpacing: "-0.015em", color: "var(--ink)" }}
            >
              {action.customer.firstName} {action.customer.lastName}
            </div>
            <div className="text-[11px] text-[color:var(--ink-muted)] mt-1 truncate">
              {age}y · {action.customer.city} · {action.customer.designation}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: STAGE_LEFT_DOT[action.customer.stage] }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--ink-soft)]">
                  {STAGE_BLURB[action.customer.stage]}
                </span>
              </div>
              <span className="text-[color:var(--ink-faint)]">·</span>
              <span className="font-mono text-[9px] text-[color:var(--ink-muted)]">
                {action.daysInStage}d in stage
              </span>
            </div>
          </div>
        </div>

        {/* Body — one short sentence */}
        <div className="px-5 pb-4 pt-1">
          <p
            className="text-[13px] leading-[1.45] m-0"
            style={{ color: "var(--ink-soft)" }}
          >
            {action.shortReason}
          </p>
        </div>

        {/* Single CTA row */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--ink)] font-medium">
            {action.cta}
          </span>
          <ArrowUpRight
            size={13}
            strokeWidth={1}
            className="text-[color:var(--ink-faint)] group-hover:text-[color:var(--ember)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>
      </motion.button>

      {/* Hover-revealed secondary actions (Snooze / Mark done) */}
      <div
        className="flex items-center justify-end gap-3 mt-1.5 px-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--ink-faint)] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={(e) => { e.stopPropagation(); sounds.click(); }}
          className="hover:text-[color:var(--ink-soft)] transition-colors flex items-center gap-1"
        >
          <Hourglass size={8} strokeWidth={1} /> Snooze
        </button>
        <span className="text-[color:var(--ink-faint)]">·</span>
        <button
          onClick={(e) => { e.stopPropagation(); sounds.click(); }}
          className="hover:text-[color:var(--ink-soft)] transition-colors flex items-center gap-1"
        >
          <Check size={8} strokeWidth={1.5} /> Mark done
        </button>
      </div>
    </motion.div>
  );
}
