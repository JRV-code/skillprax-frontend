'use client';

import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Gauge, 
  Maximize2, 
  Tv,
  Sparkles
} from 'lucide-react';

export interface InAppLectureTheaterProps {
  videoId: string;
  videoTitle: string;
  stepNumber: number;
  miniGuide?: string;
}

export const InAppLectureTheater: React.FC<InAppLectureTheaterProps> = ({
  videoId,
  videoTitle,
  stepNumber,
  miniGuide,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePlay = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const func = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [speed] }),
        '*'
      );
    }
  };

  const skipTime = (seconds: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekBy', args: [seconds, true] }),
        '*'
      );
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl mb-10">
      {/* Stream Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Tv className="w-4 h-4"/>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Step {stepNumber} In-App Video Lecture
            </span>
            <h3 className="text-sm font-semibold text-slate-100 truncate max-w-xl">
              {videoTitle}
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
          Native UI Stream
        </span>
      </div>

      {/* 16:9 Iframe Player with Direct YouTube API Integration */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&enablejsapi=1&rel=0&modestbranding=1`}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Control HUD Bar */}
      <div className="px-6 py-3.5 bg-slate-950 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Standard player controls (subtitles, audio track, resolution) enabled in video</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          {/* ±10s Skip Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => skipTime(-10)}
              title="Skip -10s"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>10s</span>
            </button>
            <button
              type="button"
              onClick={() => skipTime(10)}
              title="Skip +10s"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <span>10s</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-2"/>
            <span className="text-[11px] font-bold text-slate-400">Speed:</span>
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSpeed(s)}
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
            onClick={handleFullscreen}
            title="Fullscreen"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Groq Synthesized Video Study Protocol & Mini Guide */}
      {miniGuide && (
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800/90 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
              Video Mini Guide • How to Watch & Absorb This Lecture
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
              {miniGuide}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InAppLectureTheater;
