'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/common/BrandLogo';
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
import { UserProfile, SkillTrack, Review } from '@/types';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  User,
  ArrowRight,
  Sparkles,
  LogIn,
  Zap,
  Flame,
  Compass,
  GitBranch,
  Award,
  X,
  UserPlus,
  Star,
  ShieldCheck,
  Search,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Lock,
  Code2,
  Dumbbell,
  Apple,
  Droplets,
  Activity,
  Terminal,
  Check,
  AlertCircle,
  HeartPulse,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// MODULE 6: LIVE WORKSPACE PREVIEW COMPONENT
// ============================================================================
interface LiveWorkspacePreviewProps {
  onNavigate: (page: any) => void;
  onGetStarted: () => void;
}

const LiveWorkspacePreview: React.FC<LiveWorkspacePreviewProps> = ({ onNavigate, onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'cognitive' | 'athletic'>('cognitive');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Cognitive State
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(1);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Athletic State
  const [stopwatchSeconds, setStopwatchSeconds] = useState(275); // 04:35
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [activeDrillDay, setActiveDrillDay] = useState(1);
  const [selectedDiet, setSelectedDiet] = useState<'veg' | 'non-veg' | 'jain'>('veg');
  const [waterLoggedMl, setWaterLoggedMl] = useState(2400);

  // Stopwatch interval effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStopwatchRunning) {
      timer = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStopwatchRunning]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunTest = () => {
    setIsRunningTest(true);
    setTestOutput(null);
    setTimeout(() => {
      setIsRunningTest(false);
      setTestOutput('PASS: Test assertions verified in 14ms. [OCC Check: OK, VersionLock: Verified, +150 XP]');
    }, 600);
  };

  const handleLogWater = () => {
    setWaterLoggedMl((prev) => Math.min(3200, prev + 250));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-5xl mx-auto my-14 rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/60 shadow-2xl shadow-slate-200/50 overflow-hidden"
    >
      {/* Ambient Mouse-Follow Glow Effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.14), rgba(245, 158, 11, 0.09), transparent 75%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Header & Tagline */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Interactive Live Workspace Sandbox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Experience the Autonomous Mastery Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Try the live interactive micro-modules below: test Socratic gate evaluations, interactive stopwatches, and AI tailored nutrition.
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/70 shadow-inner mb-8">
          <button
            onClick={() => setActiveTab('cognitive')}
            className={`relative px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'cognitive' ? 'text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'cognitive' && (
              <motion.div
                layoutId="activeWorkspacePreviewTab"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Code2 className="w-4 h-4 text-[#0284C7] relative z-10" />
            <span className="relative z-10">Cognitive Skills Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('athletic')}
            className={`relative px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'athletic' ? 'text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {activeTab === 'athletic' && (
              <motion.div
                layoutId="activeWorkspacePreviewTab"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Dumbbell className="w-4 h-4 text-[#10B981] relative z-10" />
            <span className="relative z-10">Athletic Sports Preview</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <AnimatePresence mode="wait">
          {activeTab === 'cognitive' ? (
            <motion.div
              key="cognitive-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {/* Card 1: Milestone Nodes */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                      Roadmap Nodes
                    </span>
                    <span className="text-xs text-slate-400">Progression Graph</span>
                  </div>
                  <h3 className="text-sm font-heading font-bold text-slate-900 mb-1">
                    Distributed Systems Mastery
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Milestone checkpoints with automated 70% passing unlocks.
                  </p>

                  <div className="space-y-3">
                    {/* Node 1 */}
                    <div
                      onClick={() => setActiveMilestoneIndex(0)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        activeMilestoneIndex === 0
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Level 1: Core Fundamentals</p>
                          <p className="text-[10px] text-emerald-700 font-medium">Passed: 92% • +150 XP</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        CLEARED
                      </span>
                    </div>

                    {/* Node 2 */}
                    <div
                      onClick={() => setActiveMilestoneIndex(1)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ring-2 ring-amber-400/60 ${
                        activeMilestoneIndex === 1
                          ? 'border-amber-500 bg-amber-50/60'
                          : 'border-amber-300 bg-amber-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Level 2: Memory & Concurrency</p>
                          <p className="text-[10px] text-amber-700 font-medium">Active Stage: Socratic Duel</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </div>

                    {/* Node 3 */}
                    <div
                      onClick={() => setActiveMilestoneIndex(2)}
                      className={`p-3 rounded-xl border border-slate-200 bg-slate-50/40 text-slate-400 flex items-center justify-between cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600">Level 3: Distributed Raft</p>
                          <p className="text-[10px] text-slate-400">Locked: Requires Level 2</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded font-mono">
                        LOCKED
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Target Passing: 70%</span>
                  <span className="font-semibold text-emerald-600">Streak: 7 Days</span>
                </div>
              </div>

              {/* Card 2: Interactive Code Snippet */}
              <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans ml-2">optimistic_lock.ts</span>
                    </div>
                    <span className="text-[10px] text-sky-400 uppercase tracking-widest font-sans font-bold">
                      TypeScript
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 leading-relaxed overflow-x-auto py-1">
                    <p className="text-slate-500">// Atomic version-checked write</p>
                    <p>
                      <span className="text-purple-400">async function</span>{' '}
                      <span className="text-sky-300">applyUpdate</span>(id: <span className="text-amber-300">string</span>) {'{'}
                    </p>
                    <p className="pl-3">
                      <span className="text-purple-400">const</span> row = <span className="text-purple-400">await</span> db.find(id);
                    </p>
                    <p className="pl-3">
                      <span className="text-purple-400">return await</span> db.mutate({'{'}
                    </p>
                    <p className="pl-6 text-slate-400">
                      where: {'{'} id, version: row.version {'}'},
                    </p>
                    <p className="pl-6 text-emerald-400">
                      data: {'{'} version: {'{'} increment: 1 {'}'} {'}'}
                    </p>
                    <p className="pl-3">{'}'});</p>
                    <p>{'}'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={handleRunTest}
                    disabled={isRunningTest}
                    className="w-full py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-xl text-xs font-sans font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{isRunningTest ? 'Running Assertions...' : 'Run Test Suite'}</span>
                  </button>
                  {testOutput && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-emerald-400 mt-2 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/60 leading-tight"
                    >
                      {testOutput}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Card 3: Socratic Quiz Duel Card */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      Socratic Checkpoint
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">+150 XP</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug mb-3">
                    Which concurrency primitive prevents lost updates without thread lock contention?
                  </h4>

                  <div className="space-y-2">
                    {[
                      { id: 0, text: 'Pessimistic Table Lock (High Contention)', correct: false },
                      { id: 1, text: 'Atomic CAS with Monotonic Version Number', correct: true },
                      { id: 2, text: 'Unsynchronized Polling Thread', correct: false },
                    ].map((opt) => {
                      const isSelected = quizAnswered === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setQuizAnswered(opt.id)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? opt.correct
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                                : 'bg-rose-50 border-rose-400 text-rose-900'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-[11px]">{opt.text}</span>
                          {isSelected && (
                            <span>
                              {opt.correct ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  {quizAnswered === 1 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-medium flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Passed! Level 2 threshold cleared. Ready for Raft consensus.</span>
                    </motion.div>
                  ) : quizAnswered !== null ? (
                    <p className="text-[11px] text-rose-600 font-medium">
                      Incorrect. Atomic CAS utilizes hardware-level instructions to guarantee safety.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Select an option above to simulate Socratic evaluation.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="athletic-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {/* Card 1: Interactive Practice Stopwatch */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Interactive Practice Timer
                    </span>
                    <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                      High Intensity
                    </span>
                  </div>
                  <h3 className="text-sm font-heading font-bold text-slate-900 mb-1">
                    Cone Zig-Zag Agility & Quick Turns
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Football • Dribbling & Ball Mastery (15 Mins Drill)
                  </p>

                  {/* Digital Clock Display */}
                  <div className="text-center py-4 px-3 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-inner mb-4">
                    <div className="text-3xl font-mono font-bold tracking-wider text-emerald-400">
                      {formatTimer(stopwatchSeconds)}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-widest">
                      Target: 15:00 • In Progress
                    </p>
                  </div>

                  {/* Form Cues */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800 mb-0.5">Key Form Cue:</p>
                    <p>Keep center of gravity low; feather touch with outside of boot on cone inflection.</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIsStopwatchRunning((r) => !r)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    {isStopwatchRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Start
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsStopwatchRunning(false);
                      setStopwatchSeconds(0);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Reset Stopwatch"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: 7-Day Athletic Drill Regimen */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                      7-Day Regimen
                    </span>
                    <span className="text-[11px] text-slate-400">AI Medical Adaptation</span>
                  </div>
                  <h3 className="text-sm font-heading font-bold text-slate-900 mb-1">
                    Custom Athletic Curriculum
                  </h3>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] mb-3">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Adapted for Knee Sensitivity: Low-impact isometrics replace jump squats.</span>
                  </div>

                  {/* Day Selector Pills */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[1, 2, 3].map((day) => (
                      <button
                        key={day}
                        onClick={() => setActiveDrillDay(day)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeDrillDay === day
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Day {day}
                      </button>
                    ))}
                  </div>

                  {/* Drill Details */}
                  <div className="space-y-2">
                    {activeDrillDay === 1 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-bold text-slate-900">Day 1: Ball Mastery & Spatial Vision</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Duration: 15 Mins • 4 Sets</p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Focus: Quick sole rolls and inside-outside cuts.
                        </p>
                      </div>
                    )}
                    {activeDrillDay === 2 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-bold text-slate-900">Day 2: Isometric Lateral Resistance</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Duration: 20 Mins • Banded Shuffles</p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Focus: Knee stabilization & glute medius activation.
                        </p>
                      </div>
                    )}
                    {activeDrillDay === 3 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <p className="font-bold text-slate-900">Day 3: Explosive Deceleration</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Duration: 15 Mins • Sprint to Stop</p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Focus: Controlled hip absorption without knee forward collapse.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Completed: 1/7 Days</span>
                  <span className="font-semibold text-emerald-600">Goal: Agility</span>
                </div>
              </div>

              {/* Card 3: Daily Athletic Nutrition & Fueling */}
              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Apple className="w-3 h-3" /> Athletic Fueling
                    </span>
                    <span className="text-[11px] text-slate-400">Dietary Gated</span>
                  </div>

                  {/* Dietary Toggle Pills */}
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {[
                      { id: 'veg', label: 'Vegetarian' },
                      { id: 'non-veg', label: 'Non-Veg' },
                      { id: 'jain', label: 'Jain' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDiet(d.id as any)}
                        className={`py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedDiet === d.id
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Meal Breakdown Snippets */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] font-bold text-amber-700 uppercase">Morning Ignition</p>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {selectedDiet === 'veg'
                          ? 'Oats + chia seeds + almonds + paneer bhurji'
                          : selectedDiet === 'non-veg'
                          ? '3 Boiled eggs + whole wheat toast + avocado'
                          : 'Oats with flaxseeds, soaked almonds, & warm plant milk'}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      <p className="text-[10px] font-bold text-sky-700 uppercase">Post-Workout Recovery</p>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {selectedDiet === 'non-veg'
                          ? 'Grilled chicken breast with steamed greens & quinoa'
                          : selectedDiet === 'jain'
                          ? 'Plant protein shake + roasted chana + sprouted moong'
                          : 'Whey protein smoothie + sprouted moong salad'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hydration Circular Tracker */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {(waterLoggedMl / 1000).toFixed(1)}L / 3.2L Hydration
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {Math.round((waterLoggedMl / 3200) * 100)}% of daily athletic target
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogWater}
                    className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95"
                  >
                    +250ml
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Trajectory Launch CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('page03')}
            className="px-8 py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white rounded-xl text-sm font-heading font-extrabold tracking-wide shadow-lg shadow-sky-500/20 cursor-pointer flex items-center gap-2 active:scale-95 group"
          >
            <span>Launch Live Workspace Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-xl text-xs font-heading font-bold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <span>Customize Personal Trajectory</span>
          </button>
        </div>
      </div>
    </div>
  );
};


interface LandingPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (page: 'landing' | 'profile' | 'studio' | 'page01' | 'page02' | 'page03' | 'page04') => void;
  tracks: SkillTrack[];
  onOpenAdmin?: () => void;
  existingProfiles?: any[];
  onSelectProfile?: (profileId: string) => void;
  onCreateProfile?: (data: { name: string; educationBoard?: string; grade?: string; profession?: string; age?: number }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  tracks,
  onSelectProfile,
  onCreateProfile,
}) => {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayMode, setGatewayMode] = useState<'create' | 'existing'>('create');

  // Public Reviews Wall of Love
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchPublicReviews();
  }, []);

  async function fetchPublicReviews() {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/reviews/public');
      if (res.ok) {
        const data = await res.json();
        setPublicReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn('Failed to fetch public reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }

  const handleOpenGetStarted = (mode: 'create' | 'existing' = 'create') => {
    setGatewayMode(mode);
    setIsGatewayOpen(true);
  };

  const handleLearnerSuccess = (profile: any) => {
    if (onSelectProfile && profile?.id) {
      onSelectProfile(profile.id);
    }
    if (profile) {
      onUpdateProfile({
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        profession: profile.profession,
        avatarUrl: profile.avatarUrl || profile.avatar_url,
      });
    }
    setIsGatewayOpen(false);
    onNavigate('page02');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-transparent text-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Top Header Navigation */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between"
      >
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('page01')}
        >
          <BrandLogo size="md" showWordmark={true} />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Multi-Language Dropdown */}
          <LanguageSelector />

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-mono font-bold text-amber-900">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-flame" />
            <span>{userProfile.flameStreak || userProfile.streakDays || 1}d STREAK</span>
          </div>

          <Link
            href="/skills"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all duration-200"
          >
            <span>Skills Studio</span>
          </Link>

          <Link
            href="/sports"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200"
          >
            <span>Sports Hub</span>
          </Link>

          <button
            onClick={() => onNavigate('page02')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Learner Profile</span>
          </button>

          <button
            onClick={() => handleOpenGetStarted('existing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-600/20">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold tracking-wide shadow-md cursor-pointer uppercase flex items-center gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-10 sm:py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-sky-200/90 text-sky-800 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-sky-500/10 mb-6"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-ping" />
          <span>SKILL-TRACK ENGINE • Autonomous Cognitive & Athletic Studio</span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-4 sm:my-6 flex items-center justify-center"
        >
          <div className="relative group p-2">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 via-emerald-400/20 to-amber-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <BrandLogo size="hero" className="relative z-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-2xl mt-4"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            SKILL-TRACK: Autonomous Mastery Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Dynamic competency roadmaps synthesized with active graph visualization, strict in-app video media playback, and diagnostic Socratic gates.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <div className="relative p-[2.5px] rounded-2xl conic-beam">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[14px] font-heading font-extrabold text-base sm:text-lg tracking-wider shadow-2xl cursor-pointer uppercase flex items-center gap-3 active:scale-95 group"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('page03')}
            className="px-6 py-4 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-2xl font-heading font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2.5 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Explore Flowchart Roadmap</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-4xl w-full text-left"
        >
          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-110 transition-transform">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-heading font-bold text-slate-900">
                Flowchart Roadmaps
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Milestone dependency graphs with live energy pulses and assessable ACU nodes.
            </p>
          </div>

          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-heading font-bold text-slate-900">
                Telemetry & Streaks
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Consecutive daily streaks with earned 7-day milestone freeze safeguards.
            </p>
          </div>

          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 bg-sky-100 text-sky-800 rounded-xl group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-heading font-bold text-slate-900">
                Socratic Duel Gates
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Adaptive mastery evaluation checkpoints with 70% passing clearance thresholds.
            </p>
          </div>
        </motion.div>

        {/* LIVE WORKSPACE PREVIEW MODULE */}
        <LiveWorkspacePreview
          onNavigate={onNavigate}
          onGetStarted={() => handleOpenGetStarted('create')}
        />

        {/* PUBLIC COMMUNITY REVIEWS & WALL OF LOVE */}
        <ReviewsSection reviews={publicReviews} loading={loadingReviews} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">SKILL-TRACK Enterprise Engine</span>
          <span>© 2026 Autonomous Pedagogy</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button
            onClick={() => handleOpenGetStarted('create')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Create Profile
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page02')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Profile Hub
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page03')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Workspace Studio
          </button>
        </div>
      </footer>

      {/* UNIFIED AUTH MODAL (SMART UNIVERSAL AUTO LOGIN / SIGNUP) */}
      <UnifiedAuthModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onSuccess={handleLearnerSuccess}
      />
    </div>
  );
};

export default LandingPage;
