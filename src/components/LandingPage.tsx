'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LearnerAccountModal } from '@/components/LearnerAccountModal';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
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
    setIsGatewayOpen(true);
  };

  const handleLearnerSuccess = (profile: any) => {
    if (onSelectProfile && profile?.id) {
      onSelectProfile(profile.id);
    }
    if (profile) {
      onUpdateProfile({
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        profession: profile.profession,
        avatarUrl: profile.avatarUrl || profile.avatar_url,
      });
    }
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
          <BrandLogo size="md" showWordmark={true} />
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
          className="relative my-2 sm:my-4 flex items-center justify-center"
        >
          <BrandLogo size="lg" showWordmark={true} />
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

        {/* PUBLIC COMMUNITY REVIEWS & WALL OF LOVE */}
        <ReviewsSection reviews={publicReviews} loading={loadingReviews} />
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

      {/* LEARNER ACCOUNT MODAL (GOOGLE AUTH + ONBOARDING & LOOKUP) */}
      <LearnerAccountModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onSuccess={handleLearnerSuccess}
        initialMode={gatewayMode}
      />
    </div>
  );
};

export default LandingPage;
