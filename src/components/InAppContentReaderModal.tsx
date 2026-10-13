'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Languages,
  Sparkles,
  FileText,
  RotateCw,
  ChevronDown,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ListTree,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SupportedLanguage } from '@/types';

export interface TopicChapterItem {
  key: string;
  order?: number;
  title: string;
  covers?: string;
  minutes?: number;
  chapterMarkdown?: string | null;
}

export interface InAppContentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentId?: string;
  sourceUrl?: string;
  sourceBadge?: string;
  sourceType?: string;
  corePrinciple?: string;
  mechanics?: string[];
  commonTraps?: string[];
  takeaway?: string;
  fullContentMarkdown?: string;
  documentationQuadrants?: any;
  documentationMarkdown?: string;
  documentationSourceUrl?: string;
  contentId?: string;
  defaultLanguage?: SupportedLanguage;
  focusNote?: string;
  initialTopicKey?: string;
  topicMap?: TopicChapterItem[];
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English (Default)', native: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi (मराठी)', native: 'मराठी' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil (தமிழ்)', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu (తెలుగు)', native: 'తెలుగు' },
  { code: 'fr', label: 'French (Français)', native: 'Français' },
  { code: 'es', label: 'Spanish (Español)', native: 'Español' },
  { code: 'de', label: 'German (Deutsch)', native: 'Deutsch' },
];

const DEFAULT_UI_LABELS: Record<string, string> = {
  summaryCards: 'Summary Cards',
  fullGuide: 'Full Guide',
  toc: 'Table of Contents',
  verifiedSource: 'Verified Reference Link',
  readWholeGuide: 'Read the whole guide',
  gamePlan: 'Milestone Game Plan',
  gotIt: 'Got it — show me the chapters',
  howToStudy: 'How to study this milestone',
  mistakesToAvoid: 'Mistakes to avoid',
  selfCheck: 'Ungraded Self-Check',
  revealHint: 'Reveal Hint',
  linkBrokenReplace: 'Link broken? Replace',
  findLinkForTopic: 'Find a link for this topic',
  verifiedBadge: 'Verified',
  readGamePlanFirst: 'Read the game plan first',
  focusForResource: 'Focus for this resource',
  generateQuiz: 'Generate Socratic Evaluation',
};

export const InAppContentReaderModal: React.FC<InAppContentReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  documentId,
  sourceUrl = '#',
  sourceBadge = 'Verified Pedagogy',
  sourceType = 'TAVILY',
  corePrinciple,
  mechanics,
  commonTraps,
  takeaway,
  fullContentMarkdown,
  documentationQuadrants,
  documentationMarkdown,
  documentationSourceUrl,
  contentId,
  defaultLanguage = 'en',
  focusNote,
  initialTopicKey,
  topicMap = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [readerView, setReaderView] = useState<'summary' | 'full'>('full');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);
  const [activeTopicList, setActiveTopicList] = useState<TopicChapterItem[]>(topicMap);
  const [uiLabels, setUiLabels] = useState<Record<string, string>>(DEFAULT_UI_LABELS);

  // Dynamic fetched doc state
  const [activeDocMarkdown, setActiveDocMarkdown] = useState<string>('');
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>(documentationSourceUrl || sourceUrl || '#');
  const [activeSourceType, setActiveSourceType] = useState<string>(sourceType);

  // Content states for translated/active quadrants
  const [displayPrinciple, setDisplayPrinciple] = useState<string>('');
  const [displayMechanics, setDisplayMechanics] = useState<string[]>([]);
  const [displayTraps, setDisplayTraps] = useState<string[]>([]);
  const [displayMarkdown, setDisplayMarkdown] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize content on open or prop changes
  useEffect(() => {
    if (!isOpen) return;

    const savedLang = (localStorage.getItem('skillprax_preferred_lang') as SupportedLanguage) || defaultLanguage;
    setSelectedLanguage(savedLang);

    const qObj = (documentationQuadrants && typeof documentationQuadrants === 'object') ? documentationQuadrants : {};
    const initPrinciple =
      qObj.principle ||
      qObj.q1?.content ||
      qObj.corePrinciple ||
      corePrinciple ||
      takeaway ||
      `Mastering ${title} requires an in-depth understanding of its core mechanics, structural foundation, and operational execution.`;

    const initMechanics: string[] =
      (Array.isArray(qObj.mechanics) && qObj.mechanics.length > 0)
        ? qObj.mechanics
        : (Array.isArray(qObj.q2?.bullets) && qObj.q2.bullets.length > 0)
        ? qObj.q2.bullets
        : (mechanics && mechanics.length > 0)
        ? mechanics
        : [];

    const initTraps: string[] =
      (Array.isArray(qObj.traps) && qObj.traps.length > 0)
        ? qObj.traps
        : (Array.isArray(qObj.q3?.bullets) && qObj.q3.bullets.length > 0)
        ? qObj.q3.bullets
        : (commonTraps && commonTraps.length > 0)
        ? commonTraps
        : [];

    const initMd =
      documentationMarkdown ||
      fullContentMarkdown ||
      `# ${title}\n\n## Technical Foundations\n\n${initPrinciple}\n\n## Practical Execution\n\n${initMechanics.map((m, i) => `${i + 1}. ${m}`).join('\n\n')}\n\n## Traps & Misconceptions\n\n${initTraps.map((t) => `- ${t}`).join('\n\n')}`;

    setDisplayPrinciple(initPrinciple);
    setDisplayMechanics(initMechanics);
    setDisplayTraps(initTraps);
    setDisplayMarkdown(initMd);
    setActiveDocMarkdown(initMd);
    setActiveTopicList(topicMap);
    setActiveSourceUrl(documentationSourceUrl || sourceUrl || '#');
    setActiveSourceType(sourceType);

    // If documentId provided, fetch fresh doc from API
    if (documentId) {
      fetch(`/api/content/${documentId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((doc) => {
          if (doc) {
            if (doc.sourceUrl) setActiveSourceUrl(doc.sourceUrl);
            if (doc.sourceType) setActiveSourceType(doc.sourceType);
            if (doc.markdown) {
              setDisplayMarkdown(doc.markdown);
              setActiveDocMarkdown(doc.markdown);
            }
            if (doc.quadrants) {
              if (doc.quadrants.principle) setDisplayPrinciple(doc.quadrants.principle);
              if (Array.isArray(doc.quadrants.mechanics)) setDisplayMechanics(doc.quadrants.mechanics);
              if (Array.isArray(doc.quadrants.traps)) setDisplayTraps(doc.quadrants.traps);
            }
            if (Array.isArray(doc.topicMap) && doc.topicMap.length > 0) {
              setActiveTopicList(doc.topicMap);
            }
          }
        })
        .catch(() => {});
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Auto-scroll to initial topic if specified
    if (initialTopicKey) {
      setTimeout(() => {
        const el = document.getElementById(`chapter-${initialTopicKey}`);
        if (el && scrollContainerRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, documentId, initialTopicKey, title]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalScroll = target.scrollHeight - target.clientHeight;
    if (totalScroll > 0) {
      const current = Math.min(100, Math.max(0, (target.scrollTop / totalScroll) * 100));
      setScrollProgress(current);
    }
  };

  const handleLanguageSelect = async (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    setShowLanguageDropdown(false);
    localStorage.setItem('skillprax_preferred_lang', lang);
    setTranslationError(null);

    if (lang === 'en') {
      setDisplayMarkdown(activeDocMarkdown);
      setUiLabels(DEFAULT_UI_LABELS);
      return;
    }

    setIsTranslating(true);
    try {
      if (documentId) {
        const res = await fetch(`/api/content/${documentId}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ languageCode: lang }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.markdown) setDisplayMarkdown(data.markdown);
          if (data.quadrants) {
            if (data.quadrants.principle) setDisplayPrinciple(data.quadrants.principle);
            if (Array.isArray(data.quadrants.mechanics)) setDisplayMechanics(data.quadrants.mechanics);
            if (Array.isArray(data.quadrants.traps)) setDisplayTraps(data.quadrants.traps);
          }
          if (Array.isArray(data.topicMap)) setActiveTopicList(data.topicMap);
          if (data.uiStrings) setUiLabels({ ...DEFAULT_UI_LABELS, ...data.uiStrings });
        } else {
          setTranslationError('Translation service unavailable. Preserving English guide.');
        }
      } else {
        // Fallback translation endpoint
        const payload = {
          contentId: contentId || `doc-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          targetLanguage: lang,
          quadrants: {
            principle: displayPrinciple,
            mechanics: displayMechanics,
            traps: displayTraps,
          },
          fullContentMarkdown: activeDocMarkdown,
        };

        const res = await fetch('/api/content/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translatedMarkdown) setDisplayMarkdown(data.translatedMarkdown);
          if (data.translatedQuadrants) {
            if (data.translatedQuadrants.principle) setDisplayPrinciple(data.translatedQuadrants.principle);
            if (Array.isArray(data.translatedQuadrants.mechanics)) setDisplayMechanics(data.translatedQuadrants.mechanics);
            if (Array.isArray(data.translatedQuadrants.traps)) setDisplayTraps(data.translatedQuadrants.traps);
          }
        }
      }
    } catch (err) {
      setTranslationError('Translation failed. Showing original English guide.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeText(codeText);
    setTimeout(() => setCopiedCodeText(null), 2000);
  };

  const scrollToChapter = (topicKey: string) => {
    const el = document.getElementById(`chapter-${topicKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-0 sm:p-4"
        >
          {/* Backdrop click to dismiss */}
          <div onClick={onClose} className="absolute inset-0 cursor-pointer" />

          {/* Full-Height Modal Container (h-dvh) */}
          <div className="relative z-10 w-full max-w-6xl h-dvh sm:h-[92vh] bg-white sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col">
            {/* Top Reading Progress Bar */}
            <div className="w-full h-1 bg-slate-100 shrink-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-150"
                style={{ width: `${readerView === 'full' ? scrollProgress : 100}%` }}
              />
            </div>

            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-50/95 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                      {sourceBadge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                      Pedagogical Reader
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-heading font-extrabold text-slate-900 truncate mt-0.5">
                    {title}
                  </h3>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Segmented Control [ Summary Cards | Full Guide ] */}
                <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setReaderView('summary')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      readerView === 'summary'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {uiLabels.summaryCards || 'Summary Cards'}
                  </button>
                  <button
                    onClick={() => setReaderView('full')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      readerView === 'full'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {uiLabels.fullGuide || 'Full Guide'}
                  </button>
                </div>

                {/* Language Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown((p) => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer bg-white"
                  >
                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">
                      {LANGUAGES.find((l) => l.code === selectedLanguage)?.native || 'English'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showLanguageDropdown && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl py-1 z-30 animate-fade-in">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                            selectedLanguage === lang.code ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {selectedLanguage === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Source Link */}
                {activeSourceUrl && activeSourceUrl !== '#' && (
                  <button
                    onClick={() => window.open(activeSourceUrl, '_blank', 'noopener,noreferrer')}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white"
                    title="Open external documentation source"
                  >
                    <span>{uiLabels.verifiedSource || 'Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resource Focus Strip */}
            {focusNote && (
              <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950 shrink-0">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-800 shrink-0">
                  {uiLabels.focusForResource || 'Focus for this resource'}:
                </span>
                <span className="font-medium truncate">{focusNote}</span>
              </div>
            )}

            {/* Translation Loading Bar */}
            {isTranslating && (
              <div className="px-5 py-2 bg-sky-50 border-b border-sky-100 flex items-center justify-center gap-2 text-xs font-semibold text-sky-800 animate-pulse shrink-0">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Translating pedagogical text into {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}...</span>
              </div>
            )}

            {/* Translation Error Notice */}
            {translationError && (
              <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-xs text-amber-800 shrink-0">
                <span>{translationError}</span>
                <button onClick={() => setTranslationError(null)} className="font-bold underline cursor-pointer">
                  Dismiss
                </button>
              </div>
            )}

            {/* Body Layout: Sidebar TOC (for Full Guide on desktop) + Scrollable Content */}
            <div className="flex-1 min-h-0 flex overflow-hidden">
              {/* Optional Chapter Sidebar (when in Full Guide view and topics exist) */}
              {readerView === 'full' && activeTopicList.length > 0 && (
                <aside className="hidden lg:flex w-64 border-r border-slate-200/80 bg-slate-50/60 flex-col shrink-0 overflow-y-auto p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
                    <ListTree className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{uiLabels.toc || 'Chapters'}</span>
                  </div>
                  <nav className="space-y-1">
                    {activeTopicList.map((t, idx) => (
                      <button
                        key={t.key}
                        onClick={() => scrollToChapter(t.key)}
                        className="w-full text-left p-2 rounded-xl text-xs hover:bg-white hover:text-emerald-800 hover:shadow-xs transition-all text-slate-700 flex items-start gap-2 cursor-pointer group"
                      >
                        <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-[11px] leading-tight">{t.title}</p>
                          {t.minutes && (
                            <span className="text-[10px] text-slate-400 font-normal">{t.minutes} min</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </nav>
                </aside>
              )}

              {/* Scrollable Main Area */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
              >
                {readerView === 'summary' ? (
                  /* 4-QUADRANT SUMMARY CARDS VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {/* Quadrant 1: Core Principle in 60 Seconds */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Zap className="w-4 h-4 fill-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          60-Second Principle
                        </h4>
                      </div>
                      <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                        {displayPrinciple}
                      </p>
                    </div>

                    {/* Quadrant 2: Key Mechanics & Step-by-Step Execution */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50/70 to-blue-50/40 border border-cyan-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-cyan-900">
                        <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          Key Mechanics & Execution
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                        {displayMechanics.map((mech, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-2" />
                            <span className="leading-relaxed">{mech}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quadrant 3: Common Traps & Edge Cases */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          Traps & Edge Cases
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                        {displayTraps.map((trap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                            <span className="leading-relaxed">{trap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quadrant 4: Verified Canonical Reference */}
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider">
                            {uiLabels.verifiedSource || 'Verified Reference Link'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          Curated curriculum synthesis. Read full deep-dive chapters with fenced code blocks and technical examples.
                        </p>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium truncate">{title}</span>
                        </div>
                        <button
                          onClick={() => setReaderView('full')}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-lg cursor-pointer transition-colors shrink-0"
                        >
                          {uiLabels.fullGuide || 'Full Guide'} ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FULL EXTRACTED/WRITTEN GUIDE VIEW (Markdown + Chapters) */
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Chapter anchors mapped if present */}
                    {activeTopicList.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 lg:hidden space-y-2">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <ListTree className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Jump to Chapter:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTopicList.map((t, i) => (
                            <button
                              key={t.key}
                              onClick={() => scrollToChapter(t.key)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-semibold cursor-pointer transition-all"
                            >
                              {i + 1}. {t.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wikipedia Attribution if applicable */}
                    {activeSourceType === 'WIKIPEDIA' && (
                      <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/70 text-xs text-sky-900 flex items-center justify-between gap-3">
                        <span>Text adapted from Wikipedia under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0).</span>
                        {activeSourceUrl && activeSourceUrl !== '#' && (
                          <a
                            href={activeSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold underline flex items-center gap-1 shrink-0"
                          >
                            <span>Wikipedia Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* React Markdown Renderer */}
                    <div className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:text-emerald-950 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-base prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-code:font-mono prose-code:text-emerald-800 prose-code:bg-emerald-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2({ node, children, ...props }) {
                            // Match topic key if children matches topic title
                            const text = String(children);
                            const matchedTopic = activeTopicList.find((t) =>
                              text.toLowerCase().includes(t.title.toLowerCase())
                            );
                            const anchorId = matchedTopic ? `chapter-${matchedTopic.key}` : undefined;
                            return (
                              <h2 id={anchorId} className="scroll-mt-6" {...props}>
                                {children}
                              </h2>
                            );
                          },
                          code({ node, className, children, ...props }) {
                            const codeString = String(children).replace(/\n$/, '');
                            const isBlock = /language-/.test(className || '') || codeString.includes('\n');
                            if (isBlock) {
                              const lang = (className || '').replace('language-', '') || 'code';
                              return (
                                <div className="my-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md not-prose">
                                  <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                                    <span className="uppercase text-[10px] font-bold text-emerald-400">{lang}</span>
                                    <button
                                      onClick={() => handleCopyCode(codeString)}
                                      className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {copiedCodeText === codeString ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-emerald-400 font-semibold">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                                    <code>{codeString}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote({ node, children, ...props }) {
                            return (
                              <blockquote
                                className="my-3 p-4 rounded-xl bg-emerald-50/70 border-l-4 border-emerald-500 text-xs md:text-sm text-emerald-950 not-italic font-medium"
                                {...props}
                              >
                                {children}
                              </blockquote>
                            );
                          },
                        }}
                      >
                        {displayMarkdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Language: <strong>{LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</strong>
                </span>
                {readerView === 'summary' && (
                  <button
                    onClick={() => setReaderView('full')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    {uiLabels.readWholeGuide || 'Read the whole guide'} ➔
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Return to Studio</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default InAppContentReaderModal;
