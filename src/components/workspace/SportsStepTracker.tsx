'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Clock, CheckCircle2, Lock, Unlock, Play, Pause, 
  RotateCcw, AlertTriangle, ShieldCheck, Zap, Utensils, Droplet, 
  Heart, ArrowRight, Check, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DailyDietPlan {
  breakfast?: string;
  preWorkout?: string;
  postWorkout?: string;
  dinner?: string;
  hydrationLiters?: string | number;
  respiratoryProtocol?: string;
  dietaryPreference?: string;
  medicalAdaptation?: string;
}

export interface SportsStepTrackerProps {
  skillId: string;
  stepNumber: number;
  stepTitle: string;
  skillCategory?: 'physical' | 'cognitive';
  requiredPracticeDays?: number;
  practiceDaysCompleted?: number;
  quizPassed?: boolean;
  quizScore?: number | null;
  dailyDietPlan?: DailyDietPlan | null;
  onPracticeDayComplete?: (completedDays: number) => void;
  onAdvanceStep?: () => void;
  onOpenQuiz?: () => void;
}

export const SportsStepTracker: React.FC<SportsStepTrackerProps> = ({
  skillId,
  stepNumber,
  stepTitle,
  skillCategory = 'physical',
  requiredPracticeDays = 3,
  practiceDaysCompleted = 0,
  quizPassed = false,
  quizScore = null,
  dailyDietPlan = null,
  onPracticeDayComplete,
  onAdvanceStep,
  onOpenQuiz,
}) => {
  const [completedDays, setCompletedDays] = useState<number>(practiceDaysCompleted);
  const [activeDay, setActiveDay] = useState<number>(
    Math.min(practiceDaysCompleted + 1, requiredPracticeDays)
  );
  const [isSubmittingDay, setIsSubmittingDay] = useState<boolean>(false);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [progressionAlert, setProgressionAlert] = useState<{
    type: 'days_locked' | 'quiz_locked' | 'success';
    message: string;
  } | null>(null);

  // Practice Timer / Stopwatch state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external props
  useEffect(() => {
    setCompletedDays(practiceDaysCompleted);
    setActiveDay(Math.min(practiceDaysCompleted + 1, requiredPracticeDays));
  }, [practiceDaysCompleted, requiredPracticeDays]);

  // Stopwatch interval effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCompleteCurrentDay = async () => {
    if (completedDays >= requiredPracticeDays) return;
    try {
      setIsSubmittingDay(true);
      const res = await fetch(`/api/skills/${skillId}/steps/${stepNumber}/practice-day`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const nextCompleted = data.practiceDaysCompleted ?? (completedDays + 1);
        setCompletedDays(nextCompleted);
        setActiveDay(Math.min(nextCompleted + 1, requiredPracticeDays));
        setIsTimerRunning(false);
        setTimerSeconds(0);
        onPracticeDayComplete?.(nextCompleted);

        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 45,
            spread: 50,
            origin: { y: 0.7 },
          });
        }
      }
    } catch (err) {
      console.error('Failed to update practice day:', err);
    } finally {
      setIsSubmittingDay(false);
    }
  };

  const handleAdvanceStepAttempt = async () => {
    setProgressionAlert(null);

    // DUAL-GATE EVALUATION
    const calendarDone = completedDays >= requiredPracticeDays;
    const socraticPassed = quizPassed === true;

    if (!calendarDone) {
      setProgressionAlert({
        type: 'days_locked',
        message: `Physical skill progression locked. You must complete all ${requiredPracticeDays} practice days on your training calendar before advancing. (Currently completed: ${completedDays}/${requiredPracticeDays})`,
      });
      return;
    }

    if (!socraticPassed) {
      setProgressionAlert({
        type: 'quiz_locked',
        message: `Practice days completed! Pass the mechanical Socratic Quiz to unlock Step ${stepNumber + 1}.`,
      });
      return;
    }

    // Both conditions met: Call advance endpoint
    try {
      setIsAdvancing(true);
      const res = await fetch(`/api/skills/${skillId}/steps/${stepNumber}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
        setProgressionAlert({
          type: 'success',
          message: `Step ${stepNumber} successfully mastered! Proceeding to the next milestone.`,
        });
        onAdvanceStep?.();
      } else {
        const errData = await res.json();
        setProgressionAlert({
          type: 'days_locked',
          message: errData.error || 'Failed to advance step.',
        });
      }
    } catch (err: any) {
      setProgressionAlert({
        type: 'days_locked',
        message: err.message || 'Error advancing step.',
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  const canProgress = completedDays >= requiredPracticeDays && quizPassed === true;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Athletic Dual-Gate Protocol</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Step {stepNumber}: {stepTitle}
            </span>
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900">
            Physical Practice Calendar & Dual Gate
          </h3>
          <p className="text-xs text-slate-500">
            Biomechanical mastery requires both kinetic muscle conditioning and Socratic conceptual validation.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
            completedDays >= requiredPracticeDays
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{completedDays}/{requiredPracticeDays} Days</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
            quizPassed
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {quizPassed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quiz {quizScore ? `${quizScore}%` : 'Passed'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Quiz Pending</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4.1: INTERACTIVE DAILY PRACTICE CALENDAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Interactive Training Calendar (Day 1 through Day {requiredPracticeDays})</span>
          </h4>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            {completedDays >= requiredPracticeDays ? '100% Calendar Complete' : `${requiredPracticeDays - completedDays} days remaining`}
          </span>
        </div>

        {/* Days Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {Array.from({ length: requiredPracticeDays }, (_, i) => {
            const dayNum = i + 1;
            const isDone = dayNum <= completedDays;
            const isCurrent = dayNum === completedDays + 1;
            const isFuture = dayNum > completedDays + 1;

            return (
              <motion.button
                key={dayNum}
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => setActiveDay(dayNum)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isDone
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                    : isCurrent
                      ? 'bg-sky-50/90 border-sky-400 text-sky-950 ring-2 ring-sky-300/50 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase">
                    Day {dayNum}
                  </span>
                  {isDone ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-300" />
                  )}
                </div>
                <div className="text-xs font-black">
                  {isDone ? 'Completed' : isCurrent ? 'Active Drill' : 'Locked'}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4.2: ACTIVE DRILL STOPWATCH & SESSION LOGGER */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Day {activeDay} Focus Session
            </span>
            <span className="text-xs text-slate-400">Biomechanics & Repetition Drill</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">
            Perform scheduled practice drills with precision pacing
          </h4>
        </div>

        <div className="flex items-center gap-4">
          {/* Stopwatch display */}
          <div className="flex items-center gap-2.5 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xl font-black text-emerald-400 tracking-wider">
              {formatTime(timerSeconds)}
            </span>
            <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={() => setIsTimerRunning((r) => !r)}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Complete Day Session Button */}
          <button
            type="button"
            disabled={isSubmittingDay || completedDays >= requiredPracticeDays}
            onClick={handleCompleteCurrentDay}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmittingDay
                ? 'Logging...'
                : completedDays >= requiredPracticeDays
                  ? 'All Days Logged ✓'
                  : `Log Day ${activeDay} Complete`}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 4.3: ATHLETIC FUELING & NUTRITION ENGINE INTEGRATION */}
      {dailyDietPlan && (
        <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Tailored Daily Athletic Fueling & Nutrition
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {dailyDietPlan.dietaryPreference && (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  {dailyDietPlan.dietaryPreference}
                </span>
              )}
              {dailyDietPlan.medicalAdaptation && dailyDietPlan.medicalAdaptation !== 'None' && (
                <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-rose-500" />
                  <span>{dailyDietPlan.medicalAdaptation}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {dailyDietPlan.breakfast && (
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-900">🍳 Morning Ignition</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{dailyDietPlan.breakfast}</p>
              </div>
            )}
            {dailyDietPlan.preWorkout && (
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-900">⚡ Pre-Workout Glycogen</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{dailyDietPlan.preWorkout}</p>
              </div>
            )}
            {dailyDietPlan.postWorkout && (
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-900">🥗 Post-Workout Synthesis</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{dailyDietPlan.postWorkout}</p>
              </div>
            )}
            {dailyDietPlan.dinner && (
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-900">🌙 Restorative Dinner</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">{dailyDietPlan.dinner}</p>
              </div>
            )}
          </div>

          {(dailyDietPlan.hydrationLiters || dailyDietPlan.respiratoryProtocol) && (
            <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-amber-950">
              {dailyDietPlan.hydrationLiters && (
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-sky-600 fill-sky-400" />
                  <span className="font-semibold">Hydration Target:</span>
                  <span className="font-bold">{dailyDietPlan.hydrationLiters}</span>
                </div>
              )}
              {dailyDietPlan.respiratoryProtocol && (
                <div className="flex items-center gap-1.5 text-rose-900">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-semibold">Pacing Protocol:</span>
                  <span>{dailyDietPlan.respiratoryProtocol}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4.4: STRICT DUAL-GATE EVALUATION & UNLOCK NEXT STEP */}
      <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dual-Gate Progression Verification</span>
          </h4>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            canProgress
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {canProgress ? 'Dual-Gate Unlocked ✓' : 'Dual-Gate Enforced 🔒'}
          </span>
        </div>

        {/* Two Gates status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Gate 1: Practice Calendar */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            completedDays >= requiredPracticeDays
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              completedDays >= requiredPracticeDays
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {completedDays >= requiredPracticeDays ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Gate 1: Physical Training Days</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Completed {completedDays} of {requiredPracticeDays} required daily sessions.
              </div>
            </div>
          </div>

          {/* Gate 2: Socratic Evaluation */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
            quizPassed
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                quizPassed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {quizPassed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Gate 2: Socratic Quiz Mastery</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {quizPassed ? `Passed with score of ${quizScore || 80}% (≥ 75% required)` : 'Strict 75% score required to validate biomechanics.'}
                </div>
              </div>
            </div>

            {!quizPassed && onOpenQuiz && (
              <button
                type="button"
                onClick={onOpenQuiz}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow-xs cursor-pointer shrink-0"
              >
                Take Quiz
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progression Alert */}
        <AnimatePresence>
          {progressionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                progressionAlert.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : progressionAlert.type === 'quiz_locked'
                    ? 'bg-sky-50 text-sky-900 border-sky-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{progressionAlert.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Unlock Next Step CTA */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            disabled={isAdvancing}
            onClick={handleAdvanceStepAttempt}
            className={`px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              canProgress
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <span>{isAdvancing ? 'Unlocking Milestone...' : `Unlock Next Step (Step ${stepNumber + 1})`}</span>
            {canProgress ? (
              <Unlock className="w-4 h-4 text-emerald-300" />
            ) : (
              <Lock className="w-4 h-4 text-amber-300" />
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportsStepTracker;
