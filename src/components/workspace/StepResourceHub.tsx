'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Activity, Zap, RotateCw, Sparkles, BookOpen } from 'lucide-react';
import { DrillCardWithTimer } from '@/components/sports/DrillCardWithTimer';
import { InAppLectureTheater } from './InAppLectureTheater';

export interface StepResourceItem {
  id: string;
  type: 'youtube' | 'doc';
  title: string;
  subtitle?: string;
  url: string;
  viewsOrCitation?: string;
  durationOrPages?: string;
  markdown?: string;
  quadrants?: any;
}

export interface StepDrillItem {
  drillNumber: number;
  title: string;
  durationMinutes: number;
  technicalFocusPoints: string[];
  isCompleted: boolean;
}

export interface StepTopicDoc {
  topicId?: string;
  title: string;
  externalUrl?: string;
  url?: string;
  sourceDomain?: string;
  coreObjective?: string;
  miniGuide?: string;
}

export interface StepResourceHubProps {
  currentStep: number;
  stepTitle: string;
  skillId?: string;
  isPhysical?: boolean;
  step?: {
    video_id?: string;
    video_title?: string;
    video_url?: string;
    video_mini_guide?: string;
    videoMiniGuide?: string;
    doc_title?: string;
    docTitle?: string;
    doc_url?: string;
    docUrl?: string;
    doc_domain?: string;
    docDomain?: string;
    doc_mini_guide?: string;
    docMiniGuide?: string;
    step_explanation?: string;
    stepExplanation?: string;
    documentation_markdown?: string;
    step_number?: number;
    title?: string;
    is_sourced?: boolean;
    isSourced?: boolean;
    topics?: StepTopicDoc[];
  };
  videoResources?: StepResourceItem[];
  docResources?: StepResourceItem[];
  stepDrills?: StepDrillItem[];
  onPlayVideo?: (videoId: string, title: string, subtitle?: string) => void;
  onReadDoc?: (doc: StepResourceItem) => void;
  onDrillComplete?: (drillTitle: string) => void;
  onStartQuiz: () => void;
  onStepLoaded?: (stepData: any) => void;
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|tiktok\.com/i.test(url);
}

export const StepResourceHub: React.FC<StepResourceHubProps> = ({
  currentStep,
  stepTitle,
  skillId,
  isPhysical = false,
  step,
  videoResources = [],
  docResources = [],
  stepDrills = [],
  onDrillComplete,
  onStartQuiz,
  onStepLoaded,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(
    step?.video_id || (step?.is_sourced && videoResources[0]?.id ? videoResources[0].id : '')
  );
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(
    step?.video_title || (videoResources[0]?.title ?? `${stepTitle} — Video Walkthrough`)
  );
  const [activeVideoMiniGuide, setActiveVideoMiniGuide] = useState<string>(
    step?.videoMiniGuide || step?.video_mini_guide || 'Focus on demonstrated mechanics, execution pacing, and key technical cues.'
  );
  const [activeDocTitle, setActiveDocTitle] = useState<string>(
    step?.docTitle || step?.doc_title || `${stepTitle} Reference Guide`
  );
  const [activeDocUrl, setActiveDocUrl] = useState<string>(
    step?.docUrl || step?.doc_url || `https://en.wikipedia.org/wiki/${encodeURIComponent(stepTitle)}`
  );
  const [activeDocDomain, setActiveDocDomain] = useState<string>(
    step?.docDomain || step?.doc_domain || 'wikipedia.org'
  );
  const [activeDocMiniGuide, setActiveDocMiniGuide] = useState<string>(
    step?.docMiniGuide || step?.doc_mini_guide || 'Read through baseline definitions, parameter boundaries, and standard workflow models.'
  );
  const [activeStepExplanation, setActiveStepExplanation] = useState<string>(
    step?.stepExplanation || step?.step_explanation || step?.documentation_markdown || `Master the foundational invariants, key concepts, and operational execution of ${stepTitle}.`
  );
  const [activeTopics, setActiveTopics] = useState<StepTopicDoc[]>(step?.topics || []);
  const [activeDrills, setActiveDrills] = useState<StepDrillItem[]>(stepDrills);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateStepResources = async (stepNum: number) => {
    if (!skillId) return;
    try {
      setIsGenerating(true);
      const activeUserId = typeof window !== 'undefined'
        ? localStorage.getItem('skillprax_active_profile_id') || 'default-user'
        : 'default-user';

      const res = await fetch(`/api/skills/${skillId}/step/${stepNum}/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.videoId) {
          setActiveVideoId(data.videoId);
          setActiveVideoTitle(data.videoTitle || `${stepTitle} - Lecture Video`);
        }
        if (data.videoMiniGuide) setActiveVideoMiniGuide(data.videoMiniGuide);
        if (data.docTitle) setActiveDocTitle(data.docTitle);
        if (data.docUrl) setActiveDocUrl(data.docUrl);
        if (data.docDomain) setActiveDocDomain(data.docDomain);
        if (data.docMiniGuide) setActiveDocMiniGuide(data.docMiniGuide);
        if (data.stepExplanation) setActiveStepExplanation(data.stepExplanation);
        if (Array.isArray(data.topics)) {
          setActiveTopics(data.topics);
        }
        if (onStepLoaded) onStepLoaded(data);
      }
    } catch (err) {
      console.error('[StepResourceHub] Sourcing error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // DYNAMIC STEP FETCHING VIA GET /api/skills/:skillId/step/:stepNumber
  useEffect(() => {
    if (!skillId) {
      if (step?.video_id) {
        setActiveVideoId(step.video_id);
        setActiveVideoTitle(step.video_title || `${stepTitle} — Video Walkthrough`);
      } else if (videoResources.length > 0) {
        setActiveVideoId(videoResources[0].id);
        setActiveVideoTitle(videoResources[0].title);
      }
      if (step?.videoMiniGuide || step?.video_mini_guide) {
        setActiveVideoMiniGuide(step.videoMiniGuide || step.video_mini_guide || '');
      }
      if (step?.docTitle || step?.doc_title) {
        setActiveDocTitle(step.docTitle || step.doc_title || '');
      }
      if (step?.docUrl || step?.doc_url) {
        setActiveDocUrl(step.docUrl || step.doc_url || '');
      }
      if (step?.docDomain || step?.doc_domain) {
        setActiveDocDomain(step.docDomain || step.doc_domain || '');
      }
      if (step?.docMiniGuide || step?.doc_mini_guide) {
        setActiveDocMiniGuide(step.docMiniGuide || step.doc_mini_guide || '');
      }
      if (step?.stepExplanation || step?.step_explanation || step?.documentation_markdown) {
        setActiveStepExplanation(step.stepExplanation || step.step_explanation || step.documentation_markdown || '');
      }
      if (step?.topics && step.topics.length > 0) {
        setActiveTopics(step.topics);
      }
      setActiveDrills(stepDrills);
      return;
    }

    let isSubscribed = true;

    async function fetchIsolatedStepResources() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/skills/${skillId}/step/${currentStep}`);
        if (!res.ok) {
          throw new Error(`Failed to load step ${currentStep} resources`);
        }

        const data = await res.json();
        if (!isSubscribed) return;

        // 1. Fresh YouTube Video from Anti-Repetition Vault
        const vId = data.step?.video_id || (data.videos && data.videos[0]?.videoId) || (data.videos && data.videos[0]?.id);
        const vTitle = data.step?.video_title || (data.videos && data.videos[0]?.title) || `${data.step?.title || stepTitle} - Lecture Video`;
        if (vId) {
          setActiveVideoId(vId);
          setActiveVideoTitle(vTitle);
        }

        // Mini guides and explanation
        if (data.step?.videoMiniGuide || data.step?.video_mini_guide || data.videoMiniGuide) {
          setActiveVideoMiniGuide(data.step?.videoMiniGuide || data.step?.video_mini_guide || data.videoMiniGuide);
        }
        if (data.step?.docTitle || data.step?.doc_title || data.docTitle) {
          setActiveDocTitle(data.step?.docTitle || data.step?.doc_title || data.docTitle);
        }
        if (data.step?.docUrl || data.step?.doc_url || data.docUrl) {
          setActiveDocUrl(data.step?.docUrl || data.step?.doc_url || data.docUrl);
        }
        if (data.step?.docDomain || data.step?.doc_domain || data.docDomain) {
          setActiveDocDomain(data.step?.docDomain || data.step?.doc_domain || data.docDomain);
        }
        if (data.step?.docMiniGuide || data.step?.doc_mini_guide || data.docMiniGuide) {
          setActiveDocMiniGuide(data.step?.docMiniGuide || data.step?.doc_mini_guide || data.docMiniGuide);
        }
        if (data.step?.stepExplanation || data.step?.step_explanation || data.step?.documentation_markdown || data.stepExplanation) {
          setActiveStepExplanation(data.step?.stepExplanation || data.step?.step_explanation || data.step?.documentation_markdown || data.stepExplanation);
        }

        // 2. Fresh authentic technical documentation topics
        let topics: StepTopicDoc[] = [];
        if (Array.isArray(data.step?.topics) && data.step.topics.length > 0) {
          topics = data.step.topics;
        } else if (typeof data.step?.topics === 'string') {
          try {
            topics = JSON.parse(data.step.topics);
          } catch (_) {}
        } else if (Array.isArray(data.topics) && data.topics.length > 0) {
          topics = data.topics;
        }

        setActiveTopics(topics);

        if (Array.isArray(data.drills) && data.drills.length > 0) {
          setActiveDrills(data.drills);
        }

        if (onStepLoaded) onStepLoaded(data);
      } catch (err) {
        console.warn('[StepResourceHub] Dynamic fetch fallback to passed props:', err);
        if (step?.video_id) {
          setActiveVideoId(step.video_id);
          setActiveVideoTitle(step.video_title || `${stepTitle} — Video Walkthrough`);
        }
        if (step?.topics) {
          setActiveTopics(step.topics);
        }
        setActiveDrills(stepDrills);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    fetchIsolatedStepResources();

    return () => {
      isSubscribed = false;
    };
  }, [skillId, currentStep, stepTitle, step]);

  const completedDrillsCount = activeDrills.filter((d) => d.isCompleted).length;
  const isSourced = Boolean(activeVideoId || (activeTopics && activeTopics.length > 0));

  return (
    <div className="space-y-8">
      {/* SKELETON LOADER DISPLAYED WHILE VALIDATING ANTI-REPETITION AND EXTRACTING WEB DOCS */}
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 w-72 bg-slate-200/80 rounded-lg" />
            <div className="h-64 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
              <RotateCw className="w-5 h-5 animate-spin mr-2 text-sky-500" />
              <span>Checking Anti-Repetition Vault & Loading Step Stream...</span>
            </div>
          </div>
        </div>
      ) : !isSourced && !isGenerating ? (
        /* CHAPTER MILESTONE OVERVIEW BEFORE USER CLICKS GENERATE */
        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-8 md:p-10 shadow-xl mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Step {currentStep} Milestone Overview
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Step {currentStep}: {stepTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateStepResources(currentStep)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-[#0284C7] hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <Sparkles className="w-4 h-4"/>
              <span>Generate Chapter Resources & Video Lecture</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Chapter Objectives</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Master fundamental principles and invariants of {stepTitle}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Understand practical execution mechanics and authoritative references
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic pt-2">
            Click the button above to launch fast parallel sourcing for this milestone&apos;s video lecture and verified web references.
          </p>
        </div>
      ) : isGenerating ? (
        /* FAST SYNTHESIZING PROGRESS INDICATOR */
        <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 text-center text-slate-300 shadow-xl mb-10 space-y-3">
          <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">
            Sourcing Authentic Lecture & References for Step {currentStep}...
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Executing fast parallel queries for educational video lectures and authentic domain documentation.
          </p>
        </div>
      ) : (
        <>
          {/* MASTER STEP EXPLANATION (Groq Synthesized) */}
          {activeStepExplanation && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                  PEDAGOGICAL OVERVIEW • STEP {currentStep}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                What You Will Master in Step {currentStep}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                {activeStepExplanation}
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: IN-APP VIDEO LECTURE (THEATER STREAM IN UI ONLY)   */}
          {/* ------------------------------------------------------------- */}
          {activeVideoId && (
            <div className="mb-10">
              <InAppLectureTheater
                videoId={activeVideoId}
                videoTitle={activeVideoTitle || `${stepTitle} - Lecture Video`}
                stepNumber={currentStep}
                miniGuide={activeVideoMiniGuide}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: OFFICIAL TECHNICAL READING WITH MINI GUIDE         */}
          {/* ------------------------------------------------------------- */}
          <div className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Step {currentStep}: Official Technical Documentation
                </h3>
                <p className="text-xs text-slate-500">
                  Direct open web resource (zero login or paywall required). Links open the authentic website in a new tab.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                Verified Non-Login Source
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] uppercase tracking-wider">
                        TEXT DOCUMENT
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">{activeDocDomain}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{activeDocTitle}</h4>
                  </div>
                </div>

                <a
                  href={activeDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>Open Website ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {activeDocMiniGuide && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 block">
                    Mini Guide • What to Read & Focus On
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    {activeDocMiniGuide}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: PRACTICAL EXECUTION DRILLS (With Embedded Step Timers) */}
          {isPhysical && activeDrills.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Activity className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Step {currentStep}: Practical Execution Drills
                    </h3>
                    <p className="text-xs text-slate-500">
                      Execute these physical biomechanical drills to build muscle memory before attempting the milestone gate.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {completedDrillsCount} of {activeDrills.length} Drills Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {activeDrills.map((drill) => (
                  <DrillCardWithTimer
                    key={drill.drillNumber}
                    drillNumber={drill.drillNumber}
                    title={drill.title}
                    durationMinutes={drill.durationMinutes}
                    technicalFocusPoints={drill.technicalFocusPoints}
                    isCompleted={drill.isCompleted}
                    onDrillComplete={onDrillComplete || (() => {})}
                  />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: STEP MILESTONE EVALUATION (Socratic Quiz Gate) */}
          <section className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-heading font-extrabold text-emerald-950">
                  Ready for Evaluation • Step {currentStep} Milestone Gate
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Only click when you have studied the video lecture and documentation. Socratic quiz will be generated on demand.
                </p>
              </div>
            </div>

            <button
              onClick={onStartQuiz}
              className="px-6 py-3 rounded-2xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.96] whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Ready for Evaluation — Start Milestone Quiz ➔</span>
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default StepResourceHub;
