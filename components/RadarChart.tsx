'use client';

import { motion } from 'framer-motion';
import { MatchBreakdown } from '@/lib/types';
import { useTheme } from '@/lib/theme';

interface RadarChartProps {
  breakdown: MatchBreakdown;
  size?: number;
  className?: string;
}

const DIMENSIONS: { key: keyof MatchBreakdown; label: string }[] = [
  { key: 'ageCompatibility', label: 'Age' },
  { key: 'incomeCompatibility', label: 'Income' },
  { key: 'heightCompatibility', label: 'Height' },
  { key: 'educationCompatibility', label: 'Edu' },
  { key: 'valuesAlignment', label: 'Values' },
  { key: 'lifestyleCompatibility', label: 'Lifestyle' },
  { key: 'religionCasteBonus', label: 'Community' },
  { key: 'languageOverlap', label: 'Language' },
  { key: 'locationCompatibility', label: 'Location' },
  { key: 'familyCompatibility', label: 'Family' },
];

const AXIS_COUNT = DIMENSIONS.length;
const ANGLE_STEP = (2 * Math.PI) / AXIS_COUNT;
// Start from top (–π/2) so first axis points straight up
const START_ANGLE = -Math.PI / 2;

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  index: number,
): { x: number; y: number } {
  const angle = START_ANGLE + index * ANGLE_STEP;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  values?: number[],
): string {
  return Array.from({ length: AXIS_COUNT })
    .map((_, i) => {
      const r = values ? (values[i] / 100) * radius : radius;
      const { x, y } = polarToCartesian(cx, cy, r, i);
      return `${x},${y}`;
    })
    .join(' ');
}

export function RadarChart({
  breakdown,
  size = 220,
  className,
}: RadarChartProps) {
  const padding = 32;
  const svgSize = size + padding * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = size / 2;
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const strokeColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

  const values = DIMENSIONS.map((d) => breakdown[d.key]);

  // Reference polygon levels (33%, 66%, 100%)
  const levels = [0.33, 0.66, 1];

  // Collapsed centre point for animation start
  const centrePoints = Array.from({ length: AXIS_COUNT })
    .map(() => `${cx},${cy}`)
    .join(' ');

  const dataPoints = buildPolygonPoints(cx, cy, radius, values);

  return (
    <div className={className}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="overflow-visible"
      >
        {/* ---------- Reference grid ---------- */}
        {levels.map((level) => (
          <polygon
            key={level}
            points={buildPolygonPoints(cx, cy, radius * level)}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
          />
        ))}

        {/* ---------- Axis lines ---------- */}
        {Array.from({ length: AXIS_COUNT }).map((_, i) => {
          const { x, y } = polarToCartesian(cx, cy, radius, i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={strokeColor}
              strokeWidth={1}
            />
          );
        })}

        {/* ---------- Data polygon (animated) ---------- */}
        <motion.polygon
          initial={{ points: centrePoints }}
          animate={{ points: dataPoints }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          fill="rgba(244,114,182,0.15)"
          stroke="rgba(251,113,133,0.6)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* ---------- Data-point dots ---------- */}
        {values.map((value, i) => {
          const r = (value / 100) * radius;
          const { x, y } = polarToCartesian(cx, cy, r, i);
          return (
            <motion.circle
              key={i}
              initial={{ cx, cy: cy, r: 0 }}
              animate={{ cx: x, cy: y, r: 2 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              fill="#f472b6"
              opacity={0.8}
            />
          );
        })}

        {/* ---------- Axis labels ---------- */}
        {DIMENSIONS.map((dim, i) => {
          const labelRadius = radius + 16;
          const { x, y } = polarToCartesian(cx, cy, labelRadius, i);
          const angle = START_ANGLE + i * ANGLE_STEP;

          // Determine text-anchor based on horizontal position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(angle) > 0.15) textAnchor = 'start';
          else if (Math.cos(angle) < -0.15) textAnchor = 'end';

          // Slight vertical nudge for top/bottom labels
          let dy = '0.35em';
          if (Math.sin(angle) < -0.5) dy = '0em';
          else if (Math.sin(angle) > 0.5) dy = '0.7em';

          return (
            <text
              key={dim.key}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              className="fill-zinc-500 font-mono"
              style={{ fontSize: 9 }}
            >
              {dim.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
