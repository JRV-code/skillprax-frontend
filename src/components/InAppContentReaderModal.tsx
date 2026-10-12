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
  Layers,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportedLanguage } from '@/types';

export interface InAppContentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceUrl?: string;
  sourceBadge?: string;
  corePrinciple?: string;
  mechanics?: string[];
  commonTraps?: string[];
  takeaway?: string;
  fullContentMarkdown?: string;
  contentId?: string;
  defaultLanguage?: SupportedLanguage;
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

export const InAppContentReaderModal: React.FC<InAppContentReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  sourceUrl = '#',
  sourceBadge = 'Verified Pedagogy',
  corePrinciple,
  mechanics,
  commonTraps,
  takeaway,
  fullContentMarkdown,
  contentId,
  defaultLanguage = 'en',
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [readerView, setReaderView] = useState<'summary' | 'full'>('summary');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Content states
  const [translatedPrinciple, setTranslatedPrinciple] = useState<string>('');
  const [translatedMechanics, setTranslatedMechanics] = useState<string[]>([]);
  const [translatedTraps, setTranslatedTraps] = useState<string[]>([]);
  const [translatedMarkdown, setTranslatedMarkdown] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pedagogical document grounding
  const rawPrinciple =
    corePrinciple ||
    takeaway ||
    `Mastering ${title} requires an in-depth understanding of its core mechanics, structural foundation, and operational execution.`;
  const rawMechanics =
    mechanics && mechanics.length > 0
      ? mechanics
      : [
          'Verify foundational conditions and calibrate initial technique parameters.',
          'Execute the primary movement or syntactical sequence with controlled rhythm.',
          'Measure performance metrics against verified benchmark criteria.',
        ];
  const rawTraps =
    commonTraps && commonTraps.length > 0
      ? commonTraps
      : [
          'Premature acceleration before establishing stable mechanics.',
          'Ignoring diagnostic checkpoints and feedback indicators.',
          'Failing to isolate and correct minor form or execution errors early.',
        ];

  // Dynamic pedagogical documentation matching the 4 sections
  const rawMarkdown =
    fullContentMarkdown ||
    `# ${title}

## 1. Core Mechanics & Theoretical Foundation
${rawPrinciple}

Structured deliberate practice requires solidifying the biomechanical or conceptual baseline before progressing to high-intensity or edge-case execution.

---

## 2. Step-by-Step Technical Execution
${rawMechanics.map((m, i) => `${i + 1}. **Phase ${i + 1}**: ${m}`).join('\n')}

---

## 3. Common Errors, Diagnostic Checkpoints & Traps
${rawTraps.map((t, i) => `* **Diagnostic Checkpoint ${i + 1}**: ${t}`).join('\n')}

---

## 4. Benchmark Verification Protocols
${takeaway || rawPrinciple}

* **Self-Audit**: Verify consistency across multiple repetitions under steady conditions.
* **Milestone Readiness**: Achieve 70%+ on the end-of-step Socratic evaluation gate.
`;

  useEffect(() => {
    setMounted(true);

    const savedLang = localStorage.getItem('skillprax_preferred_lang') as SupportedLanguage | null;
    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
      setSelectedLanguage(savedLang);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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

    if (lang === 'en') {
      setTranslatedPrinciple('');
      setTranslatedMechanics([]);
      setTranslatedTraps([]);
      setTranslatedMarkdown('');
      return;
    }

    setIsTranslating(true);
    try {
      const activeContentId = contentId || `doc-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const payload = {
        contentId: activeContentId,
        targetLanguage: lang,
        quadrants: {
          corePrinciple: rawPrinciple,
          mechanics: rawMechanics,
          commonTraps: rawTraps,
          takeaway: takeaway || rawPrinciple,
        },
        fullContentMarkdown: rawMarkdown,
      };

      const res = await fetch('/api/content/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedQuadrants) {
          if (data.translatedQuadrants.corePrinciple) setTranslatedPrinciple(data.translatedQuadrants.corePrinciple);
          if (Array.isArray(data.translatedQuadrants.mechanics)) setTranslatedMechanics(data.translatedQuadrants.mechanics);
          if (Array.isArray(data.translatedQuadrants.commonTraps)) setTranslatedTraps(data.translatedQuadrants.commonTraps);
        }
        if (data.translatedMarkdown) {
          setTranslatedMarkdown(data.translatedMarkdown);
        }
      }
    } catch (err) {
      console.warn('Pedagogical translation failed; preserving default:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (!mounted) return null;

  const displayPrinciple = translatedPrinciple || rawPrinciple;
  const displayMechanics = translatedMechanics.length > 0 ? translatedMechanics : rawMechanics;
  const displayTraps = translatedTraps.length > 0 ? translatedTraps : rawTraps;
  const displayMarkdown = translatedMarkdown || rawMarkdown;

  // Simple Markdown Renderer with Code Blocks
  const renderMarkdownBlocks = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';
    let blockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim() || 'typescript';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const currentCode = codeBuffer.join('\n');
          const currentIndex = blockIndex++;
          elements.push(
            <div key={`code-${i}`} className="my-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="uppercase text-[10px] font-bold text-sky-400">{codeLang}</span>
                <button
                  onClick={() => handleCopyCode(currentCode, currentIndex)}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCodeIndex === currentIndex ? (
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
                <code>{currentCode}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl md:text-2xl font-black text-slate-900 mt-6 mb-3 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-base md:text-lg font-bold text-slate-900 mt-5 mb-2 text-sky-800 flex items-center gap-2">
            <span>{line.replace('## ', '')}</span>
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-800 mt-4 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <div key={`quote-${i}`} className="my-3 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-xs text-amber-900 leading-relaxed font-medium">
            {line.replace('> ', '')}
          </div>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        elements.push(
          <li key={`li-${i}`} className="ml-5 list-disc text-xs md:text-sm text-slate-700 leading-relaxed my-1">
            {line.replace(/^(\*|-)\s+/, '')}
          </li>
        );
      } else if (line.trim().length === 0) {
        elements.push(<div key={`sp-${i}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="text-xs md:text-sm text-slate-700 leading-relaxed my-2 font-normal">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          {/* Backdrop dismiss */}
          <div
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          <div
            className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Scroll Progress Bar pinned to top */}
            <div className="w-full h-1 bg-slate-100 shrink-0">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 transition-all duration-150"
                style={{ width: `${readerView === 'full' ? scrollProgress : 100}%` }}
              />
            </div>

            {/* Top Modal Header */}
            <div className="px-6 py-4 bg-slate-50/95 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shadow-xs shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/60 px-2 py-0.5 rounded-md">
                      {sourceBadge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                      Pedagogical Reader
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-heading font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                    {title}
                  </h3>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {/* Segmented Control [ Summary Cards | Full Extracted Document ] */}
                <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setReaderView('summary')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      readerView === 'summary'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Summary Cards
                  </button>
                  <button
                    onClick={() => setReaderView('full')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      readerView === 'full'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Document
                  </button>
                </div>

                {/* Interactive Dynamic Translation Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer bg-white"
                  >
                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{LANGUAGES.find((l) => l.code === selectedLanguage)?.native || 'Language'}</span>
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

                {/* Original Source Button */}
                {sourceUrl && sourceUrl !== '#' && (
                  <button
                    onClick={() => window.open(sourceUrl, '_blank', 'noopener,noreferrer')}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-white"
                    title="Open external documentation source"
                  >
                    <span>Original Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Top-right close icon (X) */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subtle Inner Loading Skeleton during Translation */}
            {isTranslating && (
              <div className="px-6 py-2.5 bg-gradient-to-r from-sky-50 to-emerald-50 border-b border-sky-100 flex items-center justify-center gap-2 text-xs font-semibold text-sky-800 animate-pulse shrink-0">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Translating pedagogical text into {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}...</span>
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-h-[75vh]"
            >
              {readerView === 'summary' ? (
                /* 4-QUADRANT SUMMARY CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {/* Quadrant 1: Core Principle in 60 Seconds */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50/70 to-blue-50/40 border border-sky-100/90 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-sky-700">
                      <Zap className="w-4 h-4 fill-sky-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Quadrant 1: Core Principle in 60 Seconds
                      </h4>
                    </div>
                    <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                      {displayPrinciple}
                    </p>
                  </div>

                  {/* Quadrant 2: Key Mechanics & Step-by-Step Execution */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/90 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Quadrant 2: Key Mechanics & Execution
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                      {displayMechanics.map((mech, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                          <span className="leading-relaxed">{mech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quadrant 3: Common Traps & Edge Cases */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-100/90 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Quadrant 3: Common Traps & Misconceptions
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

                  {/* Quadrant 4: Canonical Academic Reference */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          Quadrant 4: Verified Encyclopedic Reference
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Curated directly through verified pedagogical channels. Click the badge below to inspect full markdown source documentation.
                      </p>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-medium truncate max-w-[200px]">{title}</span>
                      </div>
                      {/* IN-APP VERIFIED BADGE WIRED TO TOGGLE FULL DOCUMENT VIEW */}
                      <button
                        onClick={() => setReaderView('full')}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Click to view full comprehensive document"
                      >
                        In-App Verified ➔
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* FULL EXTRACTED DOCUMENT VIEW */
                <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 animate-fade-in space-y-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span>FULL EXTRACTED DOCUMENT</span>
                    </span>
                    <span>Scroll Depth: {Math.round(scrollProgress)}%</span>
                  </div>

                  <div className="prose prose-slate max-w-none pt-2">
                    {renderMarkdownBlocks(displayMarkdown)}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Language: <strong>{LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</strong>
                </span>
                {readerView === 'summary' && (
                  <button
                    onClick={() => setReaderView('full')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-800 underline cursor-pointer"
                  >
                    Switch to Full Extracted Document ➔
                  </button>
                )}
              </div>

              {/* "Return to Studio" Button connected strictly to onClose() */}
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
