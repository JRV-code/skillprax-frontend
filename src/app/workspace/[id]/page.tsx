'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Flame, Shield, ArrowLeft, CheckCircle, 
  Lock, BookOpen, Layers, Menu, X, ExternalLink
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';
import { QuizAndEvaluationEngine } from '@/components/QuizAndEvaluationEngine';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center max-w-md">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Workspace Unavailable</h3>
          <p className="text-sm text-slate-500 mb-4">{loadError || 'The requested workspace could not be found.'}</p>
          <Link href="/" className="btn-primary inline-flex">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = workspace?.steps?.find((s: any) => s.stepIndex === activeStepIndex) || workspace?.steps?.[0];

  return (
    <div className="relative min-h-screen text-slate-800 bg-transparent flex flex-col font-sans">
      {/* Background Layer */}
      <CinematicVideoBackground src="/assets/background-motion.mp4" overlayOpacity={0.25} />

      {/* Top Telemetry Navigation */}
      <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/">
            <SkillpraxLogo size="sm" className="hover:brightness-110 active:scale-95 transition-all cursor-pointer" />
          </Link>
        </div>

        {/* Gamified Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-500 flame-active" />
            <span>7 DAYS</span>
          </div>

          <div className="freeze-shield-glint flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-cyan-600" />
            <span>1 SHIELD</span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 md:px-8 py-6 gap-6 relative">
        {/* Step Navigation Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-20 w-72 bg-white/95 md:bg-white/60 md:backdrop-blur-sm border-r md:border border-slate-200/80 p-5 rounded-none md:rounded-2xl transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Map</span>
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isLocked
                      ? 'text-slate-400 bg-slate-50/50 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-white/90 bg-white/40'
                  }`}
                >
                  <span className="truncate mr-2">
                    {step.stepIndex}. {step.title}
                  </span>
                  {isPassed ? (
                    <CheckCircle className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Step Workspace Surface */}
        <main className="flex-1 w-full max-w-4xl space-y-6">
          <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Milestone {activeStepIndex} of {workspace?.steps?.length || 5}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeStep?.title}</h2>
              {activeStep?.description && (
                <p className="text-xs text-slate-500 mt-1">{activeStep.description}</p>
              )}
            </div>
          </div>

          {/* Curated Resources Section */}
          {activeStep?.resources && activeStep.resources.length > 0 && (
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Curated Milestone Materials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeStep.resources.map((res: any, rIdx: number) => (
                  <a
                    key={rIdx}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white/60 hover:bg-white transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                        {res.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </div>
                    {res.studyGuidance && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{res.studyGuidance}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Socratic Engine */}
          {activeStep && (
            <QuizAndEvaluationEngine
              stepId={activeStep.id}
              stepIndex={activeStep.stepIndex}
              stepTitle={activeStep.title}
              acus={activeStep.assessableUnits || activeStep.acus || []}
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
        </main>
      </div>
    </div>
  );
}
