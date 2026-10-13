'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Gauge, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Tv 
} from 'lucide-react';

export interface InAppLectureTheaterProps {
  videoId: string;
  videoTitle: string;
  stepNumber: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const InAppLectureTheater: React.FC<InAppLectureTheaterProps> = ({
  videoId,
  videoTitle,
  stepNumber,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !videoId || !containerRef.current) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (_) {}
    }

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1, // Full native YouTube controls: Subtitles, audio language, resolution
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onStateChange: (e: any) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    } catch (err) {
      console.warn('[InAppLectureTheater] Player init warning:', err);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [isReady, videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (_) {}
  };

  const skip = (seconds: number) => {
    if (!playerRef.current?.getCurrentTime) return;
    try {
      const curr = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, curr + seconds), true);
    } catch (_) {}
  };

  const setSpeed = (speed: number) => {
    if (!playerRef.current?.setPlaybackRate) return;
    try {
      playerRef.current.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    } catch (_) {}
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (_) {}
  };

  const toggleFullscreen = () => {
    const iframe = containerRef.current?.querySelector('iframe') || containerRef.current;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl mb-10">
      {/* Stream Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Step {stepNumber} Verified Video Lecture
            </span>
            <h3 className="text-sm font-semibold text-slate-100 truncate max-w-xl">
              {videoTitle}
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
          In-App UI Stream
        </span>
      </div>

      {/* 16:9 Video Canvas */}
      <div className="relative w-full aspect-video bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Control HUD Bar */}
      <div className="px-6 py-3.5 bg-slate-950 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Lecture'}</span>
          </button>

          <button
            type="button"
            onClick={() => skip(-10)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  playbackSpeed === s ? 'bg-[#0284C7] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InAppLectureTheater;
