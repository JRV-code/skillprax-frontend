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

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 14 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {chapters.map((chapter, chIdx) => {
        const isOpen = openMap[chapter.id] ?? false;

        return (
          <motion.div
            key={chapter.id}
            variants={itemVariants}
            className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/40 overflow-hidden transition-all hover:shadow-lg hover:border-slate-300"
          >
            {/* Header Accordion Trigger */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Chapter {chapter.order || chIdx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    • {chapter.topics.length} topic{chapter.topics.length === 1 ? '' : 's'}
                  </span>
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900 truncate">
                  {chapter.title}
                </h3>
                {chapter.summary && (
                  <p className="text-xs text-slate-600 line-clamp-1">{chapter.summary}</p>
                )}
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 transition-colors">
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
                  <div className="p-6 pt-2 space-y-4 border-t border-slate-100">
                    {/* Chapter Video if available */}
                    {chapter.video && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-600 px-1">
                          Chapter Video Guide
                        </span>
                        <VideoRow video={chapter.video} />
                      </div>
                    )}

                    {/* Topics List with Staggered Cascades */}
                    <motion.div
                      variants={containerVariants}
                      initial="initial"
                      animate="animate"
                      className="space-y-3.5"
                    >
                      {chapter.topics.map((topic, tIdx) => (
                        <motion.div key={topic.id || topic.key} variants={itemVariants}>
                          <TopicCard
                            topic={topic}
                            stepId={stepId}
                            defaultExpanded={chIdx === 0 && tIdx === 0}
                            preferredLanguage={preferredLanguage}
                            onResourceReplaced={onResourceReplaced}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
