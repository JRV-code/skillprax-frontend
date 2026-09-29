'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  User, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ChevronRight,
  CheckCircle2,
  Loader2,
  UserPlus
} from 'lucide-react';
import { TelemetryModal } from '@/components/TelemetryModal';
import { InitiateTrackModal } from '@/components/InitiateTrackModal';
import { FloatingSchematicsCanvas } from '@/components/SkillBlueprintBackground';

export default function HomePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Dialogs
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isNewSkillOpen, setIsNewSkillOpen] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);

  // New Profile Form
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState(18);
  const [professionInput, setProfessionInput] = useState('');
  const [targetHours, setTargetHours] = useState('1');
  const [targetMinutes, setTargetMinutes] = useState('0');
  const [reminderTime, setReminderTime] = useState('20:00');
  const [savingProfile, setSavingProfile] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com';

  const loadData = async () => {
    try {
      const profRes = await fetch(`${API_BASE}/api/profile`);
      if (profRes.ok) setProfileData(await profRes.json());
    } catch (e) {
      console.error('Failed to load portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGetStartedClick = () => {
    // Open choice modal: "Create New Profile" OR "Continue with Existing Profile"
    setIsGetStartedOpen(true);
  };

  const handleSaveNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim(),
          age: Number(ageInput),
          profession: professionInput.trim(),
          targetDailyHours: Number(targetHours),
          targetDailyMinutes: Number(targetMinutes),
          reminderTime,
        }),
      });

      if (res.ok) {
        setIsCreateProfileOpen(false);
        await loadData();
        // Immediately transition to creating the new skill
        setIsNewSkillOpen(true);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
      <FloatingSchematicsCanvas />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 border-b border-border bg-background/80 backdrop-blur-xl/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link className="flex items-center gap-3 group select-none" href="/">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-muted border border-border group-hover:border-amber-400/60 transition-all p-1 shadow-[0_0_15px_rgba(37,99,235,0.25)]">
              <img src="/logo.png" alt="Skillprax Logo" className="w-full h-full object-contain"/>
            </div>
            <span className="font-black text-lg tracking-tight text-foreground group-hover:text-accent transition-colors">
              Skillprax
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTelemetryOpen(true)}
              title="Telemetry & Daily Streak"
              className="p-2.5 rounded-xl bg-muted border border-border text-primary hover:text-accent hover:border-amber-500/50 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4"/>
              <span className="text-xs font-mono font-semibold hidden sm:inline">
                {profileData?.streak?.currentStreak || 0}d
              </span>
            </button>

            <Link className="p-2.5 rounded-xl bg-muted border border-border text-primary hover:text-foreground hover:border-border transition-all flex items-center gap-2" href="/profile">
              <User className="w-4 h-4 text-primary"/>
              <span className="text-xs font-medium hidden sm:inline">
                {profileData?.profile?.name ? profileData.profile.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>

            <button
              onClick={() => setIsNewSkillOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all"
            >
              <Plus className="w-4 h-4"/> <span className="hidden sm:inline">New Skill</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH CENTERPIECE LOGO */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 flex flex-col items-center text-center space-y-6">
        
        {/* CENTERPIECE LOGO WITH AMBER & ROYAL BLUE GLOW */}
        <div className="relative group mt-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 to-amber-400 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"/>
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-background/80 backdrop-blur-xl border-2 border-border group-hover:border-amber-400 p-4 shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center transition-all duration-300">
            <img src="/logo.png" alt="Skillprax" className="w-full h-full object-contain drop-shadow-2xl"/>
          </div>
        </div>

        {/* Sci-Fi Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border text-primary text-xs font-mono shadow-[0_0_25px_rgba(37,99,235,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-accent"/>
          <span>Autonomous Mastery Engine • Pure Cognitive Telemetry</span>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-tight">
            Skillprax
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            High-friction cognitive checkpoints, curated video tutorials, and scenario-based distractor evaluation.
          </p>
        </div>

        {/* PRIMARY CTA: GET STARTED BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleGetStartedClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_35px_rgba(37,99,235,0.4)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5"
          >
            <span>GET STARTED</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
      </main>

      {/* MODAL 1: GET STARTED CHOICE DIALOG */}
      {isGetStartedOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card/80 backdrop-blur-md shadow-lg border border-border/50 border border-border rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-[0_0_50px_rgba(37,99,235,0.25)]">
            <h3 className="text-base font-bold text-foreground text-center">Get Started on Skillprax</h3>
            <p className="text-xs text-muted-foreground text-center -mt-3">Choose how you wish to proceed</p>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Option A: Continue With Existing Profile */}
              <button
                onClick={() => {
                  setIsGetStartedOpen(false);
                  setIsChoiceOpen(true);
                }}
                className="p-4 rounded-xl bg-muted border border-border hover:border-blue-400 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-primary">
                    <User className="w-5 h-5"/>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary">
                      Continue with Existing Profile
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Current: {profileData?.profile?.name || 'Explorer'} ({profileData?.profile?.profession || 'Learner'})
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform"/>
              </button>

              {/* Option B: Create New Profile */}
              <button
                onClick={() => {
                  setIsGetStartedOpen(false);
                  setNameInput('');
                  setProfessionInput('');
                  setIsCreateProfileOpen(true);
                }}
                className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-amber-950/30 border border-amber-500/40 hover:border-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-accent">
                    <UserPlus className="w-5 h-5"/>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">Create New Profile</h4>
                    <p className="text-xs text-muted-foreground">Configure a fresh persona and schedule</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>

            <button
              onClick={() => setIsGetStartedOpen(false)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECTIVE CHOICE (EXISTING PROFILE) */}
      {isChoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card/80 backdrop-blur-md shadow-lg border border-border/50 border border-border rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-[0_0_50px_rgba(37,99,235,0.25)]">
            <h3 className="text-base font-bold text-foreground text-center">Select Your Learning Directive</h3>
            <div className="grid grid-cols-1 gap-3 pt-1">
              <button
                onClick={() => {
                  setIsChoiceOpen(false);
                  const el = document.getElementById('skills-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-4 rounded-xl bg-muted border border-border hover:border-blue-400 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary">Resume Existing Skill</h4>
                  <p className="text-xs text-muted-foreground">Continue active milestones from enrolled tracks</p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform"/>
              </button>

              <button
                onClick={() => {
                  setIsChoiceOpen(false);
                  setIsNewSkillOpen(true);
                }}
                className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-amber-950/30 border border-amber-500/40 hover:border-amber-400 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-amber-300">Add New Skill Track</h4>
                  <p className="text-xs text-muted-foreground">Initialize a new pedagogical curriculum</p>
                </div>
                <Plus className="w-5 h-5 text-accent group-hover:rotate-90 transition-transform"/>
              </button>
            </div>
            <button
              onClick={() => setIsChoiceOpen(false)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW PROFILE FORM */}
      {isCreateProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card/80 backdrop-blur-md shadow-lg border border-border/50 border border-border rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-muted border border-border text-accent mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <UserPlus className="w-6 h-6"/>
              </div>
              <h3 className="text-base font-bold text-foreground">Create New Learner Profile</h3>
              <p className="text-xs text-muted-foreground">Setup your persona, goals, and daily study cadence.</p>
            </div>

            <form onSubmit={handleSaveNewProfile} className="space-y-3.5 text-xs pt-2">
              <div>
                <label className="block text-muted-foreground mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manendra Patel"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Age</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    required
                    value={ageInput}
                    onChange={(e) => setAgeInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Profession / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 12 Science"
                    value={professionInput}
                    onChange={(e) => setProfessionInput(e.target.value)}
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
                      value={targetHours}
                      onChange={(e) => setTargetHours(e.target.value)}
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
                      value={targetMinutes}
                      onChange={(e) => setTargetMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Daily Alert Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-foreground focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !nameInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
                >
                  {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                  Save & Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TELEMETRY & STREAK MODAL */}
      <TelemetryModal 
        isOpen={isTelemetryOpen} 
        onClose={() => setIsTelemetryOpen(false)}
        streak={profileData?.streak || { currentStreak: 0, longestStreak: 0, streakFreezes: 0 }}
        telemetry={profileData?.telemetry || { todayMinutes: 0, todayHours: 0, targetDailyMinutes: 60, targetDailyHours: 1, goalCompleted: false, history: [] }}
      />

      {/* INITIATE NEW TRACK MODAL */}
      <InitiateTrackModal 
        isOpen={isNewSkillOpen} 
        onClose={() => {
          setIsNewSkillOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
