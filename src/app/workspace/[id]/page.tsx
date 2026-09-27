'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  RefreshCw,
  Loader2,
  Youtube,
  FileText,
  MessageSquare,
  Globe,
  Radio,
  BarChart3,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import api from '@/lib/api';
import {
  WorkspaceDTO,
  SkillStepDTO,
  QuizQuestion,
  BookRecommendation,
  ResourceItem,
} from '@/lib/types';

export default function WorkspaceStudioPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<WorkspaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Literature Vault Toggle
  const [showVault, setShowVault] = useState(false);

  // Gate Modal States
  // Gate 1: Readiness Confirmation Modal
  const [isReadinessOpen, setIsReadinessOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SkillStepDTO | null>(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Gate 2: Quiz Arena Modal
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Gate 3: Adaptive Remediation State
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);
  const [remediationData, setRemediationData] = useState<{
    diagnosticReport?: string;
    weakConcepts?: string[];
    remedialResources?: Array<{ title: string; url: string; type: string; focusArea?: string }>;
    score?: number;
    passingScore?: number;
  } | null>(null);

  // Gate 4: Step Transition Gate State
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [passedScore, setPassedScore] = useState(100);

  const fetchWorkspace = async () => {
    setLoading(true);
    try {
      const data = await api.workspaces.getById(workspaceId);
      setWorkspace(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchWorkspace();
  }, [workspaceId]);

  // Helper resource icon selector
  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-400" />;
      case 'docs':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'reddit':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  // GATE 1: User clicks "I have completed study materials"
  const handleOpenReadinessGate = (step: SkillStepDTO) => {
    setSelectedStep(step);
    setSelectedQuestionCount(step.questionCount || 5);
    setQuizError(null);
    setIsReadinessOpen(true);
  };

  // GATE 1 -> GATE 2: Confirm readiness and fetch quiz questions
  const handleBeginEvaluation = async () => {
    if (!selectedStep) return;
    setIsReadinessOpen(false);
    setIsEvaluating(true);
    setIsQuizOpen(true);
    setCurrentQIndex(0);
    setUserAnswers({});
    setQuizError(null);

    try {
      const res = await api.steps.promptQuiz(selectedStep.id, selectedQuestionCount);
      setQuizQuestions(res.questions || []);
    } catch (err: any) {
      setQuizError(err.message || 'Failed to generate quiz questions.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // GATE 2: Submit quiz answers
  const handleSubmitQuiz = async () => {
    if (!selectedStep) return;
    setIsEvaluating(true);

    const answersPayload = quizQuestions.map((q) => ({
      questionId: q.id,
      selectedOptionIndex: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1,
    }));

    try {
      const evalResult = await api.steps.evaluate(selectedStep.id, answersPayload);
      setIsQuizOpen(false);

      if (evalResult.passed) {
        // Trigger Confetti Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setPassedScore(evalResult.score);
        setIsTransitionOpen(true);
      } else {
        // Open Gate 3: Remediation Panel
        setRemediationData({
          diagnosticReport: evalResult.diagnosticReport,
          weakConcepts: evalResult.weakConcepts,
          remedialResources: evalResult.remedialResources,
          score: evalResult.score,
          passingScore: evalResult.passingScore,
        });
        setIsRemediationOpen(true);
      }

      await fetchWorkspace();
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message || err}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // GATE 3 -> GATE 2: Trigger Remedial Quiz
  const handleStartRemedialQuiz = async () => {
    if (!selectedStep) return;
    setIsRemediationOpen(false);
    setIsEvaluating(true);
    setIsQuizOpen(true);
    setCurrentQIndex(0);
    setUserAnswers({});

    try {
      const res = await api.steps.remedialQuiz(selectedStep.id);
      setQuizQuestions(res.questions || []);
    } catch (err: any) {
      alert(`Failed to generate remedial quiz: ${err.message || err}`);
      setIsQuizOpen(false);
    } finally {
      setIsEvaluating(false);
    }
  };

  // GATE 4: Advance to Step N+1
  const handleAdvanceNextStep = async () => {
    setIsGeneratingNext(true);
    try {
      await api.workspaces.generateNextStep(workspaceId);
      setIsTransitionOpen(false);
      await fetchWorkspace();
    } catch (err: any) {
      alert(`Failed to generate next step: ${err.message || err}`);
    } finally {
      setIsGeneratingNext(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-xs font-mono text-slate-400">Loading Learning Studio Workspace...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-slate-100 p-8">
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">Workspace Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'Workspace could not be loaded.'}</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-[#12151F] border border-[#1E2436] text-xs text-cyan-400"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = workspace.steps.find((s) => s.status === 'IN_PROGRESS' || s.status === 'READY_FOR_QUIZ') || workspace.steps[workspace.steps.length - 1];

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 bg-cyber-grid p-4 sm:p-8">
      {/* HUD Navigation Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between border-b border-[#1E2436] pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-[#12151F] border border-[#1E2436] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 uppercase">
                {workspace.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/40 text-[11px] font-mono text-purple-300">
                Engine: {workspace.aiProvider?.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
              {workspace.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-mono">Mastery Completion</span>
            <p className="text-lg font-bold text-cyan-400 font-mono">
              {workspace.completionPercentage}%
            </p>
          </div>

          <button
            onClick={() => setShowVault(!showVault)}
            className="px-4 py-2.5 rounded-xl bg-[#12151F] border border-[#1E2436] hover:border-cyan-500/50 text-xs font-medium text-slate-200 transition flex items-center gap-2 cyber-glow-cyan"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Literature Vault ({workspace.recommendedBooks?.length || 0})</span>
            {showVault ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* COLLAPSIBLE FOUNDATIONAL LITERATURE VAULT */}
        <AnimatePresence>
          {showVault && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] cyber-glow-cyan space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2436] pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      Foundational Literature Vault
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Curated by AI Curriculum Engine</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {workspace.recommendedBooks?.map((book: BookRecommendation, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#090A0F] border border-[#1E2436] flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{book.title}</h4>
                        <p className="text-[11px] text-cyan-400 font-mono mt-0.5">by {book.author}</p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {book.whyRead}
                        </p>
                      </div>

                      <a
                        href={book.searchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-2 border-t border-[#1E2436]"
                      >
                        <span>Search & Access Book</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE GOAL SUMMARY CARD */}
        <div className="p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Target Competency Milestone
            </span>
            <p className="text-sm font-semibold text-slate-200 mt-1">
              "{workspace.targetGoal}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-slate-300 font-medium">Learner Baseline: </span>
              {workspace.baselineKnowledge}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-center">
              <span className="text-[10px] font-mono text-slate-500 block">Total Steps</span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {workspace.estimatedTotalSteps}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-center">
              <span className="text-[10px] font-mono text-slate-500 block">Passed Steps</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {workspace.passedStepsCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* VERTICAL ROADMAP */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Flame className="w-5 h-5 text-cyan-400" />
            Skill Mastery Roadmap
          </h2>

          <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#1E2436]">
            {workspace.steps.map((step) => {
              const isPassed = step.status === 'PASSED';
              const isActive = step.id === activeStep?.id;
              const isLocked = !isPassed && !isActive;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative pl-14"
                >
                  {/* Step Timeline Indicator Node */}
                  <div
                    className={`absolute left-0 top-6 w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm z-10 border transition-all ${
                      isPassed
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 cyber-glow-emerald'
                        : isActive
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 animate-pulse cyber-glow-cyan'
                        : 'bg-[#090A0F] border-[#1E2436] text-slate-600'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : isLocked ? <Lock className="w-5 h-5 text-slate-600" /> : `S${step.stepIndex}`}
                  </div>

                  {/* Step Card */}
                  <div
                    className={`p-6 rounded-2xl border transition-all ${
                      isPassed
                        ? 'bg-[#12151F]/90 border-emerald-500/30'
                        : isActive
                        ? 'bg-[#12151F] border-cyan-500 cyber-glow-cyan'
                        : 'bg-[#090A0F]/60 border-[#1E2436]/50 opacity-60'
                    }`}
                  >
                    {/* Step Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono border ${
                            step.difficulty === 'Beginner'
                              ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                              : step.difficulty === 'Intermediate'
                              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                              : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                          }`}
                        >
                          {step.difficulty}
                        </span>

                        <h3 className="text-base font-bold text-slate-100">
                          Step {step.stepIndex}: {step.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">
                          Threshold: <strong className="text-cyan-400">{step.passingScore}%</strong> ({step.questionCount} Questions)
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                            isPassed
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : isActive
                              ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          {isPassed ? 'PASSED' : isActive ? 'ACTIVE STUDY' : 'LOCKED'}
                        </span>
                      </div>
                    </div>

                    {/* Pedagogical Breakdown: What You Will Master */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Conceptual Overview & Architecture
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                          Estimated Time: ~{step.estimatedMinutes || 45} mins
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1E2436] text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {step.whatYouWillLearn}
                      </div>

                      {/* Core Key Takeaways Checklist Pills */}
                      {Array.isArray(step.coreKeyTakeaways) && step.coreKeyTakeaways.length > 0 && (
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                            Core Key Takeaways & Mental Models:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {step.coreKeyTakeaways.map((takeaway: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="px-3 py-1.5 rounded-lg bg-[#090A0F] border border-[#1E2436] text-[11px] font-medium text-slate-200 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                {takeaway}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practical Real-World Application Callout */}
                      {step.practicalApplication && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                          <span className="font-bold text-cyan-300 block mb-0.5">Real-World Goal Application:</span>
                          <p className="text-slate-300">{step.practicalApplication}</p>
                        </div>
                      )}
                    </div>

                    {/* Curated Priority-Ordered Resource Path */}
                    {!isLocked && (
                      <div className="mt-6 pt-5 border-t border-[#1E2436] space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            Priority-Ordered Learning Path (Sequential Study Checklist)
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            Strictly Ranked 1 to 3 items
                          </span>
                        </div>

                        <div className="space-y-3">
                          {step.resources?.map((res: ResourceItem, rIdx: number) => {
                            const priority = res.priority || rIdx + 1;
                            const badge =
                              res.badge ||
                              (priority === 1
                                ? 'START HERE'
                                : priority === 2
                                ? 'APPLY & PRACTICE'
                                : 'DEEP DIVE');
                            const isFirst = priority === 1;

                            return (
                              <div
                                key={rIdx}
                                className={`p-4 rounded-xl border transition-all ${
                                  isFirst
                                    ? 'bg-cyan-950/30 border-cyan-500/50 cyber-glow-cyan'
                                    : 'bg-[#090A0F] border-[#1E2436]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div
                                      className={`p-2 rounded-lg border shrink-0 ${
                                        isFirst
                                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                                          : 'bg-[#12151F] border-[#1E2436] text-slate-400'
                                      }`}
                                    >
                                      {getResourceIcon(res.type)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span
                                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${
                                            isFirst
                                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                              : priority === 2
                                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                              : 'bg-purple-500/20 border-purple-400 text-purple-300'
                                          }`}
                                        >
                                          Priority {priority}: {badge}
                                        </span>
                                        <h5 className="text-xs font-bold text-slate-100">{res.title}</h5>
                                      </div>

                                      {res.whyThisFirst && (
                                        <p className="text-[11px] text-slate-300 leading-normal mt-1 font-mono">
                                          <strong className="text-cyan-400 font-semibold">Study Rationale: </strong>
                                          {res.whyThisFirst}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium transition flex items-center gap-1.5 shrink-0"
                                  >
                                    <span>Access Resource</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Active Step Action Bar (GATE 1 Trigger) */}
                    {isActive && (
                      <div className="mt-6 pt-4 border-t border-[#1E2436] flex justify-end">
                        <button
                          onClick={() => handleOpenReadinessGate(step)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          I Have Completed Materials — Take Evaluation Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GATE 1: READINESS CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {isReadinessOpen && selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#12151F] border border-[#1E2436] p-6 space-y-6 cyber-glow-cyan"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Confirm Readiness Gate</h3>
                  <p className="text-xs text-slate-400">Step {selectedStep.stepIndex}: {selectedStep.title}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] space-y-4 text-xs text-slate-300">
                <p>
                  Are you ready to test your understanding of this step?
                </p>
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    Select Evaluation Question Volume:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 3, label: 'Quick Check', time: '~5 mins' },
                      { count: 5, label: 'Standard', time: '~10 mins' },
                      { count: 10, label: 'Deep Diagnostic', time: '~20 mins' },
                    ].map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setSelectedQuestionCount(opt.count)}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedQuestionCount === opt.count
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 cyber-glow-cyan'
                            : 'bg-[#12151F] border-[#1E2436] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold block text-slate-200">{opt.label}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{opt.count} Questions ({opt.time})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] pt-1 border-t border-[#1E2436]">
                  <span>Passing Score: <strong className="text-cyan-400">{selectedStep.passingScore}%</strong></span>
                  <span>Target Count: <strong className="text-cyan-400">{selectedQuestionCount} Questions</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsReadinessOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBeginEvaluation}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  Begin {selectedQuestionCount}-Question Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GATE 2: QUIZ ARENA MODAL */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-[#12151F] border border-[#1E2436] p-6 sm:p-8 space-y-6 cyber-glow-cyan relative overflow-hidden"
            >
              {isEvaluating ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <Radio className="w-8 h-8 text-cyan-400 animate-radar" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">AI Evaluation Scanner</h3>
                    <p className="text-xs font-mono text-cyan-400 mt-1 animate-pulse">
                      Analyzing responses against step competency criteria...
                    </p>
                  </div>
                </div>
              ) : quizError ? (
                <div className="py-8 space-y-4">
                  <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>Quiz AI Error</span>
                    </div>
                    <p className="text-xs font-mono break-all select-all text-slate-200 leading-relaxed">
                      {quizError}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsQuizOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleBeginEvaluation}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                    >
                      Retry Quiz Generation
                    </button>
                  </div>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                  <p className="text-xs font-mono">Generating dynamic evaluation questions...</p>
                </div>
              ) : (
                <>
                  {/* Quiz Arena Header */}
                  <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                        Evaluation Question {currentQIndex + 1} of {quizQuestions.length}
                      </span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">
                        {selectedStep?.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {quizQuestions.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full transition ${
                            idx === currentQIndex
                              ? 'bg-cyan-400 cyber-glow-cyan'
                              : userAnswers[quizQuestions[idx]?.id] !== undefined
                              ? 'bg-emerald-400'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Question Card */}
                  {quizQuestions[currentQIndex] && (
                    <motion.div
                      key={quizQuestions[currentQIndex].id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h4 className="text-base font-semibold text-slate-100 leading-snug">
                        {quizQuestions[currentQIndex].question}
                      </h4>

                      <div className="space-y-2.5 pt-2">
                        {quizQuestions[currentQIndex].options.map((opt, oIdx) => {
                          const isSelected = userAnswers[quizQuestions[currentQIndex].id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() =>
                                setUserAnswers({
                                  ...userAnswers,
                                  [quizQuestions[currentQIndex].id]: oIdx,
                                })
                              }
                              className={`w-full p-4 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 cyber-glow-cyan font-medium'
                                  : 'bg-[#090A0F] border-[#1E2436] text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Quiz Navigation Footer */}
                  <div className="pt-4 border-t border-[#1E2436] flex justify-between items-center">
                    <button
                      onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                      disabled={currentQIndex === 0}
                      className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs disabled:opacity-30"
                    >
                      Previous
                    </button>

                    {currentQIndex < quizQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(currentQIndex + 1)}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <Sparkles className="w-4 h-4 fill-current" />
                        Submit Evaluation
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GATE 3: ADAPTIVE REMEDIATION PANEL MODAL */}
      <AnimatePresence>
        {isRemediationOpen && remediationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-[#12151F] border border-amber-500/40 p-6 sm:p-8 space-y-6 cyber-glow-amber max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300">Adaptive Remediation Triggered</h3>
                  <p className="text-xs text-slate-400">
                    Score: <strong className="text-amber-400 font-mono">{remediationData.score}%</strong> (Passing score required: {remediationData.passingScore}%)
                  </p>
                </div>
              </div>

              {/* Diagnostic AI Analysis */}
              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  AI Logic Diagnostic Report
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {remediationData.diagnosticReport}
                </p>
              </div>

              {/* Weak Concepts Badges */}
              {remediationData.weakConcepts && remediationData.weakConcepts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Detected Weak Concepts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {remediationData.weakConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Remedial Search Links */}
              {remediationData.remedialResources && remediationData.remedialResources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Targeted Remedial Resources
                  </h4>
                  <div className="space-y-2">
                    {remediationData.remedialResources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2436] hover:border-amber-500/50 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">{res.title}</p>
                          <p className="text-[11px] text-amber-400 font-mono mt-0.5">{res.focusArea}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#1E2436] flex justify-end gap-3">
                <button
                  onClick={() => setIsRemediationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs"
                >
                  Review Study Materials
                </button>
                <button
                  onClick={handleStartRemedialQuiz}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Remedial Quiz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GATE 4: STEP TRANSITION GATE MODAL */}
      <AnimatePresence>
        {isTransitionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#12151F] border border-emerald-500/40 p-6 sm:p-8 space-y-6 cyber-glow-emerald text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  Evaluation Passed!
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  Step {selectedStep?.stepIndex} Mastered!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Score achieved: <strong className="text-emerald-400 font-mono">{passedScore}%</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-xs text-slate-300">
                <p>
                  You have successfully demonstrated competency in "{selectedStep?.title}". Ready to synthesize step {workspace.currentStepIndex + 1}?
                </p>
              </div>

              <button
                onClick={handleAdvanceNextStep}
                disabled={isGeneratingNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isGeneratingNext ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Step {workspace.currentStepIndex + 1}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" /> Step Mastered! Analyze Progress & Generate Step {workspace.currentStepIndex + 1}
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
