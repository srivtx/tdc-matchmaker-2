"use client";

import { MatchScore } from "@/lib/types";
import { calculateAge } from "@/lib/utils";
import { motion } from "framer-motion";
import { X, Sparkles, Zap, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { RadarChart } from "./RadarChart";
import { ProfileAvatar } from "./ProfileAvatar";
import { useTheme } from "@/lib/theme";
import { useEffect } from "react";

interface Props {
  match: MatchScore;
  customerName: string;
  onClose: () => void;
}

const dimensionLabels: Record<string, string> = {
  ageCompatibility: "Age Compatibility",
  incomeCompatibility: "Income Match",
  heightCompatibility: "Height Match",
  educationCompatibility: "Education",
  valuesAlignment: "Values Alignment",
  lifestyleCompatibility: "Lifestyle",
  religionCasteBonus: "Community",
  languageOverlap: "Language Overlap",
  locationCompatibility: "Location",
  familyCompatibility: "Family Compatibility",
};

function ScoreBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-sky-500" : score >= 40 ? "bg-amber-500" : "bg-zinc-600";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-zinc-500 w-32 flex-shrink-0 text-right font-mono">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] text-zinc-400 font-mono tabular-nums w-8">{score}</span>
    </div>
  );
}

export function BreakdownModal({ match, customerName, onClose }: Props) {
  const { profile, totalScore, breakdown, explanation, aiEnhanced } = match;
  const age = calculateAge(profile.dateOfBirth);
  const tier = totalScore >= 85 ? "Excellent" : totalScore >= 70 ? "High" : totalScore >= 50 ? "Good" : "Okay";
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const tierColors: Record<string, string> = isLight ? {
    Excellent: "text-emerald-700 bg-emerald-50 border-emerald-200",
    High: "text-sky-700 bg-sky-50 border-sky-200",
    Good: "text-amber-700 bg-amber-50 border-amber-200",
    Okay: "text-zinc-600 bg-zinc-100 border-zinc-200",
  } : {
    Excellent: "text-emerald-400 bg-emerald-950/30 border-emerald-800/50",
    High: "text-sky-400 bg-sky-950/30 border-sky-800/50",
    Good: "text-amber-400 bg-amber-950/30 border-amber-800/50",
    Okay: "text-zinc-500 bg-neutral-900/30 border-neutral-700/50",
  };

  const sortedBreakdown = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a);

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
        className="w-full max-w-2xl block-elevated overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-neutral-950/90 backdrop-blur-xl z-10"
             style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <h3 className="font-mono text-sm font-semibold text-white">Match Breakdown</h3>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${tierColors[tier]}`}>
              {totalScore}% — {tier}
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn p-1.5 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-neutral-800 focus:outline-none">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Profile summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-950/50 border border-white/5">
            <ProfileAvatar
              avatar={profile.avatar}
              firstName={profile.firstName}
              lastName={profile.lastName}
              gender={profile.gender}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white">{profile.firstName} {profile.lastName}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{age} years · {profile.gender} · {profile.religion}</div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><MapPin size={10} /> {profile.city}</span>
                <span className="flex items-center gap-1"><Briefcase size={10} /> {profile.designation}</span>
                <span className="flex items-center gap-1"><GraduationCap size={10} /> {profile.degree}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-zinc-500">Match with</div>
              <div className="text-sm font-semibold text-white font-mono">{customerName}</div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="flex justify-center">
            <RadarChart breakdown={breakdown} size={240} />
          </div>

          {/* Score Bars */}
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-3">Dimension Breakdown</div>
            <div className="space-y-2.5">
              {sortedBreakdown.map(([key, score], i) => (
                <ScoreBar
                  key={key}
                  label={dimensionLabels[key] || key}
                  score={score}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="p-4 rounded-xl bg-neutral-950/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              {aiEnhanced ? (
                <Sparkles size={13} className="text-rose-400" />
              ) : (
                <Zap size={13} className="text-zinc-600" />
              )}
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {aiEnhanced ? "AI-Enhanced Analysis" : "Compatibility Analysis"}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-neutral-950/30">
          <button onClick={onClose} className="hud-button w-full !py-2.5 !text-xs">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
