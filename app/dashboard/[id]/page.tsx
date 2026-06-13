"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { customers, malePool, femalePool } from "@/data/profiles";
import { getMatchesForCustomer } from "@/lib/matching";
import { enhanceMatchWithAI } from "@/lib/ai";
import { MatchScore, CustomerProfile } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";
import { CompareCanvas } from "@/components/CompareCanvas";
import { MatchRail } from "@/components/MatchRail";
import { CustomerRail } from "@/components/CustomerRail";
import { JourneyStepper } from "@/components/JourneyStepper";
import { MatchComposer } from "@/components/MatchComposer";
import { ArrowLeft, Spark, Loader, Send as SendGlyph, Cross } from "@/components/Glyph";
import { NotesPanel } from "@/components/NotesPanel";
import Nav from "@/components/Nav";
import { sounds } from "@/lib/sound";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [cachedEmails, setCachedEmails] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<CustomerProfile["notes"]>([]);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    const found = customers.find((c) => c.id === id);
    if (!found) { router.replace("/dashboard"); return; }
    setNotes(found.notes);

    const t1 = setTimeout(() => setLoading(false), 250);
    const t2 = setTimeout(() => {
      const pool = found.gender === "Male" ? femalePool : malePool;
      setMatches(getMatchesForCustomer(found, pool, 15));
      setMatchLoading(false);
    }, 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [id, isAuthenticated, router]);

  const customer = useMemo(
    () => customers.find((c) => c.id === id) ? { ...customers.find((c) => c.id === id)!, notes } : null,
    [id, notes]
  );
  const selected = matches[selectedIdx] ?? null;

  // Keyboard: ↑↓/jk to navigate matches, ⌘+Enter to send
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (composerOpen) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, Math.max(matches.length - 1, 0)));
        sounds.tick();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
        sounds.tick();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (selected) {
          sounds.click();
          setComposerOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [matches.length, selected, composerOpen]);

  const handleEnhance = useCallback(async () => {
    if (!customer || aiEnhanced) return;
    setAiEnhancing(true);
    try {
      const enhanced = await enhanceMatchWithAI(matches, `${customer.firstName} ${customer.lastName}`);
      const n = enhanced.filter((m) => m.aiEnhanced).length;
      if (n === 0) {
        show("warning", "AI unavailable — add Groq or OpenRouter key to .env.local");
      } else {
        setMatches(enhanced);
        setAiEnhanced(true);
        show("success", `AI enhanced ${n} match explanation${n !== 1 ? "s" : ""}`);
        sounds.success();
      }
    } catch {
      show("warning", "AI enhancement failed");
      sounds.error();
    } finally {
      setAiEnhancing(false);
    }
  }, [matches, customer, aiEnhanced, show]);

  if (!isAuthenticated || !customer) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Nav />

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 flex flex-col gap-3">
        <button
          onClick={() => { sounds.click(); router.push("/dashboard"); }}
          className="flex items-center gap-1.5 text-[11px] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] transition-colors self-start font-mono"
        >
          <ArrowLeft size={11} strokeWidth={1.25} /> Back to workspace
        </button>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,280px)_1fr_minmax(300px,340px)] gap-4">
            <Skeleton className="h-[600px] rounded-lg" />
            <Skeleton className="h-[600px] rounded-lg" />
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        ) : (
          <div
            className="grid gap-4 grid-cols-1 lg:grid-cols-[minmax(260px,280px)_1fr_minmax(300px,340px)]"
            style={{ alignItems: "stretch" }}
          >
            {/* LEFT RAIL — customer */}
            <aside
              className="v2-side-scroll rounded-lg p-5 overflow-y-auto lg:sticky lg:top-[72px]"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                alignSelf: "start",
                maxHeight: "calc(100vh - 100px)",
              }}
            >
              <CustomerRail customer={customer} />
              <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-3 m-0">
                  Journey
                </h5>
                <JourneyStepper currentStage={customer.stage} />
              </div>
            </aside>

            {/* CENTER — compare canvas */}
            <main className="min-w-0">
              {/* Compare head */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex items-baseline gap-2.5 flex-wrap min-w-0">
                  <h1
                    className="font-serif m-0 leading-none text-[color:var(--ink)]"
                    style={{ fontSize: "clamp(22px, 2.6vw, 32px)", letterSpacing: "-0.01em" }}
                  >
                    {customer.firstName}
                  </h1>
                  <span
                    className="font-serif text-[color:var(--ember)]"
                    style={{ fontSize: "clamp(18px, 2.2vw, 28px)", lineHeight: 1 }}
                    aria-hidden
                  >
                    →
                  </span>
                  <h1
                    className="font-serif m-0 leading-none truncate"
                    style={{ fontSize: "clamp(22px, 2.6vw, 32px)", letterSpacing: "-0.01em", color: "var(--ember)" }}
                  >
                    {selected ? `${selected.profile.firstName} ${selected.profile.lastName}` : "—"}
                  </h1>
                  {selected && (
                    <span className="font-mono text-[10px] text-[color:var(--ink-faint)] ml-1.5">
                      · #{selectedIdx + 1} of {matches.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col items-end mr-1 hidden sm:flex">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[color:var(--ink-faint)]">
                      Updated
                    </span>
                    <span className="font-mono text-[10px] text-[color:var(--ink-muted)]">
                      just now
                    </span>
                  </div>
                  {!aiEnhanced ? (
                    <button
                      onClick={handleEnhance}
                      disabled={aiEnhancing}
                      className="px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--ink-soft)",
                        opacity: aiEnhancing ? 0.6 : 1,
                      }}
                    >
                      {aiEnhancing ? <Loader size={11} /> : <Spark size={11} strokeWidth={1.25} />}
                      {aiEnhancing ? "Enhancing…" : "Enhance with AI"}
                    </button>
                  ) : (
                    <div
                      className="px-3 py-1.5 rounded-md text-[11px] font-mono flex items-center gap-1.5"
                      style={{ background: "var(--moss-soft)", color: "var(--moss)", border: "1px solid var(--moss)" }}
                    >
                      <Spark size={11} strokeWidth={1.25} /> AI Enhanced
                    </div>
                  )}
                  <button
                    onClick={() => { sounds.click(); setComposerOpen(true); }}
                    disabled={!selected}
                    className="px-3 sm:px-4 py-1.5 rounded-md text-[12px] font-semibold text-white flex items-center gap-1.5 transition-opacity"
                    style={{ background: "var(--ember)", opacity: selected ? 1 : 0.5 }}
                  >
                    Send match <SendGlyph size={11} strokeWidth={1.25} />
                  </button>
                </div>
              </div>

              {matchLoading || !selected ? (
                <Skeleton className="h-[600px] rounded-lg" />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.profile.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CompareCanvas customer={customer} match={selected} />
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="mt-4">
                <NotesPanel customer={customer} onNotesChange={setNotes} />
              </div>

              {/* Journey stepper — its own card on mobile (since the left rail
                  hides it on small screens), embedded in the left rail on lg+ */}
              <div className="mt-4 md:hidden">
                <div
                  className="rounded-lg p-5"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-3 m-0">
                    Journey
                  </h5>
                  <JourneyStepper currentStage={customer.stage} />
                </div>
              </div>
            </main>

            {/* RIGHT RAIL — matches */}
            <aside
              className="rounded-lg overflow-hidden flex flex-col lg:sticky lg:top-[72px]"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                alignSelf: "start",
                maxHeight: "calc(100vh - 100px)",
              }}
            >
              <MatchRail
                matches={matches}
                selectedIdx={selectedIdx}
                onSelect={(i) => { setSelectedIdx(i); sounds.click(); }}
                loading={matchLoading}
              />
            </aside>
          </div>
        )}
      </div>

      <AnimatePresence>
        {composerOpen && selected && customer && (
          <MatchComposer
            customer={customer}
            match={selected}
            cachedEmail={cachedEmails[selected.profile.id]}
            onEmailGenerated={(t) =>
              setCachedEmails((prev) => ({ ...prev, [selected.profile.id]: t }))
            }
            onClose={() => { sounds.click(); setComposerOpen(false); }}
            onSent={() => {
              sounds.success();
              show("success", `Match introduction sent to ${selected.profile.firstName}!`);
              setComposerOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
