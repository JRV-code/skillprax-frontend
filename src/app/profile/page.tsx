'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, Shield, Edit3, Plus, ArrowRight, Play, 
  Award, Settings, RefreshCw 
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';

export default function ProfileHubPage() {
  const router = useRouter();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id');
    if (!storedId) {
      router.push('/');
      return;
    }
    setActiveProfileId(storedId);
    loadTelemetry(storedId);
  }, []);

  async function loadTelemetry(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (!res.ok) throw new Error('Telemetry retrieval failed');
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Interactive "Simulate Study Session" button
  const handleSimulateStudySession = async () => {
    if (!activeProfileId) return;
    setSimulating(true);
    try {
      const res = await fetch(`/api/profiles/${activeProfileId}/study-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: 60 }),
      });
      if (res.ok) {
        await loadTelemetry(activeProfileId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !telemetry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { profile, xpTelemetry, cadenceTelemetry, competencyTelemetry, badges, enrolledWorkspaces } = telemetry;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col font-sans">
      {/* TOP STATUS HEADER */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <SkillpraxLogo size="sm"/>
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              HUB
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Autonomous Mastery Profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors" href="/admin">
            <Settings className="w-4 h-4"/>
            <span className="hidden sm:inline">API Admin</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6">
        {/* CARD 1: IDENTITY & XP LEVEL BANNER */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-800 flex items-center justify-center text-white font-black text-2xl shadow-md">
                {profile.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {profile.educationBoard} • {profile.grade}
                  </span>
                  <span className="text-xs text-slate-400">• {profile.age} yrs</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5"/>
              Configure System Keys
            </button>
          </div>

          {/* XP PROGRESS BAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-600 flex items-center gap-1.5">
                🏆 LEVEL {xpTelemetry.currentLevel} • {xpTelemetry.tierTitle}
              </span>
              <span className="text-slate-500">{xpTelemetry.tierProgressPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${xpTelemetry.tierProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{xpTelemetry.totalXp} XP</span>
              <span>{xpTelemetry.nextTierXp} XP (Next Tier)</span>
            </div>
          </div>

          {/* QUICK METRICS & DAILY TARGETS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div>
              <p className="text-2xl font-black text-slate-900">{profile.activeDays}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Days</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{profile.enrolledTracksCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Tracks</p>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              <span className="text-xs font-medium text-slate-600">
                Target: {profile.targetHours}h {profile.targetMinutes}m/day
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                {profile.alertNotification} Alert
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: MOMENTUM & PROTECTION DUAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MOMENTUM CARD */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                MOMENTUM
              </span>
              <Flame className="w-5 h-5 text-orange-500"/>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{profile.streakDays} DAYS</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Consecutive Daily Mastery Streak 🔥</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Active Multiplier: {(1 + profile.streakDays * 0.1).toFixed(1)}x XP Boost on next Socratic check
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Today's Milestone: Active</span>
              <span>Alert: {profile.alertNotification}</span>
            </div>
          </div>

          {/* PROTECTION CARD */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                PROTECTION
              </span>
              <Shield className="w-5 h-5 text-cyan-600"/>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">{profile.freezeShields} / 3</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Streak Freeze Safeguards 🧊</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Auto-deploys during involuntary pauses to shield your flame.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Defense Forcefield: {profile.freezeShields > 0 ? 'Armed' : 'Depleted'}</span>
              <span className="font-bold text-cyan-700">{Math.round((profile.freezeShields / 3) * 100)}% Armed ✓</span>
            </div>
          </div>
        </div>

        {/* CARD 3: CADENCE & 7-DAY VOLUME DISTRIBUTION */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                CADENCE
              </span>
              <p className="text-3xl font-black text-slate-900 mt-2">{cadenceTelemetry.total7DayHours}h</p>
              <p className="text-xs text-slate-500">7-Day Study Cadence Volume</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Average Pace: {cadenceTelemetry.averageDailyHours} hrs/day across domains
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                COMPETENCY
              </span>
              <p className="text-3xl font-black text-slate-900 mt-2">{competencyTelemetry.totalAcusVerified} ACUs</p>
              <p className="text-xs text-slate-500">Verified Assessable Concept Units</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Diagnostic Pass Rate: {competencyTelemetry.diagnosticPassRate}% Accuracy
              </p>
            </div>
          </div>

          {/* DYNAMIC BARS (Sun to Sat) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">7-Day Study Cadence & Velocity Distribution</h4>
                <p className="text-xs text-slate-400">Staggered growth bars representing focused cognitive volume per diurnal cycle</p>
              </div>

              <button
                onClick={handleSimulateStudySession}
                disabled={simulating}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Play className="w-3.5 h-3.5 text-emerald-600"/>}
                Log 1h Session
              </button>
            </div>

            <div className="grid grid-cols-7 gap-3 h-40 items-end pt-6 pb-2 px-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              {cadenceTelemetry.distribution.map((bar: any) => {
                const maxVal = Math.max(...cadenceTelemetry.distribution.map((b: any) => b.hours), 4);
                const heightPct = Math.min(100, Math.max(12, Math.round((bar.hours / maxVal) * 100)));
                return (
                  <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      {bar.hours}h
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-xl transition-all duration-300 ${
                        bar.hours > 0 ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-slate-200'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-bold text-slate-600">{bar.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Target: {cadenceTelemetry.targetWkHours}h/wk</span>
              <span className="font-bold text-emerald-700">{cadenceTelemetry.cadenceGoalMetPct}% Goal Met</span>
            </div>
          </div>
        </div>

        {/* CARD 4: AUTONOMOUS MASTERY BADGES */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Autonomous Mastery Badges</h3>
            <p className="text-xs text-slate-400">Cognitive milestones earned through rigorous Socratic verification</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge: any) => (
              <div
                key={badge.key}
                className={`p-4 rounded-2xl border transition-all ${
                  badge.unlocked
                    ? 'bg-white border-amber-200 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    badge.tier === 'LEGENDARY' ? 'bg-amber-100 text-amber-800' :
                    badge.tier === 'EPIC' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {badge.tier}
                  </span>
                  <Award className={`w-4 h-4 ${badge.unlocked ? 'text-amber-500' : 'text-slate-300'}`}/>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{badge.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{badge.description}</p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Status</span>
                  <span className={badge.unlocked ? 'text-emerald-600' : 'text-slate-400'}>
                    {badge.progressText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 5: ENROLLED SKILL TRACKS */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Enrolled Skill Tracks</h3>
              <p className="text-xs text-slate-400">Isolated roadmap node graphs, assessable units, and evaluation milestones</p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4"/>
              Enroll New Skill
            </button>
          </div>

          {enrolledWorkspaces.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-600">No active skill tracks enrolled.</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Enroll New Skill" to synthesize a custom Groq roadmap.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledWorkspaces.map((track: any) => (
                <Link className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:shadow-md transition-all block group" href={`/workspace/${track.id}`} key={track.id}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {track.title}
                    </h4>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all"/>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{track.subTitle}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{track.passedStepsCount} of {track.stepsCount} Milestones Passed</span>
                    <span className="font-bold text-emerald-600">{track.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
