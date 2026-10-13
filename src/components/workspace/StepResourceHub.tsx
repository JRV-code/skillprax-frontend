'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Activity, Zap, RotateCw } from 'lucide-react';
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
}

export interface StepResourceHubProps {
  currentStep: number;
  stepTitle: string;
  skillId?: string;
  isPhysical?: boolean;
  step?: {
    video_id?: string;
    video_title?: string;
    step_number?: number;
    title?: string;
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
  const [activeVideoId, setActiveVideoId] = useState<string>(step?.video_id || (videoResources[0]?.id ?? ''));
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(
    step?.video_title || videoResources[0]?.title || `${stepTitle} — Video Walkthrough`
  );
  const [activeTopics, setActiveTopics] = useState<StepTopicDoc[]>(step?.topics || []);
  const [activeDrills, setActiveDrills] = useState<StepDrillItem[]>(stepDrills);

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

        if (topics.length === 0 && data.documentation) {
          topics = [
            {
              topicId: `t-${currentStep}-1`,
              title: data.documentation.title || `${stepTitle} Architectural Invariants`,
              externalUrl: data.documentation.sourceUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(stepTitle)}`,
              sourceDomain: 'Official Documentation',
              coreObjective: 'Read official reference and execution standards',
            },
          ];
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
      ) : (
        <>
          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: IN-APP VIDEO LECTURE (THEATER STREAM IN UI ONLY)   */}
          {/* ------------------------------------------------------------- */}
          {activeVideoId && (
            <div className="mb-10">
              <InAppLectureTheater
                videoId={activeVideoId}
                videoTitle={activeVideoTitle || `${stepTitle} - Lecture Video`}
                stepNumber={currentStep}
              />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: OFFICIAL TECHNICAL READING (OPEN IN EXTERNAL TAB)  */}
          {/* ------------------------------------------------------------- */}
          {activeTopics && activeTopics.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Step {currentStep}: Official Technical Documentation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official text resources and reference manuals. Links open the authentic website in a new tab.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                  Verified Non-Video Sources
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {activeTopics.map((topic: StepTopicDoc, idx: number) => {
                  let safeUrl = topic.externalUrl || topic.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.title || stepTitle)}`;
                  let safeDomain = topic.sourceDomain || 'Official Resource';

                  // Guard: Guarantee no video URL is classified as a text document
                  if (isVideoUrl(safeUrl)) {
                    safeUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.title || stepTitle)}`;
                    safeDomain = 'wikipedia.org';
                  }

                  return (
                    <div
                      key={topic.topicId || idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] uppercase tracking-wider">
                              TEXT DOCUMENT
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-500">{safeDomain}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{topic.coreObjective || `Read official documentation on ${topic.title}`}</p>
                        </div>
                      </div>

                      {/* External Tab Link */}
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer"
                      >
                        <span>Open Website ↗</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
          <section className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-bold text-emerald-950">
                  Section 4: Step Milestone Evaluation Gate
                </h4>
                <p className="text-xs text-emerald-800">
                  Passing threshold is 70%. Conceptually verify theoretical mechanics and kinetic principles.
                </p>
              </div>
            </div>

            <button
              onClick={onStartQuiz}
              className="px-5 py-2.5 rounded-xl font-heading font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.96]"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>⚡ Start Milestone Evaluation Gate ➔</span>
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default StepResourceHub;
