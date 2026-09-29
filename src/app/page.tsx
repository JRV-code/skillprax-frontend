'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LogIn,
  Zap,
  Activity,
  Flame,
  Shield,
  Compass,
  GitBranch,
  Award,
  Layers,
  X,
  UserPlus,
  Plus,
  Loader2,
  BarChart3
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

export default function LandingPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gateway Modal state
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);
  const [gatewayMode, setGatewayMode] = useState<'existing' | 'create'>('existing');

  // Form states for Create New Profile
  const [name, setName] = useState('');
  const [age, setAge] = useState('18');
  const [profession, setProfession] = useState('Class 12 Science (NEET / JEE)');
  const [targetHours, setTargetHours] = useState<number>(1);
  const [targetMinutes, setTargetMinutes] = useState<number>(0);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Selected workspace track
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const loadPortalData = async () => {
    try {
      const profRes = await fetch(`${API_BASE_URL}/api/profile`);
      if (profRes.ok) {
        const pData = await profRes.json();
        setProfileData(pData);
        setName(pData.profile?.name || '');
        setAge((pData.profile?.age || 18).toString());
        setProfession(pData.profile?.profession || 'Class 12 Science (NEET / JEE)');
        setTargetHours(pData.profile?.targetDailyHours || 1);
        setTargetMinutes(pData.profile?.targetDailyMinutes || 0);
        setReminderTime(pData.profile?.reminderTime || '20:00');

        const profileId = pData.profile?.id || 'global';
        const wsRes = await fetch(`${API_BASE_URL}/api/workspaces?profileId=${profileId}`);
        if (wsRes.ok) {
          const wsData = await wsRes.json();
          const list = Array.isArray(wsData) ? wsData : (wsData.workspaces || wsData.tracks || []);
          setWorkspaces(list);
          if (list.length > 0) {
            setSelectedWorkspaceId(list[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleOpenGetStarted = (mode: 'existing' | 'create' = 'existing') => {
    setGatewayMode(mode);
    setIsGatewayOpen(true);
  };

  const handleResumeExisting = () => {
    setIsGatewayOpen(false);
    if (selectedWorkspaceId) {
      router.push(`/workspace/${selectedWorkspaceId}`);
    } else {
      router.push('/profile');
    }
  };

  const handleCreateNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profession.trim().toLowerCase() === '/admin') {
      setIsGatewayOpen(false);
      sessionStorage.setItem('skillprax_admin_token', 'authorized');
      router.push('/admin');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Learner',
          age: parseInt(age, 10) || 18,
          profession: profession.trim() || 'Class 12 Student',
          targetDailyHours: Math.max(0, Math.min(24, targetHours)),
          targetDailyMinutes: Math.max(0, Math.min(59, targetMinutes)),
          reminderTime,
        }),
      });

      if (res.ok) {
        setIsGatewayOpen(false);
        router.push('/profile');
      }
    } catch (err) {
      console.error('Failed to create profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleHourSpin = (delta: number) => {
    setTargetHours((prev) => Math.max(0, Math.min(24, prev + delta)));
  };

  const handleMinSpin = (delta: number) => {
    setTargetMinutes((prev) => {
      const next = prev + delta;
      if (next < 0) return 55;
      if (next > 55) return 0;
      return next;
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-tech-grid text-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none font-sans">
      {/* Background Motion Video Layer */}
      <CinematicVideoBackground src="/assets/background-motion.mp4" overlayOpacity={0.25} />

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-emerald-100/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        {/* Brand Zone */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <SkillpraxLogo size="sm" showWordmark={true} className="hover:brightness-110 active:scale-95 transition-all" />
        </Link>

        {/* Clean Nav Zone & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-120" />
            <span>Learner Profile</span>
          </Link>

          <button
            onClick={() => handleOpenGetStarted('existing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <LogIn className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Log In</span>
          </button>

          {/* Primary CTA with Conic Border Beam & Shimmer Sweep */}
          <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-600/20">
            <button
              onClick={() => handleOpenGetStarted('existing')}
              className="relative z-10 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold tracking-wide shadow-md btn-tactile btn-shimmer cursor-pointer uppercase flex items-center gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Cinematic Landing Arena */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-10 sm:py-16 text-center">
        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-emerald-500/10 mb-6 animate-pulse-glow">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>✦ Dynamic Socratic Curriculum • Resource Bounded</span>
        </div>

        {/* Centerpiece Hero Logo with Blooming Auroral Halo */}
        <div className="relative my-2 sm:my-4 group cursor-pointer" onClick={() => handleOpenGetStarted('existing')}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-400 blur-3xl opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
          <div className="relative p-6 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-emerald-200/80 group-hover:border-emerald-400 shadow-2xl transition-all duration-300">
            <SkillpraxLogo size="lg" showWordmark={true} />
          </div>
        </div>

        {/* High-Contrast Hero Typography */}
        <div className="space-y-4 max-w-2xl mt-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            Autonomous Mastery Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Dynamic competency roadmaps synthesized with active graph visualization, strict 2-video YouTube quotas, verified canonical documentation, and diagnostic Socratic gates.
          </p>
        </div>

        {/* HERO GET STARTED BUTTON */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <div className="relative p-[2.5px] rounded-2xl conic-beam shadow-xl shadow-emerald-500/20">
            <button
              onClick={() => handleOpenGetStarted('existing')}
              className="relative z-10 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[14px] font-heading font-extrabold text-base sm:text-lg tracking-wider shadow-2xl btn-tactile btn-shimmer cursor-pointer uppercase flex items-center gap-3 active:scale-95 group"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

          <Link
            href="/profile"
            className="px-6 py-4 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-2xl font-heading font-semibold text-sm shadow-sm hover:shadow-md wobble-card cursor-pointer flex items-center gap-2.5 transition-all group active:scale-95"
          >
            <Compass className="w-4 h-4 text-sky-600 transition-transform duration-300 group-hover:rotate-45" />
            <span>Explore Learner Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </Link>
        </div>

        {/* 3 Pillar Feature Cloud Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-4xl w-full text-left">
          <div
            onClick={() => handleOpenGetStarted('existing')}
            className="bg-white/85 backdrop-blur-md rounded-2xl p-5 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 mb-2">
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
            onClick={() => handleOpenGetStarted('existing')}
            className="bg-white/85 backdrop-blur-md rounded-2xl p-5 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-heading font-bold text-slate-900">
                Telemetry & Streaks
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              7-day study cadence bar graphs, flame streaks, and active freeze shield badges.
            </p>
          </div>

          <div
            onClick={() => handleOpenGetStarted('existing')}
            className="bg-white/85 backdrop-blur-md rounded-2xl p-5 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-sky-100 text-sky-800 rounded-xl group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-heading font-bold text-slate-900">
                Socratic Duel Gates
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Randomized Fisher-Yates questions with instant misconception diagnostic analysis.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 font-heading">Skillprax Engine</span>
          <span>© 2026 Socratic Curriculum Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button
            onClick={() => handleOpenGetStarted('existing')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Log In / Get Started
          </button>
          <span>·</span>
          <Link href="/profile" className="hover:text-emerald-700 transition-colors cursor-pointer">
            Profile & Telemetry
          </Link>
        </div>
      </footer>

      {/* POPUP GATEWAY MODAL */}
      {isGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md view-transition-enter overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200/90 ring-1 ring-black/5 my-6 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsGatewayOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center sm:text-left mb-6">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Competency Gateway
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Enter Autonomous Mastery Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose to continue with your saved learner profile or initialize a new track
              </p>
            </div>

            {/* Segmented Controller */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setGatewayMode('existing')}
                className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  gatewayMode === 'existing'
                    ? 'bg-white text-emerald-900 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Login with Existing</span>
              </button>
              <button
                type="button"
                onClick={() => setGatewayMode('create')}
                className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  gatewayMode === 'create'
                    ? 'bg-white text-emerald-900 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create New Profile</span>
              </button>
            </div>

            {/* Existing Profile Branch */}
            {gatewayMode === 'existing' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      ACTIVE PROFILE FOUND
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {profileData?.profile?.name || 'Explorer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-heading font-bold text-lg flex items-center justify-center border-2 border-emerald-400 shadow-sm">
                      {profileData?.profile?.name ? profileData.profile.name.substring(0, 2).toUpperCase() : 'SP'}
                    </div>

                    <div>
                      <h3 className="text-base font-heading font-bold text-slate-900">
                        {profileData?.profile?.name || 'Learner Persona'}
                      </h3>
                      <p className="text-xs text-emerald-700 font-medium">
                        {profileData?.profile?.profession || 'Class 12 Student (NEET / JEE)'} • {profileData?.profile?.age || 18} yrs
                      </p>
                    </div>
                  </div>
                </div>

                {workspaces.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Competency Track to Resume:
                    </label>
                    <select
                      value={selectedWorkspaceId}
                      onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                    >
                      {workspaces.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.title || t.targetGoal} ({t.category || 'Science'}) — STEP {t.currentStep || 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleResumeExisting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-heading font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Continue to Workspace ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* Create New Profile Branch */}
            {gatewayMode === 'create' && (
              <form onSubmit={handleCreateNewProfile} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Sharma"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="10"
                      max="99"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Profession / Academic Focus
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Type /admin for console</span>
                  </div>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Class 12 Student (NEET / JEE)"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Target Hours
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={targetHours}
                        onChange={(e) => setTargetHours(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-transparent text-sm font-bold text-slate-800 text-center focus:outline-none"
                      />
                      <div className="flex flex-col ml-1">
                        <button
                          type="button"
                          onClick={() => handleHourSpin(1)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHourSpin(-1)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Minutes
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        value={targetMinutes}
                        onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-transparent text-sm font-bold text-slate-800 text-center focus:outline-none"
                      />
                      <div className="flex flex-col ml-1">
                        <button
                          type="button"
                          onClick={() => handleMinSpin(5)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMinSpin(-5)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-heading font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>Create Profile & Launch Studio ➔</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
