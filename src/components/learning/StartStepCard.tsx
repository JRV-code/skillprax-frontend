'use client';

import React from 'react';
import { Search, Sparkles, BookOpen, AlertCircle, RotateCcw } from 'lucide-react';

interface StartStepCardProps {
  stepTitle: string;
  stepIndex: number;
  difficultyTier?: string | null;
  onSearchResources: () => void;
  loading?: boolean;
  error?: string | null;
}

export function StartStepCard({
  stepTitle,
  stepIndex,
  difficultyTier,
  onSearchResources,
  loading = false,
  error = null,
}: StartStepCardProps) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl max-w-2xl mx-auto text-center space-y-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
        error
          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      }`}>
        {error ? <AlertCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-semibold text-emerald-400">
          <span>Milestone {stepIndex}</span>
          {difficultyTier && <span>• {difficultyTier.replace(/_/g, ' ')}</span>}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">{stepTitle}</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {error
            ? 'A problem occurred while retrieving resources for this milestone. Review the details below and try again.'
            : 'Ready to begin? Click below to search for high-signal documentation, verified videos, and original study guides.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-3 animate-fade-in max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1 min-w-0">
            <p className="font-semibold text-rose-200">Resource Search Encountered an Issue</p>
            <p className="text-xs text-rose-300/90 leading-relaxed font-mono break-words">{error}</p>
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={onSearchResources}
          disabled={loading}
          className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg cursor-pointer disabled:opacity-60 ${
            error
              ? 'text-white bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              : 'text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/10 hover:shadow-emerald-500/20'
          }`}
        >
          {error ? <RotateCcw className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Searching resources…' : error ? 'Retry Search' : 'Search for resources'}</span>
        </button>
      </div>
    </div>
  );
}

export default StartStepCard;
