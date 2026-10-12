'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DrillCardProps {
  drillNumber: number;
  title: string;
  durationMinutes: number; // e.g. 15
  technicalFocusPoints: string[];
  isCompleted: boolean;
  onDrillComplete: (drillId: string) => void;
}

export const DrillCardWithTimer: React.FC<DrillCardProps> = ({
  drillNumber,
  title,
  durationMinutes,
  technicalFocusPoints,
  isCompleted: initialCompleted,
  onDrillComplete,
}) => {
  const totalSeconds = (durationMinutes || 12) * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(initialCompleted);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsCompleted(initialCompleted);
  }, [initialCompleted]);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      onDrillComplete(title);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft, onDrillComplete, title]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 ${
      isCompleted 
        ? 'bg-emerald-50/50 border-emerald-200/80 shadow-sm' 
        : isActive 
          ? 'bg-white border-sky-400 shadow-lg shadow-sky-100 ring-2 ring-sky-100'
          : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            DRILL {drillNumber}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <Timer className="w-3.5 h-3.5"/>
            <span>{durationMinutes} Mins</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-slate-900 mb-3">{title}</h4>

        {/* Technical Focus Points */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            TECHNICAL FOCUS POINTS
          </span>
          <ul className="space-y-2">
            {technicalFocusPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Embedded Timer Control Deck */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        {/* Digital Countdown Display & Progress Bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">Stopwatch Tracker</span>
          <span className={`text-sm font-mono font-bold ${
            isActive ? 'text-sky-600' : isCompleted ? 'text-emerald-600' : 'text-slate-800'
          }`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
        
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Interactive Button Deck */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
              Drill Completed
            </button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={toggleTimer}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                    : 'bg-[#0284C7] hover:bg-sky-700 text-white shadow-sky-200'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4"/> Pause Drill
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current"/> Start Drill
                  </>
                )}
              </motion.button>
              
              <button
                onClick={resetTimer}
                title="Reset Timer"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4"/>
              </button>

              <button
                onClick={() => {
                  setIsActive(false);
                  setIsCompleted(true);
                  setSecondsLeft(0);
                  onDrillComplete(title);
                }}
                title="Mark Done Manually"
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
              >
                Skip/Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrillCardWithTimer;
