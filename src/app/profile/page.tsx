'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  BookOpen, 
  Clock, 
  Bell, 
  Target, 
  ArrowLeft, 
  Edit3, 
  X, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { AdminGateModal } from '@/components/AdminGateModal';
import { SkillBlueprintBackground } from '@/components/SkillBlueprintBackground';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';

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
  const [formTargetMinutes, setFormTargetMinutes] = useState('0');
  const [formReminderTime, setFormReminderTime] = useState('20:00');
  const [saving, setSaving] = useState(false);
  const [reminderNotified, setReminderNotified] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        const json = await res.json();
        const profileId = json.profile?.id || "global";
        
        // Fetch workspaces isolated to this active profile
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
        setFormProfession(json.profile?.profession || 'Learner');
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

    // Easter Egg Gate: Intercept profession entry "/admin"
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
          targetDailyHours: Number(formTargetHours),
          targetDailyMinutes: Number(formTargetMinutes),
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
      <div className="min-h-screen bg-background/80 backdrop-blur-xl flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary"/>
      </div>
    );
  }

  const { profile, stats, skillCards } = data;

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-xl text-foreground p-6 md:p-12 relative font-sans">
      <SkillBlueprintBackground/>

      {/* Wobble Cloud CSS Definition */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wobbleCloud {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .wobble-cloud {
          animation: wobbleCloud 8s ease-in-out infinite alternate;
        }
      `}} />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="inline-flex items-center gap-2 text-xs font-mono text-primary hover:text-accent transition-colors" href="/">
              <ArrowLeft className="w-4 h-4"/> Back to Studio
            </Link>
            <Link href="/" className="hover:brightness-110 active:scale-95 transition-all">
              <SkillpraxLogo size="sm" showWordmark={true} />
            </Link>
          </div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50 border border-border text-xs text-blue-200 hover:text-foreground hover:border-amber-500/50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)]"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent"/> Edit Goals & Credentials
          </button>
        </div>

        {/* Learner Persona & Credential Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50/80 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_40px_rgba(7,16,38,0.6)]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-accent shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0">
              <User className="w-8 h-8"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{profile.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-primary border border-border font-mono">
                  {profile.age} yrs
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
                  GSEB Board Certified
                </span>
              </div>
              <p className="text-xs text-accent font-semibold mt-0.5">{profile.profession}</p>
              <p className="text-[11px] text-primary/70 font-mono mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary"/> {profile.tenureText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-xl bg-background/80 backdrop-blur-xl/80 border border-border text-center min-w-[90px]">
              <span className="text-xl font-bold font-mono text-primary">{stats.skillsInProgress}</span>
              <span className="block text-[10px] text-primary/60 uppercase font-mono mt-0.5">Learning</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background/80 backdrop-blur-xl/80 border border-border text-center min-w-[90px]">
              <span className="text-xl font-bold font-mono text-emerald-400">{stats.skillsMastered}</span>
              <span className="block text-[10px] text-primary/60 uppercase font-mono mt-0.5">Mastered</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background/80 backdrop-blur-xl/80 border border-border text-center min-w-[90px]">
              <span className="text-xl font-bold font-mono text-accent">{stats.totalMilestonesPassed}</span>
              <span className="block text-[10px] text-primary/60 uppercase font-mono mt-0.5">Milestones</span>
            </div>
          </div>
        </div>

        {/* LEARNING SCHEDULE & DAILY REMINDER SETTINGS DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50/70 border border-border space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-muted border border-blue-800 text-primary">
                <Target className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Daily Target Study Hours</h3>
                <p className="text-xs text-primary/70">Configured goal for competency development</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Target Time:</span>
              <span className="text-lg font-bold font-mono text-accent">{data.telemetry?.targetDailyHours || 1}h {data.profile?.targetDailyMinutes || 0}m / Day</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50/70 border border-border space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-muted border border-blue-800 text-accent">
                <Bell className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Study Reminder Cadence</h3>
                <p className="text-xs text-primary/70">Daily automated browser notification</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Reminder Time:</span>
              <span className="text-lg font-bold font-mono text-primary">{profile.reminderTime || '20:00'} Hrs (24h)</span>
            </div>
          </div>
        </div>

        {/* 7-DAY COGNITIVE PERFORMANCE TIMELINE BAR CHART */}
        <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                7-Day Cognitive Telemetry Performance
              </h3>
              <p className="text-xs text-muted-foreground">Logged study time against daily target</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
              {data.telemetry?.todayMinutes || 0}m Logged Today
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-4 pb-2 items-end h-40">
            {(data.telemetry?.history && data.telemetry.history.length > 0 ? data.telemetry.history : [
              { day: 'Mon', minutes: 45, hours: 0.75 },
              { day: 'Tue', minutes: 60, hours: 1 },
              { day: 'Wed', minutes: 30, hours: 0.5 },
              { day: 'Thu', minutes: 90, hours: 1.5 },
              { day: 'Fri', minutes: 75, hours: 1.25 },
              { day: 'Sat', minutes: 40, hours: 0.66 },
              { day: 'Sun', minutes: 60, hours: 1 },
            ]).map((item, idx) => {
              const target = ((data.telemetry?.targetDailyHours || 1) * 60) + (data.telemetry?.targetDailyMinutes || 0);
              const percent = Math.min(100, Math.round((item.minutes / (target || 60)) * 100));
              const isGoalMet = item.minutes >= (target || 60);

              return (
                <div key={idx} className="group relative flex flex-col items-center gap-2 h-full justify-end">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900/90 text-white text-[10px] font-mono px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-20 border border-slate-700">
                    {item.day}: {item.minutes}m ({percent}% Goal) {isGoalMet ? '✓' : ''}
                  </div>
                  
                  <div className="w-full max-w-[32px] bg-slate-900/60 rounded-t-xl h-full flex flex-col justify-end overflow-hidden border border-border/40">
                    <div
                      style={{ height: `${Math.max(8, percent)}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isGoalMet 
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400' 
                          : 'bg-gradient-to-t from-blue-600 to-amber-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-muted-foreground">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ENROLLED SKILL CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent"/> Enrolled Skill Tracks ({skillCards.length})
            </h2>
            <span className="text-xs text-primary font-mono">Competency Directives</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillCards.map((track) => (
              <div key={track.id} className="wobble-cloud relative p-5 rounded-2xl bg-card/80 backdrop-blur-md shadow-lg border border-border/50 flex flex-col justify-between space-y-4 hover:border-amber-500/50 hover:scale-[1.02] hover:-rotate-1 transition-all duration-300 shadow-[0_0_20px_rgba(7,16,38,0.4)] cursor-pointer">
                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted border border-blue-800 text-primary">
                      STEP {track.currentStep || 1} / {track.totalSteps || 5}
                    </span>
                    {track.isMastered && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3"/> Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{track.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{track.targetGoal}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border relative z-10">
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>Progress</span>
                    <span className="text-accent font-bold">{track.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full" style={{ width: `${track.progress || 0}%` }}/>
                  </div>
                  <Link className="mt-2 w-full py-2 rounded-xl bg-muted hover:bg-amber-400 hover:text-slate-950 text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition-all border border-border" href={`/workspace/${track.id}`}>
                    Launch Studio <ArrowRight className="w-3.5 h-3.5"/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT PROFILE & REMINDER MODAL */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card/80 backdrop-blur-md shadow-lg border border-border/50 border border-border rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(37,99,235,0.25)]">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent"/> Settings & Credentials
                </h3>
                <button onClick={() => setIsEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={formAge}
                      onChange={(e) => setFormAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Profession / Focus</label>
                    <input
                      type="text"
                      required
                      value={formProfession}
                      onChange={(e) => setFormProfession(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1">Daily Goal (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      required
                      value={formTargetHours}
                      onChange={(e) => setFormTargetHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Daily Goal (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      required
                      value={formTargetMinutes}
                      onChange={(e) => setFormTargetMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Daily Study Reminder Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formReminderTime}
                    onChange={(e) => setFormReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-bold flex items-center gap-1.5">
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
