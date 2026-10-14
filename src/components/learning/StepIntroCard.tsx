'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, AlertCircle, CheckSquare } from 'lucide-react';
import { fadeSlide } from '@/lib/motion';

interface StepIntroCardProps {
  stepTitle: string;
  intro?: {
    goal?: string;
    whyNow?: string;
    studyOrder?: string[];
    mistakes?: string[];
    practiceChecklist?: string[];
  } | null;
  isSports?: boolean;
}

export function StepIntroCard({ stepTitle, intro, isSports }: StepIntroCardProps) {
  if (!intro) return null;

  return (
    <motion.div
      variants={fadeSlide}
      initial="initial"
      animate="animate"
      className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5"
    >
      {/* Goal & Why Now */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Milestone Target Goal</span>
          </div>
          <p className="text-base font-medium text-slate-100">
            {intro.goal || `Master foundational principles and execution models for ${stepTitle}.`}
          </p>
        </div>

        {intro.whyNow && (
          <div className="space-y-1.5 flex-1 md:border-l md:border-slate-800/80 md:pl-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Context & Relevance</span>
            </div>
            <p className="text-sm text-slate-300">{intro.whyNow}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mistakes to avoid */}
        {intro.mistakes && intro.mistakes.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Common Pitfalls to Avoid</span>
            </div>
            <ul className="space-y-1.5">
              {intro.mistakes.map((m, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 mt-1.5 flex-shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practice Checklist (Sports Hub or Physical) */}
        {intro.practiceChecklist && intro.practiceChecklist.length > 0 ? (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Observable Practice Technique Cues</span>
            </div>
            <ul className="space-y-1.5">
              {intro.practiceChecklist.map((c, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-1.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          intro.studyOrder &&
          intro.studyOrder.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Recommended Study Sequence</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {intro.studyOrder.map((stepKey, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    Topic {idx + 1}: {stepKey.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
