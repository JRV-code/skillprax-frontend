'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Video,
  Sparkles,
  ShieldCheck,
  Utensils,
  Apple,
  Dumbbell,
  Droplet,
  Heart,
  AlertCircle,
  ArrowRight,
  Flame,
  Lock,
  Unlock,
} from 'lucide-react';
import { usePlayerStore } from '@/components/learning/video/playerStore';

export interface TrainingItem {
  id: string;
  category: 'DRILL' | 'EXERCISE' | 'YOGASAN';
  name: string;
  setsAndReps: string;
  timerSeconds: number;
  customDayAiGuide: string;
  howToSteps: string[];
  breathingCue: string;
  medicalSafetyNote: string;
  youtubeQuery?: string;
  videoId?: string;
  videoTitle?: string;
  videoUrl?: string;
}

export interface TrainingDay {
  dayNumber: number;
  title: string;
  focusDescription: string;
  items: TrainingItem[];
}

export interface StepNutrition {
  preSessionFuel: string;
  postSessionRecovery: string;
  hydrationTip: string;
}

export interface StepTrainingPlan {
  totalDays: number;
  days: TrainingDay[];
  stepNutrition?: StepNutrition;
}

interface SportsDailyTrainingSectionProps {
  stepId: string;
  stepNumber: number;
  sportName: string;
  trainingPlan: StepTrainingPlan;
  healthConditions?: string;
  dietaryPreference?: string;
  onDayProgress?: (dayNumber: number, completedCount: number, totalCount: number) => void;
}

export function SportsDailyTrainingSection({
  stepId,
  stepNumber,
  sportName,
  trainingPlan,
  healthConditions = 'None',
  dietaryPreference = 'Vegetarian',
  onDayProgress,
}: SportsDailyTrainingSectionProps) {
  const { openVideo } = usePlayerStore();

  const totalDays = Math.max(3, Math.min(5, trainingPlan?.totalDays || trainingPlan?.days?.length || 3));
  const days = trainingPlan?.days || [];

  // Active day tab state (1-indexed)
  const [currentDay, setCurrentDay] = useState<number>(1);

  // Completed items map: { [itemId]: boolean }
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`sports_step_${stepId}_completed_items`);
        return saved ? JSON.parse(saved) : {};
      } catch (_) {}
    }
    return {};
  });

  // Completed days map: { [dayNumber]: boolean }
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`sports_step_${stepId}_completed_days`);
        return saved ? JSON.parse(saved) : {};
      } catch (_) {}
    }
    return {};
  });

  // Independent countdown timer seconds per item: { [itemId]: number }
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // STRICT SINGLE ACTIVE TIMER RULE: Only one timer can run at any time
  const [activeTimerItemId, setActiveTimerItemId] = useState<string | null>(null);

  const activeDayObj = days.find((d) => d.dayNumber === currentDay) || days[0] || {
    dayNumber: 1,
    title: `Day 1 Focus Session`,
    focusDescription: `Foundational neuromuscular adaptations`,
    items: [],
  };

  const dayItems = activeDayObj.items || [];

  // Initialize countdown timers for active day items
  useEffect(() => {
    setTimeLeft((prev) => {
      const updated = { ...prev };
      for (const item of dayItems) {
        if (updated[item.id] === undefined) {
          updated[item.id] = Math.max(30, item.timerSeconds || 60);
        }
      }
      return updated;
    });
  }, [dayItems]);

  // Persist completed items to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sports_step_${stepId}_completed_items`, JSON.stringify(completedItems));
        localStorage.setItem(`sports_step_${stepId}_completed_days`, JSON.stringify(completedDays));
      } catch (_) {}
    }
  }, [completedItems, completedDays, stepId]);

  // Timer Tick Interval
  useEffect(() => {
    if (!activeTimerItemId) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const currentSeconds = prev[activeTimerItemId] ?? 0;
        if (currentSeconds <= 1) {
          // Timer finished! Auto-complete this item
          clearInterval(interval);
          setActiveTimerItemId(null);
          setCompletedItems((cPrev) => ({ ...cPrev, [activeTimerItemId]: true }));
          return { ...prev, [activeTimerItemId]: 0 };
        }
        return { ...prev, [activeTimerItemId]: currentSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerItemId]);

  // Toggle Timer for a specific item (Strict Single-Timer Lock)
  const handleToggleTimer = (itemId: string) => {
    if (activeTimerItemId === itemId) {
      // Pause current running timer
      setActiveTimerItemId(null);
    } else {
      // If another timer is running, ignore or prevent
      if (activeTimerItemId !== null) return;

      // If time is 0, reset to initial
      if ((timeLeft[itemId] ?? 0) <= 0) {
        const item = dayItems.find((i) => i.id === itemId);
        const resetDuration = Math.max(30, item?.timerSeconds || 60);
        setTimeLeft((prev) => ({ ...prev, [itemId]: resetDuration }));
      }

      setActiveTimerItemId(itemId);
    }
  };

  // Adjust timer by offset (+15s or -15s)
  const handleAdjustTimer = (itemId: string, delta: number) => {
    setTimeLeft((prev) => {
      const cur = prev[itemId] || 60;
      const nextVal = Math.max(15, Math.min(600, cur + delta));
      return { ...prev, [itemId]: nextVal };
    });
  };

  // Reset timer
  const handleResetTimer = (itemId: string) => {
    if (activeTimerItemId === itemId) {
      setActiveTimerItemId(null);
    }
    const item = dayItems.find((i) => i.id === itemId);
    const initial = Math.max(30, item?.timerSeconds || 60);
    setTimeLeft((prev) => ({ ...prev, [itemId]: initial }));
  };

  // Manual Complete Button (disabled while ANY timer is running)
  const handleToggleComplete = (itemId: string) => {
    if (activeTimerItemId !== null) return;
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Switch Day (locked while timer is running)
  const handleSelectDay = (dayNum: number) => {
    if (activeTimerItemId !== null) {
      alert('A drill countdown timer is actively running. Please pause or complete the timer before switching days.');
      return;
    }
    // Check if previous days are completed
    if (dayNum > 1 && !completedDays[dayNum - 1]) {
      alert(`Please finish and mark Day ${dayNum - 1} complete before advancing to Day ${dayNum}.`);
      return;
    }
    setCurrentDay(dayNum);
  };

  // Calculate day completion status
  const completedInCurrentDay = dayItems.filter((i) => completedItems[i.id]).length;
  const isCurrentDayFullyCompleted = dayItems.length > 0 && completedInCurrentDay === dayItems.length;

  // Advance to Next Day
  const handleAdvanceToNextDay = async () => {
    if (activeTimerItemId !== null) return;
    if (!isCurrentDayFullyCompleted) return;

    setCompletedDays((prev) => ({ ...prev, [currentDay]: true }));

    // Notify backend
    try {
      await fetch(`/api/sports-workspace/steps/${stepId}/complete-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber: currentDay }),
      });
    } catch (_) {}

    if (currentDay < totalDays) {
      setCurrentDay(currentDay + 1);
    }

    if (onDayProgress) {
      onDayProgress(currentDay, completedInCurrentDay, dayItems.length);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const nutrition = trainingPlan?.stepNutrition;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 md:p-7 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              UNIFIED TRAINING CALENDAR
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
              {totalDays}-Day Adaptive Cycle
            </span>
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
            Milestone {stepNumber} Daily Training Regimen
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Integrated daily progression blending technique drills, neuromuscular power exercises, and mobility yogasanas with individual countdown timers.
          </p>
        </div>

        {/* Global Medical Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
              Profile Medical Guard
            </span>
            <span className="text-xs font-bold text-slate-800">
              {healthConditions && healthConditions !== 'None' ? healthConditions : 'No Medical Constraints'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Day Selector Tabs (Day 1 -> Day K) */}
      <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dNum = idx + 1;
          const isActive = currentDay === dNum;
          const isDone = Boolean(completedDays[dNum]);
          const isLocked = dNum > 1 && !completedDays[dNum - 1];

          return (
            <button
              key={dNum}
              type="button"
              disabled={activeTimerItemId !== null && !isActive}
              onClick={() => handleSelectDay(dNum)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#0284C7] to-emerald-600 text-white shadow-md'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  : isLocked
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-70 cursor-not-allowed'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : isLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              <span>Day {dNum}</span>
              {isDone && <span className="text-[10px] font-black uppercase">✓</span>}
            </button>
          );
        })}
      </div>

      {/* 3. Day Focus Header Card */}
      <div className="p-5 bg-gradient-to-r from-sky-50/70 to-emerald-50/70 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-white/80 px-2.5 py-0.5 rounded-md border border-sky-200">
            DAY {currentDay} TARGET FOCUS
          </span>
          <h4 className="text-base font-heading font-black text-slate-900 mt-1">
            {activeDayObj.title}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {activeDayObj.focusDescription}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-extrabold text-slate-700 block">
            Progress: {completedInCurrentDay} / {dayItems.length} Done
          </span>
          <span className="text-[11px] font-bold text-emerald-700">
            {isCurrentDayFullyCompleted ? '✓ Day Ready to Finalize' : 'Complete all items to advance'}
          </span>
        </div>
      </div>

      {/* 4. Unified Daily List (3 to 5 Mixed Drills, Exercises & Yogasanas) */}
      <div className="space-y-4">
        {dayItems.map((item, itemIdx) => {
          const isItemCompleted = Boolean(completedItems[item.id]);
          const isThisTimerRunning = activeTimerItemId === item.id;
          const isAnotherTimerRunning = activeTimerItemId !== null && activeTimerItemId !== item.id;
          const currentSeconds = timeLeft[item.id] ?? item.timerSeconds ?? 60;

          // Category Badge Styling
          const catPills = {
            DRILL: {
              label: '⚡ DRILL',
              color: 'bg-sky-50 text-[#0284C7] border-sky-200',
              icon: Flame,
            },
            EXERCISE: {
              label: '💪 EXERCISE',
              color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              icon: Dumbbell,
            },
            YOGASAN: {
              label: '🧘‍♂️ YOGASAN',
              color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              icon: Heart,
            },
          };

          const pill = catPills[item.category] || catPills.DRILL;
          const CatIcon = pill.icon;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl bg-white border transition-all shadow-sm ${
                isItemCompleted
                  ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                  : isThisTimerRunning
                  ? 'border-sky-400 ring-2 ring-sky-200'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                {/* Left Column: Details & Custom AI Guide */}
                <div className="space-y-3.5 flex-1">
                  {/* Category Pill & Title */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${pill.color}`}>
                      <CatIcon className="w-3 h-3" />
                      <span>{pill.label}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.setsAndReps}
                    </span>
                    {isItemCompleted && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-heading font-extrabold text-slate-900 tracking-tight">
                      {itemIdx + 1}. {item.name}
                    </h4>
                  </div>

                  {/* Day-Specific AI Guide Coaching Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Day {currentDay} Precision AI Coaching Focus</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item.customDayAiGuide}
                    </p>

                    {/* Step-by-Step execution bullets */}
                    {item.howToSteps && item.howToSteps.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">
                          Biomechanical Form Execution:
                        </span>
                        <ul className="space-y-1">
                          {item.howToSteps.map((stepTxt, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{stepTxt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Breathing Cue & Medical Adaptation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                      {item.breathingCue && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-bold text-sky-800">🫁 Breath: </span>
                          <span>{item.breathingCue}</span>
                        </div>
                      )}
                      {item.medicalSafetyNote && (
                        <div className="text-[11px] text-slate-600">
                          <span className="font-bold text-emerald-800">🩺 Safety: </span>
                          <span>{item.medicalSafetyNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: In-App Video & Single-Timer Box */}
                <div className="w-full lg:w-72 shrink-0 space-y-3">
                  {/* Video Button */}
                  {item.videoId && (
                    <button
                      type="button"
                      onClick={() => {
                        openVideo({
                          videoId: item.videoId!,
                          title: item.videoTitle || item.name,
                          channel: sportName,
                        });
                      }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01]"
                    >
                      <Video className="w-4 h-4" />
                      <span>▶ Watch How to Perform</span>
                    </button>
                  )}

                  {/* Independent Countdown Timer Box */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isThisTimerRunning
                      ? 'bg-sky-50/70 border-sky-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-sky-600" />
                        <span>Drill Timer</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Target: {formatSeconds(item.timerSeconds || 60)}
                      </span>
                    </div>

                    {/* Timer Digital Display */}
                    <div className="flex items-center justify-center gap-3 my-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustTimer(item.id, -15)}
                        disabled={isThisTimerRunning}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        title="-15 seconds"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className={`font-mono text-2xl font-black ${
                        isThisTimerRunning ? 'text-[#0284C7]' : 'text-slate-900'
                      }`}>
                        {formatSeconds(currentSeconds)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAdjustTimer(item.id, 15)}
                        disabled={isThisTimerRunning}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        title="+15 seconds"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Timer Controls (STRICT SINGLE-TIMER LOCK) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                      {isAnotherTimerRunning ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed opacity-60"
                        >
                          ⏳ Another Timer Running
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleTimer(item.id)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                            isThisTimerRunning
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white'
                          }`}
                        >
                          {isThisTimerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>{currentSeconds === 0 ? 'Restart Timer' : '▶ Start Timer'}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleResetTimer(item.id)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Reset timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Manual Mark Complete Button (DISABLED while timer is running) */}
                  <button
                    type="button"
                    disabled={activeTimerItemId !== null}
                    onClick={() => handleToggleComplete(item.id)}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isItemCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeTimerItemId !== null
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isItemCompleted ? '✓ Done with Drill (Click to undo)' : '✓ Done with Drill'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 5. "Ready for Next Day" Advance Button */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-heading font-bold text-slate-900">
            Day {currentDay} Verification & Progression
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCurrentDayFullyCompleted
              ? `All ${dayItems.length} items logged for Day ${currentDay}! You can now seal this session.`
              : `Complete the ${dayItems.length - completedInCurrentDay} remaining items above to unlock Day ${currentDay < totalDays ? currentDay + 1 : 'Completion'}.`}
          </p>
        </div>

        <button
          type="button"
          disabled={!isCurrentDayFullyCompleted || activeTimerItemId !== null}
          onClick={handleAdvanceToNextDay}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
            isCurrentDayFullyCompleted && activeTimerItemId === null
              ? 'bg-gradient-to-r from-emerald-500 to-[#0284C7] hover:from-emerald-600 hover:to-sky-600 text-white hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <span>
            {currentDay < totalDays
              ? `🚀 Day ${currentDay} Complete — Ready for Day ${currentDay + 1} →`
              : `🎉 All ${totalDays} Training Days Completed!`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Step Nutrition Mini-Card at the Bottom */}
      {nutrition && (
        <div className="p-6 md:p-7 bg-white rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-heading font-bold text-slate-900">
                Milestone {stepNumber} Athletic Fuel & Recovery Blueprint
              </h4>
              <p className="text-xs text-slate-500">
                Calibrated to your {dietaryPreference} diet and active physical loading
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-amber-600" />
                <span>Pre-Session Fuel</span>
              </span>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                {nutrition.preSessionFuel || `Targeted ${dietaryPreference} energy meal 45-60 mins prior to practice.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Post-Session Recovery</span>
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {nutrition.postSessionRecovery || `Rapid ${dietaryPreference} protein & glycogen restoration within 45 mins.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-600" />
                <span>Hydration & Electrolytes</span>
              </span>
              <p className="text-xs text-sky-950 font-medium leading-relaxed">
                {nutrition.hydrationTip || 'Maintain continuous electrolyte intake to prevent cramping.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SportsDailyTrainingSection;
