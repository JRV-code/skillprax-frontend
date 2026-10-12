'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Plus, Clock, CheckCircle2, ChevronRight, 
  RotateCcw, Sparkles, RefreshCw, Zap, Shield, Target,
  Dumbbell, Flame, Check
} from 'lucide-react';
import { SportsStepTracker } from '@/components/workspace/SportsStepTracker';
import { DrillCardWithTimer } from './DrillCardWithTimer';
import { SocraticQuizModal } from '@/components/SocraticQuizModal';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { useLanguage } from '@/context/LanguageContext';

export interface StepDrillItem {
  id: string;
  title: string;
  durationMinutes: number;
  technicalFocusPoints: string[];
  isCompleted: boolean;
}

export function SportsTrainingView() {
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
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [stepDrills, setStepDrills] = useState<StepDrillItem[]>([]);
  const [dayCompleteNotice, setDayCompleteNotice] = useState<string | null>(null);

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

  const activeQuizQuestions = React.useMemo(() => {
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
        : (q.correctOptionId ? ['A', 'B', 'C', 'D'].indexOf(String(q.correctOptionId).toUpperCase()) : 0),
      correctOptionId: q.correctOptionId || 'A',
      explanation: q.explanation || 'Validated biomechanical and athletic comprehension.',
    }));
  }, [activeStep]);

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
            onOpenQuiz={() => setShowQuizModal(true)}
          />
        </div>
      )}

      {/* MODULE 2 & 3: EMBEDDED STEP EXECUTION DRILLS WITH IN-CARD COUNTDOWN TIMERS */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Activity className="w-5 h-5"/>
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Step {activeStepIndex + 1}: Practical Execution Drills
              </h3>
              <p className="text-xs text-slate-500">
                Execute these physical biomechanical drills to build muscle memory before attempting the milestone gate.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {completedDrillsCount} of {stepDrills.length} Drills Completed
          </span>
        </div>

        {loadingDrills && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Calibrating step biomechanics drills for {activeWorkspace?.title || 'your sport'}...</span>
          </div>
        )}

        {!loadingDrills && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stepDrills.map((drill, idx) => (
              <DrillCardWithTimer
                key={drill.id || idx}
                drillNumber={idx + 1}
                title={drill.title}
                durationMinutes={drill.durationMinutes}
                technicalFocusPoints={drill.technicalFocusPoints}
                isCompleted={drill.isCompleted}
                onDrillComplete={handleDrillComplete}
              />
            ))}
          </div>
        )}
      </div>

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
                    setSelectedSportId(track.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Launch Sports Studio ➔</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
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
        onClose={() => setShowEnrollModal(false)}
        restrictToDomain="Athletics"
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
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
