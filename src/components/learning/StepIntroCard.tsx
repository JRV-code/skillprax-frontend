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
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 shadow-lg shadow-slate-200/40 space-y-6"
    >
      {/* Goal & Why Now */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-700">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Milestone Target Goal</span>
          </div>
          <p className="text-base font-heading font-bold text-slate-900 leading-snug">
            {intro.goal || `Master foundational principles and execution models for ${stepTitle}.`}
          </p>
        </div>

        {intro.whyNow && (
          <div className="space-y-1.5 flex-1 md:border-l md:border-slate-100 md:pl-5">
            <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-[#0284C7]">
              <Compass className="w-4 h-4 text-[#0284C7]" />
              <span>Context & Relevance</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{intro.whyNow}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mistakes to avoid */}
        {intro.mistakes && intro.mistakes.length > 0 && (
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Common Pitfalls to Avoid</span>
            </div>
            <ul className="space-y-1.5">
              {intro.mistakes.map((m, idx) => (
                <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practice Checklist (Sports Hub or Physical) */}
        {intro.practiceChecklist && intro.practiceChecklist.length > 0 ? (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-amber-800">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Observable Practice Technique Cues</span>
            </div>
            <ul className="space-y-1.5">
              {intro.practiceChecklist.map((c, idx) => (
                <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          intro.studyOrder &&
          intro.studyOrder.length > 0 && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-800">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Recommended Study Sequence</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {intro.studyOrder.map((stepKey, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-heading font-bold rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300"
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
