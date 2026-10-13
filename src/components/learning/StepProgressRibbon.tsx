'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { fadeUp, scaleIn, safe, DUR, EASE } from '@/lib/learning/motion';

export interface RibbonStep {
  stepIndex: number;
  title: string;
  difficultyTier?: string;
  status: 'COMPLETED' | 'ACTIVE' | 'LOCKED';
  newConcepts?: string[];
  buildsOn?: string | null;
}

interface StepProgressRibbonProps {
  steps: RibbonStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
}

const TIER_LABELS: Record<string, string> = {
  FOUNDATIONS: 'Foundations',
  ELEMENTARY_MECHANICS: 'Elementary Mechanics',
  INTERMEDIATE_FLUIDITY: 'Intermediate Fluidity',
  ADVANCED_SITUATIONAL_STRESS: 'Advanced Situational Stress',
  ELITE_MASTERY: 'Elite Mastery',
};

export const StepProgressRibbon: React.FC<StepProgressRibbonProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  const reduceMotion = useReducedMotion();
  const activeStep = steps.find((s) => s.stepIndex === currentStepIndex) || steps[0];
  const total = steps.length || 1;
  const progressRatio = total > 1 ? Math.min(1, Math.max(0, (currentStepIndex - 1) / (total - 1))) : 1;

  const currentTierLabel = activeStep?.difficultyTier
    ? TIER_LABELS[activeStep.difficultyTier] || activeStep.difficultyTier.replace(/_/g, ' ')
    : 'Milestone Study';

  // Union of new concepts for active step
  const newConcepts = activeStep?.newConcepts || [];
  const buildsOn = activeStep?.buildsOn;

  return (
    <motion.div
      variants={safe(fadeUp, reduceMotion)}
      initial="hidden"
      animate="show"
      className="p-5 sm:p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-heading font-extrabold tracking-wider uppercase text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200/60">
            Level {currentStepIndex} of {total}
          </span>
          <span className="text-xs font-semibold text-slate-500">·</span>
          <span className="text-xs font-heading font-bold text-slate-700">
            {currentTierLabel}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Milestone Progression Spine
        </span>
      </div>

      {/* Progress Track & Nodes */}
      <div className="relative pt-3 pb-2 px-2">
        {/* Background Track Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-slate-100 rounded-full" />
        
        {/* Animated Active Line Fill */}
        <motion.div
          className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-emerald-500 rounded-full origin-left"
          style={{ width: `calc((100% - 2rem) * ${progressRatio})` }}
          transition={{ duration: DUR.base, ease: EASE }}
        />

        {/* Step Nodes */}
        <div className="relative flex justify-between items-center z-10">
          {steps.map((st) => {
            const isCompleted = st.status === 'COMPLETED' || st.stepIndex < currentStepIndex;
            const isCurrent = st.stepIndex === currentStepIndex;
            const isLocked = st.status === 'LOCKED' && st.stepIndex > currentStepIndex;

            return (
              <button
                key={st.stepIndex}
                type="button"
                onClick={() => onSelectStep?.(st.stepIndex)}
                disabled={isLocked}
                className="group relative flex flex-col items-center focus:outline-none"
              >
                <motion.div
                  variants={safe(scaleIn, reduceMotion)}
                  whileHover={!isLocked ? { scale: 1.1 } : undefined}
                  whileTap={!isLocked ? { scale: 0.95 } : undefined}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-heading font-bold text-xs transition-colors duration-200 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-white text-emerald-700 border-2 border-emerald-500 ring-4 ring-emerald-100 shadow-emerald-500/10'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </motion.div>

                <div className="mt-2 text-center max-w-[120px]">
                  <span
                    className={`block text-[11px] font-heading font-semibold transition-colors ${
                      isCurrent
                        ? 'text-emerald-700 font-bold'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    Step {st.stepIndex}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium truncate max-w-[110px]" title={st.title}>
                    {st.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New In This Step & Builds On Chips */}
      {(newConcepts.length > 0 || buildsOn) && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          {newConcepts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-heading font-semibold text-slate-500 mr-1">
                New in this step:
              </span>
              {newConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}

          {buildsOn && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 ml-auto">
              <span className="font-heading font-semibold text-slate-600">Builds on:</span>
              <span className="italic text-slate-600">{buildsOn}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
