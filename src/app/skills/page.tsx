'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BookOpen, Video, Zap, CheckCircle2, AlertCircle, 
  ArrowRight, ArrowLeft, Plus, RefreshCw, Award, 
  Sparkles, ExternalLink, ShieldCheck, Compass, Check 
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { EnrollSkillModal } from '@/components/EnrollSkillModal';
import { SocraticQuizModal } from '@/components/SocraticQuizModal';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';
import { Navbar } from '@/components/common/Navbar';

function CognitiveSkillsWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTrackId = searchParams.get('id');

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [cognitiveTracks, setCognitiveTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(queryTrackId);
  const [currentWorkspace, setCurrentWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active Milestone Step
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'reader' | 'video' | 'quadrants'>('reader');
  
  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';
    setActiveProfileId(storedId);
    loadCognitiveTracks(storedId);
  }, []);

  useEffect(() => {
    if (queryTrackId) {
      setSelectedTrackId(queryTrackId);
    }
  }, [queryTrackId]);

  useEffect(() => {
    if (selectedTrackId) {
      loadWorkspaceDetails(selectedTrackId);
    }
  }, [selectedTrackId]);

  async function loadCognitiveTracks(profileId: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/profiles/${profileId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile);
        const all = data.enrolledWorkspaces || [];
        // Strictly filter OUT all athletic sports
        const cognitiveOnly = all.filter((w: any) => {
          const dom = (w.domainCategory || w.domain || '').toLowerCase();
          const title = (w.title || '').toLowerCase();
          const isSport = dom === 'athletics' || 
            ['cricket', 'football', 'soccer', 'swimming', 'basketball', 'tennis', 'calisthenics', 'sprint'].some(s => title.includes(s));
          return !isSport;
        });
        setCognitiveTracks(cognitiveOnly);

        // If no selectedTrackId yet, pick the first cognitive track or query param
        if (!selectedTrackId && cognitiveOnly.length > 0) {
          const targetId = queryTrackId || cognitiveOnly[0].id;
          setSelectedTrackId(targetId);
        }
      }
    } catch (err) {
      console.error('Failed to load cognitive tracks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkspaceDetails(workspaceId: string) {
    try {
      setLoadingWorkspace(true);
      setError(null);
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) {
        throw new Error(`Cognitive track "${workspaceId}" not found.`);
      }
      const data = await res.json();
      const ws = data.workspace || data;

      // Ensure no sports track has leaked into this route
      const isSport = (ws.domainCategory || '').toLowerCase() === 'athletics' ||
        ['cricket', 'football', 'soccer', 'swimming', 'tennis', 'basketball'].some(s => (ws.title || '').toLowerCase().includes(s));
      if (isSport) {
        router.push(`/sports?id=${ws.id}`);
        return;
      }

      setCurrentWorkspace(ws);
      const steps = ws.steps || [];
      const firstActiveIdx = steps.findIndex((s: any) => s.status !== 'PASSED');
      setCurrentStepIndex(firstActiveIdx >= 0 ? firstActiveIdx : 0);
    } catch (err: any) {
      console.error('Failed to load workspace:', err);
      setError(err.message || 'Failed to load cognitive workspace.');
    } finally {
      setLoadingWorkspace(false);
    }
  }

  const steps = currentWorkspace?.steps || [];
  const currentStep = steps[currentStepIndex] || null;

  // Extract quiz questions for current step
  const quizQuestions = React.useMemo(() => {
    if (!currentStep) return [];
    const blueprintRaw = currentStep.quizBlueprint;
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
      explanation: q.explanation || 'Verified conceptual mechanics.',
    }));
  }, [currentStep]);

  // Extract YouTube ID
  const youtubeVideoId = React.useMemo(() => {
    if (!currentStep) return null;
    if (currentStep.videoId && currentStep.videoId.length === 11) return currentStep.videoId;
    const url = currentStep.videoUrl;
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }, [currentStep]);

  // Extract Quadrants
  const quadrants = React.useMemo(() => {
    if (!currentStep) return [];
    const raw = currentStep.documentationQuadrants;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch (_) { return []; }
    }
    return [];
  }, [currentStep]);

  const handleQuizPassed = (score: number) => {
    if (!currentStep || !currentWorkspace) return;
    setCurrentWorkspace((prev: any) => {
      if (!prev) return prev;
      const updated = (prev.steps || []).map((s: any, idx: number) => {
        if (idx === currentStepIndex) {
          return { ...s, status: 'PASSED', quizPassed: true, quizScore: score };
        }
        if (idx === currentStepIndex + 1 && (s.status === 'LOCKED' || s.status === 'STUDY_UNGENERATED')) {
          return { ...s, status: 'STUDY_READY' };
        }
        return s;
      });
      return { ...prev, steps: updated };
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <CinematicVideoBackground />

      {/* Universal Top Tri-Separation Navbar */}
      <Navbar />

      {/* HEADER NAVIGATION */}
      <header className="z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SkillTrackLogo />
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs font-semibold">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-950 border border-sky-800 text-sky-400 font-mono uppercase text-[10px]">
              Cognitive Studio
            </span>
            <span className="text-slate-400">Mental, Creative & Tech Tracks</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEnrollModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enroll Skill</span>
          </button>

          <Link
            href="/profile"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            Profile Hub ➔
          </Link>
        </div>
      </header>

      {/* TRACK SWITCHER STRIP */}
      {cognitiveTracks.length > 0 && (
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 md:px-8 py-2.5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono shrink-0 mr-1">
            Enrolled Skills:
          </span>
          {cognitiveTracks.map((tr) => (
            <button
              key={tr.id}
              onClick={() => setSelectedTrackId(tr.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                selectedTrackId === tr.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tr.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/30 rounded-full">
                {tr.progress}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        {loadingWorkspace ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              Synthesizing Cognitive Learning Studio...
            </p>
          </div>
        ) : error || !currentWorkspace ? (
          <div className="py-20 text-center bg-slate-950/40 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Cognitive Track Selected</h3>
            <p className="text-xs text-slate-400">
              Enroll in a mental, technical, or creative skill to launch the pedagogical studio.
            </p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold"
            >
              Enroll Cognitive Skill Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TRACK HERO & MILESTONE STEP SELECTOR */}
            <div className="p-6 md:p-8 bg-slate-950/70 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded-md border border-sky-800">
                      {currentWorkspace.domainCategory || 'Cognitive Track'}
                    </span>
                    {currentWorkspace.subGenre && (
                      <span className="text-[10px] font-bold text-slate-400">
                        • {currentWorkspace.subGenre}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5 tracking-tight">
                    {currentWorkspace.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowQuizModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-sky-600 hover:from-amber-400 hover:to-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-900/30 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Take Socratic Quiz</span>
                  </button>
                </div>
              </div>

              {/* Progressive Difficulty Steps Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Pedagogical Milestones ({steps.length} Steps)</span>
                  <span className="text-sky-400 font-mono">
                    Step {currentStepIndex + 1}: {currentStep?.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {steps.map((st: any, idx: number) => {
                    const isSelected = currentStepIndex === idx;
                    const isPassed = st.status === 'PASSED';
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentStepIndex(idx)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/30'
                            : isPassed
                            ? 'bg-slate-900/80 border-emerald-900/50 hover:border-emerald-700'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold font-mono ${
                            isSelected ? 'text-sky-400' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                            Step {st.stepNumber || idx + 1}
                          </span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-xs font-bold text-slate-200 line-clamp-1">
                          {st.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TAB SELECTOR: Pedagogical Reader, YouTube Video, Quadrants */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('reader')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'reader'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pedagogical Document Reader</span>
              </button>

              <button
                onClick={() => setActiveTab('quadrants')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'quadrants'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>4-Quadrant Synthesis Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Step Video Breakdown</span>
              </button>
            </div>

            {/* TAB 1: PEDAGOGICAL DOCUMENT READER */}
            {activeTab === 'reader' && (
              <div className="p-6 md:p-8 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-6 shadow-xl leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 font-mono">
                      Step {currentStepIndex + 1} Deep Documentation
                    </span>
                    <h2 className="text-xl font-black text-white mt-0.5">
                      {currentStep?.title}
                    </h2>
                  </div>
                  {currentStep?.documentationSourceUrl && (
                    <a
                      href={currentStep.documentationSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Verified Web Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 text-sm space-y-4">
                  {currentStep?.documentationMarkdown ? (
                    renderMarkdownContent(currentStep.documentationMarkdown)
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No documentation synthesized yet. Please generate or refresh step content.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: 4-QUADRANT SYNTHESIS CARDS */}
            {activeTab === 'quadrants' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadrants.length > 0 ? (
                  quadrants.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded-md border border-sky-800">
                          {q.badge || `Quadrant ${idx + 1}`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {q.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {q.takeaway}
                      </p>
                      {q.studyGuidance && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-sky-300 font-medium">
                          🎯 {q.studyGuidance}
                        </div>
                      )}
                      {Array.isArray(q.detailPoints) && (
                        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                          {q.detailPoints.map((pt: string, pIdx: number) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center text-slate-500">
                    No quadrant cards synthesized for this step.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STEP VIDEO BREAKDOWN */}
            {activeTab === 'video' && (
              <div className="p-6 md:p-8 bg-slate-950/70 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 font-mono">
                      Curated Non-Repeating Tutorial
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {currentStep?.title} • Technical Video Breakdown
                    </h3>
                  </div>
                </div>

                {youtubeVideoId ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title={currentStep?.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">No video assigned for this step milestone.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* SOCRATIC QUIZ MODAL */}
      <SocraticQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        questions={quizQuestions}
        stepId={currentStep?.id}
        stepTitle={currentStep?.title}
        stepNumber={currentStepIndex + 1}
        onPassed={handleQuizPassed}
      />

      {/* ENROLL SKILL MODAL (EXCLUDES SPORTS) */}
      <EnrollSkillModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        excludeSports={true}
        onEnroll={(newTrack) => {
          setShowEnrollModal(false);
          if (newTrack?.id) {
            setSelectedTrackId(newTrack.id);
            loadCognitiveTracks(activeProfileId || 'default-profile');
          }
        }}
      />
    </div>
  );
}

export default function CognitiveSkillsWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CognitiveSkillsWorkspaceContent />
    </Suspense>
  );
}

function renderMarkdownContent(content: string) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        elements.push(
          <pre key={`code-${idx}`} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto my-3">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${idx}`} className="text-xl md:text-2xl font-black text-white mt-6 mb-3 tracking-tight border-b border-slate-800 pb-2">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${idx}`} className="text-lg md:text-xl font-bold text-sky-400 mt-5 mb-2">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${idx}`} className="text-base font-semibold text-slate-200 mt-4 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <div key={`quote-${idx}`} className="my-3 p-3.5 rounded-xl bg-sky-950/40 border-l-4 border-sky-400 text-xs md:text-sm text-sky-200">
          {line.replace('> ', '')}
        </div>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      elements.push(
        <li key={`li-${idx}`} className="ml-5 list-disc text-sm text-slate-300 leading-relaxed my-1">
          {line.replace(/^(\*|-)\s+/, '')}
        </li>
      );
    } else if (line.trim().length === 0) {
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
    } else {
      elements.push(
        <p key={`p-${idx}`} className="text-sm text-slate-300 leading-relaxed my-2">
          {line}
        </p>
      );
    }
  });

  return elements;
}
