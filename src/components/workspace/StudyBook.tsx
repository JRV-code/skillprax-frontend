'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TopicItem {
  key: string;
  order: number;
  title: string;
  covers: string;
  minutes: number;
  acuIds: string[];
  chapterMarkdown: string | null;
  sectionLink: { url: string; label: string } | null;
  resourceIds: string[];
  status: 'READY' | 'NO_VERIFIED_LINK';
}

export interface ResourceItem {
  id: string;
  type: 'video' | 'doc';
  title: string;
  url: string;
  videoId?: string | null;
  channelName?: string | null;
  embeddable: boolean;
  topicKey?: string | null;
  focusNote?: string | null;
  snippet?: string | null;
  linkStatus: 'VERIFIED' | 'UNCHECKED' | 'DEAD';
  checkedAt?: string;
  sourceType?: string;
}

interface StudyBookProps {
  stepId: string;
  stepTitle: string;
  stepIndex: number;
  topicMap: TopicItem[];
  resources: ResourceItem[];
  hasGuideMarkdown: boolean;
  onOpenReader: (chapterTopicKey?: string, viewMode?: 'summary' | 'full') => void;
  onOpenPlayer: (videoId: string, title?: string, channel?: string, focusNote?: string) => void;
  onWarmUpYouTube?: () => void;
  onStartEvaluation: () => void;
  onRetryTopic?: (topicKey: string) => Promise<void>;
  onReplaceResource?: (resourceId: string) => Promise<void>;
  isGeneratingEvaluation?: boolean;
}

export const StudyBook: React.FC<StudyBookProps> = ({
  stepId,
  stepTitle,
  stepIndex,
  topicMap,
  resources,
  hasGuideMarkdown,
  onOpenReader,
  onOpenPlayer,
  onWarmUpYouTube,
  onStartEvaluation,
  onRetryTopic,
  onReplaceResource,
  isGeneratingEvaluation = false,
}) => {
  // First accordion open by default; others collapsed on mobile
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    [topicMap[0]?.key || 't1']: true,
  });
  const [retryingTopicKey, setRetryingTopicKey] = useState<string | null>(null);
  const [replacingResourceId, setReplacingResourceId] = useState<string | null>(null);

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTopicRetry = async (topicKey: string) => {
    setRetryingTopicKey(topicKey);
    try {
      if (onRetryTopic) {
        await onRetryTopic(topicKey);
      } else {
        await fetch(`/api/steps/${stepId}/topics/${topicKey}/retry`, { method: 'POST' });
      }
    } catch (err) {
      console.warn('Topic retry failed:', err);
    } finally {
      setRetryingTopicKey(null);
    }
  };

  const handleResourceReplace = async (resourceId: string) => {
    setReplacingResourceId(resourceId);
    try {
      if (onReplaceResource) {
        await onReplaceResource(resourceId);
      } else {
        await fetch(`/api/resources/${resourceId}/replace`, { method: 'POST' });
      }
    } catch (err) {
      console.warn('Resource replace failed:', err);
    } finally {
      setReplacingResourceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Table of Contents & Study Guide Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Step {stepIndex} Study Book: Chapters & Verified Media</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Work through the topic chapters sequentially. Every link is verified live.
          </p>
        </div>

        {hasGuideMarkdown && (
          <button
            onClick={() => onOpenReader(undefined, 'full')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Read the whole guide</span>
          </button>
        )}
      </div>

      {/* Chapters Accordion */}
      <div className="space-y-4">
        {topicMap.map((topic, idx) => {
          const isOpen = Boolean(openChapters[topic.key]);
          const topicResources = resources.filter(
            (r) => r.topicKey === topic.key || (topic.resourceIds || []).includes(r.id)
          );
          const isRetrying = retryingTopicKey === topic.key;

          return (
            <div
              key={topic.key}
              className="bg-white/95 rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleChapter(topic.key)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-heading font-extrabold text-slate-900 truncate">
                        Chapter {idx + 1}: {topic.title}
                      </h3>
                      <span className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {topic.minutes} min
                      </span>
                      {topic.status === 'NO_VERIFIED_LINK' && (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending Link
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {topic.covers}
                    </p>

                    {/* ACU Chips */}
                    {topic.acuIds && topic.acuIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.acuIds.map((acu) => (
                          <span
                            key={acu}
                            className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            <Tag className="w-2.5 h-2.5 text-emerald-600" />
                            {acu}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-1"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Accordion Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-5 sm:px-5 space-y-4 border-t border-slate-100 pt-4"
                  >
                    {/* Chapter Text Action or Wikipedia Link */}
                    {topic.chapterMarkdown ? (
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900 font-medium truncate">
                          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Dedicated chapter study guide available.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenReader(topic.key, 'full')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                        >
                          Read Chapter
                        </button>
                      </div>
                    ) : topic.sectionLink ? (
                      <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-sky-900 font-medium truncate">
                          <ExternalLink className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>Wikipedia Deep-Link: {topic.sectionLink.label}</span>
                        </div>
                        <a
                          href={topic.sectionLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0 inline-flex items-center gap-1"
                        >
                          <span>Open Section</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : null}

                    {/* Resources List (Zero-Thumbnail Cards) */}
                    {topicResources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topicResources.map((res) => {
                          const isVid = res.type === 'video';
                          const isVerified = res.linkStatus === 'VERIFIED';
                          const isReplacing = replacingResourceId === res.id;

                          return (
                            <div
                              key={res.id}
                              onPointerEnter={() => {
                                if (isVid && onWarmUpYouTube) onWarmUpYouTube();
                              }}
                              onTouchStart={() => {
                                if (isVid && onWarmUpYouTube) onWarmUpYouTube();
                              }}
                              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  {/* Type Badge */}
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                      isVid
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                                    }`}
                                  >
                                    {isVid ? (
                                      <>
                                        <Video className="w-3 h-3" /> Video
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="w-3 h-3" /> Document
                                      </>
                                    )}
                                  </span>

                                  {/* Link Verification Status Badge */}
                                  {isVerified ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-slate-400">
                                      Unchecked
                                    </span>
                                  )}
                                </div>

                                {/* Title & Author */}
                                <div>
                                  <h4 className="text-xs font-heading font-extrabold text-slate-900 line-clamp-2 leading-snug">
                                    {res.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                    {res.channelName || (isVid ? 'YouTube Walkthrough' : 'Curated Reference')}
                                  </span>
                                </div>

                                {/* Focus Note */}
                                {res.focusNote && (
                                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed font-sans line-clamp-2">
                                    🎯 {res.focusNote}
                                  </p>
                                )}
                              </div>

                              {/* Card Action Row */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                {isVid ? (
                                  res.embeddable && res.videoId ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onOpenPlayer(
                                          res.videoId!,
                                          res.title,
                                          res.channelName || 'YouTube',
                                          res.focusNote || undefined
                                        )
                                      }
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 fill-white" />
                                      <span>Watch In-App</span>
                                    </button>
                                  ) : (
                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>Open on YouTube</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )
                                ) : topic.chapterMarkdown ? (
                                  <button
                                    type="button"
                                    onClick={() => onOpenReader(topic.key, 'full')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Read In-App</span>
                                  </button>
                                ) : (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>Open Document</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}

                                {/* Link broken? Replace button */}
                                <button
                                  type="button"
                                  onClick={() => handleResourceReplace(res.id)}
                                  disabled={isReplacing}
                                  className="text-[10px] text-slate-400 hover:text-amber-600 font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {isReplacing ? (
                                    <>
                                      <RotateCcw className="w-2.5 h-2.5 animate-spin" />
                                      <span>Replacing...</span>
                                    </>
                                  ) : (
                                    <span>Link broken? Replace</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty Topic State */
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 text-center space-y-2">
                        <p className="text-xs text-amber-800 font-medium">
                          No verified link yet for this chapter.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleTopicRetry(topic.key)}
                          disabled={isRetrying}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isRetrying ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Searching...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Find a link for this topic</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Socratic Evaluation Gate Action */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-5 rounded-3xl border border-emerald-200">
        <div>
          <h3 className="text-sm font-heading font-extrabold text-slate-900">
            Ready to Verify Your Milestone Competencies?
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Test your understanding across all chapter ACUs with grounded challenge scenarios.
          </p>
        </div>

        <button
          onClick={onStartEvaluation}
          disabled={isGeneratingEvaluation}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGeneratingEvaluation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Evaluation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>⚡ Generate Socratic Evaluation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudyBook;
