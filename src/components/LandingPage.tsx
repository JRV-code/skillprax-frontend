'use client';

import React, { useState, useEffect } from 'react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { UserProfile, SkillTrack, Review } from '@/types';
import { LanguageSelector } from '@/components/LanguageSelector';
import {
  User,
  ArrowRight,
  Sparkles,
  LogIn,
  Zap,
  Flame,
  Compass,
  GitBranch,
  Award,
  X,
  UserPlus,
  Star,
  ShieldCheck,
  Search,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (page: 'landing' | 'profile' | 'studio' | 'page01' | 'page02' | 'page03' | 'page04') => void;
  tracks: SkillTrack[];
  onOpenAdmin?: () => void;
  existingProfiles?: any[];
  onSelectProfile?: (profileId: string) => void;
  onCreateProfile?: (data: { name: string; educationBoard?: string; grade?: string; profession?: string; age?: number }) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  tracks,
  onSelectProfile,
  onCreateProfile,
}) => {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayMode, setGatewayMode] = useState<'create' | 'existing'>('create');

  // New Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [profession, setProfession] = useState('Student');
  const [educationBoard, setEducationBoard] = useState('CBSE');
  const [grade, setGrade] = useState('Class 12');
  const [age, setAge] = useState((userProfile.age ?? 18).toString());

  // Existing Profile Secure Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Google Auth Notification
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Public Reviews Wall of Love
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchPublicReviews();
  }, []);

  async function fetchPublicReviews() {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/reviews/public');
      if (res.ok) {
        const data = await res.json();
        setPublicReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn('Failed to fetch public reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }

  const handleOpenGetStarted = (mode: 'create' | 'existing' = 'create') => {
    setGatewayMode(mode);
    setLookupError(null);
    setLookupResult(null);
    setIsGatewayOpen(true);
  };

  const handleLookupProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/profiles/lookup?query=${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.profile) {
        setLookupResult(data.profile);
      } else {
        setLookupError(data.error || 'No matching profile found.');
      }
    } catch (err: any) {
      setLookupError('Failed to query database. Check connection.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectFoundProfile = (profile: any) => {
    localStorage.setItem('skillprax_active_profile_id', profile.id);
    if (onSelectProfile) onSelectProfile(profile.id);
    setIsGatewayOpen(false);
    onNavigate('page02');
  };

  const handleGoogleAuth = () => {
    setGoogleAuthError(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleAuthError('Google OAuth Client ID is required. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.');
      return;
    }
    // Redirect to Google Identity OAuth flow
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile`;
    window.location.href = authUrl;
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (onCreateProfile) {
      onCreateProfile({
        name: name.trim() || 'Explorer',
        educationBoard: profession === 'Student' ? educationBoard : undefined,
        grade: profession === 'Student' ? grade : undefined,
        profession: profession === 'Student' ? `${educationBoard} ${grade} Student` : profession,
        age: parseInt(age, 10) || 18,
      });
      setIsGatewayOpen(false);
      return;
    }

    onUpdateProfile({
      name: name.trim() || 'Explorer',
      email: email.trim() || undefined,
      gender,
      age: parseInt(age, 10) || 18,
      profession: profession === 'Student' ? `${educationBoard} ${grade} Student` : profession,
    });

    setIsGatewayOpen(false);
    onNavigate('page02');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-transparent text-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Top Header Navigation */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between"
      >
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('page01')}
        >
          <SkillpraxLogo size="xs" showText={false} />
          <span className="font-heading font-black text-xl tracking-tight transition-transform duration-200 group-hover:scale-105">
            <span className="text-[#0284C7] font-black">SKILL-</span>
            <span className="text-[#F59E0B] font-black">TRACK</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Multi-Language Dropdown */}
          <LanguageSelector />

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-mono font-bold text-amber-900">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-flame" />
            <span>{userProfile.flameStreak || userProfile.streakDays || 1}d STREAK</span>
          </div>

          <button
            onClick={() => onNavigate('page02')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 group"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Learner Profile</span>
          </button>

          <button
            onClick={() => handleOpenGetStarted('existing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Lookup Profile</span>
          </button>

          <div className="relative p-[1.5px] rounded-xl conic-beam shadow-md shadow-emerald-600/20">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-bold tracking-wide shadow-md cursor-pointer uppercase flex items-center gap-1.5 active:scale-95"
            >
              <span>Get Started</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Body */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-10 sm:py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-emerald-500/10 mb-6"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>✦ Dynamic Socratic Curriculum • Resource Bounded</span>
        </motion.div>

        <motion.div
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
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
            Dynamic competency roadmaps synthesized with active graph visualization, strict in-app video media playback, and diagnostic Socratic gates.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <div className="relative p-[2.5px] rounded-2xl conic-beam">
            <button
              onClick={() => handleOpenGetStarted('create')}
              className="relative z-10 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[14px] font-heading font-extrabold text-base sm:text-lg tracking-wider shadow-2xl cursor-pointer uppercase flex items-center gap-3 active:scale-95 group"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('page03')}
            className="px-6 py-4 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-2xl font-heading font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2.5 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span>Explore Flowchart Roadmap</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 max-w-4xl w-full text-left"
        >
          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
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
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
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
              Consecutive daily streaks with earned 7-day milestone freeze safeguards.
            </p>
          </div>

          <div
            onClick={() => handleOpenGetStarted('create')}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/70 shadow-sm hover:shadow-md cursor-pointer group"
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
              Adaptive mastery evaluation checkpoints with 70% passing clearance thresholds.
            </p>
          </div>
        </motion.div>

        {/* PUBLIC COMMUNITY REVIEWS & WALL OF LOVE (MODULE 8) */}
        <section className="pt-16 max-w-5xl w-full text-left">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              Community Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-2">
              Wall of Love & Verified Mastery Reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Read how autonomous Socratic milestones helped learners master deep technical disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-2xl object-cover border border-emerald-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Skill: <strong className="text-slate-600">{rev.skillTag || 'General Track'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.reviewText}"
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">SKILL-TRACK Enterprise Engine</span>
          <span>© 2026 Autonomous Pedagogy</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button
            onClick={() => handleOpenGetStarted('create')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Create Profile
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page02')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Profile Hub
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('page03')}
            className="hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Workspace Studio
          </button>
        </div>
      </footer>

      {/* GATEWAY MODAL (NEW PROFILE OR SECURE SINGLE LOOKUP) */}
      <AnimatePresence>
        {isGatewayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-extrabold tracking-tight">
                    {gatewayMode === 'create' ? 'Create Learner Account' : 'Secure Account Lookup'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {gatewayMode === 'create'
                      ? 'Establish your identity to access personalized workspaces'
                      : 'Retrieve your account via registered name or email'}
                  </p>
                </div>
                <button
                  onClick={() => setIsGatewayOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => setGatewayMode('create')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                    gatewayMode === 'create'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  New Learner Profile
                </button>
                <button
                  onClick={() => setGatewayMode('existing')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                    gatewayMode === 'existing'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lookup Existing Profile
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Google OAuth Login Button */}
                <div className="space-y-2">
                  <button
                    onClick={handleGoogleAuth}
                    type="button"
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {googleAuthError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{googleAuthError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 my-3">
                    <div className="h-[1px] flex-1 bg-slate-200" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">or with profile credentials</span>
                    <div className="h-[1px] flex-1 bg-slate-200" />
                  </div>
                </div>

                {/* 1. CREATE NEW PROFILE MODE */}
                {gatewayMode === 'create' && (
                  <form onSubmit={handleCreateNewProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Manendra"
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@gmail.com"
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender (Mandatory) *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Profession (Mandatory) *
                        </label>
                        <select
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                          <option value="Student">Student</option>
                          <option value="Software Engineer">Software Engineer</option>
                          <option value="Healthcare Professional">Healthcare Professional</option>
                          <option value="Designer">Designer</option>
                          <option value="Educator">Educator</option>
                          <option value="Entrepreneur">Entrepreneur</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {profession === 'Student' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Board
                          </label>
                          <input
                            type="text"
                            value={educationBoard}
                            onChange={(e) => setEducationBoard(e.target.value)}
                            placeholder="CBSE"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Grade / Class
                          </label>
                          <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="Class 12"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Establish Profile & Launch Studio ➔</span>
                    </button>
                  </form>
                )}

                {/* 2. SECURE SINGLE LOOKUP MODE (NO OPEN DUMP) */}
                {gatewayMode === 'existing' && (
                  <div className="space-y-4">
                    <form onSubmit={handleLookupProfile} className="space-y-3">
                      <label className="block text-xs font-semibold text-slate-700">
                        Enter Profile Name or Email:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lookupQuery}
                          onChange={(e) => setLookupQuery(e.target.value)}
                          placeholder="e.g. Manendra Patel or learner@gmail.com"
                          required
                          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <button
                          type="submit"
                          disabled={lookupLoading}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {lookupLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          <span>Lookup</span>
                        </button>
                      </div>
                    </form>

                    {lookupError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{lookupError}</span>
                      </div>
                    )}

                    {lookupResult && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                              {lookupResult.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{lookupResult.name}</h4>
                              <span className="text-[10px] text-slate-500">{lookupResult.profession}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              🔥 {lookupResult.streakDays || 1}d Streak
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectFoundProfile(lookupResult)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span>Launch Learning Studio with this Account ➔</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
