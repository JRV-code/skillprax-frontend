'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, Shield, Edit3, Plus, ArrowRight, Play, 
  Award, Settings, RefreshCw, Star, Trash2, Edit2, 
  Bell, Clock, Activity, CheckCircle2, AlertCircle, 
  Lock, Mail, User, Sparkles, Calendar, Check, Send,
  Apple, HeartPulse, Globe, MapPin, Compass, Brain,
  Target, Zap, Trophy, ChevronRight, X, ExternalLink
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { ProfileReviews } from '@/components/profile/ProfileReviews';
import { Navbar } from '@/components/common/Navbar';
import { GiveUpSkillFrictionModal } from '@/components/learning/GiveUpSkillFrictionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { DomainCategory, Review } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const target = Math.max(0, value || 0);
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let animationFrameId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(ease * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

function getMasteryRank(level: number = 1): { title: string; badgeClass: string } {
  if (level <= 1) return { title: 'Level 1: Foundational Explorer', badgeClass: 'text-sky-700 bg-sky-50 border-sky-200' };
  if (level <= 3) return { title: `Level ${level}: Tactical Practitioner`, badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  if (level <= 5) return { title: `Level ${level}: Advanced Strategist`, badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  return { title: `Level ${level}: Elite Polymath`, badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' };
}

export default function ProfileHubPage() {
  const router = useRouter();
  const { user: authUser, token: authToken, updateUser } = useAuthStore();
  const [activeProfileId, setActiveProfileId] = useState<string>('default-profile');
  
  // Profile & Telemetry Data
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // Categorized Skills Trajectories
  const [pendingCognitive, setPendingCognitive] = useState<any[]>([]);
  const [completedCognitive, setCompletedCognitive] = useState<any[]>([]);
  const [pendingPhysical, setPendingPhysical] = useState<any[]>([]);
  const [completedPhysical, setCompletedPhysical] = useState<any[]>([]);

  // Friction Modal State
  const [giveUpTarget, setGiveUpTarget] = useState<{
    id: string;
    title: string;
    subGenre?: string;
    currentStepIndex: number;
    totalSteps: number;
    completedStepsCount: number;
    currentStepTitle: string;
    isPhysical?: boolean;
  } | null>(null);

  // Tabs: 'command' (main hub), 'schedule', 'reviews'
  const [activeTab, setActiveTab] = useState<'command' | 'schedule' | 'reviews'>('command');

  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollModalProps, setEnrollModalProps] = useState<{
    restrictToDomain?: DomainCategory;
    excludeSports?: boolean;
    initialTitle?: string;
    initialDomain?: string;
    initialSubGenre?: string;
  }>({});
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Editable Smart Calibration Form State
  const [calibrationForm, setCalibrationForm] = useState({
    city: 'Ahmedabad',
    state: 'Gujarat',
    ageCategory: 'Open',
    dietaryPreference: 'Vegetarian',
    healthConditions: 'None',
    preferredLanguage: 'en',
  });
  const [savingCalibration, setSavingCalibration] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [calibrationToast, setCalibrationToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Daily Schedule & Reminders
  const [scheduleTime, setScheduleTime] = useState('20:30');
  const [goalHours, setGoalHours] = useState(1);
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Reviews
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: '',
    skillTag: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [editingReviewRating, setEditingReviewRating] = useState(5);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';
    setActiveProfileId(storedId);
    loadProfileHubData(storedId);
    loadUserReviews(storedId);
  }, []);

  async function loadProfileHubData(profId: string) {
    try {
      setLoading(true);
      const token = localStorage.getItem('skillprax_auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Fetch unified profile with live quiz telemetry and categorized workspaces
      const email = authUser?.email || '';
      const profileUrl = `${API_BASE}/api/profile?profileId=${encodeURIComponent(profId)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
      
      const [profileRes, telemetryRes] = await Promise.all([
        fetch(profileUrl, { headers }).catch(() => null),
        fetch(`/api/profiles/${profId}/telemetry`).catch(() => null)
      ]);

      if (profileRes && profileRes.ok) {
        const pData = await profileRes.json();
        const prof = pData.profile || pData.user;
        setProfileData(prof);
        setPendingCognitive(pData.pendingCognitiveSkills || []);
        setCompletedCognitive(pData.completedCognitiveSkills || []);
        setPendingPhysical(pData.pendingPhysicalSkills || []);
        setCompletedPhysical(pData.completedPhysicalSkills || []);

        if (prof) {
          setCalibrationForm({
            city: prof.city || 'Ahmedabad',
            state: prof.state || 'Gujarat',
            ageCategory: prof.ageCategory || 'Open',
            dietaryPreference: prof.dietaryPreference || 'Vegetarian',
            healthConditions: prof.healthConditions || prof.medicalConditions || 'None',
            preferredLanguage: prof.preferredLanguage || 'en',
          });
          if (prof.alertNotification || prof.reminderTime) {
            setScheduleTime(prof.alertNotification || prof.reminderTime);
          }
          if (prof.targetHours !== undefined) setGoalHours(prof.targetHours);
          if (prof.targetMinutes !== undefined) setGoalMinutes(prof.targetMinutes);
          if (prof.remindersEnabled !== undefined) setRemindersEnabled(prof.remindersEnabled);
        }
      }

      if (telemetryRes && telemetryRes.ok) {
        const tData = await telemetryRes.json();
        setTelemetry(tData);
      }
    } catch (err) {
      console.error('[ProfileHub] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserReviews(profileId: string) {
    try {
      setLoadingReviews(true);
      const res = await fetch(`/api/reviews/user/${profileId}`);
      if (res.ok) {
        const data = await res.json();
        setUserReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load user reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }

  // Handle Save Calibration & Health Settings
  const handleSaveCalibration = async () => {
    try {
      setSavingCalibration(true);
      setCalibrationToast(null);

      const token = localStorage.getItem('skillprax_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          profileId: activeProfileId,
          email: profileData?.email || authUser?.email,
          ...calibrationForm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.profile || data.user;
        if (updated) {
          setProfileData(updated);
          updateUser(updated);
        }
        setCalibrationToast({
          type: 'success',
          message: 'Personalization & Health Safety settings saved successfully!',
        });
        setTimeout(() => setCalibrationToast(null), 4000);
      } else {
        throw new Error('Failed to update calibration settings');
      }
    } catch (err: any) {
      setCalibrationToast({
        type: 'error',
        message: err.message || 'Failed to persist settings.',
      });
    } finally {
      setSavingCalibration(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const detectedCity = data.address?.city || data.address?.town || data.address?.county || 'Ahmedabad';
            const detectedState = data.address?.state || 'Gujarat';
            setCalibrationForm(prev => ({
              ...prev,
              city: detectedCity,
              state: detectedState,
            }));
            setCalibrationToast({
              type: 'success',
              message: `Detected: ${detectedCity}, ${detectedState}. Click "Save Settings" to persist.`,
            });
            setTimeout(() => setCalibrationToast(null), 5000);
          }
        } catch (_) {
          setCalibrationForm(prev => ({ ...prev, city: 'Ahmedabad', state: 'Gujarat' }));
        } finally {
          setGeoLocating(false);
        }
      },
      () => setGeoLocating(false),
      { timeout: 7000 }
    );
  };

  const handleSaveSchedule = async () => {
    if (!activeProfileId) return;
    try {
      setSavingSchedule(true);
      setScheduleNotice(null);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      const [resProfile, resUser] = await Promise.all([
        fetch(`/api/profiles/${activeProfileId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertNotification: scheduleTime,
            targetHours: goalHours,
            targetMinutes: goalMinutes,
            remindersEnabled,
          }),
        }),
        fetch('/api/user/reminder-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: activeProfileId,
            email: profileData?.email,
            dailyReminderEnabled: remindersEnabled,
            preferredReminderTime: scheduleTime,
            timezone: userTimezone,
          }),
        }),
      ]);

      if (!resProfile.ok && !resUser.ok) throw new Error('Failed to update schedule');
      await loadProfileHubData(activeProfileId);
      setScheduleNotice({
        type: 'success',
        message: 'Daily study schedule & reminder preferences saved successfully!',
      });
    } catch (err: any) {
      setScheduleNotice({
        type: 'error',
        message: err.message || 'Failed to update schedule settings.',
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!activeProfileId) return;
    try {
      setSendingTestEmail(true);
      setScheduleNotice(null);
      const res = await fetch(`/api/reminders/send-test/${activeProfileId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger test reminder email.');
      setScheduleNotice({
        type: 'success',
        message: `Test reminder dispatched to ${profileData?.email || 'your email'}! Check your inbox.`,
      });
    } catch (err: any) {
      setScheduleNotice({
        type: 'error',
        message: err.message || 'Failed to trigger reminder email.',
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId || !reviewForm.reviewText.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewSuccessMessage(null);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfileId,
          userName: profileData?.name || 'Verified Learner',
          avatarUrl: profileData?.avatarUrl,
          rating: reviewForm.rating,
          reviewText: reviewForm.reviewText.trim(),
          skillTag: reviewForm.skillTag.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setReviewForm({ rating: 5, reviewText: '', skillTag: '' });
      setReviewSuccessMessage('Thank you! Your verified review is published on the public wall.');
      await loadUserReviews(activeProfileId);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReviewSave = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: editingReviewText.trim(),
          rating: editingReviewRating,
        }),
      });
      if (res.ok) {
        setEditingReviewId(null);
        if (activeProfileId) await loadUserReviews(activeProfileId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok && activeProfileId) {
        await loadUserReviews(activeProfileId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Loading Profile Command Center...
          </span>
        </div>
      </div>
    );
  }

  // XP, Level & Accuracy Calculations
  const currentLevel = profileData.level || Math.floor((profileData.totalXp || 0) / 300) + 1;
  const currentTotalXp = profileData.totalXp || profileData.xp || 0;
  const xpInCurrentLevel = currentTotalXp % 300;
  const xpNeededForNext = 300 - xpInCurrentLevel;
  const expProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 300) * 100));
  const masteryRank = getMasteryRank(currentLevel);

  const streakDays = profileData.currentStreak || profileData.streakDays || 1;
  const longestStreak = profileData.longestStreak || streakDays;
  const quizzesTaken = profileData.totalQuizzesTaken || 0;
  const questionsCorrect = profileData.totalQuestionsCorrect || 0;
  const questionsAttempted = profileData.totalQuestionsAttempted || 0;
  const accuracyPercent = profileData.avgQuizAccuracy !== undefined && profileData.avgQuizAccuracy !== null
    ? profileData.avgQuizAccuracy
    : (questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0);

  // SVG accuracy ring math
  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - ((Math.min(100, Math.max(0, accuracyPercent)) / 100) * ringCircumference);

  const totalMasteredCount = completedCognitive.length + completedPhysical.length;
  const totalInProgressCount = pendingCognitive.length + pendingPhysical.length;

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />
      <Navbar />

      {/* TOP COMMAND CENTER HEADER */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
              PROFILE HUB
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Command Center & Real-Time Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            href="/sports"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Sports Hub</span>
          </Link>
          <button
            onClick={() => {
              setEnrollModalProps({ excludeSports: false });
              setShowEnrollModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Enroll Skill</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 relative z-10">

        {/* ===========================================================================
            HEADER: IDENTITY, LEVEL & ANIMATED EXP BAR (MODULE 2.2 ITEM 1)
           =========================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative group">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-md border-2 border-white">
                  {profileData.name ? profileData.name.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 shadow-sm transition-colors cursor-pointer"
                  title="Edit Avatar & Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profileData.name}
                  </h1>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${masteryRank.badgeClass}`}>
                    {masteryRank.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-mono text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    {profileData.email || 'account@skillprax.internal'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md font-semibold text-slate-700">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    📍 {profileData.city || 'Ahmedabad'}, {profileData.state || 'Gujarat'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold border border-amber-200/60">
                    <Apple className="w-3 h-3 text-amber-600" />
                    {profileData.dietaryPreference || 'Vegetarian'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold border border-emerald-200/60">
                    <HeartPulse className="w-3 h-3 text-emerald-600" />
                    🩺 Health Filter: {profileData.healthConditions || profileData.medicalConditions || 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* ANIMATED EXP PROGRESS BAR */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-amber-700 font-extrabold flex items-center gap-1">
                  ⚡ LEVEL {currentLevel}
                </span>
                <span className="text-slate-400">➔</span>
                <span className="text-slate-600">LEVEL {currentLevel + 1}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {xpNeededForNext} XP to next level
              </span>
            </div>

            <div className="w-full h-3.5 bg-slate-200/70 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expProgressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#0284C7] via-indigo-500 to-emerald-500 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>{currentTotalXp} Total XP Earned</span>
              <span>{expProgressPercent}% Complete</span>
            </div>
          </div>

          {/* TAB BAR NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-slate-100 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('command')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'command'
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Command Center & Trajectories</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Schedule & Reminders</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Rate App & Feedback</span>
              {userReviews.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-amber-100 rounded-full text-amber-800">
                  {userReviews.length}
                </span>
              )}
            </button>
          </div>
        </motion.section>

        {/* ===========================================================================
            TAB 1: COMMAND CENTER & ACTIVE TRAJECTORIES
           =========================================================================== */}
        {activeTab === 'command' && (
          <div className="space-y-6">

            {/* 4-CARD LIVE TELEMETRY STRIP (MODULE 2.2 ITEM 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Active Streak */}
              <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ACTIVE STREAK
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-4 h-4 fill-white" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    <AnimatedCounter value={streakDays} /> Day Streak
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Best Record: <strong className="text-slate-700">{longestStreak} Days</strong>
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>🔥 Momentum Active</span>
                  <span className="font-mono text-slate-400">Daily Goal</span>
                </div>
              </div>

              {/* Card 2: Quiz Question Accuracy */}
              <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    QUIZ ACCURACY
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      <AnimatedCounter value={accuracyPercent} />%
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {questionsCorrect} / {questionsAttempted} right across {quizzesTaken} tests
                    </p>
                  </div>
                  {/* Visual SVG Accuracy Ring */}
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r={ringRadius}
                        stroke="#e2e8f0"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={ringRadius}
                        stroke="#0284C7"
                        strokeWidth="4"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black font-mono text-slate-700">
                      {accuracyPercent}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-sky-700 font-bold">
                  <span>🎯 70% Pass Threshold</span>
                  <span className="font-mono text-slate-400">Live</span>
                </div>
              </div>

              {/* Card 3: Total Experience */}
              <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    EXPERIENCE
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    <AnimatedCounter value={currentTotalXp} /> XP
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Level <strong className="text-indigo-700">{currentLevel}</strong> • {xpInCurrentLevel}/300 tier XP
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-700 font-bold">
                  <span>⚡ Socratic Boost Active</span>
                  <span className="font-mono text-slate-400">300 XP/Lvl</span>
                </div>
              </div>

              {/* Card 4: Skills Mastered */}
              <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    SKILLS MASTERED
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    <AnimatedCounter value={totalMasteredCount} /> Completed
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong className="text-emerald-700">{totalInProgressCount}</strong> Active Trajectories
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>🏆 Verified Vault</span>
                  <span className="font-mono text-slate-400">100% Cleared</span>
                </div>
              </div>
            </div>

            {/* ===========================================================================
                PENDING SKILLS & PHYSICAL SKILLS (MODULE 2.2 ITEM 3)
               =========================================================================== */}
            <div className="space-y-6">
              
              {/* 3A. PENDING COGNITIVE SKILLS (/skills) */}
              <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        🧠 Active Cognitive Skills (/skills)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Workspaces in progress with diagnostic evaluations and chapter tutorials.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    {pendingCognitive.length} In Progress
                  </span>
                </div>

                {pendingCognitive.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      No pending cognitive skills right now. Ready to explore a new horizon?
                    </p>
                    <button
                      onClick={() => {
                        setEnrollModalProps({ excludeSports: true });
                        setShowEnrollModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold shadow-xs hover:bg-sky-600 transition-all cursor-pointer"
                    >
                      + Enroll Cognitive Trajectory
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingCognitive.map((skill) => (
                      <motion.div
                        key={skill.id}
                        whileHover={{ y: -3 }}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              {skill.domainCategory || 'Cognitive Studio'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              Milestone {skill.completedSteps + 1} of {skill.totalSteps}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                            {skill.title || skill.skillName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {skill.subGenre || 'Core Competency'}
                          </p>

                          <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                              <span>Next: {skill.currentStepTitle || `Milestone ${skill.completedSteps + 1}`}</span>
                              <span>{skill.progressPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                              <div
                                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                                style={{ width: `${skill.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                          <button
                            onClick={() => {
                              setGiveUpTarget({
                                id: skill.id,
                                title: skill.title || skill.skillName,
                                subGenre: skill.subGenre,
                                currentStepIndex: skill.currentStepIndex || (skill.completedSteps + 1),
                                totalSteps: skill.totalSteps || 5,
                                completedStepsCount: skill.completedSteps || 0,
                                currentStepTitle: skill.currentStepTitle || 'Current Milestone',
                                isPhysical: false,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Give Up</span>
                          </button>

                          <button
                            onClick={() => router.push(`/workspace/${skill.id}`)}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <span>Resume Studio ➔</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3B. PENDING PHYSICAL SKILLS (/sports) */}
              <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        🏅 Active Physical & Sports Skills (/sports)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Athletic conditioning, technical drills, and yogasanas with health safety filters.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {pendingPhysical.length} Active Training
                  </span>
                </div>

                {pendingPhysical.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <Activity className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      No active sports training right now. Enroll in a sport to unlock kinetic conditioning!
                    </p>
                    <Link
                      href="/sports"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Explore Sports Hub</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingPhysical.map((sport) => (
                      <motion.div
                        key={sport.id}
                        whileHover={{ y: -3 }}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Athletics & Kinetic
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              Phase {sport.completedSteps + 1} of {sport.totalSteps}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                            {sport.title || sport.skillName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {sport.subGenre || 'Physical Conditioning & Technique'}
                          </p>

                          <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                              <span>Current: {sport.currentStepTitle || `Phase ${sport.completedSteps + 1}`}</span>
                              <span>{sport.progressPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                                style={{ width: `${sport.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                          <button
                            onClick={() => {
                              setGiveUpTarget({
                                id: sport.id,
                                title: sport.title || sport.skillName,
                                subGenre: sport.subGenre,
                                currentStepIndex: sport.currentStepIndex || (sport.completedSteps + 1),
                                totalSteps: sport.totalSteps || 5,
                                completedStepsCount: sport.completedSteps || 0,
                                currentStepTitle: sport.currentStepTitle || 'Current Milestone',
                                isPhysical: true,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Give Up</span>
                          </button>

                          <button
                            onClick={() => router.push(`/sports/workspace/${sport.id}`)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <span>Resume Training ➔</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===========================================================================
                COMPLETED SKILLS & PHYSICAL SKILLS: MASTERY VAULT (MODULE 2.2 ITEM 4)
               =========================================================================== */}
            <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      🏆 Mastery Vault & Verified Credentials
                    </h2>
                    <p className="text-xs text-slate-500">
                      100% completed cognitive skills and physical disciplines verified on SKILL-TRACK.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {totalMasteredCount} Mastered Credentials
                </span>
              </div>

              {totalMasteredCount === 0 ? (
                <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300">
                  <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    No mastered skills in the vault yet. Pass 100% of milestones in any workspace to earn a verified credential!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...completedCognitive, ...completedPhysical].map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-b from-white to-amber-50/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.isPhysical ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                          }`}>
                            {item.isPhysical ? 'Physical Credential' : 'Cognitive Credential'}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {item.title || item.skillName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.subGenre} • {item.totalSteps} Milestones Verified
                        </p>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          100% Cleared
                        </span>
                        <button
                          onClick={() => router.push(item.isPhysical ? `/sports/workspace/${item.id}` : `/workspace/${item.id}`)}
                          className="text-xs font-bold text-slate-800 hover:text-sky-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review ➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===========================================================================
                EDITABLE SMART CALIBRATION & HEALTH SETTINGS (MODULE 2.2 ITEM 5)
               =========================================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      ⚙️ Smart Calibration & Health Safety Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Personalize your location, dietary fuel, language, and drill safety restrictions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={geoLocating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Compass className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                  <span>{geoLocating ? 'Detecting GPS...' : 'Auto-Detect Location'}</span>
                </button>
              </div>

              {calibrationToast && (
                <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                  calibrationToast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {calibrationToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{calibrationToast.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City (For Local Sports Clubs & Shops)
                  </label>
                  <input
                    type="text"
                    value={calibrationForm.city}
                    onChange={(e) => setCalibrationForm(prev => ({ ...prev, city: e.target.value }))}
                    list="profile-city-list"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                    placeholder="e.g. Ahmedabad"
                  />
                  <datalist id="profile-city-list">
                    {['Ahmedabad', 'Gandhinagar', 'Surat', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur'].map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State / Province
                  </label>
                  <select
                    value={calibrationForm.state}
                    onChange={(e) => setCalibrationForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#0284C7] focus:ring-2 focus:ring-sky-100 text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                  >
                    {[
                      'Gujarat', 'Maharashtra', 'Karnataka', 'Delhi NCR', 'Tamil Nadu', 
                      'Telangana', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 
                      'Punjab', 'Madhya Pradesh', 'Haryana', 'Goa', 'Andhra Pradesh'
                    ].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Age Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Athletic Age Division
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['U-14', 'U-17', 'U-19', 'Open'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCalibrationForm(prev => ({ ...prev, ageCategory: cat }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          calibrationForm.ageCategory === cat
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dietary Preference (Nutrition Engine)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'High-Protein'].map(diet => (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => setCalibrationForm(prev => ({ ...prev, dietaryPreference: diet }))}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border truncate transition-all cursor-pointer ${
                          calibrationForm.dietaryPreference === diet
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health & Safety Filter */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Health & Injury Conditions (Strict Physical Drill Safety Filter)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['None', 'Knee Pain', 'Lower Back Issue', 'Shoulder/Wrist Pain', 'Ankle Issue', 'Asthma'].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setCalibrationForm(prev => ({ ...prev, healthConditions: cond }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          calibrationForm.healthConditions === cond
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={calibrationForm.healthConditions}
                    onChange={(e) => setCalibrationForm(prev => ({ ...prev, healthConditions: e.target.value }))}
                    placeholder="Or type custom injury to avoid (e.g., Hamstring strain, Rotator cuff)..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:border-rose-500 transition-all"
                  />
                </div>

                {/* Preferred Language */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={calibrationForm.preferredLanguage}
                    onChange={(e) => setCalibrationForm(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#0284C7] text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'Hindi (हिंदी)' },
                      { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
                      { code: 'mr', label: 'Marathi (मराठी)' },
                      { code: 'ta', label: 'Tamil (தமிழ்)' },
                      { code: 'te', label: 'Telugu (తెలుగు)' },
                      { code: 'fr', label: 'French (Français)' },
                      { code: 'es', label: 'Spanish (Español)' },
                      { code: 'de', label: 'German (Deutsch)' },
                    ].map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCalibration}
                  disabled={savingCalibration}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {savingCalibration ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ===========================================================================
            TAB 2: DAILY SCHEDULE & REMINDERS
           =========================================================================== */}
        {activeTab === 'schedule' && (
          <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-md">
                  CHRONO-CADENCE ENGINE
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Automated Study Alerts & Streak Preservation
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Daily Learning Schedule & Automated Email Reminders
              </h3>
              <p className="text-xs text-slate-500">
                Configure your target diurnal learning window and receive personalized streak preservation reminders.
              </p>
            </div>

            {scheduleNotice && (
              <div
                className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
                  scheduleNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {scheduleNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{scheduleNotice.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Preferred Daily Learning Time</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  Your daily reminder will trigger at this hour matching your local timezone.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Daily Goal Duration</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Hours</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={goalHours}
                      onChange={(e) => setGoalHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Minutes</label>
                    <input
                      type="number"
                      min={0}
                      max={55}
                      step={5}
                      value={goalMinutes}
                      onChange={(e) => setGoalMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target: {goalHours}h {goalMinutes}m every 24-hour cycle.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Automated Email Notifications
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send daily notifications to <span className="font-mono text-slate-700 font-semibold">{profileData.email || 'your email'}</span> with streak alerts.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                {savingSchedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Schedule Settings</span>
              </button>

              <button
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail || !profileData.email}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test Reminder Email Now</span>
              </button>
            </div>
          </div>
        )}

        {/* ===========================================================================
            TAB 3: RATE APP & FEEDBACK
           =========================================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">
                    COMMUNITY REPUTATION
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Transparent Learner Peer Evaluations
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Rate App & Share Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Your review will be verified and displayed on the public landing page to inspire future learners.
                </p>
              </div>

              {reviewSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Overall Experience Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-all ${
                            star <= reviewForm.rating
                              ? 'text-amber-400 fill-amber-400 scale-110'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-2">
                      {reviewForm.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Track / Specialization Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewForm.skillTag}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, skillTag: e.target.value }))}
                    placeholder="e.g. Cognitive Systems, Tennis Mastery, Sprint Mechanics"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Review & Experience Details
                  </label>
                  <textarea
                    rows={4}
                    value={reviewForm.reviewText}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewText: e.target.value }))}
                    placeholder="Describe how the milestone progression, video resources, or Socratic evaluations impacted your mastery..."
                    className="w-full p-4 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.reviewText.trim()}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {submittingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 fill-white" />}
                  <span>Publish Verified Review</span>
                </button>
              </form>
            </div>

            {/* User's Reviews List */}
            <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Reviews</h3>
                  <p className="text-xs text-slate-400">Manage or revise your existing feedback</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {userReviews.length} {userReviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              {loadingReviews ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Loading reviews...</span>
                </div>
              ) : userReviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  You haven't written any reviews yet. Share your experience using the review form above.
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= (editingReviewId === rev.id ? editingReviewRating : rev.rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.skillTag && (
                            <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {rev.skillTag}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => {
                              if (editingReviewId === rev.id) {
                                setEditingReviewId(null);
                              } else {
                                setEditingReviewId(rev.id);
                                setEditingReviewText(rev.reviewText);
                                setEditingReviewRating(rev.rating);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                            title="Edit Review"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {editingReviewId === rev.id ? (
                        <div className="space-y-3 pt-2">
                          <textarea
                            rows={3}
                            value={editingReviewText}
                            onChange={(e) => setEditingReviewText(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReviewSave(rev.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          "{rev.reviewText}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM SECTION: COMMUNITY REVIEWS WALL */}
        <ProfileReviews
          userId={activeProfileId || 'default-profile'}
          userName={profileData.name}
          userAvatar={profileData.avatarUrl}
          enrolledSkills={[...pendingCognitive, ...completedCognitive, ...pendingPhysical, ...completedPhysical]}
        />
      </main>

      {/* ENROLL MODAL */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setEnrollModalProps({});
        }}
        initialTitle={enrollModalProps.initialTitle}
        initialDomain={enrollModalProps.initialDomain}
        initialSubGenre={enrollModalProps.initialSubGenre}
        restrictToDomain={enrollModalProps.restrictToDomain}
        excludeSports={enrollModalProps.excludeSports}
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
          setEnrollModalProps({});
          if (newTrack?.id) {
            const isSport = (newTrack.domainCategory || '').toLowerCase() === 'athletics' ||
              ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'basketball'].some((s: string) => (newTrack.title || '').toLowerCase().includes(s));
            if (isSport) {
              router.push(`/sports?id=${newTrack.id}`);
            } else {
              router.push(`/skills?id=${newTrack.id}`);
            }
          }
        }}
      />

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userProfile={{
          ...profileData,
          age: profileData.age || 18,
        }}
        onUpdateProfile={async (updated) => {
          if (activeProfileId) {
            await loadProfileHubData(activeProfileId);
          }
        }}
      />

      {/* GIVE UP SKILL FRICTION MODAL */}
      {giveUpTarget && (
        <GiveUpSkillFrictionModal
          isOpen={Boolean(giveUpTarget)}
          onClose={() => setGiveUpTarget(null)}
          workspaceId={giveUpTarget.id}
          skillName={giveUpTarget.title}
          subGenre={giveUpTarget.subGenre}
          currentStepIndex={giveUpTarget.currentStepIndex}
          totalSteps={giveUpTarget.totalSteps}
          completedStepsCount={giveUpTarget.completedStepsCount}
          currentStepTitle={giveUpTarget.currentStepTitle}
          onDeleted={() => {
            setGiveUpTarget(null);
            loadProfileHubData(activeProfileId);
          }}
        />
      )}
    </div>
  );
}
