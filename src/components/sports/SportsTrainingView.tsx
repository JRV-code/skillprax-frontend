'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Activity, Plus, Clock, CheckCircle2, ChevronRight, 
  RotateCcw, Sparkles, RefreshCw, Zap, Shield, Target,
  Dumbbell, Flame, Check, BookOpen, Utensils, Droplet,
  Heart, ArrowRight, Compass
} from 'lucide-react';
import { SportsStepTracker } from '@/components/workspace/SportsStepTracker';
import { DrillCardWithTimer } from './DrillCardWithTimer';
import { SportsStepConditioningSection } from './SportsStepConditioningSection';
import { SocraticQuizModal } from '@/components/SocraticQuizModal';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/useAuthStore';
import { usePackStatus } from '@/hooks/learning/usePackStatus';
import { useEngagement } from '@/hooks/learning/useEngagement';
import { StartStepCard } from '@/components/learning/StartStepCard';
import { PackBuildingScreen } from '@/components/learning/PackBuildingScreen';
import { StepIntroCard } from '@/components/learning/StepIntroCard';
import { ChapterAccordion } from '@/components/learning/ChapterAccordion';

export interface StepDrillItem {
  id: string;
  title: string;
  durationMinutes: number;
  technicalFocusPoints: string[];
  isCompleted: boolean;
}

export interface SportsTrainingViewProps {
  ageCategory?: string;
}

export function SportsTrainingView({ ageCategory = 'U17' }: SportsTrainingViewProps = {}) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [sportsTracks, setSportsTracks] = useState<any[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<any | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState<boolean>(false);
  const [loadingDrills, setLoadingDrills] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const { user } = useAuthStore();
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [stepDrills, setStepDrills] = useState<StepDrillItem[]>([]);
  const [dayCompleteNotice, setDayCompleteNotice] = useState<string | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);
  const [loadingNutrition, setLoadingNutrition] = useState<boolean>(false);
  const [enrollInitialTitle, setEnrollInitialTitle] = useState<string>('');

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';
    setActiveProfileId(storedId);
    loadSportsData(storedId);
  }, []);

  useEffect(() => {
    if (selectedSportId) {
      loadActiveWorkspace(selectedSportId);
    } else if (sportsTracks.length > 0) {
      setSelectedSportId(sportsTracks[0].id);
    }
  }, [selectedSportId, sportsTracks]);

  // Load tailored athletic nutrition plan whenever active sport or user dietary preference updates
  useEffect(() => {
    if (activeWorkspace) {
      fetchNutritionPlan(activeWorkspace.title || 'Football');
    }
  }, [activeWorkspace?.title, user?.dietaryPreference, user?.healthConditions, user?.medicalConditions]);

  async function fetchNutritionPlan(sportName: string) {
    try {
      setLoadingNutrition(true);
      const res = await fetch('/api/sports/nutrition-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportName,
          dietaryPreference: user?.dietaryPreference || 'Vegetarian',
          healthConditions: user?.healthConditions || user?.medicalConditions || 'None',
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

  // Load drills automatically matching the ACTIVE sport and CURRENT step level
  useEffect(() => {
    if (activeWorkspace) {
      fetchStepDrills(
        activeWorkspace.title || 'Football',
        activeStepIndex + 1,
        activeStep?.title || `Milestone ${activeStepIndex + 1}`
      );
    }
  }, [activeWorkspace, activeStepIndex, currentLanguage]);

  async function loadSportsData(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        const allTracks = data.enrolledWorkspaces || [];
        const sportsOnly = allTracks.filter(
          (w: any) => w.domainCategory === 'Athletics' || w.domain === 'Athletics' ||
            ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'badminton', 'basketball', 'sprint'].some(s => (w.title || '').toLowerCase().includes(s))
        );
        setSportsTracks(sportsOnly);
        if (sportsOnly.length > 0 && !selectedSportId) {
          setSelectedSportId(sportsOnly[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load sports telemetry:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveWorkspace(workspaceId: string) {
    try {
      setLoadingWorkspace(true);
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        const ws = data.workspace || data;
        setActiveWorkspace(ws);
        const steps = ws.steps || [];
        const firstActive = steps.findIndex((s: any) => s.status !== 'PASSED');
        setActiveStepIndex(firstActive >= 0 ? firstActive : 0);
      }
    } catch (err) {
      console.warn('Failed to load active sport workspace:', err);
    } finally {
      setLoadingWorkspace(false);
    }
  }

  async function fetchStepDrills(sportName: string, stepNumber: number, stepTitle: string) {
    try {
      setLoadingDrills(true);
      const res = await fetch('/api/sports/drills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportName,
          stepNumber,
          stepTitle,
          preferredLanguage: currentLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.drills) && data.drills.length > 0) {
          const formatted: StepDrillItem[] = data.drills.map((d: any, idx: number) => ({
            id: d.id || `drill-${stepNumber}-${idx + 1}`,
            title: d.title || `${sportName} Step ${stepNumber} Drill ${idx + 1}`,
            durationMinutes: d.durationMinutes || 12,
            technicalFocusPoints: Array.isArray(d.instructions) && d.instructions.length > 0
              ? d.instructions.slice(0, 3)
              : Array.isArray(d.focusPoints) && d.focusPoints.length > 0
              ? d.focusPoints.slice(0, 3)
              : [
                  'Maintain low center of gravity and athletic alignment',
                  'Execute fluid kinetic energy transfer through core levers',
                  'Decelerate smoothly at end range without joint locking',
                ],
            isCompleted: Boolean(d.completed),
          }));
          setStepDrills(formatted);
          return;
        }
      }
    } catch (err) {
      console.warn('Dynamic drill fetch failed, using fallback:', err);
    } finally {
      setLoadingDrills(false);
    }

    // Default fallback drills calibrated for current step
    setStepDrills([
      {
        id: `drill-${stepNumber}-1`,
        title: `${sportName} Step ${stepNumber} — Foundational Mechanical Stance`,
        durationMinutes: 10,
        technicalFocusPoints: [
          'Feet shoulder-width apart, knees unlocked and active',
          'Core firmly engaged to stabilize rotational torque',
          'Rhythmic nasal breathing to manage heart-rate spikes',
        ],
        isCompleted: false,
      },
      {
        id: `drill-${stepNumber}-2`,
        title: `${sportName} Step ${stepNumber} — Dynamic Kinetic Sequencing`,
        durationMinutes: 15,
        technicalFocusPoints: [
          'Initiate acceleration burst from lower kinetic chain',
          'Follow through clean line toward target coordinate',
          'Execute 8 reps per set with 45s recovery intervals',
        ],
        isCompleted: false,
      },
      {
        id: `drill-${stepNumber}-3`,
        title: `${sportName} Step ${stepNumber} — Fatigue Resistance Pressure Test`,
        durationMinutes: 12,
        technicalFocusPoints: [
          'Maintain postural precision under elevated heart rate',
          'Track and eliminate mechanical form breakdown cues',
          'Conclude with 3-minute tissue mobility cooldown',
        ],
        isCompleted: false,
      },
    ]);
  }

  // Completion handler for individual drills & whole day
  const handleDrillComplete = async (drillTitle: string) => {
    setStepDrills((prev) =>
      prev.map((d) => (d.title === drillTitle ? { ...d, isCompleted: true } : d))
    );

    // Call POST /api/sports/drills/complete-day to persist in Neon PostgreSQL
    if (activeWorkspace) {
      try {
        const res = await fetch('/api/sports/drills/complete-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: activeWorkspace.id,
            stepNumber: activeStepIndex + 1,
            drillTitle,
            userId: activeProfileId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          // Update activeWorkspace step completed days in UI
          setActiveWorkspace((prev: any) => {
            if (!prev) return prev;
            const updatedSteps = (prev.steps || []).map((s: any, idx: number) => {
              if (idx === activeStepIndex) {
                return { ...s, practiceDaysCompleted: data.practiceDaysCompleted };
              }
              return s;
            });
            return { ...prev, steps: updatedSteps };
          });

          setDayCompleteNotice(`Drill "${drillTitle}" logged! Practice calendar updated with verified checkmark ✓`);
          setTimeout(() => setDayCompleteNotice(null), 4000);
        }
      } catch (err) {
        console.warn('Failed to sync complete-day API:', err);
      }
    }
  };

  const handlePracticeDayComplete = (completedDays: number) => {
    if (!activeWorkspace) return;
    setActiveWorkspace((prev: any) => {
      if (!prev) return prev;
      const updatedSteps = (prev.steps || []).map((s: any, idx: number) => {
        if (idx === activeStepIndex) {
          return { ...s, practiceDaysCompleted: completedDays };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleAdvanceStep = () => {
    if (!activeWorkspace) return;
    const steps = activeWorkspace.steps || [];
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handleQuizPassed = (score: number) => {
    if (!activeWorkspace) return;
    setActiveWorkspace((prev: any) => {
      if (!prev) return prev;
      const updatedSteps = (prev.steps || []).map((s: any, idx: number) => {
        if (idx === activeStepIndex) {
          return { ...s, status: 'PASSED', quizPassed: true, quizScore: score };
        }
        if (idx === activeStepIndex + 1 && (s.status === 'LOCKED' || s.status === 'STUDY_UNGENERATED')) {
          return { ...s, status: 'IN_PROGRESS' };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  const activeStep = activeWorkspace?.steps?.[activeStepIndex] || null;
  const completedDrillsCount = stepDrills.filter((d) => d.isCompleted).length;

  // V4 Shared Learning Engine Hook & State
  const {
    locked: packLocked,
    packStatus,
    packStage,
    packError,
    retry: retryPackBuild,
    startBuild,
    loading: packLoading,
  } = usePackStatus(activeStep?.id);

  const [packData, setPackData] = useState<any | null>(null);

  const fetchPack = useCallback(async (stepId: string) => {
    if (!stepId) return;
    try {
      const res = await fetch(`/api/steps/${stepId}/pack`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (!data.locked) {
          setPackData(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch sports pack:', err);
    }
  }, []);

  // Fetch pack immediately on step ID change or when packStatus transitions to READY
  useEffect(() => {
    setPackData(null);
    if (activeStep?.id) {
      fetchPack(activeStep.id);
    }
  }, [activeStep?.id, fetchPack]);

  useEffect(() => {
    if (packStatus === 'READY' && activeStep?.id) {
      fetchPack(activeStep.id);
    }
  }, [packStatus, activeStep?.id, fetchPack]);

  // Silent prefetch trigger after 20s of active reading or resource access
  useEngagement(activeStep?.id, !packLocked, packStatus === 'READY');

  const [dynamicQuizQuestions, setDynamicQuizQuestions] = useState<any[]>([]);

  const fetchDynamicQuiz = useCallback(async (stepId: string) => {
    try {
      const res = await fetch(`/api/steps/${stepId}/level-up-quiz`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setDynamicQuizQuestions(data.questions);
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (activeStep?.id && packStatus === 'READY') {
      fetchDynamicQuiz(activeStep.id);
    }
  }, [activeStep?.id, packStatus, fetchDynamicQuiz]);

  const activeQuizQuestions = useMemo(() => {
    if (dynamicQuizQuestions && dynamicQuizQuestions.length > 0) {
      return dynamicQuizQuestions.map((q: any) => ({
        id: q.id || q.questionId,
        question: q.question || q.scenario,
        options: Array.isArray(q.options)
          ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
          : [],
        correctOptionIndex: typeof q.correctOptionIndex === 'number'
          ? q.correctOptionIndex
          : (q.correctOptionId ? ['A', 'B', 'C', 'D'].indexOf(String(q.correctOptionId).toUpperCase()) : -1),
        correctOptionId: q.correctOptionId || '',
        explanation: q.explanation || 'Validated biomechanical and athletic comprehension.',
      }));
    }
    if (!activeStep) return [];
    const blueprintRaw = activeStep.quizBlueprint;
    let questions = Array.isArray(blueprintRaw)
      ? blueprintRaw
      : typeof blueprintRaw === 'string'
      ? JSON.parse(blueprintRaw || '[]')
      : [];

    return questions.map((q: any) => ({
      id: q.id || q.questionId,
      question: q.question || q.scenario,
      options: Array.isArray(q.options)
        ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
        : [],
      correctOptionIndex: typeof q.correctOptionIndex === 'number'
        ? q.correctOptionIndex
        : (q.correctOptionId ? ['A', 'B', 'C', 'D'].indexOf(String(q.correctOptionId).toUpperCase()) : -1),
      correctOptionId: q.correctOptionId || '',
      explanation: q.explanation || 'Validated biomechanical and athletic comprehension.',
    }));
  }, [dynamicQuizQuestions, activeStep]);

  const handleOpenQuizModal = async () => {
    if (activeStep?.id && dynamicQuizQuestions.length === 0) {
      await fetchDynamicQuiz(activeStep.id);
    }
    setShowQuizModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Active Sport Status */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
              ACTIVE ATHLETICS TRACK
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {activeWorkspace?.title || 'Conditioning Engine'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Step-Calibrated Drills & Multi-Day Practice Hub
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Execute dedicated biomechanical drills with built-in countdown stopwatches calibrated strictly to your current step level. Zero manual selectors required.
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Sport Track</span>
        </button>
      </div>

      {dayCompleteNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{dayCompleteNotice}</span>
        </div>
      )}

      {/* ACTIVE SPORT TRACK: STEP CALENDAR, TAILORED NUTRITION & DUAL-GATE PROGRESSION */}
      {activeWorkspace && activeStep && (
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  PRACTICE CALENDAR & NUTRITION ENGINE
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {activeWorkspace.title} • Milestone {activeStepIndex + 1} of {activeWorkspace.steps?.length || 5}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {activeStep.title}
              </h3>
              <div className="pt-2">
                <button
                  onClick={() => router.push(`/workspace/${activeWorkspace.id}`)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Study Milestone Pack & Verified Videos ➔</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(activeWorkspace.steps || []).map((s: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                    activeStepIndex === idx
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                      : s.status === 'PASSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <SportsStepTracker
            skillId={activeStep.id || activeWorkspace.id}
            stepNumber={activeStepIndex + 1}
            stepTitle={activeStep.title}
            skillCategory="physical"
            requiredPracticeDays={activeStep.requiredPracticeDays || 3}
            practiceDaysCompleted={activeStep.practiceDaysCompleted || 0}
            quizPassed={activeStep.quizPassed || activeStep.status === 'PASSED'}
            quizScore={activeStep.quizScore || (activeStep.status === 'PASSED' ? 85 : null)}
            dailyDietPlan={activeStep.dailyDietPlan}
            onPracticeDayComplete={handlePracticeDayComplete}
            onAdvanceStep={handleAdvanceStep}
            onOpenQuiz={handleOpenQuizModal}
          />

          {/* V4 SHARED SPORTS LEARNING ENGINE (STUDY PACK, VERIFIED VIDEOS, DRILL GUIDES) */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                    V4 ATHLETIC MASTERY ENGINE
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Technique Guides, Coaching Videos & Biomechanical Breakdowns
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 mt-1">
                  Milestone {activeStepIndex + 1} Study Pack & Verified Resources
                </h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                packStatus === 'READY'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : packStatus === 'BUILDING'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {packStatus === 'READY' ? 'PACK READY ✓' : packStatus === 'BUILDING' ? 'BUILDING PACK…' : 'NOT BUILT'}
              </span>
            </div>

            {packLocked ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Milestone {activeStepIndex + 1} Locked</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Complete previous milestone practice requirements and pass the Socratic Gate (70% score) to unlock this milestone.
                </p>
              </div>
            ) : packStatus === 'BUILDING' ? (
              <PackBuildingScreen
                packStage={packStage}
                packError={packError}
                isSports={true}
                onRetry={retryPackBuild}
              />
            ) : (packStatus === 'READY' || (packData?.chapters && packData.chapters.length > 0)) && packData ? (
              <div className="space-y-6">
                <StepIntroCard
                  stepTitle={packData.title || activeStep.title}
                  intro={packData.intro}
                  isSports={true}
                />

                <ChapterAccordion
                  chapters={packData.chapters || []}
                  stepId={activeStep.id}
                  onResourceReplaced={() => {
                    fetchPack(activeStep.id);
                  }}
                />

                {/* Socratic Gate Trigger Action Bar */}
                <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Ready for Biomechanical Comprehension Evaluation?
                    </h5>
                    <p className="text-xs text-slate-500">
                      Score at least 70% on the Socratic Evaluation Gate to verify milestone mastery.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenQuizModal}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Launch Milestone Socratic Gate (70%)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <StartStepCard
                stepTitle={activeStep.title}
                stepIndex={activeStepIndex + 1}
                difficultyTier={activeStep.difficultyTier}
                onSearchResources={startBuild}
                loading={packLoading}
                error={packStatus === 'FAILED' ? (packError || 'Resource search encountered an error. Please retry.') : null}
              />
            )}
          </div>
        </div>
      )}

      {/* MODULE 2 & 3: PER-STEP PHYSICAL CONDITIONING, DRILLS & YOGASANAS ENGINE */}
      {activeWorkspace && activeStep && (
        <SportsStepConditioningSection
          sportName={activeWorkspace.title || 'Athletics'}
          stepNumber={activeStepIndex + 1}
          stepTitle={activeStep.title || `Milestone ${activeStepIndex + 1}`}
          difficultyTier={activeStep.difficultyTier || 'Foundational'}
          userHealthConditions={user?.healthConditions || user?.medicalConditions || 'None'}
          preferredLanguage={currentLanguage}
          onItemCompleted={(itemId, dayNum) => {
            handleDrillComplete(itemId);
          }}
        />
      )}

      {/* ENROLLED ATHLETIC ROADMAPS (SWITCH TRACKS QUICKLY) */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                ENROLLED ATHLETIC ROADMAPS
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Full Trajectory with Milestone Gates
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Your Active Sports Trajectories
            </h3>
          </div>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Sport</span>
          </button>
        </div>

        {sportsTracks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-600">No sports tracks enrolled yet.</p>
            <p className="text-xs text-slate-400">
              Enroll in a tailored sport trajectory (e.g. Cricket Fast Bowling, Football Dribbling, or Badminton Smash Mechanics).
            </p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Enroll New Sport Track
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sportsTracks.map((track: any) => (
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
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Node</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      Milestone {track.passedStepsCount + 1} of {track.stepsCount || 5}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</p>
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

                <button
                  onClick={() => {
                    router.push(`/workspace/${track.id}`);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <span>Launch Sports Studio ➔</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODULE 3.1 SECTION 3: TAILORED DIETARY & HYDRATION SUGGESTIONS SECTION */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                ATHLETIC NUTRITION & FUELING
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Calibrated for {activeWorkspace?.title || 'Athletics'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Tailored Dietary & Hydration Protocol
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Precision fueling designed for your {user?.dietaryPreference || 'Vegetarian'} diet and {user?.healthConditions || 'active'} safety profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 rounded-xl">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>{user?.dietaryPreference || 'Vegetarian'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900 rounded-xl">
              <Droplet className="w-3.5 h-3.5 text-sky-600" />
              <span>{nutritionPlan?.hydrationTargetLiters ? `${nutritionPlan.hydrationTargetLiters}L/Day` : '2.5L–3.2L/Day'}</span>
            </span>
          </div>
        </div>

        {loadingNutrition && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
            <span>Formulating sports nutrition plan for {activeWorkspace?.title || 'your sport'}...</span>
          </div>
        )}

        {!loadingNutrition && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Morning Ignition */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-900">
                <span>🍳 Morning Ignition</span>
                <span className="text-amber-700 font-mono">Breakfast</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                {nutritionPlan?.morningIgnition?.title || 'Complex Carb & Protein Foundation'}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {nutritionPlan?.morningIgnition?.description || 'Oatmeal with chia seeds, crushed almonds, plant protein, and fresh berries.'}
              </p>
              {nutritionPlan?.morningIgnition?.targetMacros && (
                <div className="pt-2 border-t border-amber-200/60 text-[10px] font-mono font-bold text-amber-800">
                  Target: {nutritionPlan.morningIgnition.targetMacros}
                </div>
              )}
            </div>

            {/* Pre-Training Fuel */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-sky-900">
                <span>⚡ Pre-Training Fuel</span>
                <span className="text-sky-700 font-mono">60m Prior</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                {nutritionPlan?.preTrainingFuel?.title || 'Fast Glycogen & Hydration Surge'}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {nutritionPlan?.preTrainingFuel?.description || 'Banana with light almond butter and 350ml electrolyte water for muscle contraction.'}
              </p>
              {nutritionPlan?.preTrainingFuel?.timing && (
                <div className="pt-2 border-t border-sky-200/60 text-[10px] font-mono font-bold text-sky-800">
                  Window: {nutritionPlan.preTrainingFuel.timing}
                </div>
              )}
            </div>

            {/* Post-Training Recovery */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-900">
                <span>🥗 Post-Training Recovery</span>
                <span className="text-emerald-700 font-mono">Within 30m</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                {nutritionPlan?.postTrainingRecovery?.title || 'Rapid Amino Acid Replenishment'}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {nutritionPlan?.postTrainingRecovery?.description || 'Protein shake or Greek yogurt with honey and electrolytes to arrest muscle catabolism.'}
              </p>
              {nutritionPlan?.postTrainingRecovery?.keyNutrients && (
                <div className="pt-2 border-t border-emerald-200/60 text-[10px] font-mono font-bold text-emerald-800">
                  Nutrients: {nutritionPlan.postTrainingRecovery.keyNutrients}
                </div>
              )}
            </div>

            {/* Restorative Dinner */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-indigo-900">
                <span>🌙 Restorative Dinner</span>
                <span className="text-indigo-700 font-mono">Evening Repair</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                {nutritionPlan?.restorativeDinner?.title || 'Slow-Release Protein & Micronutrients'}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {nutritionPlan?.restorativeDinner?.description || 'Paneer/Tofu with quinoa, steamed broccoli, turmeric, and dark leafy greens.'}
              </p>
              {nutritionPlan?.restorativeDinner?.repairBenefit && (
                <div className="pt-2 border-t border-indigo-200/60 text-[10px] font-mono font-bold text-indigo-800">
                  Benefit: {nutritionPlan.restorativeDinner.repairBenefit}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODULE 3.1 SECTION 2: SMART SUGGESTIONS: "WHAT SPORT YOU SHOULD LEARN NEXT" */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                AI SPORT CALIBRATION
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Personalized for {user?.ageCategory || 'Open'} • {user?.healthConditions || 'Safe Kinetics'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              What Sport You Should Learn Next
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated athletic trajectories matching your kinetic baseline and joint protection requirements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              domain: 'Racket & Combat Sports',
              title: 'Badminton — Agility & Overhead Smash Mastery',
              badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
              rationale: 'Ultra-fast lateral reaction and wrist flick mechanics without heavy spinal compression.',
              intensity: 'Medium',
            },
            {
              domain: 'Track, Field & Swimming',
              title: 'Swimming — Freestyle Biomechanics & Breath Control',
              badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
              rationale: 'Zero ground-impact conditioning. Expands lung VO2 max while bulletproofing shoulder rotators.',
              intensity: 'Low Impact',
            },
            {
              domain: 'Team Ball Sports',
              title: 'Football — Ball Mastery & Agility Feints',
              badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              rationale: 'Develops bilateral foot dexterity, peripheral vision, and explosive low-center acceleration.',
              intensity: 'High',
            },
            {
              domain: 'Strength, Calisthenics & Gymnastics',
              title: 'Calisthenics & Gymnastic Ring Lever Strength',
              badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              rationale: 'Master your own bodyweight with progressive straight-arm isometric levers and joint health.',
              intensity: 'Medium',
            },
            {
              domain: 'Team Ball Sports',
              title: 'Cricket — Fast Bowling Action & Seam Mechanics',
              badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
              rationale: 'Kinetic chain sequencing from run-up gather to explosive wrist snap and follow-through.',
              intensity: 'High',
            },
            {
              domain: 'Mind-Body, Yoga & Mobility',
              title: 'Athletic Vinyasa Yoga & Joint Decompression',
              badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
              rationale: 'Restores fascia elasticity, corrects hip asymmetry, and accelerates recovery between sport sessions.',
              intensity: 'Low Impact',
            },
          ].map((sport, sIdx) => (
            <motion.div
              key={sIdx}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${sport.badgeColor}`}>
                    {sport.domain}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                    {sport.intensity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {sport.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {sport.rationale}
                </p>
              </div>

              <button
                onClick={() => {
                  setEnrollInitialTitle(sport.title);
                  setShowEnrollModal(true);
                }}
                className="w-full py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group-hover:shadow-md"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SOCRATIC QUIZ MODAL: STRICTLY RESERVED FOR MILESTONE GATES */}
      <SocraticQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        questions={activeQuizQuestions}
        stepId={activeStep?.id}
        stepTitle={activeStep?.title}
        stepNumber={activeStepIndex + 1}
        onPassed={handleQuizPassed}
      />

      {/* ENROLL MODAL */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setEnrollInitialTitle('');
        }}
        initialTitle={enrollInitialTitle}
        restrictToDomain="Athletics"
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
          setEnrollInitialTitle('');
          if (newTrack?.id) {
            setSelectedSportId(newTrack.id);
            loadSportsData(activeProfileId || 'default-profile');
          }
        }}
      />
    </div>
  );
}

export default SportsTrainingView;
