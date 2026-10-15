'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { EnrolledSkillsGrid, EnrolledSkill } from '@/components/skills/EnrolledSkillsGrid';
import { SkillSuggestionsSection, SkillSuggestion, DEFAULT_SUGGESTIONS } from '@/components/skills/SkillSuggestionsSection';
import { SkillTrackCertificateModal } from '@/components/certificate/SkillTrackCertificateModal';
import { useAuthStore } from '@/store/useAuthStore';

export default function SkillsPage() {
  const { user } = useAuthStore();
  const [enrolledSkills, setEnrolledSkills] = useState<EnrolledSkill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [selectedSuggestionTitle, setSelectedSuggestionTitle] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<{ skillName: string; userName: string } | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  const fetchUserSkills = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || localStorage.getItem('skillprax_auth_token'))
        : null;

      // 1. Try fetching from /api/skills/enrolled
      let foundSkills: EnrolledSkill[] = [];
      try {
        const res = await fetch('/api/skills/enrolled', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const list = (data.skills || []).filter(
            (s: any) => s.category !== 'physical' && s.category !== 'sports' && s.domainCategory !== 'Athletics'
          );
          if (list.length > 0) {
            foundSkills = list.map((s: any) => ({
              id: s.id,
              skill_name: s.skill_name || s.title || 'Cognitive Track',
              sub_genre: s.sub_genre || s.subTitle || 'General Track',
              current_step: s.current_step || (s.passedStepsCount !== undefined ? s.passedStepsCount + 1 : 1),
              total_steps: s.total_steps || s.totalPlannedSteps || 5,
              category: s.category || s.domainCategory || 'Software Engineering',
            }));
          }
        }
      } catch (_) {}

      // 2. Fallback to /api/profiles/:id/telemetry if enrolled list is empty
      if (foundSkills.length === 0) {
        const profileId = typeof window !== 'undefined'
          ? (localStorage.getItem('skillprax_active_profile_id') || 'default-profile')
          : 'default-profile';

        try {
          const telRes = await fetch(`/api/profiles/${profileId}/telemetry`);
          if (telRes.ok) {
            const telData = await telRes.json();
            const workspaces = (telData.enrolledWorkspaces || []).filter((w: any) => {
              const dom = (w.domainCategory || w.domain || '').toLowerCase();
              const title = (w.title || '').toLowerCase();
              const isSport = dom === 'athletics' ||
                ['cricket', 'football', 'soccer', 'swimming', 'basketball', 'tennis', 'calisthenics', 'sprint'].some(s => title.includes(s));
              return !isSport;
            });

            if (workspaces.length > 0) {
              foundSkills = workspaces.map((w: any) => ({
                id: w.id,
                skill_name: w.title || w.skill_name || 'Cognitive Track',
                sub_genre: w.subGenre || w.subTitle || 'General Track',
                current_step: (w.passedStepsCount || 0) + 1,
                total_steps: w.totalPlannedSteps || w.steps?.length || 5,
                category: w.domainCategory || 'Software Engineering',
              }));
            }
          }
        } catch (_) {}
      }

      setEnrolledSkills(foundSkills);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setEnrolledSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  const handleOpenEnrollModal = (initialTitle: string = '') => {
    setSelectedSuggestionTitle(initialTitle);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSuggestion = (suggestion: SkillSuggestion) => {
    handleOpenEnrollModal(suggestion.title);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-800">
      {/* Universal Top Navigation */}
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-200">
                COGNITIVE STUDIO
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Mental, Creative & Tech Tracks
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Skills Learning Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore step-by-step masteries, dive into active lessons, and enroll in new disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenEnrollModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 shadow-md shadow-sky-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Skill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 mt-10 space-y-12">
        {/* SECTION 1: CURRENTLY ENROLLED SKILLS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Enrolled Skills</h2>
              <p className="text-xs text-slate-500">Active learning tracks currently in progress</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {enrolledSkills.length} Enrolled
            </span>
          </div>

          <EnrolledSkillsGrid
            skills={enrolledSkills}
            isLoading={isLoading}
            onEnrollClick={() => handleOpenEnrollModal()}
            onViewCertificate={(skill) => {
              setSelectedCert({
                skillName: skill.skill_name,
                userName: user?.name || 'Skill-Track Scholar',
              });
              setShowCertModal(true);
            }}
          />
        </section>

        {/* SECTION 2: AI CURATED SKILL SUGGESTIONS (NEXT HORIZONS) */}
        <section>
          <SkillSuggestionsSection
            suggestions={DEFAULT_SUGGESTIONS}
            onEnrollSuggestion={handleEnrollSuggestion}
          />
        </section>
      </main>

      {/* Enroll Skill Modal */}
      <EnrollSkillModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        excludeSports={true}
        initialTitle={selectedSuggestionTitle}
        onEnroll={() => {
          setIsEnrollModalOpen(false);
          fetchUserSkills();
        }}
      />

      {/* Official Skill-Track Calligraphy Certificate Modal */}
      {selectedCert && (
        <SkillTrackCertificateModal
          isOpen={showCertModal}
          onClose={() => {
            setShowCertModal(false);
            setSelectedCert(null);
          }}
          userName={selectedCert.userName}
          skillName={selectedCert.skillName}
          isPhysical={false}
        />
      )}
    </div>
  );
}
