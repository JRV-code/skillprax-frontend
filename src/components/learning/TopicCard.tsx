'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Globe,
  Compass,
} from 'lucide-react';

interface TopicCardProps {
  topic: {
    id: string;
    key: string;
    order: number;
    title: string;
    covers: string;
    minutes: number;
    acuIds?: string[];
    guide?: {
      lookFor?: string[];
      skip?: string;
      doThis?: string;
    } | null;
    status: 'READY' | 'NO_VERIFIED_LINK';
    resource?: {
      id: string;
      url: string;
      title: string;
      domain: string;
      linkStatus: string;
    } | null;
  };
  stepId: string;
  defaultExpanded?: boolean;
  preferredLanguage?: string;
  onResourceReplaced?: (topicKey: string, newResource: any) => void;
}

export function googleTranslatedUrl(url: string, lang: string): string {
  return (
    'https://translate.google.com/translate?sl=auto&tl=' +
    encodeURIComponent(lang) +
    '&hl=' +
    encodeURIComponent(lang) +
    '&u=' +
    encodeURIComponent(url)
  );
}

export function TopicCard({
  topic,
  stepId,
  defaultExpanded = false,
  preferredLanguage = 'en',
  onResourceReplaced,
}: TopicCardProps) {
  const [approachOpen, setApproachOpen] = useState(defaultExpanded);
  const [replacing, setReplacing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  const handleReplace = async () => {
    if (!topic.resource?.id) return;
    setReplacing(true);
    setReplaceError(null);
    try {
      const res = await fetch(`/api/resources/${topic.resource.id}/replace`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.resource) {
        if (onResourceReplaced) onResourceReplaced(topic.key, data.resource);
      } else {
        setReplaceError(data.error || 'Could not find alternative link.');
      }
    } catch (_) {
      setReplaceError('Replacement request failed.');
    }
    setReplacing(false);
  };

  const handleTopicRetry = async () => {
    setRetrying(true);
    setReplaceError(null);
    try {
      const res = await fetch(`/api/steps/${stepId}/topics/${topic.key}/retry`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.resource) {
        if (onResourceReplaced) onResourceReplaced(topic.key, data.resource);
      } else {
        setReplaceError(data.error || 'Retry failed.');
      }
    } catch (_) {
      setReplaceError('Topic link search failed.');
    }
    setRetrying(false);
  };

  const isVerified = topic.resource?.linkStatus === 'VERIFIED';
  const showGoogleTranslate = preferredLanguage && preferredLanguage !== 'en' && topic.resource?.url;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
      {/* Header: Title, minutes, covers, ACU chips */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Topic {topic.order}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{topic.minutes} min</span>
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-100">{topic.title}</h4>
          </div>

          {/* ACU Chips */}
          {topic.acuIds && topic.acuIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {topic.acuIds.map((acu, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {acu}
                </span>
              ))}
            </div>
          )}
        </div>

        {topic.covers && <p className="text-xs text-slate-400 leading-relaxed">{topic.covers}</p>}
      </div>

      {/* Exactly ONE resource row */}
      {topic.status === 'READY' && topic.resource ? (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Verified Document
              </span>
              <span className="text-xs text-slate-400 font-mono truncate">
                {topic.resource.domain}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{topic.resource.title}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Google translate link for non-English learners */}
            {showGoogleTranslate && (
              <a
                href={googleTranslatedUrl(topic.resource.url, preferredLanguage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Translate (Google)</span>
              </a>
            )}

            {/* Primary Open Resource Button */}
            <a
              href={topic.resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm"
            >
              <span>Open Resource</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Small Replace Button */}
            <button
              onClick={handleReplace}
              disabled={replacing}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Link broken? Replace"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${replacing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Replace</span>
            </button>
          </div>
        </div>
      ) : (
        /* NO_VERIFIED_LINK state */
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>No verified link yet for this specific topic.</span>
          </div>
          <button
            onClick={handleTopicRetry}
            disabled={retrying}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>Find a Link</span>
          </button>
        </div>
      )}

      {replaceError && (
        <p className="text-xs text-rose-400 font-medium px-1">{replaceError}</p>
      )}

      {/* Expandable "How to approach this" */}
      {topic.guide && (
        <div className="border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setApproachOpen(!approachOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              How to Approach This Topic
            </span>
            {approachOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {approachOpen && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              {/* Look For */}
              {topic.guide.lookFor && topic.guide.lookFor.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Look For (Focus)
                  </span>
                  <ul className="space-y-1">
                    {topic.guide.lookFor.map((lf, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span>{lf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skip */}
              {topic.guide.skip && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Skip For Now
                  </span>
                  <p className="text-xs text-slate-300">{topic.guide.skip}</p>
                </div>
              )}

              {/* Do This */}
              {topic.guide.doThis && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Action Step
                  </span>
                  <p className="text-xs text-slate-300 font-medium">{topic.guide.doThis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
