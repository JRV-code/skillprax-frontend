// skillprax-frontend/src/components/QuizModal.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, RotateCcw, BookOpen, Loader2, Zap, X, ExternalLink, Video, FileText, Target, Brain, Microscope, Lock, Unlock, ShieldAlert } from 'lucide-react';

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  onPassed: () => Promise<void> | void;
}

export type QuizState = 'UNGENERATED' | 'loading' | 'active' | 'submitting' | 'result' | 'error' | 'TARGETED_REMEDIATION';

interface WeaknessArea {
  topic?: string;
  coreConcept?: string;
  resources?: {
    docTitle: string;
    docUrl: string;
    videoTitle: string;
    videoUrl: string;
    criticalTakeaway: string;
  };
  acuId: string;
  acuLabel: string;
  misconceptionAnalysis: string;
  rootCausePattern: string;
  remediationResources: {
    document: { title: string; url: string; studyGuidance: string };
    video: { title: string; url: string; studyGuidance: string };
  };
}

interface DiagnosticPrescription {
  overallDiagnosis: string;
  weakAreas?: WeaknessArea[];
  weaknessAreas: WeaknessArea[];
  retakeGuidance: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizModal({ isOpen, onClose, stepId, onPassed }: QuizModalProps) {
  const [quizState, setQuizState] = useState<QuizState>('UNGENERATED');
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticPrescription, setDiagnosticPrescription] = useState<DiagnosticPrescription | null>(null);

  // Retention gate: tracks which prescribed resources have been opened
  // Keys are "${weaknessIndex}-doc" and "${weaknessIndex}-video"
  const [reviewedResources, setReviewedResources] = useState<Record<string, boolean>>({});
  const [isRetestLoading, setIsRetestLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (isOpen) {
      setQuizState('UNGENERATED');
      setQuestions([]);
      setAttemptId(null);
      setSelectedAnswers({});
      setEvaluation(null);
      setError(null);
      setDiagnosticPrescription(null);
      setReviewedResources({});
      setIsRetestLoading(false);
    }
  }, [isOpen, stepId]);

  // Compute whether all prescribed resources have been reviewed
  const allResourcesReviewed = useCallback((): boolean => {
    if (!diagnosticPrescription || diagnosticPrescription.weaknessAreas.length === 0) return false;
    for (let i = 0; i < diagnosticPrescription.weaknessAreas.length; i++) {
      if (!reviewedResources[`${i}-doc`] || !reviewedResources[`${i}-video`]) {
        return false;
      }
    }
    return true;
  }, [diagnosticPrescription, reviewedResources]);

  const totalResourceCount = diagnosticPrescription
    ? diagnosticPrescription.weaknessAreas.length * 2
    : 0;
  const reviewedCount = Object.values(reviewedResources).filter(Boolean).length;

  if (!isOpen) return null;

  const markResourceReviewed = (key: string) => {
    setReviewedResources((prev) => ({ ...prev, [key]: true }));
  };

  const loadQuiz = async (retestMode?: boolean) => {
    setQuizState('loading');
    setError(null);
    setEvaluation(null);
    setSelectedAnswers({});
    setDiagnosticPrescription(null);
    setReviewedResources({});
    setIsRetestLoading(false);

    // Build payload — include focusAcus for targeted retest
    const payload: Record<string, any> = {};
    if (retestMode && diagnosticPrescription) {
      payload.retestMode = true;
      payload.focusAcus = diagnosticPrescription.weaknessAreas.map((wa) => wa.acuId);
    }

    try {
      const res = await fetch(`${API_BASE}/api/steps/${stepId}/prompt-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      const rawQuestions: any[] = data.questions || [];

      // Fisher-Yates shuffle options for each question
      const shuffledQuestions = rawQuestions.map((q) => {
        if (Array.isArray(q.options) && q.options.length > 0) {
          return { ...q, options: shuffleArray(q.options) };
        }
        return q;
      });

      setQuestions(shuffledQuestions);
      setAttemptId(data.attemptId || null);
      setQuizState('active');
    } catch (err: any) {
      setError(err.message || 'Unable to prepare evaluation');
      setQuizState('error');
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setQuizState('submitting');
    setError(null);

    const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    try {
      const res = await fetch(`${API_BASE}/api/steps/${stepId}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attemptId || undefined, answers: answersPayload }),
      });

      if (!res.ok) throw new Error('Submission evaluation failed');
      const resultData = await res.json();
      setEvaluation(resultData);

      // Capture diagnostic prescription if present (failure case)
      if (resultData.diagnosticPrescription) {
        const dp = resultData.diagnosticPrescription;
        const rawAreas = Array.isArray(dp.weakAreas) ? dp.weakAreas : Array.isArray(dp.weaknessAreas) ? dp.weaknessAreas : [];
        const normalizedAreas: WeaknessArea[] = rawAreas.map((wa: any, i: number) => {
          const topic = wa.topic || wa.acuLabel || `Competency ${i + 1}`;
          const coreConcept = wa.coreConcept || wa.rootCausePattern || "Conceptual misunderstanding.";
          const docTitle = wa.resources?.docTitle || wa.remediationResources?.document?.title || "Documentation";
          const docUrl = wa.resources?.docUrl || wa.remediationResources?.document?.url || "#";
          const docGuidance = wa.resources?.criticalTakeaway || wa.remediationResources?.document?.studyGuidance || "Key concept for review.";
          const videoTitle = wa.resources?.videoTitle || wa.remediationResources?.video?.title || "Video Walkthrough";
          const videoUrl = wa.resources?.videoUrl || wa.remediationResources?.video?.url || "#";
          const videoGuidance = wa.resources?.criticalTakeaway || wa.remediationResources?.video?.studyGuidance || "Key concept for review.";

          return {
            acuId: wa.acuId || `weak-${i + 1}`,
            acuLabel: topic,
            topic,
            misconceptionAnalysis: wa.misconceptionAnalysis || "Analysis unavailable.",
            rootCausePattern: coreConcept,
            coreConcept,
            resources: {
              docTitle,
              docUrl,
              videoTitle,
              videoUrl,
              criticalTakeaway: docGuidance,
            },
            remediationResources: {
              document: { title: docTitle, url: docUrl, studyGuidance: docGuidance },
              video: { title: videoTitle, url: videoUrl, studyGuidance: videoGuidance },
            },
          };
        });

        setDiagnosticPrescription({
          overallDiagnosis: dp.overallDiagnosis || "Conceptual gaps detected.",
          weakAreas: normalizedAreas,
          weaknessAreas: normalizedAreas,
          retakeGuidance: dp.retakeGuidance || "Review each prescribed resource, then retake the evaluation.",
        });
        setReviewedResources({});
      }

      setQuizState('result');
    } catch (err: any) {
      setError(err.message || 'Failed to score answers');
      setQuizState('error');
    }
  };

  const handleTargetedRetest = async () => {
    setIsRetestLoading(true);
    await loadQuiz(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 text-foreground">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {quizState === 'TARGETED_REMEDIATION' ? (
              <>
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-foreground">⚠️ Competency Gap Detected • Action Required</h2>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h2 className="text-base font-bold text-foreground">Socratic Competency Evaluation</h2>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATE 1: UNGENERATED STANDBY CARD */}
        {quizState === 'UNGENERATED' && (
          <div className="py-12 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <Zap className="w-7 h-7 fill-cyan-400" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-foreground">Socratic Competency Evaluation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                On-demand milestone assessment. Questions are synthesized fresh for this milestone's Assessable Competency Units (ACUs).
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => loadQuiz(false)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                ⚡ Generate Evaluation
              </button>
              <button onClick={onClose} className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: LOADING */}
        {quizState === 'loading' && (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto"/>
            <p className="text-sm text-muted-foreground font-medium">Synthesizing resource-bounded evaluation...</p>
            <p className="text-xs text-slate-500">Formulating scenario assessments calibrated to step competencies.</p>
          </div>
        )}

        {/* STATE 3: ERROR */}
        {quizState === 'error' && (
          <div className="py-8 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto"/>
            <p className="text-sm text-rose-300">{error}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => loadQuiz(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-foreground rounded-lg">
                Retry Generation
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-xs text-muted-foreground rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: SUBMITTING */}
        {quizState === 'submitting' && (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto"/>
            <p className="text-sm text-muted-foreground font-medium">Evaluating distractor options and calculating mastery score...</p>
          </div>
        )}

        {/* STATE 5: IN-PLACE DIAGNOSTIC EVALUATION RESULTS */}
        {quizState === 'result' && evaluation && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border flex items-center justify-between ${
              evaluation.passed ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-rose-950/40 border-rose-800/60'
            }`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${evaluation.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {evaluation.passed ? <CheckCircle2 className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
                  {evaluation.passed ? 'Milestone Passed' : 'COMPETENCY DEFICIT ⚠️'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {evaluation.passed
                    ? 'Demonstrated mastery over all step ACUs.'
                    : 'Score below 80% passing threshold. Targeted weakness analysis is available.'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-foreground">
                  {evaluation.correctCount}/{evaluation.totalQuestions || questions.length} Correct
                </span>
                <span className="block text-xs font-mono font-bold text-amber-400">
                  {evaluation.score}% Mastery Score
                </span>
              </div>
            </div>

            {/* Questions Diagnostic Review */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {(evaluation.results || []).map((r: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{idx + 1}. {r.scenario || r.question}</p>
                    {r.isCorrect ? (
                      <span className="text-emerald-400 font-bold shrink-0">Correct</span>
                    ) : (
                      <span className="text-rose-400 font-bold shrink-0">Missed</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className={`p-2 rounded border ${r.isCorrect ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-300' : 'bg-rose-950/20 border-rose-800/30 text-rose-300'}`}>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500">Your Choice</span>
                      Option {r.chosenOptionId || 'None'}
                    </div>
                    {!r.isCorrect && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-muted-foreground">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">Correct Answer</span>
                        Option {r.correctOptionId}
                      </div>
                    )}
                  </div>

                  {r.whyWrong && (
                    <div className="p-2.5 rounded bg-amber-950/30 border border-amber-900/40 text-amber-200/90 text-[11px]">
                      <span className="font-semibold block text-amber-400 mb-0.5">Misconception Analysis:</span>
                      {r.whyWrong}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              {evaluation.passed ? (
                <button
                  onClick={async () => {
                    onClose();
                    await onPassed();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                >
                  Continue to Next Milestone <ArrowRight className="w-4 h-4"/>
                </button>
              ) : (
                <div className="w-full flex gap-3">
                  {diagnosticPrescription ? (
                    <button
                      onClick={() => setQuizState('TARGETED_REMEDIATION')}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all"
                    >
                      <Target className="w-4 h-4"/> View Targeted Remediation Plan
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4"/> Review Lesson Materials
                    </button>
                  )}
                  <button
                    onClick={() => loadQuiz(false)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4"/> Retake Evaluation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATE 6: ACTIVE QUIZ */}
        {quizState === 'active' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-foreground">Socratic ACU Checkpoint</h3>
              <span className="text-xs font-mono text-cyan-400">{questions.length} Questions</span>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{idx + 1}. {q.scenario || q.question}</p>
                  <div className="space-y-2">
                    {(q.options || []).map((opt: any, optIdx: number) => {
                      const optionKeys = ["A", "B", "C", "D"];
                      const optId = typeof opt === "string" ? optionKeys[optIdx] || String(optIdx) : opt.id || optionKeys[optIdx];
                      const optText = typeof opt === "string" ? opt : opt.text;
                      const isSelected = selectedAnswers[q.id] === optId;

                      return (
                        <button
                          key={optId}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optId)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-400 text-foreground shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-900/50 border-slate-800 text-muted-foreground hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                            isSelected ? 'bg-cyan-400 text-slate-950 border-cyan-400' : 'border-slate-700 text-muted-foreground'
                          }`}>
                            {optId}
                          </span>
                          <span className="pt-0.5">{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button onClick={onClose} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                disabled={Object.keys(selectedAnswers).length < questions.length}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Submit Evaluation
              </button>
            </div>
          </div>
        )}

        {/* STATE 7: TARGETED REMEDIATION — GATED WEAKNESS ASSESSMENT DASHBOARD */}
        {quizState === 'TARGETED_REMEDIATION' && diagnosticPrescription && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3">

            {/* Alert Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-amber-950/40 border border-amber-700/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/50 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300">🚨 Competency Gap Detected — Action Required</h3>
                    {evaluation && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-mono font-black text-amber-400">
                        Score: {evaluation.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-200/70 leading-relaxed mt-1">{diagnosticPrescription.overallDiagnosis}</p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">
                    You do not need to restart this step. Focus strictly on repairing the weak areas identified below.
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Review Progress Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                {allResourcesReviewed() ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                Study Progress: <span className="font-mono font-bold text-foreground">{reviewedCount}/{totalResourceCount}</span> resources reviewed
              </span>
              <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: totalResourceCount > 0 ? `${(reviewedCount / totalResourceCount) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Weakness Deficit Cards */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {diagnosticPrescription.weaknessAreas.map((wa, idx) => {
                const docKey = `${idx}-doc`;
                const videoKey = `${idx}-video`;
                const docReviewed = !!reviewedResources[docKey];
                const videoReviewed = !!reviewedResources[videoKey];

                return (
                  <div key={wa.acuId || idx} className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                    {/* Deficit Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-900/90 to-amber-950/20 border-b border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-950/80 border border-rose-800/40 flex items-center justify-center text-[10px] font-black text-rose-400">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">Deficit in: {wa.topic || wa.acuLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {docReviewed && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        {videoReviewed && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Side-by-side: Misconception vs Correct Concept */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Your Mental Trap */}
                        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Microscope className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Your Mental Trap</span>
                          </div>
                          <p className="text-[11px] text-amber-200/85 leading-relaxed">{wa.misconceptionAnalysis}</p>
                        </div>

                        {/* Correct Concept */}
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Correct Concept</span>
                          </div>
                          <p className="text-[11px] text-emerald-200/80 leading-relaxed">{wa.coreConcept || wa.rootCausePattern}</p>
                        </div>
                      </div>

                      {/* Prescribed Read & Watch */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-3 h-3" /> Prescribed Read & Watch
                        </span>

                        {/* Document Resource */}
                        <a
                          href={wa.resources?.docUrl || wa.remediationResources.document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markResourceReviewed(docKey)}
                          className={`block p-3 rounded-lg border transition-all group ${
                            docReviewed
                              ? 'bg-blue-950/30 border-blue-600/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                              : 'bg-blue-950/15 border-blue-800/30 hover:border-blue-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                              docReviewed ? 'bg-blue-600/30 border-blue-500/50' : 'bg-blue-950/60 border-blue-800/40'
                            }`}>
                              {docReviewed ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-blue-400 uppercase">Read Section →</span>
                                {docReviewed && <span className="text-[9px] font-mono text-emerald-400">✓ Reviewed</span>}
                                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition ml-auto" />
                              </div>
                              <p className="text-xs font-semibold text-foreground mt-0.5 group-hover:text-blue-300 transition truncate">
                                {wa.resources?.docTitle || wa.remediationResources.document.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                {wa.resources?.criticalTakeaway || wa.remediationResources.document.studyGuidance}
                              </p>
                            </div>
                          </div>
                        </a>

                        {/* Video Resource */}
                        <a
                          href={wa.resources?.videoUrl || wa.remediationResources.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markResourceReviewed(videoKey)}
                          className={`block p-3 rounded-lg border transition-all group ${
                            videoReviewed
                              ? 'bg-rose-950/30 border-rose-600/50 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                              : 'bg-rose-950/15 border-rose-800/30 hover:border-rose-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                              videoReviewed ? 'bg-rose-600/30 border-rose-500/50' : 'bg-rose-950/60 border-rose-800/40'
                            }`}>
                              {videoReviewed ? <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> : <Video className="w-3.5 h-3.5 text-rose-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-rose-400 uppercase">Watch Segment →</span>
                                {videoReviewed && <span className="text-[9px] font-mono text-emerald-400">✓ Reviewed</span>}
                                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-rose-400 transition ml-auto" />
                              </div>
                              <p className="text-xs font-semibold text-foreground mt-0.5 group-hover:text-rose-300 transition truncate">
                                {wa.resources?.videoTitle || wa.remediationResources.video.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                {wa.resources?.criticalTakeaway || wa.remediationResources.video.studyGuidance}
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Retake Action Bar */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              {/* Retake Guidance */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Ready to Clear These Areas?</span>
                <p className="text-xs text-cyan-200/80 leading-relaxed">{diagnosticPrescription.retakeGuidance}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setQuizState('result')}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Results
                </button>

                {/* GATED RETEST BUTTON — locked until all resources reviewed */}
                <button
                  disabled={!allResourcesReviewed() || isRetestLoading}
                  onClick={handleTargetedRetest}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    allResourcesReviewed()
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isRetestLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Targeted Retest...
                    </>
                  ) : allResourcesReviewed() ? (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      ⚡ Take Targeted Retest
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Review All Resources to Unlock ({reviewedCount}/{totalResourceCount})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizModal;
