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
    // 150ms hover intent before prewarming
    hoverTimerRef.current = setTimeout(() => {
      prewarm();
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
      className="group flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        {/* Play Icon */}
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all flex-shrink-0 shadow-xs">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-[#0284C7] border border-sky-200">
              {video.videoType || 'Video Tutorial'}
            </span>
            {video.channelName && (
              <span className="text-xs text-slate-500 font-medium truncate">
                • {video.channelName}
              </span>
            )}
          </div>
          <p className="text-sm font-heading font-bold text-slate-800 group-hover:text-slate-950 truncate">
            {video.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 text-xs font-heading font-bold text-emerald-600 group-hover:text-emerald-700">
        <span className="hidden sm:inline">Play In-App</span>
        <Play className="w-3.5 h-3.5 fill-current" />
      </div>
    </div>
  );
}
