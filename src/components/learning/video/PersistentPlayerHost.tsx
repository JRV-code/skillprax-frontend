'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from './playerStore';
import {
  play,
  pauseVideo,
  onPlayerState,
  onPlayerError,
  loadYouTubeApi,
  getCurrentPlayerInstance,
  sendIframeCommand,
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

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

  // Mark client mounted for safe Portal rendering
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Reset state when new video loads
  useEffect(() => {
    if (state === 'HIDDEN' || !activeVideo?.videoId) return;
    setCurrentSeconds(0);
    setDuration(0);
    setIsWatched(false);
    setPlaying(true);
  }, [activeVideo?.videoId, state, setPlaying]);

  // When player is hidden, immediately pause video
  useEffect(() => {
    if (state === 'HIDDEN') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      } catch (_) {}
      pauseVideo();
      setPlaying(false);
    }
  }, [state, setPlaying]);

  // Window message listener for YouTube postMessage API infoDelivery
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWindowMessage = (e: MessageEvent) => {
      try {
        const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (payload?.event === 'onStateChange') {
          if (payload.info === 1) setPlaying(true);
          else if (payload.info === 2 || payload.info === 0) setPlaying(false);
          if (payload.info === 0) setIsWatched(true);
        }
        if (payload?.event === 'infoDelivery' && payload?.info) {
          if (typeof payload.info.currentTime === 'number') {
            const sec = Math.floor(payload.info.currentTime);
            setCurrentSeconds(sec);
            if (duration > 0) {
              const watched90 = sec >= duration * 0.9;
              if (watched90) setIsWatched(true);
              setProgress(sec, duration, watched90);
            }
          }
          if (typeof payload.info.duration === 'number' && payload.info.duration > 0) {
            setDuration(Math.floor(payload.info.duration));
          }
          if (typeof payload.info.playerState === 'number') {
            setPlaying(payload.info.playerState === 1);
          }
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [duration, setPlaying, setProgress]);

  const sendPostMessageCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch (_) {}
    sendIframeCommand(func, args);
  }, []);

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

  const handleClose = () => {
    sendPostMessageCommand('pauseVideo');
    pauseVideo();
    closeVideo();
  };

  const handleTogglePlay = () => {
    const currentlyPlaying = isPlaying;
    if (currentlyPlaying) {
      sendPostMessageCommand('pauseVideo');
      setPlaying(false);
    } else {
      sendPostMessageCommand('playVideo');
      setPlaying(true);
    }
  };

  const handleSeek = (delta: number) => {
    const target = Math.max(0, currentSeconds + delta);
    sendPostMessageCommand('seekTo', [target, true]);
    setCurrentSeconds(Math.floor(target));
  };

  const handleChangeSpeed = (speed: number) => {
    sendPostMessageCommand('setPlaybackRate', [speed]);
    setPlaybackSpeed(speed);
  };

  const toggleMute = () => {
    if (isMuted) {
      sendPostMessageCommand('unMute');
      setIsMuted(false);
    } else {
      sendPostMessageCommand('mute');
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

  // Keyboard shortcuts
  useEffect(() => {
    if (state === 'HIDDEN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'j') {
        e.preventDefault();
        handleSeek(-10);
      } else if (e.key === 'l') {
        e.preventDefault();
        handleSeek(10);
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

  // If hidden or unmounted on client, render nothing
  if (!isClientMounted || state === 'HIDDEN' || typeof document === 'undefined') {
    return null;
  }

  // MODAL VIEW: Portaled to document.body, centered in exact scroll viewport
  const renderModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
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
          {activeVideo?.videoId ? (
            <iframe
              key={activeVideo.videoId}
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
              title={activeVideo.title || 'Video Lecture'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 pointer-events-auto"
            />
          ) : (
            <div ref={mountRef} className="w-full h-full pointer-events-auto" />
          )}

          {/* Fatal Error Fallback ONLY (100, 101, 150) */}
          {error && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
              <p className="text-sm text-slate-200 font-medium mb-4 max-w-md">
                {error.message}
              </p>
              <div className="flex items-center gap-3">
                {error.code === 100 && (
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
      </motion.div>
    </div>
  );

  // DOCKED VIEW: Portaled to document.body, floating at bottom-right of current screen
  const renderDocked = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="fixed bottom-6 right-6 z-[9999] w-80 sm:w-96 shadow-2xl rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden flex flex-col"
    >
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
    </motion.div>
  );

  return createPortal(
    <AnimatePresence mode="wait">
      {state === 'MODAL' ? renderModal() : renderDocked()}
    </AnimatePresence>,
    document.body
  );
}
