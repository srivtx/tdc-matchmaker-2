"use client";

import Image from "next/image";

interface Props {
  avatar?: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  size?: number | "sm" | "md" | "lg";
  className?: string;
}

const legacySizes = {
  sm: 40,
  md: 48,
  lg: 80,
};

function resolveSize(s: number | "sm" | "md" | "lg" | undefined): number {
  if (s === undefined) return 40;
  if (typeof s === "number") return s;
  return legacySizes[s];
}

export function ProfileAvatar({
  avatar,
  firstName,
  lastName,
  gender,
  size = 40,
  className = "",
}: Props) {
  const isMale = gender === "Male";
  const dim = resolveSize(size);
  const fontSize = Math.round(dim * 0.36);
  const fallbackBg = isMale
    ? "linear-gradient(135deg, #4a6b8a, #2a4a6a)"
    : "linear-gradient(135deg, #b88a7a, #8a5a4a)";
  const ringColor = isMale ? "rgba(74,107,138,0.35)" : "rgba(184,138,122,0.35)";

  if (avatar) {
    return (
      <div
        className={`relative overflow-hidden flex-shrink-0 rounded-full ${className}`}
        style={{ width: dim, height: dim, boxShadow: `0 0 0 1px ${ringColor} inset` }}
      >
        <Image
          src={avatar}
          alt={`${firstName} ${lastName}`}
          width={dim * 2}
          height={dim * 2}
          className="object-cover"
          style={{ width: dim, height: dim }}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-serif flex-shrink-0 ${className}`}
      style={{
        width: dim,
        height: dim,
        background: fallbackBg,
        color: "#fff",
        fontSize,
        lineHeight: 1,
        boxShadow: `0 0 0 1px ${ringColor} inset`,
      }}
    >
      {firstName[0]}
    </div>
  );
}
