'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from './playerStore';
import {
  getPlayer,
  play,
  onPlayerState,
  onPlayerError,
  loadYouTubeApi,
  getCurrentPlayerInstance,
} from './youtubeEngine';
import {
  X,
  Minimize2,
  Maximize2,
  CheckCircle,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react';

export function PersistentPlayerHost() {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    state,
    activeVideo,
    error,
    openVideo,
    dockVideo,
    expandVideo,
    closeVideo,
    setError,
    setProgress,
    setPlaying,
    isPlaying,
  } = usePlayerStore();

  const [duration, setDuration] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [bufferingTooLong, setBufferingTooLong] = useState(false);
  const bufferingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lazy-load API at idle after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => loadYouTubeApi());
      } else {
        setTimeout(() => loadYouTubeApi(), 1000);
      }
    }
  }, []);

  // Sync playback when activeVideo changes or state becomes MODAL/DOCKED
  useEffect(() => {
    if (!activeVideo?.videoId || !mountRef.current) return;
    if (state === 'HIDDEN') return;

    const startSec = activeVideo.startSeconds || 0;
    play(mountRef.current, activeVideo.videoId, startSec).catch((err) => {
      console.warn('[PersistentPlayerHost] play error:', err);
    });
  }, [activeVideo?.videoId, state]);

  // Handle player state changes
  useEffect(() => {
    const unsubState = onPlayerState((playerState) => {
      // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
      if (playerState === 1) {
        setPlaying(true);
        setBufferingTooLong(false);
        if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);

        const p = getCurrentPlayerInstance();
        if (p?.getDuration) {
          const d = Math.floor(p.getDuration() || 0);
          setDuration(d);
        }
      } else if (playerState === 2) {
        setPlaying(false);
      } else if (playerState === 3) {
        // Buffering
        if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
        bufferingTimerRef.current = setTimeout(() => {
          setBufferingTooLong(true);
        }, 6000);
      } else if (playerState === 0) {
        // Ended -> mark watched
        setPlaying(false);
        setIsWatched(true);
        if (activeVideo?.resourceId) {
          saveProgressToBackend(activeVideo.resourceId, duration, duration, true);
        }
      }
    });

    const unsubErr = onPlayerError((code) => {
      if (code === 100) {
        setError({
          code,
          message: 'This video is unavailable or has been removed.',
        });
      } else if (code === 101 || code === 150) {
        setError({
          code,
          message: 'The video owner does not allow embedded playback.',
        });
      } else {
        setError({
          code,
          message: 'Playback error occurred. Click below to open directly on YouTube.',
        });
      }
    });

    return () => {
      unsubState();
      unsubErr();
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    };
  }, [activeVideo?.resourceId, duration, setError, setPlaying]);

  // Save progress periodically every 5s while playing
  useEffect(() => {
    if (isPlaying && activeVideo?.resourceId) {
      saveIntervalRef.current = setInterval(() => {
        const p = getCurrentPlayerInstance();
        if (p?.getCurrentTime) {
          const sec = Math.floor(p.getCurrentTime() || 0);
          const dur = Math.floor(p.getDuration() || duration);
          setCurrentSeconds(sec);
          const watched90 = dur > 0 && sec >= dur * 0.9;
          if (watched90) setIsWatched(true);
          setProgress(sec, dur, watched90);
          saveProgressToBackend(activeVideo.resourceId!, sec, dur, watched90);
        }
      }, 5000);
    } else {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    }

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [isPlaying, activeVideo?.resourceId, duration, setProgress]);

  const saveProgressToBackend = async (
    resourceId: string,
    seconds: number,
    totalDuration: number,
    watched: boolean
  ) => {
    try {
      await fetch(`/api/resources/${resourceId}/video-progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seconds,
          duration: totalDuration,
          watched,
        }),
      });
    } catch (_) {}
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (state === 'HIDDEN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const p = getCurrentPlayerInstance();
      if (!p) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        if (isPlaying) p.pauseVideo?.();
        else p.playVideo?.();
      } else if (e.key === 'j') {
        e.preventDefault();
        const cur = p.getCurrentTime?.() || 0;
        p.seekTo?.(Math.max(0, cur - 10), true);
      } else if (e.key === 'l') {
        e.preventDefault();
        const cur = p.getCurrentTime?.() || 0;
        p.seekTo?.(cur + 10, true);
      } else if (e.key === 'm') {
        e.preventDefault();
        if (p.isMuted?.()) {
          p.unMute?.();
          setIsMuted(false);
        } else {
          p.mute?.();
          setIsMuted(true);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (state === 'MODAL') dockVideo();
        else closeVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, isPlaying, dockVideo, closeVideo]);

  const handleManualWatched = () => {
    setIsWatched(true);
    if (activeVideo?.resourceId) {
      saveProgressToBackend(activeVideo.resourceId, currentSeconds, duration, true);
    }
  };

  const handleReplaceResource = async () => {
    if (!activeVideo?.resourceId) return;
    try {
      const res = await fetch(`/api/resources/${activeVideo.resourceId}/replace`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.resource?.videoId) {
        openVideo({
          videoId: data.resource.videoId,
          resourceId: data.resource.id,
          title: data.resource.title,
        });
      } else {
        alert(data.error || 'No replacement video available.');
      }
    } catch (_) {
      alert('Replacement request failed.');
    }
  };

  // Instant class swap, NOT animation, NO backdrop blur!
  const containerClass =
    state === 'HIDDEN'
      ? 'fixed -bottom-[9999px] -left-[9999px] opacity-0 pointer-events-none w-1 h-1'
      : state === 'MODAL'
      ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 md:p-8'
      : 'fixed bottom-6 right-6 z-50 w-80 md:w-96 shadow-2xl rounded-xl border border-white/10 bg-slate-900 overflow-hidden';

  return (
    <div className={containerClass}>
      {state === 'MODAL' && (
        <div className="relative w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0 pr-4">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                In-App Player
              </span>
              <h3 className="text-sm font-medium text-slate-200 truncate">
                {activeVideo?.title || 'Video Resource'}
              </h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleManualWatched}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isWatched
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Mark as watched"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isWatched ? 'Watched' : 'Mark Watched'}
                </span>
              </button>
              <button
                onClick={dockVideo}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Dock to corner"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeVideo}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Player Mount */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            <div ref={mountRef} className="w-full h-full" />

            {/* Error or Fallback Overlay */}
            {(error || bufferingTooLong) && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
                <p className="text-sm text-slate-200 font-medium mb-4 max-w-md">
                  {error?.message ||
                    'Playback is experiencing buffering delays on your connection.'}
                </p>
                <div className="flex items-center gap-3">
                  {error?.code === 100 ? (
                    <button
                      onClick={handleReplaceResource}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      Find Alternative Video
                    </button>
                  ) : null}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo?.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'DOCKED' && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
            <span className="text-xs font-medium text-slate-200 truncate pr-2">
              {activeVideo?.title || 'Playing video'}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={expandVideo}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Expand"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={closeVideo}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Player Mount */}
          <div className="relative w-full aspect-video bg-black">
            <div ref={mountRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {state === 'HIDDEN' && (
        <div ref={mountRef} className="w-1 h-1 pointer-events-none" />
      )}
    </div>
  );
}
