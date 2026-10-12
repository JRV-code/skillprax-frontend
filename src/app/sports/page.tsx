'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Play, Pause, RotateCcw, Flag, Clock, 
  CheckCircle2, Plus, ArrowRight, Zap, Target, 
  Award, Sparkles, RefreshCw, Dumbbell, 
  Check, Flame, Shield, BookOpen, Compass, 
  ShoppingBag, Truck, ShieldCheck, User, Users
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { SportsStepTracker } from '@/components/workspace/SportsStepTracker';
import { SocraticQuizModal } from '@/components/SocraticQuizModal';
import SportsNavigationHeader from '@/components/sports/SportsNavigationHeader';
import { DrillCard } from '@/components/sports/DrillCard';
import { ClubsExploreView } from '@/components/sports/ClubsExploreView';
import { SportsShopView } from '@/components/sports/SportsShopView';
import { ManagedTravelView } from '@/components/sports/ManagedTravelView';
import SportsInboxView from '@/components/sports/SportsInboxView';
import { AthleteProfileView } from '@/components/sports/AthleteProfileView';
import { SportDrill } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

type SportsSubTab = 'training' | 'clubs' | 'shop' | 'travel' | 'scouting';

const SUB_TABS = [
  { id: 'training', label: 'Training & Drills', icon: Dumbbell, desc: 'Daily Regimens & Stopwatch' },
  { id: 'clubs', label: 'Clubs Near Me', icon: Compass, desc: 'Verified Academies & Maps' },
  { id: 'shop', label: 'Sports Shop', icon: ShoppingBag, desc: 'Official Gear & Escrow' },
  { id: 'travel', label: 'Managed Travel', icon: Truck, desc: 'Verified Transit Vans' },
  { id: 'scouting', label: 'Scouting & Rosters', icon: ShieldCheck, desc: 'Trials & Accept-to-Unlock' },
] as const;

const AVAILABLE_SPORTS = [
  { name: 'Football', subGenres: ['Dribbling & Ball Mastery', 'Finishing & Shooting', 'Passing & Tactical IQ', 'Goalkeeping Fundamentals'] },
  { name: 'Cricket', subGenres: ['Wicketkeeping Agility', 'Fast Bowling Kinetic Chain', 'Batting Stance & Drive', 'Spin Bowling Control'] },
  { name: 'Badminton', subGenres: ['Smash Mechanics', 'Footwork & Recovery', 'Net Play & Drop Shots', 'Serving Precision'] },
  { name: 'Tennis', subGenres: ['Topspin Forehand', 'Backhand Drive', 'Serve Mechanics', 'Court Movement & Split Step'] },
  { name: 'Basketball', subGenres: ['Shooting Form & Arc', 'Ball Handling & Crossover', 'Defensive Stance', 'Pick and Roll Execution'] },
  { name: 'Sprint', subGenres: ['Drive Phase 0-30m', 'Maximum Velocity Mechanics', 'Block Start Acceleration', 'Deceleration Pacing'] },
];

export default function SportsHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySportId = searchParams.get('id');
  const queryTab = searchParams.get('tab') as SportsSubTab | null;
  const { currentLanguage, t } = useLanguage();

  // Glassmorphic Sub-Navigation Active Tab
  const [activeSubTab, setActiveSubTab] = useState<SportsSubTab>(
    queryTab && ['training', 'clubs', 'shop', 'travel', 'scouting'].includes(queryTab) ? queryTab : 'training'
  );

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [sportsTracks, setSportsTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);

  // Active Sport Track & Workspace Studio States
  const [selectedSportId, setSelectedSportId] = useState<string | null>(querySportId);
  const [activeWorkspace, setActiveWorkspace] = useState<any | null>(null);
  const [loadingActiveWorkspace, setLoadingActiveWorkspace] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);

  // Stopwatch Engine States
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [laps, setLaps] = useState<Array<{ lapNumber: number; lapTime: number; overallTime: number }>>([]);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const [loggingActivity, setLoggingActivity] = useState<boolean>(false);
  const [activityFeedback, setActivityFeedback] = useState<string | null>(null);

  // Drill Generator States
  const [selectedSport, setSelectedSport] = useState<string>('Football');
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('Dribbling & Ball Mastery');
  const [currentDrills, setCurrentDrills] = useState<SportDrill[]>([]);
  const [loadingDrills, setLoadingDrills] = useState<boolean>(false);

  // Sync tab with URL query param if changed
  useEffect(() => {
    if (queryTab && ['training', 'clubs', 'shop', 'travel', 'scouting'].includes(queryTab)) {
      setActiveSubTab(queryTab);
    }
  }, [queryTab]);

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id');
    if (!storedId) {
      router.push('/');
      return;
    }
    setActiveProfileId(storedId);
    loadSportsData(storedId);
  }, []);

  useEffect(() => {
    if (querySportId) {
      setSelectedSportId(querySportId);
    }
  }, [querySportId]);

  useEffect(() => {
    if (selectedSportId) {
      loadActiveWorkspace(selectedSportId);
    } else if (sportsTracks.length > 0) {
      setSelectedSportId(sportsTracks[0].id);
    }
  }, [selectedSportId, sportsTracks]);

  // Dynamic Drill Fetching via Groq API
  useEffect(() => {
    fetchDynamicDrills(selectedSport, selectedSubGenre, activeStepIndex + 1);
  }, [selectedSport, selectedSubGenre, activeStepIndex, currentLanguage]);

  async function fetchDynamicDrills(sport: string, sub: string, stepNum: number) {
    try {
      setLoadingDrills(true);
      const res = await fetch('/api/sports/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportName: sport,
          subGenre: sub,
          stepNumber: stepNum,
          stepTitle: activeStep?.title || `${sport} Milestone ${stepNum}`,
          preferredLanguage: currentLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.drills) && data.drills.length > 0) {
          setCurrentDrills(data.drills);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load dynamic drills from API:', err);
    } finally {
      setLoadingDrills(false);
    }
  }

  async function loadSportsData(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        const allTracks = data.enrolledWorkspaces || [];
        const sportsOnly = allTracks.filter(
          (w: any) => w.domainCategory === 'Athletics' || w.domain === 'Athletics' ||
            ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'badminton', 'basketball'].some(s => (w.title || '').toLowerCase().includes(s))
        );
        setSportsTracks(sportsOnly);
      }
    } catch (err) {
      console.error('Failed to load sports telemetry:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveWorkspace(workspaceId: string) {
    try {
      setLoadingActiveWorkspace(true);
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        const ws = data.workspace || data;
        setActiveWorkspace(ws);
        const steps = ws.steps || [];
        const firstActive = steps.findIndex((s: any) => s.status !== 'PASSED');
        setActiveStepIndex(firstActive >= 0 ? firstActive : 0);

        // Sync sport selector if workspace has title
        const matched = AVAILABLE_SPORTS.find((s) => (ws.title || '').toLowerCase().includes(s.name.toLowerCase()));
        if (matched) {
          setSelectedSport(matched.name);
          setSelectedSubGenre(matched.subGenres[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load active sport workspace:', err);
    } finally {
      setLoadingActiveWorkspace(false);
    }
  }

  const handlePracticeDayComplete = (completedDays: number) => {
    if (!activeWorkspace) return;
    setActiveWorkspace((prev: any) => {
      if (!prev) return prev;
      const updatedSteps = (prev.steps || []).map((s: any, idx: number) => {
        if (idx === activeStepIndex) {
          return { ...s, practiceDaysCompleted: completedDays };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleAdvanceStep = () => {
    if (!activeWorkspace) return;
    const steps = activeWorkspace.steps || [];
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handleQuizPassed = (score: number) => {
    if (!activeWorkspace) return;
    setActiveWorkspace((prev: any) => {
      if (!prev) return prev;
      const updatedSteps = (prev.steps || []).map((s: any, idx: number) => {
        if (idx === activeStepIndex) {
          return { ...s, status: 'PASSED', quizPassed: true, quizScore: score };
        }
        if (idx === activeStepIndex + 1 && (s.status === 'LOCKED' || s.status === 'STUDY_UNGENERATED')) {
          return { ...s, status: 'IN_PROGRESS' };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  const activeStep = activeWorkspace?.steps?.[activeStepIndex] || null;
  const activeQuizQuestions = React.useMemo(() => {
    if (!activeStep) return [];
    const blueprintRaw = activeStep.quizBlueprint;
    let questions = Array.isArray(blueprintRaw)
      ? blueprintRaw
      : typeof blueprintRaw === 'string'
      ? JSON.parse(blueprintRaw || '[]')
      : [];

    return questions.map((q: any) => ({
      id: q.id || q.questionId,
      question: q.question || q.scenario,
      options: Array.isArray(q.options)
        ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
        : [],
      correctOptionIndex: typeof q.correctOptionIndex === 'number'
        ? q.correctOptionIndex
        : (q.correctOptionId ? ['A', 'B', 'C', 'D'].indexOf(String(q.correctOptionId).toUpperCase()) : 0),
      correctOptionId: q.correctOptionId || 'A',
      explanation: q.explanation || 'Validated biomechanical and athletic comprehension.',
    }));
  }, [activeStep]);

  // Stopwatch Logic
  const handleStartTimer = () => {
    if (timerRunning) return;
    setTimerRunning(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const current = Date.now();
      const diff = current - startTimeRef.current;
      setElapsedMs(accumulatedMsRef.current + diff);
    }, 25);
  };

  const handlePauseTimer = () => {
    if (!timerRunning) return;
    clearInterval(timerRef.current);
    accumulatedMsRef.current = elapsedMs;
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    clearInterval(timerRef.current);
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setTimerRunning(false);
    setLaps([]);
  };

  const handleLap = () => {
    if (elapsedMs === 0) return;
    const previousTotal = laps.length > 0 ? laps[laps.length - 1].overallTime : 0;
    const lapTime = elapsedMs - previousTotal;
    setLaps((prev) => [
      ...prev,
      {
        lapNumber: prev.length + 1,
        lapTime,
        overallTime: elapsedMs,
      },
    ]);
  };

  const handleLogActivity = async () => {
    if (!activeProfileId || elapsedMs < 5000) {
      setActivityFeedback('Practice at least a few seconds before logging activity.');
      setTimeout(() => setActivityFeedback(null), 3000);
      return;
    }

    try {
      setLoggingActivity(true);
      setActivityFeedback(null);
      const minutesSpent = Math.max(1, Math.round(elapsedMs / 60000));
      const res = await fetch(`/api/profiles/${activeProfileId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: minutesSpent }),
      });
      if (!res.ok) throw new Error('Failed to log practice activity');
      setActivityFeedback(`Logged ${minutesSpent} practice minute(s) directly to your daily activity log! ⚡`);
      setTimeout(() => setActivityFeedback(null), 4000);
    } catch (err: any) {
      setActivityFeedback(err.message || 'Error recording practice minutes.');
      setTimeout(() => setActivityFeedback(null), 4000);
    } finally {
      setLoggingActivity(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    const matched = AVAILABLE_SPORTS.find((s) => s.name === sport);
    const defaultSub = matched?.subGenres[0] || 'Fundamentals';
    setSelectedSubGenre(defaultSub);
  };

  const handleSubGenreChange = (sub: string) => {
    setSelectedSubGenre(sub);
  };

  const handleDrillCompleted = (drillId: string) => {
    setCurrentDrills((prev) =>
      prev.map((d) => (d.id === drillId ? { ...d, completed: true } : d))
    );
    // If active step exists, update practice days completed
    if (activeStep && activeWorkspace) {
      const currentCompleted = activeStep.practiceDaysCompleted || 0;
      const targetDays = activeStep.requiredPracticeDays || 3;
      handlePracticeDayComplete(Math.min(currentCompleted + 1, targetDays));
    }
  };

  const handleDrillPracticeLogged = async (mins: number) => {
    if (!activeProfileId) return;
    try {
      await fetch(`/api/profiles/${activeProfileId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: mins }),
      });
      setActivityFeedback(`Logged ${mins} drill minute(s) to your daily activity log! ⚡`);
      setTimeout(() => setActivityFeedback(null), 3500);
    } catch (_) {}
  };

  const completedDrillsCount = currentDrills.filter((d) => d.completed).length;

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />

      {/* HEADER BAR */}
      <SportsNavigationHeader activeRole="athlete" />

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 relative z-10">
        
        {/* MODULE 6: PROMINENT GLASSMORPHIC SUB-NAVIGATION BAR */}
        <div className="backdrop-blur-md bg-white/70 border border-slate-200/80 rounded-2xl p-1.5 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
          {SUB_TABS.map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SportsSubTab)}
                className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap z-10 ${
                  isActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSportsSubTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80 -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB VIEWS CONTAINER WITH SMOOTH PAGE TRANSITIONS */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'training' && (
            <motion.div
              key="tab-training"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* HERO TITLE BANNER */}
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                      DEDICATED ATHLETICS WORKSPACE
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      SKILL-TRACK Maidan Engine
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Athletic Performance & Daily Drill Engine
                  </h1>
                  <p className="text-xs text-slate-500 max-w-xl">
                    Run sport-calibrated training drills with embedded countdown stopwatches, manage multi-day practice calendars, and unlock milestone evaluation gates.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 17 }}
                  onClick={() => setShowEnrollModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll New Sport Track</span>
                </motion.button>
              </div>

              {/* ACTIVE SPORT TRACK: MULTI-DAY CALENDAR & NUTRITION ENGINE */}
              {activeWorkspace && activeStep && (
                <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                          ATHLETIC PRACTICE CALENDAR & DUAL-GATE PROGRESSION
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {activeWorkspace.title} • Milestone {activeStepIndex + 1} of {activeWorkspace.steps?.length || 5}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {activeStep.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(activeWorkspace.steps || []).map((s: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveStepIndex(idx)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                            activeStepIndex === idx
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : s.status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SportsStepTracker
                    skillId={activeStep.id || activeWorkspace.id}
                    stepNumber={activeStepIndex + 1}
                    stepTitle={activeStep.title}
                    skillCategory="physical"
                    requiredPracticeDays={activeStep.requiredPracticeDays || 3}
                    practiceDaysCompleted={activeStep.practiceDaysCompleted || 0}
                    quizPassed={activeStep.quizPassed || activeStep.status === 'PASSED'}
                    quizScore={activeStep.quizScore || (activeStep.status === 'PASSED' ? 85 : null)}
                    dailyDietPlan={activeStep.dailyDietPlan}
                    onPracticeDayComplete={handlePracticeDayComplete}
                    onAdvanceStep={handleAdvanceStep}
                    onOpenQuiz={() => setShowQuizModal(true)}
                  />
                </div>
              )}

              {/* MODULE 4: SPORT-SPECIFIC DRILL GENERATOR WITH IN-CARD COUNTDOWN TIMERS */}
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                        DYNAMIC DRILL ENGINE
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Calibrated Mechanics with Embedded Timers
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Targeted Sport Workout & Drill Regimens
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {completedDrillsCount} of {currentDrills.length} Drills Completed
                    </span>
                  </div>
                </div>

                {/* Sport & Sub-Genre Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sport Pill Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Select Sport</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVAILABLE_SPORTS.map((sport) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          key={sport.name}
                          onClick={() => handleSportChange(sport.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedSport === sport.name
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {sport.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-Genre Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Select Specialization / Sub-Genre</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(AVAILABLE_SPORTS.find((s) => s.name === selectedSport)?.subGenres || []).map((sub) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          key={sub}
                          onClick={() => handleSubGenreChange(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedSubGenre === sub
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
                          }`}
                        >
                          🎯 {sub}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading Indicator */}
                {loadingDrills && (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Synthesizing sport drills calibrated for {selectedSport} ({selectedSubGenre})...</span>
                  </div>
                )}

                {/* Drill Cards Grid: In-Card Stopwatch embedded directly in each card */}
                {!loadingDrills && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {currentDrills.map((drill) => (
                      <DrillCard
                        key={drill.id}
                        drill={drill}
                        stepNumber={activeStepIndex + 1}
                        onComplete={handleDrillCompleted}
                        onPracticeLogged={handleDrillPracticeLogged}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* OPEN PRACTICE CHRONOMETER & LAP LOGGER */}
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                        OPEN PRACTICE CHRONOMETER
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Precision Split Tracker & Session Logger
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Continuous Practice Stopwatch & Laps
                    </h2>
                  </div>

                  {activityFeedback && (
                    <div className="p-2.5 px-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{activityFeedback}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-6">
                    <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                      Open Session Chronometer
                    </span>

                    <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white drop-shadow-md">
                      {formatTime(elapsedMs)}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {!timerRunning ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={handleStartTimer}
                          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>Start Chronometer</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={handlePauseTimer}
                          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <Pause className="w-4 h-4 fill-slate-950" />
                          <span>Pause</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleLap}
                        disabled={elapsedMs === 0}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Lap</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleResetTimer}
                        disabled={elapsedMs === 0 && !timerRunning}
                        className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Reset Stopwatch"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </motion.button>
                    </div>

                    <button
                      onClick={handleLogActivity}
                      disabled={loggingActivity || elapsedMs < 5000}
                      className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      {loggingActivity ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Log Open Session to Activity</span>
                    </button>
                  </div>

                  {/* Recorded Laps Box */}
                  <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 space-y-3 h-[300px] flex flex-col">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recorded Laps / Splits</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {laps.length} Laps
                      </span>
                    </div>

                    {laps.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Clock className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400">
                          Click "Lap" during training to record split milestones.
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {laps.map((lap) => (
                          <div
                            key={lap.lapNumber}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-700">
                              Lap {lap.lapNumber}
                            </span>
                            <span className="font-mono text-emerald-700 font-bold">
                              +{formatTime(lap.lapTime)}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              {formatTime(lap.overallTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ENROLLED SPORTS TRAJECTORIES */}
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                        ENROLLED ATHLETIC ROADMAPS
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Full Trajectory with Milestone Gates
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Your Active Sports Tracks
                    </h2>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowEnrollModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enroll Sport</span>
                  </motion.button>
                </div>

                {sportsTracks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-sm font-semibold text-slate-600">No sports tracks enrolled yet.</p>
                    <p className="text-xs text-slate-400">
                      Enroll in a tailored sport trajectory (e.g. Cricket Fast Bowling, Football Dribbling, or Badminton Smash Mechanics).
                    </p>
                    <button
                      onClick={() => setShowEnrollModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Enroll New Sport Track
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sportsTracks.map((track: any) => (
                      <div
                        key={track.id}
                        className="p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-white hover:shadow-md transition-all space-y-4 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              Athletics
                            </span>
                            <h4 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                              {track.title}
                            </h4>
                            {track.subTitle && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {track.subTitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Node</p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              Milestone {track.passedStepsCount + 1} of {track.stepsCount || 5}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</p>
                            <p className="font-black text-emerald-600 mt-0.5">
                              {track.progress}%
                            </p>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${track.progress}%` }}
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedSportId(track.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <span>Launch Sports Studio ➔</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: CLUBS NEAR ME */}
          {activeSubTab === 'clubs' && (
            <motion.div
              key="tab-clubs"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ClubsExploreView />
            </motion.div>
          )}

          {/* TAB 3: SPORTS SHOP */}
          {activeSubTab === 'shop' && (
            <motion.div
              key="tab-shop"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <SportsShopView />
            </motion.div>
          )}

          {/* TAB 4: MANAGED TRAVEL */}
          {activeSubTab === 'travel' && (
            <motion.div
              key="tab-travel"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ManagedTravelView />
            </motion.div>
          )}

          {/* TAB 5: SCOUTING & ROSTERS */}
          {activeSubTab === 'scouting' && (
            <motion.div
              key="tab-scouting"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              <SportsInboxView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SOCRATIC QUIZ MODAL: STRICTLY RESERVED FOR MILESTONE GATES */}
      <SocraticQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        questions={activeQuizQuestions}
        stepId={activeStep?.id}
        stepTitle={activeStep?.title}
        stepNumber={activeStepIndex + 1}
        onPassed={handleQuizPassed}
      />

      {/* ENROLL MODAL (RESTRICTED TO ATHLETICS) */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        restrictToDomain="Athletics"
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
          if (newTrack?.id) {
            setSelectedSportId(newTrack.id);
            loadSportsData(activeProfileId || 'default-profile');
          }
        }}
      />
    </div>
  );
}
