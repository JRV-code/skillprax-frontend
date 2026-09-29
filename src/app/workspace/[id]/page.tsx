'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Flame, Shield, ArrowLeft, CheckCircle, 
  Lock, BookOpen, Layers, Menu, X, ExternalLink, Zap, Sparkles, Loader2, GitBranch
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { QuizAndEvaluationEngine } from '@/components/QuizAndEvaluationEngine';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { InteractiveNodeFlow } from '@/components/InteractiveNodeFlow';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'study' | 'flowchart'>('study');
  const [isCurriculumLoaded, setIsCurriculumLoaded] = useState<Record<string, boolean>>({});
  const [loadingCurriculum, setLoadingCurriculum] = useState<boolean>(false);
  const [isRemediationActive, setIsRemediationActive] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleLoadCurriculum = async (stepId: string) => {
    setLoadingCurriculum(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/steps/${stepId}/level-up-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.resources) {
          setWorkspace((prev: any) => ({
            ...prev,
            steps: prev.steps.map((s: any) =>
              s.id === stepId ? { ...s, resources: data.resources } : s
            ),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load curriculum:', e);
    } finally {
      setIsCurriculumLoaded((prev) => ({ ...prev, [stepId]: true }));
      setLoadingCurriculum(false);
    }
  };

  const loadWorkspaceData = useCallback(async () => {
    if (!workspaceId || workspaceId === 'undefined') return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error('Failed to load workspace');
      const data = await res.json();
      const ws = data.workspace || data;
      setWorkspace(ws);
      if (ws?.steps?.length > 0) {
        const currentActive = ws.steps.find((s: any) => s.status === 'IN_PROGRESS') || ws.steps[0];
        setActiveStepIndex(currentActive.stepIndex);
      }
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || 'Failed to load workspace.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, API_BASE_URL]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tech-grid">
        <div className="flex flex-col items-center gap-3 p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-200 shadow-xl">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold font-heading text-slate-700">Loading Socratic Workspace...</span>
        </div>
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-tech-grid p-6">
        <div className="p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 text-center max-w-md shadow-2xl">
          <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">Workspace Unavailable</h3>
          <p className="text-xs text-slate-500 mb-6">{loadError || 'The requested workspace could not be found.'}</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = workspace?.steps?.find((s: any) => s.stepIndex === activeStepIndex) || workspace?.steps?.[0];

  return (
    <div className="relative min-h-screen text-slate-800 bg-tech-grid flex flex-col font-sans overflow-x-hidden">
      {/* Cinematic Dual-Buffer Crossfading Background */}
      <CinematicVideoBackground src="/assets/background-motion.mp4" overlayOpacity={0.2} />

      {/* Top Telemetry Header Navigation */}
      <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur-md border-b border-emerald-100/80 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-xl hover:bg-slate-100/80 text-slate-500 transition-colors cursor-pointer" title="Back to Profile">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <SkillpraxLogo size="sm" className="hover:brightness-110 active:scale-95 transition-all cursor-pointer" />
          </Link>
        </div>

        {/* Gamified Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/90 border border-orange-200 text-orange-700 text-xs font-bold shadow-xs">
            <Flame className="w-4 h-4 text-orange-500 flame-active" />
            <span>7 DAYS</span>
          </div>

          <div className="freeze-shield-glint flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs font-bold shadow-xs">
            <Shield className="w-4 h-4 text-cyan-600" />
            <span>1 SHIELD</span>
          </div>

          {!isRemediationActive && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Arena */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 md:px-8 py-6 gap-6 relative z-10">
        {/* Step Navigation Sidebar (Hidden while Targeted Remediation Gate is Active) */}
        {!isRemediationActive && (
          <aside
            className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white/95 md:bg-white/80 md:backdrop-blur-md border-r md:border border-emerald-200/80 p-5 rounded-none md:rounded-3xl shadow-xl md:shadow-lg transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700">Milestone Map</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {workspace?.steps?.filter((s: any) => s.status === 'PASSED').length || 0}/{workspace?.steps?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {workspace?.steps?.map((step: any) => {
                const isActive = step.stepIndex === activeStepIndex;
                const isLocked = step.status === 'LOCKED';
                const isPassed = step.status === 'PASSED';

                return (
                  <button
                    key={step.id || step.stepIndex}
                    disabled={isLocked}
                    onClick={() => {
                      setActiveStepIndex(step.stepIndex);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                        : isLocked
                        ? 'text-slate-400 bg-slate-50/50 border border-slate-100 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-white bg-white/60 border border-slate-200/60 hover:border-emerald-300'
                    }`}
                  >
                    <span className="truncate mr-2 font-heading">
                      {step.stepIndex}. {step.title}
                    </span>
                    {isPassed ? (
                      <CheckCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Active Workspace Surface */}
        <main className="flex-1 w-full max-w-4xl space-y-6">
          {/* View Tab Switcher (Hidden during remediation) */}
          {!isRemediationActive && (
            <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl shadow-inner w-fit">
              <button
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'study'
                    ? 'bg-white text-emerald-800 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Study & Evaluation Surface</span>
              </button>
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'flowchart'
                    ? 'bg-white text-emerald-800 shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-sky-600" />
                <span>Interactive Living Node Graph</span>
              </button>
            </div>
          )}

          {activeTab === 'flowchart' && !isRemediationActive ? (
            <div className="view-transition-enter">
              <InteractiveNodeFlow
                workspace={workspace}
                onOpenQuiz={() => setActiveTab('study')}
                onPassEvaluation={() => loadWorkspaceData()}
              />
            </div>
          ) : (
            <div className="view-transition-enter space-y-6">
              {/* Active Milestone Title Banner */}
              <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-lg shadow-emerald-950/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Milestone {activeStepIndex} of {workspace?.steps?.length || 5}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 mt-2">{activeStep?.title}</h2>
                  {activeStep?.description && (
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">{activeStep.description}</p>
                  )}
                </div>
              </div>

              {/* Lazy-Gated Milestone Study Curriculum Hub (Hidden during remediation) */}
              {activeStep && !isRemediationActive && (
                <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/80 shadow-lg shadow-emerald-950/5 space-y-4 wobble-card">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-heading font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      Authoritative Study Curriculum
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Token-Saver Lazy Load
                    </span>
                  </div>

                  {!isCurriculumLoaded[activeStep.id] && (!activeStep.resources || activeStep.resources.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50/80 border border-slate-200/70 rounded-2xl space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-base font-heading font-bold text-slate-800">Milestone Curriculum Ready</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Synthesize high-yield documentation links and canonical video segments for Milestone {activeStepIndex}.
                      </p>
                      <button
                        onClick={() => handleLoadCurriculum(activeStep.id)}
                        disabled={loadingCurriculum}
                        className="btn-primary inline-flex items-center gap-2 cursor-pointer btn-shimmer"
                      >
                        {loadingCurriculum ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                        )}
                        <span>⚡ Build My Milestone Curriculum</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(activeStep.resources || []).map((res: any, rIdx: number) => (
                        <a
                          key={rIdx}
                          href={res.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 bg-slate-50/60 hover:bg-white transition-all text-xs group shadow-xs hover:shadow-md"
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="font-heading font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                              {res.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                          {res.studyGuidance && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{res.studyGuidance}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Socratic Engine */}
              {activeStep && (
                <QuizAndEvaluationEngine
                  stepId={activeStep.id}
                  stepIndex={activeStep.stepIndex}
                  stepTitle={activeStep.title}
                  acus={activeStep.assessableUnits || activeStep.acus || []}
                  onRemediationStateChange={setIsRemediationActive}
                  onStepPassed={async () => {
                    setWorkspace((prev: any) => ({
                      ...prev,
                      steps: prev.steps.map((s: any) =>
                        s.stepIndex === activeStepIndex ? { ...s, status: 'PASSED' } : s
                      ),
                    }));
                    try {
                      await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/next-step`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      loadWorkspaceData();
                    } catch (e) {
                      console.error('Failed to advance step:', e);
                    }
                  }}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
