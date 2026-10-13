'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Brain } from 'lucide-react';
import { fadeUp, safe } from '@/lib/learning/motion';

export interface AnalysisData {
  headline?: string;
  summary?: string;
  strengths?: Array<{ chapterKey: string; note: string }>;
  gaps?: Array<{ chapterKey: string; whatWentWrong: string; fix: string }>;
  nextActions?: string[];
  encouragement?: string;
}

interface AnalysisCardProps {
  analysis: AnalysisData | null;
  isLoading?: boolean;
  scorePercent: number;
  passed: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  isLoading = false,
  scorePercent,
  passed,
  onRegenerate,
  isRegenerating = false,
}) => {
  const reduceMotion = useReducedMotion();

  // Skeleton shimmer during generation
  if (isLoading || isRegenerating) {
    return (
      <div className="p-6 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center animate-pulse">
            <Brain className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded-md w-1/3 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-md w-2/3 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
          <div className="h-3 bg-slate-100 rounded-md w-5/6 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded-md w-4/6 animate-pulse" />
        </div>
      </div>
    );
  }

  // Fallback if no AI analysis returned
  if (!analysis) {
    return (
      <div className="p-6 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            Diagnostic Evaluation Summary
          </h4>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-heading font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Generate AI Analysis</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {passed
            ? `Demonstrated solid conceptual grasp with ${scorePercent}% accuracy across key chapters. Milestone unlocked.`
            : `Scored ${scorePercent}%, falling short of the required threshold. Review weaker chapters and retake the evaluation.`}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={safe(fadeUp, reduceMotion)}
      initial="hidden"
      animate="show"
      className="p-6 bg-white/95 rounded-3xl border border-slate-200/90 shadow-xs space-y-5"
    >
      {/* Header / Headline */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              AI Diagnostic Breakdown
            </span>
            <h3 className="text-base font-heading font-bold text-slate-900 mt-0.5">
              {analysis.headline || (passed ? 'Competency Validated' : 'Targeted Focus Areas')}
            </h3>
          </div>
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-[11px] font-heading font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Summary */}
      {analysis.summary && (
        <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
          {analysis.summary}
        </p>
      )}

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Demonstrated Strengths
            </h4>
            <div className="space-y-2">
              {analysis.strengths.map((st, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700"
                >
                  <span className="font-heading font-bold text-emerald-800 uppercase mr-1.5 text-[11px]">
                    [{st.chapterKey}]:
                  </span>
                  <span>{st.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps */}
        {analysis.gaps && analysis.gaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Identified Knowledge Gaps
            </h4>
            <div className="space-y-2">
              {analysis.gaps.map((gp, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-slate-700 space-y-1"
                >
                  <div className="font-heading font-bold text-amber-800 uppercase text-[11px]">
                    [{gp.chapterKey}]: {gp.whatWentWrong}
                  </div>
                  <div className="text-slate-600 text-[11px] flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                    <span>Fix: {gp.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Next Actions */}
      {analysis.nextActions && analysis.nextActions.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <h4 className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-slate-500">
            Immediate Next Actions
          </h4>
          <ul className="space-y-1 text-xs text-slate-600">
            {analysis.nextActions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Encouragement */}
      {analysis.encouragement && (
        <p className="text-[11px] text-slate-500 italic pt-1">
          💬 "{analysis.encouragement}"
        </p>
      )}
    </motion.div>
  );
};
