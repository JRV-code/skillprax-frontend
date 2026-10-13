'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Compass,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
} from 'lucide-react';
import { DUR, EASE, safe, SPRING } from '@/lib/learning/motion';
import { fetchLearningConfig } from '@/lib/learning/config';

export interface ApproachBriefData {
  goal: string;
  whyNow: string;
  totalMinutes?: number;
  order: Array<{ chapterKey: string; why: string }>;
  howToStudy: string[];
  commonMistakes: string[];
  selfCheck: Array<{ prompt: string; hint: string }>;
  masteryTarget?: { passPercent: number };
}

interface StepApproachBriefProps {
  stepId: string;
  stepTitle: string;
  tier?: string;
  approachBrief: ApproachBriefData | null;
  approachViewedAt?: string | null;
  onApproachViewed?: () => void;
  onGenerateApproach?: () => void;
  isGenerating?: boolean;
}

export const StepApproachBrief: React.FC<StepApproachBriefProps> = ({
  stepId,
  stepTitle,
  tier,
  approachBrief,
  approachViewedAt,
  onApproachViewed,
  onGenerateApproach,
  isGenerating = false,
}) => {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState<boolean>(!approachViewedAt);
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);
  const [passThreshold, setPassThreshold] = useState<number>(70);

  useEffect(() => {
    fetchLearningConfig().then((cfg) => {
      if (cfg?.passThresholdPercent) {
        setPassThreshold(cfg.passThresholdPercent);
      }
    });
  }, []);

  // Update open state if approachViewedAt changes
  useEffect(() => {
    if (approachViewedAt) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [approachViewedAt]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState && !approachViewedAt && onApproachViewed) {
      onApproachViewed();
    }
  };

  const handleGotIt = () => {
    setIsOpen(false);
    if (!approachViewedAt && onApproachViewed) {
      onApproachViewed();
    }
  };

  if (!approachBrief) {
    return (
      <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-cyan-50/60 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-heading font-bold text-slate-900">
              Pre-Study Milestone Game Plan
            </h4>
            <p className="text-xs text-slate-500">
              Get an AI-synthesized tactical roadmap for this milestone's topics before diving into resources.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateApproach}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating game plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate game plan</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const passPercent = approachBrief.masteryTarget?.passPercent ?? passThreshold;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-sm overflow-hidden transition-all">
      {/* Header bar / accordion toggle */}
      <div
        onClick={handleToggle}
        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 hover:bg-emerald-50/90 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                Tactical Game Plan
              </span>
              {approachBrief.totalMinutes && (
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {approachBrief.totalMinutes} min total
                </span>
              )}
            </div>
            <h3 className="text-base font-heading font-extrabold text-slate-900 mt-1">
              Milestone Strategy: {approachBrief.goal || stepTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!approachViewedAt && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              <Sparkles className="w-3 h-3" /> Recommended First
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={SPRING}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="approach-content"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-6 space-y-6">
              {/* Why Now & Strategy Goal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-500">
                    Why This Milestone Now
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {approachBrief.whyNow}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1.5">
                  <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-800">
                    Mastery Target
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                    Score {passPercent}% or more on the Socratic competency check to unlock the next milestone.
                  </p>
                </div>
              </div>

              {/* Recommended Order of Chapters */}
              {approachBrief.order && approachBrief.order.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-500">
                    Recommended Study Order
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {approachBrief.order.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-heading font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-heading font-bold text-slate-800 uppercase">
                            {item.chapterKey}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                            {item.why}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How to study & Mistakes to avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Active Study Tactics */}
                {approachBrief.howToStudy && approachBrief.howToStudy.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      How to Study This Topic
                    </h4>
                    <ul className="space-y-2">
                      {approachBrief.howToStudy.map((tip, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Mistakes */}
                {approachBrief.commonMistakes && approachBrief.commonMistakes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Mistakes to Avoid
                    </h4>
                    <ul className="space-y-2">
                      {approachBrief.commonMistakes.map((mistake, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Ungraded Self-Check Scenarios */}
              {approachBrief.selfCheck && approachBrief.selfCheck.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Ungraded Self-Check Scenarios
                  </h4>

                  <div className="space-y-2">
                    {approachBrief.selfCheck.map((sc, idx) => {
                      const showHint = activeHintIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-slate-800 font-medium">
                              <span className="font-heading font-bold text-slate-500 mr-1.5">
                                Q{idx + 1}:
                              </span>
                              {sc.prompt}
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveHintIndex(showHint ? null : idx)}
                              className="text-[11px] font-heading font-bold text-emerald-700 hover:text-emerald-800 shrink-0 cursor-pointer"
                            >
                              {showHint ? 'Hide Hint' : 'Show Hint'}
                            </button>
                          </div>

                          <AnimatePresence>
                            {showHint && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: DUR.fast }}
                                className="overflow-hidden pt-1"
                              >
                                <p className="text-[11px] text-slate-600 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/50 italic">
                                  💡 Hint: {sc.hint}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Acknowledgment Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleGotIt}
                  className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Got it — show me the chapters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
