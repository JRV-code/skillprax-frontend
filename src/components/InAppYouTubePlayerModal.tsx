'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Youtube, ExternalLink, AlertCircle, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ytEmbedSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export function warmUpYouTube() {
  if (typeof document === 'undefined' || document.getElementById('yt-warmup')) return;
  ['https://www.youtube-nocookie.com', 'https://i.ytimg.com'].forEach((href, i) => {
    const l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = href;
    l.crossOrigin = '';
    if (i === 0) l.id = 'yt-warmup';
    document.head.appendChild(l);
  });
}

export interface InAppYouTubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  videoTitle?: string;
  channelOrAuthor?: string;
  focusNote?: string;
  takeaway?: string;
  embeddable?: boolean;
}

export const InAppYouTubePlayerModal: React.FC<InAppYouTubePlayerModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle = 'Verified Video Resource',
  channelOrAuthor = 'Curated Pedagogical Breakdown',
  focusNote,
  takeaway,
  embeddable = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      warmUpYouTube();
      setIsIframeLoaded(false);
      setHasPlaybackError(false);
    }
  }, [isOpen, videoId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !videoId) return null;

  const activeFocus = focusNote || takeaway;
  const canEmbed = embeddable && !hasPlaybackError;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Animated Backdrop (opacity only, no blur on child) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80"
        />

        {/* Panel Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Focus Strip */}
          {activeFocus && (
            <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium truncate">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] shrink-0">
                  Focus for this resource:
                </span>
                <span className="truncate">{activeFocus}</span>
              </div>
            </div>
          )}

          {/* Player Header */}
          <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-heading font-extrabold text-white truncate">
                  {videoTitle}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {channelOrAuthor}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Player Display Area (STATIC WRAPPER — NO BACKDROP BLUR, NO ANIMATION) */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {canEmbed ? (
              <>
                {/* Lightweight loading spinner (zero thumbnails/posters) */}
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Opening Stream...
                    </span>
                  </div>
                )}

                {/* Single Iframe mounted on open, unmounted on close */}
                <iframe
                  key={videoId}
                  src={ytEmbedSrc(videoId)}
                  title={videoTitle}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={() => setIsIframeLoaded(true)}
                  onError={() => setHasPlaybackError(true)}
                  className="w-full h-full border-0"
                />
              </>
            ) : (
              /* Non-embeddable or error fallback */
              <div className="p-8 text-center space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-heading font-bold text-white">
                    Direct Embedding Unavailable
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The author has restricted external embedding for this video. You can open and watch it directly on YouTube.
                  </p>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default InAppYouTubePlayerModal;
