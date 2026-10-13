'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from '@/lib/learning/motion';

interface ScoreGaugeProps {
  scorePercent: number;
  passThresholdPercent?: number;
  requiredCorrect: number;
  totalCount: number;
  correctCount: number;
  passed: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  scorePercent,
  passThresholdPercent = 70,
  requiredCorrect,
  totalCount,
  correctCount,
  passed,
}) => {
  const reduceMotion = useReducedMotion();
  const [displayNumber, setDisplayNumber] = useState<number>(reduceMotion ? scorePercent : 0);
  const count = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayNumber(scorePercent);
      return;
    }
    const controls = animate(count, scorePercent, {
      duration: DUR.slow,
      ease: EASE,
      onUpdate: (latest) => setDisplayNumber(Math.round(latest)),
    });
    return () => controls.stop();
  }, [scorePercent, reduceMotion, count]);

  // SVG Gauge calculations
  // Semi-circle from -200 deg to 20 deg (span of 220 degrees)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (220 / 360);
  const scoreLength = arcLength * (scorePercent / 100);
  const thresholdAngle = -200 + (220 * (passThresholdPercent / 100));

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-48 h-48 -rotate-110" viewBox="0 0 200 200">
          {/* Background Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={passed ? '#10b981' : '#f59e0b'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: arcLength - scoreLength }}
            transition={{ duration: DUR.slow, ease: EASE }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-4xl font-heading font-black tracking-tight text-slate-900">
            {displayNumber}%
          </span>
          <span
            className={`mt-1 px-3 py-0.5 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider ${
              passed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {passed ? 'PASSED' : 'NOT YET'}
          </span>
        </div>
      </div>

      {/* Required summary */}
      <div className="mt-2 text-xs text-slate-600 font-medium space-y-0.5">
        <p>
          You scored <span className="font-bold text-slate-900">{correctCount}</span> of{' '}
          <span className="font-bold text-slate-900">{totalCount}</span> questions.
        </p>
        <p className="text-slate-500 text-[11px]">
          Required to pass: <span className="font-semibold text-slate-700">{requiredCorrect}</span> of{' '}
          {totalCount} ({passThresholdPercent}% threshold).
        </p>
      </div>
    </div>
  );
};
