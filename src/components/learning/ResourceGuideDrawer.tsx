'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Play, Clock, ShieldCheck, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { DUR, EASE, SPRING, panelSlide, safe } from '@/lib/learning/motion';
import { ytEmbedSrc } from '@/lib/learning/translateLinks';
import { ChapterItem, ChapterResource } from './ChapterCard';

interface ResourceGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterItem | null;
  resource: ChapterResource | null;
  currentLanguage?: string;
}

export const ResourceGuideDrawer: React.FC<ResourceGuideDrawerProps> = ({
  isOpen,
  onClose,
  chapter,
  resource,
  currentLanguage = 'en',
}) => {
  const reduceMotion = useReducedMotion();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, resource?.videoId]);

  if (!isOpen || !chapter || !resource) return null;

  const videoId = resource.videoId;
  const isEmbeddable = resource.embeddable !== false && !!videoId;
  const embedUrl = videoId ? ytEmbedSrc(videoId, currentLanguage) : null;
  const guide = chapter.approachGuide;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop (opacity only, no blur on video container) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DUR.fast }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <motion.div
          variants={safe(panelSlide, reduceMotion)}
          initial="hidden"
          animate="show"
          exit="exit"
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-dvh overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                  Video Demonstration
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600">
                  Chapter {chapter.orderIndex}: {chapter.title}
                </span>
              </div>
              <h3 className="text-sm font-heading font-bold text-slate-900 mt-1 line-clamp-1">
                {resource.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* FOCUS STRIP (Approach guide) */}
            {guide && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Focus For This Resource
                  </span>
                  {guide.timebox && (
                    <span className="text-[10px] font-heading font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Timebox: {guide.timebox}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  {guide.before && (
                    <div className="flex items-start gap-2">
                      <span className="font-heading font-bold text-slate-600 shrink-0 w-20">
                        Before play:
                      </span>
                      <span className="text-slate-600 font-medium">{guide.before}</span>
                    </div>
                  )}

                  {guide.lookFor && guide.lookFor.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="font-heading font-bold text-emerald-800 shrink-0 w-20">
                        Look for:
                      </span>
                      <div className="space-y-0.5">
                        {guide.lookFor.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-500">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guide.doWhile && (
                    <div className="flex items-start gap-2">
                      <span className="font-heading font-bold text-cyan-800 shrink-0 w-20">
                        While watching:
                      </span>
                      <span className="text-slate-600 font-medium">{guide.doWhile}</span>
                    </div>
                  )}

                  {guide.afterCheck && (
                    <div className="flex items-start gap-2">
                      <span className="font-heading font-bold text-purple-700 shrink-0 w-20">
                        After check:
                      </span>
                      <span className="text-slate-600 font-medium">{guide.afterCheck}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STATIC VIDEO CONTAINER (NO Framer Motion & NO backdrop blur on this element) */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              {isEmbeddable && embedUrl ? (
                <>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-heading font-medium">
                          Connecting to YouTube nocookie embed...
                        </p>
                      </div>
                    </div>
                  )}

                  <iframe
                    key={videoId}
                    src={embedUrl}
                    title={resource.title}
                    onLoad={() => setIframeLoaded(true)}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                  />
                </>
              ) : (
                /* Non-embeddable fallback: ONE Open on YouTube button */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900 text-white">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-heading font-bold">
                      Embed Restricted by Channel
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mt-1">
                      This creator disables third-party iframe embedding. You can safely open it directly on YouTube.
                    </p>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open on YouTube</span>
                  </a>
                </div>
              )}
            </div>

            {/* Channel info & language note */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                Source: <span className="text-slate-700">{resource.domain || 'YouTube'}</span>
              </span>
              {currentLanguage !== 'en' && (
                <span className="text-[11px] text-slate-400 italic">
                  Captions requested for {currentLanguage.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
