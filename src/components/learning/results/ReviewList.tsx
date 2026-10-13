'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReviewQuestionItem {
  questionId: string;
  questionNumber: number;
  questionText: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  chapterKey?: string;
  resourceTitle?: string;
  origin?: 'SOURCE_TEXT' | 'CHAPTER_OBJECTIVE';
}

interface ReviewListProps {
  questions: ReviewQuestionItem[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ questions }) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700">
          Source-Grounded Question Review
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">
          {questions.length} questions
        </span>
      </div>

      <div className="space-y-2.5">
        {questions.map((q) => {
          const isOpen = openIds.has(q.questionId);
          const isObjective = q.origin === 'CHAPTER_OBJECTIVE';

          return (
            <div
              key={q.questionId}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs"
            >
              {/* Question header */}
              <div
                onClick={() => toggle(q.questionId)}
                className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-heading font-bold text-slate-400">
                        Q{q.questionNumber}
                      </span>
                      {q.chapterKey && (
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Chapter {q.chapterKey.toUpperCase()}
                        </span>
                      )}
                      {isObjective ? (
                        <span className="text-[10px] font-heading font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Based on chapter objectives
                        </span>
                      ) : (
                        <span className="text-[10px] font-heading font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          Source Grounded
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-heading font-bold text-slate-900 mt-1 leading-snug">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mt-1 text-slate-400">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Collapsible detail */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-4 space-y-3 text-xs">
                      {/* User answer vs correct answer */}
                      <div className="space-y-1.5">
                        {q.userAnswer && !q.isCorrect && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-900">
                            <span className="font-heading font-bold text-rose-700 mr-1.5">
                              Your selection:
                            </span>
                            <span>{q.userAnswer}</span>
                          </div>
                        )}

                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-950 font-medium">
                          <span className="font-heading font-bold text-emerald-800 mr-1.5">
                            Canonical Correct Answer:
                          </span>
                          <span>{q.correctAnswer}</span>
                        </div>
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                          <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">
                            Mechanics Explanation
                          </span>
                          <p className="text-slate-700 leading-relaxed font-normal">
                            {q.explanation}
                          </p>
                        </div>
                      )}

                      {/* Source grounding reference */}
                      {q.resourceTitle && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Based on: Chapter {q.chapterKey?.toUpperCase()} —{' '}
                            <span className="font-semibold text-slate-700">
                              {q.resourceTitle}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
