'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Video,
  FileText,
  Clock,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Play,
  Eye,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { DUR, EASE, safe, SPRING } from '@/lib/learning/motion';
import { warmUpYouTube } from '@/lib/learning/youtube';
import { googleTranslatedPageUrl, googleTranslateAltUrl } from '@/lib/learning/translateLinks';

export interface ChapterResource {
  id: string;
  type: 'VIDEO' | 'DOCUMENT';
  title: string;
  domain?: string;
  snippet?: string;
  linkStatus: 'VERIFIED' | 'UNCHECKED' | 'DEAD';
  embeddable: boolean;
  videoId?: string | null;
  url: string;
}

export interface ChapterApproachGuide {
  before?: string;
  lookFor?: string[];
  doWhile?: string;
  afterCheck?: string;
  ignore?: string;
  timebox?: string;
}

export interface ChapterItem {
  id: string;
  key: string;
  orderIndex: number;
  title: string;
  covers: string;
  minutes: number;
  acuIds: string[];
  preferredType: 'VIDEO' | 'DOCUMENT';
  buildsOn?: string | null;
  newConcepts?: string[];
  status: 'PLANNED' | 'READY' | 'NO_VERIFIED_LINK';
  approachGuide?: ChapterApproachGuide | null;
  resource?: ChapterResource | null;
}

interface ChapterCardProps {
  chapter: ChapterItem;
  chapterNumber: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenVideo: (chapter: ChapterItem, resource: ChapterResource) => void;
  onReplaceResource: (resourceId: string) => void;
  onRetryChapter: (chapterId: string) => void;
  currentLanguage?: string;
  approachViewed?: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  chapterNumber,
  isOpen,
  onToggle,
  onOpenVideo,
  onReplaceResource,
  onRetryChapter,
  currentLanguage = 'en',
  approachViewed = true,
}) => {
  const reduceMotion = useReducedMotion();
  const [replacing, setReplacing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const res = chapter.resource;
  const isVideo = (res?.type || chapter.preferredType) === 'VIDEO';
  const isVerified = res?.linkStatus === 'VERIFIED';
  const hasNoLink = chapter.status === 'NO_VERIFIED_LINK' || !res;

  const handleWarmUp = () => {
    if (isVideo) {
      warmUpYouTube();
    }
  };

  const handleReplace = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!res?.id || replacing) return;
    setReplacing(true);
    try {
      await onReplaceResource(res.id);
    } finally {
      setReplacing(false);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chapter.id || retrying) return;
    setRetrying(true);
    try {
      await onRetryChapter(chapter.id);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      onPointerEnter={handleWarmUp}
      onFocus={handleWarmUp}
      onTouchStart={handleWarmUp}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white border-slate-300/80 shadow-md ring-1 ring-slate-100'
          : 'bg-white/80 hover:bg-white border-slate-200/70 shadow-xs'
      }`}
    >
      {/* Header bar / Accordion trigger */}
      <div
        onClick={onToggle}
        className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-heading font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
            {chapterNumber}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider">
                Chapter {chapterNumber}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                {chapter.minutes} min
              </span>
              {isVideo ? (
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 flex items-center gap-1">
                  <Video className="w-3 h-3" /> Video
                </span>
              ) : (
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200/60 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Document
                </span>
              )}
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900 mt-1">
              {chapter.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {chapter.covers}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isVerified && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={SPRING}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Accordion content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="chapter-body"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-5 sm:p-6 space-y-5 bg-slate-50/40">
              {/* Concept coverage tags */}
              {chapter.acuIds && chapter.acuIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-heading font-semibold text-slate-400">
                    Mastery Focus:
                  </span>
                  {chapter.acuIds.map((acu, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs"
                    >
                      {acu}
                    </span>
                  ))}
                </div>
              )}

              {/* Nudge if approach plan not viewed yet */}
              {!approachViewed && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Read the game plan above first for maximum retention.</span>
                </div>
              )}

              {/* NO VERIFIED LINK STATE */}
              {hasNoLink ? (
                <div className="p-6 bg-white rounded-2xl border border-dashed border-amber-300 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-slate-900">
                      No verified link yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      No safe, non-broken source found on the first search pass. Run a targeted search for this chapter.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {retrying ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Find a link for this chapter</span>
                  </button>
                </div>
              ) : (
                /* EXACTLY ONE PRIMARY RESOURCE CARD */
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                  {/* Resource header: Type badge, Verified chip, Domain, Replace button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {isVideo ? (
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200/60 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" /> Video Demonstration
                        </span>
                      ) : (
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200/60 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Technical Document
                        </span>
                      )}

                      {isVerified && (
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}

                      {res.domain && (
                        <span className="text-xs text-slate-500 font-medium">
                          {res.domain}
                        </span>
                      )}
                    </div>

                    {/* Replace broken link button */}
                    <button
                      type="button"
                      onClick={handleReplace}
                      disabled={replacing}
                      className="text-[11px] font-heading font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {replacing ? (
                        <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      <span>Link broken? Replace</span>
                    </button>
                  </div>

                  {/* Resource Title & Search Snippet (max 220 chars) */}
                  <div>
                    <h4 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                      {res.title}
                    </h4>
                    {res.snippet && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
                        {res.snippet}
                      </p>
                    )}
                  </div>

                  {/* Approach Guide compact checklist */}
                  {chapter.approachGuide && (
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">
                          How to Approach This Resource
                        </span>
                        {chapter.approachGuide.timebox && (
                          <span className="text-[10px] font-heading font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                            Timebox: {chapter.approachGuide.timebox}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        {chapter.approachGuide.before && (
                          <div className="flex items-start gap-2">
                            <span className="font-heading font-bold text-slate-600 shrink-0 w-16">
                              Before:
                            </span>
                            <span className="text-slate-600">{chapter.approachGuide.before}</span>
                          </div>
                        )}

                        {chapter.approachGuide.lookFor && chapter.approachGuide.lookFor.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="font-heading font-bold text-emerald-700 shrink-0 w-16">
                              Look for:
                            </span>
                            <div className="space-y-0.5">
                              {chapter.approachGuide.lookFor.map((pt, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500">•</span>
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {chapter.approachGuide.doWhile && (
                          <div className="flex items-start gap-2">
                            <span className="font-heading font-bold text-cyan-800 shrink-0 w-16">
                              While doing:
                            </span>
                            <span className="text-slate-600">{chapter.approachGuide.doWhile}</span>
                          </div>
                        )}

                        {chapter.approachGuide.afterCheck && (
                          <div className="flex items-start gap-2">
                            <span className="font-heading font-bold text-purple-700 shrink-0 w-16">
                              Afterwards:
                            </span>
                            <span className="text-slate-600">{chapter.approachGuide.afterCheck}</span>
                          </div>
                        )}

                        {chapter.approachGuide.ignore && (
                          <div className="flex items-start gap-2">
                            <span className="font-heading font-bold text-amber-700 shrink-0 w-16">
                              Skip/skim:
                            </span>
                            <span className="text-slate-500 italic">{chapter.approachGuide.ignore}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button (Video vs Document with Google Translate) */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                    {isVideo ? (
                      /* Video chapter */
                      res.embeddable ? (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(chapter, res)}
                          className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Video with Focus Guide</span>
                        </button>
                      ) : (
                        /* Non-embeddable video: ONE Open on YouTube button */
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open on YouTube</span>
                        </a>
                      )
                    ) : (
                      /* Document chapter: open in new tab. Translated by Google if language != en */
                      <div className="flex flex-wrap items-center gap-2">
                        {currentLanguage !== 'en' ? (
                          <>
                            {/* Primary: Google translated page */}
                            <a
                              href={googleTranslatedPageUrl(res.url, currentLanguage)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Read Translated Document ➔</span>
                            </a>

                            {/* Smaller: Original document */}
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl font-heading font-semibold text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Original</span>
                            </a>

                            {/* Alternate translator view fallback */}
                            <a
                              href={googleTranslateAltUrl(res.url, currentLanguage)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                            >
                              Try alternate view
                            </a>
                          </>
                        ) : (
                          /* English: direct link */
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Read Document ➔</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
