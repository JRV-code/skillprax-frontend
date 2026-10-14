'use client';

import React, { useRef } from 'react';
import { Play, Video, ExternalLink } from 'lucide-react';
import { usePlayerStore } from './video/playerStore';
import { prewarm } from './video/youtubeEngine';

interface VideoRowProps {
  video: {
    id: string;
    title: string;
    videoId: string;
    videoType?: string;
    channelName?: string;
    embeddable?: boolean;
  };
}

export function VideoRow({ video }: VideoRowProps) {
  const { openVideo } = usePlayerStore();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerEnter = () => {
    // 150ms hover intent before prewarming (Prompt Section 13.4)
    hoverTimerRef.current = setTimeout(() => {
      const dummyMount = document.querySelector('div[class*="pointer-events-none"]') as HTMLElement;
      if (dummyMount && video.videoId) {
        prewarm(dummyMount, video.videoId);
      }
    }, 150);
  };

  const handlePointerLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleClick = () => {
    openVideo({
      videoId: video.videoId,
      resourceId: video.id,
      title: video.title,
      channel: video.channelName,
    });
  };

  return (
    <div
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        {/* Play Icon */}
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex-shrink-0">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {video.videoType || 'Video Tutorial'}
            </span>
            {video.channelName && (
              <span className="text-xs text-slate-400 truncate">
                • {video.channelName}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
            {video.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
        <span className="hidden sm:inline">Play In-App</span>
        <Play className="w-3.5 h-3.5 fill-current" />
      </div>
    </div>
  );
}
