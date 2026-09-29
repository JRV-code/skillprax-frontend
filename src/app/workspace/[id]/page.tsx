'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WorkspaceStudioPage from '@/components/WorkspaceStudioPage';
import { SkillTrack, AIEngine } from '@/types';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id as string;

  const [dbWorkspace, setDbWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<AIEngine>('groq-llama-3.3-70b');

  useEffect(() => {
    async function fetchLiveWorkspace() {
      if (!workspaceId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        if (!res.ok) {
          throw new Error(`Workspace "${workspaceId}" not found in database.`);
        }
        const data = await res.json();
        const ws = data.workspace || data;
        setDbWorkspace(ws);
      } catch (err: any) {
        console.error('Failed to load workspace:', err);
        setError(err.message || 'Failed to fetch workspace.');
      } finally {
        setLoading(false);
      }
    }
    fetchLiveWorkspace();
  }, [workspaceId]);

  const handleNavigate = (page: 'landing' | 'profile' | 'studio') => {
    if (page === 'landing') router.push('/');
    else if (page === 'profile') router.push('/profile');
    else if (dbWorkspace) router.push(`/workspace/${dbWorkspace.id}`);
    else router.push('/profile');
  };

  const handlePassEvaluation = () => {
    if (!dbWorkspace) return;
    setDbWorkspace((prev: any) => {
      if (!prev) return prev;
      const updatedSteps = (prev.steps || []).map((s: any) => {
        if (s.status === 'IN_PROGRESS' || s.status === 'STUDY_READY' || s.status === 'EVAL_ACTIVE') {
          return { ...s, status: 'PASSED' };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
            Hydrating Workspace Studio...
          </span>
        </div>
      </div>
    );
  }

  if (error || !dbWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-900">Workspace Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Unable to locate requested workspace track.'}</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Return to Profile Hub
          </button>
        </div>
      </div>
    );
  }

  const steps = dbWorkspace.steps || [];
  const passedCount = steps.filter((s: any) => s.status === 'PASSED').length;
  const totalSteps = dbWorkspace.totalPlannedSteps || steps.length || 5;
  const currentStepNum = Math.min(totalSteps, passedCount + 1);
  const progressPercent = Math.round((passedCount / totalSteps) * 100);

  const currentTrack: SkillTrack = {
    id: dbWorkspace.id,
    title: dbWorkspace.title,
    category: dbWorkspace.domainCategory || dbWorkspace.domain || 'Science',
    tags: [dbWorkspace.domainCategory || 'Science', 'Autonomous', 'Groq LLaMA 3.3'],
    currentStep: currentStepNum,
    totalSteps,
    progressPercent,
    colorScheme:
      dbWorkspace.domainCategory === 'Athletics'
        ? 'emerald'
        : dbWorkspace.domainCategory === 'Science'
        ? 'amber'
        : dbWorkspace.domainCategory === 'Art'
        ? 'purple'
        : 'blue',
    icon:
      dbWorkspace.domainCategory === 'Athletics'
        ? 'Zap'
        : dbWorkspace.domainCategory === 'Science'
        ? 'FlaskConical'
        : 'Code',
    milestones: steps.map((s: any, idx: number) => ({
      id: s.id || `m-${idx + 1}`,
      stepNumber: s.stepIndex || idx + 1,
      title: s.title || `Step ${idx + 1}`,
      description: s.description || 'Milestone Unit',
      status: s.status === 'PASSED' ? 'completed' : s.status === 'LOCKED' ? 'locked' : 'active',
      acus: Array.isArray(s.assessableUnits)
        ? s.assessableUnits.map((a: any) => typeof a === 'string' ? a : (a.title || 'ACU'))
        : [],
    })),
  };

  return (
    <WorkspaceStudioPage
      currentTrack={currentTrack}
      rawWorkspace={dbWorkspace}
      onNavigate={handleNavigate}
      selectedEngine={selectedEngine}
      onSelectEngine={setSelectedEngine}
      onPassEvaluation={handlePassEvaluation}
    />
  );
}

