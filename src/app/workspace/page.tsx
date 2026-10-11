'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Plus, Sparkles, BookOpen, Clock, 
  CheckCircle2, AlertCircle, User, Activity, Layers 
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

function isProfileComplete(profile: any): boolean {
  if (!profile) return false;
  const hasName = Boolean(profile.name && String(profile.name).trim().length > 0);
  const hasEmail = Boolean(profile.email && String(profile.email).trim().length > 0);
  const hasGender = Boolean(profile.gender && String(profile.gender).trim().length > 0);
  const hasProfession = Boolean(profile.profession && String(profile.profession).trim().length > 0);
  return hasName && hasEmail && hasGender && hasProfession;
}

export default function WorkspaceHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id');
    if (!storedId) {
      router.push('/');
      return;
    }
    setActiveProfileId(storedId);
    loadWorkspaces(storedId);
  }, []);

  async function loadWorkspaces(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (!res.ok) throw new Error('Failed to load profile telemetry');
      const data = await res.json();
      setProfile(data.profile);
      setWorkspaces(data.enrolledWorkspaces || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
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
        await loadWorkspaces(activeProfileId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Loading Workspace Studio...
          </span>
        </div>
      </div>
    );
  }

  const profileComplete = isProfileComplete(profile);

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col font-sans relative">
      <CinematicVideoBackground overlayOpacity={0.12} />

      {/* TOP HEADER */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
              WORKSPACE
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Active Learning & Socratic Verification Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sports"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Sports Hub</span>
          </Link>
          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Back to Profile Hub ➔</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-6 relative z-10">
        
        {/* COMPLETION LOCK (MODULE 3) */}
        {!profileComplete && (
          <div className="p-5 bg-amber-50/95 border border-amber-300 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">
                  Profile Demographics Required
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Please complete your Full Name, Gmail ID, Gender, and Profession before starting active milestone evaluations.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Complete Profile Now</span>
            </button>
          </div>
        )}

        {/* HERO TITLE CARD */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
              ACTIVE TRAJECTORIES
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Select Your Learning Trajectory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch directly into the interactive milestone graph, in-app media player, and Socratic evaluation gate.
            </p>
          </div>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Trajectory</span>
          </button>
        </div>

        {/* WORKSPACE CARDS GRID */}
        {workspaces.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No active trajectories found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Synthesize a custom learning roadmap tailored to your specific subject, specialization, and daily commitment.
              </p>
            </div>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Your First Skill</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workspaces.map((ws: any) => (
              <div
                key={ws.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {ws.domainCategory || ws.domain || 'Skill Trajectory'}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      {ws.progress}% Complete
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ws.title}
                  </h3>

                  {ws.subTitle && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ws.subTitle}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Milestone {ws.passedStepsCount + 1} of {ws.stepsCount || 5}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {ws.passedStepsCount} Passed ✓
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${ws.progress}%` }}
                    />
                  </div>

                  <Link
                    href={`/workspace/${ws.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all group-hover:bg-blue-600"
                  >
                    <span>Launch Milestone Studio ➔</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ENROLL MODAL */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
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
          age: profile?.age || 18,
        }}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}
