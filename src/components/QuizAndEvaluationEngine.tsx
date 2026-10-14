'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Target,
  Play,
  Lock,
  Unlock,
  Check,
  X,
  HelpCircle,
  Award,
  Zap,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '@/components/learning/video/playerStore';

export interface Option {
  id: string;
  text: string;
  position?: number;
}

export interface Question {
  id: string;
  question: string;
  prompt: string;
  topicKey?: string;
  topicTitle?: string;
  options: Option[];
  acuId?: string;
  chapterKey?: string;
}

export interface WrongQuestion {
  questionId: string;
  question: string;
  chosenText: string;
  correctText: string;
  explanation: string;
  mistakeExplanation: string;
  topicKey?: string;
  topicTitle?: string;
}

export interface RemediationResource {
  id: string;
  topicTitle: string;
  type: 'VIDEO' | 'DOC';
  title: string;
  url: string;
  videoId: string | null;
  domain: string;
  whyWatchOrRead: string;
}

export interface EvaluationResult {
  id?: string;
  evaluationId?: string;
  passed: boolean;
  percent: number;
  scorePercent: number;
  isPerfect: boolean;
  correctCount: number;
  totalCount: number;
  requiredCorrect: number;
  wrongQuestions: WrongQuestion[];
  remediationResources: RemediationResource[];
  aiSummary: string;
  nextStepUnlocked: boolean;
  nextStepId?: string | null;
  nextStepIndex?: number | null;
  xpEarned?: number;
  isFinalStep?: boolean;
}

interface QuizAndEvaluationEngineProps {
  stepId: string;
  stepIndex: number;
  stepTitle: string;
  acus?: string[];
  onStepPassed: (score: number, passPayload?: any) => void;
  onRemediationStateChange?: (isRemediating: boolean) => void;
  isFinalStep?: boolean;
}

// Global Crash-Proof Error Boundary to catch any unpredictable DOM exceptions
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class QuizErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[QuizErrorBoundary] Isolated exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-heading font-bold text-slate-900">
            Evaluation Gate Encountered an Error
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            We recovered safely. Click below to reload the Socratic evaluation.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
            className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Evaluation</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SafeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.text || val.label || val.prompt || val.title || JSON.stringify(val);
  }
  return String(val);
}

const QuizAndEvaluationEngineInner: React.FC<QuizAndEvaluationEngineProps> = ({
  stepId,
  stepIndex,
  stepTitle,
  acus = [],
  onStepPassed,
  onRemediationStateChange,
  isFinalStep = false,
}) => {
  const { openVideo } = usePlayerStore();

  // Lifecycle states: LOADING | ACTIVE | SUBMITTING | FAILED_REMEDIATION | PASSED_MASTERY
  const [engineState, setEngineState] = useState<
    'LOADING' | 'ACTIVE' | 'SUBMITTING' | 'FAILED_REMEDIATION' | 'PASSED_MASTERY'
  >('LOADING');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Remediation tracking: map of remediation resource ID -> boolean (completed)
  const [completedRemediations, setCompletedRemediations] = useState<Record<string, boolean>>({});

  // Fetch or generate quiz
  const handleFetchQuiz = useCallback(
    async (mode: 'initial' | 'retest' | 'perfection' = 'initial') => {
      setEngineState('LOADING');
      setFetchError(null);
      try {
        const res = await fetch(`/api/steps/${stepId}/level-up-quiz?mode=${mode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load evaluation (Status ${res.status})`);
        }

        const data = await res.json();
        const rawQuestions = Array.isArray(data.questions) ? data.questions : [];

        if (rawQuestions.length === 0) {
          throw new Error('No evaluation questions available for this milestone yet.');
        }

        const formattedQuestions: Question[] = rawQuestions.map((q: any, qIdx: number) => {
          const rawStem = q.question || q.prompt || 'Competency Evaluation Challenge';
          const stemStr = SafeString(rawStem, 'Competency Evaluation Challenge');

          const rawOptions = Array.isArray(q.options) ? q.options : [];
          const formattedOptions: Option[] = rawOptions.map((opt: any, oIdx: number) => {
            const optId = opt && typeof opt === 'object' && opt.id ? String(opt.id) : `opt_${oIdx}`;
            const optText = SafeString(opt, `Option ${String.fromCharCode(65 + oIdx)}`);
            return {
              id: optId,
              text: optText,
              position: typeof opt?.position === 'number' ? opt.position : oIdx,
            };
          });

          return {
            id: String(q.id || `q_${qIdx + 1}`),
            question: stemStr,
            prompt: stemStr,
            topicKey: SafeString(q.topicKey, `t${qIdx + 1}`),
            topicTitle: SafeString(q.topicTitle, `Topic ${qIdx + 1}`),
            options: formattedOptions,
            acuId: q.acuId ? String(q.acuId) : undefined,
            chapterKey: q.chapterKey ? String(q.chapterKey) : undefined,
          };
        });

        setQuestions(formattedQuestions);
        setSelectedAnswers({});
        setEngineState('ACTIVE');
        if (onRemediationStateChange) onRemediationStateChange(false);
      } catch (err: any) {
        console.error('[Quiz Engine] Load error:', err);
        setFetchError(err.message || 'Could not load quiz questions.');
      }
    },
    [stepId, onRemediationStateChange]
  );

  // Automatically load initial quiz on step change or mount
  useEffect(() => {
    setSelectedAnswers({});
    setEvaluationResult(null);
    setCompletedRemediations({});
    handleFetchQuiz('initial');
  }, [stepId, handleFetchQuiz]);

  // Submit Evaluation
  const handleSubmitEvaluation = async () => {
    setEngineState('SUBMITTING');
    try {
      const payload = {
        answers: selectedAnswers,
      };

      const res = await fetch(`/api/steps/${stepId}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Evaluation submission failed');
      }

      const data = await res.json();
      const percent = typeof data.percent === 'number' ? data.percent : (data.scorePercent || 0);
      const passed = Boolean(data.passed ?? (percent >= 70));

      const rawWrong = Array.isArray(data.wrongQuestions) ? data.wrongQuestions : [];
      const parsedWrong: WrongQuestion[] = rawWrong.map((wq: any) => ({
        questionId: SafeString(wq.questionId || wq.id, 'q_wrong'),
        question: SafeString(wq.question, 'Evaluation question'),
        chosenText: SafeString(wq.chosenText || wq.chosenOptionText, 'Your response'),
        correctText: SafeString(wq.correctText || wq.correctOptionText, 'Correct principle'),
        explanation: SafeString(wq.explanation, 'Verified operational principle'),
        mistakeExplanation: SafeString(
          wq.mistakeExplanation || wq.explanation,
          'Review the core mechanics of this topic to eliminate variance.'
        ),
        topicKey: SafeString(wq.topicKey, ''),
        topicTitle: SafeString(wq.topicTitle, 'Competency Unit'),
      }));

      const rawRem = Array.isArray(data.remediationResources) ? data.remediationResources : [];
      const parsedRem: RemediationResource[] = rawRem.map((r: any, idx: number) => ({
        id: SafeString(r.id, `rem_${idx + 1}`),
        topicTitle: SafeString(r.topicTitle, 'Core Concept'),
        type: r.type === 'VIDEO' ? 'VIDEO' : 'DOC',
        title: SafeString(r.title, 'Remediation Guide'),
        url: SafeString(r.url, '#'),
        videoId: r.videoId ? String(r.videoId) : null,
        domain: SafeString(r.domain, 'reference.org'),
        whyWatchOrRead: SafeString(
          r.whyWatchOrRead,
          'Direct instruction to address the identified misconception.'
        ),
      }));

      const result: EvaluationResult = {
        id: data.id || data.evaluationId,
        evaluationId: data.evaluationId || data.id,
        passed,
        percent,
        scorePercent: percent,
        isPerfect: percent === 100,
        correctCount: typeof data.correctCount === 'number' ? data.correctCount : 0,
        totalCount: typeof data.totalCount === 'number' ? data.totalCount : questions.length,
        requiredCorrect: data.requiredCorrect || Math.ceil((70 * questions.length) / 100),
        wrongQuestions: parsedWrong,
        remediationResources: parsedRem,
        aiSummary: SafeString(
          data.aiSummary,
          passed ? 'Competency gate passed.' : 'Targeted remediation required before retest.'
        ),
        nextStepUnlocked: Boolean(data.nextStepUnlocked),
        nextStepId: data.nextStepId,
        nextStepIndex: data.nextStepIndex,
        xpEarned: data.xpEarned,
        isFinalStep: data.isFinalStep || isFinalStep,
      };

      setEvaluationResult(result);
      setCompletedRemediations({});

      if (passed) {
        if (typeof window !== 'undefined') {
          try {
            confetti({ particleCount: 140, spread: 75, origin: { y: 0.55 } });
          } catch (_) {}
        }
        setEngineState('PASSED_MASTERY');
        if (onRemediationStateChange) onRemediationStateChange(false);
      } else {
        setEngineState('FAILED_REMEDIATION');
        if (onRemediationStateChange) onRemediationStateChange(true);
      }
    } catch (err: any) {
      console.error('[Quiz Engine] Submission error:', err);
      alert(err.message || 'Submission failed. Please check connection and retry.');
      setEngineState('ACTIVE');
    }
  };

  const markRemediationCompleted = (id: string) => {
    setCompletedRemediations((prev) => ({ ...prev, [id]: true }));
  };

  const handleOpenRemediationVideo = (rem: RemediationResource) => {
    markRemediationCompleted(rem.id);
    if (rem.videoId) {
      openVideo({
        videoId: rem.videoId,
        title: rem.title,
        resourceId: rem.id,
      });
    } else if (rem.url && rem.url !== '#') {
      window.open(rem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenRemediationDoc = (rem: RemediationResource) => {
    markRemediationCompleted(rem.id);
    if (rem.url && rem.url !== '#') {
      window.open(rem.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if all remediation items are completed
  const totalRemediationsCount = evaluationResult?.remediationResources?.length || 0;
  const completedRemediationsCount = Object.keys(completedRemediations).filter(
    (k) => completedRemediations[k]
  ).length;
  const allRemediationCompleted =
    totalRemediationsCount === 0 || completedRemediationsCount >= totalRemediationsCount;

  // Render Loading Spinner
  if (engineState === 'LOADING') {
    return (
      <div className="p-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h4 className="text-base font-heading font-bold text-slate-900">
          Preparing Socratic Evaluation Gate...
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Grounded across core chapter competency units with deterministic 70% passing criteria.
        </p>
      </div>
    );
  }

  // Render Fetch Error
  if (fetchError) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-amber-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-heading font-bold text-slate-900">
          Evaluation Needs Attention
        </h4>
        <p className="text-xs text-slate-600">{fetchError}</p>
        <button
          type="button"
          onClick={() => handleFetchQuiz('initial')}
          className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Socratic Gate</span>
        </button>
      </div>
    );
  }

  // Render Submitting State
  if (engineState === 'SUBMITTING') {
    return (
      <div className="p-12 bg-white rounded-3xl border border-emerald-200/90 shadow-sm text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h4 className="text-base font-heading font-bold text-slate-900">
          AI Analyzing Your Responses...
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Verifying answers deterministically at 70% threshold and synthesizing personalized feedback.
        </p>
      </div>
    );
  }

  // ===========================================================================
  // STATE 1: ACTIVE QUIZ TAKING
  // ===========================================================================
  if (engineState === 'ACTIVE') {
    const answeredCount = Object.keys(selectedAnswers).length;
    const allAnswered = answeredCount === questions.length && questions.length > 0;
    const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Header Card with Live Progress */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Milestone {stepIndex} Gate
              </span>
              <span className="text-xs font-heading font-bold text-slate-500">
                Passing Threshold: 70%
              </span>
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900">
              {stepTitle} Socratic Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Answer all questions with precision. Scoring $\ge 70\%$ unlocks Step {stepIndex + 1}.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full sm:w-48">
            <div className="text-xs font-heading font-bold text-slate-700">
              {answeredCount} of {questions.length} Answered ({progressPercent}%)
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {questions.map((q, idx) => {
            const currentSelected = selectedAnswers[q.id];
            const optionLabels = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={q.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-heading font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    {q.topicTitle && (
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                        {q.topicTitle}
                      </span>
                    )}
                    <h4 className="text-sm sm:text-base font-heading font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                </div>

                {/* 4 Option Cards (A, B, C, D) */}
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentSelected === opt.id;
                    const letter = optionLabels[optIdx] || String(optIdx + 1);

                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-xs font-semibold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg font-heading font-bold text-xs flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Submit Action Bar */}
        <div className="sticky bottom-4 z-20 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-medium">
            {allAnswered ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All {questions.length} questions answered. Ready to submit!</span>
              </span>
            ) : (
              <span>
                Please answer all questions ({answeredCount}/{questions.length}) to proceed.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitEvaluation}
            disabled={!allAnswered}
            className={`px-8 py-3 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              allAnswered
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Submit Evaluation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATE 2A: FAILED (PERCENT < 70%) — MISTAKE ANALYSIS & LOCKED REMEDIATION
  // ===========================================================================
  if (engineState === 'FAILED_REMEDIATION' && evaluationResult) {
    const wrongList = evaluationResult.wrongQuestions || [];
    const remList = evaluationResult.remediationResources || [];

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Score Banner */}
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/80 border border-rose-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-heading font-black text-xl shadow-md shadow-rose-500/20 shrink-0">
              {evaluationResult.percent}%
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                70% Required to Pass — Remediation Unlocked
              </span>
              <h3 className="text-xl font-heading font-extrabold text-slate-900">
                Score: {evaluationResult.percent}% ({evaluationResult.correctCount} / {evaluationResult.totalCount} Correct)
              </h3>
              <p className="text-xs text-slate-600">
                You need at least {evaluationResult.requiredCorrect} correct answers (70%) to clear this milestone. Review your diagnosed weak areas below to unlock your retest.
              </p>
            </div>
          </div>
        </div>

        {/* AI Mistake Analysis Section */}
        {wrongList.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-heading font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>AI Mistake Breakdown ({wrongList.length} Misconceptions Diagnosed)</span>
            </h4>

            <div className="space-y-3">
              {wrongList.map((wq, idx) => (
                <div
                  key={wq.questionId || idx}
                  className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-heading font-bold text-slate-400">
                      Question {idx + 1}
                    </span>
                    {wq.topicTitle && (
                      <span className="text-[10px] font-heading font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {wq.topicTitle}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-heading font-bold text-slate-900 leading-snug">
                    {wq.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950 flex items-start gap-2">
                      <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-heading font-bold block text-rose-700 text-[11px] uppercase tracking-wider">
                          Your Answer:
                        </span>
                        <span className="font-medium">{wq.chosenText}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-heading font-bold block text-emerald-700 text-[11px] uppercase tracking-wider">
                          Correct Principle:
                        </span>
                        <span className="font-medium">{wq.correctText}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Mistake Explanation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-heading font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                        AI Evaluator Takeaway:
                      </span>
                      <p className="leading-relaxed mt-0.5">{wq.mistakeExplanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Remediation Resources (Weak Portion Recovery) */}
        {remList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-heading font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0284C7]" />
                <span>Mandatory Targeted Remediation (Open to Unlock Retest)</span>
              </h4>
              <span className="text-xs font-mono font-bold text-slate-500">
                {completedRemediationsCount} of {totalRemediationsCount} Reviewed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {remList.map((rem) => {
                const isCompleted = Boolean(completedRemediations[rem.id]);

                return (
                  <div
                    key={rem.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            rem.type === 'VIDEO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {rem.type === 'VIDEO' ? '▶ Video Tutorial' : '📄 Official Document'}
                        </span>

                        <span
                          className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Pending Review</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-heading font-bold text-slate-900 line-clamp-2">
                        {rem.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {rem.whyWatchOrRead}
                      </p>
                    </div>

                    {rem.type === 'VIDEO' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenRemediationVideo(rem)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-heading font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>▶ Watch In-App</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenRemediationDoc(rem)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-heading font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Website ↗</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Retest Action Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-xs font-heading font-bold text-slate-700 flex items-center justify-center sm:justify-start gap-1.5">
              {allRemediationCompleted ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">
                    All remediation resources completed! Retest unlocked.
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    Remediation Progress: {completedRemediationsCount} of {totalRemediationsCount} resources completed
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {allRemediationCompleted
                ? 'Click below to start an adaptive retest on your missed concepts.'
                : 'You must open/watch all prescribed remediation resources above to unlock the retest evaluation.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleFetchQuiz('retest')}
            disabled={!allRemediationCompleted}
            className={`px-7 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              allRemediationCompleted
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 Start Retest Evaluation</span>
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATE 2B: PASSED (PERCENT >= 70%) — 100% MASTERY PROMPT & STEP N+1 UNLOCK
  // ===========================================================================
  if (engineState === 'PASSED_MASTERY' && evaluationResult) {
    const isPerfect = evaluationResult.isPerfect || evaluationResult.percent === 100;
    const wrongList = evaluationResult.wrongQuestions || [];

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Celebratory Score Banner */}
        <div className="p-7 rounded-3xl bg-emerald-50/90 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-heading font-black text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
              {evaluationResult.percent}%
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                {isPerfect ? '100% Flawless Mastery Achieved!' : `Milestone Passed! Step ${stepIndex + 1} Unlocked`}
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                Score: {evaluationResult.percent}% ({evaluationResult.correctCount} / {evaluationResult.totalCount} Correct)
              </h3>
              <p className="text-xs text-slate-600">
                You met the strict 70% competency requirement for {stepTitle}.
              </p>
            </div>
          </div>
        </div>

        {/* If user missed some questions (70% <= percent < 100%): show mistake breakdown */}
        {!isPerfect && wrongList.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Review Missed Concepts ({wrongList.length} Items for Perfection)</span>
            </h4>

            <div className="space-y-3">
              {wrongList.map((wq, idx) => (
                <div
                  key={wq.questionId || idx}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <p className="text-xs sm:text-sm font-heading font-bold text-slate-900">
                    {wq.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                      <span className="font-bold text-rose-700 block text-[10px] uppercase">Your Answer:</span>
                      {wq.chosenText}
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <span className="font-bold text-emerald-700 block text-[10px] uppercase">Correct Principle:</span>
                      {wq.correctText}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-800">Mastery Note: </span>
                    {wq.mistakeExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 100% MASTERY DECISION CARD (WHEN 70% <= percent < 100%) */}
        {!isPerfect && (
          <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 border border-indigo-200 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base sm:text-lg font-heading font-extrabold text-slate-900">
                Do you want to achieve 100% Mastery in this step before moving on?
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              You passed the 70% gate and unlocked the next step! You can either challenge a quick Perfection Quiz on your missed concepts for 100% mastery, or proceed directly to Step {stepIndex + 1}.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Button A: Take Perfection Quiz */}
              <button
                type="button"
                onClick={() => handleFetchQuiz('perfection')}
                className="px-6 py-3.5 rounded-2xl font-heading font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🎯 Yes, Take Perfection Quiz for 100% Mastery</span>
              </button>

              {/* Button B: Proceed to Step N+1 */}
              <button
                type="button"
                onClick={() => onStepPassed(evaluationResult.percent, evaluationResult)}
                className="px-6 py-3.5 rounded-2xl font-heading font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>🚀 Proceed to Step {stepIndex + 1} (Level Up) →</span>
              </button>
            </div>
          </div>
        )}

        {/* If 100% Flawless Mastery */}
        {isPerfect && (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <Award className="w-9 h-9 text-amber-300" />
            </div>
            <h4 className="text-xl font-heading font-black text-slate-900">
              100% Flawless Mastery Achieved!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              You scored perfectly across all competency units in {stepTitle}. You are primed for Step {stepIndex + 1}.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStepPassed(100, evaluationResult)}
                className="px-8 py-3.5 rounded-2xl font-heading font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-600/25 transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>🚀 Proceed to Step {stepIndex + 1} (Level Up) →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Safe exported component with ErrorBoundary wrapper
export const QuizAndEvaluationEngine: React.FC<QuizAndEvaluationEngineProps> = (props) => {
  return (
    <QuizErrorBoundary>
      <QuizAndEvaluationEngineInner {...props} />
    </QuizErrorBoundary>
  );
};

export default QuizAndEvaluationEngine;
