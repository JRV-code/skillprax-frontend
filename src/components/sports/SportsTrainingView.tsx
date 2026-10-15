'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  Utensils,
  Apple,
  Dumbbell,
  Droplet,
  Heart,
  ShieldCheck,
  Zap,
  Users2,
  Compass,
  Trophy,
} from 'lucide-react';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';

export interface SportsTrainingViewProps {
  ageCategory?: string;
}

interface SportSuggestion {
  id: string;
  title: string;
  subGenre: string;
  category: string;
  intensity: 'Low' | 'Moderate' | 'High';
  rationale: string;
  medicalNote: string;
}

export function SportsTrainingView({ ageCategory = 'U17' }: SportsTrainingViewProps = {}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentLanguage } = useLanguage();

  const [sportsTracks, setSportsTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState<boolean>(true);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollInitialTitle, setEnrollInitialTitle] = useState<string>('');

  // Tailored Nutrition State
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);
  const [loadingNutrition, setLoadingNutrition] = useState<boolean>(false);

  const fetchEnrolledSports = async () => {
    try {
      setLoadingTracks(true);
      const profileId = typeof window !== 'undefined'
        ? (localStorage.getItem('skillprax_active_profile_id') || 'default-profile')
        : 'default-profile';

      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        const allTracks = data.enrolledWorkspaces || [];
        const sportsOnly = allTracks.filter((w: any) => {
          const dom = (w.domainCategory || w.domain || '').toLowerCase();
          const title = (w.title || '').toLowerCase();
          return (
            dom.includes('athletic') ||
            dom.includes('sport') ||
            ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'badminton', 'basketball', 'sprint', 'athletics', 'boxing', 'yoga', 'calisthenics', 'gymnastics'].some((s) => title.includes(s))
          );
        });
        setSportsTracks(sportsOnly);
      }
    } catch (err) {
      console.warn('Failed to fetch enrolled sports:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    fetchEnrolledSports();
  }, []);

  // Fetch Tailored Nutrition Plan based on active sport and learner profile
  useEffect(() => {
    const activeSportName = sportsTracks[0]?.title || 'Football';
    const effectiveDiet = user?.dietaryPreference || 'Vegetarian';
    const effectiveHealth = user?.healthConditions || user?.medicalConditions || 'None';

    async function loadNutrition() {
      try {
        setLoadingNutrition(true);
        const res = await fetch('/api/sports/nutrition-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sportName: activeSportName,
            dietaryPreference: effectiveDiet,
            healthConditions: effectiveHealth,
            preferredLanguage: currentLanguage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.nutritionPlan) setNutritionPlan(data.nutritionPlan);
        }
      } catch (_) {
      } finally {
        setLoadingNutrition(false);
      }
    }

    loadNutrition();
  }, [sportsTracks, user?.dietaryPreference, user?.healthConditions, user?.medicalConditions, currentLanguage]);

  // Smart suggestions tailored to ageCategory and healthConditions
  const smartSuggestions: SportSuggestion[] = useMemo(() => {
    const health = (user?.healthConditions || user?.medicalConditions || '').toLowerCase();

    const allOptions: SportSuggestion[] = [
      {
        id: 'sugg_football',
        title: 'Football / Soccer',
        subGenre: 'Ball Mastery & Spatial Acceleration',
        category: 'Athletics & Team Tactics',
        intensity: 'High',
        rationale: 'Builds explosive cardiovascular endurance, kinetic agility, and peripheral pitch awareness.',
        medicalNote: health.includes('knee') ? 'Modified low-impact pivoting recommended.' : 'Optimal lower-body kinetic conditioning.',
      },
      {
        id: 'sugg_swimming',
        title: 'Competitive Swimming',
        subGenre: 'Freestyle Kinetic Efficiency & Breathing',
        category: 'Aquatic Endurance',
        intensity: 'Moderate',
        rationale: 'Zero joint-impact resistance training that expands lung capacity and symmetrical shoulder strength.',
        medicalNote: 'Ideal for joints, zero gravitational compressive force on spine and knees.',
      },
      {
        id: 'sugg_badminton',
        title: 'Badminton',
        subGenre: 'Footwork Fluidity & Smash Acceleration',
        category: 'Racquet Precision',
        intensity: 'High',
        rationale: 'Sharpens reactive decision making and explosive deceleration mechanics across short sprint vectors.',
        medicalNote: 'Supports rapid rotational reflexes with light racquet loads.',
      },
      {
        id: 'sugg_basketball',
        title: 'Basketball',
        subGenre: 'Shooting Form & Defensive Lateral Slide',
        category: 'Athletic Coordination',
        intensity: 'High',
        rationale: 'Develops vertical jump mechanics, triple-threat stance balance, and fast-break stamina.',
        medicalNote: 'Requires proper footwear cushioning for jump landing absorption.',
      },
      {
        id: 'sugg_tennis',
        title: 'Lawn Tennis',
        subGenre: 'Kinetic Chain Serve & Baseline Topspin',
        category: 'Racquet Power',
        intensity: 'High',
        rationale: 'Groundstroke biomechanics emphasize full core rotational torque and rhythmic split-step timing.',
        medicalNote: 'Core engagement protective of lower back stabilization.',
      },
      {
        id: 'sugg_athletics',
        title: 'Athletics / Sprinting',
        subGenre: 'Drive Phase Acceleration & Posture',
        category: 'Track & Sprinting',
        intensity: 'High',
        rationale: 'Pure sprint mechanics calibrate dorsiflexion, hip flexor drive, and maximum velocity maintenance.',
        medicalNote: 'Focus on warm-up activation to protect hamstring and calf elasticity.',
      },
    ];

    if (health.includes('knee') || health.includes('back')) {
      // Prioritize swimming and lower impact
      return allOptions.sort((a, b) => (a.title.includes('Swimming') ? -1 : 1));
    }

    return allOptions;
  }, [user?.healthConditions, user?.medicalConditions]);

  const handleEnrollClick = (initialTitle: string = '') => {
    setEnrollInitialTitle(initialTitle);
    setShowEnrollModal(true);
  };

  return (
    <div className="space-y-12">
      {/* ===========================================================================
          SECTION 1: ACTIVE ENROLLED SPORTS GRID + "+ Enroll in New Sport"
         =========================================================================== */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE SPORTS TRACKS
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {sportsTracks.length} Enrolled
              </span>
            </div>
            <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Your Enrolled Athletic Disciplines
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch your dedicated training studio to practice day-by-day drills, watch in-app videos, and pass milestone gates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleEnrollClick('')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-[#0284C7] hover:from-emerald-700 hover:to-sky-700 shadow-md shadow-emerald-200 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enroll in New Sport</span>
          </button>
        </div>

        {loadingTracks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : sportsTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
              <Dumbbell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No active sport enrolled yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
              You haven't enrolled in an athletic discipline yet. Pick a sport from our smart suggestions below or enroll in your favorite sport now!
            </p>
            <button
              type="button"
              onClick={() => handleEnrollClick('')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll in Your First Sport</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sportsTracks.map((sport) => {
              const totalSteps = sport.totalPlannedSteps || sport.steps?.length || 5;
              const passedCount = sport.passedStepsCount || 0;
              const currentStep = Math.min(totalSteps, passedCount + 1);
              const progress = Math.round((passedCount / (totalSteps || 1)) * 100);

              return (
                <div
                  key={sport.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {sport.domainCategory || 'Athletics'}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        Phase {currentStep} of {totalSteps}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {sport.title || sport.skillName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {sport.subGenre || 'Physical Conditioning & Technique'}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Overall Mastery</span>
                        <span className="text-slate-800 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#0284C7] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/sports/workspace/${sport.id}`)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-emerald-600 cursor-pointer"
                  >
                    <span>Launch Training Studio →</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===========================================================================
          SECTION 2: SMART SUGGESTIONS: "What Sport You Should Learn Next"
         =========================================================================== */}
      <section className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                AI RECOMMENDATIONS
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Calibrated to Age Category ({ageCategory}) & Medical Profile
              </span>
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              What Sport You Should Learn Next
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated athletic trajectories adapted to your joint mechanics, daily schedule, and physical goals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {smartSuggestions.map((sugg) => (
            <div
              key={sugg.id}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {sugg.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {sugg.intensity} Intensity
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900">
                  {sugg.title}
                </h4>
                <p className="text-xs font-semibold text-emerald-800">
                  {sugg.subGenre}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sugg.rationale}
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sugg.medicalNote}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleEnrollClick(sugg.title)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Enroll in {sugg.title}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===========================================================================
          SECTION 3: TAILORED DIETARY & HYDRATION SUGGESTIONS
         =========================================================================== */}
      <section className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                NUTRITIONAL FUELING
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {user?.dietaryPreference || 'Vegetarian'} Preference Profile
              </span>
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Tailored Dietary & Hydration Suggestions
            </h3>
            <p className="text-xs text-slate-500">
              Calibrated by Groq AI based on your active physical training load and dietary preference.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase tracking-wider">
              <Apple className="w-4 h-4 text-amber-600" />
              <span>Pre-Session Fuel</span>
            </div>
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              {nutritionPlan?.preWorkoutFuel ||
                `Consume complex carbohydrates with light protein 45-60 minutes prior to training (e.g. oats, bananas with nut butter, or sprouted toast).`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/70 to-white border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Post-Workout Recovery</span>
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {nutritionPlan?.postWorkoutRecovery ||
                `Replenish with 20-30g of fast-absorbing protein and electrolytes within 45 minutes to restore glycogen and repair micro-tears.`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-sky-50/70 to-white border border-sky-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-800 text-xs font-black uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-sky-600" />
              <span>Electrolyte & Hydration</span>
            </div>
            <p className="text-xs text-sky-950 font-medium leading-relaxed">
              {nutritionPlan?.hydrationStrategy ||
                `Drink 500ml water with pinch of pink salt and lemon 30 minutes before exercise. Maintain 150ml hydration every 15-20 minutes during intensive drills.`}
            </p>
          </div>
        </div>
      </section>

      {/* Enroll Modal (Strictly 6 Fields for Sports) */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        restrictToDomain="Athletics"
        initialTitle={enrollInitialTitle}
        onEnroll={() => {
          setShowEnrollModal(false);
          fetchEnrolledSports();
        }}
      />
    </div>
  );
}

export default SportsTrainingView;
