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
  Dumbbell,
} from 'lucide-react';

export interface BuildProgressData {
  percent: number;
  stageKey: string;
  stageLabel: string;
  detail: string;
}

interface PackBuildingScreenProps {
  packStage: string | null;
  packError?: string | null;
  buildProgress?: BuildProgressData | null;
  isSports?: boolean;
  onRetry?: () => void;
}

const COGNITIVE_STAGES = [
  { key: 'PLANNING', label: '1. Groq Curriculum & ACU Architecture', icon: Clock },
  { key: 'FINDING_LINKS', label: '2. Tavily Open-Web Research (Blogs, Articles & Docs)', icon: Search },
  { key: 'WRITING_GUIDES', label: '3. Groq Topic Curation & In-App Study Guides', icon: PenTool },
  { key: 'VERIFYING', label: '4. Video Lectures & Socratic Gate Evaluation', icon: ShieldCheck },
];

const SPORTS_STAGES = [
  { key: 'PLANNING', label: '1. Groq Biomechanics & ACU Architecture', icon: Clock },
  { key: 'FINDING_LINKS', label: '2. Tavily Sports Science & Coaching Research', icon: Search },
  { key: 'WRITING_GUIDES', label: '3. Groq Coaching Curation & Execution Guides', icon: PenTool },
  { key: 'VERIFYING', label: '4. Daily Training Lab (Drills, Exercises & Yogasanas)', icon: Dumbbell },
];

const STAGE_PERCENT: Record<string, number> = {
  QUEUED: 15,
  PLANNING: 25,
  FINDING_LINKS: 45,
  RESEARCHING: 45,
  WRITING_GUIDES: 70,
  VERIFYING: 88,
  READY: 100,
};

// Rotating stage-aware phrases
const STAGE_AWARE_PHRASES: Record<string, string[]> = {
  QUEUED: [
    'Initializing Groq curriculum architect...',
    'Mapping atomic competency units to your experience tier...',
    'Preparing Tavily open-web research scanner...',
  ],
  PLANNING: [
    'Breaking down milestone into progressive Chapters & Topics...',
    'Calibrating prerequisite depth to your background...',
    'Structuring atomic competency units (ACUs)...',
  ],
  FINDING_LINKS: [
    'Querying Tavily for authoritative tech blogs, articles & docs...',
    'Filtering out paywalls, login screens, and dead 404 links...',
    'Scanning Medium, Dev.to, GeeksforGeeks & official references...',
  ],
  WRITING_GUIDES: [
    'Groq Curator selecting non-duplicate candidate links by index...',
    'Authoring in-app topic study guides (mechanics, common mistakes)...',
    'Synthesizing practical real-world execution rules...',
  ],
  VERIFYING: [
    'Verifying full-length instructional YouTube lectures...',
    'Pre-generating Socratic Gate quiz evaluation...',
    'Locking resources into the workspace Anti-Repetition Vault...',
  ],
};

const SPORTS_STAGE_AWARE_PHRASES: Record<string, string[]> = {
  QUEUED: [
    'Initializing Groq athletic performance director...',
    'Reviewing health conditions and dietary profile parameters...',
    'Preparing sports science & biomechanics research pipeline...',
  ],
  PLANNING: [
    'Structuring Foundational Biomechanics & Tactical Chapters...',
    'Calibrating kinetic movement mechanics to your tier...',
    'Outlining athletic drills, exercises & recovery flows...',
  ],
  FINDING_LINKS: [
    'Tavily scanning coaching guides, technique breakdowns & sports blogs...',
    'Filtering out paywalled training journals & dead links...',
    'Sourcing verified demonstration videos for each movement...',
  ],
  WRITING_GUIDES: [
    'Groq Curator selecting best coaching articles and guides...',
    'Authoring step-by-step kinetic checkpoints & breathing cues...',
    'Calibrating medical safety notes to avoid joint strain...',
  ],
  VERIFYING: [
    'Harmonizing unified 3-5 day training plan with countdown timers...',
    'Pre-generating Socratic Gate athletic assessment...',
    'Assembling Daily Training Lab with drills, exercises & yogasanas...',
  ],
};

export function PackBuildingScreen({
  packStage,
  packError,
  buildProgress,
  isSports = false,
  onRetry,
}: PackBuildingScreenProps) {
  const stages = isSports ? SPORTS_STAGES : COGNITIVE_STAGES;

  // Determine stage mapping
  const normalizedStageKey = buildProgress?.stageKey || (
    packStage === 'RESEARCHING' ? 'FINDING_LINKS' :
    packStage === 'WRITING_GUIDES' ? 'WRITING_GUIDES' :
    packStage === 'VERIFYING' ? 'VERIFYING' :
    packStage === 'READY' ? 'READY' :
    packStage === 'PLANNING' ? 'PLANNING' :
    'PLANNING'
  );

  const isReady = normalizedStageKey === 'READY';
  const currentStageIdx = isReady ? stages.length : stages.findIndex((s) => s.key === normalizedStageKey);
  const isQueued = packStage === 'QUEUED' || (!packStage && !buildProgress);

  // Target percent from backend or stage mapping
  const targetPercent = isReady
    ? 100
    : buildProgress?.percent ?? (STAGE_PERCENT[normalizedStageKey] || 25);

  // Smooth asymptotic display percentage interpolator (climbs continuously, never stops moving!)
  const [displayPercent, setDisplayPercent] = useState<number>(() => Math.min(targetPercent, 18));

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayPercent((prev) => {
        if (targetPercent >= 100) {
          if (prev >= 100) return 100;
          return Math.min(100, prev + 8);
        }

        if (prev < targetPercent) {
          // Accelerate towards target
          const diff = targetPercent - prev;
          const step = Math.max(0.6, diff * 0.16);
          return Math.min(targetPercent, prev + step);
        } else {
          // Asymptotic creep forward so the bar NEVER stops moving between poll cycles
          const ceiling = Math.min(94, targetPercent + 16);
          if (prev < ceiling) {
            const remaining = ceiling - prev;
            const creep = Math.max(0.06, remaining * 0.022);
            return Math.min(ceiling, prev + creep);
          }
          return prev;
        }
      });
    }, 250);

    return () => clearInterval(timer);
  }, [targetPercent]);

  // Rotating phrases
  const phraseSource = isSports ? SPORTS_STAGE_AWARE_PHRASES : STAGE_AWARE_PHRASES;
  const currentPhrases = phraseSource[normalizedStageKey] || phraseSource.PLANNING;
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    setPhraseIndex(0);
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % currentPhrases.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [normalizedStageKey, currentPhrases.length]);

  const activeDetailText = buildProgress?.detail || currentPhrases[phraseIndex];
  const activeStageLabel = buildProgress?.stageLabel || (
    stages[Math.max(0, Math.min(stages.length - 1, currentStageIdx))]?.label || 'Assembling Milestone Studio...'
  );

  return (
    <div
      aria-live="polite"
      className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 max-w-xl mx-auto space-y-6 text-center"
    >
      <div className="flex flex-col items-center space-y-3">
        {/* Animated Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm relative">
          {packError ? (
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping pointer-events-none" />
            </>
          )}
        </div>

        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {isSports ? 'SPORTS AI PIPELINE' : 'SYNTHESIS PIPELINE'}
            </span>
            <span className="text-xs font-mono font-black text-emerald-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {Math.round(displayPercent)}%
            </span>
          </div>

          <h3 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
            {packError
              ? 'Milestone Build Paused'
              : isSports
              ? 'Calibrating Sports Regimen & Study Lab'
              : 'Assembling Verified Milestone Studio'}
          </h3>

          {/* DYNAMIC REAL-TIME PROGRESS BAR */}
          {!packError && (
            <div className="w-full max-w-md mx-auto pt-3 space-y-2.5">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5 relative shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#0284C7] rounded-full shadow-sm"
                  style={{ width: `${Math.max(6, Math.min(100, displayPercent))}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>

              {/* DYNAMIC LIVE TICKER TEXT */}
              <div className="min-h-[32px] relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${normalizedStageKey}-${phraseIndex}-${activeDetailText}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-center gap-1.5 text-xs font-heading font-bold text-emerald-700 px-2 text-center"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    <span className="truncate max-w-md">{activeDetailText}</span>
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
        /* 4-STAGE PIPELINE CHECKLIST */
        <div className="space-y-2 pt-2 text-left">
          {stages.map((stage, idx) => {
            const isDone = isReady || currentStageIdx > idx;
            const isCurrent = !isReady && currentStageIdx === idx;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs font-semibold'
                    : isDone
                    ? 'bg-slate-50/80 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-heading font-medium truncate">{stage.label}</span>
                </div>

                <div className="shrink-0 pl-2">
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
