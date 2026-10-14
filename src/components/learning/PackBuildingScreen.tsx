'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  PenTool,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface PackBuildingScreenProps {
  packStage: string | null;
  packError?: string | null;
  isSports?: boolean;
  onRetry?: () => void;
}

const STAGES = [
  { key: 'PLANNING', label: 'Curriculum & ACU Architecture', icon: Clock },
  { key: 'FINDING_LINKS', label: 'Tavily Research & Link Discovery', icon: Search },
  { key: 'VERIFYING', label: 'Live Link & Paywall Verification', icon: ShieldCheck },
  { key: 'WRITING_GUIDES', label: 'Synthesizing Factual Guides', icon: PenTool },
];

const STAGE_PERCENT: Record<string, number> = {
  QUEUED: 15,
  PLANNING: 35,
  FINDING_LINKS: 65,
  VERIFYING: 85,
  WRITING_GUIDES: 95,
  READY: 100,
};

// Stage-aware phrases rotating below the loading bar
const STAGE_AWARE_PHRASES: Record<string, string[]> = {
  QUEUED: [
    'Breaking down milestone into atomic competency units...',
    'Structuring prerequisite chapters and learning sequence...',
    'Calibrating topic depth to your current experience level...',
  ],
  PLANNING: [
    'Breaking down milestone into atomic competency units...',
    'Structuring prerequisite chapters and learning sequence...',
    'Calibrating topic depth to your current experience level...',
  ],
  FINDING_LINKS: [
    'Querying Tavily research engine for authoritative references...',
    'Filtering out paywalls, login walls, and duplicate domains...',
    'Sourcing full-length instructional video lectures...',
  ],
  VERIFYING: [
    'Checking live URL health and embeddability...',
    'Cross-checking against your workspace history vault...',
    'Validating source readability and domain authority...',
  ],
  WRITING_GUIDES: [
    "Synthesizing 'What to look for' and 'What to skip' study guides...",
    'Formulating practical execution tasks for each topic...',
    'Preparing grounded competency facts for your milestone evaluation...',
  ],
};

const SPORTS_STAGE_AWARE_PHRASES: Record<string, string[]> = {
  QUEUED: [
    'Breaking down athletic milestone into physical competency units...',
    'Structuring prerequisite conditioning and drill sequence...',
    'Calibrating technique depth to your current fitness level...',
  ],
  PLANNING: [
    'Calibrating biomechanics and physical conditioning milestones...',
    'Structuring athletic drill progression and safety baseline...',
    'Targeting kinetic efficiency for your experience tier...',
  ],
  FINDING_LINKS: [
    'Sourcing authoritative sports science & coaching references...',
    'Filtering out paywalled training journals and unverified claims...',
    'Sourcing full-length instructional video drills & demonstrations...',
  ],
  VERIFYING: [
    'Checking live video embeddability and coaching link health...',
    'Validating biomechanical drill safety & movement cues...',
    'Cross-referencing against athletic technique vaults...',
  ],
  WRITING_GUIDES: [
    "Synthesizing observable technique cues & 'what to avoid'...",
    'Formulating concrete physical practice tasks and warm-up notes...',
    'Preparing 3-5 item technique checklist for milestone verification...',
  ],
};

export function PackBuildingScreen({
  packStage,
  packError,
  isSports = false,
  onRetry,
}: PackBuildingScreenProps) {
  const currentStageIdx = STAGES.findIndex((s) => s.key === packStage);
  const isQueued = packStage === 'QUEUED' || !packStage;
  const progressPercent = STAGE_PERCENT[packStage || 'QUEUED'] || 20;

  const phraseSource = isSports ? SPORTS_STAGE_AWARE_PHRASES : STAGE_AWARE_PHRASES;
  const currentPhrases = phraseSource[packStage || 'QUEUED'] || phraseSource.QUEUED;

  const [phraseIndex, setPhraseIndex] = useState(0);

  // Reset phrase index and rotate every 2.5 seconds
  useEffect(() => {
    setPhraseIndex(0);
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % currentPhrases.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [packStage, currentPhrases.length]);

  return (
    <div
      aria-live="polite"
      className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 max-w-xl mx-auto space-y-6 text-center"
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
          {packError ? (
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          ) : (
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          )}
        </div>
        <div className="space-y-1 w-full">
          <h3 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
            {packError
              ? 'Milestone Build Paused'
              : isQueued
              ? 'In line — starting shortly'
              : 'Assembling Verified Milestone Book'}
          </h3>

          {/* DYNAMIC PROGRESS BAR */}
          {!packError && (
            <div className="w-full max-w-md mx-auto pt-3 space-y-2.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5 relative shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#0284C7] rounded-full shadow-xs"
                  initial={{ width: '15%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* DYNAMIC ROTATING PHRASES BELOW THE LOADING BAR */}
              <div className="h-7 relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${packStage}-${phraseIndex}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-1.5 text-xs font-heading font-bold text-emerald-700 px-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    <span className="truncate">{currentPhrases[phraseIndex]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {packError ? (
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {packError}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-heading font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Milestone Build</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 pt-2 text-left">
          {STAGES.map((stage, idx) => {
            const isDone = currentStageIdx > idx;
            const isCurrent = currentStageIdx === idx;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs font-semibold'
                    : isDone
                    ? 'bg-slate-50/80 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-700'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-heading font-medium">{stage.label}</span>
                </div>

                <div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block mr-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PackBuildingScreen;
