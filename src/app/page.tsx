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
  Loader2
} from 'lucide-react';
import { SkillBlueprintBackground } from '@/components/SkillBlueprintBackground';
import { TelemetryModal } from '@/components/TelemetryModal';
import { InitiateTrackModal } from '@/components/InitiateTrackModal';

export default function HomePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Navigation States
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isNewSkillOpen, setIsNewSkillOpen] = useState(false);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isFirstTimeProfileOpen, setIsFirstTimeProfileOpen] = useState(false);

  // First time profile form
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState(18);
  const [professionInput, setProfessionInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com';

  const loadData = async () => {
    try {
      const [profRes, wsRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile`),
        fetch(`${API_BASE}/api/workspaces`),
      ]);
      if (profRes.ok) setProfileData(await profRes.json());
      if (wsRes.ok) setWorkspaces(await wsRes.json());
    } catch (e) {
      console.error('Failed to load portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isProfileConfigured = Boolean(
    profileData?.profile?.name && 
    profileData?.profile?.name !== 'Explorer' && 
    profileData?.profile?.name !== 'Skillprax Learner'
  );

  const handleGetStartedClick = () => {
    if (!isProfileConfigured) {
      setIsFirstTimeProfileOpen(true);
    } else {
      setIsChoiceOpen(true);
    }
  };

  const handleSaveInitialProfile = async (e: React.FormEvent) => {
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
        }),
      });
      if (res.ok) {
        setIsFirstTimeProfileOpen(false);
        await loadData();
        // Immediately route to Add New Skill after first-time profile creation
        setIsNewSkillOpen(true);
      }
    } catch (err) {
      console.error('Initial profile setup failed:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030714] text-slate-100 relative overflow-hidden font-sans">
      <SkillBlueprintBackground/>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 border-b border-blue-900/40 bg-[#030714]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Wordmark */}
          <Link className="flex items-center gap-3.5 group select-none" href="/">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-blue-950/60 border border-blue-700/40 group-hover:border-amber-400/60 transition-all p-1 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
              <img src="/logo.png" alt="Skillprax" className="w-full h-full object-contain"/>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                Skillprax
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"/>
              </span>
              <span className="text-[10px] text-blue-300/70 font-mono tracking-wider uppercase">
                Autonomous Mastery Engine
              </span>
            </div>
          </Link>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            {/* Graph / Telemetry Icon */}
            <button
              onClick={() => setIsTelemetryOpen(true)}
              title="Telemetry & Daily Streak"
              className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/40 text-blue-300 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4"/>
              <span className="text-xs font-mono font-semibold hidden sm:inline">
                {profileData?.streak?.currentStreak || 0}d
              </span>
            </button>

            {/* Profile Section Icon */}
            <Link className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-800/40 text-blue-300 hover:text-white hover:border-blue-500/60 transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] flex items-center gap-2" href="/profile" title="Learner Profile">
              <User className="w-4 h-4 text-blue-400"/>
              <span className="text-xs font-medium hidden sm:inline">
                {profileData?.profile?.name ? profileData.profile.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>

            {/* Add New Skill Quick Button */}
            <button
              onClick={() => setIsNewSkillOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all"
            >
              <Plus className="w-4 h-4"/> <span className="hidden sm:inline">New Skill</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION / FIRST INTERACTIVE INTERFACE */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center space-y-8">
        
        {/* Sci-Fi Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-mono shadow-[0_0_25px_rgba(37,99,235,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400"/>
          <span>Dynamic Socratic Curriculum • Resource Bounded</span>
        </div>

        {/* Centerpiece Logo & Hero Heading */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Build Unbreakable Competency With{' '}
            <span className="bg-gradient-to-r from-blue-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Skillprax
            </span>
          </h1>
          <p className="text-sm sm:text-base text-blue-200/70 max-w-2xl mx-auto font-normal leading-relaxed">
            High-friction cognitive checkpoints, autonomous research discovery, and scenario-based distractor evaluation. No superficial checklists.
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

        {/* ENROLLED TRACKS QUICK GRID */}
        {workspaces.length > 0 && (
          <div className="w-full pt-16 space-y-6 text-left" id="skills-section">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400"/> Active Tracks ({workspaces.length})
              </h2>
              <span className="text-xs font-mono text-blue-400">Continuous Mastery</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workspaces.map((track) => (
                <div
                  key={track.id}
                  className="p-5 rounded-2xl bg-[#071026]/70 border border-blue-900/50 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 shadow-[0_0_20px_rgba(7,16,38,0.5)]"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400">
                        STEP {track.currentStep ?? 1} / {track.totalSteps ?? 1}
                      </span>
                      {track.progress === 100 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3"/> Mastered
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{track.title}</h3>
                    <p className="text-xs text-blue-200/60 line-clamp-2">{track.targetGoal}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-blue-900/40">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                        <span>Mastery</span>
                        <span className="text-amber-400 font-bold">{track.progress ?? 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full"
                          style={{ width: `${track.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <Link className="w-full py-2.5 rounded-xl bg-blue-950/80 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-blue-800/40 hover:border-amber-400" href={`/workspace/${track.id}`}>
                      Launch Studio <ArrowRight className="w-3.5 h-3.5"/>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CONTINUATION CHOICE MODAL (FOR RETURNING USERS) */}
      {isChoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#071026] border border-blue-900/60 rounded-2xl w-full max-w-md p-6 relative space-y-5 shadow-[0_0_50px_rgba(37,99,235,0.25)]">
            <h3 className="text-base font-bold text-white text-center">Select Your Next Directive</h3>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsChoiceOpen(false);
                  const el = document.getElementById('skills-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 hover:border-blue-400 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300">Continue Existing Skill</h4>
                  <p className="text-xs text-slate-400">Resume in-progress milestones from active tracks</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform"/>
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
                  <p className="text-xs text-slate-400">Initialize a new autonomous pedagogical roadmap</p>
                </div>
                <Plus className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform"/>
              </button>
            </div>
            <button
              onClick={() => setIsChoiceOpen(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FIRST-TIME PROFILE SETUP MODAL */}
      {isFirstTimeProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#071026] border border-blue-900/60 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-700/60 text-amber-400 mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <User className="w-6 h-6"/>
              </div>
              <h3 className="text-base font-bold text-white">Initialize Learner Profile</h3>
              <p className="text-xs text-slate-400">Configure your persona before crafting your first skill roadmap.</p>
            </div>

            <form onSubmit={handleSaveInitialProfile} className="space-y-3.5 text-xs pt-2">
              <div>
                <label className="block text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manendra Patel"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030714] border border-blue-900/60 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    required
                    value={ageInput}
                    onChange={(e) => setAgeInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030714] border border-blue-900/60 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Profession / Focus</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 12 Science"
                    value={professionInput}
                    onChange={(e) => setProfessionInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030714] border border-blue-900/60 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile || !nameInput.trim()}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                Save & Add First Skill
              </button>
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

      {/* INITIATE TRACK MODAL */}
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
