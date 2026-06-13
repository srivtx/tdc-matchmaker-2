"use client";

import { CustomerProfile } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, calculateAge } from "@/lib/utils";
import { ProfileAvatar } from "./ProfileAvatar";
import { ChevronRight, MapPin, Briefcase, GraduationCap } from "lucide-react";

interface Props {
  customer: CustomerProfile;
  onClick: () => void;
}

export function CustomerCard({ customer, onClick }: Props) {
  const age = calculateAge(customer.dateOfBirth);
  const isMale = customer.gender === "Male";

  const stageAccentColors: Record<string, string> = {
    "New Lead": "bg-zinc-600",
    "Profile Created": "bg-amber-500",
    "Verification Pending": "bg-amber-500",
    "Verified": "bg-emerald-500",
    "Preferences Set": "bg-sky-500",
    "Actively Matching": "bg-rose-500",
    "First Meeting Scheduled": "bg-rose-500",
    "In Discussion": "bg-violet-500",
    "On Hold": "bg-zinc-500",
    "Matched": "bg-emerald-500",
  };

  const accentColor = stageAccentColors[customer.stage] || "bg-zinc-600";

  return (
    <button
      onClick={onClick}
      className="w-full text-left block-square px-5 py-4 group card-lift hover:border-white/12 active:translate-y-[1px] relative overflow-hidden hover-glow"
    >
      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${accentColor} opacity-30 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between gap-4 pl-2">
        <div className="flex items-center gap-4 min-w-0">
          <ProfileAvatar
            avatar={customer.avatar}
            firstName={customer.firstName}
            lastName={customer.lastName}
            gender={customer.gender}
            size="md"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-white truncate">
                {customer.firstName} {customer.lastName}
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0 tabular-nums">
                {age}y
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={10} className="text-zinc-600" />
                {customer.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={10} className="text-zinc-600" />
                {customer.designation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex flex-col items-end">
            <StatusBadge stage={customer.stage} />
            <span className="text-[10px] text-zinc-600 font-mono mt-0.5">
              {formatCurrency(customer.income)} · {customer.religion}
            </span>
          </div>
          <ChevronRight size={15} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}
