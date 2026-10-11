'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, Shield, Edit3, Plus, ArrowRight, Play, 
  Award, Settings, RefreshCw, Star, Trash2, Edit2, 
  Bell, Clock, Activity, CheckCircle2, AlertCircle, 
  Lock, Mail, User, Sparkles, Calendar, Check, Send
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { DomainCategory, Review } from '@/types';

function isProfileComplete(profile: any): boolean {
  if (!profile) return false;
  const hasName = Boolean(profile.name && String(profile.name).trim().length > 0);
  const hasEmail = Boolean(profile.email && String(profile.email).trim().length > 0);
  const hasGender = Boolean(profile.gender && String(profile.gender).trim().length > 0);
  const hasProfession = Boolean(profile.profession && String(profile.profession).trim().length > 0);
  return hasName && hasEmail && hasGender && hasProfession;
}

export default function ProfileHubPage() {
  const router = useRouter();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'trajectories' | 'analytics' | 'schedule' | 'reviews'>('trajectories');

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

  // Daily Schedule & Reminders
  const [scheduleTime, setScheduleTime] = useState('20:30');
  const [goalHours, setGoalHours] = useState(1);
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<any[]>([
    {
      domain: 'Engineering & Applied Technology',
      title: 'Full-Stack Distributed Systems',
      subGenre: 'Microservices & Event Sourcing',
      affinityScore: 94,
      rationale: 'Lateral Progression: Amplifies your core asynchronous logic with fault-tolerant distributed protocols.',
    },
    {
      domain: 'Formal Sciences & Mathematics',
      title: 'Applied Discrete Algorithms & Graph Theory',
      subGenre: 'Combinatorial Optimization',
      affinityScore: 89,
      rationale: 'Foundational Deepening: Strengthens graph traversal and algorithmic optimality proof techniques.',
    },
    {
      domain: 'Design & Visual Systems',
      title: 'Human-Computer Interaction Ergonomics',
      subGenre: 'Micro-Interaction Design',
      affinityScore: 86,
      rationale: 'Cross-Disciplinary Amplifier: Bridges engineering rigor with fluid responsive aesthetic architectures.',
    },
  ]);

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id');
    if (!storedId) {
      router.push('/');
      return;
    }
    setActiveProfileId(storedId);
    loadTelemetry(storedId);
    loadUserReviews(storedId);
  }, []);

  async function loadTelemetry(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (!res.ok) throw new Error('Telemetry retrieval failed');
      const data = await res.json();
      setTelemetry(data);

      if (data.profile) {
        if (data.profile.alertNotification) setScheduleTime(data.profile.alertNotification);
        if (data.profile.targetHours !== undefined) setGoalHours(data.profile.targetHours);
        if (data.profile.targetMinutes !== undefined) setGoalMinutes(data.profile.targetMinutes);
        if (data.profile.remindersEnabled !== undefined) setRemindersEnabled(data.profile.remindersEnabled);
      }

      try {
        const recRes = await fetch(`/api/profiles/${profileId}/recommendations`);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.recommendations && recData.recommendations.length > 0) {
            setRecommendations(recData.recommendations);
          }
        }
      } catch (_) {}
    } catch (err) {
      console.error(err);
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

  const handleUpdateProfile = async (updated: any) => {
    if (!activeProfileId) return;
    try {
      const res = await fetch(`/api/profiles/${activeProfileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await loadTelemetry(activeProfileId);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSaveSchedule = async () => {
    if (!activeProfileId) return;
    try {
      setSavingSchedule(true);
      setScheduleNotice(null);
      const res = await fetch(`/api/profiles/${activeProfileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertNotification: scheduleTime,
          targetHours: goalHours,
          targetMinutes: goalMinutes,
          remindersEnabled,
        }),
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      await loadTelemetry(activeProfileId);
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
      const res = await fetch(`/api/reminders/send-test/${activeProfileId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger test reminder email.');
      setScheduleNotice({
        type: 'success',
        message: `Test reminder dispatched to ${telemetry?.profile?.email || 'your email'}! Check your inbox.`,
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
          userName: telemetry?.profile?.name || 'Verified Learner',
          avatarUrl: telemetry?.profile?.avatarUrl,
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
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok && activeProfileId) {
        await loadUserReviews(activeProfileId);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Loading Learner Hub...
          </span>
        </div>
      </div>
    );
  }

  const { profile, xpTelemetry, cadenceTelemetry, competencyTelemetry, badges, enrolledWorkspaces = [] } = telemetry;
  const profileComplete = isProfileComplete(profile);

  // Separation: Skills vs. Sports
  const academicSkills = enrolledWorkspaces.filter(
    (w: any) => w.domainCategory !== 'Athletics' && w.domain !== 'Athletics'
  );
  const athleticSports = enrolledWorkspaces.filter(
    (w: any) => w.domainCategory === 'Athletics' || w.domain === 'Athletics'
  );

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />

      {/* TOP STATUS HEADER */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              PROFILE HUB
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Enterprise Pedagogy & Master Trajectory
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
          <Link
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            href="/workspace"
          >
            <span>Launch Workspace ➔</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6 relative z-10">
        
        {/* PROFILE COMPLETION LOCK ALERT (MODULE 3) */}
        {!profileComplete && (
          <div className="p-4 md:p-5 bg-amber-50/95 border border-amber-300 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">
                  Core Profile Demographics Incomplete
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Your Full Name, Gmail ID, Gender identity, and Profession are strictly required before full progression is granted in Workspace and Sports Hub.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Complete Demographics Now</span>
            </button>
          </div>
        )}

        {/* HERO DEMOGRAPHICS BANNER */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative group">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-md border-2 border-white">
                  {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm transition-colors cursor-pointer"
                  title="Change Avatar & Demographics"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.gender && (
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {profile.gender}
                    </span>
                  )}
                  {profileComplete ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Profile
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Incomplete
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  {profile.email ? (
                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      {profile.email}
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      Gmail ID not linked
                    </span>
                  )}
                  <span>•</span>
                  <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {profile.profession || `${profile.educationBoard || 'CBSE'} • ${profile.grade || 'Class 12'}`}
                  </span>
                  {profile.age && <span>• {profile.age} yrs</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  setEnrollModalProps({ excludeSports: false });
                  setShowEnrollModal(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Track</span>
              </button>
            </div>
          </div>

          {/* TAB BAR NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-slate-100 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('trajectories')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'trajectories'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>My Trajectories</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-100 rounded-full text-slate-600">
                {enrolledWorkspaces.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Learning Habits & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'border-emerald-600 text-emerald-700'
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
                  ? 'border-emerald-600 text-emerald-700'
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
        </div>

        {/* TAB 1: MY TRAJECTORIES */}
        {activeTab === 'trajectories' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1A. ACADEMIC & COGNITIVE SKILLS */}
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      INTELLECTUAL DOMAINS
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Academic, Engineering, Science & Logic
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Academic & Professional Skills
                  </h3>
                  <p className="text-xs text-slate-500">
                    Socratic milestone node graphs, assessable units, and conceptual diagnostics.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEnrollModalProps({ excludeSports: true });
                    setShowEnrollModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll New Skill</span>
                </button>
              </div>

              {academicSkills.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">No academic skill tracks enrolled yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "+ Enroll New Skill" to synthesize an autonomous Groq curriculum.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {academicSkills.map((track: any) => (
                    <div
                      key={track.id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-white hover:shadow-md transition-all space-y-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                            {track.domainCategory || track.domain || 'Skill Track'}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-blue-700 transition-colors">
                            {track.title}
                          </h4>
                          {track.subTitle && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {track.subTitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Summary: Current Milestone & Completion Percentage */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Milestone</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            Node {track.passedStepsCount + 1} of {track.stepsCount || 5}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progression</p>
                          <p className="font-black text-emerald-600 mt-0.5">
                            {track.progress}%
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>

                      {/* Launch Workspace CTA Button */}
                      <Link
                        href={`/workspace/${track.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:bg-blue-600"
                      >
                        <span>Launch Workspace ➔</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 1B. ATHLETICS & SPORTS SEPARATION */}
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                      ATHLETICS & KINETICS
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Physical Conditioning, Drills & Biomechanics
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Athletics & Sports Tracks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tracked sports regimens with interactive practice stopwatch and context-aware drill generator.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/sports"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Open Sports Hub ➔</span>
                  </Link>
                  <button
                    onClick={() => {
                      setEnrollModalProps({ restrictToDomain: 'Athletics' });
                      setShowEnrollModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enroll Sport</span>
                  </button>
                </div>
              </div>

              {athleticSports.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-sm font-semibold text-slate-600">No sports tracks enrolled yet.</p>
                  <p className="text-xs text-slate-400">
                    Cricket, Football, Basketball, Tennis, and Sprinting must be practiced under the Sports Hub.
                  </p>
                  <Link
                    href="/sports"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Go to Sports Hub & Drill Engine ➔</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {athleticSports.map((track: any) => (
                    <div
                      key={track.id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-white hover:shadow-md transition-all space-y-4 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                            Athletics
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                            {track.title}
                          </h4>
                          {track.subTitle && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {track.subTitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Drill Node</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            Milestone {track.passedStepsCount + 1} of {track.stepsCount || 5}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mastery</p>
                          <p className="font-black text-emerald-600 mt-0.5">
                            {track.progress}%
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/workspace/${track.id}`}
                          className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Studio ➔</span>
                        </Link>
                        <Link
                          href="/sports"
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Drill Timer</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 1C. CURATED NEXT HORIZONS */}
            <div className="p-6 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/60 px-2 py-0.5 rounded-md">
                      NEURAL COMPASS
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Autonomous Progression Advisor
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-extrabold text-slate-900 mt-1">
                    Curated Next Horizons
                  </h3>
                  <p className="text-xs text-slate-500">
                    AI-synthesized complementary skill tracks based on your milestone pass velocity and domain affinities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200/90 hover:border-sky-400 bg-gradient-to-br from-white via-slate-50/50 to-sky-50/30 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                          {rec.domain}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0">
                          {rec.affinityScore}% Match
                        </span>
                      </div>

                      <h4 className="text-sm font-heading font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                        {rec.title}
                      </h4>

                      {rec.subGenre && (
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-800">
                          🎯 {rec.subGenre}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEnrollModalProps({
                          initialTitle: rec.title,
                          initialDomain: rec.domain === 'Engineering & Applied Technology' ? 'Science' : rec.domain === 'Formal Sciences & Mathematics' ? 'Cognitive Logic' : rec.domain,
                          initialSubGenre: rec.subGenre || '',
                        });
                        setShowEnrollModal(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Enroll in this Track</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEARNING HABITS & ANALYTICS (MODULE 4 & MODULE 7) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* XP PROGRESS BAR */}
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
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

            {/* MOMENTUM & PROTECTION DUAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOMENTUM CARD */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    MOMENTUM
                  </span>
                  <Flame className="w-5 h-5 text-orange-500" />
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
                  <span>Target: {profile.targetHours}h {profile.targetMinutes}m/day</span>
                </div>
              </div>

              {/* PROTECTION CARD (MODULE 7: ZERO-DEFAULT & 7-DAY RULE) */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    PROTECTION SAFEGUARDS
                  </span>
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-900">{profile.freezeShields} / 3</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Streak Freeze Safeguards 🧊</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Earned strictly on consecutive 7-day milestones (Day 7, 14, 21...). Auto-deploys during involuntary pauses.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                  <span>Defense Forcefield: {profile.freezeShields > 0 ? 'Armed' : 'Depleted'}</span>
                  <span className="font-bold text-cyan-700">
                    {profile.freezeShields > 0 ? `${profile.freezeShields} Freezes Ready` : '0 Freezes (Earn at Day 7)'}
                  </span>
                </div>
              </div>
            </div>

            {/* CADENCE & 7-DAY VOLUME DISTRIBUTION */}
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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">7-Day Study Cadence & Velocity Distribution</h4>
                    <p className="text-xs text-slate-400">Focused cognitive volume per diurnal cycle</p>
                  </div>

                  <button
                    onClick={handleSimulateStudySession}
                    disabled={simulating}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
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
              </div>
            </div>

            {/* AUTONOMOUS MASTERY BADGES */}
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
                      <Award className={`w-4 h-4 ${badge.unlocked ? 'text-amber-500' : 'text-slate-300'}`} />
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
          </div>
        )}

        {/* TAB 3: DAILY SCHEDULE & REMINDERS (MODULE 4) */}
        {activeTab === 'schedule' && (
          <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-md">
                  CHRONO-CADENCE ENGINE
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Automated NodeMailer & Cron Synchronization
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
              {/* Preferred Time Picker */}
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

              {/* Goal Duration */}
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

            {/* Email Reminders Toggle */}
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
                    Send daily notifications to <span className="font-mono text-slate-700 font-semibold">{profile.email || 'your email'}</span> with streak alerts and workspace links.
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
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                {savingSchedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Schedule Settings</span>
              </button>

              <button
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail || !profile.email}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test Reminder Email Now</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: RATE APP & FEEDBACK MODULE (MODULE 8) */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            {/* Feedback Form Card */}
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
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
                {/* Interactive Star Rating */}
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

                {/* Skill Tag Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Track / Specialization Tag (Optional)
                  </label>
                  <select
                    value={reviewForm.skillTag}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, skillTag: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">General Pedagogy & Platform Experience</option>
                    {enrolledWorkspaces.map((w: any) => (
                      <option key={w.id} value={w.title}>
                        {w.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Textarea */}
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
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {submittingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 fill-white" />}
                  <span>Publish Verified Review</span>
                </button>
              </form>
            </div>

            {/* User's Own Reviews List */}
            <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Submitted Reviews</h3>
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
                  You haven't submitted any reviews yet. Share your thoughts in the form above!
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
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <button
                                type="button"
                                key={st}
                                onClick={() => setEditingReviewRating(st)}
                                className="p-0.5"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    st <= editingReviewRating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
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
            router.push(`/workspace/${newTrack.id}`);
          }
        }}
      />

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userProfile={{
          ...profile,
          age: profile.age || 18,
        }}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
