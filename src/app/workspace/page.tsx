'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Plus, Sparkles, BookOpen, Clock, 
  CheckCircle2, AlertCircle, User, Activity, Layers,
  Play, Pause, RotateCcw, Dumbbell, Droplet, Utensils,
  Zap, Heart, ShieldCheck, Flame, Compass, ChevronRight, Check
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

function isProfileComplete(profile: any): boolean {
  if (!profile) return false;
  const hasName = Boolean(profile.name && String(profile.name).trim().length > 0);
  const hasEmail = Boolean(profile.email && String(profile.email).trim().length > 0);
  const hasGender = Boolean(profile.gender && String(profile.gender).trim().length > 0);
  const hasProfession = Boolean(profile.profession && String(profile.profession).trim().length > 0);
  return hasName && hasEmail && hasGender && hasProfession;
}

// 5-Axis Radar Pentagon Component for Match Affinity
function RadarPentagon({
  metrics = {
    cognitiveAgility: 88,
    spatialPrecision: 82,
    systemsAxiom: 94,
    physicalResilience: 80,
    analyticalDepth: 91,
  },
}: {
  metrics?: {
    cognitiveAgility: number;
    spatialPrecision: number;
    systemsAxiom: number;
    physicalResilience: number;
    analyticalDepth: number;
  };
}) {
  const size = 220;
  const center = size / 2;
  const radius = 72;
  const axes = [
    { label: 'Cognitive Agility', value: metrics.cognitiveAgility },
    { label: 'Spatial Precision', value: metrics.spatialPrecision },
    { label: 'Systems Axiom', value: metrics.systemsAxiom },
    { label: 'Physical Resilience', value: metrics.physicalResilience },
    { label: 'Analytical Depth', value: metrics.analyticalDepth },
  ];

  const getCoordinates = (value: number, index: number, maxRadius: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = (Math.max(10, Math.min(100, value)) / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.value, i, radius);
      return `${x},${y}`;
    })
    .join(' ');

  const gridLevels = [0.4, 0.7, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric pentagon background rings */}
        {gridLevels.map((level, lvlIdx) => {
          const points = axes
            .map((_, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const r = radius * level;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill={lvlIdx === gridLevels.length - 1 ? 'rgba(241, 245, 249, 0.5)' : 'none'}
              stroke="#CBD5E1"
              strokeWidth="1"
              strokeDasharray={lvlIdx < gridLevels.length - 1 ? '3,3' : 'none'}
            />
          );
        })}

        {/* Axis rays */}
        {axes.map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(2, 132, 199, 0.25)"
          stroke="#0284C7"
          strokeWidth="2.5"
        />

        {/* Vertex Dots */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.value, i, radius);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#0284C7"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[10px] font-mono font-bold text-slate-600">
        {axes.map((a, i) => (
          <span key={i} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {a.label.split(' ')[0]}: <span className="text-sky-700">{a.value}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WorkspaceHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollDomainFilter, setEnrollDomainFilter] = useState<string | undefined>(undefined);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  // Top-Level Translucent Tabs
  const [workspaceTab, setWorkspaceTab] = useState<'cognitive' | 'sports'>('cognitive');

  // Next Horizons Curated Recommendations Engine
  const [curatedRecommendations, setCuratedRecommendations] = useState<any[]>([]);
  const [radarMetrics, setRadarMetrics] = useState<any>({
    cognitiveAgility: 91,
    spatialPrecision: 84,
    systemsAxiom: 96,
    physicalResilience: 82,
    analyticalDepth: 89,
  });

  // Sports Hub Regimen State
  const [sportsProfile, setSportsProfile] = useState<any>({
    sportName: 'Football',
    subGenre: 'Dribbling & Ball Mastery',
    dietaryPreference: 'Vegetarian',
    medicalConditions: 'None',
    trainingGoal: 'Agility & Reflexes',
    dailyPracticeMinutes: 45,
  });
  const [sportsPlans, setSportsPlans] = useState<any[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [generatingRegimen, setGeneratingRegimen] = useState<boolean>(false);
  const [waterLoggedLiters, setWaterLoggedLiters] = useState<number>(1.25);

  // Interactive Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (stopwatchRunning) {
      timerRef.current = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id');
    if (!storedId) {
      router.push('/');
      return;
    }
    setActiveProfileId(storedId);
    loadWorkspaces(storedId);
    loadRecommendations();
    loadSportsProfile(storedId);
  }, []);

  async function loadWorkspaces(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (!res.ok) throw new Error('Failed to load profile telemetry');
      const data = await res.json();
      setProfile(data.profile);
      setWorkspaces(data.enrolledWorkspaces || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    try {
      const res = await fetch('/api/recommendations/curated');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.curatedTrajectories)) {
          setCuratedRecommendations(data.curatedTrajectories);
        }
        if (data.radarAffinity) {
          setRadarMetrics(data.radarAffinity);
        }
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  }

  async function loadSportsProfile(userId: string) {
    try {
      const res = await fetch(`/api/sports/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setSportsProfile({
            sportName: data.profile.sportName || 'Football',
            subGenre: data.profile.subGenre || 'Dribbling & Ball Mastery',
            dietaryPreference: data.profile.dietaryPreference || 'Vegetarian',
            medicalConditions: data.profile.medicalConditions || 'None',
            trainingGoal: data.profile.trainingGoal || 'Agility & Reflexes',
            dailyPracticeMinutes: data.profile.dailyPracticeMinutes || 45,
          });
        }
        if (Array.isArray(data.plans) && data.plans.length > 0) {
          setSportsPlans(data.plans);
        }
      }
    } catch (err) {
      console.error('Failed to load sports profile:', err);
    }
  }

  const handleSaveSportsProfileAndGenerate = async () => {
    if (!activeProfileId) return;
    try {
      setGeneratingRegimen(true);
      // 1. Save profile
      await fetch('/api/sports/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeProfileId,
          ...sportsProfile,
        }),
      });

      // 2. Generate 7-day regimen
      const res = await fetch('/api/sports/generate-regimen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeProfileId,
          ...sportsProfile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plans)) {
          setSportsPlans(data.plans);
          setSelectedDayNumber(1);
        }
      }
    } catch (err) {
      console.error('Regimen generation error:', err);
    } finally {
      setGeneratingRegimen(false);
    }
  };

  const handleTogglePlanCompletion = async (planId: string) => {
    try {
      const res = await fetch(`/api/sports/daily-plan/${planId}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setSportsPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, isCompleted: !p.isCompleted } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Hydrating Decoupled Workspace...
          </span>
        </div>
      </div>
    );
  }

  const profileComplete = isProfileComplete(profile);
  const cognitiveWorkspaces = workspaces.filter(
    (w: any) => w.domainCategory !== 'Athletics' && w.domain !== 'Athletics'
  );
  const athleticWorkspaces = workspaces.filter(
    (w: any) => w.domainCategory === 'Athletics' || w.domain === 'Athletics'
  );
  const activeDayPlan = sportsPlans.find((p) => p.dayNumber === selectedDayNumber) || sportsPlans[0];

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />

      {/* TOP HEADER */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-md border border-sky-200/60">
              STUDIO WORKSPACE
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Decoupled Learning & Sports Pedagogy Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Back to Profile Hub ➔</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6 relative z-10">
        
        {/* COMPLETION LOCK NOTICE */}
        {!profileComplete && (
          <div className="p-5 bg-amber-50/95 border border-amber-300 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">
                  Profile Demographics Incomplete
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Please complete your Full Name, Gmail ID, Gender, and Profession before starting active milestone evaluations.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Complete Profile Now</span>
            </button>
          </div>
        )}

        {/* TOP-LEVEL GLASSMORPHIC TAB NAVIGATION */}
        <div className="flex items-center justify-center">
          <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm inline-flex items-center gap-2 relative">
            <button
              onClick={() => setWorkspaceTab('cognitive')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all relative z-10 flex items-center gap-2 cursor-pointer ${
                workspaceTab === 'cognitive' ? 'text-sky-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {workspaceTab === 'cognitive' && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/70 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Cognitive Skills Studio</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded-full font-mono">
                {cognitiveWorkspaces.length}
              </span>
            </button>

            <button
              onClick={() => setWorkspaceTab('sports')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all relative z-10 flex items-center gap-2 cursor-pointer ${
                workspaceTab === 'sports' ? 'text-emerald-950 font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {workspaceTab === 'sports' && (
                <motion.div
                  layoutId="activeWorkspaceTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/70 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Athletic & Sports Hub</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-mono">
                {sportsPlans.length > 0 ? '7 Days' : 'Ready'}
              </span>
            </button>
          </div>
        </div>

        {/* TAB VIEWS WITH MOTION PRESENCE */}
        <AnimatePresence mode="wait">
          {workspaceTab === 'cognitive' ? (
            <motion.div
              key="tab-cognitive-studio"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* COGNITIVE HERO CARD */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 shadow-xl shadow-slate-200/30 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                    INTELLECTUAL CAPSTONE
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 mt-1">
                    Cognitive Skills Studio
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Programming, Design, Languages, Music, Business — powered by Groq LLaMA 3.3.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEnrollDomainFilter(undefined);
                    setShowEnrollModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll Cognitive Trajectory</span>
                </button>
              </div>

              {/* COGNITIVE TRAJECTORIES GRID */}
              {cognitiveWorkspaces.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl p-12 text-center shadow-lg space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No cognitive trajectories enrolled yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Synthesize an autonomous curriculum in programming, sciences, or design.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enroll Your First Skill</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {cognitiveWorkspaces.map((ws: any) => (
                    <div
                      key={ws.id}
                      className="backdrop-blur-xl bg-white/80 border border-white/60 hover:border-sky-400 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all space-y-5 flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/50">
                            {ws.domainCategory || ws.domain || 'Cognitive Track'}
                          </span>
                          <span className="text-xs font-black text-emerald-600">
                            {ws.progress}% Complete
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {ws.title}
                        </h3>

                        {ws.subTitle && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {ws.subTitle}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            Milestone {ws.passedStepsCount + 1} of {ws.stepsCount || 5}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            {ws.passedStepsCount} Passed ✓
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${ws.progress}%` }}
                          />
                        </div>

                        <Link
                          href={`/workspace/${ws.id}`}
                          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all group-hover:bg-sky-600"
                        >
                          <span>Launch Milestone Studio ➔</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RESTORED "NEXT HORIZONS" SKILL RECOMMENDATION ENGINE */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 shadow-xl shadow-slate-200/30 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md">
                        NEURAL COMPASS
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Match Affinity Engine
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-black text-slate-900 mt-1">
                      Next Horizons Recommendations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluates current user skills, profession, and milestone pass velocity against multi-domain cognitive metrics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  {/* Match Affinity Radar Pentagon */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Learner Match Affinity Radar (0-100% Fit)
                    </span>
                    <RadarPentagon metrics={radarMetrics} />
                  </div>

                  {/* Curated Next Skill Pills */}
                  <div className="lg:col-span-2 space-y-3">
                    {curatedRecommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="p-4 bg-white/80 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-sky-400 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                              {rec.domain}
                            </span>
                            <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              ★ {rec.affinityScore}% Match
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                          <p className="text-[11px] text-slate-500">{rec.rationale}</p>
                        </div>

                        <button
                          onClick={() => {
                            setShowEnrollModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0 shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Launch Trajectory</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tab-sports-hub"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* ATHLETIC HERO CARD */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 shadow-xl shadow-slate-200/30 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                    KINETIC ARCHITECTURE
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 mt-1">
                    Athletic & Sports Hub
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailored drills, medical-injury gating, interactive stopwatch, and daily dietary fueling.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-md flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-base font-black text-emerald-400">
                      {formatTimer(stopwatchSeconds)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setStopwatchRunning((r) => !r)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                        title={stopwatchRunning ? 'Pause' : 'Start'}
                      >
                        {stopwatchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setStopwatchRunning(false);
                          setStopwatchSeconds(0);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 5.1: PHYSICAL ASSESSMENT SHEET & MEDICAL CONSTRAINTS */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 shadow-xl shadow-slate-200/30 rounded-3xl p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                      <span>Physical Assessment & Dietary Constraints</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mandatory configuration to calibrate practice drill intensity and nutritional macronutrients.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveSportsProfileAndGenerate}
                    disabled={generatingRegimen}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{generatingRegimen ? 'Synthesizing AI Regimen...' : '⚡ Generate 7-Day Regimen'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sport & Subgenre */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sport Discipline
                    </label>
                    <select
                      value={sportsProfile.sportName}
                      onChange={(e) => setSportsProfile({ ...sportsProfile, sportName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="Football">Football</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Martial Arts">Martial Arts / MMA</option>
                      <option value="Sprinting">Athletics / Sprinting</option>
                    </select>
                  </div>

                  {/* Sub-Genre */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sub-Genre / Focus Area
                    </label>
                    <input
                      type="text"
                      value={sportsProfile.subGenre}
                      onChange={(e) => setSportsProfile({ ...sportsProfile, subGenre: e.target.value })}
                      placeholder="e.g. Dribbling, Fast Bowling"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* Training Goal */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Training Goal
                    </label>
                    <select
                      value={sportsProfile.trainingGoal}
                      onChange={(e) => setSportsProfile({ ...sportsProfile, trainingGoal: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value="Endurance">Endurance & St不由</option>
                      <option value="Agility & Reflexes">Agility & Reflexes</option>
                      <option value="Explosive Power">Explosive Power</option>
                      <option value="Recovery & Conditioning">Recovery & Conditioning</option>
                    </select>
                  </div>

                  {/* Daily Practice Minutes */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Daily Practice Minutes
                    </label>
                    <select
                      value={sportsProfile.dailyPracticeMinutes}
                      onChange={(e) => setSportsProfile({ ...sportsProfile, dailyPracticeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes (Standard)</option>
                      <option value={60}>60 Minutes (Intensive)</option>
                      <option value={90}>90 Minutes (Pro)</option>
                    </select>
                  </div>
                </div>

                {/* Dietary Preference (Mandatory Pills) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dietary Preference (Mandatory Fueling Gate)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'].map((diet) => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => setSportsProfile({ ...sportsProfile, dietaryPreference: diet })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          sportsProfile.dietaryPreference === diet
                            ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medical & Physical Conditions (Suggestion Chips + Custom Input) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Medical & Physical Conditions (Injury Adaptation Gating)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'None / Fully Fit',
                      'Asthma / Respiratory Strain',
                      'Knee / ACL Sensitivity',
                      'Lower Back Strain',
                      'High Blood Pressure',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSportsProfile({ ...sportsProfile, medicalConditions: chip })}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          sportsProfile.medicalConditions === chip
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={sportsProfile.medicalConditions}
                    onChange={(e) => setSportsProfile({ ...sportsProfile, medicalConditions: e.target.value })}
                    placeholder="Specify any injuries, physical limitations, or medical advisories"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* MODULE 5.2: 7-DAY AI WORKOUT DRILLS */}
              {sportsPlans.length > 0 && (
                <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 shadow-xl shadow-slate-200/30 rounded-3xl p-6 md:p-8 space-y-6">
                  {/* Day Selector Pills */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        7-Day Dynamic Training Curriculum
                      </h3>
                      <p className="text-xs text-slate-500">
                        Adapted for: <span className="font-bold text-slate-700">{sportsProfile.medicalConditions}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {sportsPlans.map((plan) => (
                        <button
                          key={plan.dayNumber}
                          onClick={() => setSelectedDayNumber(plan.dayNumber)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            selectedDayNumber === plan.dayNumber
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>Day {plan.dayNumber}</span>
                          {plan.isCompleted && <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Day Drills & Daily Nutrition */}
                  {activeDayPlan && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Practice Drills */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-emerald-600" />
                            <span>Day {activeDayPlan.dayNumber} Practice Drills</span>
                          </h4>
                          <button
                            onClick={() => handleTogglePlanCompletion(activeDayPlan.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              activeDayPlan.isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-900 text-white'
                            }`}
                          >
                            {activeDayPlan.isCompleted ? '✓ Completed' : 'Mark Day Complete'}
                          </button>
                        </div>

                        <div className="space-y-3">
                          {Array.isArray(activeDayPlan.drills) &&
                            activeDayPlan.drills.map((drill: any, dIdx: number) => (
                              <div
                                key={dIdx}
                                className="p-4 bg-white/90 rounded-2xl border border-slate-200/90 shadow-sm space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center font-bold">
                                      {dIdx + 1}
                                    </span>
                                    {drill.title}
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    {drill.durationMinutes}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">{drill.cues}</p>
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                                    Intensity: {drill.intensity || 'Medium'}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Right: MODULE 5.3: DEDICATED DAILY ATHLETIC FUELING & NUTRITION */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-amber-500" />
                            <span>Daily Athletic Nutrition & Fueling</span>
                          </h4>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                            {sportsProfile.dietaryPreference}
                          </span>
                        </div>

                        {activeDayPlan.nutritionPlan && (
                          <div className="space-y-3">
                            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                                🍳 Breakfast / Morning Ignition
                              </span>
                              <p className="text-xs text-slate-700">{activeDayPlan.nutritionPlan.breakfast}</p>
                            </div>

                            <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900">
                                ⚡ Pre-Workout Fuel (30–45 Mins Before)
                              </span>
                              <p className="text-xs text-slate-700">{activeDayPlan.nutritionPlan.preWorkout}</p>
                            </div>

                            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                                🥗 Post-Workout Muscle Recovery
                              </span>
                              <p className="text-xs text-slate-700">{activeDayPlan.nutritionPlan.postWorkout}</p>
                            </div>

                            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                                🌙 Dinner / Overnight Restoration
                              </span>
                              <p className="text-xs text-slate-700">{activeDayPlan.nutritionPlan.dinner}</p>
                            </div>

                            {/* Hydration Tracker */}
                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                  <Droplet className="w-5 h-5 fill-sky-500" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Hydration Target ({activeDayPlan.nutritionPlan.hydrationLiters || '3.2L'})
                                  </span>
                                  <div className="font-mono text-sm font-bold text-slate-900">
                                    {waterLoggedLiters.toFixed(2)} L Logged
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => setWaterLoggedLiters((w) => Math.min(5.0, Number((w + 0.25).toFixed(2))))}
                                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                +250ml
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ENROLL MODAL */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
          if (newTrack?.id) {
            router.push(`/workspace/${newTrack.id}`);
          }
        }}
      />

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userProfile={{
          ...profile,
          age: profile?.age || 18,
        }}
        onUpdateProfile={async (updated) => {
          if (!activeProfileId) return;
          try {
            await fetch(`/api/profiles/${activeProfileId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            });
            await loadWorkspaces(activeProfileId);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
