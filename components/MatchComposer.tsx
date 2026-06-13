"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CustomerProfile, MatchScore } from "@/lib/types";
import { calculateAge, formatCurrency } from "@/lib/utils";
import { Cross, Spark, Loader, Send as SendGlyph, Mail, Document } from "@/components/Glyph";
import { sounds } from "@/lib/sound";

interface Props {
  customer: CustomerProfile;
  match: MatchScore;
  cachedEmail?: string;
  onEmailGenerated?: (text: string) => void;
  onClose: () => void;
  onSent: () => void;
}

// The static fallback paragraph that sits where the AI-generated reason
// would go. Mirrors tdc-matchmaker's "We believe you share compatible values
// around family, education, and lifestyle..." fallback.
const FALLBACK_REASON =
  "We believe you share compatible values around family, education, and lifestyle — a meaningful connection worth exploring.";

export function MatchComposer({ customer, match, cachedEmail, onEmailGenerated, onClose, onSent }: Props) {
  const ageA = calculateAge(customer.dateOfBirth);
  const ageB = calculateAge(match.profile.dateOfBirth);
  // `reason` is the ONLY dynamic piece in the body. The rest of the email
  // (salutation, intro sentence, reply instructions, sign-off) is hardcoded
  // JSX — same pattern as tdc-matchmaker.
  const [reason, setReason] = useState<string>(cachedEmail || match.explanation || FALLBACK_REASON);
  const [enhancing, setEnhancing] = useState(false);
  // `aiUsed` is set ONLY after handleDraft runs in this session. It is
  // intentionally separate from whether `match.explanation` is populated
  // by Enhance in the detail page — that explanation shows in the body, but
  // the composer hasn't generated anything itself, so the label stays
  // "Starter paragraph" until the user explicitly clicks Draft with AI.
  const [aiUsed, setAiUsed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    sounds.open();
    return () => { document.body.style.overflow = ""; sounds.close(); };
  }, []);

  // One call to Groq. We reuse the match's `explanation` if the user has
  // already clicked "Enhance with AI" in the detail page (which populates it
  // via enhanceMatchWithAI). Otherwise we generate a fresh one-sentence reason.
  async function callGroq(prompt: string, maxTokens = 80): Promise<string> {
    const key = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  }

  // Generate a fresh reason (or reuse the match's existing one) and inject it
  // into the structured email at the single dynamic paragraph slot. The
  // salutation, intro sentence, reply-instructions, and sign-off are all
  // hardcoded JSX and never touched.
  //
  // On the first call (Draft with AI), we reuse the match's `explanation`
  // if Enhance was already run in the detail page — saves an API call and
  // keeps the copy consistent. On Regenerate we ALWAYS hit the API so the
  // user gets a fresh variant.
  async function handleDraft({ regenerate = false }: { regenerate?: boolean } = {}) {
    setEnhancing(true);
    try {
      // 1) Resolve the reason.
      let r = "";
      if (!regenerate && match.explanation?.trim()) {
        r = match.explanation.trim();
      } else {
        r = await callGroq(
          `Write ONE short sentence (max 25 words) explaining why ${customer.firstName} ` +
          `(${ageA}, ${customer.designation}, ${customer.city}) and ${match.profile.firstName} ` +
          `(${ageB}, ${match.profile.designation}, ${match.profile.city}) ` +
          `would be a good match. Composite score ${match.totalScore}%. ` +
          `Top strengths: ${Object.entries(match.breakdown).sort(([,a],[,b]) => (b as number)-(a as number)).slice(0,3).map(([k]) => k).join(", ")}. ` +
          `Output only the sentence.`,
        );
      }
      if (!r) { sounds.error(); return; }

      setReason(r);
      setAiUsed(true);
      onEmailGenerated?.(r);
      sounds.success();
    } catch {
      sounds.error();
    } finally {
      setEnhancing(false);
    }
  }

  // Render the email body — the only dynamic piece is the `reason` paragraph.
  // The other paragraphs are fixed copy, like tdc-matchmaker's structured body.
  const wordCount = reason.split(/\s+/).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 grid place-items-center p-4 lg:p-6"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        // Mobile: 1 col, panels stack, max-h is viewport. md+: 2 cols side-by-side.
        // overflow-y-auto lets the whole modal scroll on mobile if content
        // is taller than the viewport.
        className="w-full max-w-[1080px] rounded-xl overflow-y-auto md:overflow-hidden grid relative grid-cols-1 md:grid-cols-[minmax(360px,400px)_1fr]"
        style={{
          maxHeight: "calc(100vh - 24px)",
          height: "min(640px, calc(100vh - 80px))",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-md grid place-items-center transition-colors"
          style={{
            background: "rgba(0,0,0,0.4)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Cross size={13} strokeWidth={1.25} />
        </button>

        {/* LEFT — dark reference panel */}
        <aside
          className="p-4 md:p-6 flex flex-col gap-5 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #16140f 0%, #0d0c08 100%)",
            color: "white",
            minHeight: 0,
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
            For your reference
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-2.5">
            <PersonCard
              label="Customer"
              name={`${customer.firstName} ${customer.lastName[0]}.`}
              age={ageA}
              city={customer.city}
              income={customer.income}
              community={`${customer.religion} · ${customer.caste}`}
              diet={customer.diet}
            />
            <PersonCard
              label="Match"
              name={`${match.profile.firstName} ${match.profile.lastName[0]}.`}
              age={ageB}
              city={match.profile.city}
              income={match.profile.income}
              community={`${match.profile.religion} · ${match.profile.caste}`}
              diet={match.profile.diet}
            />
          </div>

          <div>
            {/* Compatibility stats — hidden on mobile (the editor panel
                already has the score breakdown). md+: visible. */}
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 mb-2.5 hidden md:block">
              Compatibility at a glance
            </div>
            <div className="grid grid-cols-4 gap-2 hidden md:grid">
              <Stat label="Composite" value={match.totalScore} />
              <Stat label="Values" value={match.breakdown.valuesAlignment} />
              <Stat label="Lifestyle" value={match.breakdown.lifestyleCompatibility} />
              <Stat label="Location" value={match.breakdown.locationCompatibility} />
            </div>
          </div>

          {/* Notes context — collapses to a single short quote on mobile,
              keeps the full context on md+. */}
          <div className="md:flex-1 md:min-h-0 flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 mb-2.5">
              {customer.notes?.[0] ? "Latest intake note" : "Context"}
            </div>
            <div
              className="v2-side-scroll p-3 rounded text-[11px] leading-[1.55] text-white/70 italic md:flex-1 md:min-h-0"
              style={{ background: "rgba(255,255,255,0.04)", borderLeft: "2px solid var(--ember)" }}
            >
              {customer.notes?.[0] ? (
                <span className="line-clamp-3 md:line-clamp-none">"{customer.notes[0].text}"</span>
              ) : (
                <div className="not-italic text-white/45 space-y-2">
                  <div>
                    <span className="text-white/30 font-mono text-[9px] uppercase tracking-[0.1em] mr-2">matchmaker note</span>
                    No notes yet. Add a note from the workspace to see context here.
                  </div>
                  <div className="text-white/30 text-[10px]">
                    Tip: paste family preferences, deal-breakers, or the last conversation here.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em] pt-2 mt-auto">
            TDC · Matchmaker workspace
          </div>
        </aside>

        {/* RIGHT — composer */}
        <div className="p-4 md:p-6 flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
            <Document size={11} strokeWidth={1.25} />
            Compose introduction
          </div>
          <h2
            className="font-serif m-0 leading-[1.05] text-[color:var(--ink)]"
            style={{ fontSize: 24, letterSpacing: "-0.01em" }}
          >
            To the {match.profile.lastName} family
          </h2>
          <div
            className="flex items-center gap-1.5 text-[10px] text-[color:var(--ink-muted)] -mt-1"
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace" }}
          >
            <Mail size={10} strokeWidth={1.25} />
            <span>Subject — Introduction · {customer.firstName} & {match.profile.firstName}</span>
          </div>

          <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mt-1">
            Message body
          </label>
          {/* Structured email body — the only dynamic piece is the `reason`
              paragraph. Salutation, intro sentence, reply instructions, and
              sign-off are hardcoded JSX, just like tdc-matchmaker. */}
          <div
            className="flex-1 w-full p-5 rounded-md overflow-y-auto font-serif transition-colors min-h-0 v2-side-scroll"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--ink)",
              fontSize: 13.5,
              lineHeight: 1.7,
              letterSpacing: "0.005em",
            }}
          >
            <p className="m-0 mb-3">
              Dear {match.profile.firstName}&apos;s family,
            </p>
            <p className="m-0 mb-3">
              We&apos;d like to introduce you to{" "}
              <span style={{ color: "var(--ember)", fontStyle: "italic" }}>
                {customer.firstName}
              </span>{" "}
              ({ageA}, {customer.designation}, {customer.city}) for your consideration.
            </p>
            <p
              className="m-0 mb-3"
              style={{
                color: aiUsed ? "var(--ink)" : "var(--ink-muted)",
                fontStyle: aiUsed ? "italic" : "normal",
              }}
            >
              {reason}
            </p>
            <p className="m-0 mb-3 text-[color:var(--ink-soft)]">
              If you&apos;d like to learn more, simply reply to this email and we&apos;ll
              facilitate the introduction at your convenience.
            </p>
            <p className="m-0 mt-4 text-[color:var(--ink-soft)]">
              Warm regards,
              <br />
              <span style={{ color: "var(--ink)" }}>Priya Sharma</span>
              <br />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-faint)]">
                The Date Crew
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-2 text-[10px] text-[color:var(--ink-muted)] font-mono">
              {aiUsed ? (
                <span className="inline-flex items-center gap-1 text-[color:var(--ember)]">
                  <Spark size={10} strokeWidth={1.25} /> AI-drafted
                </span>
              ) : match.explanation ? (
                <span>Inherited from match analysis</span>
              ) : (
                <span>Starter paragraph · enhance below</span>
              )}
              <span className="text-[color:var(--ink-faint)]">·</span>
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[color:var(--ink-soft)] transition-colors"
                style={{ background: "transparent", border: "1px solid var(--border)" }}
              >
                Discard
              </button>
              <button
                onClick={() => handleDraft({ regenerate: aiUsed })}
                disabled={enhancing}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-opacity"
                style={{
                  background: "transparent",
                  color: "var(--ember)",
                  border: "1px solid var(--border-ember)",
                  opacity: enhancing ? 0.6 : 1,
                }}
              >
                {enhancing ? <Loader size={11} /> : <Spark size={11} strokeWidth={1.25} />}
                {aiUsed ? "Regenerate" : "Draft with AI"}
              </button>
              <button
                onClick={onSent}
                className="px-3.5 py-1.5 rounded-md text-[12px] font-medium text-white flex items-center gap-1.5"
                style={{ background: "var(--ember)" }}
              >
                Send to family
                <SendGlyph size={11} strokeWidth={1.25} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PersonCard({
  label, name, age, city, income, community, diet,
}: {
  label: string; name: string; age: number; city: string; income: number; community: string; diet: string;
}) {
  return (
    <div
      className="p-3 rounded-md"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/40 mb-2">
        {label}
      </div>
      <div className="font-serif text-[18px] text-white leading-none mb-2 truncate" title={name}>{name}</div>
      <div className="font-mono text-[10px] text-white/55 mb-3 leading-tight truncate" title={community}>{community}</div>
      <div className="space-y-1 text-[10px] text-white/70">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-white/35 font-mono text-[9px] uppercase tracking-wider">Age</span>
          <span className="text-white font-medium">{age}y</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-white/35 font-mono text-[9px] uppercase tracking-wider">City</span>
          <span className="text-white font-medium truncate">{city}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-white/35 font-mono text-[9px] uppercase tracking-wider">Income</span>
          <span className="text-white font-medium font-mono">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-white/35 font-mono text-[9px] uppercase tracking-wider">Diet</span>
          <span className="text-white font-medium truncate" title={diet}>{diet}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="px-2 py-2.5 rounded text-center"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="font-serif text-[18px] text-white leading-none">{value}</div>
      <div className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/40 mt-1.5">{label}</div>
    </div>
  );
}
