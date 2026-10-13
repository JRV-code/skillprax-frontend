'use client';

import React from 'react';
import { ExternalLink, Globe, BookOpen } from 'lucide-react';

export interface TopicDoc {
  topicId: string;
  title: string;
  externalUrl: string;
  sourceDomain: string;
  coreObjective: string;
}

export interface ExternalTopicWebLinksProps {
  topics: TopicDoc[];
}

export const ExternalTopicWebLinks: React.FC<ExternalTopicWebLinksProps> = ({ topics }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Official Documentation & Reference Websites
          </h3>
          <p className="text-xs text-slate-500">
            Explore authoritative documentation directly on original websites. Links open in a new tab.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 w-fit">
          {topics.length} Verified Sources
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {topics.map((topic, index) => (
          <div
            key={topic.topicId || index}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                {index + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{topic.coreObjective}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-0.5">
                  <Globe className="w-3 h-3" />
                  <span>{topic.sourceDomain || 'Official Resource'}</span>
                </span>
              </div>
            </div>

            {/* Direct External Web Link */}
            <a
              href={topic.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-sm w-fit shrink-0 cursor-pointer"
            >
              <span>Open Original Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExternalTopicWebLinks;
