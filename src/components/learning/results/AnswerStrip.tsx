'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { scaleIn, safe } from '@/lib/learning/motion';

export interface AnswerItem {
  questionNumber: number;
  chapterKey: string;
  isCorrect: boolean;
}

interface AnswerStripProps {
  answers: AnswerItem[];
}

export const AnswerStrip: React.FC<AnswerStripProps> = ({ answers }) => {
  const reduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="p-5 bg-white/90 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700">
          Question Accuracy Matrix
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">
          {answers.filter((a) => a.isCorrect).length} of {answers.length} correct
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {answers.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div key={idx} className="relative">
              <motion.button
                type="button"
                variants={safe(scaleIn, reduceMotion)}
                initial="hidden"
                animate="show"
                transition={{ delay: idx * 0.04 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : idx)}
                className={`w-7 h-7 rounded-xl font-heading font-bold text-[11px] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  item.isCorrect
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20'
                    : 'bg-rose-500 text-white shadow-xs shadow-rose-500/20'
                }`}
              >
                {item.questionNumber}
              </motion.button>

              {/* Tooltip on hover/click */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  <span className="font-bold">Q{item.questionNumber}</span> (Ch {item.chapterKey.toUpperCase()}):{' '}
                  <span className={item.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                    {item.isCorrect ? 'Correct' : 'Missed'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
