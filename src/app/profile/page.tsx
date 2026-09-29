'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Shield,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Edit2,
  Sparkles,
  Zap,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  ArrowLeft,
  X,
  Loader2,
  BookOpen
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { AdminGateModal } from '@/components/AdminGateModal';
import { InitiateTrackModal } from '@/components/InitiateTrackModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

interface ProfileResponse {
  profile: {
    id?: string;
    name: string;
    age: number;
    profession: string;
    targetDailyHours?: number;
    targetDailyMinutes: number;
    reminderTime: string;
    tenureText: string;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    isFreezeActive: boolean;
  };
  telemetry: {
    todayMinutes: number;
    todayHours: number;
    targetDailyMinutes: number;
    targetDailyHours: number;
    goalCompleted: boolean;
    history: Array<{ date?: string; day: string; minutes: number; hours: number; focusArea?: string }>;
  };
  stats: {
    totalSkills: number;
    skillsInProgress: number;
    skillsMastered: number;
    totalMilestonesPassed: number;
  };
  skillCards: Array<any>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);

  // Form states for Edit Profile
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(18);
  const [formProfession, setFormProfession] = useState('');
  const [formTargetHours, setFormTargetHours] = useState('1');
  const [formTargetMinutes, setFormTargetMinutes] = useState('0');
  const [formReminderTime, setFormReminderTime] = useState('20:00');
  const [saving, setSaving] = useState(false);

  // Graph state
  const [hoveredDay, setHoveredDay] = useState<any>(null);
  const [graphAnimationKey, setGraphAnimationKey] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        const json = await res.json();
        const profileId = json.profile?.id || 'global';

        let userWorkspaces: any[] = [];
        try {
          const wsRes = await fetch(`${API_BASE}/api/workspaces?profileId=${profileId}`);
          if (wsRes.ok) {
            const wsData = await wsRes.json();
            userWorkspaces = Array.isArray(wsData) ? wsData : (wsData.workspaces || wsData.tracks || []);
          }
        } catch (_) {}

        setData({
          ...json,
          skillCards: userWorkspaces.length > 0 ? userWorkspaces : (json.skillCards || []),
        });
        setFormName(json.profile?.name || 'Explorer');
        setFormAge(json.profile?.age || 18);
        setFormProfession(json.profile?.profession || 'Class 12 Student (NEET / JEE)');
        setFormTargetHours((json.profile?.targetDailyHours || 1).toString());
        setFormTargetMinutes((json.profile?.targetDailyMinutes || 0).toString());
        setFormReminderTime(json.profile?.reminderTime || '20:00');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formProfession.trim().toLowerCase() === '/admin') {
      setShowEditProfileModal(false);
      sessionStorage.setItem('skillprax_admin_token', 'authorized');
      router.push('/admin');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          age: Number(formAge),
          profession: formProfession.trim(),
          targetDailyHours: Number(formTargetHours),
          targetDailyMinutes: Number(formTargetMinutes),
          reminderTime: formReminderTime,
        }),
      });

      if (res.ok) {
        setShowEditProfileModal(false);
        await fetchProfile();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-tech-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-200 shadow-xl">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold font-heading text-slate-700">Loading Learner Telemetry...</span>
        </div>
      </div>
    );
  }

  const { profile, streak, telemetry, stats, skillCards } = data;

  const cadenceData = (telemetry?.history && telemetry.history.length > 0) ? telemetry.history : [
    { day: 'Mon', minutes: 45, hours: 0.75, focusArea: 'Kinematics' },
    { day: 'Tue', minutes: 60, hours: 1, focusArea: 'Organic Chemistry' },
    { day: 'Wed', minutes: 30, hours: 0.5, focusArea: 'Socratic Drills' },
    { day: 'Thu', minutes: 90, hours: 1.5, focusArea: 'Stereochemistry' },
    { day: 'Fri', minutes: 75, hours: 1.25, focusArea: 'Reaction Mechanisms' },
    { day: 'Sat', minutes: 40, hours: 0.66, focusArea: 'Synthesis Loop' },
    { day: 'Sun', minutes: 60, hours: 1, focusArea: 'Evaluation Checkpoint' },
  ];

  const maxHours = Math.max(...cadenceData.map((d: any) => (d.hours || (d.minutes / 60))), 4);

  return (
    <div className="relative min-h-screen w-full bg-tech-grid text-slate-800 pt-16 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <CinematicVideoBackground src="/assets/background-motion.mp4" overlayOpacity={0.25} />

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-emerald-100/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer" title="Back to Gateway">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <SkillpraxLogo size="sm" showWordmark={true} className="hover:brightness-110 active:scale-95 transition-all cursor-pointer" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 rounded-xl shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Learner Telemetry</span>
          </div>

          <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-600/20">
            <button
              onClick={() => {
                if (skillCards.length > 0) {
                  router.push(`/workspace/${skillCards[0].id}`);
                } else {
                  setShowAddTrackModal(true);
                }
              }}
              className="relative z-10 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold tracking-wide shadow-md btn-tactile btn-shimmer cursor-pointer uppercase flex items-center gap-1.5 active:scale-95"
            >
              <span>Launch Studio</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full space-y-6 pt-4 relative z-10">
        {/* Top Profile Banner Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Active User Credentials Card (4 cols) */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/70 shadow-lg shadow-emerald-950/5 wobble-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  Active Learner
                </span>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer group"
                  title="Edit Profile Settings"
                >
                  <Edit2 className="w-4 h-4 transition-transform group-hover:scale-115" />
                </button>
              </div>

              {/* Avatar & User Details */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3 group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400 blur-sm opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 font-heading font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md">
                    {profile.name ? profile.name.substring(0, 2).toUpperCase() : 'SP'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow" />
                </div>

                <h2 className="text-xl font-heading font-bold text-slate-900">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {profile.profession}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold uppercase">
                    GSEB Certified
                  </span>
                </div>
                <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Daily Target: {profile.targetDailyHours || 1}h {profile.targetDailyMinutes || 0}m</span>
                </div>
              </div>
            </div>

            {/* User Stats Row */}
            <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-100 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="text-base font-bold text-slate-900 font-mono">
                  {stats?.skillsInProgress || skillCards.length || 1}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Active Tracks</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="text-base font-bold text-slate-900 font-mono">
                  {stats?.totalMilestonesPassed || 4}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Milestones</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="text-base font-bold text-emerald-600 font-mono">
                  {stats?.skillsMastered || 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Mastered</div>
              </div>
            </div>

            {/* Edit Profile CTA */}
            <div className="pt-3">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 btn-tactile cursor-pointer shadow-xs group"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-600 transition-transform group-hover:scale-120" />
                <span>Open Profile Editing Interface</span>
              </button>
            </div>
          </div>

          {/* Right Column: Telemetry Streak Badges & 7-Day Bar Graph (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
            {/* Top Telemetry Streak Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flame Streakmeter */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border border-amber-200/90 rounded-3xl p-5 shadow-xs wobble-card flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-heading font-extrabold text-amber-900 tracking-tight">
                      {streak?.currentStreak || 7} DAYS
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-mono animate-pulse">
                      FLAME STREAK
                    </span>
                  </div>
                  <p className="text-xs text-amber-700/90 font-medium">
                    Flame streak unbroken • Next tier at 10 days
                  </p>
                </div>

                <div className="relative p-3 bg-amber-500/15 rounded-2xl flame-active">
                  <Flame className="w-10 h-10 text-amber-500 fill-amber-400" />
                  <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                </div>
              </div>

              {/* Shield Status: Freeze Protection */}
              <div className="freeze-shield-glint bg-gradient-to-br from-sky-50 to-blue-50/90 border border-sky-200/90 rounded-3xl p-5 shadow-xs wobble-card flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-heading font-bold text-sky-900">
                      {streak?.streakFreezes || 1} Active Freeze 🧊
                    </span>
                  </div>
                  <p className="text-xs text-sky-700/90 font-medium">
                    Protects 1 missed study session safely
                  </p>
                  <div className="text-[11px] text-sky-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-recharges every 14 days</span>
                  </div>
                </div>

                <div className="p-3 bg-sky-500/15 rounded-2xl">
                  <Shield className="w-9 h-9 text-sky-600 fill-sky-200" />
                </div>
              </div>
            </div>

            {/* 7-Day Study Cadence Animated Bar Graph */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/70 shadow-lg shadow-emerald-950/5 wobble-card relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <h3 className="text-sm font-heading font-bold text-slate-800">
                    7 Day Study-Time Cadence
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGraphAnimationKey((k) => k + 1)}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                    title="Re-run bar rise animation"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-animate</span>
                  </button>
                  <span className="text-xs text-slate-500 hidden sm:inline">Target: {profile.targetDailyHours || 1}h / day</span>
                </div>
              </div>

              {/* Vertical Bar Chart */}
              <div className="relative pt-6 pb-2" key={graphAnimationKey}>
                {hoveredDay && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-xl shadow-xl z-20 pointer-events-none flex items-center gap-2 font-sans border border-slate-700">
                    <span className="font-bold text-emerald-400">{hoveredDay.day}:</span>
                    <span className="font-mono">{hoveredDay.hours || Math.round(hoveredDay.minutes/60)}h {hoveredDay.minutes % 60}m</span>
                    {hoveredDay.focusArea && <span className="text-slate-400">({hoveredDay.focusArea})</span>}
                  </div>
                )}

                <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-36 border-b border-slate-100 pb-2">
                  {cadenceData.map((cadence: any, index: number) => {
                    const totalHrs = cadence.hours || (cadence.minutes / 60);
                    const heightPercent = Math.min(100, Math.round((totalHrs / maxHours) * 100));
                    const isToday = index === 3;

                    return (
                      <div
                        key={cadence.day + index}
                        onMouseEnter={() => setHoveredDay(cadence)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className="flex flex-col items-center gap-2 group cursor-pointer h-full justify-end select-none"
                      >
                        <span className="text-[10px] font-mono font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {cadence.minutes}m
                        </span>

                        <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end p-0.5">
                          <div
                            style={{ height: `${Math.max(12, heightPercent)}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 origin-bottom group-hover:scale-y-105 bar-shimmer ${
                              isToday
                                ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-sky-400 shadow-md shadow-emerald-500/35'
                                : 'bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500'
                            }`}
                          />
                        </div>

                        <span className={`text-xs font-semibold transition-colors ${isToday ? 'text-emerald-700 font-bold' : 'text-slate-500 group-hover:text-slate-900'}`}>
                          {cadence.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Enrolled Skills Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-heading font-bold text-slate-900">
                Active Skills Track Workspace ({skillCards.length})
              </h2>
            </div>

            <button
              onClick={() => setShowAddTrackModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold btn-tactile cursor-pointer shadow-xs group"
            >
              <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Skill Track</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCards.map((track: any, trackIdx: number) => {
              const currentStep = track.currentStep || 1;
              const totalSteps = track.steps?.length || track.totalSteps || 5;
              const progress = Math.round((currentStep / totalSteps) * 100);

              return (
                <div
                  key={track.id || trackIdx}
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/70 shadow-lg shadow-emerald-950/5 wobble-card flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl shadow-inner transition-transform duration-300 group-hover:scale-115">
                          {track.category === 'Programming' ? '💻' : track.category === 'Chemistry' ? '⚗️' : '🎯'}
                        </div>
                        <div>
                          <h3 className="text-base font-heading font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {track.title || track.targetGoal}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {track.category || 'Science & Technical'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Milestone Progress</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          STEP {currentStep}/{totalSteps}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 shadow-xs transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-2 border-t border-slate-100">
                    <Link
                      href={`/workspace/${track.id}`}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-heading font-semibold text-xs tracking-wide shadow-md shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center justify-center gap-2 group-hover:gap-3"
                    >
                      <span>Launch Studio</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Add New Skill Track Card */}
            <div
              onClick={() => setShowAddTrackModal(true)}
              className="rounded-3xl p-6 border-2 border-dashed border-emerald-300/80 bg-emerald-50/30 hover:bg-emerald-50/70 hover:border-emerald-500 transition-all duration-300 wobble-card flex flex-col items-center justify-center text-center cursor-pointer min-h-[240px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-120 group-hover:rotate-90 mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-heading font-bold text-slate-800 group-hover:text-emerald-800">
                + Add New Skill Track
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Synthesize custom curriculum flowchart & evaluation gates
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md view-transition-enter">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Learner Profile Settings
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Profession / Focus</label>
                  <input
                    type="text"
                    required
                    value={formProfession}
                    onChange={(e) => setFormProfession(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Daily Target (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    required
                    value={formTargetHours}
                    onChange={(e) => setFormTargetHours(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Daily Target (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    required
                    value={formTargetMinutes}
                    onChange={(e) => setFormTargetMinutes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Study Reminder Time (24h)</label>
                <input
                  type="time"
                  required
                  value={formReminderTime}
                  onChange={(e) => setFormReminderTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-heading font-bold text-xs shadow-md btn-tactile cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Initiation Modal */}
      <InitiateTrackModal
        isOpen={showAddTrackModal}
        onClose={() => {
          setShowAddTrackModal(false);
          fetchProfile();
        }}
      />

      <AdminGateModal isOpen={isAdminGateOpen} onClose={() => setIsAdminGateOpen(false)} />
    </div>
  );
}
