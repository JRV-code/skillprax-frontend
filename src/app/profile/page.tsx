'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHubPage from '@/components/ProfileHubPage';
import { UserProfile, SkillTrack } from '@/types';

const INITIAL_PROFILE: UserProfile = {
  id: 'profile-default',
  name: 'Learner Explorer',
  educationBoard: 'GSEB',
  grade: 'Class 12',
  activeMonths: 3,
  streakDays: 7,
  freezeShields: 1,
  targetHours: 10,
  targetMinutes: 50,
  alertNotification: '20:30',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  age: 18,
  profession: 'Class 12 Student (GSEB)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  dailyReminderTime: '20:30',
  notificationsEnabled: true,
  activeDays: 22,
  followingsCount: 12,
  skillsCompleted: 1,
  flameStreak: 7,
  activeFreezes: 1,
  maxFreezes: 3,
  studyCadence: [
    { day: 'Sun', hours: 2, minutes: 30, focusArea: 'Sprint Clearance', nodesCompleted: 1 },
    { day: 'Mon', hours: 3, minutes: 45, focusArea: 'Graph Traversal', nodesCompleted: 2 },
    { day: 'Tue', hours: 4, minutes: 15, focusArea: 'Organic Synthesis', nodesCompleted: 1 },
    { day: 'Wed', hours: 5, minutes: 0, focusArea: 'Walden Inversion', nodesCompleted: 3 },
    { day: 'Thu', hours: 6, minutes: 30, focusArea: 'SN1/SN2 Socratic Gate', nodesCompleted: 2 },
    { day: 'Fri', hours: 3, minutes: 10, focusArea: 'Biomechanical Force', nodesCompleted: 1 },
    { day: 'Sat', hours: 4, minutes: 50, focusArea: 'Synthesis Review', nodesCompleted: 2 },
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [tracks, setTracks] = useState<SkillTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = localStorage.getItem('skillprax_active_profile_id');
    if (!profileId) {
      // Create a default profile if none exists
      async function createDefault() {
        try {
          const res = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Explorer', educationBoard: 'GSEB', grade: 'Class 12' }),
          });
          const data = await res.json();
          const pId = data.profile?.id || data.id;
          localStorage.setItem('skillprax_active_profile_id', pId);
          loadHydratedData(pId);
        } catch (err) {
          console.error('Failed to auto-create profile:', err);
          setLoading(false);
        }
      }
      createDefault();
      return;
    }

    loadHydratedData(profileId);
  }, []);

  async function loadHydratedData(profileId: string) {
    try {
      setLoading(true);
      const [profileRes, workspacesRes] = await Promise.all([
        fetch(`/api/profiles/${profileId}`),
        fetch(`/api/workspaces?profileId=${profileId}`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const p = profileData.profile || profileData;
        setUserProfile((prev) => ({
          ...prev,
          id: p.id,
          name: p.name || 'Learner Explorer',
          profession: `${p.educationBoard || 'GSEB'} • ${p.grade || 'Class 12'}`,
          flameStreak: p.streakDays ?? p.streak ?? 7,
          activeFreezes: p.freezeShields ?? p.freezes ?? 1,
          targetHours: p.targetHours ?? 10,
          targetMinutes: p.targetMinutes ?? 50,
          dailyReminderTime: p.alertNotification || p.dailyReminderTime || '20:30',
          activeDays: (p.activeMonths ? p.activeMonths * 30 : 22),
        }));
      }

      if (workspacesRes.ok) {
        const workspacesData = await workspacesRes.json();
        const wsList = workspacesData.workspaces || [];
        const mappedTracks: SkillTrack[] = wsList.map((ws: any) => ({
          id: ws.id,
          title: ws.title || 'Custom Skill Track',
          category: ws.domainCategory || ws.domain || 'Science',
          tags: [ws.domainCategory || 'Science', 'Autonomous', 'Groq AI'],
          currentStep: ws.currentStep || 1,
          totalSteps: ws.totalSteps || ws.totalPlannedSteps || 5,
          progressPercent: ws.progress ?? 20,
          colorScheme:
            ws.domainCategory === 'Athletics'
              ? 'emerald'
              : ws.domainCategory === 'Science'
              ? 'amber'
              : ws.domainCategory === 'Art'
              ? 'purple'
              : 'blue',
          icon:
            ws.domainCategory === 'Athletics'
              ? 'Zap'
              : ws.domainCategory === 'Science'
              ? 'FlaskConical'
              : 'Code',
          milestones: (ws.steps || []).map((s: any, idx: number) => ({
            id: s.id || `m-${idx}`,
            stepNumber: s.stepIndex || idx + 1,
            title: s.title || `Step ${idx + 1}`,
            description: s.description || 'Milestone unit',
            status: s.status === 'PASSED' ? 'completed' : s.status === 'LOCKED' ? 'locked' : 'active',
            acus: (s.assessableUnits || []).map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU')),
          })),
        }));
        setTracks(mappedTracks);
      }
    } catch (err) {
      console.error('Failed to hydrate profile hub:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    const profileId = localStorage.getItem('skillprax_active_profile_id');
    if (!profileId) return;

    try {
      await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updated.name,
          targetHours: updated.targetHours,
          targetMinutes: updated.targetMinutes,
          alertNotification: updated.dailyReminderTime,
        }),
      });
    } catch (err) {
      console.error('Failed to patch profile:', err);
    }
  };

  const handleAddTrack = (track: SkillTrack) => {
    setTracks((prev) => [...prev, track]);
  };

  const handleNavigate = (page: 'landing' | 'profile' | 'studio') => {
    if (page === 'landing') router.push('/');
    else if (page === 'profile') router.push('/profile');
    else {
      if (tracks.length > 0) router.push(`/workspace/${tracks[0].id}`);
      else router.push('/profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
            Hydrating Telemetry & Workspaces...
          </span>
        </div>
      </div>
    );
  }

  return (
    <ProfileHubPage
      userProfile={userProfile}
      onUpdateProfile={handleUpdateProfile}
      tracks={tracks}
      onSelectTrack={(tId) => router.push(`/workspace/${tId}`)}
      onAddTrack={handleAddTrack}
      onNavigate={handleNavigate}
      onOpenAdmin={() => {}}
    />
  );
}

