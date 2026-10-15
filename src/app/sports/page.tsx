'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  MapPin, 
  ShoppingBag, 
  Users2, 
  Sparkles, 
  Plus,
  ArrowRight,
  BookOpen,
  Zap,
  Activity,
  HeartPulse,
  Utensils,
  Droplet,
  Dumbbell,
  Apple,
  ShieldCheck,
  Compass
} from 'lucide-react';

import { ClubsNearMeView } from '@/components/sports/ClubsNearMeView';
import { SportsShopView } from '@/components/sports/SportsShopView';
import { Navbar } from '@/components/common/Navbar';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { useAuthStore } from '@/store/useAuthStore';

export type SportsTab = 'hub' | 'clubs' | 'shop';
export type AgeCategory = 'ALL' | 'U14' | 'U17' | 'U19' | 'OPEN';

export interface EnrolledSportItem {
  id: string;
  skill_name: string;
  sub_genre: string;
  current_step: number;
  total_steps: number;
  category: string;
}

export interface SportSuggestion {
  id: string;
  title: string;
  subGenre: string;
  affinityScore: number;
  rationale: string;
  intensity: string;
  focusMuscles: string;
}

const DEFAULT_SPORT_SUGGESTIONS: SportSuggestion[] = [
  {
    id: 'sug-football-1',
    title: 'Football: Ball Mastery & Tight Space Dribbling',
    subGenre: 'Cruyff Turns & Cone Agility Shuttles',
    affinityScore: 96,
    rationale: 'Builds neuromuscular ankle elasticity, rapid directional deceleration, and split-second spatial scanning.',
    intensity: 'High Intensity',
    focusMuscles: 'Adductors, Calves, Core Stabilizers',
  },
  {
    id: 'sug-swim-1',
    title: 'Swimming: Freestyle Propulsion & Bilateral Breathing',
    subGenre: 'Catch-Pull Biomechanics & Core Rotation',
    affinityScore: 94,
    rationale: 'Zero joint-impact cardiovascular conditioning: Expands VO2 max and decompresses spine through full kinetic extension.',
    intensity: 'Low Impact / High Cardio',
    focusMuscles: 'Latissimus Dorsi, Posterior Deltoids, Diaphragm',
  },
  {
    id: 'sug-boxing-1',
    title: 'Boxing: Kinetic Stance & Slip-Angle Footwork',
    subGenre: 'Weight Transfer & Lateral Angles',
    affinityScore: 92,
    rationale: 'Rotational kinetic torque: Sharpens reaction reflexes, rotational core power, and dynamic head movement.',
    intensity: 'High Intensity',
    focusMuscles: 'Obliques, Calves, Anterior Deltoids',
  },
  {
    id: 'sug-archery-1',
    title: 'Archery: Anchor Consistency & Breath Synchronization',
    subGenre: 'Diaphragmatic Focus & Clean Release',
    affinityScore: 91,
    rationale: 'Neuro-cardiac control: Develops micro-muscular stability in scapular stabilizers and lowers resting heart rate under focus.',
    intensity: 'Steady Focus / Isometric',
    focusMuscles: 'Rhomboids, Trapezius, Core Bracing',
  },
  {
    id: 'sug-basketball-1',
    title: 'Basketball: Kinetic Jump Shot & Ball Handling',
    subGenre: 'Crossover Velocity & Arc Mechanics',
    affinityScore: 90,
    rationale: 'Explosive vertical triple extension: Teaches synchronized power transfer from ankles through hips and release.',
    intensity: 'High Intensity',
    focusMuscles: 'Quadriceps, Gastrocnemius, Forearm Flexors',
  },
  {
    id: 'sug-calisthenics-1',
    title: 'Calisthenics: Gymnastic Ring Core & Pull Mechanics',
    subGenre: 'Muscle-Up Progression & Lever Control',
    affinityScore: 89,
    rationale: 'Relative bodyweight strength: Conditions tendons and joint capsules through compound multi-planar isometric holds.',
    intensity: 'Strength & Tendon Resilience',
    focusMuscles: 'Biceps, Scapular Retractors, Abdominal Wall',
  },
];

export default function SportsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SportsTab>('hub');
  const [selectedAge, setSelectedAge] = useState<AgeCategory>('U17');
  
  // Enrolled Sports State
  const [enrolledSports, setEnrolledSports] = useState<EnrolledSportItem[]>([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState<boolean>(true);
  
  // Enrollment Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [selectedSportTitle, setSelectedSportTitle] = useState<string>('');
  const [selectedSportSubGenre, setSelectedSportSubGenre] = useState<string>('');

  // AI Dietary Plan State
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState<boolean>(false);

  const navItems = [
    { id: 'hub', label: 'Sports Performance Hub', icon: Zap, badge: 'Active Tracks' },
    { id: 'clubs', label: 'Clubs Near Me', icon: MapPin, badge: 'Live Map' },
    { id: 'shop', label: 'Sports Gear & Stores', icon: ShoppingBag, badge: 'Deals' },
  ];

  const ageCategories: { id: AgeCategory; label: string; desc: string }[] = [
    { id: 'ALL', label: 'All Ages', desc: 'Any age category' },
    { id: 'U14', label: 'Under 14 (U-14)', desc: 'Junior Sub-Cadet' },
    { id: 'U17', label: 'Under 17 (U-17)', desc: 'Cadet & School' },
    { id: 'U19', label: 'Under 19 (U-19)', desc: 'Junior District/State' },
    { id: 'OPEN', label: 'Open / Senior', desc: 'Collegiate & Amateur' },
  ];

  const fetchEnrolledSports = async () => {
    try {
      setIsLoadingEnrolled(true);
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('skillprax_auth_token'))
        : null;

      let foundSports: EnrolledSportItem[] = [];

      // 1. Fetch from /api/skills/enrolled
      try {
        const res = await fetch('/api/skills/enrolled', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const list = (data.skills || []).filter((s: any) => {
            const cat = (s.category || s.domainCategory || s.domain || '').toLowerCase();
            const title = (s.skill_name || s.title || '').toLowerCase();
            return cat === 'physical' || cat === 'sports' || cat === 'athletics' ||
              ['cricket', 'football', 'soccer', 'swimming', 'basketball', 'tennis', 'boxing', 'archery', 'badminton', 'calisthenics', 'sprint', 'running', 'gymnastics', 'yoga'].some(k => title.includes(k));
          });

          if (list.length > 0) {
            foundSports = list.map((s: any) => ({
              id: s.id,
              skill_name: s.skill_name || s.title || 'Athletic Discipline',
              sub_genre: s.sub_genre || s.subTitle || s.subGenre || 'Physical Technique',
              current_step: s.current_step || (s.passedStepsCount !== undefined ? s.passedStepsCount + 1 : 1),
              total_steps: s.total_steps || s.totalPlannedSteps || 5,
              category: s.category || 'Athletics',
            }));
          }
        }
      } catch (_) {}

      // 2. Fallback to /api/profiles/:id/telemetry if empty
      if (foundSports.length === 0) {
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
              return dom === 'athletics' || dom === 'sports' ||
                ['cricket', 'football', 'soccer', 'swimming', 'basketball', 'tennis', 'boxing', 'archery', 'badminton', 'calisthenics', 'sprint', 'running', 'gymnastics', 'yoga'].some(k => title.includes(k));
            });

            if (workspaces.length > 0) {
              foundSports = workspaces.map((w: any) => ({
                id: w.id,
                skill_name: w.title || w.skill_name || 'Athletic Discipline',
                sub_genre: w.subGenre || w.subTitle || 'Physical Technique',
                current_step: (w.passedStepsCount || 0) + 1,
                total_steps: w.totalPlannedSteps || w.steps?.length || 5,
                category: w.domainCategory || 'Athletics',
              }));
            }
          }
        } catch (_) {}
      }

      setEnrolledSports(foundSports);
    } catch (err) {
      console.error('Failed to fetch enrolled sports:', err);
      setEnrolledSports([]);
    } finally {
      setIsLoadingEnrolled(false);
    }
  };

  const fetchDietaryBlueprint = async (sportName: string = 'Football') => {
    try {
      setIsLoadingNutrition(true);
      const res = await fetch('/api/sports/nutrition-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportName,
          dietaryPreference: user?.dietaryPreference || 'Vegetarian',
          healthConditions: user?.healthConditions || (user as any)?.medicalConditions || 'None',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNutritionPlan(data.nutritionPlan || data);
      }
    } catch (_) {}
    finally {
      setIsLoadingNutrition(false);
    }
  };

  useEffect(() => {
    fetchEnrolledSports();
    fetchDietaryBlueprint();
  }, []);

  const handleOpenEnrollModal = (title: string = '', sub: string = '') => {
    setSelectedSportTitle(title);
    setSelectedSportSubGenre(sub);
    setIsEnrollModalOpen(true);
  };

  const activeSportName = enrolledSports.length > 0 ? enrolledSports[0].skill_name : 'Football';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-800">
      {/* Universal Top Navbar */}
      <Navbar />

      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 pt-8 pb-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                ATHLETICS & SPORTS ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Real-Time Data
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Athletic Performance & Sports Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Master any physical discipline step-by-step in dedicated workspaces, find nearby academies on Google Maps, and discover authentic gear.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Age Category Selector */}
            <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/90 flex flex-col gap-1 shrink-0">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users2 className="w-3 h-3 text-emerald-600" />
                  Age Category
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-xs flex-wrap sm:flex-nowrap">
                {ageCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedAge(cat.id)}
                    title={cat.desc}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedAge === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* + Enroll in New Sport Button */}
            <button
              type="button"
              onClick={() => handleOpenEnrollModal()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-200 transition-all cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Sport</span>
            </button>
          </div>
        </div>

        {/* 3-Tab Glassmorphic Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/70 backdrop-blur-md overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SportsTab)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSportsTabPill"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'hub' && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-14"
            >
              {/* ======================================================== */}
              {/* SECTION 1: ACTIVE ENROLLED SPORTS GRID (CLONED FROM /skills) */}
              {/* ======================================================== */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Enrolled Sports Workspaces</h2>
                    <p className="text-xs text-slate-500">
                      Click any active sport to open its dedicated Step Studio with drills, video guides, and timers
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    {enrolledSports.length} Enrolled
                  </span>
                </div>

                {isLoadingEnrolled ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
                    ))}
                  </div>
                ) : enrolledSports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                      <Activity className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No sport enrolled yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                      You haven't enrolled in any physical disciplines yet. Browse the smart recommendations below or enroll now!
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollModal()}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Enroll in a Sport to Get Started</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {enrolledSports.map((sport) => {
                      const pct = Math.min(100, Math.max(10, (sport.current_step / (sport.total_steps || 1)) * 100));
                      return (
                        <div
                          key={sport.id}
                          className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                {sport.sub_genre || 'Physical Mastery'}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 font-mono">
                                Step {sport.current_step} of {sport.total_steps}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                              {sport.skill_name}
                            </h3>
                            <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          <Link
                            href={`/workspace/${sport.id}`}
                            className="mt-6 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                          >
                            <span>Launch Step Studio</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ======================================================== */}
              {/* SECTION 2: SMART SUGGESTIONS: "WHAT SPORT YOU SHOULD LEARN NEXT" */}
              {/* ======================================================== */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">What Sport You Should Learn Next</h2>
                    <p className="text-xs text-slate-500">
                      Personalized athletic recommendations calibrated to your {selectedAge} age group and safety profile
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    AI Horizon Matching
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {DEFAULT_SPORT_SUGGESTIONS.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            {sug.intensity}
                          </span>
                          <span className="text-xs font-bold text-slate-700 font-mono">
                            {sug.affinityScore}% Match
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {sug.title}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {sug.subGenre}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sug.rationale}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Focus:</span>
                          <span className="font-semibold text-slate-700">{sug.focusMuscles}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEnrollModal(sug.title.split(':')[0].trim(), sug.subGenre)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Enroll Now ➔</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* ======================================================== */}
              {/* SECTION 3: AI DIETARY & HYDRATION BLUEPRINT */}
              {/* ======================================================== */}
              <section className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                      <Utensils className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        AI Athletic Fueling & Hydration Blueprint
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dynamic Groq nutrition calibrated for {activeSportName}, {user?.dietaryPreference || 'Vegetarian'} diet, and medical safety
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      🥗 {user?.dietaryPreference || 'Vegetarian'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                      🩺 {user?.healthConditions || 'Safety Filter Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-amber-600" />
                      <span>Pre-Training Fuel (60-90m Prior)</span>
                    </span>
                    <p className="text-xs text-amber-950 font-medium leading-relaxed">
                      {nutritionPlan?.preTraining?.meal || `High complex carbohydrates and moderate protein: Oats with chia seeds, banana, and peanut butter for sustained glycogen release.`}
                    </p>
                    <span className="text-[10px] text-amber-700 font-bold block pt-1">
                      Macros: High complex carbs (50-60g), Moderate protein (15-20g)
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                      <span>Post-Training Muscle Repair (Within 45m)</span>
                    </span>
                    <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                      {nutritionPlan?.postTraining?.meal || `Targeted 3:1 recovery meal: Greek yogurt with honey and berries or sprouted moong bowl with paneer/tofu for myofibrillar repair.`}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                      Target: 20-25g bioavailable protein + 40g glycogen replenisher
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-sky-600" />
                      <span>Electrolytes & Cellular Hydration</span>
                    </span>
                    <p className="text-xs text-sky-950 font-medium leading-relaxed">
                      {nutritionPlan?.hydration?.guideline || `Drink 500-750ml water with a pinch of Himalayan rock salt and fresh lemon to replenish sodium, potassium, and neuromuscular firing.`}
                    </p>
                    <span className="text-[10px] text-sky-700 font-bold block pt-1">
                      Daily Target: 3.2 Liters + active sweat replenishment
                    </span>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'clubs' && (
            <motion.div
              key="clubs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClubsNearMeView ageCategory={selectedAge} />
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SportsShopView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enroll in Sport Modal */}
      <EnrollSkillModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        restrictToDomain="Athletics"
        initialTitle={selectedSportTitle}
        initialSubGenre={selectedSportSubGenre}
        onEnroll={() => {
          setIsEnrollModalOpen(false);
          fetchEnrolledSports();
        }}
      />
    </div>
  );
}
