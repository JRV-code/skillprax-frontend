'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Youtube, ChevronRight, BookOpen, FileText, 
  Activity, Zap, Timer, CheckCircle2, RotateCw
} from 'lucide-react';
import { DrillCardWithTimer } from '@/components/sports/DrillCardWithTimer';

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

export interface StepResourceHubProps {
  currentStep: number;
  stepTitle: string;
  skillId?: string;
  isPhysical?: boolean;
  videoResources?: StepResourceItem[];
  docResources?: StepResourceItem[];
  stepDrills?: StepDrillItem[];
  onPlayVideo: (videoId: string, title: string, subtitle?: string) => void;
  onReadDoc: (doc: StepResourceItem) => void;
  onDrillComplete?: (drillTitle: string) => void;
  onStartQuiz: () => void;
  onStepLoaded?: (stepData: any) => void;
}

export const StepResourceHub: React.FC<StepResourceHubProps> = ({
  currentStep,
  stepTitle,
  skillId,
  isPhysical = false,
  videoResources = [],
  docResources = [],
  stepDrills = [],
  onPlayVideo,
  onReadDoc,
  onDrillComplete,
  onStartQuiz,
  onStepLoaded,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeVideos, setActiveVideos] = useState<StepResourceItem[]>(videoResources);
  const [activeDocs, setActiveDocs] = useState<StepResourceItem[]>(docResources);
  const [activeDrills, setActiveDrills] = useState<StepDrillItem[]>(stepDrills);

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  // MODULE 5: DYNAMIC STEP FETCHING VIA GET /api/skills/:skillId/step/:stepNumber
  useEffect(() => {
    if (!skillId) {
      setActiveVideos(videoResources);
      setActiveDocs(docResources);
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

        // 1. Fresh YouTube videos from Anti-Repetition Vault
        const mappedVideos: StepResourceItem[] = (data.videos || []).map((v: any) => ({
          id: v.videoId || v.id,
          type: 'youtube',
          title: v.title || `${data.step?.title || stepTitle} - Video Walkthrough`,
          subtitle: v.subtitle || 'Step-specific verified walkthrough',
          url: v.url || `https://www.youtube.com/watch?v=${v.videoId || v.id}`,
          durationOrPages: '10-15 mins',
        }));

        if (mappedVideos.length === 0 && data.step?.video_id) {
          mappedVideos.push({
            id: data.step.video_id,
            type: 'youtube',
            title: `${data.step.title || stepTitle} - Video Walkthrough`,
            subtitle: data.step.description,
            url: data.step.video_url || `https://www.youtube.com/watch?v=${data.step.video_id}`,
            durationOrPages: 'Tutorial Video',
          });
        }

        // 2. Fresh authentic technical documentation (4-Quadrant)
        const mappedDocs: StepResourceItem[] = [];
        if (data.documentation || data.step?.documentation_markdown) {
          const docData = data.documentation || {};
          const markdown = docData.markdown || data.step?.documentation_markdown;
          const quadrants = docData.quadrants || data.step?.documentation_quadrants;
          const sourceUrl = docData.sourceUrl || data.step?.documentation_source_url;

          mappedDocs.push({
            id: `doc-step-${currentStep}`,
            type: 'doc',
            title: docData.title || `${data.step?.title || stepTitle} - Technical Guide`,
            subtitle: (typeof quadrants === 'object' && quadrants?.takeaway) ? quadrants.takeaway : `Authoritative reference for Step ${currentStep}`,
            url: sourceUrl || 'https://en.wikipedia.org',
            viewsOrCitation: 'Verified 4-Quadrant Doc',
            durationOrPages: '5-10 min read',
            markdown,
            quadrants,
          });
        }

        // 3. Update state completely for Step N
        setActiveVideos(mappedVideos);
        setActiveDocs(mappedDocs);
        if (Array.isArray(data.drills) && data.drills.length > 0) {
          setActiveDrills(data.drills);
        }

        if (onStepLoaded) onStepLoaded(data);
      } catch (err) {
        console.warn('[StepResourceHub] Dynamic fetch fallback to passed props:', err);
        setActiveVideos(videoResources);
        setActiveDocs(docResources);
        setActiveDrills(stepDrills);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    fetchIsolatedStepResources();

    return () => {
      isSubscribed = false;
    };
  }, [skillId, currentStep, stepTitle]);

  const completedDrillsCount = activeDrills.filter((d) => d.isCompleted).length;

  return (
    <div className="space-y-8">
      {/* SKELETON LOADER DISPLAYED WHILE VALIDATING ANTI-REPETITION AND EXTRACTING WEB DOCS */}
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          {/* Skeleton Section 1 */}
          <div className="space-y-3">
            <div className="h-4 w-72 bg-slate-200/80 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-red-500" />
                <span>Checking Anti-Repetition Vault...</span>
              </div>
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-red-500" />
                <span>Filtering Previously Seen Video IDs...</span>
              </div>
            </div>
          </div>

          {/* Skeleton Section 2 */}
          <div className="space-y-3">
            <div className="h-4 w-80 bg-slate-200/80 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-sky-500" />
                <span>Extracting Real-Web Documentation...</span>
              </div>
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-sky-500" />
                <span>Synthesizing 4 Quadrants...</span>
              </div>
              <div className="h-44 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-mono text-slate-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-sky-500" />
                <span>Calibrating Progressive Difficulty...</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1: VERIFIED VISUAL & VIDEO WALKTHROUGHS (In-App Player) */}
          {activeVideos.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-red-100 text-red-600">
                  <Video className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600">
                  Section 1: Verified Visual & Video Walkthroughs (In-App Player)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVideos.map((res) => {
                  const vId = extractYouTubeId(res.url) || res.id;

                  return (
                    <div
                      key={res.id}
                      onClick={() => onPlayVideo(vId, res.title, res.subtitle)}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-red-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200/80 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-red-600 fill-current" />
                            <span>YOUTUBE TUTORIAL</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 font-medium">In-App Player</span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Youtube className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-heading font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug">
                              {res.title}
                            </h5>
                            {res.subtitle && (
                              <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                                {res.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-red-700">
                        <span className="text-slate-500 font-mono text-[11px]">{res.durationOrPages || 'Tutorial Video'}</span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Play in App</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 2: CANONICAL TECHNICAL DOCUMENTATION (4-Quadrant Reader) */}
          {activeDocs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-sky-100 text-sky-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-600">
                  Section 2: Canonical Technical Documentation (4-Quadrant Reader)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onReadDoc(doc)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          <span>DOCUMENTATION</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">4-Quadrant Reader</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-heading font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                            {doc.title}
                          </h5>
                          {doc.subtitle && (
                            <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                              {doc.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700">
                      <span className="text-slate-500 font-mono text-[11px]">{doc.viewsOrCitation || 'Verified Doc'}</span>
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Read in App</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: PRACTICAL EXECUTION DRILLS (With Embedded Step Timers) */}
          {isPhysical && activeDrills.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Activity className="w-5 h-5"/>
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
