"use client";

import { motion } from "framer-motion";
import { CustomerProfile, MatchScore } from "@/lib/types";
import { calculateAge, formatCurrency } from "@/lib/utils";
import { Spark, Check, Warn } from "@/components/Glyph";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface Props {
  customer: CustomerProfile;
  match: MatchScore;
}

function tierWord(score: number) {
  if (score >= 85) return "exceptional";
  if (score >= 70) return "strong";
  if (score >= 50) return "worth exploring";
  return "low";
}

/**
 * One concrete observation per dimension. Reads from the actual
 * customer/match data so the copy tells the matchmaker something
 * they can't see in the score number.
 */
function explainDim(
  key: string,
  customer: CustomerProfile,
  match: MatchScore,
  ageA: number,
  ageB: number
): string {
  const p = match.profile;
  switch (key) {
    case "valuesAlignment":
      return customer.diet === p.diet
        ? `Both ${customer.diet.toLowerCase()}, both family-first.`
        : `${customer.diet} vs ${p.diet}. Different diets, same family compass.`;
    case "educationCompatibility":
      return `${customer.degree} meets ${p.degree}. Same peer-class.`;
    case "lifestyleCompatibility":
      return customer.diet === p.diet
        ? `Identical ${customer.diet.toLowerCase()}. No household friction.`
        : `${customer.diet} + ${p.diet}. Common in urban mixed families.`;
    case "ageCompatibility":
      return `${Math.abs(ageA - ageB)}-year gap. Within the comfortable band.`;
    case "incomeCompatibility":
      return `${formatCurrency(customer.income)} vs ${formatCurrency(p.income)}. Comparable.`;
    case "locationCompatibility":
      return customer.city === p.city
        ? `Both in ${customer.city}. No relocation.`
        : `${customer.city} ↔ ${p.city}. Relocation conversation needed.`;
    case "religionCasteBonus":
      return customer.caste === p.caste
        ? `Same community (${customer.caste}).`
        : `${customer.caste} ↔ ${p.caste}. Confirm family openness.`;
    case "familyCompatibility":
      return `Both ${customer.familyType.toLowerCase()} families. Same structure.`;
    case "heightCompatibility":
      return `${customer.height}cm meets ${p.height}cm. Within typical range.`;
    case "languageOverlap":
      if (customer.languagesKnown.join() === p.languagesKnown.join())
        return `Same languages. Effortless communication.`;
      const shared = customer.languagesKnown.filter((l) => p.languagesKnown.includes(l));
      return `Shared: ${shared.join(", ")}.`;
    default:
      return "";
  }
}

const DIM_LABEL: Record<string, string> = {
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

const KEY_FACTORS = ["valuesAlignment", "locationCompatibility", "lifestyleCompatibility", "religionCasteBonus"];

export function CompareCanvas({ customer, match }: Props) {
  const { profile, totalScore, breakdown, explanation, aiEnhanced } = match;
  const tier = tierWord(totalScore);
  const ageA = calculateAge(customer.dateOfBirth);
  const ageB = calculateAge(profile.dateOfBirth);

  // Find friction: bottom 3 dimensions by score (these are the conversation starters)
  const entries = Object.entries(breakdown)
    .map(([k, v]) => ({ key: k, score: v as number }))
    .sort((a, b) => a.score - b.score);
  const friction = entries.slice(0, 3);
  const strength = entries.slice(-2).reverse();

  // The 4 most important factors, displayed prominently
  const keyFactors = KEY_FACTORS.map((k) => ({
    key: k,
    label: DIM_LABEL[k],
    score: breakdown[k as keyof typeof breakdown],
    note: explainDim(k, customer, match, ageA, ageB),
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* A/B score strip — three columns, the two people flanking the score */}
      <motion.div
        key={match.profile.id + "-ab"}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-lg overflow-hidden p-6"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, var(--ember) 0%, var(--ember) ${totalScore}%, transparent ${totalScore}%)`,
          }}
        />

        <div
          className="grid items-center gap-4 md:gap-6 grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
        >
          {/* Customer */}
          <div className="flex items-center gap-4 min-w-0 order-1">
            <ProfileAvatar
              avatar={customer.avatar}
              firstName={customer.firstName}
              lastName={customer.lastName}
              gender={customer.gender}
              size={56}
            />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-faint)]">
                Customer
              </div>
              <div className="font-serif text-[20px] leading-tight text-[color:var(--ink)] truncate" style={{ letterSpacing: "-0.01em" }}>
                {customer.firstName} {customer.lastName}
              </div>
              <div className="text-[11px] text-[color:var(--ink-muted)] mt-0.5 truncate">
                {ageA}y · {customer.city} · {customer.designation}
              </div>
            </div>
          </div>

          {/* Center score */}
          <div className="text-center px-4 order-3 md:order-2 flex md:block items-baseline gap-3 justify-center">
            <div
              className="font-serif leading-none"
              style={{ fontSize: 56, color: "var(--ember)", letterSpacing: "-0.04em" }}
            >
              {totalScore}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)] mt-1">
              of 100
            </div>
            <div
              className="font-serif text-[14px] leading-tight mt-0 md:mt-2"
              style={{ color: "var(--ink)" }}
            >
              A <em className="text-[color:var(--ember)]" style={{ fontStyle: "italic" }}>{tier}</em> alignment
            </div>
          </div>

          {/* Match */}
          <div className="flex items-center gap-4 min-w-0 flex-row-reverse text-right order-2 md:order-3">
            <ProfileAvatar
              avatar={match.profile.avatar}
              firstName={match.profile.firstName}
              lastName={match.profile.lastName}
              gender={match.profile.gender}
              size={56}
            />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ember)]">
                Match
              </div>
              <div className="font-serif text-[20px] leading-tight text-[color:var(--ink)] truncate" style={{ letterSpacing: "-0.01em" }}>
                {match.profile.firstName} {match.profile.lastName}
              </div>
              <div className="text-[11px] text-[color:var(--ink-muted)] mt-0.5 truncate">
                {ageB}y · {match.profile.city} · {match.profile.designation}
              </div>
            </div>
          </div>
        </div>

        {/* AI tag + bottom row */}
        <div className="mt-5 pt-4 flex items-center gap-2 flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
          {aiEnhanced ? (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-1 rounded flex items-center gap-1"
              style={{ background: "var(--ember-soft)", color: "var(--ember)", border: "1px solid var(--border-ember)" }}
            >
              <Spark size={9} strokeWidth={1.25} /> AI refined explanation
            </span>
          ) : (
            <span
              className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-1 rounded flex items-center gap-1"
              style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)", border: "1px solid var(--border)" }}
            >
              <Spark size={9} strokeWidth={1.25} /> Deterministic scoring
            </span>
          )}
          <span
            className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-1 rounded"
            style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)", border: "1px solid var(--border)" }}
          >
            10-dim weighted
          </span>
          {/* The verdict — a single short editorial line.
              If the AI enhanced it, show in serif italic; otherwise the
              deterministic fallback reads as a smaller muted italic. */}
          <p
            className="flex-1 min-w-0 m-0 truncate"
            style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: aiEnhanced ? "var(--ink)" : "var(--ink-soft)",
              fontStyle: "italic",
              fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
            }}
            title={explanation}
          >
            {explanation}
          </p>
        </div>
      </motion.div>

      {/* Key factors — the 4 dimensions that actually matter for THIS match */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-lg overflow-hidden"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <header className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] m-0" style={{ color: "var(--ink-muted)" }}>
              What aligned · What to confirm
            </h3>
            <p className="text-[11px] m-0 mt-1" style={{ color: "var(--ink-faint)" }}>
              The four dimensions that actually matter for this match.
            </p>
          </div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded"
            style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}
          >
            4 of 10
          </span>
        </header>
        <div className="divide-y" style={{ ["--tw-divide-opacity" as any]: 1 }}>
          {keyFactors.map((f) => {
            const isStrong = f.score >= 85;
            const isFriction = f.score < 70;
            const color = isStrong ? "var(--moss)" : isFriction ? "var(--ember)" : "var(--honey)";
            return (
              <div
                key={f.key}
                className="grid items-center px-5 py-3.5 gap-4"
                style={{ gridTemplateColumns: "auto 1fr auto" }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center"
                  style={{
                    background: isStrong ? "var(--moss-soft)" : isFriction ? "var(--ember-soft)" : "var(--honey-soft)",
                    color: color,
                  }}
                >
                  {isStrong ? <Check size={15} strokeWidth={1.5} /> : <Warn size={14} strokeWidth={1.25} />}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mb-0.5" style={{ color: "var(--ink-muted)" }}>
                    {f.label}
                  </div>
                  <div className="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
                    {f.note}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-[22px] leading-none" style={{ color }}>
                    {f.score}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] mt-1" style={{ color: "var(--ink-muted)" }}>
                    {isStrong ? "Aligned" : isFriction ? "Confirm" : "Okay"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Remaining dims — compact strip */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-lg p-5"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] m-0" style={{ color: "var(--ink-muted)" }}>
            Other 6 dimensions
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-faint)" }}>
            glance only
          </span>
        </div>
        <div className="space-y-2">
          {entries
            .filter((e) => !KEY_FACTORS.includes(e.key))
            .map((e) => {
              const isStrong = e.score >= 85;
              const isFriction = e.score < 70;
              const color = isStrong ? "var(--moss)" : isFriction ? "var(--ember)" : "var(--honey)";
              return (
                <div key={e.key} className="flex items-center gap-3">
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.04em] w-[80px] flex-shrink-0"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {DIM_LABEL[e.key]}
                  </div>
                  <div
                    className="flex-1 h-[2px] rounded-full overflow-hidden"
                    style={{ background: "var(--bg-sunken)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${e.score}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div
                    className="font-mono text-[11px] font-semibold tabular-nums w-[28px] text-right"
                    style={{ color }}
                  >
                    {e.score}
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
