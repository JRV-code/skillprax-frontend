'use client';

import React from 'react';
import { ExternalLink, CheckCircle2, AlertOctagon, ShieldAlert } from 'lucide-react';

export interface TopicItem {
  topicId: string;
  title: string;
  externalUrl: string;
  sourceDomain: string;
  pedagogicalGuide?: {
    sectionsToRead?: string[];
    sectionsToSkip?: string[];
    howToLearn?: string;
    keyTraps?: string[];
  };
}

export interface TopicDocumentationSectionProps {
  topics: TopicItem[];
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|tiktok\.com/i.test(url);
}

export const TopicDocumentationSection: React.FC<TopicDocumentationSectionProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="space-y-6 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Curated Topic Documentation & Study Guides
          </h3>
          <p className="text-xs text-slate-500">
            Each topic links directly to verified official documentation. Study the guide below before reading.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 w-fit">
          {topics.length} Authoritative Topics
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {topics.map((topic, index) => {
          let safeUrl = topic.externalUrl;
          let safeDomain = topic.sourceDomain || 'Official Resource';
          if (isVideoUrl(safeUrl)) {
            safeUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.title)}`;
            safeDomain = 'wikipedia.org';
          }

          return (
            <div
              key={topic.topicId || index}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all"
            >
              {/* Top Bar: Topic Name & Direct External Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{topic.title}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Verified Source: {safeDomain}
                    </span>
                  </div>
                </div>

                {/* Direct Website Opener */}
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer"
                >
                  <span>Open Original Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            {/* Pedagogical Reading Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/90">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  What Sections to Read on the Site
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {(topic.pedagogicalGuide?.sectionsToRead || [
                    'Primary architecture and conceptual mental model',
                    'Main API/syntax definitions and usage parameters',
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100/90">
                <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                  What Sections to Skip (Avoid Noise)
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {(topic.pedagogicalGuide?.sectionsToSkip || [
                    'Legacy framework migrations',
                    'Optional telemetry and enterprise boilerplate',
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-800 block mb-1">
                  How to Approach Learning & Mental Model:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {topic.pedagogicalGuide?.howToLearn ||
                    `Focus on first principles: understand why this mechanism is chosen over alternatives and trace the execution path before reading implementation details.`}
                </p>
              </div>

              {topic.pedagogicalGuide?.keyTraps && topic.pedagogicalGuide.keyTraps.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    Key Traps & Common Misconceptions:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {topic.pedagogicalGuide.keyTraps.map((trap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{trap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default TopicDocumentationSection;
