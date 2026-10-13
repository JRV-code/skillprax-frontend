'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  Sparkles, RefreshCw, Award, BookOpen, Check, HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface QuizQuestionItem {
  id?: string;
  question: string;
  options: string[] | Array<{ id: string; text: string }>;
  correctOptionIndex?: number;
  correctOptionId?: string;
  explanation?: string;
}

export interface SocraticQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestionItem[];
  stepId?: string;
  stepTitle?: string;
  stepNumber?: number;
  onPassed?: (score: number) => void;
}

export function SocraticQuizModal({
  isOpen,
  onClose,
  questions,
  stepId,
  stepTitle = 'Step Milestone',
  stepNumber = 1,
  onPassed,
}: SocraticQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    passed: boolean;
    passingThreshold: number;
    correctCount: number;
    totalQuestions: number;
    questionBreakdown: Array<{
      questionIndex: number;
      question: string;
      options: string[];
      userSelectedIndex: number | null;
      correctOptionIndex: number;
      correctOptionLabel: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  } | null>(null);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length;
  const allAnswered = totalQ > 0 && Object.keys(selectedAnswers).length === totalQ;

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleEvaluate = async () => {
    if (!allAnswered || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers: selectedAnswers,
          stepId,
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation failed. Please try again.');
      }

      const data = await res.json();
      setEvaluationResult(data);

      if (data.passed) {
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
        if (onPassed) {
          onPassed(data.score);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Unable to score quiz. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setEvaluationResult(null);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center font-bold text-xs font-mono">
              Q{stepNumber}
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                Socratic Concept Verification
              </h2>
              <p className="text-[11px] text-slate-500 truncate max-w-md">
                {stepTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {!evaluationResult ? (
            /* ACTIVE QUIZ QUESTIONS VIEW */
            totalQ === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">No questions loaded for this milestone.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Question <strong className="text-slate-900">{currentQuestionIndex + 1}</strong> of {totalQ}
                  </span>
                  <span className="font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                    70% Mastery Required
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
                  />
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Diagnostic Challenge
                  </span>
                  <p className="text-base font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </p>
                </div>

                {/* Visible High-Contrast Options Mapping */}
                <div className="space-y-3">
                  {((currentQ?.options || (currentQ as any)?.choices || []) as any[]).map((optItem: any, idx: number) => {
                    const optionLabel = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                    const optionText = typeof optItem === 'string' ? optItem : (optItem.text || optItem.label || optItem.title || String(optItem));

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestionIndex, idx)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-950 font-medium shadow-sm'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {optionLabel}
                        </span>
                        <span className="text-sm md:text-base text-slate-800 leading-snug flex-1">
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < totalQ - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled={!allAnswered || isSubmitting}
                      onClick={handleEvaluate}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Scoring...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Submit & Score Evaluation</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* EVALUATION RESULTS & SCORE GRAPH ANIMATION */
            <div className="space-y-6">
              {/* Score Card Banner */}
              <div
                className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  evaluationResult.passed
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-md ${
                      evaluationResult.passed ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    {evaluationResult.passed ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertTriangle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {evaluationResult.passed ? 'Mastery Verified! Milestone Passed' : 'Mastery Gap Detected'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {evaluationResult.passed
                        ? 'Demonstrated authentic comprehension of all step documentation mechanics.'
                        : 'Score strictly below 70% threshold. Review step documentation and retry.'}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-3xl font-black font-mono">
                    {evaluationResult.score}%
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    {evaluationResult.correctCount} / {evaluationResult.totalQuestions} Correct
                  </div>
                </div>
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Detailed Question Breakdown
                </h4>
                {evaluationResult.questionBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">
                        {idx + 1}. {item.question}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                          Your Choice
                        </span>
                        Option {item.userSelectedIndex !== null ? ['A', 'B', 'C', 'D'][item.userSelectedIndex] : 'None'}
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-medium">
                        <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-bold">
                          Correct Option
                        </span>
                        Option {item.correctOptionLabel}
                      </div>
                    </div>

                    {item.explanation && (
                      <p className="text-[11px] text-slate-600 leading-relaxed pt-1 bg-white p-2.5 rounded-lg border border-slate-200/60">
                        💡 <strong>Pedagogical Grounding:</strong> {item.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {!evaluationResult.passed ? (
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Review Documentation & Retake Quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Continue Learning Trajectory ➔</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocraticQuizModal;
