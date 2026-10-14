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
    <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40 max-w-2xl mx-auto text-center space-y-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
        error
          ? 'bg-rose-50 border border-rose-200 text-rose-600'
          : 'bg-sky-50 border border-sky-200 text-[#0284C7]'
      }`}>
        {error ? <AlertCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-heading font-extrabold text-[#0284C7]">
          <span>Milestone {stepIndex}</span>
          {difficultyTier && <span>• {difficultyTier.replace(/_/g, ' ')}</span>}
        </div>
        <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">{stepTitle}</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {error
            ? 'A problem occurred while retrieving resources for this milestone. Review the details below and try again.'
            : 'Ready to begin? Click below to search for high-signal documentation, verified videos, and original study guides.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left flex items-start gap-3 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1 min-w-0">
            <p className="font-heading font-bold text-rose-900">Resource Search Encountered an Issue</p>
            <p className="text-xs text-rose-700 leading-relaxed font-mono break-words">{error}</p>
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={onSearchResources}
          disabled={loading}
          className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-heading font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] ${
            error
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-[#0369a1] hover:to-emerald-600 shadow-sky-600/20'
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
