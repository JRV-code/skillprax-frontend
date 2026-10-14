'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from './playerStore';
import {
  play,
  pauseVideo,
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
  RotateCcw,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function PersistentPlayerHost() {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);

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
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [bufferingTooLong, setBufferingTooLong] = useState(false);
  const bufferingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lazy-load API at idle after initial page mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => loadYouTubeApi());
      } else {
        setTimeout(() => loadYouTubeApi(), 1000);
      }
    }
  }, []);

  // When player is hidden, immediately pause video so audio never plays in background
  useEffect(() => {
    if (state === 'HIDDEN') {
      pauseVideo();
      setPlaying(false);
    }
  }, [state, setPlaying]);

  // Mount/play video when activeVideo changes or state becomes MODAL / DOCKED
  useEffect(() => {
    if (state === 'HIDDEN' || !activeVideo?.videoId || !mountRef.current) return;

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
        if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
        bufferingTimerRef.current = setTimeout(() => {
          setBufferingTooLong(true);
        }, 6000);
      } else if (playerState === 0) {
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

  // Poll current time every 500ms while playing
  useEffect(() => {
    if (state !== 'HIDDEN') {
      progressTimerRef.current = setInterval(() => {
        const p = getCurrentPlayerInstance();
        if (p && typeof p.getCurrentTime === 'function') {
          const sec = Math.floor(p.getCurrentTime() || 0);
          const dur = Math.floor((p.getDuration ? p.getDuration() : duration) || duration);
          setCurrentSeconds(sec);
          if (dur > 0 && dur !== duration) setDuration(dur);

          const watched90 = dur > 0 && sec >= dur * 0.9;
          if (watched90) setIsWatched(true);
          setProgress(sec, dur, watched90);
        }
      }, 500);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [state, duration, setProgress]);

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
        toggleMute();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (state === 'MODAL') dockVideo();
        else handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, isPlaying, dockVideo]);

  const handleClose = () => {
    pauseVideo();
    closeVideo();
  };

  const handleTogglePlay = () => {
    const p = getCurrentPlayerInstance();
    if (!p) return;
    if (isPlaying) {
      p.pauseVideo?.();
    } else {
      p.playVideo?.();
    }
  };

  const handleSeek = (delta: number) => {
    const p = getCurrentPlayerInstance();
    if (!p) return;
    const cur = p.getCurrentTime?.() || 0;
    const target = Math.max(0, Math.min(duration || Infinity, cur + delta));
    p.seekTo?.(target, true);
    setCurrentSeconds(Math.floor(target));
  };

  const handleChangeSpeed = (speed: number) => {
    const p = getCurrentPlayerInstance();
    if (p?.setPlaybackRate) {
      p.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    }
  };

  const toggleMute = () => {
    const p = getCurrentPlayerInstance();
    if (!p) return;
    if (p.isMuted?.()) {
      p.unMute?.();
      setIsMuted(false);
    } else {
      p.mute?.();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoBoxRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      videoBoxRef.current.requestFullscreen?.();
    }
  };

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

  // If hidden, render nothing. Zero background bleed!
  if (state === 'HIDDEN') {
    return null;
  }

  // MODAL VIEW: Video is strictly mounted inside the modal's 16:9 black box
  if (state === 'MODAL') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-5 md:p-8 animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                In-App Player
              </span>
              <h3 className="text-sm font-heading font-semibold text-slate-100 truncate">
                {activeVideo?.title || 'Video Resource'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleManualWatched}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isWatched
                    ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
                title="Mark as watched"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isWatched ? 'Watched' : 'Mark Watched'}
                </span>
              </button>

              <button
                type="button"
                onClick={dockVideo}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dock to corner"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 16:9 Black Video Box — MOUNT CONTAINER IS STRICTLY CONTAINED HERE */}
          <div
            ref={videoBoxRef}
            className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center"
          >
            <div ref={mountRef} className="w-full h-full pointer-events-auto" />

            {/* Error or Buffering Fallback Overlay */}
            {(error || bufferingTooLong) && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
                <p className="text-sm text-slate-200 font-medium mb-4 max-w-md">
                  {error?.message ||
                    'Playback is experiencing buffering delays on your connection.'}
                </p>
                <div className="flex items-center gap-3">
                  {error?.code === 100 && (
                    <button
                      type="button"
                      onClick={handleReplaceResource}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Find Alternative Video
                    </button>
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo?.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
                  >
                    Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Interactive HUD Control Bar Directly Below Video Box */}
          <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-slate-200 select-none">
            {/* Left: Play/Pause, -10s, +10s, Duration */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSeek(-10)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Rewind 10 seconds (J)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">-10s</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeek(10)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Forward 10 seconds (L)"
              >
                <span className="text-[10px]">+10s</span>
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <div className="ml-2 font-mono text-xs text-slate-300 font-semibold tracking-wider">
                <span>{formatTime(currentSeconds)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Middle: Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              {SPEED_OPTIONS.map((spd) => {
                const isActive = playbackSpeed === spd;
                return (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleChangeSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-heading font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>

            {/* Right: Mute & Fullscreen */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DOCKED VIEW (Bottom-right corner)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 shadow-2xl rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-200 truncate pr-2">
          {activeVideo?.title || 'Playing video'}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={expandVideo}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Expand to Full Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16:9 Black Video Box */}
      <div ref={videoBoxRef} className="relative w-full aspect-video bg-black overflow-hidden">
        <div ref={mountRef} className="w-full h-full pointer-events-auto" />
      </div>

      {/* Compact Controls */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={() => handleSeek(-10)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="-10s"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => handleSeek(10)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="+10s"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          {formatTime(currentSeconds)} / {formatTime(duration)}
        </div>
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
