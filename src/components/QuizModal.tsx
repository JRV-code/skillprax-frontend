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

export interface StudentQuestionOption {
  id: "A" | "B" | "C" | "D" | string;
  text: string;
}

export interface StudentQuestion {
  id: string;
  acuId?: string;
  scenario?: string;
  question: string;
  options: string[] | StudentQuestionOption[];
}

export interface DiagnosticItem {
  questionId: string;
  acuId?: string;
  question?: string;
  isCorrect: boolean;
  chosenOptionId?: string;
  chosenOption: string;
  correctOptionId?: string;
  correctOption: string;
  whyWrong: string;
}

export interface QuizResultPayload {
  attemptId: string;
  scorePercent: number;
  score?: number;
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

export default function QuizModal({ stepId, isOpen, onClose, onPassed }: QuizModalProps) {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // Maps questionId -> optionId ("A","B","C","D")
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [result, setResult] = useState<QuizResultPayload | null>(null);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fetch quiz attempt on open
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
    setShowExitConfirm(false);

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
        throw new Error("Evaluation gate returned 0 questions. Please retry.");
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

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const handleSubmitQuiz = async () => {
    if (!stepId || !attemptId) return;

    if (answeredCount < questions.length && !showUnansweredConfirm) {
      setShowUnansweredConfirm(true);
      return;
    }

    setQuizState("submitting");
    setErrorMessage("");

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await fetch(`${API_BASE_URL}/api/steps/${stepId}/submit-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Evaluation submission failed (HTTP ${res.status})`);
      }

      const data: QuizResultPayload = await res.json();
      setResult(data);
      setQuizState("result");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit evaluation answers.");
      setQuizState("error");
    }
  };

  const handleModalClose = () => {
    if (quizState === "active" || quizState === "submitting") {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#12151F] border border-[#1E2436] p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1E2436] pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ACU Diagnostic Evaluation</h2>
              <p className="text-[11px] font-mono text-slate-400">
                Passing Score: 80% Threshold
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close Evaluation Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Exit Confirmation Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Exit Evaluation in Progress?</h3>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Leaving now will abandon your current diagnostic attempt. Your answers for this attempt will not be saved.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
              >
                Resume Evaluation
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
              >
                Exit & Abandon
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* STATE 1: LOADING */}
          {quizState === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-cyan-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-xs font-mono text-slate-400">Synthesizing ACU diagnostic questions...</p>
            </div>
          )}

          {/* STATE 2: ERROR */}
          {quizState === "error" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Evaluation Unavailable</h3>
              <p className="text-xs text-red-300 max-w-md mx-auto">{errorMessage}</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={fetchQuiz}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Evaluation
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: ACTIVE QUIZ */}
          {quizState === "active" && currentQuestion && (
            <div className="space-y-6">
              {/* Question Navigation Bar */}
              <div className="flex items-center justify-between text-xs border-b border-[#1E2436] pb-3">
                <span className="font-mono text-cyan-400 font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {currentQuestion.acuId && (
                  <span className="px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    ACU Tag: {currentQuestion.acuId}
                  </span>
                )}
              </div>

              {/* Question Scenario & Prompt */}
              <div className="space-y-3">
                {currentQuestion.scenario && (
                  <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-xs text-slate-300 italic leading-relaxed">
                    "{currentQuestion.scenario}"
                  </div>
                )}
                <h3 className="text-base font-bold text-white leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Radio List */}
              <div className="space-y-2.5" role="radiogroup">
                {currentQuestion.options.map((option, idx) => {
                  const optionKeys = ["A", "B", "C", "D"];
                  const optionId = typeof option === "string" 
                    ? optionKeys[idx] || String(idx) 
                    : option.id || optionKeys[idx];
                  const optionText = typeof option === "string" ? option : option.text;
                  const isChecked = selectedOptionId === optionId;

                  return (
                    <button
                      key={optionId}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      onClick={() => handleSelectOption(currentQuestion.id, optionId)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 group ${
                        isChecked
                          ? "bg-cyan-950/60 border-cyan-500 text-cyan-100 shadow-md shadow-cyan-950/50"
                          : "bg-[#090A0F] border-[#1E2436] text-slate-300 hover:border-cyan-500/30 hover:bg-[#0d101a]"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                        isChecked
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                      }`}>
                        {optionId}
                      </span>
                      <span className="text-xs leading-relaxed pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unanswered Confirmation Warning Banner */}
              {showUnansweredConfirm && (
                <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                  <span>
                    You have answered {answeredCount} of {questions.length} questions. Unanswered questions will be scored as incorrect.
                  </span>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
                  >
                    Confirm & Submit
                  </button>
                </div>
              )}

              {/* Navigation Controls Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1E2436]">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={!selectedOptionId && answeredCount === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span>Submit Evaluation</span>
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={!selectedOptionId}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STATE 4: SUBMITTING */}
          {quizState === "submitting" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-cyan-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-xs font-mono text-slate-400">Scoring ACU competencies & evaluating pass threshold...</p>
            </div>
          )}

          {/* STATE 5: RESULT REPORT */}
          {quizState === "result" && result && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className={`p-6 rounded-3xl border text-center space-y-3 ${
                result.passed
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400" />
                  )}
                  <span className="text-2xl font-black tracking-tight">
                    {result.scorePercent}% Score
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {result.passed
                    ? "Step Mastery Achieved!"
                    : "Mastery Threshold Not Met"}
                </h3>

                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {result.passed
                    ? `Congratulations! You answered ${result.correctCount} of ${result.totalQuestions} questions correctly, surpassing the 80% threshold.`
                    : `You answered ${result.correctCount} of ${result.totalQuestions} questions correctly. Review your diagnostic feedback below before retrying.`}
                </p>
              </div>

              {/* Per-Wrong-Question Diagnostic Review */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Competency Diagnostic Breakdown ({result.diagnostic.length} Evaluated)
                </h4>

                <div className="space-y-3">
                  {result.diagnostic.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border space-y-2.5 ${
                        item.isCorrect
                          ? "bg-[#090A0F] border-emerald-500/20"
                          : "bg-[#090A0F] border-rose-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400 font-semibold">
                          Question {idx + 1}
                        </span>
                        {item.acuId && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
                            {item.acuId}
                          </span>
                        )}
                      </div>

                      {item.question && (
                        <p className="text-xs font-semibold text-white">{item.question}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className={`p-2.5 rounded-xl border ${
                          item.isCorrect
                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                            : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                        }`}>
                          <span className="font-bold block text-[10px] uppercase">Your Choice:</span>
                          <span>{item.chosenOption}</span>
                        </div>

                        {!item.isCorrect && (
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                            <span className="font-bold block text-[10px] uppercase">Correct Option:</span>
                            <span>{item.correctOption}</span>
                          </div>
                        )}
                      </div>

                      {!item.isCorrect && item.whyWrong && (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-normal">
                          <strong className="text-amber-400 block text-[10px] uppercase tracking-wider">Diagnostic Analysis:</strong>
                          {item.whyWrong}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2436]">
                {result.passed ? (
                  <button
                    onClick={async () => {
                      await onPassed();
                      onClose();
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
                  >
                    <span>Continue to Next Step</span>
                    <ArrowRight className="w-4 h-4 fill-slate-950" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Review Materials Again
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
