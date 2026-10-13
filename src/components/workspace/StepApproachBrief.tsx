'use client';

import React, { useState } from 'react';
import {
  Compass,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ApproachBrief {
  goal: string;
  whyNow: string;
  totalMinutes: number;
  order: Array<{ topicKey: string; why: string }>;
  beforeYouStart: string[];
  perResource?: Array<{
    resourceId: string;
    focus: string;
    ignore?: string;
    timebox?: string;
  }>;
  howToStudy: string[];
  commonMistakes: string[];
  selfCheck: Array<{ prompt: string; hint: string }>;
  masteryTarget?: { passPercent: number };
}

interface StepApproachBriefProps {
  stepId: string;
  stepTitle: string;
  tier?: string;
  approachBrief: ApproachBrief | null;
  approachViewedAt: string | null;
  onApproachViewed?: () => void;
  onGenerateApproach?: () => void;
  isGenerating?: boolean;
}

export const StepApproachBrief: React.FC<StepApproachBriefProps> = ({
  stepId,
  stepTitle,
  tier = 'FOUNDATIONS',
  approachBrief,
  approachViewedAt,
  onApproachViewed,
  onGenerateApproach,
  isGenerating = false,
}) => {
  // If viewed already, collapse by default; otherwise expanded
  const [isExpanded, setIsExpanded] = useState<boolean>(!approachViewedAt);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [markingViewed, setMarkingViewed] = useState<boolean>(false);

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGotIt = async () => {
    setIsExpanded(false);
    if (!approachViewedAt) {
      setMarkingViewed(true);
      try {
        await fetch(`/api/steps/${stepId}/approach-viewed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        onApproachViewed?.();
      } catch (err) {
        console.warn('Failed to mark approach viewed:', err);
      } finally {
        setMarkingViewed(false);
      }
    }
  };

  // If no approach brief is present, render generate card
  if (!approachBrief) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-extrabold text-slate-900">
              Pre-Study Game Plan
            </h3>
            <p className="text-xs text-slate-500">
              Synthesize a tailored study strategy before diving into learning materials.
            </p>
          </div>
        </div>
        <button
          onClick={onGenerateApproach}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Strategy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Game Plan</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border border-emerald-200/80 rounded-3xl shadow-sm overflow-hidden mb-6 transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white flex items-center justify-between cursor-pointer border-b border-emerald-100/60"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Game Plan
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {approachBrief.totalMinutes || 45} mins total
              </span>
              {approachViewedAt && (
                <span className="text-[9px] font-mono text-emerald-600 flex items-center gap-0.5 font-bold">
                  <ShieldCheck className="w-3 h-3" /> Reviewed
                </span>
              )}
            </div>
            <h3 className="text-sm font-heading font-extrabold text-slate-900 truncate mt-0.5">
              {approachBrief.goal || `Mastering ${stepTitle}`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isExpanded ? 'Collapse' : 'View Strategy'}
          </span>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Brief Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-6 space-y-6"
          >
            {/* 1. Goal & Why Now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3" /> Primary Milestone Goal
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {approachBrief.goal}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Why This Milestone Now
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {approachBrief.whyNow}
                </p>
              </div>
            </div>

            {/* 2. Chapter Study Order */}
            {approachBrief.order && approachBrief.order.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Recommended Chapter Sequence</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {approachBrief.order.map((item, idx) => (
                    <div
                      key={item.topicKey || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-teal-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate">
                          Chapter {item.topicKey.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                          {item.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Before You Start (Predict-before-you-study) */}
            {approachBrief.beforeYouStart && approachBrief.beforeYouStart.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Before You Start — Active Prediction Checkpoints</span>
                </h4>
                <ul className="space-y-1.5">
                  {approachBrief.beforeYouStart.map((q, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-amber-600 font-bold font-mono shrink-0">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Active Techniques & Common Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* How to study */}
              <div className="space-y-2">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Active Study Techniques</span>
                </h4>
                <div className="space-y-1.5">
                  {(approachBrief.howToStudy || []).map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes to avoid */}
              <div className="space-y-2">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mistakes to Avoid</span>
                </h4>
                <div className="space-y-1.5">
                  {(approachBrief.commonMistakes || []).map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-100 text-xs text-slate-700 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Collapsible Ungraded Self-Check */}
            {approachBrief.selfCheck && approachBrief.selfCheck.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ungraded Self-Check Checkpoints</span>
                </h4>
                <div className="space-y-2">
                  {approachBrief.selfCheck.map((sc, idx) => {
                    const isRevealed = Boolean(revealedHints[idx]);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-slate-900 leading-snug">
                            {idx + 1}. {sc.prompt}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleHint(idx)}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg border border-indigo-200 transition-colors shrink-0 cursor-pointer"
                          >
                            {isRevealed ? 'Hide Hint' : 'Reveal Hint'}
                          </button>
                        </div>
                        {isRevealed && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] text-indigo-900 bg-white/80 p-2.5 rounded-xl border border-indigo-200/60 leading-relaxed font-mono"
                          >
                            💡 Hint: {sc.hint}
                          </motion.p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Target & Action Banner */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Mastery Target: Score{' '}
                  <strong className="text-emerald-700 font-bold">
                    {approachBrief.masteryTarget?.passPercent || 75}% or higher
                  </strong>{' '}
                  on Socratic Evaluation to unlock next milestone.
                </span>
              </div>

              <button
                type="button"
                onClick={handleGotIt}
                disabled={markingViewed}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Got it — show me the chapters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepApproachBrief;
