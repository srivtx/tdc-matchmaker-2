'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e'; // emerald-500
  if (score >= 70) return '#0ea5e9'; // sky-500
  if (score >= 50) return '#f59e0b'; // amber-500
  return '#52525b';                  // zinc-600
}

export function ScoreRing({
  score,
  size = 44,
  strokeWidth = 3.5,
  className,
}: ScoreRingProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getScoreColor(clampedScore);
  const isLight = theme === 'light';

  const fontSize = size * 0.3;
  const percentSize = size * 0.18;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Score: ${clampedScore}%`}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isLight ? '#e5e7eb' : '#262626'}
        strokeWidth={strokeWidth}
      />

      {/* Foreground arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={mounted ? offset : circumference}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      />

      {/* Score number */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isLight ? '#18181b' : '#ffffff'}
        fontFamily="var(--font-fira-code), ui-monospace, monospace"
        fontWeight={700}
        fontSize={fontSize}
      >
        {clampedScore}
        <tspan
          fill={isLight ? '#71717a' : '#a1a1aa'}
          fontSize={percentSize}
          fontWeight={500}
        >
          %
        </tspan>
      </text>
    </svg>
  );
}
