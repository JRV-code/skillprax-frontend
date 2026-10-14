'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Layers } from 'lucide-react';
import { TopicCard } from './TopicCard';
import { VideoRow } from './VideoRow';

interface Chapter {
  id: string;
  order: number;
  title: string;
  summary: string;
  video?: {
    id: string;
    title: string;
    videoId: string;
    videoType?: string;
    channelName?: string;
  } | null;
  topics: Array<{
    id: string;
    key: string;
    order: number;
    title: string;
    covers: string;
    minutes: number;
    acuIds?: string[];
    guide?: any;
    status: 'READY' | 'NO_VERIFIED_LINK';
    resource?: any;
  }>;
}

interface ChapterAccordionProps {
  chapters: Chapter[];
  stepId: string;
  preferredLanguage?: string;
  onResourceReplaced?: (topicKey: string, newResource: any) => void;
}

export function ChapterAccordion({
  chapters,
  stepId,
  preferredLanguage = 'en',
  onResourceReplaced,
}: ChapterAccordionProps) {
  // First chapter is open by default
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      init[ch.id] = idx === 0;
    });
    return init;
  });

  const toggleChapter = (chapterId: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter, chIdx) => {
        const isOpen = openMap[chapter.id] ?? false;

        return (
          <div
            key={chapter.id}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg overflow-hidden transition-all"
          >
            {/* Header Accordion Trigger */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/40 transition-colors"
            >
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Chapter {chapter.order || chIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {chapter.topics.length} topic{chapter.topics.length === 1 ? '' : 's'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 truncate">
                  {chapter.title}
                </h3>
                {chapter.summary && (
                  <p className="text-xs text-slate-400 line-clamp-1">{chapter.summary}</p>
                )}
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="p-5 pt-1 space-y-4 border-t border-slate-800/60">
                    {/* Chapter Video if available */}
                    {chapter.video && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                          Chapter Video Guide
                        </span>
                        <VideoRow video={chapter.video} />
                      </div>
                    )}

                    {/* Topics List */}
                    <div className="space-y-3.5">
                      {chapter.topics.map((topic, tIdx) => (
                        <TopicCard
                          key={topic.id || topic.key}
                          topic={topic}
                          stepId={stepId}
                          defaultExpanded={chIdx === 0 && tIdx === 0}
                          preferredLanguage={preferredLanguage}
                          onResourceReplaced={onResourceReplaced}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
