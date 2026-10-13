'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Zap,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { DUR, EASE, fadeUp, safe } from '@/lib/learning/motion';
import { ScoreGauge } from './ScoreGauge';
import { ChapterBars, ChapterScoreItem } from './ChapterBars';
import { AttemptTrend, AttemptItem } from './AttemptTrend';
import { AnswerStrip, AnswerItem } from './AnswerStrip';
import { AnalysisCard, AnalysisData } from './AnalysisCard';
import { ReviewList, ReviewQuestionItem } from './ReviewList';

export interface EvaluationResultData {
  id?: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  requiredCorrect: number;
  passed: boolean;
  passThresholdPercent?: number;
  attemptNumber?: number;
  chapters: ChapterScoreItem[];
  answers: AnswerItem[];
  questions: ReviewQuestionItem[];
  analysis?: AnalysisData | null;
  attempts?: AttemptItem[];
}

interface QuizResultsViewProps {
  result: EvaluationResultData;
  stepIndex: number;
  stepTitle: string;
  isFinalStep?: boolean;
  onAdvance?: () => void;
  onRetry?: () => void;
  onPerfectScore?: () => void;
  onRegenerateAnalysis?: () => void;
  isRegeneratingAnalysis?: boolean;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  result,
  stepIndex,
  stepTitle,
  isFinalStep = false,
  onAdvance,
  onRetry,
  onPerfectScore,
  onRegenerateAnalysis,
  isRegeneratingAnalysis = false,
}) => {
  const reduceMotion = useReducedMotion();
  const passThreshold = result.passThresholdPercent ?? 70;

  return (
    <motion.div
      variants={safe(fadeUp, reduceMotion)}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Top Banner */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          result.passed
            ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-300/80'
            : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-amber-300/80'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              result.passed
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : 'bg-amber-600 shadow-amber-600/20'
            }`}
          >
            {result.passed ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-heading font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  result.passed
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-200'
                    : 'text-amber-800 bg-amber-100 border-amber-200'
                }`}
              >
                {result.passed
                  ? isFinalStep
                    ? 'Track Mastery Achieved'
                    : `Milestone ${stepIndex} Cleared`
                  : `Remediation Gate (Score < ${passThreshold}%)`}
              </span>
              {result.attemptNumber && result.attemptNumber > 1 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Attempt #{result.attemptNumber}
                </span>
              )}
            </div>
            <h2 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
              {result.passed
                ? `Mastery Verified: ${result.scorePercent}%`
                : `Targeted Review Required: ${result.scorePercent}%`}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {result.passed
                ? `You met the strict ${passThreshold}% competency threshold for ${stepTitle}.`
                : `Passing requires at least ${result.requiredCorrect} of ${result.totalCount} questions (${passThreshold}%).`}
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {result.passed ? (
            <>
              {result.scorePercent < 100 && onPerfectScore && (
                <button
                  type="button"
                  onClick={onPerfectScore}
                  className="px-4 py-2.5 rounded-xl font-heading font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Aim for 100%</span>
                </button>
              )}
              {onAdvance && (
                <button
                  type="button"
                  onClick={onAdvance}
                  className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Advance to Milestone {stepIndex + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Review & Retake Quiz</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid: Score Gauge + Per-Chapter Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ScoreGauge
          scorePercent={result.scorePercent}
          passThresholdPercent={passThreshold}
          requiredCorrect={result.requiredCorrect}
          totalCount={result.totalCount}
          correctCount={result.correctCount}
          passed={result.passed}
        />

        <ChapterBars
          chapters={result.chapters}
          passThresholdPercent={passThreshold}
        />
      </div>

      {/* Attempt Trend (if >= 2 attempts) and Answer Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {result.attempts && result.attempts.length >= 2 ? (
          <AttemptTrend
            attempts={result.attempts}
            passThresholdPercent={passThreshold}
          />
        ) : null}

        <div className={result.attempts && result.attempts.length >= 2 ? '' : 'md:col-span-2'}>
          <AnswerStrip answers={result.answers} />
        </div>
      </div>

      {/* AI Analysis Card */}
      <AnalysisCard
        analysis={result.analysis || null}
        scorePercent={result.scorePercent}
        passed={result.passed}
        onRegenerate={onRegenerateAnalysis}
        isRegenerating={isRegeneratingAnalysis}
      />

      {/* Source-Grounded Question Review List */}
      <ReviewList questions={result.questions} />

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-medium">
          {result.passed ? (
            <span className="text-emerald-700 font-semibold">
              ✓ Ready for subsequent milestone curriculum
            </span>
          ) : (
            <span className="text-amber-700 font-semibold">
              ⚠ Study chapter mechanics before retesting
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {result.passed ? (
            onAdvance && (
              <button
                type="button"
                onClick={onAdvance}
                className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Advance to Step {stepIndex + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          ) : (
            onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Socratic Quiz</span>
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};
