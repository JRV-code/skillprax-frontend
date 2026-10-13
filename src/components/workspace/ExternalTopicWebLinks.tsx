'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface TopicDoc {
  topicId: string;
  title: string;
  externalUrl: string;
  sourceDomain: string;
  coreObjective: string;
}

export interface ExternalTopicWebLinksProps {
  topics: TopicDoc[];
  stepNumber?: number;
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|tiktok\.com/i.test(url);
}

export const ExternalTopicWebLinks: React.FC<ExternalTopicWebLinksProps> = ({
  topics,
  stepNumber = 1,
}) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Step {stepNumber}: Official Technical Documentation
          </h3>
          <p className="text-xs text-slate-500">
            Official text resources and reference manuals. Links open the authentic website in a new tab.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
          Verified Non-Video Sources
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {topics.map((topic, idx) => {
          // Guard: Guarantee no video URL is classified as a text document
          let safeUrl = topic.externalUrl;
          let safeDomain = topic.sourceDomain || 'Official Resource';
          if (isVideoUrl(safeUrl)) {
            safeUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.title)}`;
            safeDomain = 'wikipedia.org';
          }

          return (
            <div
              key={topic.topicId || idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] uppercase tracking-wider">
                      TEXT DOCUMENT
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-500">{safeDomain}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{topic.coreObjective}</p>
                </div>
              </div>

              {/* External Tab Link */}
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer"
              >
                <span>Open Website ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExternalTopicWebLinks;
