"use client";

import { useState } from "react";
import { CustomerProfile } from "@/lib/types";
import { calculateAge, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Chevron } from "@/components/Glyph";
import { JourneyStepper } from "./JourneyStepper";

interface Props { customer: CustomerProfile }

export function CustomerRail({ customer }: Props) {
  const age = calculateAge(customer.dateOfBirth);
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Mobile: photo + name + key meta side by side. md+: stacked centered */}
      <div className="flex items-center md:flex-col md:items-center gap-4 md:gap-0 mb-2 md:mb-4">
        <ProfileAvatar
          avatar={customer.avatar}
          firstName={customer.firstName}
          lastName={customer.lastName}
          gender={customer.gender}
          size={140}
          className="md:[&]:w-[140px] md:[&]:h-[140px] flex-shrink-0"
        />
        <div className="md:hidden flex-1 min-w-0">
          <h2
            className="font-serif m-0 leading-tight text-[color:var(--ink)] truncate"
            style={{ fontSize: 22, letterSpacing: "-0.01em" }}
          >
            {customer.firstName} {customer.lastName}
          </h2>
          <div className="text-[11px] text-[color:var(--ink-muted)] mt-1 truncate">
            {age}y · {customer.city}
          </div>
          <div className="mt-2">
            <StatusBadge stage={customer.stage} />
          </div>
        </div>
      </div>

      {/* md+ full name (mobile version is in the row above) */}
      <h2
        className="hidden md:block font-serif m-0 leading-none text-[color:var(--ink)]"
        style={{ fontSize: 26, letterSpacing: "-0.01em" }}
      >
        {customer.firstName} {customer.lastName}
      </h2>
      <div className="hidden md:block text-[11px] text-[color:var(--ink-muted)] mt-1.5">
        {age}y · {customer.city} · {customer.designation}
      </div>

      <div className="mt-3 hidden md:block">
        <StatusBadge stage={customer.stage} />
      </div>

      {/* Expand toggle — only on mobile. The full biodata + journey
          is hidden behind this on small screens to keep the page scannable. */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="md:hidden w-full mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--ink-muted)] py-2 px-1"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span>{expanded ? "Hide" : "Show"} full profile</span>
        <Chevron
          size={10}
          strokeWidth={1.25}
          className="transition-transform"
          style={{ transform: expanded ? "rotate(-90deg)" : "rotate(90deg)" }}
        />
      </button>

      <div
        className="mt-2 space-y-0"
        style={{ display: expanded ? undefined : undefined }}
      >
        {/* Mobile: only show the MOST important 3 facts when collapsed;
            show all 7 when expanded. md+: always show all 7. */}
        <div className={expanded ? "" : "md:block hidden"}>
          {[
            ["Income",     <span className="font-mono">{formatCurrency(customer.income)}</span>],
            ["Height",     <span className="font-mono">{customer.height} cm</span>],
            ["Education",  `${customer.degree}, ${customer.undergradCollege.split(" ").slice(0, 3).join(" ")}`],
            ["Community",  `${customer.religion} · ${customer.caste}`],
            ["Diet",       customer.diet],
            ["Languages",  customer.languagesKnown.join(", ")],
            ["Relocates",  (
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] flex items-center gap-1.5 justify-end">
                {customer.openToRelocate === "Yes" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--moss)" }} />
                    Open to relocate
                  </>
                )}
                {customer.openToRelocate === "Maybe" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--honey)" }} />
                    Case by case
                  </>
                )}
                {customer.openToRelocate === "No" && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ink-faint)" }} />
                    Local only
                  </>
                )}
              </span>
            )],
          ].map(([k, v]) => (
            <div
              key={k as string}
              className="flex items-center justify-between py-2 text-[11px]"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-[color:var(--ink-muted)]">{k}</span>
              <span className="text-[color:var(--ink)] font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Mobile: 3-row summary when collapsed */}
        <div className="md:hidden">
          {(!expanded) && (
            <>
              {[
                ["Income", <span className="font-mono">{formatCurrency(customer.income)}</span>],
                ["Community", `${customer.religion} · ${customer.caste}`],
                ["Relocates", (
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] flex items-center gap-1.5 justify-end">
                    {customer.openToRelocate === "Yes" && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--moss)" }} />
                        Yes
                      </>
                    )}
                    {customer.openToRelocate === "Maybe" && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--honey)" }} />
                        Maybe
                      </>
                    )}
                    {customer.openToRelocate === "No" && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--ink-faint)" }} />
                        No
                      </>
                    )}
                  </span>
                )],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="flex items-center justify-between py-2 text-[11px]"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span className="text-[color:var(--ink-muted)]">{k}</span>
                  <span className="text-[color:var(--ink)] font-medium text-right">{v}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* About blurb — always visible */}
      {customer.about && (
        <div
          className="mt-4 p-3 rounded text-[11px] leading-[1.6] text-[color:var(--ink-soft)] italic"
          style={{
            background: "var(--bg-sunken)",
            borderLeft: "2px solid var(--ember)",
          }}
        >
          {customer.about}
        </div>
      )}

      {/* Journey stepper — only on md+ on this card. On mobile it lives
          in its own compact card below the compare canvas (see detail page). */}
      <div className="mt-5 pt-5 hidden md:block" style={{ borderTop: "1px solid var(--border)" }}>
        <h5 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-3 m-0">
          Journey
        </h5>
        <JourneyStepper currentStage={customer.stage} />
      </div>
    </div>
  );
}
