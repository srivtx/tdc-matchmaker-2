"use client";

import { MatchScore } from "@/lib/types";
import { calculateAge } from "@/lib/utils";
import { MapPin, Briefcase, GraduationCap, Ruler, Heart, Languages, Sparkles, Zap, Send } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { ProfileAvatar } from "./ProfileAvatar";
import { useTheme } from "@/lib/theme";

interface Props {
  match: MatchScore;
  onSendMatch: () => void;
  rank: number;
  onViewDetails?: () => void;
}

export function MatchCard({ match, onSendMatch, rank, onViewDetails }: Props) {
  const { profile, totalScore, breakdown, explanation, aiEnhanced } = match;
  const age = calculateAge(profile.dateOfBirth);

  const tier = totalScore >= 85 ? "Excellent" : totalScore >= 70 ? "High" : totalScore >= 50 ? "Good" : "Okay";
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const tierColors: Record<string, { text: string; bg: string; border: string }> = isLight ? {
    Excellent: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    High: { text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
    Good: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    Okay: { text: "text-zinc-500", bg: "bg-zinc-100", border: "border-zinc-200" },
  } : {
    Excellent: { text: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-800/50" },
    High: { text: "text-sky-400", bg: "bg-sky-950/30", border: "border-sky-800/50" },
    Good: { text: "text-amber-400", bg: "bg-amber-950/30", border: "border-amber-800/50" },
    Okay: { text: "text-zinc-500", bg: "bg-neutral-900/30", border: "border-neutral-700/50" },
  };
  const tc = tierColors[tier];

  const topReasons = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, val]) => {
      const labels: Record<string, string> = {
        ageCompatibility: "Age", incomeCompatibility: "Income", heightCompatibility: "Height",
        educationCompatibility: "Education", valuesAlignment: "Values", lifestyleCompatibility: "Lifestyle",
        religionCasteBonus: "Community", languageOverlap: "Language", locationCompatibility: "Location",
        familyCompatibility: "Family",
      };
      return { label: labels[key] || key, score: val };
    });

  return (
    <div className={`block-elevated p-4 group card-lift hover:border-white/12 hover-glow ${totalScore >= 85 ? 'excellent-shimmer' : ''}`}>
      {/* Header: Avatar + Name + Score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ProfileAvatar
            avatar={profile.avatar}
            firstName={profile.firstName}
            lastName={profile.lastName}
            gender={profile.gender}
            size="sm"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">
                {profile.firstName} {profile.lastName}
              </h4>
              <span className="text-[10px] text-zinc-600 font-mono flex-shrink-0">#{rank}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
              <MapPin size={10} className="text-zinc-600 flex-shrink-0" />
              <span className="truncate">{profile.city}</span>
              <span className="text-zinc-700">·</span>
              <span>{age}y</span>
              <span className="text-zinc-700">·</span>
              <span className="truncate">{profile.religion}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <ScoreRing score={totalScore} size={42} strokeWidth={3} />
          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${tc.border} ${tc.bg} ${tc.text}`}>
            {tier}
          </span>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2.5 text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <GraduationCap size={10} className="text-zinc-600 flex-shrink-0" />
          <span className="truncate">{profile.degree}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Ruler size={10} className="text-zinc-600 flex-shrink-0" />
          {profile.height} cm
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Briefcase size={10} className="text-zinc-600 flex-shrink-0" />
          <span className="truncate">{profile.designation}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Languages size={10} className="text-zinc-600 flex-shrink-0" />
          <span className="truncate">{profile.languagesKnown.join(", ")}</span>
        </div>
      </div>

      {/* Top Match Reasons */}
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        {topReasons.map((r) => (
          <span
            key={r.label}
            className="text-[10px] px-1.5 py-0.5 rounded border border-white/5 bg-neutral-950/50 text-zinc-400 inline-flex items-center gap-1"
          >
            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${r.score >= 80 ? "bg-emerald-400" : r.score >= 60 ? "bg-sky-400" : "bg-amber-400"}`} />
            {r.label}
          </span>
        ))}
      </div>

      {/* AI Explanation */}
      <div className="flex items-start gap-2 mb-3.5 p-2.5 rounded-lg bg-neutral-950/30 border border-white/[0.04]">
        {aiEnhanced ? (
          <Sparkles size={11} className="text-rose-400 mt-0.5 flex-shrink-0" />
        ) : (
          <Zap size={11} className="text-zinc-600 mt-0.5 flex-shrink-0" />
        )}
        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{explanation}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg transition-all font-mono"
            style={{
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
            }}
          >
            Details
          </button>
        )}
        <button
          onClick={onSendMatch}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all active:translate-y-px font-mono"
          style={{
            background: 'var(--brand-gradient)',
            color: isLight ? '#fff' : '#000',
          }}
        >
          <Send size={11} />
          <span>Send Match</span>
        </button>
      </div>
    </div>
  );
}
