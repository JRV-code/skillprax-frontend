'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, CheckCircle2, Clock, 
  Target, Flame, ChevronDown, ChevronUp, Sparkles,
  Dumbbell, Zap, ShieldCheck, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SportDrill } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export interface DrillCardProps {
  drill: SportDrill;
  stepNumber?: number;
  onComplete?: (drillId: string) => void;
  onPracticeLogged?: (minutes: number) => void;
}

// Synthesize pleasant completion chime via Web Audio API (zero external network dependencies)
function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First note: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Second note: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16);
    gain2.gain.setValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.8);
  } catch (err) {
    // AudioContext permission non-blocking fallback
  }
}

export const DrillCard: React.FC<DrillCardProps> = ({
  drill,
  stepNumber = 1,
  onComplete,
  onPracticeLogged,
}) => {
  const { t } = useLanguage();
  const totalSeconds = drill.durationSeconds || (drill.durationMinutes ? drill.durationMinutes * 60 : 720);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(drill.completed || false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external completion
  useEffect(() => {
    if (drill.completed !== undefined) {
      setIsCompleted(drill.completed);
    }
  }, [drill.completed]);

  // Embedded Countdown Stopwatch Interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            playCompletionChime();
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
              });
            } catch (_) {}
            if (onComplete) onComplete(drill.id);
            if (onPracticeLogged) onPracticeLogged(Math.ceil(totalSeconds / 60));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, drill.id, onComplete, onPracticeLogged]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleManualComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    playCompletionChime();
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.7 },
      });
    } catch (_) {}
    if (onComplete) onComplete(drill.id);
    if (onPracticeLogged) onPracticeLogged(Math.ceil(totalSeconds / 60));
  };

  // Normalized instructions
  const instructionsList: string[] = Array.isArray(drill.instructions)
    ? drill.instructions
    : typeof drill.instructions === 'string'
    ? [drill.instructions]
    : Array.isArray(drill.focusPoints) && drill.focusPoints.length > 0
    ? drill.focusPoints
    : [
        'Establish balanced athletic posture with feet shoulder-width apart.',
        'Execute movement with deliberate kinetic pacing and proper posture.',
        'Complete full follow-through without premature deceleration.',
        'Reset smoothly to starting base between each repetition.',
      ];

  const intensity = drill.intensityLevel || 'Medium';
  const intensityBadge = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200/70',
    High: 'bg-rose-50 text-rose-700 border-rose-200/70',
  }[intensity as 'Low' | 'Medium' | 'High'] || 'bg-slate-100 text-slate-700 border-slate-200';

  const progressPct = Math.max(0, Math.min(100, Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-5 ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-300/80 shadow-sm'
          : isRunning
          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* HEADER SECTION: Title, Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
              Drill Execution
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${intensityBadge}`}>
              {intensity} Intensity
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{Math.round(totalSeconds / 60)} Mins</span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
          {drill.title}
        </h3>

        {/* Objective & Biomechanical Focus */}
        {(drill.objective || drill.biomechanicalFocus) && (
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs">
            {drill.objective && (
              <p className="text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900">Objective:</strong> {drill.objective}
              </p>
            )}
            {drill.biomechanicalFocus && (
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-emerald-800">Biomechanical Focus:</strong> {drill.biomechanicalFocus}
              </p>
            )}
          </div>
        )}

        {/* Recommended Sets */}
        {drill.recommendedSets && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700">Target Reps:</span>
            <span>{drill.recommendedSets}</span>
          </div>
        )}

        {/* Instructions Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowInstructions((prev) => !prev)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
              <span>How to Perform This Drill ({instructionsList.length} Steps)</span>
            </span>
            {showInstructions ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {showInstructions && (
              <motion.ol
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1.5 overflow-hidden pl-1"
              >
                {instructionsList.map((instruction, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* EMBEDDED IN-CARD COUNTDOWN TIMER WIDGET */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              {isRunning ? 'Drill Countdown Active' : isCompleted ? 'Drill Completed' : 'Target Duration'}
            </span>
            <div className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
              {formatCountdown(remainingSeconds)}
            </div>
          </div>

          {/* Stopwatch Controls */}
          <div className="flex items-center gap-2">
            {!isRunning && remainingSeconds === totalSeconds && !isCompleted ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleStart}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t('performDrill', 'Perform Drill')}</span>
              </motion.button>
            ) : isRunning ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handlePause}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pause</span>
                </motion.button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            ) : !isCompleted ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleStart}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Resume</span>
                </motion.button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('drillCompleted', 'Done for Today')}</span>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 ml-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Practice Again"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500' : isRunning ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            style={{ width: `${isCompleted ? 100 : progressPct}%` }}
          />
        </div>

        {/* Manual Done toggle if completed off-screen */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleManualComplete}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Completed Off-Screen? Mark Done</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DrillCard;
