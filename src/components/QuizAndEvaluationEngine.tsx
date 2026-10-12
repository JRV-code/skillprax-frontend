'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, BookOpen, 
  Video, ArrowRight, RotateCcw, ShieldCheck, ExternalLink, Target, Flame, XCircle, Shield, Award, Check
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import { InAppYouTubePlayerModal } from '@/components/InAppYouTubePlayerModal';
import { InAppContentReaderModal } from '@/components/InAppContentReaderModal';

function AnimatedScoreRadial({ score }: { score: number }) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = Math.max(1, score / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayedScore(score);
        clearInterval(timer);
      } else {
        setDisplayedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center mx-auto my-2">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="7"
          className="text-slate-100"
          fill="transparent"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke="url(#scoreGradRadial)"
          strokeWidth="7"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGradRadial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
          {displayedScore}%
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
          Mastery
        </span>
      </div>
    </div>
  );
}

function XpGainBar({ xpGained = 150 }: { xpGained?: number }) {
  return (
    <div className="w-full max-w-xs mx-auto p-3 bg-slate-900 text-white rounded-2xl border border-emerald-500/30 shadow-md space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-400 uppercase tracking-wider text-[9px]">Verified XP Gain</span>
        <span className="text-amber-400 font-mono font-black text-xs">+{xpGained} XP</span>
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>
    </div>
  );
}

interface ACU {
  id: string;
  title: string;
  description: string;
}

interface Question {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
  }[];
  acuId?: string;
}

interface WeakAreaDiagnosis {
  topic: string;
  misconceptionAnalysis: string;
  coreConcept: string;
  resources: {
    docTitle: string;
    docUrl: string;
    videoTitle: string;
    videoUrl: string;
    criticalTakeaway: string;
  };
}

interface DiagnosticPrescription {
  overallDiagnosis: string;
  weakAreas: WeakAreaDiagnosis[];
}

interface QuizAndEvaluationEngineProps {
  stepId: string;
  stepIndex: number;
  stepTitle: string;
  acus: ACU[];
  onStepPassed: (score: number, passPayload?: any) => void;
  onRemediationStateChange?: (isRemediation: boolean) => void;
}

type EngineState = 
  | 'STANDBY_UNGENERATED'
  | 'GENERATING_QUIZ'
  | 'ACTIVE_EVALUATION'
  | 'SUBMITTING'
  | 'PASSED_DUAL_CHOICE'
  | 'PASSED_GRANDMASTER'
  | 'TARGETED_REMEDIATION';

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const QuizAndEvaluationEngine: React.FC<QuizAndEvaluationEngineProps> = ({
  stepId,
  stepIndex,
  stepTitle,
  acus,
  onStepPassed,
  onRemediationStateChange,
}) => {
  const [engineState, setEngineState] = useState<EngineState>('STANDBY_UNGENERATED');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number>(0);
  const [prescription, setPrescription] = useState<DiagnosticPrescription | null>(null);
  const [reviewedResources, setReviewedResources] = useState<Record<string, boolean>>({});
  const [isRetestMode, setIsRetestMode] = useState<boolean>(false);
  const [isPerfectionMode, setIsPerfectionMode] = useState<boolean>(false);
  const [failedQuestionIds, setFailedQuestionIds] = useState<string[]>([]);
  const [lastSubmissionData, setLastSubmissionData] = useState<any>(null);

  // In-app reader & player modal states
  const [activeVideoModal, setActiveVideoModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    title: string;
    takeaway: string;
  }>({
    isOpen: false,
    videoId: null,
    title: '',
    takeaway: '',
  });

  const [activeReaderModal, setActiveReaderModal] = useState<{
    isOpen: boolean;
    title: string;
    sourceUrl: string;
    corePrinciple: string;
  }>({
    isOpen: false,
    title: '',
    sourceUrl: '',
    corePrinciple: '',
  });

  // Cleanly reset engine when user selects or advances to another step
  useEffect(() => {
    setEngineState('STANDBY_UNGENERATED');
    setQuestions([]);
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
    setLastScore(0);
    setPrescription(null);
    setReviewedResources({});
    setIsRetestMode(false);
    setIsPerfectionMode(false);
    setFailedQuestionIds([]);
    setLastSubmissionData(null);
    if (onRemediationStateChange) onRemediationStateChange(false);
  }, [stepId]);

  // Fisher-Yates Shuffle algorithm for options
  const shuffleOptions = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 1. Generate Socratic Evaluation (Supports 8–12 standard questions, adaptive retest, or targeted perfection quiz)
  const handleGenerateEvaluation = async (retest: boolean = false, perfection: boolean = false, failedIds: string[] = []) => {
    setEngineState('GENERATING_QUIZ');
    try {
      let res = await fetch(`/api/steps/${stepId}/level-up-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retestMode: retest,
          perfectionMode: perfection,
          failedQuestionIds: perfection ? (failedIds.length > 0 ? failedIds : failedQuestionIds) : [],
          priorityAcus: retest && prescription ? prescription.weakAreas.map(w => w.topic) : [],
        }),
      });

      if (!res.ok) {
        res = await fetch(`/api/steps/${stepId}/prompt-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            retestMode: retest,
            focusAcus: retest && prescription ? prescription.weakAreas.map(w => w.topic) : [],
          }),
        });
      }

      if (!res.ok) throw new Error('Evaluation generation failed');
      const data = await res.json();

      // Enforce question pool size and apply Fisher-Yates shuffling
      const formattedQuestions: Question[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt || q.scenario || q.question || 'Scenario Evaluation',
        options: shuffleOptions(q.options || []),
        acuId: q.acuId,
      }));

      setQuestions(formattedQuestions);
      setSelectedAnswers({});
      setActiveQuestionIndex(0);
      setIsRetestMode(retest);
      setIsPerfectionMode(perfection);
      setEngineState('ACTIVE_EVALUATION');
      onRemediationStateChange?.(false);
    } catch (err) {
      console.error(err);
      setEngineState('STANDBY_UNGENERATED');
    }
  };

  // 2. Submit Socratic Evaluation
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
      const score = data.scorePercentage ?? data.score ?? 0;
      setLastScore(score);
      setLastSubmissionData(data);

      const missedIds = data.failedQuestionIds || [];
      setFailedQuestionIds(missedIds);

      // Unfreeze next milestone in database and trigger celebration if >= 75%
      if (score >= 75) {
        try {
          if (typeof window !== 'undefined') {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          const storedProfileId = typeof window !== 'undefined'
            ? localStorage.getItem('skillprax_active_profile_id') || 'default-user'
            : 'default-user';

          await fetch('/api/milestones/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: storedProfileId,
              skillId: stepId,
              milestoneOrder: stepIndex,
              scorePercentage: score,
              skillTitle: stepTitle,
            }),
          });
        } catch (milestoneErr) {
          console.error('[milestones/submit-quiz] Sync error:', milestoneErr);
        }
      }

      // Strict 75% Mastery Threshold & Tri-Branch Decision Gate:
      if (score === 100) {
        // BRANCH 2: 100% Grandmaster Pass
        setEngineState('PASSED_GRANDMASTER');
        onRemediationStateChange?.(false);
        onStepPassed(score, { ...data, isGrandmaster: true, bonusXp: 1000 });
      } else if (score >= 75) {
        // BRANCH 1: 75%–99% Mastery Achieved with Dual-Choice Gate
        setEngineState('PASSED_DUAL_CHOICE');
        onRemediationStateChange?.(false);
      } else {
        // BRANCH 3: < 75% Socratic Remediation Required
        setPrescription(data.diagnosticPrescription || null);
        setReviewedResources({});
        setEngineState('TARGETED_REMEDIATION');
        onRemediationStateChange?.(true);
      }
    } catch (err) {
      console.error(err);
      setEngineState('ACTIVE_EVALUATION');
    }
  };

  // Track remediation resource reviews
  const markResourceReviewed = (key: string, type: 'doc' | 'video', url: string, title: string, takeaway: string) => {
    setReviewedResources(prev => ({ ...prev, [key]: true }));

    if (type === 'video') {
      const vId = extractYouTubeId(url);
      if (vId) {
        setActiveVideoModal({
          isOpen: true,
          videoId: vId,
          title: title || 'Targeted Visual Remediation',
          takeaway: takeaway || 'Focus on the mechanics and error recovery demonstrated here.',
        });
        return;
      }
    } else if (type === 'doc') {
      setActiveReaderModal({
        isOpen: true,
        title: title || 'Targeted Concept Clarification',
        sourceUrl: url,
        corePrinciple: takeaway || 'Review the core axiomatic principle to clear up the diagnosed misconception.',
      });
      return;
    }

    if (url && url !== '#') {
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
      {/* --- STATE 1: STANDBY UNGENERATED (LAUNCHPAD) --- */}
      {engineState === 'STANDBY_UNGENERATED' && (
        <div className="view-transition-enter p-8 md:p-10 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 via-sky-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-emerald-600">
                  <Target className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
              </span>
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
                Evaluates your mastery across {acus.length || 'core'} assessable concept units with 8–12 scenario-grounded challenges. Passing threshold is 75% mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  8–12
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Questions Pool</div>
                  <div className="text-[11px] text-slate-500">Equal length rule (±10%)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                  75%
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Passing Threshold</div>
                  <div className="text-[11px] text-slate-500">Unlocks Milestone {stepIndex + 1}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-slate-900">Perfection Drill</div>
                  <div className="text-[11px] text-slate-500">100% Grandmaster option</div>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <div className="relative p-[2px] rounded-2xl conic-beam shadow-xl shadow-emerald-500/20 inline-block">
                <button
                  onClick={() => handleGenerateEvaluation(false, false)}
                  className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-sm sm:text-base rounded-xl btn-shimmer flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>⚡ Begin Socratic Evaluation (8–12 Questions)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATE 2: LOADING SKELETON --- */}
      {engineState === 'GENERATING_QUIZ' && (
        <div className="view-transition-enter p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            {isPerfectionMode
              ? 'Synthesizing Targeted 100% Perfection Drill...'
              : 'Synthesizing 8–12 Socratic Scenario Questions...'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isPerfectionMode
              ? 'Testing exclusively the concepts missed on your previous attempt.'
              : 'Enforcing the Equal Length Rule (±10%) and grounding in assigned study material.'}
          </p>
        </div>
      )}

      {/* --- STATE 3: ACTIVE EVALUATION WITH QUESTION JUMPER --- */}
      {engineState === 'ACTIVE_EVALUATION' && (
        <div className="view-transition-enter space-y-6">
          {/* Top Progress & Threshold Banner */}
          <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-0.5 rounded-full border border-emerald-200">
                  {isPerfectionMode ? '🎯 Targeted Perfection Drill (100% Mode)' : isRetestMode ? 'Adaptive Retest Active' : `Evaluation • Milestone ${stepIndex}`}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Passing Threshold: <span className="text-emerald-700 font-extrabold">75% Mastery</span>
                </span>
              </div>
              <h4 className="text-base font-heading font-bold text-slate-900 mt-1">{stepTitle}</h4>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {Object.keys(selectedAnswers).length} / {questions.length} Answered
              </span>
            </div>
          </div>

          {/* Interactive Question Jumper Navigation Bar */}
          <div className="p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider">
                Question Jumper Nav ({questions.length} Items)
              </span>
              <span className="text-[11px] text-slate-400">
                Click any number to navigate
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = activeQuestionIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionIndex(idx);
                      const el = document.getElementById(`q-item-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 scale-105'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span>Q{idx + 1}</span>
                    {isAnswered && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions Container with Parallax Doodles */}
          <div className="relative space-y-5">
            {/* Background Parallax Floating Doodles */}
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-2 text-3xl font-mono font-bold text-slate-300/40 pointer-events-none select-none z-0"
            >
              ∫ ∂x ∑
            </motion.div>
            <motion.div
              animate={{ y: [12, -12, 12] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 -left-3 text-2xl font-mono font-bold text-slate-300/40 pointer-events-none select-none z-0"
            >
              λ π ∇
            </motion.div>
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 right-6 text-2xl font-mono font-bold text-slate-300/40 pointer-events-none select-none z-0"
            >
              θ √ Δ
            </motion.div>
            {questions.map((q, qIndex) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = activeQuestionIndex === qIndex;

              return (
                <div
                  key={q.id}
                  id={`q-item-${qIndex}`}
                  className={`p-6 bg-white/95 backdrop-blur-md rounded-2xl border transition-all duration-200 space-y-4 ${
                    isCurrent
                      ? 'border-emerald-400 ring-4 ring-emerald-100 shadow-md'
                      : 'border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      Question {qIndex + 1} of {questions.length}
                    </span>
                    {isAnswered ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Response Selected
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending Response
                      </span>
                    )}
                  </div>

                  <p className="text-sm md:text-base font-heading font-semibold text-slate-900 leading-snug">
                    {q.prompt}
                  </p>

                  {/* Options List adhering to the Equal Length Rule */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {(((q as any).options || (q as any).choices || []) as any[]).map((opt: any, optIdx: number) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const optId = typeof opt === 'object' && opt?.id ? String(opt.id) : letter;
                      const optText = typeof opt === 'string' ? opt : (opt?.text || opt?.label || opt?.title || String(opt));
                      const isSelected = selectedAnswers[q.id] === optId || selectedAnswers[q.id] === String(optIdx);

                      return (
                        <div
                          key={optId}
                          onClick={() => {
                            setSelectedAnswers(prev => ({ ...prev, [q.id]: optId }));
                            setActiveQuestionIndex(qIndex);
                          }}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-200 flex items-start gap-3 select-none ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-medium ring-2 ring-emerald-400/30 shadow-xs scale-[1.01]' 
                              : 'border-slate-200/90 hover:border-emerald-300 bg-slate-50/60 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-relaxed pt-0.5 flex-1">{optText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Submit Dock */}
          <div className="sticky bottom-4 z-20 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-600 text-center sm:text-left">
              {Object.keys(selectedAnswers).length === questions.length
                ? 'All questions answered! Ready for Socratic diagnosis.'
                : `Complete all questions (${Object.keys(selectedAnswers).length}/${questions.length}) to submit evaluation.`}
            </span>
            <div className={`relative p-[1.5px] rounded-xl ${Object.keys(selectedAnswers).length === questions.length ? 'conic-beam shadow-md shadow-emerald-500/20' : ''}`}>
              <button
                onClick={handleSubmitEvaluation}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className={`px-7 py-3 rounded-[10px] font-heading font-bold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                  Object.keys(selectedAnswers).length === questions.length
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white btn-shimmer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Submit Evaluation Gate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATE 4: SUBMITTING SPINNER --- */}
      {engineState === 'SUBMITTING' && (
        <div className="view-transition-enter p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-base font-heading font-bold text-slate-900">
            Diagnosing Mental Models & Verifying Mastery Against 75% Threshold...
          </h4>
          <p className="text-xs text-slate-500">
            Synthesizing item-by-item diagnostic feedback via Groq and Tavily.
          </p>
        </div>
      )}

      {/* --- BRANCH 1: PASSED (75%–99%) DUAL-CHOICE PROGRESSION GATE --- */}
      {engineState === 'PASSED_DUAL_CHOICE' && (
        <div className="view-transition-enter p-8 md:p-10 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-3xl text-center shadow-xl space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
            <ShieldCheck className="w-11 h-11" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
              Milestone Cleared (Passing Threshold ≥ 75%)
            </span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">
              Mastery Verified!
            </h3>
            <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              You achieved {lastScore}%, exceeding the 75% passing threshold. Milestone {stepIndex + 1} is now unlocked! Choose whether to advance immediately or sharpen your accuracy for 100% Grandmaster status.
            </p>
          </div>

          {/* Dynamic Score Radial */}
          <AnimatedScoreRadial score={lastScore} />

          {/* XP Gain Bar */}
          <XpGainBar xpGained={150} />

          {/* Dual-Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            {/* Choice A: Advance to Milestone N+1 */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between space-y-4 text-left">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  PROGRESSION ROUTE
                </span>
                <h4 className="text-sm font-heading font-bold text-slate-900 mt-2">
                  Advance to Milestone {stepIndex + 1}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Keep your momentum going and dive straight into the next curriculum tier.
                </p>
              </div>

              <button
                onClick={() => {
                  onStepPassed(lastScore, lastSubmissionData);
                }}
                className="w-full py-3 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-shimmer"
              >
                <span>Advance to Next Level →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Choice B: Take Targeted Perfection Quiz for 100% */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between space-y-4 text-left">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  PERFECTION DRILL
                </span>
                <h4 className="text-sm font-heading font-bold text-slate-900 mt-2">
                  Targeted Perfection Quiz for 100% 🎯
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Drill 2–4 targeted questions exclusively testing the concepts you missed for a +1000 XP bonus.
                </p>
              </div>

              <button
                onClick={() => handleGenerateEvaluation(false, true, failedQuestionIds)}
                className="w-full py-3 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-shimmer"
              >
                <span>Drill Perfection (100%)</span>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BRANCH 2: PASSED (100%) CELEBRATORY GRANDMASTER LAUREL --- */}
      {engineState === 'PASSED_GRANDMASTER' && (
        <div className="view-transition-enter p-8 md:p-12 bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/90 border-2 border-amber-300 rounded-3xl text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-400 p-1 shadow-xl shadow-amber-400/30 animate-pulse">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-amber-500">
                <Award className="w-12 h-12" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 text-2xl animate-bounce">👑</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-amber-900 bg-amber-200 px-4 py-1 rounded-full border border-amber-300 inline-block shadow-xs">
              ★ GRANDMASTER PERFECTION (100% SCORE) ★
            </span>
            <h3 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight">
              Flawless Mastery Achieved!
            </h3>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Every single scenario test and assessable unit verified with 100% precision.
            </p>
          </div>

          {/* Dynamic Score Radial */}
          <AnimatedScoreRadial score={100} />

          {/* XP Gain Bar */}
          <XpGainBar xpGained={1000} />

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-900 font-mono font-black text-base shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
            <span>+1000 XP Grandmaster Bonus Awarded!</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onStepPassed(100, { ...lastSubmissionData, isGrandmaster: true, bonusXp: 1000 })}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-heading font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer btn-shimmer active:scale-95"
            >
              <span>Advance to Milestone {stepIndex + 1} ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* --- BRANCH 3: TARGETED REMEDIATION GATE (SCORE < 75%) --- */}
      {engineState === 'TARGETED_REMEDIATION' && prescription && (
        <div className="view-transition-enter space-y-6">
          {/* Header Banner */}
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
                You do not need to restart the entire step. Review the diagnosed weak areas below to unlock your adaptive retest.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-white/90 px-3.5 py-2 rounded-xl border border-amber-200 shadow-xs shrink-0 self-start md:self-center">
              Passing Threshold: 75% Mastery
            </span>
          </div>

          {/* Diagnostic Weakness Cards with Verified Tavily Links */}
          <div className="space-y-4">
            {(prescription.weakAreas || []).map((area, idx) => {
              const docKey = `doc_${idx}`;
              const videoKey = `video_${idx}`;
              const isDocReviewed = reviewedResources[docKey];
              const isVideoReviewed = reviewedResources[videoKey];

              return (
                <div key={idx} className="p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-heading font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Deficit Concept: {area.topic}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">Unit Focus {idx + 1}</span>
                  </div>

                  {/* Socratic Feedback Side-by-Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl space-y-1">
                      <span className="font-heading font-bold text-rose-900 block mb-1">Identified Misconception:</span>
                      <p className="text-rose-950 leading-relaxed">{area.misconceptionAnalysis}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-1">
                      <span className="font-heading font-bold text-emerald-900 block mb-1">Target Mental Model:</span>
                      <p className="text-emerald-950 leading-relaxed">{area.coreConcept}</p>
                    </div>
                  </div>

                  {/* Clean Icon Remediation Cards (Zero Link Rot, Zero Thumbnails) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Documentation Card */}
                    <button
                      type="button"
                      onClick={() => markResourceReviewed(docKey, 'doc', area.resources?.docUrl || '#', area.resources?.docTitle, area.resources?.criticalTakeaway)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                        isDocReviewed
                          ? 'border-emerald-400 bg-emerald-50/50 text-slate-800'
                          : 'border-slate-200 hover:border-cyan-400 bg-white text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isDocReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-50 text-cyan-700'} flex-shrink-0`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-800 tracking-wider">In-App Reader</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs font-heading font-bold text-slate-900 mt-1 truncate">{area.resources?.docTitle || 'Canonical Reference'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{area.resources?.criticalTakeaway || 'Targeted study reference.'}</p>
                        <span className={`text-[10px] font-bold mt-2 inline-block ${isDocReviewed ? 'text-emerald-700' : 'text-cyan-700'}`}>
                          {isDocReviewed ? '✓ Reviewed' : 'Open in 4-Quadrant Reader →'}
                        </span>
                      </div>
                    </button>

                    {/* Video Card */}
                    <button
                      type="button"
                      onClick={() => markResourceReviewed(videoKey, 'video', area.resources?.videoUrl || '#', area.resources?.videoTitle, area.resources?.criticalTakeaway)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                        isVideoReviewed
                          ? 'border-emerald-400 bg-emerald-50/50 text-slate-800'
                          : 'border-slate-200 hover:border-rose-400 bg-white text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${isVideoReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-700'} flex-shrink-0`}>
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-rose-800 tracking-wider">YouTube Tutorial</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </div>
                        <p className="text-xs font-heading font-bold text-slate-900 mt-1 truncate">{area.resources?.videoTitle || 'Video Walkthrough'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Verified Socratic Walkthrough</p>
                        <span className={`text-[10px] font-bold mt-2 inline-block ${isVideoReviewed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isVideoReviewed ? '✓ Watched' : 'Watch in In-App Player →'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gated Retest Bar */}
          <div className="p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${allPrescribedResourcesReviewed() ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span>
                {allPrescribedResourcesReviewed()
                  ? 'Remedial review complete. You can now take the adaptive retest.'
                  : 'Open each prescribed doc and video above to unlock your retest.'}
              </span>
            </div>
            <div className={`relative p-[1.5px] rounded-xl w-full sm:w-auto ${allPrescribedResourcesReviewed() ? 'conic-beam-amber shadow-md shadow-amber-500/20' : ''}`}>
              <button
                type="button"
                onClick={() => handleGenerateEvaluation(true, false)}
                disabled={!allPrescribedResourcesReviewed()}
                className={`w-full sm:w-auto px-6 py-3 rounded-[10px] font-heading font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  allPrescribedResourcesReviewed()
                    ? 'bg-amber-500 hover:bg-amber-600 text-white btn-shimmer active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>⚡ Take Adaptive Retest (70% Gate)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone In-App Modals */}
      <InAppYouTubePlayerModal
        isOpen={activeVideoModal.isOpen}
        onClose={() => setActiveVideoModal(prev => ({ ...prev, isOpen: false }))}
        videoId={activeVideoModal.videoId}
        videoTitle={activeVideoModal.title}
        takeaway={activeVideoModal.takeaway}
      />

      <InAppContentReaderModal
        isOpen={activeReaderModal.isOpen}
        onClose={() => setActiveReaderModal(prev => ({ ...prev, isOpen: false }))}
        title={activeReaderModal.title}
        sourceUrl={activeReaderModal.sourceUrl}
        corePrinciple={activeReaderModal.corePrinciple}
      />
    </div>
  );
};

export default QuizAndEvaluationEngine;
