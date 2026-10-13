'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { stagger, fadeUp, safe } from '@/lib/learning/motion';
import { ChapterCard, ChapterItem, ChapterResource } from './ChapterCard';

interface ChapterListProps {
  chapters: ChapterItem[];
  onOpenVideo: (chapter: ChapterItem, resource: ChapterResource) => void;
  onReplaceResource: (resourceId: string) => void;
  onRetryChapter: (chapterId: string) => void;
  currentLanguage?: string;
  approachViewed?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onOpenVideo,
  onReplaceResource,
  onRetryChapter,
  currentLanguage = 'en',
  approachViewed = true,
}) => {
  const reduceMotion = useReducedMotion();
  // Accordion state: first chapter open by default
  const [openChapterKey, setOpenChapterKey] = useState<string | null>(
    chapters[0]?.key || null
  );

  useEffect(() => {
    if (chapters.length > 0 && !openChapterKey) {
      setOpenChapterKey(chapters[0].key);
    }
  }, [chapters]);

  // Section 9 D8: Frontend render guard — dedupe resources by canonicalKey before render
  // and log a console error if it ever drops one.
  const seenCanonicalKeys = new Set<string>();
  const verifiedChapters = chapters.map((chap) => {
    if (!chap.resource?.url) return chap;
    const url = chap.resource.url;
    // Basic canonicalKey calculation on client
    let key = url.toLowerCase();
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const id = chap.resource.videoId || u.searchParams.get('v');
        if (id) key = `yt:${id}`;
      } else {
        key = `${u.hostname}${u.pathname}`;
      }
    } catch {}

    if (seenCanonicalKeys.has(key)) {
      console.error(`[D8 Violation] Duplicate resource dropped on frontend render: ${key}`);
      return { ...chap, resource: null, status: 'NO_VERIFIED_LINK' as const };
    }
    seenCanonicalKeys.add(key);
    return chap;
  });

  return (
    <motion.div
      variants={safe(stagger(0.06), reduceMotion)}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {verifiedChapters.map((chapter, idx) => (
        <motion.div
          key={chapter.key || chapter.id || idx}
          variants={safe(fadeUp, reduceMotion)}
        >
          <ChapterCard
            chapter={chapter}
            chapterNumber={idx + 1}
            isOpen={openChapterKey === chapter.key}
            onToggle={() =>
              setOpenChapterKey((prev) => (prev === chapter.key ? null : chapter.key))
            }
            onOpenVideo={onOpenVideo}
            onReplaceResource={onReplaceResource}
            onRetryChapter={onRetryChapter}
            currentLanguage={currentLanguage}
            approachViewed={approachViewed}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
