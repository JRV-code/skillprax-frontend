// skillprax-frontend/src/components/QuizModal.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export type QuizState = "idle" | "loading" | "active" | "submitting" | "result" | "error";

export interface QuizQuestionOption {
  id?: string;
  text: string;
}

export interface StudentQuestion {
  id: string;
  acuId?: string;
  scenario?: string;
  question: string;
  options: string[];
}

export interface DiagnosticItem {
  questionId: string;
  acuId?: string;
  question?: string;
  isCorrect: boolean;
  chosenOption: string;
  correctOption: string;
  whyWrong: string;
}

export interface QuizResultPayload {
  attemptId: string;
  scorePercent: number;
  passed: boolean;
  passingThresholdPercent?: number;
  correctCount: number;
  totalQuestions: number;
  diagnostic: DiagnosticItem[];
}

interface QuizModalProps {
  stepId: string;
  isOpen: boolean;
  onClose: () => void;
  onPassed: () => Promise<void> | void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function QuizModal({ stepId, isOpen, onClose, onPassed }: QuizModalProps) {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [result, setResult] = useState<QuizResultPayload | null>(null);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);

  // Reset and fetch quiz on open
  const fetchQuiz = useCallback(async () => {
    if (!stepId || !isOpen) return;
    setQuizState("loading");
    setErrorMessage("");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setAttemptId(null);
    setShowUnansweredConfirm(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/steps/${stepId}/prompt-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch quiz (HTTP ${res.status})`);
      }

      const data = await res.json();
      const rawQuestions: StudentQuestion[] = data.questions || [];

      if (rawQuestions.length === 0) {
        throw new Error("Quiz evaluation returned 0 questions. Please try again.");
      }

      setAttemptId(data.attemptId || null);
      setQuestions(rawQuestions);
      setQuizState("active");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load evaluation quiz.");
      setQuizState("error");
    }
  }, [stepId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    } else {
      setQuizState("idle");
    }
  }, [isOpen, fetchQuiz]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionIndex = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const handleSubmitQuiz = async () => {
    if (!stepId || !attemptId) return;

    if (answeredCount < questions.length && !showUnansweredConfirm) {
      setShowUnansweredConfirm(true);
      return;
    }

    setQuizState("submitting");
    setShowUnansweredConfirm(false);

    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] !== undefined ? answers[q.id] : -1,
      }));

      const res = await fetch(`${API_BASE_URL}/api/steps/${stepId}/submit-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: payloadAnswers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to submit evaluation (HTTP ${res.status})`);
      }

      const data: QuizResultPayload = await res.json();
      setResult(data);
      setQuizState("result");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit evaluation quiz.");
      setQuizState("error");
    }
  };

  const handleSafeClose = () => {
    if ((quizState === "active" || quizState === "submitting") && answeredCount > 0) {
      if (confirm("You have an evaluation quiz in progress. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-3xl rounded-3xl bg-[#12151F] border border-[#1E2436] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2436] px-6 py-4 bg-[#090A0F]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">ACU Diagnostic Evaluation</h2>
              <p className="text-[11px] text-slate-400 font-mono">Passing Score: 80% Threshold</p>
            </div>
          </div>

          <button
            onClick={handleSafeClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content by State */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* LOADING STATE */}
          {quizState === "loading" && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Zap className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Calibrating Diagnostic Quiz</h3>
                <p className="text-xs font-mono text-cyan-400 mt-1">Generating ACU scenarios & distractor options...</p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {quizState === "error" && (
            <div className="py-12 px-6 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Evaluation Unavailable</h3>
                <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={fetchQuiz}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Evaluation
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE QUIZ STATE */}
          {quizState === "active" && currentQuestion && (
            <div className="space-y-6">
              
              {/* Question Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-400">
                    {answeredCount} of {questions.length} Answered
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#090A0F] border border-[#1E2436] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Scenario Context if available */}
              {currentQuestion.scenario && (
                <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                    Scenario Context
                  </span>
                  <p>{currentQuestion.scenario}</p>
                </div>
              )}

              {/* Question Prompt */}
              <div>
                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Accessible Radio-style Option Cards */}
              <div className="space-y-3" role="radiogroup" aria-label="Quiz question options">
                {currentQuestion.options.map((optText, optIdx) => {
                  const isSelected = selectedOptionIndex === optIdx;
                  const optionKey = ["A", "B", "C", "D"][optIdx] || String(optIdx + 1);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? "bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950"
                          : "bg-[#090A0F] border-[#1E2436] text-slate-300 hover:border-slate-700 hover:text-slate-100"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                        }`}
                      >
                        {optionKey}
                      </div>
                      <span className="text-xs leading-relaxed pt-0.5">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unanswered Confirmation Warning */}
              {showUnansweredConfirm && (
                <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>
                      You have left {questions.length - answeredCount} questions unanswered. Submit evaluation anyway?
                    </span>
                  </div>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0"
                  >
                    Confirm Submit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUBMITTING STATE */}
          {quizState === "submitting" && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-slate-100">Scoring Server-Side Evaluation</h3>
                <p className="text-xs font-mono text-cyan-400 mt-1">Analyzing ACU competencies & distractor feedback...</p>
              </div>
            </div>
          )}

          {/* RESULT & DIAGNOSTIC REVIEW STATE */}
          {quizState === "result" && result && (
            <div className="space-y-6">
              
              {/* Overall Score & Pass/Fail Banner */}
              <div
                className={`p-6 rounded-3xl border text-center space-y-3 ${
                  result.passed
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto font-black text-xl border">
                  {result.passed ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400" />
                  )}
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest block font-bold">
                    {result.passed ? "Evaluation Passed" : "Evaluation Threshold Not Met"}
                  </span>
                  <h3 className="text-3xl font-black tracking-tight mt-1">
                    {result.scorePercent}% Score
                  </h3>
                  <p className="text-xs mt-1 text-slate-400">
                    {result.correctCount} of {result.totalQuestions} Questions Correct (80% Required to Advance)
                  </p>
                </div>
              </div>

              {/* Per-Question Diagnostic Review */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Diagnostic Competency Review ({result.diagnostic.length} Items)
                </h4>

                <div className="space-y-3">
                  {result.diagnostic.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                        item.isCorrect
                          ? "bg-[#090A0F] border-emerald-500/30"
                          : "bg-[#090A0F] border-rose-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.acuId ? `ACU: ${item.acuId}` : `Question ${idx + 1}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.isCorrect
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {item.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      {item.question && (
                        <p className="font-bold text-slate-200">{item.question}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Your Answer:</span>
                          <span className={item.isCorrect ? "text-emerald-400 font-bold" : "text-rose-400"}>
                            {item.chosenOption}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Correct Answer:</span>
                          <span className="text-emerald-400 font-bold">{item.correctOption}</span>
                        </div>
                      </div>

                      {item.whyWrong && (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 leading-relaxed italic">
                          <span className="font-bold text-cyan-400 not-italic block mb-0.5">
                            Diagnostic Feedback:
                          </span>
                          {item.whyWrong}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#1E2436] px-6 py-4 bg-[#090A0F]/60 flex items-center justify-between">
          {quizState === "active" && (
            <>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-[#12151F] border border-[#1E2436] text-slate-300 hover:text-slate-100 disabled:opacity-30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <span>Submit Evaluation</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={selectedOptionIndex === undefined}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-40"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {quizState === "result" && result && (
            <div className="w-full flex justify-end gap-3">
              {result.passed ? (
                <button
                  type="button"
                  onClick={async () => {
                    await onPassed();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Next Step</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Review Study Materials Again</span>
                </button>
              )}
            </div>
          )}

          {(quizState === "loading" || quizState === "error" || quizState === "submitting") && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12151F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs font-semibold ml-auto"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default QuizModal;
