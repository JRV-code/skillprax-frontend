'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Clock, Search, ShieldCheck, PenTool, AlertTriangle, RefreshCw } from 'lucide-react';

interface PackBuildingScreenProps {
  packStage: string | null;
  packError?: string | null;
  onRetry?: () => void;
}

const STAGES = [
  { key: 'PLANNING', label: 'Curriculum & ACU Architecture', icon: Clock },
  { key: 'FINDING_LINKS', label: 'Tavily Research & Link Discovery', icon: Search },
  { key: 'VERIFYING', label: 'Live Link & Paywall Verification', icon: ShieldCheck },
  { key: 'WRITING_GUIDES', label: 'Synthesizing Factual Guides', icon: PenTool },
];

export function PackBuildingScreen({
  packStage,
  packError,
  onRetry,
}: PackBuildingScreenProps) {
  const currentStageIdx = STAGES.findIndex((s) => s.key === packStage);
  const isQueued = packStage === 'QUEUED' || !packStage;

  return (
    <div
      aria-live="polite"
      className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-xl mx-auto space-y-6 text-center"
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {packError ? (
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          ) : (
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">
            {packError
              ? 'Milestone Build Paused'
              : isQueued
              ? 'In line — starting shortly'
              : 'Assembling Verified Milestone Book'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {packError ||
              'Skill-Track inspects live public sources, verifies link health, and writes original conceptual guides.'}
          </p>
        </div>
      </div>

      {packError ? (
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {packError}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Milestone Build</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-2 text-left">
          {STAGES.map((stage, idx) => {
            const isDone = currentStageIdx > idx;
            const isCurrent = currentStageIdx === idx;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : isDone
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-950/20 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isDone
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <StageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium">{stage.label}</span>
                </div>

                <div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-800 inline-block mr-1" />
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
