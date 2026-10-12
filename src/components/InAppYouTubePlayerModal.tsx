'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Youtube, Play, Pause, RotateCcw, RotateCw, 
  Gauge, Volume2, Sparkles, CheckCircle2, Maximize, Minimize 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InAppYouTubePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
  videoTitle?: string;
  channelOrAuthor?: string;
  takeaway?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const InAppYouTubePlayerModal: React.FC<InAppYouTubePlayerModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle = 'Verified Pedagogical Video Resource',
  channelOrAuthor = 'Curated Pedagogical Breakdown',
  takeaway = 'Focus on the structural mechanics, key sequences, and error recovery steps illustrated in this walkthrough.',
}) => {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTheater, setIsTheater] = useState(false);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  // Clean teardown handler
  const terminatePlayer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo?.();
        playerRef.current.stopVideo?.();
        playerRef.current.mute?.();
        playerRef.current.destroy?.();
      } catch (_) {}
      playerRef.current = null;
    }
  }, []);

  const handleClose = () => {
    terminatePlayer();
    onClose();
  };

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo?.();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo?.();
        setIsPlaying(true);
      }
    } catch (_) {}
  }, [isPlaying]);

  // Spacebar and Escape key handling
  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, togglePlayPause]);

  // Load YouTube IFrame API & Mount Player
  useEffect(() => {
    if (!isOpen || !videoId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      try {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (_) {}
        }

        playerRef.current = new window.YT.Player('yt-portal-player', {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0, // hide default controls in favor of custom glassmorphic controller
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
            playsinline: 1,
            iv_load_policy: 3, // Disable annotations
            fs: 1,
          },
          events: {
            onReady: (event: any) => {
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
              event.target.playVideo();
              setIsPlaying(true);
            },
            onStateChange: (event: any) => {
              if (event.data === 1) setIsPlaying(true);
              else if (event.data === 2) setIsPlaying(false);
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player initialization error:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // High frequency time ticker
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (typeof cur === 'number') setCurrentTime(cur);
          if (typeof dur === 'number' && dur > 0) setDuration(dur);
        } catch (_) {}
      }
    }, 400);

    return () => {
      terminatePlayer();
    };
  }, [isOpen, videoId, terminatePlayer]);

  if (!mounted) return null;

  const seekBy = (seconds: number) => {
    if (!playerRef.current) return;
    try {
      const target = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo?.(target, true);
      setCurrentTime(target);
    } catch (_) {}
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (playerRef.current) {
      try {
        playerRef.current.seekTo?.(val, true);
      } catch (_) {}
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(speed);
      } catch (_) {}
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && videoId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md">
          {/* Backdrop click to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{ transform: 'translateZ(0)' }}
            className={`relative z-10 w-full ${
              isTheater ? 'max-w-6xl' : 'max-w-4xl'
            } bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-white transition-all duration-300`}
          >
            {/* Top Modal Header */}
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-xs">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                      IN-APP MEDIA CONTROLLER
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {channelOrAuthor}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-heading font-extrabold text-white line-clamp-1 mt-0.5">
                    {videoTitle}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Theater Mode Toggle */}
                <button
                  onClick={() => setIsTheater((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isTheater ? 'Default Size' : 'Theater Mode'}
                >
                  {isTheater ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  title="Close Video (Terminates Audio)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Canvas with GPU hardware acceleration */}
            <div
              className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden"
              style={{ transform: 'translateZ(0)' }}
            >
              <div id="yt-portal-player" className="w-full h-full" />
            </div>

            {/* COMPREHENSIVE CUSTOM MEDIA CONTROLS BAR */}
            <div className="p-4 md:p-5 bg-slate-950 border-t border-slate-800/80 space-y-3">
              {/* Timeline Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="1"
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Bottom Control Buttons Grid */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Play/Pause, -10s, +10s */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span className="text-xs">{isPlaying ? 'Pause (Space)' : 'Play (Space)'}</span>
                  </button>

                  <button
                    onClick={() => seekBy(-10)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>-10s</span>
                  </button>

                  <button
                    onClick={() => seekBy(10)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Forward 10 seconds"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>+10s</span>
                  </button>
                </div>

                {/* Right: Playback Speed Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
                  {SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd === 1 ? '1.0x' : `${spd}x`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pedagogical Takeaway Footer */}
            <div className="p-4 md:p-5 bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Key Pedagogical Takeaway
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                    {takeaway}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Watched & Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default InAppYouTubePlayerModal;
