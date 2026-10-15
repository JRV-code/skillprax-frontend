'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  GitBranch,
  BookOpen,
  Zap,
  ArrowRight,
  Video,
  FileText,
  Clock,
  Lock,
  Target,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronLeft,
  Dumbbell,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { QuizAndEvaluationEngine } from '@/components/QuizAndEvaluationEngine';
import { GiveUpSkillFrictionModal } from '@/components/learning/GiveUpSkillFrictionModal';
import { StartStepCard } from '@/components/learning/StartStepCard';
import { PackBuildingScreen } from '@/components/learning/PackBuildingScreen';
import { StepIntroCard } from '@/components/learning/StepIntroCard';
import { ChapterAccordion } from '@/components/learning/ChapterAccordion';
import { VideoRow } from '@/components/learning/VideoRow';
import { PersistentPlayerHost } from '@/components/learning/video/PersistentPlayerHost';
import { SportsDailyTrainingSection, StepTrainingPlan } from './SportsDailyTrainingSection';

interface SportsWorkspaceStudioPageProps {
  rawWorkspace: any;
  onNavigate?: (page: 'landing' | 'profile' | 'sports') => void;
  onPassEvaluation?: () => void;
}

export function SportsWorkspaceStudioPage({
  rawWorkspace,
  onNavigate,
  onPassEvaluation,
}: SportsWorkspaceStudioPageProps) {
  const router = useRouter();

  // Active Tab: 'roadmap' | 'training' | 'resources' | 'evaluation'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'training' | 'evaluation'>('training');
  const [showGiveUpModal, setShowGiveUpModal] = useState<boolean>(false);

  // Steps
  const dbSteps = useMemo(() => {
    if (rawWorkspace?.steps && Array.isArray(rawWorkspace.steps) && rawWorkspace.steps.length > 0) {
      return [...rawWorkspace.steps].sort((a: any, b: any) => (a.stepIndex || 0) - (b.stepIndex || 0));
    }
    return [];
  }, [rawWorkspace]);

  // Active Step Index (1-indexed)
  const activeStepIndex = useMemo(() => {
    if (dbSteps.length === 0) return 1;
    const firstUnpassed = dbSteps.find((s: any) => s.status !== 'PASSED');
    return firstUnpassed ? (firstUnpassed.stepIndex || 1) : dbSteps.length;
  }, [dbSteps]);

  // Viewing Step Index (1-indexed)
  const [viewingStepIndex, setViewingStepIndex] = useState<number>(activeStepIndex);

  useEffect(() => {
    setViewingStepIndex(activeStepIndex);
  }, [activeStepIndex]);

  const viewingStepObj = useMemo(() => {
    return dbSteps.find((s: any) => s.stepIndex === viewingStepIndex) || dbSteps[0];
  }, [dbSteps, viewingStepIndex]);

  const viewingStepId = viewingStepObj?.id || '';
  const viewingStepTitle = viewingStepObj?.title || `Milestone ${viewingStepIndex}`;
  const totalPlannedSteps = rawWorkspace?.totalPlannedSteps || dbSteps.length || 5;

  const passedStepsCount = dbSteps.filter((s: any) => s.status === 'PASSED').length;
  const progressPercent = Math.round((passedStepsCount / (totalPlannedSteps || 1)) * 100);

  // Sports Pack Fetching & Polling State
  const [packData, setPackData] = useState<any | null>(null);
  const [packStatus, setPackStatus] = useState<string>('NOT_BUILT');
  const [packStage, setPackStage] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);
  const [isBuildingPack, setIsBuildingPack] = useState<boolean>(false);

  const fetchSportsPack = useCallback(async (stepId: string) => {
    if (!stepId) return;
    try {
      const res = await fetch(`/api/sports-workspace/steps/${stepId}/pack`);
      if (res.ok) {
        const data = await res.json();
        setPackData(data);
        setPackStatus(data.packStatus || 'READY');
        setPackStage(data.packStage || 'READY');
        setPackError(null);
      } else {
        // Poll status
        const sRes = await fetch(`/api/sports-workspace/steps/${stepId}/pack-status`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setPackStatus(sData.packStatus || 'NOT_BUILT');
          setPackStage(sData.packStage || null);
          setPackError(sData.packError || null);
        }
      }
    } catch (err: any) {
      console.warn('[fetchSportsPack] notice:', err);
    }
  }, []);

  useEffect(() => {
    if (viewingStepId) {
      setPackData(null);
      setPackStatus(viewingStepObj?.packStatus || 'NOT_BUILT');
      fetchSportsPack(viewingStepId);
    }
  }, [viewingStepId, viewingStepObj, fetchSportsPack]);

  // Polling when pack is BUILDING
  useEffect(() => {
    if (packStatus !== 'BUILDING' || !viewingStepId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sports-workspace/steps/${viewingStepId}/pack-status`);
        if (res.ok) {
          const data = await res.json();
          setPackStage(data.packStage || null);
          setPackError(data.packError || null);

          if (data.packStatus === 'READY') {
            clearInterval(interval);
            setPackStatus('READY');
            fetchSportsPack(viewingStepId);
          } else if (data.packStatus === 'FAILED') {
            clearInterval(interval);
            setPackStatus('FAILED');
          }
        }
      } catch (_) {}
    }, 2000);

    return () => clearInterval(interval);
  }, [packStatus, viewingStepId, fetchSportsPack]);

  // Trigger Build Pack
  const handleStartBuildPack = async () => {
    if (!viewingStepId || isBuildingPack) return;
    try {
      setIsBuildingPack(true);
      setPackStatus('BUILDING');
      setPackStage('RESEARCHING');
      setPackError(null);

      const res = await fetch(`/api/sports-workspace/steps/${viewingStepId}/build-pack`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setPackStatus('BUILDING');
        setPackStage(data.packStage || 'RESEARCHING');
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to trigger sports pack build');
      }
    } catch (err: any) {
      setPackStatus('FAILED');
      setPackError(err.message || 'Build initialization failed');
    } finally {
      setIsBuildingPack(false);
    }
  };

  const handleStepPassed = (score: number) => {
    if (onPassEvaluation) onPassEvaluation();
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
    if (viewingStepIndex < totalPlannedSteps) {
      setViewingStepIndex(viewingStepIndex + 1);
    }
  };

  const sportName = rawWorkspace?.skillName || rawWorkspace?.title || 'Athletic Mastery';
  const subGenre = rawWorkspace?.subGenre || 'Physical Conditioning';
  const healthConditions = rawWorkspace?.userProfile?.healthConditions || 'None';
  const dietaryPreference = rawWorkspace?.userProfile?.dietaryPreference || 'Vegetarian';

  const isStepLocked = viewingStepObj?.status === 'LOCKED' && viewingStepIndex > activeStepIndex;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans pb-28">
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <SkillTrackLogo size="sm" />
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
              SPORTS STUDIO
            </span>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">
              {sportName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGiveUpModal(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
          >
            Give Up Track
          </button>

          <button
            type="button"
            onClick={() => router.push('/sports')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            ← Back to Sports Hub
          </button>
        </div>
      </header>

      {/* 2. SUB-HERO IDENTITY BANNER */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase {activeStepIndex} of {totalPlannedSteps} Active
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {subGenre}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
              {sportName} Athletic Studio
            </h1>
          </div>

          {/* Progress Indicator */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                OVERALL MASTERY
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {progressPercent}% Completed
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#0284C7] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* HORIZONTAL CURRICULUM ARCHITECTURE ROADMAP */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 min-w-[640px]">
            {dbSteps.map((s: any, idx: number) => {
              const stepNum = s.stepIndex || idx + 1;
              const isSelected = viewingStepIndex === stepNum;
              const isPassed = s.status === 'PASSED';
              const isLocked = s.status === 'LOCKED' && stepNum > activeStepIndex;

              return (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setViewingStepIndex(stepNum)}
                  className={`flex-1 p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#0284C7] bg-sky-50/50 shadow-sm ring-2 ring-sky-200'
                      : isPassed
                      ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50'
                      : isLocked
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Phase {stepNum}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-sky-600" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {s.title}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. WORKSPACE TABS */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 backdrop-blur-md w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'training'
                ? 'bg-white text-emerald-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            <span>Daily Training Regimen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'bg-white text-sky-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Study Resources & Lectures</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluation')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'evaluation'
                ? 'bg-white text-indigo-950 font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Socratic Gate (70%)</span>
          </button>
        </div>

        {/* 5. TAB CONTENT RENDERING */}
        {isStepLocked ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900">
              Phase {viewingStepIndex} is Locked
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Pass the Socratic Gate for Phase {viewingStepIndex - 1} at the 70% threshold to unlock these athletic study materials and practice drills.
            </p>
          </div>
        ) : packStatus === 'NOT_BUILT' || !packData ? (
          <StartStepCard
            stepIndex={viewingStepIndex}
            stepTitle={viewingStepTitle}
            difficultyTier={viewingStepObj?.difficultyTier}
            loading={isBuildingPack || packStatus === 'BUILDING'}
            onSearchResources={handleStartBuildPack}
            error={packError}
          />
        ) : packStatus === 'BUILDING' ? (
          <PackBuildingScreen
            packStage={packStage}
            packError={packError}
            isSports={true}
            onRetry={handleStartBuildPack}
          />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'training' && (
              <motion.div
                key="tab-training"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {packData?.trainingPlan ? (
                  <SportsDailyTrainingSection
                    stepId={viewingStepId}
                    stepNumber={viewingStepIndex}
                    sportName={sportName}
                    trainingPlan={packData.trainingPlan}
                    healthConditions={healthConditions}
                    dietaryPreference={dietaryPreference}
                  />
                ) : (
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                    <p className="text-xs text-slate-500">
                      Training plan is being calibrated for this milestone. Click below to refresh.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartBuildPack()}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Regenerate Training Pack
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div
                key="tab-roadmap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step Intro Card */}
                {packData?.intro && (
                  <StepIntroCard
                    stepTitle={packData.title || viewingStepTitle}
                    intro={packData.intro}
                    isSports={true}
                  />
                )}

                {/* Video Row */}
                {Array.isArray(packData?.videos) && packData.videos.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-200 flex items-center justify-center font-bold">
                        <Video className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-heading font-bold text-slate-900">
                          Coaching Video Masterclass & Form Demonstrations
                        </h4>
                        <p className="text-xs text-slate-500">
                          Verified visual breakdowns playing directly in-app
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {packData.videos.map((vid: any) => (
                        <VideoRow key={vid.id || vid.videoId} video={vid} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapter Accordion */}
                {Array.isArray(packData?.chapters) && packData.chapters.length > 0 && (
                  <ChapterAccordion chapters={packData.chapters} stepId={viewingStepId} />
                )}
              </motion.div>
            )}

            {activeTab === 'evaluation' && (
              <motion.div
                key="tab-evaluation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md">
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      THEORETICAL & TACTICAL GATE
                    </span>
                    <h3 className="text-lg font-heading font-black text-slate-900 mt-2">
                      Phase {viewingStepIndex} Socratic Verification
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Test your understanding of tactical positioning, officiating rules, and biomechanical mechanics. Passing threshold is 70%.
                    </p>
                  </div>

                  <QuizAndEvaluationEngine
                    stepId={viewingStepId}
                    stepIndex={viewingStepIndex}
                    stepTitle={viewingStepTitle}
                    onStepPassed={handleStepPassed}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Give Up Modal */}
      <GiveUpSkillFrictionModal
        isOpen={showGiveUpModal}
        onClose={() => setShowGiveUpModal(false)}
        workspaceId={rawWorkspace?.id || ''}
        skillName={sportName}
        subGenre={subGenre}
        currentStepIndex={activeStepIndex}
        totalSteps={totalPlannedSteps}
        completedStepsCount={passedStepsCount}
        currentStepTitle={viewingStepTitle}
        onDeleted={() => {
          setShowGiveUpModal(false);
          router.push('/sports');
        }}
      />

      {/* Persistent Video Player Host */}
      <PersistentPlayerHost />
    </div>
  );
}

export default SportsWorkspaceStudioPage;
