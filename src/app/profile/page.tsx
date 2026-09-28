'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  BookOpen, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Bell, 
  Target, 
  ArrowLeft, 
  Edit3, 
  X, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AdminGateModal } from '@/components/AdminGateModal';

interface ProfileResponse {
  profile: {
    name: string;
    age: number;
    profession: string;
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
    history: Array<{ date: string; day: string; minutes: number; hours: number }>;
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
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(18);
  const [formProfession, setFormProfession] = useState('');
  const [formTargetHours, setFormTargetHours] = useState('1');
  const [formReminderTime, setFormReminderTime] = useState('20:00');
  const [saving, setSaving] = useState(false);
  const [reminderNotified, setReminderNotified] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setFormName(json.profile.name);
        setFormAge(json.profile.age);
        setFormProfession(json.profile.profession);
        setFormTargetHours((json.profile.targetDailyMinutes / 60).toString());
        setFormReminderTime(json.profile.reminderTime || '20:00');
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

  // Daily Learning Reminder Checker
  useEffect(() => {
    if (!data?.profile?.reminderTime || reminderNotified) return;

    const checkReminder = () => {
      const now = new Date();
      const currentFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentFormatted === data.profile.reminderTime && !data.telemetry.goalCompleted) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Skillprax Study Reminder 🔥', {
            body: `Time for your daily learning session! You have ${Math.max(0, data.telemetry.targetDailyMinutes - data.telemetry.todayMinutes)} mins remaining today.`,
            icon: '/logo.png',
          });
        }
        setReminderNotified(true);
      }
    };

    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [data, reminderNotified]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Easter Egg Gate
    if (formProfession.trim().toLowerCase() === '/admin') {
      setIsEditOpen(false);
      setFormProfession(data?.profile.profession || 'Learner');
      setIsAdminGateOpen(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          age: Number(formAge),
          profession: formProfession,
          targetDailyMinutes: Math.round(Number(formTargetHours) * 60),
          reminderTime: formReminderTime,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        await fetchProfile();
        await requestNotificationPermission();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400"/>
      </div>
    );
  }

  const { profile, streak, telemetry, stats, skillCards } = data;
  const progressToGoal = Math.min(100, Math.round((telemetry.todayMinutes / Math.max(telemetry.targetDailyMinutes, 1)) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors" href="/">
            <ArrowLeft className="w-4 h-4"/> Back to Studio
          </Link>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400"/> Edit Goals & Profile
          </button>
        </div>

        {/* Identity & Tenure Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <User className="w-7 h-7"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{profile.age} yrs</span>
              </div>
              <p className="text-xs text-cyan-400 font-medium">{profile.profession}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3"/> {profile.tenureText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-lg font-bold font-mono text-cyan-400">{stats.skillsInProgress}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Learning</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-lg font-bold font-mono text-emerald-400">{stats.skillsMastered}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Mastered</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <span className="text-lg font-bold font-mono text-amber-400">{stats.totalMilestonesPassed}</span>
              <span className="block text-[10px] text-slate-400 uppercase">Milestones</span>
            </div>
          </div>
        </div>

        {/* STREAKMETER & TELEMETRY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Flame Streak Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-900/40 border border-amber-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Flame className="w-5 h-5 fill-amber-400 animate-pulse"/>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Streak</h3>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold">Best: {streak.longestStreak} d</span>
            </div>

            <div className="text-center py-2">
              <div className="text-5xl font-black font-mono text-white tracking-tight flex items-center justify-center gap-2">
                <span>{streak.currentStreak}</span>
                <span className="text-xl font-bold text-amber-400">DAYS</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Consistent daily competency building</p>
            </div>

            {/* Streak Freeze Badge */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              streak.streakFreezes > 0
                ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${streak.streakFreezes > 0 ? 'text-cyan-400' : 'text-slate-600'}`}/>
                <span>Streak Freeze Shield</span>
              </div>
              <span className="font-mono font-bold">
                {streak.streakFreezes > 0 ? '1 Active 🧊' : 'Earn at 7+ Days'}
              </span>
            </div>
          </div>

          {/* Today's Goal & Hours Tracker */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Target className="w-5 h-5"/>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Target</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">{telemetry.todayHours} / {telemetry.targetDailyHours} hrs</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress to Goal</span>
                <span className="font-mono text-white font-semibold">{progressToGoal}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    telemetry.goalCompleted ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${progressToGoal}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-cyan-400"/> Daily Alert:
              </span>
              <span className="font-mono text-slate-200">{profile.reminderTime} hrs</span>
            </div>
          </div>

          {/* 7-Day Activity Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Activity</h3>
              <span className="text-[11px] font-mono text-slate-500">Hours / Day</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-4">
              {telemetry.history.map((day, idx) => {
                const heightPercent = Math.min(100, Math.max(12, Math.round((day.minutes / Math.max(telemetry.targetDailyMinutes, 60)) * 100)));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                      {day.hours > 0 ? day.hours : ''}
                    </span>
                    <div className="w-full bg-slate-800 rounded-lg overflow-hidden h-20 flex items-end">
                      <div 
                        className={`w-full transition-all duration-300 ${
                          day.minutes >= telemetry.targetDailyMinutes
                            ? 'bg-emerald-400'
                            : day.minutes > 0
                            ? 'bg-cyan-400/80'
                            : 'bg-slate-800'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ENROLLED SKILL CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400"/> Active Learning Tracks ({skillCards.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">Real-Time Progression</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillCards.map((track) => (
              <div key={track.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                      STEP {track.currentStep} / {track.totalSteps}
                    </span>
                    {track.isMastered && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3"/> Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{track.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{track.targetGoal}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono text-cyan-400 font-bold">{track.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${track.progress}%` }}/>
                  </div>
                  <Link className="mt-2 w-full py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all" href={`/workspace/${track.id}`}>
                    Launch Studio <ArrowRight className="w-3.5 h-3.5"/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT PROFILE & GOALS MODAL */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400"/> Settings & Goals
                </h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={formAge}
                      onChange={(e) => setFormAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Daily Target (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      required
                      value={formTargetHours}
                      onChange={(e) => setFormTargetHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Profession / Role</label>
                  <input
                    type="text"
                    required
                    value={formProfession}
                    onChange={(e) => setFormProfession(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Study Reminder Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formReminderTime}
                    onChange={(e) => setFormReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5">
                    {saving && <Loader2 className="w-3 h-3 animate-spin"/>}
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AdminGateModal isOpen={isAdminGateOpen} onClose={() => setIsAdminGateOpen(false)} />
      </div>
    </div>
  );
}
