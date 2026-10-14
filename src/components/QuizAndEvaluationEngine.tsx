'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Video,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Target,
  Clock,
  Shield,
  Award,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { InAppYouTubePlayerModal } from '@/components/InAppYouTubePlayerModal';
import { QuizResultsView, EvaluationResultData } from '@/components/learning/results/QuizResultsView';
import { fetchLearningConfig } from '@/lib/learning/config';

interface Option {
  id: string;
  text: string;
  position?: number;
}

interface Question {
  id: string;
  prompt: string;
  options: Option[];
  acuId?: string;
  chapterKey?: string;
}

interface RemediationArea {
  topic: string;
  misconceptionAnalysis: string;
  coreConcept: string;
  resources?: {
    docUrl?: string;
    docTitle?: string;
    videoUrl?: string;
    videoTitle?: string;
    criticalTakeaway?: string;
  };
}

interface DiagnosticPrescription {
  diagnosticSummary: string;
  weakAreas: RemediationArea[];
  suggestedAction: string;
}

interface QuizAndEvaluationEngineProps {
  stepId: string;
  stepIndex: number;
  stepTitle: string;
  acus: string[];
  onStepPassed: (score: number, passPayload?: any) => void;
  onRemediationStateChange?: (isRemediating: boolean) => void;
  isFinalStep?: boolean;
}

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

interface QuizErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface QuizErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class QuizErrorBoundary extends React.Component<QuizErrorBoundaryProps, QuizErrorBoundaryState> {
  constructor(props: QuizErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): QuizErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[QuizErrorBoundary] Caught evaluation exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-red-200/90 shadow-xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-heading font-bold text-slate-900">
            Evaluation Gate Encountered an Error
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            We recovered safely from a client rendering issue. Click below to re-initialize the evaluation gate.
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
            <span>Reset Evaluation Gate</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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
  // Engine lifecycle states
  const [engineState, setEngineState] = useState<
    | 'STANDBY_UNGENERATED'
    | 'GENERATING_QUIZ'
    | 'ACTIVE_EVALUATION'
    | 'SUBMITTING'
    | 'RESULTS'
    | 'TARGETED_REMEDIATION'
  >('STANDBY_UNGENERATED');

  // Evaluation dataset
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [lastScore, setLastScore] = useState<number>(0);
  const [passThreshold, setPassThreshold] = useState<number>(70);
  const [prescription, setPrescription] = useState<DiagnosticPrescription | null>(null);
  const [reviewedResources, setReviewedResources] = useState<Record<string, boolean>>({});
  const [failedQuestionIds, setFailedQuestionIds] = useState<string[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultData | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<boolean>(false);
  const [quizCoverage, setQuizCoverage] = useState<string>('');

  // Modals
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    videoId: string;
    title: string;
    takeaway: string;
  }>({
    isOpen: false,
    videoId: '',
    title: '',
    takeaway: '',
  });

  // Fetch dynamic threshold from learning config
  useEffect(() => {
    fetchLearningConfig().then((cfg) => {
      if (cfg?.passThresholdPercent) {
        setPassThreshold(cfg.passThresholdPercent);
      }
    });
  }, []);

  // Reset engine on step change
  useEffect(() => {
    setEngineState('STANDBY_UNGENERATED');
    setQuestions([]);
    setSelectedAnswers({});
    setLastScore(0);
    setPrescription(null);
    setReviewedResources({});
    setFailedQuestionIds([]);
    setEvaluationResult(null);
    if (onRemediationStateChange) onRemediationStateChange(false);
  }, [stepId]);

  // Fisher-Yates Shuffle for client options
  const shuffleOptions = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate Socratic Quiz
  const handleGenerateEvaluation = async (
    retest: boolean = false,
    perfection: boolean = false,
    failedIds: string[] = []
  ) => {
    setEngineState('GENERATING_QUIZ');
    try {
      let res = await fetch(`/api/steps/${stepId}/level-up-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retestMode: retest,
          perfectionMode: perfection,
          failedQuestionIds: perfection ? (failedIds.length > 0 ? failedIds : failedQuestionIds) : [],
        }),
      });

      if (!res.ok) {
        // Fallback endpoint
        res = await fetch(`/api/steps/${stepId}/prompt-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ retestMode: retest }),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Evaluation generation failed');
      }

      const data = await res.json();
      if (data.coverage) {
        setQuizCoverage(String(data.coverage));
      }

      const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
      const formattedQuestions: Question[] = rawQuestions.map((q: any, qIdx: number) => {
        const rawPrompt = q.prompt ?? q.question ?? 'Scenario Evaluation';
        const promptStr = typeof rawPrompt === 'object' && rawPrompt !== null
          ? (rawPrompt.text || rawPrompt.prompt || JSON.stringify(rawPrompt))
          : String(rawPrompt || 'Scenario Evaluation');

        const rawOptions = Array.isArray(q.options) ? q.options : [];
        const optionsList: Option[] = rawOptions.map((opt: any, oIdx: number) => {
          if (typeof opt === 'string') {
            return {
              id: String(oIdx),
              text: opt,
              position: oIdx,
            };
          }
          const optText = typeof opt === 'object' && opt !== null
            ? (opt.text ?? opt.label ?? opt.option ?? String(opt))
            : String(opt ?? '');
          const optId = typeof opt === 'object' && opt !== null && opt.id != null
            ? String(opt.id)
            : String(oIdx);

          return {
            id: optId,
            text: typeof optText === 'object' ? JSON.stringify(optText) : String(optText),
            position: typeof opt === 'object' && opt !== null && typeof opt.position === 'number' ? opt.position : oIdx,
          };
        });

        const rawChapterKey = q.chapterKey != null ? String(q.chapterKey) : '';

        return {
          id: String(q.id || `q-${qIdx}`),
          prompt: promptStr,
          options: shuffleOptions(optionsList),
          acuId: q.acuId ? String(q.acuId) : undefined,
          chapterKey: rawChapterKey,
        };
      });

      setQuestions(formattedQuestions);
      setSelectedAnswers({});
      setEngineState('ACTIVE_EVALUATION');
      onRemediationStateChange?.(false);
    } catch (err: any) {
      console.error('[Quiz Engine] Generation error:', err);
      alert(err.message || 'Could not generate quiz. Ensure curriculum is built first.');
      setEngineState('STANDBY_UNGENERATED');
    }
  };

  // Submit Evaluation
  const handleSubmitEvaluation = async () => {
    setEngineState('SUBMITTING');
    try {
      const payload = {
        answers: Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };

      const res = await fetch(`/api/steps/${stepId}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Evaluation submission failed');
      const data = await res.json();

      const score = data.scorePercent ?? data.scorePercentage ?? data.percent ?? data.score ?? 0;
      setLastScore(score);
      const passed = data.passed ?? (score >= passThreshold);

      // Map response to EvaluationResultData
      const resultObj: EvaluationResultData & any = {
        id: data.evaluationId || data.id,
        scorePercent: score,
        correctCount: data.correctCount ?? 0,
        totalCount: data.totalCount ?? questions.length,
        requiredCorrect: data.requiredCorrect ?? Math.ceil((passThreshold * questions.length) / 100),
        passed,
        passThresholdPercent: data.passThresholdPercent ?? passThreshold,
        attemptNumber: data.attemptNumber ?? 1,
        chapters: data.chapters || [],
        answers: data.answers || [],
        questions: data.questions || [],
        attempts: data.attempts || [],
        analysis: null,
        nextStepIndex: data.nextStepIndex,
        unlockedNextStepId: data.unlockedNextStepId || data.nextStepId,
        xpEarned: data.xpEarned,
        isFinalStep: data.isFinalStep,
      };

      setEvaluationResult(resultObj);
      setFailedQuestionIds(data.failedQuestionIds || []);

      if (passed) {
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }
      }

      setEngineState('RESULTS');
      onRemediationStateChange?.(!passed);

      // Fire off AI analysis asynchronously (code-constrained)
      if (data.evaluationId) {
        fetchAnalysis(data.evaluationId, resultObj);
      }
    } catch (err) {
      console.error('[Quiz Engine] Submit error:', err);
      setEngineState('ACTIVE_EVALUATION');
    }
  };

  // Fetch AI Analysis constrained by score
  const fetchAnalysis = async (evaluationId: string, currentResult: EvaluationResultData) => {
    setIsGeneratingAnalysis(true);
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageCode: 'en' }),
      });
      if (res.ok) {
        const analysisData = await res.json();
        setEvaluationResult((prev) => (prev ? { ...prev, analysis: analysisData } : currentResult));
      }
    } catch (err) {
      console.warn('Failed to load analysis:', err);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const markResourceReviewed = (key: string, url: string, title?: string, takeaway?: string) => {
    setReviewedResources((prev) => ({ ...prev, [key]: true }));
    const vId = extractYouTubeId(url);
    if (vId) {
      setActiveVideoModal({
        isOpen: true,
        videoId: vId,
        title: title || 'Targeted Video Remediation',
        takeaway: takeaway || 'Focus on the mechanics and error recovery demonstrated here.',
      });
    } else if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const allPrescribedResourcesReviewed = (): boolean => {
    if (!prescription || !prescription.weakAreas) return true;
    for (let i = 0; i < prescription.weakAreas.length; i++) {
      if (!reviewedResources[`doc_${i}`] || !reviewedResources[`video_${i}`]) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* 1. STANDBY LAUNCHPAD */}
      {engineState === 'STANDBY_UNGENERATED' && (
        <div className="p-8 md:p-10 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-emerald-600">
                  <Target className="w-10 h-10 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>SKILL-TRACK Socratic Gate {stepIndex}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                {stepTitle} Evaluation Gate
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                Evaluates your mastery across {acus.length || 'core'} assessable concept units with 8–12 scenario-grounded challenges. Passing threshold is {passThreshold}% mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-md mx-auto">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  8–12
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Questions Pool</div>
                  <div className="text-[11px] text-slate-500">Source-grounded anchors</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {passThreshold}%
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Passing Threshold</div>
                  <div className="text-[11px] text-slate-500">Single config constant</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleGenerateEvaluation(false, false)}
                className="px-8 py-3.5 rounded-2xl font-heading font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Generate Socratic Evaluation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERATING SPINNER */}
      {engineState === 'GENERATING_QUIZ' && (
        <div className="p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            Generating Grounded Socratic Evaluation...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Anchoring scenario-based questions to chapter key ideas with balanced distractor lengths.
          </p>
        </div>
      )}

      {/* 3. ACTIVE EVALUATION */}
      {engineState === 'ACTIVE_EVALUATION' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Step {stepIndex} Gate
              </span>
              <h3 className="text-lg font-heading font-bold text-slate-900 mt-2">
                {stepTitle} Socratic Competency Check
              </h3>
              {quizCoverage && (
                <p className="text-xs text-slate-500 mt-0.5">{quizCoverage}</p>
              )}
            </div>

            <div className="text-xs font-heading font-bold text-slate-500">
              {Object.keys(selectedAnswers).length} of {questions.length} Answered
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    {q.chapterKey && (
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500 mb-1 inline-block">
                        Chapter {q.chapterKey.toUpperCase()}
                      </span>
                    )}
                    <p className="text-sm font-heading font-bold text-slate-900 leading-snug">
                      {q.prompt}
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-2xs font-semibold'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Submit Dock */}
          <div className="sticky bottom-4 z-20 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600">
              {Object.keys(selectedAnswers).length === questions.length
                ? 'All questions completed. Ready to submit for deterministic grading.'
                : `Answer all questions (${Object.keys(selectedAnswers).length}/${questions.length}) to submit.`}
            </span>
            <button
              type="button"
              onClick={handleSubmitEvaluation}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              className={`px-7 py-3 rounded-xl font-heading font-bold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                Object.keys(selectedAnswers).length === questions.length
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Submit Evaluation Gate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SUBMITTING SPINNER */}
      {engineState === 'SUBMITTING' && (
        <div className="p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            Deterministic Server-Side Grading at {passThreshold}% Threshold...
          </h4>
          <p className="text-xs text-slate-500">
            Checking answers against canonical answer keys with zero LLM arithmetic.
          </p>
        </div>
      )}

      {/* 5. RESULTS SCREEN (Unified Crisp UI from Section 14.7) */}
      {engineState === 'RESULTS' && evaluationResult && (
        <QuizResultsView
          result={evaluationResult}
          stepIndex={stepIndex}
          stepTitle={stepTitle}
          isFinalStep={isFinalStep}
          onAdvance={() => onStepPassed(evaluationResult.scorePercent, evaluationResult)}
          onRetry={() => handleGenerateEvaluation(true, false)}
          onPerfectScore={() =>
            handleGenerateEvaluation(false, true, failedQuestionIds)
          }
          onRegenerateAnalysis={() => {
            if (evaluationResult.id) fetchAnalysis(evaluationResult.id, evaluationResult);
          }}
          isRegeneratingAnalysis={isGeneratingAnalysis}
        />
      )}

      {/* 6. TARGETED REMEDIATION GATE */}
      {engineState === 'TARGETED_REMEDIATION' && prescription && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-amber-50 via-white to-rose-50/40 border border-amber-300 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                  Competency Gap Detected • Score: {lastScore}%
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 mt-2">
                Targeted Remediation Dashboard
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Review the diagnosed weak areas below to unlock your adaptive retest.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-white/90 px-3.5 py-2 rounded-xl border border-amber-200 shadow-xs shrink-0">
              Passing Threshold: {passThreshold}% Mastery
            </span>
          </div>

          {/* Remediation Weak Areas */}
          <div className="space-y-4">
            {(prescription.weakAreas || []).map((area, idx) => {
              const docKey = `doc_${idx}`;
              const videoKey = `video_${idx}`;
              const isDocReviewed = reviewedResources[docKey];
              const isVideoReviewed = reviewedResources[videoKey];

              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <h4 className="text-sm font-heading font-bold text-slate-900">
                    Deficit Concept: {area.topic}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-xl">
                      <span className="font-heading font-bold text-rose-900 block mb-1">
                        Identified Misconception:
                      </span>
                      <p className="text-rose-950">{area.misconceptionAnalysis}</p>
                    </div>
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
                      <span className="font-heading font-bold text-emerald-900 block mb-1">
                        Target Mental Model:
                      </span>
                      <p className="text-emerald-950">{area.coreConcept}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {area.resources?.docUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          markResourceReviewed(
                            docKey,
                            area.resources!.docUrl!,
                            area.resources?.docTitle,
                            area.resources?.criticalTakeaway
                          )
                        }
                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isDocReviewed
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-slate-200 hover:border-cyan-400 bg-white'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-800">
                            Document Reference
                          </span>
                          <p className="text-xs font-heading font-bold text-slate-900 mt-0.5 truncate">
                            {area.resources.docTitle || 'Study Reference'}
                          </p>
                          <span className="text-[10px] font-bold text-cyan-700 mt-1 inline-block">
                            {isDocReviewed ? '✓ Reviewed' : 'Open Reference ➔'}
                          </span>
                        </div>
                      </button>
                    )}

                    {area.resources?.videoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          markResourceReviewed(
                            videoKey,
                            area.resources!.videoUrl!,
                            area.resources?.videoTitle,
                            area.resources?.criticalTakeaway
                          )
                        }
                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isVideoReviewed
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-slate-200 hover:border-rose-400 bg-white'
                        }`}
                      >
                        <Video className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-rose-800">
                            Video Walkthrough
                          </span>
                          <p className="text-xs font-heading font-bold text-slate-900 mt-0.5 truncate">
                            {area.resources.videoTitle || 'Walkthrough'}
                          </p>
                          <span className="text-[10px] font-bold text-rose-700 mt-1 inline-block">
                            {isVideoReviewed ? '✓ Watched' : 'Watch Video ➔'}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gated Retest Button */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              {allPrescribedResourcesReviewed()
                ? 'Remediation completed. You may now attempt the retest.'
                : 'Review the prescribed resources above to unlock your retest.'}
            </span>
            <button
              type="button"
              onClick={() => handleGenerateEvaluation(true, false)}
              disabled={!allPrescribedResourcesReviewed()}
              className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Retest ({passThreshold}% Gate)</span>
            </button>
          </div>
        </div>
      )}

      {/* Standalone Video Modal */}
      <InAppYouTubePlayerModal
        isOpen={activeVideoModal.isOpen}
        onClose={() => setActiveVideoModal((prev) => ({ ...prev, isOpen: false }))}
        videoId={activeVideoModal.videoId}
        videoTitle={activeVideoModal.title}
        takeaway={activeVideoModal.takeaway}
      />
    </div>
  );
};

export const QuizAndEvaluationEngine: React.FC<QuizAndEvaluationEngineProps> = (props) => {
  return (
    <QuizErrorBoundary onReset={() => window.location.reload()}>
      <QuizAndEvaluationEngineInner {...props} />
    </QuizErrorBoundary>
  );
};

export default QuizAndEvaluationEngine;
