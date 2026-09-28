// skillprax-frontend/src/components/QuizModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, RotateCcw, BookOpen, Loader2 } from 'lucide-react';

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  onPassed: () => Promise<void> | void;
}

export function QuizModal({ isOpen, onClose, stepId, onPassed }: QuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setEvaluation(null);
    setSelectedAnswers({});
    try {
      const res = await fetch(`${API_BASE}/api/steps/${stepId}/prompt-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      setQuestions(data.questions || []);
      setAttemptId(data.attemptId || null);
    } catch (err: any) {
      setError(err.message || 'Unable to prepare quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stepId) {
      loadQuiz();
    }
  }, [isOpen, stepId]);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
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
    } catch (err: any) {
      setError(err.message || 'Failed to score answers');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 text-slate-100">
        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto"/>
            <p className="text-sm text-slate-300 font-medium">Synthesizing resource-bounded evaluation...</p>
            <p className="text-xs text-slate-500">Formulating scenario assessments calibrated to step competencies.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-8 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto"/>
            <p className="text-sm text-rose-300">{error}</p>
            <div className="flex justify-center gap-3">
              <button onClick={loadQuiz} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg">
                Retry Generation
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-xs text-slate-400 rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Diagnostic Results Screen */}
        {!loading && !error && evaluation && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              evaluation.passed ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-amber-950/40 border-amber-800/60'
            }`}>
              <div>
                <h3 className={`text-base font-bold flex items-center gap-2 ${evaluation.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {evaluation.passed ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                  {evaluation.passed ? 'Milestone Passed' : 'Competency Review Required'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {evaluation.passed
                    ? 'You have demonstrated mastery over the core mechanisms in this step.'
                    : 'Score below 80% passing threshold. Inspect the misconceptions below before re-attempting.'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-white">{evaluation.score}%</span>
                <span className="block text-[10px] text-slate-400">Req: 80%</span>
              </div>
            </div>

            {/* Questions Diagnostic Review */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {(evaluation.results || []).map((r: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-200">{idx + 1}. {r.scenario || r.question}</p>
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
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
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
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4"/> Review Lesson Materials
                  </button>
                  <button
                    onClick={loadQuiz}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4"/> Retake Evaluation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Taking Quiz Screen */}
        {!loading && !error && !evaluation && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Competency Evaluation</h2>
              <span className="text-xs font-mono text-cyan-400">{questions.length} Questions</span>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="space-y-3">
                  <p className="text-sm font-medium text-slate-100">{idx + 1}. {q.scenario || q.question}</p>
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
                              ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                            isSelected ? 'bg-cyan-400 text-slate-950 border-cyan-400' : 'border-slate-700 text-slate-400'
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
              <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-slate-950 font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                Submit Evaluation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizModal;
