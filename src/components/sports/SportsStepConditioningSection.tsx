'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Timer, Play, Pause, RotateCcw, CheckCircle2, 
  Sparkles, ShieldCheck, AlertTriangle, Video, 
  Plus, Minus, Check, HeartPulse, ChevronDown, ChevronUp,
  Dumbbell, Wind, Utensils, Droplet, Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '@/components/learning/video/playerStore';

export interface ConditioningItem {
  id: string;
  type?: 'DRILL' | 'EXERCISE' | 'YOGASAN' | string;
  category?: 'DRILL' | 'EXERCISE' | 'YOGASAN' | string;
  name: string;
  recommendedDays: number;
  setsAndReps?: string;
  recommendedSets?: string;
  defaultTimerSeconds?: number;
  durationSeconds?: number;
  executionSteps?: string[];
  properExecution?: string[];
  breathingCue?: string;
  breathingCues?: string;
  mistakesToAvoid?: string[];
  commonMistakesToAvoid?: string[];
  safetyAdaptation?: string;
  safetyModification?: string;
  videoId?: string | null;
  videoTitle?: string;
  videoUrl?: string;
}

export interface StepNutrition {
  preSessionFuel?: string;
  postSessionRecovery?: string;
  hydrationTip?: string;
}

export interface SportsStepConditioningSectionProps {
  items?: ConditioningItem[];
  stepNutrition?: StepNutrition | null;
  stepId?: string;
  stepNumber?: number;
  stepTitle?: string;
  sportName?: string;
  difficultyTier?: string;
  healthConditions?: string;
  userHealthConditions?: string;
  dietaryPreference?: string;
  preferredLanguage?: string;
  onPlayVideo?: (video: { videoId: string; title: string; channel?: string }) => void;
  onItemCompleted?: (itemId: string, dayNumber: number) => void;
}

// Web Audio API chime for completed sessions
function playCompletionSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.7);

    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(783.99, now + 0.24); // G5
    gain3.gain.setValueAtTime(0.22, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.9);
  } catch (_) {}
}

export const SportsStepConditioningSection: React.FC<SportsStepConditioningSectionProps> = ({
  items: initialItems,
  stepNutrition: initialNutrition,
  stepId = 'active-step',
  stepNumber = 1,
  stepTitle = 'Physical Conditioning & Technique',
  sportName,
  difficultyTier,
  healthConditions,
  userHealthConditions,
  dietaryPreference = 'Balanced',
  preferredLanguage,
  onPlayVideo,
  onItemCompleted,
}) => {
  const effectiveHealth = healthConditions || userHealthConditions || 'None';
  const { openVideo } = usePlayerStore();
  const [items, setItems] = useState<ConditioningItem[]>(initialItems || []);
  const [nutrition, setNutrition] = useState<StepNutrition | null>(initialNutrition || null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'DRILL' | 'EXERCISE' | 'YOGASAN'>('ALL');

  // Per-item timers state: { [itemId]: { secondsLeft, targetSeconds, isRunning } }
  const [timerStates, setTimerStates] = useState<{
    [itemId: string]: { secondsLeft: number; targetSeconds: number; isRunning: boolean };
  }>({});

  // Per-item completed days state: { [itemId]: number[] }
  const [completedDaysMap, setCompletedDaysMap] = useState<{ [itemId: string]: number[] }>({});

  // Expanded instructions map
  const [expandedDetailsMap, setExpandedDetailsMap] = useState<{ [itemId: string]: boolean }>({});

  const timerIntervalRef = useRef<{ [itemId: string]: NodeJS.Timeout }>({});

  // Sync props when pack updates
  useEffect(() => {
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      setItems(initialItems);
      initTimers(initialItems);
    }
    if (initialNutrition) {
      setNutrition(initialNutrition);
    }
  }, [initialItems, initialNutrition]);

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervalRef.current).forEach(clearInterval);
    };
  }, []);

  function initTimers(itemList: ConditioningItem[]) {
    const newTimerState: { [itemId: string]: { secondsLeft: number; targetSeconds: number; isRunning: boolean } } = {};
    const newCompletedDays: { [itemId: string]: number[] } = {};

    itemList.forEach((item) => {
      const dur = item.defaultTimerSeconds || item.durationSeconds || (item.category === 'YOGASAN' || item.type === 'YOGASAN' ? 90 : 120);
      newTimerState[item.id] = {
        secondsLeft: dur,
        targetSeconds: dur,
        isRunning: false,
      };

      // Load saved completed days from localStorage keyed by stepId + itemId
      if (typeof window !== 'undefined') {
        const storageKey = `skillprax_days_${stepId}_${item.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            newCompletedDays[item.id] = JSON.parse(saved);
          } catch (_) {
            newCompletedDays[item.id] = [];
          }
        } else {
          newCompletedDays[item.id] = [];
        }
      }
    });

    setTimerStates(newTimerState);
    setCompletedDaysMap(newCompletedDays);
  }

  // Timer controls
  const toggleTimer = (itemId: string) => {
    const current = timerStates[itemId];
    if (!current) return;

    if (current.isRunning) {
      clearInterval(timerIntervalRef.current[itemId]);
      setTimerStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], isRunning: false },
      }));
    } else {
      setTimerStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], isRunning: true },
      }));

      timerIntervalRef.current[itemId] = setInterval(() => {
        setTimerStates((prev) => {
          const itemTimer = prev[itemId];
          if (!itemTimer) return prev;

          if (itemTimer.secondsLeft <= 1) {
            clearInterval(timerIntervalRef.current[itemId]);
            playCompletionSound();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
            return {
              ...prev,
              [itemId]: { ...itemTimer, secondsLeft: 0, isRunning: false },
            };
          }

          return {
            ...prev,
            [itemId]: { ...itemTimer, secondsLeft: itemTimer.secondsLeft - 1 },
          };
        });
      }, 1000);
    }
  };

  const adjustTimer = (itemId: string, deltaSeconds: number) => {
    setTimerStates((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      const newTarget = Math.max(15, Math.min(600, current.targetSeconds + deltaSeconds));
      const newRemaining = Math.max(0, Math.min(newTarget, current.secondsLeft + deltaSeconds));
      return {
        ...prev,
        [itemId]: {
          ...current,
          targetSeconds: newTarget,
          secondsLeft: newRemaining,
        },
      };
    });
  };

  const resetTimer = (itemId: string) => {
    clearInterval(timerIntervalRef.current[itemId]);
    setTimerStates((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return {
        ...prev,
        [itemId]: {
          ...current,
          secondsLeft: current.targetSeconds,
          isRunning: false,
        },
      };
    });
  };

  const handleToggleDay = (itemId: string, dayNumber: number) => {
    const currentDays = completedDaysMap[itemId] || [];
    let updated: number[];
    if (currentDays.includes(dayNumber)) {
      updated = currentDays.filter((d) => d !== dayNumber);
    } else {
      updated = [...currentDays, dayNumber].sort((a, b) => a - b);
      playCompletionSound();
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.75 } });
      onItemCompleted?.(itemId, dayNumber);
    }

    setCompletedDaysMap((prev) => ({
      ...prev,
      [itemId]: updated,
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(`skillprax_days_${stepId}_${itemId}`, JSON.stringify(updated));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayVideo = (item: ConditioningItem) => {
    if (!item.videoId) return;
    const videoData = {
      videoId: item.videoId,
      title: item.videoTitle || item.name,
      channel: 'Verified Athletic Demonstration',
    };
    if (onPlayVideo) {
      onPlayVideo(videoData);
    } else {
      openVideo(videoData);
    }
  };

  const filterCategories = [
    { id: 'ALL', label: `All (${items.length})` },
    { id: 'DRILL', label: '⚡ Drills' },
    { id: 'EXERCISE', label: '💪 Exercises' },
    { id: 'YOGASAN', label: '🧘‍♂️ Yogasanas' },
  ] as const;

  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'ALL') return true;
    const cat = (item.type || item.category || '').toUpperCase();
    return cat === activeCategoryFilter;
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Deck — Vibrant Light-SaaS with Active Safety & Diet Banner */}
      <div className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full">
                MILESTONE {stepNumber} PHYSICAL CONDITIONING
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Dynamic Groq + Tavily Generation
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Physical Practice Drills, Exercises & Yogasanas
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Every milestone delivers a tailored biomechanical conditioning pack. Execute technical motor drills with built-in stopwatches, kinetic exercises, and restorative yogasanas.
            </p>
          </div>

          {/* Active Context Banner */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs font-bold text-emerald-950 shadow-xs">
              <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Medical Safety Filter: <strong className="text-emerald-700">{effectiveHealth}</strong></span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs font-bold text-amber-950 shadow-xs">
              <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Diet Calibration: <strong className="text-amber-700">{dietaryPreference || 'Balanced'}</strong></span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills with Framer Motion Sliding Pill */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {filterCategories.map((cat) => {
            const isActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id as any)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive ? 'text-[#0284C7]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeConditioningFilter"
                    className="absolute inset-0 bg-sky-50 border border-sky-200/90 rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid — Vibrant Light-SaaS (Pure White & Vibrant, NO Black Buttons) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item, idx) => {
          const cat = (item.type || item.category || 'DRILL').toUpperCase();
          const isDrill = cat === 'DRILL';
          const isExercise = cat === 'EXERCISE';
          const isYogasan = cat === 'YOGASAN';

          const timer = timerStates[item.id] || {
            secondsLeft: item.defaultTimerSeconds || item.durationSeconds || 120,
            targetSeconds: item.defaultTimerSeconds || item.durationSeconds || 120,
            isRunning: false,
          };

          const progressPct = timer.targetSeconds > 0
            ? ((timer.targetSeconds - timer.secondsLeft) / timer.targetSeconds) * 100
            : 0;

          const completedDays = completedDaysMap[item.id] || [];
          const isAllDaysDone = completedDays.length >= item.recommendedDays;
          const isExpanded = expandedDetailsMap[item.id] ?? true;

          const categoryTheme = isDrill
            ? { badge: 'bg-sky-50 text-[#0284C7] border-sky-200', tag: '⚡ SPORT DRILL' }
            : isExercise
            ? { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', tag: '💪 CONDITIONING EXERCISE' }
            : { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', tag: '🧘‍♂️ YOGASAN & MOBILITY' };

          const executionList = item.executionSteps || item.properExecution || [
            'Establish a stable athletic base with balanced center of gravity.',
            'Execute the movement sequence with controlled biomechanical tempo.',
            'Maintain steady diaphragmatic breathing through reset phase.',
          ];

          const breathingText = item.breathingCue || item.breathingCues || 'Inhale steadily on preparation; exhale forcefully on exertion.';
          const mistakesList = item.mistakesToAvoid || item.commonMistakesToAvoid || [
            'Collapsing joint angles or spinal alignment under fatigue.',
            'Rushing repetitions without establishing balance.',
          ];
          const safetyText = item.safetyAdaptation || item.safetyModification || `Safety adapted: joint-cushioning and low mechanical shear protective of ${effectiveHealth}.`;

          return (
            <motion.div
              key={item.id || idx}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="p-6 md:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* 1. Category Pill & Title & Recommended Schedule */}
                <div className="flex items-start justify-between gap-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${categoryTheme.badge}`}>
                    {categoryTheme.tag}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-mono">
                    📅 {item.recommendedDays} Days • {item.setsAndReps || item.recommendedSets || '4 Sets × 45s'}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Recommended schedule: Perform for {item.recommendedDays} days to solidify neuromuscular motor memory.
                  </p>
                </div>

                {/* 2. Interactive Per-Day Completion Tracker (Day 1 to Day N) */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Daily Practice Log:</span>
                    </span>
                    <span className="font-mono text-emerald-700 font-extrabold">
                      {completedDays.length} / {item.recommendedDays} Days Completed
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: item.recommendedDays }, (_, dIdx) => {
                      const dayNum = dIdx + 1;
                      const isDone = completedDays.includes(dayNum);
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => handleToggleDay(item.id, dayNum)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isDone
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm ring-1 ring-emerald-400'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700'
                          }`}
                          title={`Click to mark Day ${dayNum} practice complete`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                          <span>Day {dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Tavily YouTube Video Demonstration Bar (Styled like VideoRow) */}
                {item.videoId ? (
                  <div className="bg-gradient-to-r from-sky-50 via-indigo-50/60 to-emerald-50/60 border border-sky-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-white text-[#0284C7] shadow-xs flex items-center justify-center shrink-0 border border-sky-100">
                        <Video className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.videoTitle || `${item.name} Demonstration`}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium">
                          In-App Theater Playback
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayVideo(item)}
                      className="shrink-0 bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>▶ Watch How to Do It (In-App)</span>
                    </button>
                  </div>
                ) : null}

                {/* 4. Proper How-To Execution Guide & Medical Safety Adaptation */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDetailsMap((prev) => ({
                        ...prev,
                        [item.id]: !isExpanded,
                      }))
                    }
                    className="w-full p-3.5 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>How to Perform It Properly & Safety Notes</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-3 text-xs leading-relaxed border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                          STEP-BY-STEP INSTRUCTIONS
                        </span>
                        <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
                          {executionList.map((stepLine, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              {stepLine}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* 3 Pastel Callout Boxes Matching TopicCard Design */}
                      <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-sky-950 flex items-start gap-2">
                        <Wind className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] font-black uppercase tracking-wider text-sky-700">💨 BREATHING CUE:</strong>
                          <span>{breathingText}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] font-black uppercase tracking-wider text-amber-700">⚠️ AVOID FORM BREAKS:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900 mt-0.5">
                            {mistakesList.map((m, mIdx) => (
                              <li key={mIdx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[10px] font-black uppercase tracking-wider text-emerald-700">🩺 MEDICAL / SAFETY ADAPTATION:</strong>
                          <span className="text-[11px] text-emerald-900">{safetyText}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Custom Interactive Timer / Stopwatch (Vibrant Light-SaaS — NO Black Buttons!) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-emerald-600" />
                    <span>Interactive Drill Stopwatch</span>
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => adjustTimer(item.id, -15)}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Reduce timer by 15s"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-700 px-1">
                      ±15s
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustTimer(item.id, 15)}
                      className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Increase timer by 15s"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={timer.isRunning ? 'text-sky-500 transition-all duration-300' : 'text-emerald-500 transition-all duration-300'}
                          strokeDasharray={`${progressPct}, 100`}
                          strokeLinecap="round"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-mono font-black text-slate-800">
                        {Math.round(progressPct)}%
                      </span>
                    </div>

                    <div>
                      <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                        {formatTime(timer.secondsLeft)}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        Target: {formatTime(timer.targetSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Vibrant Start / Pause Button (NEVER black!) */}
                    <button
                      type="button"
                      onClick={() => toggleTimer(item.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                        timer.isRunning
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                          : 'bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {timer.isRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => resetTimer(item.id)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                      title="Reset stopwatch"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 6. Step-Specific Nutrition Mini-Card at the Bottom */}
      {nutrition && (
        <div className="p-6 md:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-md space-y-4">
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
};

export default SportsStepConditioningSection;
