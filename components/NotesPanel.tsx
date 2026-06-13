"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomerProfile, MatchmakerNote } from "@/lib/types";
import { Plus as PlusGlyph, Cross, Message, Trash, Send as SendGlyph } from "@/components/Glyph";
import { sounds } from "@/lib/sound";

interface Props {
  customer: CustomerProfile;
  onNotesChange: (notes: MatchmakerNote[]) => void;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-06-13T19:00:00");
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotesPanel({ customer, onNotesChange }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    const note: MatchmakerNote = {
      id: Math.random().toString(36).slice(2),
      text: t,
      timestamp: new Date("2026-06-13T19:00:00").toISOString(),
    };
    onNotesChange([note, ...customer.notes]);
    setDraft("");
    sounds.success();
  }

  function remove(id: string) {
    onNotesChange(customer.notes.filter((n) => n.id !== id));
    sounds.click();
  }

  return (
    <section
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <header className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Message size={12} strokeWidth={1.25} style={{ color: "var(--ink-muted)" }} />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] m-0" style={{ color: "var(--ink-muted)" }}>
          Matchmaker notes
        </h3>
        {customer.notes.length > 0 && (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-auto"
            style={{ background: "var(--bg-sunken)", color: "var(--ink-soft)" }}
          >
            {customer.notes.length}
          </span>
        )}
      </header>

      {/* Input row */}
      <div className="p-4 flex gap-2" style={{ borderBottom: customer.notes.length > 0 ? "1px solid var(--border)" : "none" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a quick note from a call or meeting..."
          className="flex-1 px-3.5 py-2.5 rounded-md text-[12px] outline-none transition-colors"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ember)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="px-3.5 py-2.5 rounded-md text-[12px] font-medium text-white flex items-center gap-1.5 transition-opacity"
          style={{
            background: "var(--ember)",
            opacity: draft.trim() ? 1 : 0.4,
          }}
        >
          <SendGlyph size={11} strokeWidth={1.25} />
          Add
        </button>
      </div>

      {/* Notes list */}
      {customer.notes.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Message size={20} strokeWidth={1.25} className="mx-auto mb-2" style={{ color: "var(--ink-faint)" }} />
          <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>No notes yet.</div>
          <div className="text-[11px] mt-1" style={{ color: "var(--ink-muted)" }}>
            Jot family preferences, deal-breakers, or the last conversation. They appear in your send-match composer.
          </div>
        </div>
      ) : (
        <ul className="divide-y list-none p-0 m-0" style={{ ["--tw-divide-opacity" as any]: 1 }}>
          <AnimatePresence initial={false}>
            {customer.notes.map((note) => (
              <motion.li
                key={note.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="group flex items-start gap-3 px-5 py-3.5 transition-colors"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: "var(--ember)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] leading-[1.5]" style={{ color: "var(--ink)" }}>
                    {note.text}
                  </p>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.1em] mt-1.5"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    {timeAgo(note.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => remove(note.id)}
                  className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  style={{ color: "var(--ink-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ember)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-faint)")}
                  aria-label="Delete note"
                  title="Delete"
                >
                  <Trash size={12} strokeWidth={1.25} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
