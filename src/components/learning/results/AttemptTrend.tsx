'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from '@/lib/learning/motion';

export interface AttemptItem {
  attemptNumber: number;
  scorePercent: number;
  createdAt?: string;
}

interface AttemptTrendProps {
  attempts: AttemptItem[];
  passThresholdPercent?: number;
}

export const AttemptTrend: React.FC<AttemptTrendProps> = ({
  attempts,
  passThresholdPercent = 70,
}) => {
  const reduceMotion = useReducedMotion();
  if (!attempts || attempts.length < 2) return null;

  // Chart dimensions
  const width = 280;
  const height = 100;
  const padding = 20;

  const maxAttempts = attempts.length;
  const points = attempts.map((att, idx) => {
    const x = padding + (idx / (maxAttempts - 1)) * (width - 2 * padding);
    const y = height - padding - (att.scorePercent / 100) * (height - 2 * padding);
    return { x, y, score: att.scorePercent, num: att.attemptNumber };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const thresholdY = height - padding - (passThresholdPercent / 100) * (height - 2 * padding);

  return (
    <div className="p-6 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700">
          Attempt Progression Trend
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">
          {attempts.length} attempts recorded
        </span>
      </div>

      <div className="w-full flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] overflow-visible">
          {/* Dashed Pass Threshold Line */}
          <line
            x1={padding}
            y1={thresholdY}
            x2={width - padding}
            y2={thresholdY}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - padding + 4}
            y={thresholdY + 3}
            fontSize="9"
            fill="#64748b"
            fontWeight="bold"
          >
            {passThresholdPercent}%
          </text>

          {/* Connected Trend Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DUR.slow, ease: EASE }}
          />

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill="#ffffff"
                stroke={p.score >= passThresholdPercent ? '#10b981' : '#f59e0b'}
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 8}
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
                fill="#334155"
              >
                {p.score}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
