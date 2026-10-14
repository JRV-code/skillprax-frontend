'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface TopicDoc {
  topicId: string;
  title: string;
  externalUrl: string;
  sourceDomain: string;
  coreObjective: string;
  miniGuide?: string;
}

export interface ExternalTopicWebLinksProps {
  topics: TopicDoc[];
  stepNumber?: number;
  stepExplanation?: string;
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|tiktok\.com/i.test(url);
}

export const ExternalTopicWebLinks: React.FC<ExternalTopicWebLinksProps> = ({
  topics,
  stepNumber = 1,
  stepExplanation,
}) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="mb-10 space-y-6">
      {/* General Step Explanation Card (Groq Synthesized) */}
      {stepExplanation && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
              PEDAGOGICAL OVERVIEW • STEP {stepNumber}
            </span>
          </div>
          <h3 className="text-base font-heading font-bold text-slate-900">
            What You Should Master in This Step
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">
            {stepExplanation}
          </p>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Step {stepNumber}: Authentic Documentation & Reading
            </h3>
            <p className="text-xs text-slate-500">
              Direct open web resources (no login or paywalls required). Links open the authentic website in a new tab.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            Verified Non-Login Sources
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
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Website ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Groq Synthesized Mini Guide */}
                {(topic.miniGuide || topic.coreObjective) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 block">
                      Mini Guide • What to Read & Focus On
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {topic.miniGuide || topic.coreObjective}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExternalTopicWebLinks;
