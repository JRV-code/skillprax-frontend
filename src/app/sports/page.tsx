'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Activity, Play, Pause, RotateCcw, Flag, Clock, 
  CheckCircle2, Plus, ArrowRight, Zap, Target, 
  Award, Sparkles, RefreshCw, Layers, Dumbbell, 
  Check, Flame, Shield, BookOpen 
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { SportsStepTracker } from '@/components/workspace/SportsStepTracker';
import { SocraticQuizModal } from '@/components/SocraticQuizModal';
import { SportDrill, SportWorkoutPlan } from '@/types';

const PRESET_WORKOUT_PLANS: Record<string, Record<string, SportDrill[]>> = {
  Football: {
    Dribbling: [
      {
        id: 'fb-drib-1',
        title: 'Cone Weave & Agility Shuttle',
        durationMinutes: 15,
        focusPoints: [
          'Maintain low center of gravity and shoulder dip',
          'Use rapid inside/outside touches with both feet',
          'Keep eyes forward to develop field awareness',
        ],
        completed: false,
      },
      {
        id: 'fb-drib-2',
        title: 'Tight Space Ball Mastery',
        durationMinutes: 10,
        focusPoints: [
          'Execute continuous sole rolls and Brazilian toe taps',
          'Perform sharp V-cuts and Cruyff turns in a 3x3 meter grid',
          'Minimize excess ground contact time per touch',
        ],
        completed: false,
      },
      {
        id: 'fb-drib-3',
        title: 'Burst Acceleration & Turn Sprints',
        durationMinutes: 15,
        focusPoints: [
          'Commit to full deceleration before the cone boundary',
          'Push ball 2 meters into open space and sprint through',
          'Recover with active breathing during reset jog',
        ],
        completed: false,
      },
    ],
    Finishing: [
      {
        id: 'fb-fin-1',
        title: 'First-Touch Angle Setting & Strike',
        durationMinutes: 12,
        focusPoints: [
          'Cushion pass across body into diagonal strike corridor',
          'Lock standing foot firmly pointing toward target post',
          'Drive laces through the center-mass of the ball',
        ],
        completed: false,
      },
      {
        id: 'fb-fin-2',
        title: 'Near-Post Dynamic Runs & Volleys',
        durationMinutes: 15,
        focusPoints: [
          'Time run behind defender shoulder blind-spot',
          'Keep chest over the ball to prevent ballooning',
        ],
        completed: false,
      },
      {
        id: 'fb-fin-3',
        title: '1v1 Goalkeeper Chip & Slot Mastery',
        durationMinutes: 10,
        focusPoints: [
          'Look for goalkeeper weight shift before committing',
          'Disguise side-foot pass into corner',
        ],
        completed: false,
      },
    ],
  },
  Cricket: {
    Wicketkeeping: [
      {
        id: 'cr-wk-1',
        title: 'Lateral Footwork Shuffle',
        durationMinutes: 12,
        focusPoints: [
          'Distribute body weight evenly on the balls of your feet',
          'Slide sideways without crossing feet or bobbing head',
          'Maintain steady eye-level alignment with stump bails',
        ],
        completed: false,
      },
      {
        id: 'cr-wk-2',
        title: 'Reaction Ball Catches',
        durationMinutes: 15,
        focusPoints: [
          'Catch with soft, giving hands into the chest basket',
          'Watch the ball seam into the webbing of the gloves',
          'Quick recovery stance for stumping off-balance',
        ],
        completed: false,
      },
      {
        id: 'cr-wk-3',
        title: 'Low-Stance Glove Stabilization',
        durationMinutes: 10,
        focusPoints: [
          'Isometric squat hold at knee-joint parallel',
          'Keep wrists loose and fingers pointed downward toward turf',
          'Rise strictly with the bounce of the ball, never early',
        ],
        completed: false,
      },
    ],
    'Fast Bowling': [
      {
        id: 'cr-fb-1',
        title: 'Run-up Rhythm & Bound Stabilization',
        durationMinutes: 15,
        focusPoints: [
          'Cadence acceleration over 16-step approach',
          'Solid back-foot impact with upright chest',
          'Brace front-leg knee angle to transfer kinetic energy',
        ],
        completed: false,
      },
      {
        id: 'cr-fb-2',
        title: 'Seam Release Alignment Target Drill',
        durationMinutes: 15,
        focusPoints: [
          'Lock wrist behind ball with upright seam presentation',
          'Pull non-bowling arm down hard through the hip pocket',
        ],
        completed: false,
      },
      {
        id: 'cr-fb-3',
        title: 'Yorker & Bouncer Decoupled Repeat',
        durationMinutes: 10,
        focusPoints: [
          'Hit the shoe-box target at the popping crease',
          'Snap wrist sharply at the top of release arc',
        ],
        completed: false,
      },
    ],
  },
  Basketball: {
    Shooting: [
      {
        id: 'bb-sh-1',
        title: 'Form Shooting From 3 Feet',
        durationMinutes: 10,
        focusPoints: [
          'One-handed release with elbow tucked under ball',
          'Hold follow-through goose-neck until swish',
          'Sink 10 consecutive shots before stepping back',
        ],
        completed: false,
      },
      {
        id: 'bb-sh-2',
        title: 'Off-the-Dribble Pull-Up Midrange',
        durationMinutes: 15,
        focusPoints: [
          'Hard one-two foot gather on last dribble pound',
          'Rise straight up without forward drift',
        ],
        completed: false,
      },
      {
        id: 'bb-sh-3',
        title: 'Corner 3 Catch-and-Shoot Relocation',
        durationMinutes: 15,
        focusPoints: [
          'Sprint to corner, dip hips, load spring base',
          'Quick trigger release under 0.8 seconds',
        ],
        completed: false,
      },
    ],
  },
  Sprint: {
    Acceleration: [
      {
        id: 'sp-acc-1',
        title: 'Wall Push & 45-Degree Angle March',
        durationMinutes: 10,
        focusPoints: [
          'Establish straight line from ear through hip to heel',
          'Drive knee to 90 degrees with dorsiflexed ankle',
          'Violent piston strike back under hips',
        ],
        completed: false,
      },
      {
        id: 'sp-acc-2',
        title: 'Falling Start 15m Block Bursts',
        durationMinutes: 15,
        focusPoints: [
          'Lean forward until gravity forces first reflex step',
          'Keep eyes low on track during drive phase 0-10m',
          'Full arm stroke amplitude cheek to hip pocket',
        ],
        completed: false,
      },
      {
        id: 'sp-acc-3',
        title: 'Resisted Band Sprints & Wicket Runs',
        durationMinutes: 15,
        focusPoints: [
          'Overcome band tension with aggressive hip extension',
          'Smooth transition into upright maximum velocity mechanics',
        ],
        completed: false,
      },
    ],
  },
};

export default function SportsHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySportId = searchParams.get('id');

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
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('Dribbling');
  const [customSubGenre, setCustomSubGenre] = useState<string>('');
  const [currentDrills, setCurrentDrills] = useState<SportDrill[]>(
    PRESET_WORKOUT_PLANS['Football']['Dribbling']
  );

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

  async function loadSportsData(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        const allTracks = data.enrolledWorkspaces || [];
        const sportsOnly = allTracks.filter(
          (w: any) => w.domainCategory === 'Athletics' || w.domain === 'Athletics' ||
            ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'basketball'].some(s => (w.title || '').toLowerCase().includes(s))
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

  // Format Milliseconds to MM:SS:cs
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  // Drill Regimen Updates
  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    const availableSub = Object.keys(PRESET_WORKOUT_PLANS[sport] || {});
    const defaultSub = availableSub[0] || 'General Conditioning';
    setSelectedSubGenre(defaultSub);

    if (PRESET_WORKOUT_PLANS[sport] && PRESET_WORKOUT_PLANS[sport][defaultSub]) {
      setCurrentDrills(PRESET_WORKOUT_PLANS[sport][defaultSub]);
    } else {
      generateDefaultDrills(sport, defaultSub);
    }
  };

  const handleSubGenreChange = (sub: string) => {
    setSelectedSubGenre(sub);
    if (PRESET_WORKOUT_PLANS[selectedSport] && PRESET_WORKOUT_PLANS[selectedSport][sub]) {
      setCurrentDrills(PRESET_WORKOUT_PLANS[selectedSport][sub]);
    } else {
      generateDefaultDrills(selectedSport, sub);
    }
  };

  const generateDefaultDrills = (sport: string, sub: string) => {
    setCurrentDrills([
      {
        id: `drill-${Date.now()}-1`,
        title: `${sub} Foundation Drill`,
        durationMinutes: 15,
        focusPoints: [
          `Focus on dynamic posture and neuromuscular alignment in ${sport}`,
          `Execute repeatable sequence with controlled tempo`,
          `Record fatigue point and recovery duration`,
        ],
        completed: false,
      },
      {
        id: `drill-${Date.now()}-2`,
        title: `${sub} Speed & Intensity Phase`,
        durationMinutes: 15,
        focusPoints: [
          `Increase velocity to match match-pace intensity`,
          `Sharpen decision-making and rapid change-of-direction`,
        ],
        completed: false,
      },
      {
        id: `drill-${Date.now()}-3`,
        title: `${sub} Pressure Test & Cooldown`,
        durationMinutes: 10,
        focusPoints: [
          `Perform 5 high-pressure repetitions under accumulated fatigue`,
          `Active dynamic stretching and tissue decompression`,
        ],
        completed: false,
      },
    ]);
  };

  const toggleDrillCompletion = (drillId: string) => {
    setCurrentDrills((prev) =>
      prev.map((d) => (d.id === drillId ? { ...d, completed: !d.completed } : d))
    );
  };

  const completedDrillsCount = currentDrills.filter((d) => d.completed).length;

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />

      {/* HEADER BAR */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60">
              SPORTS HUB
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Athletics, Kinetics & Daily Drills Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/skills"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Cognitive Skills</span>
          </Link>
          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Back to Profile Hub ➔</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 relative z-10">
        
        {/* HERO TITLE BANNER */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                DEDICATED ATHLETICS WORKSPACE
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Module 9 Enterprise Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Athletic Performance & Daily Drill Engine
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Track conditioning sessions with the live stopwatch, generate sport-specific drill regimens, and manage athletic milestones in isolation from academic skills.
            </p>
          </div>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Sport Track</span>
          </button>
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

        {/* SECTION 1: INTERACTIVE PRACTICE STOPWATCH & TIMER */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  PRACTICE STOPWATCH
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Precision Chronometer & Split Tracker
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Interactive Practice Timer & Lap Logger
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
            {/* Big Timer Display */}
            <div className="lg:col-span-7 bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-6">
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                Active Session Elapsed
              </span>

              <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white drop-shadow-md">
                {formatTime(elapsedMs)}
              </div>

              {/* Timer Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {!timerRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Practice</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-slate-950" />
                    <span>Pause Timer</span>
                  </button>
                )}

                <button
                  onClick={handleLap}
                  disabled={elapsedMs === 0}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                  <span>Lap</span>
                </button>

                <button
                  onClick={handleResetTimer}
                  disabled={elapsedMs === 0 && !timerRunning}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Log Practice Minutes */}
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
                <span>Log Session to Daily Activity</span>
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

        {/* SECTION 2: DAILY SPORT-SPECIFIC WORKOUT & DRILL GENERATOR */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  DRILL ENGINE
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Targeted Regimens with Exact Durations
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Sport-Specific Workout & Drill Regimens
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
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
                {['Football', 'Cricket', 'Basketball', 'Sprint'].map((sport) => (
                  <button
                    key={sport}
                    onClick={() => handleSportChange(sport)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSport === sport
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Genre Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Specialization / Sub-Genre</label>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.keys(PRESET_WORKOUT_PLANS[selectedSport] || {}).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSubGenreChange(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSubGenre === sub
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
                    }`}
                  >
                    🎯 {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drill Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {currentDrills.map((drill, index) => (
              <div
                key={drill.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  drill.completed
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Drill {index + 1}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {drill.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {drill.title}
                  </h3>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Technical Focus Points
                    </p>
                    <ul className="space-y-1">
                      {drill.focusPoints.map((point, pIdx) => (
                        <li
                          key={pIdx}
                          className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed"
                        >
                          <span className="text-emerald-500 font-bold mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mark Drill Completed Toggle */}
                <button
                  onClick={() => toggleDrillCompletion(drill.id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    drill.completed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{drill.completed ? 'Drill Completed ✓' : 'Mark Drill Completed'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ENROLLED SPORTS TRAJECTORIES */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  ENROLLED ATHLETIC ROADMAPS
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Full Learning Engine with Socratic Gates
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Your Active Sports Tracks
              </h2>
              <p className="text-xs text-slate-500">
                Each sport inherits the full roadmap studio: milestone node progression, in-app video breakdowns, and quiz gates.
              </p>
            </div>

            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Sport</span>
            </button>
          </div>

          {sportsTracks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-sm font-semibold text-slate-600">No sports tracks enrolled yet.</p>
              <p className="text-xs text-slate-400">
                Enroll in a tailored sport trajectory (e.g. Cricket Fast Bowling, Football Dribbling, or Sprint Biomechanics).
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

                  <button
                    onClick={() => {
                      setSelectedSportId(track.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:bg-emerald-600 cursor-pointer"
                  >
                    <span>Launch Sports Studio ➔</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* SOCRATIC QUIZ MODAL */}
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
