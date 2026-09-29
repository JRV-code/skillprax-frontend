'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, SkillTrack, DayCadence } from '@/types';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import {
  Flame,
  Shield,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Edit2,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Award,
  Target,
  BarChart3,
  Sliders,
  Check,
  Trophy,
  ExternalLink,
  ShieldCheck,
  FlameKindling,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditProfileModal } from '@/components/EditProfileModal';

interface ProfileHubPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  tracks: SkillTrack[];
  onSelectTrack: (trackId: string) => void;
  onAddTrack: (track: SkillTrack) => void;
  onNavigate: (page: 'landing' | 'profile' | 'studio') => void;
  onOpenAdmin: () => void;
}

// Reusable Animated Number with Pop-In Physics
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}> = ({ value, duration = 850, decimals = 0, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums stat-counter-pop">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Mastery Badge Schema
interface MasteryBadge {
  id: string;
  title: string;
  category: string;
  rarity: 'Legendary' | 'Epic' | 'Rare';
  icon: string;
  description: string;
  unlocked: boolean;
  progress: string;
  accentColor: string;
}

const MASTER_BADGES: MasteryBadge[] = [
  {
    id: 'badge-1',
    title: 'Reaction Velocity',
    category: 'Chemistry & Kinematics',
    rarity: 'Legendary',
    icon: '⚡',
    description: 'Diagnosed and solved 20 Socratic questions in under 45 seconds each.',
    unlocked: true,
    progress: '20 / 20 Cleared',
    accentColor: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'badge-2',
    title: 'Zero Misconceptions',
    category: 'First-Principles Schema',
    rarity: 'Legendary',
    icon: '🛡️',
    description: 'Scored 100% on a diagnostic evaluation on first attempt without distractor traps.',
    unlocked: true,
    progress: '100% Accuracy',
    accentColor: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'badge-3',
    title: 'Relentless Momentum',
    category: 'Discipline',
    rarity: 'Epic',
    icon: '🔥',
    description: 'Sustained an unbroken 14-day study cadence without burning a freeze shield.',
    unlocked: true,
    progress: '14 Days Logged',
    accentColor: 'from-orange-400 to-red-500',
  },
  {
    id: 'badge-4',
    title: 'Axiom Architect',
    category: 'Curriculum Mastery',
    rarity: 'Epic',
    icon: '🧬',
    description: 'Unlocked 12 consecutive Assessable Concept Units across organic synthesis.',
    unlocked: true,
    progress: '12 / 12 ACUs',
    accentColor: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'badge-5',
    title: 'Deep Spaced Recall',
    category: 'Memory Engine',
    rarity: 'Rare',
    icon: '🎯',
    description: 'Re-verified fundamental axioms across 3 spaced repetition review cycles.',
    unlocked: false,
    progress: '2 / 3 Cycles',
    accentColor: 'from-sky-400 to-blue-500',
  },
];

interface MasteryTheme {
  tierLabel: string;
  isApex: boolean;
  cardBorder: string;
  cardGlow: string;
  cardShadow: string;
  stepBadgeStyle: string;
  progressBarGradient: string;
  percentageColor: string;
  actionTextColor: string;
  accentIcon: React.ReactNode;
}

const getMasteryTheme = (currentStep: number, totalSteps: number): MasteryTheme => {
  const isApex = currentStep >= 5 || (totalSteps > 0 && currentStep >= totalSteps);
  const isHigh = currentStep === 4;
  const isMid = currentStep === 2 || currentStep === 3;

  if (isApex) {
    return {
      tierLabel: 'APEX MASTER',
      isApex: true,
      cardBorder: 'border-amber-300 hover:border-amber-500',
      cardGlow: 'bg-gradient-to-bl from-amber-500/15 via-orange-500/8 to-transparent',
      cardShadow: 'hover:shadow-xl hover:shadow-amber-500/25',
      stepBadgeStyle:
        'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xs border border-amber-300/80',
      progressBarGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400',
      percentageColor: 'text-amber-700 font-extrabold',
      actionTextColor: 'text-amber-700 group-hover:text-amber-900',
      accentIcon: <Trophy className="w-3.5 h-3.5 text-amber-200" />,
    };
  }

  if (isHigh) {
    return {
      tierLabel: 'ADVANCED',
      isApex: false,
      cardBorder: 'border-indigo-200/90 hover:border-indigo-400',
      cardGlow: 'bg-gradient-to-bl from-indigo-500/8 to-transparent',
      cardShadow: 'hover:shadow-xl hover:shadow-indigo-500/15',
      stepBadgeStyle: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
      progressBarGradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400',
      percentageColor: 'text-indigo-700 font-bold',
      actionTextColor: 'text-indigo-700 group-hover:text-indigo-900',
      accentIcon: <Award className="w-3.5 h-3.5 text-indigo-600" />,
    };
  }

  if (isMid) {
    return {
      tierLabel: 'PROGRESSING',
      isApex: false,
      cardBorder: 'border-emerald-200/90 hover:border-emerald-400',
      cardGlow: 'bg-gradient-to-bl from-emerald-500/8 to-transparent',
      cardShadow: 'hover:shadow-xl hover:shadow-emerald-500/15',
      stepBadgeStyle: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      progressBarGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400',
      percentageColor: 'text-emerald-700 font-bold',
      actionTextColor: 'text-emerald-700 group-hover:text-emerald-900',
      accentIcon: <Zap className="w-3.5 h-3.5 text-emerald-600" />,
    };
  }

  return {
    tierLabel: 'FOUNDATION',
    isApex: false,
    cardBorder: 'border-slate-200/90 hover:border-sky-400',
    cardGlow: 'bg-gradient-to-bl from-sky-500/6 to-transparent',
    cardShadow: 'hover:shadow-xl hover:shadow-sky-500/15',
    stepBadgeStyle: 'bg-sky-50 text-sky-800 border border-sky-200',
    progressBarGradient: 'bg-gradient-to-r from-sky-500 via-teal-500 to-sky-400',
    percentageColor: 'text-sky-700 font-bold',
    actionTextColor: 'text-sky-700 group-hover:text-sky-900',
    accentIcon: <Target className="w-3.5 h-3.5 text-sky-600" />,
  };
};

export const ProfileHubPage: React.FC<ProfileHubPageProps> = ({
  userProfile,
  onUpdateProfile,
  tracks,
  onSelectTrack,
  onAddTrack,
  onNavigate,
  onOpenAdmin,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayCadence | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<MasteryBadge | null>(null);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackCategory, setNewTrackCategory] = useState<
    'Athletics' | 'Programming' | 'Chemistry' | 'Custom'
  >('Custom');
  const [newTrackTag, setNewTrackTag] = useState('');
  const [graphAnimationKey, setGraphAnimationKey] = useState(0);
  const [isSimulatingSession, setIsSimulatingSession] = useState(false);
  const [sessionToast, setSessionToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const totalHours = userProfile.studyCadence.reduce(
    (acc, d) => acc + d.hours + d.minutes / 60,
    0
  );
  const totalNodesVerified = userProfile.studyCadence.reduce(
    (acc, d) => acc + d.nodesCompleted,
    0
  );
  const averageDailyTime = (totalHours / 7).toFixed(1);
  const maxHours = Math.max(...userProfile.studyCadence.map((d) => d.hours + d.minutes / 60), 6);

  const userLevel = 14;
  const currentXP = 3420;
  const nextLevelXP = 4000;
  const xpPercent = Math.round((currentXP / nextLevelXP) * 100);

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const newTrack: SkillTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle.trim(),
      category: newTrackCategory,
      tags: newTrackTag.trim() ? [newTrackTag.trim(), 'Autonomous'] : ['Custom', 'Mastery'],
      currentStep: 1,
      totalSteps: 5,
      progressPercent: 20,
      colorScheme:
        newTrackCategory === 'Athletics'
          ? 'emerald'
          : newTrackCategory === 'Chemistry'
          ? 'amber'
          : 'blue',
      icon:
        newTrackCategory === 'Athletics'
          ? 'Zap'
          : newTrackCategory === 'Chemistry'
          ? 'FlaskConical'
          : 'Code',
      milestones: [
        {
          id: 'm1',
          stepNumber: 1,
          title: 'Axiomatic Foundations',
          description: 'Core concepts and boundary rules',
          status: 'active',
          acus: ['ACU-101: Baseline verification', 'ACU-102: Fundamental axioms'],
        },
        {
          id: 'm2',
          stepNumber: 2,
          title: 'Applied Synthesis',
          description: 'Executing core procedures',
          status: 'locked',
          acus: ['ACU-201: Procedural synthesis'],
        },
      ],
    };

    onAddTrack(newTrack);
    setNewTrackTitle('');
    setNewTrackTag('');
    setShowAddModal(false);
  };

  const handleLaunchTrack = (trackId: string) => {
    onSelectTrack(trackId);
    onNavigate('studio');
  };

  const handleSimulateSession = () => {
    if (isSimulatingSession) return;
    setIsSimulatingSession(true);

    setTimeout(() => {
      onUpdateProfile({
        flameStreak: userProfile.flameStreak + 1,
        activeDays: userProfile.activeDays + 1,
      });
      setGraphAnimationKey((prev) => prev + 1);
      setIsSimulatingSession(false);
      setSessionToast({
        show: true,
        message: `🔥 Momentum Ignited! +1 Day Streak (${userProfile.flameStreak + 1} Days) & +2.5h Volume logged!`,
      });

      setTimeout(() => {
        setSessionToast({ show: false, message: '' });
      }, 4000);
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent text-slate-800 pb-24 relative overflow-x-hidden page-landing-enter"
    >
      <AnimatePresence>
        {sessionToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-xs md:text-sm font-heading font-semibold text-emerald-100">
              {sessionToast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <SkillpraxLogo
            size="sm"
            animate={true}
            glow={true}
            onClick={() => onNavigate('landing')}
          />
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              HUB
            </span>
            <span className="text-xs md:text-sm font-heading font-semibold text-slate-700">
              Autonomous Mastery Profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('studio')}
            className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer btn-pro-max btn-shimmer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-md relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-emerald-300 wobble-cloud-card">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-emerald-500/10 via-sky-400/5 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl p-[2.5px] conic-beam shadow-lg shadow-emerald-500/20">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover rounded-[13px] bg-white relative z-10"
                    />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs text-white font-bold shadow-sm z-20"
                    title="Online & Synchronized"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer btn-pro-max shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
                  {userProfile.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {userProfile.profession}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">· {userProfile.age} yrs</span>
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-900">
                    <Trophy className="w-4 h-4 text-amber-500 trophy-bounce-active" />
                    <span>LEVEL {userLevel} · MASTER SCHOLAR</span>
                  </span>
                  <span className="font-mono text-emerald-700">{xpPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{currentXP} XP</span>
                  <span>{nextLevelXP} XP (Next Tier)</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 group-hover:border-emerald-200 transition-colors">
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    <AnimatedNumber value={userProfile.activeDays} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                    Active Days
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 group-hover:border-emerald-200 transition-colors">
                  <div className="text-xl font-bold text-emerald-600 font-mono">
                    <AnimatedNumber value={tracks.length} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                    Enrolled Tracks
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target: {userProfile.targetHours}h {userProfile.targetMinutes}m/day
              </span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {userProfile.dailyReminderTime} Alert
              </span>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-amber-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-amber-400 transition-all wobble-cloud-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              
              <div className="absolute top-8 right-10 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flame-ember-1" />
                <div className="w-2 h-2 rounded-full bg-orange-500 flame-ember-2" />
                <div className="w-1 h-1 rounded-full bg-red-400 flame-ember-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    MOMENTUM
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shadow-xs relative">
                    <Flame className="w-6 h-6 flame-active text-amber-500" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight stat-counter-pop">
                  <AnimatedNumber value={userProfile.flameStreak} suffix=" DAYS" />
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  Consecutive Daily Mastery Streak 🔥
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Active Multiplier:{' '}
                  <strong className="text-amber-800 font-bold">1.4x XP Boost</strong> on next Socratic check
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Today's Milestone: Active
                </span>
                <span className="font-mono">Alert: 20:30 PM</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sky-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-sky-400 transition-all wobble-cloud-card shield-shimmer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200">
                    PROTECTION
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs relative overflow-hidden">
                    <div className="absolute inset-0 rounded-xl bg-sky-400/30 shield-ripple-ring pointer-events-none" />
                    <div className="absolute inset-0 rounded-xl bg-sky-400/20 shield-ripple-ring pointer-events-none" style={{ animationDelay: '1.2s' }} />
                    <Shield className="w-6 h-6 shield-barrier-active text-sky-600 relative z-10" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight stat-counter-pop">
                  <AnimatedNumber value={userProfile.activeFreezes} /> / {userProfile.maxFreezes}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  Streak Freeze Safeguards 🧊
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Auto-deploys during involuntary pauses to shield your flame
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-sky-800 font-semibold">
                <span>Defense Forcefield: Armed</span>
                <span className="text-emerald-700 font-mono">100% Armed ✓</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-emerald-400 transition-all wobble-cloud-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                    CADENCE
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs relative overflow-hidden">
                    <div className="ecg-sweep-line" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <Activity className="w-6 h-6 cadence-rhythm-active text-emerald-600 relative z-10" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight stat-counter-pop">
                  <AnimatedNumber value={totalHours} decimals={1} suffix="h" />
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  7-Day Study Cadence Volume
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Average Pace:{' '}
                  <strong className="text-emerald-800">{averageDailyTime} hrs/day</strong> across domains
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                <span>Target: 14.0h/wk</span>
                <span className="font-mono text-emerald-700 font-bold">118% Goal Met ✓</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-indigo-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-indigo-400 transition-all wobble-cloud-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200">
                    COMPETENCY
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 award-star-1 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 award-star-2 pointer-events-none" />
                    <Award className="w-6 h-6 award-halo-active text-indigo-600 relative z-10" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight stat-counter-pop">
                  <AnimatedNumber value={totalNodesVerified} suffix=" ACUs" />
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  Verified Assessable Concept Units
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Diagnostic Pass Rate: <strong className="text-indigo-800">88.4% Accuracy</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-800 font-semibold">
                <span>Misconceptions Cleared: 18</span>
                <span className="text-emerald-700 font-mono">Mastery Intact</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden wobble-cloud-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 barchart-equalizer-active" />
                <h3 className="text-lg font-heading font-bold text-slate-900">
                  7-Day Study Cadence & Velocity Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staggered growth bars representing focused cognitive volume per diurnal cycle
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSimulateSession}
                disabled={isSimulatingSession}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs btn-pro-max"
              >
                {isSimulatingSession ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Logging Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Simulate Study Session</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setGraphAnimationKey((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs btn-pro-max"
                title="Re-animate graph curves"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-animate</span>
              </button>
            </div>
          </div>

          <div
            key={graphAnimationKey}
            className="h-56 flex items-end justify-between gap-2 md:gap-5 pt-8 pb-3 px-4 bg-slate-50/80 rounded-2xl border border-slate-100 relative"
          >
            <div className="absolute inset-x-4 top-8 border-b border-slate-200/50 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5.0 hrs</span>
            </div>
            <div className="absolute inset-x-4 top-24 border-b border-slate-200/50 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>3.0 hrs</span>
            </div>
            <div className="absolute inset-x-4 top-40 border-b border-slate-200/50 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0 hr</span>
            </div>

            {userProfile.studyCadence.map((day, idx) => {
              const totalDayHours = day.hours + day.minutes / 60;
              const heightPercent = Math.min((totalDayHours / maxHours) * 100, 100);
              const isToday = idx === 6;

              return (
                <div
                  key={day.day}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap shadow-xl pointer-events-none transform group-hover:-translate-y-1">
                    {day.hours}h {day.minutes}m · {day.focusArea}
                  </div>

                  <div
                    style={{
                      height: `${heightPercent}%`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                    className={`w-full max-w-[46px] rounded-xl relative overflow-hidden graph-bar-animated ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                        : 'bg-gradient-to-t from-slate-300 via-slate-300 to-slate-400 group-hover:from-emerald-400 group-hover:to-teal-300'
                    }`}
                  >
                    {isToday && (
                      <div className="absolute top-0 inset-x-0 h-2 bg-emerald-200 animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold mt-2.5 transition-colors ${
                      isToday ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {hoveredDay ? (
              <>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    {hoveredDay.day} Breakdown: {hoveredDay.hours}h {hoveredDay.minutes}m dedicated
                  </span>
                </div>
                <div className="text-emerald-800 font-medium">
                  Focus Domain: <strong>{hoveredDay.focusArea}</strong> ·{' '}
                  {hoveredDay.nodesCompleted} milestone units validated
                </div>
              </>
            ) : (
              <>
                <div className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Cadence Trend: Consistent pace across all 7 days</span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Hover individual bars to inspect assessable concept units
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Autonomous Mastery Badges</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cognitive milestones earned through rigorous Socratic verification
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              4 of 5 Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {MASTER_BADGES.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden wobble-cloud-card ${
                  badge.unlocked
                    ? 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-lg'
                    : 'bg-slate-50/70 border-dashed border-slate-300 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl transform group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        badge.rarity === 'Legendary'
                          ? 'bg-amber-100 text-amber-800'
                          : badge.rarity === 'Epic'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                  <h4 className="text-xs font-heading font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {badge.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={
                      badge.unlocked ? 'text-emerald-700 font-bold' : 'text-slate-400'
                    }
                  >
                    {badge.progress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Enrolled Skill Tracks</span>
              </h3>
              <p className="text-xs text-slate-500">
                Isolated roadmap node graphs, assessable units, and evaluation milestones
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer btn-pro-max"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enroll New Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const mastery = getMasteryTheme(track.currentStep, track.totalSteps);
              const activeMilestone =
                track.milestones?.find((m) => m.status === 'active') ||
                track.milestones?.[track.currentStep - 1] ||
                track.milestones?.[0];

              return (
                <div
                  key={track.id}
                  onClick={() => handleLaunchTrack(track.id)}
                  className={`bg-white rounded-3xl p-6 border ${mastery.cardBorder} shadow-sm ${mastery.cardShadow} transition-all duration-300 flex flex-col justify-between wobble-cloud-card relative overflow-hidden h-full group cursor-pointer`}
                >
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 ${mastery.cardGlow} rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform`}
                  />

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200/80">
                        {track.category}
                      </span>

                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${mastery.stepBadgeStyle}`}
                      >
                        {mastery.accentIcon}
                        <span>
                          STEP {track.currentStep}/{track.totalSteps}
                        </span>
                        <span className="text-[10px] opacity-80 hidden sm:inline">· {mastery.tierLabel}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-heading font-bold text-slate-900 group-hover:text-slate-950 transition-colors leading-snug line-clamp-2 min-h-[3.25rem]">
                      {track.title}
                    </h4>

                    <div className="flex flex-wrap gap-1.5 mt-3 min-h-[1.75rem]">
                      {track.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100/90 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="truncate">
                        Focus: <strong className="text-slate-700">{activeMilestone?.title || 'Synthesis Node'}</strong>
                      </span>
                      <span className="font-mono text-slate-400 shrink-0 ml-2">
                        {track.milestones?.length || track.totalSteps} Units
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Milestone Progress</span>
                        <span className={`font-mono ${mastery.percentageColor}`}>
                          {track.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full ${mastery.progressBarGradient} transition-all duration-500 shadow-xs`}
                          style={{ width: `${track.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-heading font-semibold ${mastery.actionTextColor}`}
                  >
                    <span>{mastery.isApex ? 'Inspect Apex Mastery' : 'Enter Workspace Studio'}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl relative"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl bg-slate-50 border border-slate-200 shadow-inner">
                  {selectedBadge.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    {selectedBadge.rarity} Badge
                  </span>
                  <h3 className="text-lg font-heading font-bold text-slate-900 mt-1">
                    {selectedBadge.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedBadge.description}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 text-xs font-mono font-semibold text-slate-700 flex justify-between">
                  <span>Requirement:</span>
                  <span className="text-emerald-700">{selectedBadge.progress}</span>
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors btn-pro-max"
                >
                  Close Badge Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl"
            >
              <h3 className="text-lg font-heading font-bold text-slate-900 mb-1">
                Enroll in New Skill Track
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Generate an autonomous roadmap node graph and study curriculum.
              </p>

              <form onSubmit={handleCreateTrack} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Skill or Curriculum Title
                  </label>
                  <input
                    type="text"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    placeholder="e.g. Organic Chemistry (Haloalkanes)"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category Domain
                  </label>
                  <select
                    value={newTrackCategory}
                    onChange={(e) =>
                      setNewTrackCategory(
                        e.target.value as 'Athletics' | 'Programming' | 'Chemistry' | 'Custom'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  >
                    <option value="Chemistry">Chemistry (NCERT / JEE / NEET)</option>
                    <option value="Athletics">Athletics & Kinematics</option>
                    <option value="Programming">Programming & Computer Science</option>
                    <option value="Custom">Custom Professional Domain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Sub-Tag
                  </label>
                  <input
                    type="text"
                    value={newTrackTag}
                    onChange={(e) => setNewTrackTag(e.target.value)}
                    placeholder="e.g. Reaction Mechanisms"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs btn-pro-max"
                  >
                    Create Roadmap
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
        onOpenAdmin={onOpenAdmin}
      />
    </motion.div>
  );
};

export default ProfileHubPage;
