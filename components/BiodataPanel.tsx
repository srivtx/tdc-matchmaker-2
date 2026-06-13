"use client";

import { useState, useRef } from "react";
import { CustomerProfile } from "@/lib/types";
import { calculateAge, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ProfileAvatar } from "./ProfileAvatar";
import {
  GraduationCap, Briefcase, MapPin, Phone, Mail, Ruler, Languages,
  Users, Heart, Banknote, Building2, Star, Flower, Utensils,
  Wine, CigaretteOff, Dog, Truck, Baby, Home, UserCheck, Sparkles,
  Calendar, Globe,
} from "lucide-react";

interface Props {
  customer: CustomerProfile;
}

const journeyStages = [
  "New Lead",
  "Profile Created",
  "Verified",
  "Preferences Set",
  "Actively Matching",
  "First Meeting Scheduled",
  "In Discussion",
  "Matched",
] as const;

const allStageOrder = [
  "New Lead", "Profile Created", "Verification Pending", "Verified",
  "Preferences Set", "Actively Matching", "First Meeting Scheduled",
  "In Discussion", "On Hold", "Matched",
];

type TabType = "personal" | "career" | "family" | "lifestyle";

export function BiodataPanel({ customer }: Props) {
  const age = calculateAge(customer.dateOfBirth);
  const isMale = customer.gender === "Male";
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const currentIdx = allStageOrder.indexOf(customer.stage);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = -(y - yc) / 14;
    const rotateY = (x - xc) / 18;

    card.style.setProperty("--rx", `${rotateX}deg`);
    card.style.setProperty("--ry", `${rotateY}deg`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  const tabs: { id: TabType; label: string; icon: typeof UserCheck }[] = [
    { id: "personal", label: "Personal", icon: UserCheck },
    { id: "career", label: "Education & Career", icon: GraduationCap },
    { id: "family", label: "Family & Community", icon: Heart },
    { id: "lifestyle", label: "Lifestyle", icon: Flower },
  ];

  return (
    <div className="space-y-5">
      {/* Journey Progress — Compact horizontal stepper */}
      <div className="block-elevated p-3 px-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-1 h-1 rounded-full bg-rose-400" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Journey</span>
        </div>
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar pb-0.5">
          {journeyStages.map((stage, i, arr) => {
            const thisIdx = allStageOrder.indexOf(stage);
            const isActive = stage === customer.stage;
            const isPast = thisIdx < currentIdx;
            return (
              <div key={stage} className="flex items-center gap-0.5 flex-shrink-0">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold shadow-sm shadow-rose-500/10"
                    : isPast
                    ? "bg-emerald-500/10 text-emerald-500/60 border border-emerald-500/15"
                    : "bg-neutral-900/60 text-zinc-700 border border-white/[0.03]"
                }`}>
                  {isPast && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />}
                  {stage === "Matched" ? "✓" : stage.replace("First Meeting Scheduled", "Meeting").replace("Actively ", "").replace("Profile ", "").replace("Preferences ", "Prefs ")}
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-3 h-px flex-shrink-0 ${isPast ? "bg-emerald-500/30" : "bg-white/[0.04]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Old Lanyard assembly removed */}

      {/* Main Container */}
      <div className="w-full">
        <div
          className="relative w-full block-hero p-6 lg:p-8 hover-glow border-2"
          style={{
            borderColor: 'var(--border-default)'
          }}
        >
          {/* Corner crosshairs Decal */}
          <div className="absolute top-2.5 left-2.5 text-[8px] font-mono text-zinc-500 select-none pointer-events-none">+</div>
          <div className="absolute top-2.5 right-2.5 text-[8px] font-mono text-zinc-500 select-none pointer-events-none">+</div>
          <div className="absolute bottom-2.5 left-2.5 text-[8px] font-mono text-zinc-500 select-none pointer-events-none">+</div>
          <div className="absolute bottom-2.5 right-2.5 text-[8px] font-mono text-zinc-500 select-none pointer-events-none">+</div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-8" style={{ transform: 'translateZ(10px)' }}>
            
            {/* Left Column: Pure CSS ID Card with Tilt */}
            <div className="flex flex-col items-center flex-shrink-0 mx-auto sm:mx-0 relative w-[220px] h-[350px] tilt-perspective z-10">
              
              {/* The Card that tilts */}
              <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="tilt-card id-card-surface absolute inset-0 w-full h-full rounded-[20px] overflow-hidden flex flex-col p-6"
                style={{ 
                  borderWidth: '1px',
                  transformStyle: 'preserve-3d' 
                }}
              >
                {/* Lanyard Cutout Slot */}
                <div className="w-12 h-1.5 rounded-full mx-auto mb-4 shadow-inner" style={{ transform: 'translateZ(5px)', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,0,0,0.1)' }} />

                {/* Top Row: Label & QR Code */}
                <div className="flex justify-between items-start w-full" style={{ transform: 'translateZ(10px)' }}>
                  <div className="font-mono text-[10px] font-bold text-black/70 uppercase tracking-widest mt-1">
                    TDC MEMBER
                  </div>
                  <div className="w-9 h-9 opacity-80 mix-blend-multiply">
                   <svg viewBox="0 0 29 29" className="w-full h-full" fill="#000000">
                     <path d="M0 0h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm6-2h1v1H8zm1 1h1v1H9zm-1 1h2v1H8v1h1v1H8zm1 2h1v1H9zm2-5h7v7h-7zm1 1h5v5h-5zm1 1h3v3H3zM0 22h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm21-22h5v1h-5zm0 2h1v1h-1zm1-1h1v1h-1zm2 0h1v1h-1zm-2 2h3v1h-3zm-11 5h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v2h-1zm5-4h1v1h-1zm-1 2h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm3-5h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm-15 4h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm2-4h1v1h-1zm1 1h2v1h-2zm0 2h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm3-4h1v2h-1zm1 2h2v1h-2zm0 2h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm3-5h2v1h-2zm-1 2h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-3h1v1h-1zm1 2h1v1h-1zm-1 1h2v1h-2z" />
                   </svg>
                  </div>
                </div>

                {/* Center Content: PFP, Name, Designation */}
                <div className="flex-1 flex flex-col items-center justify-center w-full" style={{ transform: 'translateZ(25px)' }}>
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-[3px] border-black/10 bg-white">
                      <ProfileAvatar
                        avatar={customer.avatar}
                        firstName={customer.firstName}
                        lastName={customer.lastName}
                        gender={customer.gender}
                        size="md"
                        className="!w-full !h-full !rounded-none object-cover"
                      />
                    </div>
                    {/* Gender indicator dot */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold ${
                      isMale ? 'bg-sky-500 text-black' : 'bg-rose-500 text-black'
                    }`}>
                      {isMale ? '♂' : '♀'}
                    </div>
                  </div>
                  
                  <h3 className="font-mono font-bold text-xl text-black leading-none tracking-tight text-center">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <div className="font-mono font-bold text-[10px] text-black/60 mt-2 uppercase tracking-[0.1em] text-center">
                    {customer.designation}
                  </div>
                </div>
                
                {/* Bottom Row: Barcode */}
                <div className="w-full flex justify-center pb-1 opacity-80" style={{ transform: 'translateZ(5px)' }}>
                  <div className="flex gap-[2px] h-6 w-32 justify-center items-end mix-blend-multiply">
                    {Array.from({ length: 26 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="rounded-t-[1px]"
                        style={{ 
                          backgroundColor: '#000000',
                          width: `${(idx % 5 === 0 ? 3 : idx % 3 === 0 ? 1 : 2)}px`, 
                          height: `${(idx % 4 === 0 ? 100 : 75)}%` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Name, Stats, Badges, Decals */}
            <div className="flex-1 min-w-0 flex flex-col relative z-10">
              
              {/* Top Group: Header, Stats, Badges */}
              <div className="space-y-4 mb-5">
                {/* Header Title Row with verified QR code */}
                <div className="flex items-start justify-between gap-4 relative">
                  <div className="min-w-0">
                    {/* Card Title Label */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <span>TDC MEMBER // SECURE PIPELINE</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold font-mono tracking-tight text-white mb-1">
                      {customer.firstName} {customer.lastName}
                    </h1>
                    <div className="inline-block mt-1">
                      <StatusBadge stage={customer.stage} />
                    </div>
                  </div>

                  {/* Verified QR Code */}
                  <div className="flex flex-col items-center justify-center bg-white p-1 rounded border border-zinc-200 dark:border-zinc-800 flex-shrink-0 self-start shadow-sm select-none pointer-events-none">
                    <svg width="40" height="40" viewBox="0 0 29 29" fill="#000000">
                      <path d="M0 0h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm6-2h1v1H8zm1 1h1v1H9zm-1 1h2v1H8v1h1v1H8zm1 2h1v1H9zm2-5h7v7h-7zm1 1h5v5h-5zm1 1h3v3H3zM0 22h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm21-22h5v1h-5zm0 2h1v1h-1zm1-1h1v1h-1zm2 0h1v1h-1zm-2 2h3v1h-3zm-11 5h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v2h-1zm5-4h1v1h-1zm-1 2h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm3-5h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm-15 4h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm2-4h1v1h-1zm1 1h2v1h-2zm0 2h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm3-4h1v2h-1zm1 2h2v1h-2zm0 2h1v1h-1zm2-3h1v1h-1zm1 1h1v1h-1zm-1 1h1v1h-1zm1 1h1v1h-1zm3-5h2v1h-2zm-1 2h1v1h-1zm2 0h1v1h-1zm-2 1h1v1h-1zm1 1h1v1h-1zm1-3h1v1h-1zm1 2h1v1h-1zm-1 1h2v1h-2z" />
                    </svg>
                    <span className="text-[8px] font-mono text-zinc-800 mt-0.5 uppercase tracking-wider font-bold">VERIFIED</span>
                  </div>
                </div>

                {/* Monospace Info Row */}
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap relative">
                  {/* Visual Sparkles */}
                  <svg width="8" height="8" viewBox="0 0 10 10" className="text-amber-400 fill-amber-400 absolute -top-3 left-24 animate-pulse">
                    <path d="M5,0 L6,4 L10,5 L6,6 L5,10 L4,6 L0,5 L4,4 Z" />
                  </svg>
                  <svg width="6" height="6" viewBox="0 0 10 10" className="text-rose-400 fill-rose-400 absolute -bottom-2.5 right-12 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <path d="M5,0 L6,4 L10,5 L6,6 L5,10 L4,6 L0,5 L4,4 Z" />
                  </svg>

                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-zinc-600" />
                    {age}y
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-zinc-600" />
                    {customer.city}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} className="text-zinc-600" />
                    {customer.designation}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Banknote size={11} className="text-zinc-600" />
                    {formatCurrency(customer.income)}
                  </span>
                </div>

                {/* Info Badges */}
                <div className="flex items-center gap-1.5 flex-wrap font-mono select-none">
                  <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                    {customer.religion} · {customer.caste}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                    {customer.maritalStatus === "Never Married" ? "Single" : customer.maritalStatus}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                    {customer.height}cm
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                    {customer.degree}
                  </span>
                </div>
              </div>

              {/* About Quote inside a retro dashed box */}
              <div
                className="p-3.5 rounded-xl border border-dashed relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(244,114,182,0.02), rgba(251,191,36,0.02))',
                  borderColor: 'var(--border-hover)',
                  marginBottom: 0
                }}
              >
                <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{customer.about}&rdquo;
                </p>
                {/* Micro Sparkle */}
                <div className="absolute right-2 bottom-2 opacity-30">✦</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Details Section */}
      <div className="block-elevated overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-mono whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? "text-rose-400 border-rose-400 bg-rose-500/[0.04]"
                    : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]"
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: Mail, label: "Email", value: customer.email },
                { icon: Phone, label: "Phone", value: customer.phone },
                { icon: MapPin, label: "Location", value: `${customer.city}, ${customer.country}` },
                { icon: Ruler, label: "Height", value: `${customer.height} cm` },
                { icon: Languages, label: "Languages", value: customer.languagesKnown.join(", ") },
                { icon: Globe, label: "Country", value: customer.country },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-zinc-600 uppercase mb-0.5">{f.label}</div>
                      <div className="text-sm text-zinc-200 truncate">{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "career" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: GraduationCap, label: "Degree", value: customer.degree },
                { icon: Building2, label: "College", value: customer.undergradCollege },
                { icon: Briefcase, label: "Company", value: customer.currentCompany },
                { icon: Star, label: "Designation", value: customer.designation },
                { icon: Banknote, label: "Annual Income", value: formatCurrency(customer.income) },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-zinc-600 uppercase mb-0.5">{f.label}</div>
                      <div className="text-sm text-zinc-200 truncate">{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "family" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: Heart, label: "Religion", value: customer.religion },
                { icon: Users, label: "Caste", value: customer.caste },
                { icon: Home, label: "Family Type", value: `${customer.familyType} Family` },
                { icon: Briefcase, label: "Father's Occupation", value: customer.fatherOccupation },
                { icon: Briefcase, label: "Mother's Occupation", value: customer.motherOccupation },
                { icon: Users, label: "Siblings", value: `${customer.siblings}` },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-zinc-600 uppercase mb-0.5">{f.label}</div>
                      <div className="text-sm text-zinc-200 truncate">{f.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "lifestyle" && (
            <div className="space-y-5">
              {/* Preferences Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Baby, label: "Want Kids", value: customer.wantKids },
                  { icon: Truck, label: "Relocate", value: customer.openToRelocate },
                  { icon: Dog, label: "Pets", value: customer.openToPets },
                  { icon: Utensils, label: "Diet", value: customer.diet },
                  { icon: Wine, label: "Drink", value: customer.drink },
                  { icon: CigaretteOff, label: "Smoke", value: customer.smoke },
                ].map((p) => {
                  const Icon = p.icon;
                  const isYes = p.value === "Yes";
                  const isNo = p.value === "No";
                  return (
                    <div key={p.label} className="p-3.5 rounded-xl bg-neutral-950/40 border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={13} className="text-zinc-500" />
                        <span className="text-[11px] text-zinc-400">{p.label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg inline-block ${
                        isYes ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50" :
                        isNo ? "bg-rose-950/50 text-rose-400 border border-rose-800/50" :
                        "bg-amber-950/50 text-amber-400 border border-amber-800/50"
                      }`}>
                        {p.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hobbies */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Interests & Hobbies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customer.hobbies.map((h) => (
                    <span key={h} className="text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] text-zinc-300 hover:border-rose-500/20 hover:text-rose-300 transition-colors cursor-default">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
