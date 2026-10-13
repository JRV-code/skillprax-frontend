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
} from 'lucide-react';

interface InAppLecturePlayerProps {
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

export const InAppLecturePlayer: React.FC<InAppLecturePlayerProps> = ({
  videoId,
  videoTitle,
  stepNumber,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);

  // Load YouTube IFrame API Script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
  }, []);

  // Initialize YT Player Instance
  useEffect(() => {
    if (!isApiReady || !videoId || !playerContainerRef.current) return;

    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (_) {}
    }

    try {
      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1, // Native YouTube timeline, subtitles, audio track selector
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    } catch (err) {
      console.warn('[InAppLecturePlayer] Player init warning:', err);
    }

    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [isApiReady, videoId]);

  // Player Control Functions
  const togglePlay = () => {
    if (!playerInstanceRef.current) return;
    try {
      if (isPlaying) {
        playerInstanceRef.current.pauseVideo();
      } else {
        playerInstanceRef.current.playVideo();
      }
    } catch (_) {}
  };

  const skipSeconds = (seconds: number) => {
    if (!playerInstanceRef.current?.getCurrentTime) return;
    try {
      const currentTime = playerInstanceRef.current.getCurrentTime();
      playerInstanceRef.current.seekTo(Math.max(0, currentTime + seconds), true);
    } catch (_) {}
  };

  const changePlaybackSpeed = (speed: number) => {
    if (!playerInstanceRef.current?.setPlaybackRate) return;
    try {
      playerInstanceRef.current.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    } catch (_) {}
  };

  const toggleMute = () => {
    if (!playerInstanceRef.current) return;
    try {
      if (isMuted) {
        playerInstanceRef.current.unMute();
        setIsMuted(false);
      } else {
        playerInstanceRef.current.mute();
        setIsMuted(true);
      }
    } catch (_) {}
  };

  const requestFullscreen = () => {
    const iframe = playerContainerRef.current?.querySelector('iframe') || playerContainerRef.current;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl mb-8">
      {/* Lecture Header Banner */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step {stepNumber} In-App Lecture
          </span>
          <span className="text-slate-600">•</span>
          <h3 className="text-sm font-semibold text-slate-200 truncate max-w-xl">
            {videoTitle}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
          Native UI Stream
        </span>
      </div>

      {/* Embedded 16:9 Screen */}
      <div className="relative w-full aspect-video bg-black">
        <div ref={playerContainerRef} className="w-full h-full" />
      </div>

      {/* Control HUD */}
      <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Play/Pause & Skip Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Resume
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => skipSeconds(-10)}
            title="Rewind 10 seconds"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          <button
            type="button"
            onClick={() => skipSeconds(10)}
            title="Forward 10 seconds"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed & Screen Sizing */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-[11px] font-bold text-slate-400">Speed:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => changePlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  playbackSpeed === speed
                    ? 'bg-[#0284C7] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={requestFullscreen}
            title="Fullscreen"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InAppLecturePlayer;
