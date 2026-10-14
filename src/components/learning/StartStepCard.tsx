'use client';

import React from 'react';
import { Search, Sparkles, BookOpen } from 'lucide-react';

interface StartStepCardProps {
  stepTitle: string;
  stepIndex: number;
  difficultyTier?: string | null;
  onSearchResources: () => void;
  loading?: boolean;
}

export function StartStepCard({
  stepTitle,
  stepIndex,
  difficultyTier,
  onSearchResources,
  loading = false,
}: StartStepCardProps) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl max-w-2xl mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
        <BookOpen className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-semibold text-emerald-400">
          <span>Milestone {stepIndex}</span>
          {difficultyTier && <span>• {difficultyTier.replace(/_/g, ' ')}</span>}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">{stepTitle}</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Ready to begin? Click below to search for high-signal documentation, verified videos, and original study guides.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onSearchResources}
          disabled={loading}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching resources…' : 'Search for resources'}</span>
        </button>
      </div>
    </div>
  );
}
