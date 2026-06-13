"use client";

import { PoolProfile } from "@/lib/types";
import { calculateAge } from "@/lib/utils";
import { motion } from "framer-motion";
import { X, Mail, MapPin, Briefcase, Send, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileAvatar } from "./ProfileAvatar";

interface Props {
  profile: PoolProfile;
  customerName: string;
  matchExplanation?: string;
  cachedEmail?: string;
  onEmailGenerated?: (text: string) => void;
  onIntroGenerated?: (intro: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function MatchModal({ profile, customerName, matchExplanation, cachedEmail, onEmailGenerated, onIntroGenerated, onClose, onConfirm }: Props) {
  const age = calculateAge(profile.dateOfBirth);
  const [aiEmail, setAiEmail] = useState<string | null>(cachedEmail || null);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const callGroq = async (prompt: string) => {
    const key = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  };

  const enhanceEmail = async () => {
    setEnhancing(true);
    try {
      let intro = matchExplanation || "";

      if (!intro) {
        intro = await callGroq(
          "Write ONE sentence why " + customerName + " and " + profile.firstName + " are a good match. " +
          profile.firstName + ": " + age + "yr, " + profile.religion + ", " + profile.designation + " from " + profile.city + ". " +
          "Only the sentence, nothing else."
        );
        onIntroGenerated?.(intro);
      }

      const emailBody = await callGroq(
        "Write a brief 2-sentence email intro matchmaker sends to " + profile.firstName + " about meeting " + customerName + ". " +
        "Compatibility: " + intro + " Keep it short, warm, professional. No salutation or sign-off."
      );

      setAiEmail(emailBody);
      onEmailGenerated?.(emailBody);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-lg block-elevated overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <h3 className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Send Match Introduction</h3>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn p-1.5 transition-colors rounded-md focus:outline-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Profile Summary Card */}
          <div
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-inset)', borderColor: 'var(--border-default)' }}
          >
            <ProfileAvatar
              avatar={profile.avatar}
              firstName={profile.firstName}
              lastName={profile.lastName}
              gender={profile.gender}
              size="md"
            />
            <div>
              <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {age} years · {profile.gender} · {profile.religion}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><MapPin size={10} style={{ color: 'var(--text-tertiary)' }} /> {profile.city}</span>
                <span className="flex items-center gap-1"><Briefcase size={10} style={{ color: 'var(--text-tertiary)' }} /> {profile.designation}</span>
              </div>
            </div>
          </div>

          {/* Email Preview Card */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-inset)', borderColor: 'var(--border-default)' }}
          >
            {/* Inner Header */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-default)' }}
            >
              <Mail size={13} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-secondary)' }}>
                Email Preview
              </span>
            </div>

            {/* Inner Details */}
            <div className="p-4 space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-tertiary)' }}>From:</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>tdc@thedatecrew.com</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-tertiary)' }}>To:</span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{profile.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-tertiary)' }}>Subject:</span>
                <span className="text-xs ml-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Introduction — {customerName} &amp; {profile.firstName}
                </span>
              </div>
              <div className="h-px my-1" style={{ backgroundColor: 'var(--border-default)' }} />
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <p className="mb-2">Dear {profile.firstName},</p>
                <p className="mb-2">
                  We hope this message finds you well. Based on your preferences and our compatibility assessment,
                  we&apos;d like to introduce you to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{customerName}</span>.
                </p>
                {aiEmail ? (
                  <p className="mb-2">{aiEmail}</p>
                ) : (
                  <p className="mb-2">
                    We believe you share compatible values around family, education, and lifestyle.
                    We think this could be a meaningful connection worth exploring.
                  </p>
                )}
                <p className="mb-2">
                  If you&apos;re interested in learning more, simply reply to this email and
                  we&apos;ll facilitate the introduction at your convenience.
                </p>
                <p className="mt-4">
                  Warm regards,<br />
                  <span className="font-medium" style={{ color: 'var(--accent-rose)' }}>The Date Crew</span> Matchmaking Team
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={enhanceEmail}
                  disabled={enhancing}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-rose-800/40 bg-rose-950/20 text-rose-400 hover:border-rose-600/50 transition-all disabled:opacity-50"
                  title={aiEmail ? "Regenerate" : "Enhance with AI"}
                >
                    {enhancing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5 border-t flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-inset)', borderColor: 'var(--border-default)' }}
        >
          <button onClick={onClose} className="hud-button flex-1 !py-2.5 !text-xs">
            Cancel
          </button>
          <button onClick={onConfirm} className="hud-button hud-button-primary flex-1 !py-2.5 !text-xs">
            Confirm & Send <Send size={13} className="ml-0.5 -mt-[1px]" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
