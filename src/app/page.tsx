'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage as LandingComponent } from '@/components/LandingPage';
import { UserProfile, SkillTrack } from '@/types';

const INITIAL_PROFILE: UserProfile = {
  id: 'profile-manendra-1',
  name: 'Manendra Patel',
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
  profession: 'Class 12 Student',
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
    { day: 'Tue', hours: 4, minutes: 15, focusArea: 'Haloalkanes Intro', nodesCompleted: 1 },
    { day: 'Wed', hours: 5, minutes: 0, focusArea: 'Walden Inversion', nodesCompleted: 3 },
    { day: 'Thu', hours: 6, minutes: 30, focusArea: 'SN1/SN2 Socratic Gate', nodesCompleted: 2 },
    { day: 'Fri', hours: 3, minutes: 10, focusArea: 'Biomechanical Force', nodesCompleted: 1 },
    { day: 'Sat', hours: 4, minutes: 50, focusArea: 'Synthesis Review', nodesCompleted: 2 },
  ],
};

const INITIAL_TRACKS: SkillTrack[] = [
  {
    id: 'track-haloalkanes',
    title: 'NCERT Class 12 Chemistry: Haloalkanes and Haloarenes',
    category: 'Chemistry',
    tags: ['Chemistry', 'NCERT', 'JEE Advanced', 'Mechanisms'],
    currentStep: 2,
    totalSteps: 6,
    progressPercent: 33,
    colorScheme: 'amber',
    icon: 'FlaskConical',
    milestones: [
      {
        id: 'm-chem-1',
        stepNumber: 1,
        title: 'Classification & Nomenclature',
        description: 'Aliphatic, allylic, benzylic, vinylic, and arylic halide structures.',
        status: 'completed',
        acus: ['ACU-1: sp³ vs sp² C-X classification', 'ACU-2: IUPAC haloarene numbering'],
      },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tracks, setTracks] = useState<SkillTrack[]>(INITIAL_TRACKS);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.profiles) && data.profiles.length > 0) {
            setProfiles(data.profiles);
            const first = data.profiles[0];
            setUserProfile({
              ...INITIAL_PROFILE,
              id: first.id,
              name: first.name,
              profession: `${first.educationBoard || 'GSEB'} • ${first.grade || 'Class 12'}`,
              flameStreak: first.streakDays ?? 7,
              activeFreezes: first.freezeShields ?? 1,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load profiles:', err);
      }
    }
    loadProfiles();
  }, []);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleNavigate = (page: string) => {
    if (page === 'page02' || page === 'profile') router.push('/profile');
    else if (page === 'page03' || page === 'page04' || page === 'studio') {
      const profileId = localStorage.getItem('skillprax_active_profile_id');
      if (profileId) router.push('/profile');
      else router.push('/profile');
    } else router.push('/');
  };

  const handleSelectProfile = (profileId: string) => {
    localStorage.setItem('skillprax_active_profile_id', profileId);
    router.push('/profile');
  };

  const handleCreateProfile = async ({
    name,
    educationBoard,
    grade,
  }: {
    name: string;
    educationBoard: string;
    grade: string;
  }) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, educationBoard, grade }),
      });
      if (!res.ok) throw new Error('Failed to create profile');
      const data = await res.json();
      const newProfileId = data.profile?.id || data.id;
      localStorage.setItem('skillprax_active_profile_id', newProfileId);
      router.push('/profile');
    } catch (err) {
      console.error(err);
      router.push('/profile');
    }
  };

  return (
    <LandingComponent
      userProfile={userProfile}
      onUpdateProfile={handleUpdateProfile}
      onNavigate={handleNavigate}
      tracks={tracks}
      onOpenAdmin={() => {}}
      existingProfiles={profiles}
      onSelectProfile={handleSelectProfile}
      onCreateProfile={handleCreateProfile}
    />
  );
}

