'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Timer, Play, Pause, RotateCcw, CheckCircle2, 
  Sparkles, ShieldCheck, AlertTriangle, Eye, Video, 
  Plus, Minus, Check, HeartPulse, ChevronDown, ChevronUp,
  Dumbbell, Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlayerStore } from '@/components/learning/video/playerStore';

export interface ConditioningItem {
  id: string;
  category: 'DRILL' | 'EXERCISE' | 'YOGASAN' | string;
  name: string;
  recommendedDays: number;
  recommendedSets: string;
  durationSeconds: number;
  intensity: 'Low' | 'Medium' | 'High' | string;
  properExecution: string[];
  breathingCues: string;
  commonMistakesToAvoid: string[];
  safetyModification?: string;
  videoId?: string | null;
  videoTitle?: string;
  videoUrl?: string;
}

export interface SportsStepConditioningSectionProps {
  sportName: string;
  stepNumber: number;
  stepTitle: string;
  difficultyTier?: string;
  userHealthConditions?: string;
  preferredLanguage?: string;
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
  sportName,
  stepNumber,
  stepTitle,
  difficultyTier = 'Foundational',
  userHealthConditions = 'None',
  preferredLanguage = 'en',
  onItemCompleted,
}) => {
  const { openVideo } = usePlayerStore();
  const [items, setItems] = useState<ConditioningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'DRILL' | 'EXERCISE' | 'YOGASAN'>('ALL');
  
  // Per-item timers state: { [itemId]: { secondsLeft, targetSeconds, isRunning } }
  const [timerStates, setTimerStates] = useState<{
    [itemId: string]: { secondsLeft: number; targetSeconds: number; isRunning: boolean };
  }>({});

  // Per-item completed days state: { [itemId]: Set of completed day numbers }
  const [completedDaysMap, setCompletedDaysMap] = useState<{ [itemId: string]: number[] }>({});
  
  // Expanded instructions map
  const [expandedDetailsMap, setExpandedDetailsMap] = useState<{ [itemId: string]: boolean }>({});

  const timerIntervalRef = useRef<{ [itemId: string]: NodeJS.Timeout }>({});

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');

  useEffect(() => {
    fetchConditioningItems();
    return () => {
      // Clear all active intervals on unmount
      Object.values(timerIntervalRef.current).forEach(clearInterval);
    };
  }, [sportName, stepNumber, userHealthConditions, preferredLanguage]);

  async function fetchConditioningItems() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/step-conditioning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportName,
          stepNumber,
          stepTitle,
          difficultyTier,
          healthConditions: userHealthConditions,
          preferredLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
          initTimers(data.items);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch step conditioning items:', err);
    } finally {
      setLoading(false);
    }

    // High quality deterministic fallbacks if offline
    const fallbackList: ConditioningItem[] = [
      {
        id: `item-${sportName.toLowerCase()}-s${stepNumber}-1`,
        category: 'DRILL',
        name: `${sportName} Step ${stepNumber} — Kinematic Deceleration & Pivot Drill`,
        recommendedDays: 5,
        recommendedSets: '3 Sets × 45s',
        durationSeconds: 120,
        intensity: 'Medium',
        properExecution: [
          'Maintain an athletic low center of gravity with knee joints loaded symmetrically.',
          'Execute explosive deceleration into plant foot, pivoting 90 degrees with fluid weight transfer.',
          'Re-accelerate into a stable balanced stance with eyes forward.'
        ],
        breathingCues: 'Inhale steadily on approach; exhale sharply as your plant foot makes ground contact.',
        commonMistakesToAvoid: [
          'Locking knee joint on impact rather than absorbing force through hips and ankles.',
          'Looking down at feet instead of scanning surrounding space.'
        ],
        safetyModification: `Protected form: low-impact pivot adapted to protect ${userHealthConditions || 'joints'}.`,
        videoId: '7Q3Z8w7_M3s',
        videoTitle: `${sportName} Step ${stepNumber} Technical Drill Breakdown`,
      },
      {
        id: `item-${sportName.toLowerCase()}-s${stepNumber}-2`,
        category: 'EXERCISE',
        name: `Posterior Kinetic Chain Isometric Stability`,
        recommendedDays: 4,
        recommendedSets: '4 Sets × 30s',
        durationSeconds: 90,
        intensity: 'Medium',
        properExecution: [
          'Hinge cleanly at hips with a neutral spine and abdominal brace.',
          'Hold static tension through glutes, hamstrings, and upper thoracic stabilizers.',
          'Drive through heels to rise without hyperextending lumbar vertebrae.'
        ],
        breathingCues: 'Deep continuous diaphragm breathing; avoid holding breath during isometric load.',
        commonMistakesToAvoid: [
          'Rounding the thoracic or lower back under load.',
          'Letting knees cave inward during hip hinge.'
        ],
        safetyModification: `Spine-neutral load eliminating shear force, calibrated for ${userHealthConditions || 'safety'}.`,
        videoId: 'V1a0T9W2i5w',
        videoTitle: 'Athletic Conditioning & Core Stability Exercise',
      },
      {
        id: `item-${sportName.toLowerCase()}-s${stepNumber}-3`,
        category: 'YOGASAN',
        name: `Adho Mukha Svanasana & Ankle Mobility Flow`,
        recommendedDays: 6,
        recommendedSets: '3 Holds × 60s',
        durationSeconds: 90,
        intensity: 'Low',
        properExecution: [
          'Ground palms shoulder-width apart, spreading fingers evenly to protect wrists.',
          'Elevate hips skyward while pedaling heels rhythmically toward the floor.',
          'Lengthen through spine and relax neck tension completely.'
        ],
        breathingCues: '4-second inhale through nose expanding ribs; 6-second soft exhale through nose.',
        commonMistakesToAvoid: [
          'Collapsing weight into wrist joints instead of distributing across knuckle pads.',
          'Over-arching lumbar curve.'
        ],
        safetyModification: `Gentle decompression flow with bent knee variation recommended for ${userHealthConditions || 'mobility'}.`,
        videoId: 'g_tea8ZNk5A',
        videoTitle: 'Yoga for Athletes — Restorative Hip & Ankle Mobility',
      },
    ];
    setItems(fallbackList);
    initTimers(fallbackList);
  }

  function initTimers(itemList: ConditioningItem[]) {
    const newTimerState: { [itemId: string]: { secondsLeft: number; targetSeconds: number; isRunning: boolean } } = {};
    const newCompletedDays: { [itemId: string]: number[] } = {};

    itemList.forEach((item) => {
      const dur = item.durationSeconds || (item.category === 'YOGASAN' ? 90 : 120);
      newTimerState[item.id] = {
        secondsLeft: dur,
        targetSeconds: dur,
        isRunning: false,
      };

      // Load saved completed days from localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`skillprax_days_${item.id}`);
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
      // Pause
      clearInterval(timerIntervalRef.current[itemId]);
      setTimerStates((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], isRunning: false },
      }));
    } else {
      // Start
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
      localStorage.setItem(`skillprax_days_${itemId}`, JSON.stringify(updated));
    }
  };

  const handleMarkTodayComplete = (item: ConditioningItem) => {
    const currentDays = completedDaysMap[item.id] || [];
    const maxDays = item.recommendedDays || 5;
    const nextUnchecked = Array.from({ length: maxDays }, (_, i) => i + 1).find((d) => !currentDays.includes(d));
    if (nextUnchecked) {
      handleToggleDay(item.id, nextUnchecked);
    } else {
      // All days are done, restart or congratulate
      alert(`Awesome! You have completed all ${maxDays} days for this ${item.category.toLowerCase()}!`);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'ALL') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Deck with Safety Badge */}
      <div className="p-6 md:p-8 bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                STEP {stepNumber} CONDITIONING ENGINE
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Drills • Conditioning Exercises • Yogasanas
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Physical Drills, Exercises & Yogasanas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Every step escalates in athletic biomechanics. Execute technical drills with built-in countdown stopwatches, conditioning sets, and yogasan mobility flows.
            </p>
          </div>

          {/* Profile Health Condition Safety Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 shadow-xs self-start md:self-auto shrink-0">
            <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider block text-emerald-600 font-extrabold">Health Safety Filter:</span>
              <span>{userHealthConditions && userHealthConditions !== 'None' ? userHealthConditions : 'No physical restrictions'}</span>
            </div>
          </div>
        </div>

        {/* 4-Pill Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('DRILL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeCategoryFilter === 'DRILL'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <span>⚡ Technical Drills</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full">
              {items.filter((i) => i.category === 'DRILL').length}
            </span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('EXERCISE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeCategoryFilter === 'EXERCISE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <span>💪 Conditioning Exercises</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full">
              {items.filter((i) => i.category === 'EXERCISE').length}
            </span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('YOGASAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeCategoryFilter === 'YOGASAN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>🧘‍♂️ Yogasanas & Mobility</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full">
              {items.filter((i) => i.category === 'YOGASAN').length}
            </span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Synthesizing Step {stepNumber} Drills, Exercises & Yogasanas...
          </span>
        </div>
      )}

      {/* Conditioning Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item, idx) => {
            const isDrill = item.category === 'DRILL';
            const isExercise = item.category === 'EXERCISE';
            const isYogasan = item.category === 'YOGASAN';

            const timer = timerStates[item.id] || {
              secondsLeft: item.durationSeconds || 120,
              targetSeconds: item.durationSeconds || 120,
              isRunning: false,
            };

            const progressPct = timer.targetSeconds > 0
              ? ((timer.targetSeconds - timer.secondsLeft) / timer.targetSeconds) * 100
              : 0;

            const completedDays = completedDaysMap[item.id] || [];
            const isAllDaysDone = completedDays.length >= item.recommendedDays;
            const isExpanded = expandedDetailsMap[item.id] ?? true;

            const categoryTheme = isDrill
              ? { badge: 'bg-sky-50 text-sky-700 border-sky-200', tag: '⚡ SPORT DRILL', color: 'sky' }
              : isExercise
              ? { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', tag: '💪 CONDITIONING EXERCISE', color: 'indigo' }
              : { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', tag: '🧘‍♂️ YOGASAN & MOBILITY', color: 'emerald' };

            return (
              <motion.div
                key={item.id || idx}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 md:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Category Pill, Title & Schedule Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${categoryTheme.badge}`}>
                      {categoryTheme.tag}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                      {item.intensity} Intensity
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                      <span>📅 Perform for {item.recommendedDays} Days</span>
                      <span>•</span>
                      <span>{item.recommendedSets || '3 Sets × 45s'}</span>
                    </p>
                  </div>

                  {/* Interactive Day Tracker Pills */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Daily Practice Log:</span>
                      <span className="font-mono text-emerald-700">
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
                            onClick={() => handleToggleDay(item.id, dayNum)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700'
                            }`}
                            title={`Toggle Day ${dayNum} practice log`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            <span>Day {dayNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Execution Guide Collapsible Accordion */}
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedDetailsMap((prev) => ({
                          ...prev,
                          [item.id]: !isExpanded,
                        }))
                      }
                      className="w-full p-3.5 bg-slate-50/60 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      <span>Proper Technique & Breathing Guide</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white space-y-3.5 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                        {/* Numbered instructions */}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                            STEP-BY-STEP EXECUTION
                          </span>
                          <ol className="space-y-1.5 list-decimal list-inside text-slate-600">
                            {item.properExecution.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Breathing cue */}
                        {item.breathingCues && (
                          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 flex items-start gap-2">
                            <Wind className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] font-black uppercase text-sky-700">Breathing Cue:</strong>
                              <span>{item.breathingCues}</span>
                            </div>
                          </div>
                        )}

                        {/* Form mistakes */}
                        {item.commonMistakesToAvoid && item.commonMistakesToAvoid.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] font-black uppercase text-amber-700">Avoid Form Breaks:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                                {item.commonMistakesToAvoid.map((m, mIdx) => (
                                  <li key={mIdx}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Safety modification */}
                        {item.safetyModification && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[10px] font-black uppercase text-emerald-700">Health Safety Adaptation:</strong>
                              <span className="text-[11px] text-emerald-800">{item.safetyModification}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Built-In Countdown Stopwatch on Every Card */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-emerald-600" />
                      <span>Interactive Drill Stopwatch</span>
                    </span>

                    {/* Quick adjust duration buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
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
                        onClick={() => adjustTimer(item.id, 15)}
                        className="p-1 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="Increase timer by 15s"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Circular & Digital Readout Deck */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      {/* SVG Circular Ring */}
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

                    {/* Timer control buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTimer(item.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          timer.isRunning
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
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
                        onClick={() => resetTimer(item.id)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Reset stopwatch"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Action Bar: In-App Video Player & Mark Today Complete (NO QUIZ BUTTON!) */}
                  <div className="flex items-center gap-2 pt-1">
                    {item.videoId ? (
                      <button
                        onClick={() => {
                          openVideo({
                            videoId: item.videoId!,
                            title: item.videoTitle || item.name,
                            channel: sportName,
                          });
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>▶ Watch In-App Demo</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleMarkTodayComplete(item)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        isAllDaysDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAllDaysDone ? '✓ All Days Cleared' : "✓ Log Today's Session"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SportsStepConditioningSection;
