'use client';

import React, { useState } from 'react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { UserProfile, SkillTrack } from '@/types';
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
  X,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (page: 'landing' | 'profile' | 'studio' | 'page01' | 'page02' | 'page03' | 'page04') => void;
  tracks: SkillTrack[];
  onOpenAdmin: () => void;
  existingProfiles?: any[];
  onSelectProfile?: (profileId: string) => void;
  onCreateProfile?: (data: { name: string; educationBoard: string; grade: string }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  tracks,
  onOpenAdmin,
  existingProfiles = [],
  onSelectProfile,
  onCreateProfile,
}) => {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayMode, setGatewayMode] = useState<'create' | 'existing'>('create');

  const [name, setName] = useState('Explorer');
  const [educationBoard, setEducationBoard] = useState('GSEB');
  const [grade, setGrade] = useState('Class 12');
  const [age, setAge] = useState((userProfile.age ?? 18).toString());
  const [profession, setProfession] = useState(userProfile.profession ?? 'Class 12 Student');
  const [targetHours, setTargetHours] = useState(userProfile.targetHours);
  const [targetMinutes, setTargetMinutes] = useState(userProfile.targetMinutes);
  const [reminderTime, setReminderTime] = useState(userProfile.dailyReminderTime ?? '20:30');
  const [enableAlerts, setEnableAlerts] = useState(userProfile.notificationsEnabled ?? true);

  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || '');

  const handleOpenGetStarted = (mode: 'create' | 'existing' = 'create') => {
    setGatewayMode(mode);
    setIsGatewayOpen(true);
  };

  const handleResumeExisting = () => {
    setIsGatewayOpen(false);
    onNavigate('page02');
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (profession.trim() === '/admin') {
      onOpenAdmin();
      setIsGatewayOpen(false);
      return;
    }

    if (onCreateProfile) {
      onCreateProfile({
        name: name.trim() || 'Explorer',
        educationBoard,
        grade,
      });
      setIsGatewayOpen(false);
      return;
    }

    onUpdateProfile({
      name: name.trim() || 'Explorer',
      age: parseInt(age, 10) || 18,
      profession: `${educationBoard} • ${grade}`,
      targetHours: Math.max(0, Math.min(24, targetHours)),
      targetMinutes: Math.max(0, Math.min(59, targetMinutes)),
      dailyReminderTime: reminderTime,
      notificationsEnabled: enableAlerts,
    });

    setIsGatewayOpen(false);
    onNavigate('page02');
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
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-transparent text-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-emerald-100/80 px-4 sm:px-8 py-3 flex items-center justify-between"
      >
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('page01')}
        >
          <SkillpraxLogo size="xs" showText={false} />
          <span className="font-heading font-extrabold text-xl tracking-tight transition-transform duration-200 group-hover:scale-105">
            <span className="text-[#0091FF]">Skill</span>
            <span className="text-[#F59E0B]">prax</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-mono font-bold text-amber-900">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-flame" />
            <span>{userProfile.flameStreak}d STREAK</span>
          </div>

          <button
            onClick={() => onNavigate('page02')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-120" />
            <span>Learner Profile</span>
          </button>

          <button
            onClick={() => handleOpenGetStarted('existing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <LogIn className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Log In</span>
          </button>

          <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-600/20">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold tracking-wide shadow-md btn-tactile btn-shimmer cursor-pointer uppercase flex items-center gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-10 sm:py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-emerald-500/10 mb-6 animate-pulse-glow"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>✦ Dynamic Socratic Curriculum • Resource Bounded</span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.65, opacity: 0, filter: 'blur(16px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-2 sm:my-4"
        >
          <SkillpraxLogo size="hero" showText={true} glow={true} animate={true} />
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-2xl mt-4"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            Skillprax: Autonomous Mastery Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Dynamic competency roadmaps synthesized with active graph visualization, strict 2-video YouTube quotas, verified canonical documentation, and diagnostic Socratic gates.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <div className="relative p-[2.5px] rounded-2xl conic-beam animate-pulse-glow">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[14px] font-heading font-extrabold text-base sm:text-lg tracking-wider shadow-2xl btn-tactile btn-shimmer cursor-pointer uppercase flex items-center gap-3 active:scale-95 group"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('page03')}
            className="px-6 py-4 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-2xl font-heading font-semibold text-sm shadow-sm hover:shadow-md wobble-card cursor-pointer flex items-center gap-2.5 transition-all group active:scale-95"
          >
            <Compass className="w-4 h-4 text-sky-600 transition-transform duration-300 group-hover:rotate-45" />
            <span>Explore Flowchart Roadmap</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-4xl w-full text-left"
        >
          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
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
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
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
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md wobble-card cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
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
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Skillprax Engine</span>
          <span>© 2026 Socratic Curriculum Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button
            onClick={() => handleOpenGetStarted('create')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Log In / Get Started
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page02')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Profile & Telemetry
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page03')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Flowchart Studio
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page04')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Evaluation Gate
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {isGatewayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200/90 ring-1 ring-black/5 my-6 max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsGatewayOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

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
                  Create a new learner profile or continue with an existing track
                </p>
              </div>

              <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-6 shadow-inner">
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
                  <span>Continue with Existing</span>
                </button>
              </div>

              {gatewayMode === 'create' && (
                <form onSubmit={handleCreateNewProfile} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Learner Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Explorer"
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Education Board
                      </label>
                      <select
                        value={educationBoard}
                        onChange={(e) => setEducationBoard(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
                      >
                        <option value="GSEB">GSEB (Gujarat Board)</option>
                        <option value="CBSE">CBSE (Central Board)</option>
                        <option value="General">General / Competitive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Grade / Class
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-slate-800"
                      >
                        <option value="Class 12">Class 12 (NCERT / Board)</option>
                        <option value="Class 11">Class 11</option>
                        <option value="College / Competitive">College / Competitive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-heading font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Profile & Launch Studio ➔</span>
                    </button>
                  </div>
                </form>
              )}

              {gatewayMode === 'existing' && (
                <div className="space-y-4 animate-fade-in">
                  {existingProfiles.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Existing Profile from Database:
                      </label>
                      {existingProfiles.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (onSelectProfile) onSelectProfile(p.id);
                            else {
                              localStorage.setItem('skillprax_active_profile_id', p.id);
                              onNavigate('page02');
                            }
                            setIsGatewayOpen(false);
                          }}
                          className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/90 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <h4 className="text-sm font-heading font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-xs text-emerald-700 font-medium mt-0.5">
                              {p.educationBoard || 'GSEB'} • {p.grade || 'Class 12'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full">
                              <Flame className="w-3 h-3 text-amber-500 fill-amber-400 animate-flame" />
                              {p.streakDays ?? 7}d
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          ACTIVE PROFILE FOUND
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {userProfile.id}</span>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative">
                          <img
                            src={userProfile.avatarUrl}
                            alt={userProfile.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>

                        <div>
                          <h3 className="text-base font-heading font-bold text-slate-900">
                            {userProfile.name}
                          </h3>
                          <p className="text-xs text-emerald-700 font-medium">
                            {userProfile.profession}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-medium">
                            <span className="flex items-center gap-1 text-amber-600">
                              <Flame className="w-3.5 h-3.5 animate-flame" />
                              {userProfile.flameStreak} days streak
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-sky-600">
                              <Shield className="w-3.5 h-3.5" />
                              {userProfile.activeFreezes} Freeze
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResumeExisting}
                        className="w-full mt-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md btn-tactile cursor-pointer text-center"
                      >
                        Resume Active Profile ➔
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

