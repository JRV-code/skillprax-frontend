'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from '@/lib/learning/motion';

export interface ChapterScoreItem {
  chapterKey: string;
  correct: number;
  total: number;
  percent: number;
  title?: string;
}

interface ChapterBarsProps {
  chapters: ChapterScoreItem[];
  passThresholdPercent?: number;
}

export const ChapterBars: React.FC<ChapterBarsProps> = ({
  chapters,
  passThresholdPercent = 70,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="p-6 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700">
          Per-Chapter Competency
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">
          Pass line: {passThresholdPercent}%
        </span>
      </div>

      <div className="space-y-3.5">
        {chapters.map((ch, idx) => {
          const isPassed = ch.percent >= passThresholdPercent;
          return (
            <div key={ch.chapterKey || idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-slate-800">
                  {ch.title || `Chapter ${ch.chapterKey.toUpperCase()}`}
                </span>
                <span className="font-semibold text-slate-500">
                  <span className={isPassed ? 'text-emerald-700' : 'text-amber-600'}>
                    {ch.percent}%
                  </span>{' '}
                  ({ch.correct}/{ch.total})
                </span>
              </div>

              {/* Progress bar container with vertical pass line */}
              <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                {/* 70% threshold vertical marker line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-400/70 z-10"
                  style={{ left: `${passThresholdPercent}%` }}
                />

                {/* Animated progress fill */}
                <motion.div
                  className={`h-full rounded-full origin-left ${
                    isPassed ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  initial={reduceMotion ? { width: `${ch.percent}%` } : { width: 0 }}
                  animate={{ width: `${ch.percent}%` }}
                  transition={{
                    duration: DUR.base,
                    delay: idx * 0.08,
                    ease: EASE,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
