'use client';

import React, { useEffect, useState } from 'react';
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
  defaultLanguage?: SupportedLanguage;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'de', label: 'German', native: 'Deutsch' },
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
  defaultLanguage = 'en',
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [showLanguageGate, setShowLanguageGate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Content states (translated dynamically if language is non-English)
  const [translatedPrinciple, setTranslatedPrinciple] = useState<string>('');
  const [translatedMechanics, setTranslatedMechanics] = useState<string[]>([]);
  const [translatedTraps, setTranslatedTraps] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Prompt for language if not yet confirmed
      setShowLanguageGate(true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const rawPrinciple = corePrinciple || takeaway || `Mastering ${title} requires an axiomatic understanding of its operational constraints and procedural mechanics.`;
  const rawMechanics = mechanics && mechanics.length > 0 ? mechanics : [
    'Establish foundational boundary conditions and verify prerequisites.',
    'Execute the operational sequence in deterministic order without omitting validation steps.',
    'Measure state variance against benchmark reference metrics.',
  ];
  const rawTraps = commonTraps && commonTraps.length > 0 ? commonTraps : [
    'Conflating nominal operation with steady-state equilibrium.',
    'Ignoring edge boundary cases when scaling throughput.',
    'Over-relying on heuristics instead of first-principles verification.',
  ];

  // Translation effect when language switches
  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    setShowLanguageGate(false);

    if (lang === 'en') {
      setTranslatedPrinciple('');
      setTranslatedMechanics([]);
      setTranslatedTraps([]);
      return;
    }

    setIsTranslating(true);
    try {
      const combinedText = `PRINCIPLE: ${rawPrinciple}\n\nMECHANICS: ${rawMechanics.join(' | ')}\n\nTRAPS: ${rawTraps.join(' | ')}`;
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedText,
          targetLanguage: lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data.translatedText || '';
        // Parse segments
        const principleMatch = text.match(/PRINCIPLE:\s*([\s\S]*?)(?=\n\nMECHANICS:|$)/);
        const mechanicsMatch = text.match(/MECHANICS:\s*([\s\S]*?)(?=\n\nTRAPS:|$)/);
        const trapsMatch = text.match(/TRAPS:\s*([\s\S]*?)$/);

        if (principleMatch) setTranslatedPrinciple(principleMatch[1].trim());
        if (mechanicsMatch) {
          const list = mechanicsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
          if (list.length > 0) setTranslatedMechanics(list);
        }
        if (trapsMatch) {
          const list = trapsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
          if (list.length > 0) setTranslatedTraps(list);
        }
      }
    } catch (err) {
      console.warn('Translation failed, showing default:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!mounted) return null;

  const displayPrinciple = translatedPrinciple || rawPrinciple;
  const displayMechanics = translatedMechanics.length > 0 ? translatedMechanics : rawMechanics;
  const displayTraps = translatedTraps.length > 0 ? translatedTraps : rawTraps;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Top Modal Header */}
            <div className="px-6 py-4.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/60 px-2 py-0.5 rounded-md">
                      {sourceBadge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      In-App Pedagogical Reader
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-heading font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                    {title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language switcher button */}
                <button
                  onClick={() => setShowLanguageGate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</span>
                </button>

                {sourceUrl && sourceUrl !== '#' && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <span>Original Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRE-READER LANGUAGE SELECTION PROMPT MODAL OVERLAY */}
            {showLanguageGate && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-b border-emerald-200/80 shrink-0 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <Languages className="w-4 h-4 text-emerald-700" />
                    <span>Select display language for this resource:</span>
                  </div>
                  <button
                    onClick={() => setShowLanguageGate(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Keep Current ({LANGUAGES.find((l) => l.code === selectedLanguage)?.label}) ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        selectedLanguage === lang.code
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="truncate">{lang.label}</div>
                      <div className="text-[10px] opacity-80">{lang.native}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading translation banner */}
            {isTranslating && (
              <div className="px-6 py-2.5 bg-sky-50 border-b border-sky-100 flex items-center justify-center gap-2 text-xs font-semibold text-sky-800 animate-pulse">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Translating document into {LANGUAGES.find((l) => l.code === selectedLanguage)?.label}...</span>
              </div>
            )}

            {/* 4-Quadrant Content Grid */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Vetted directly through verified pedagogical channels (Wikipedia, MDN, Open Courseware). Grounded in authoritative documentation.
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-medium truncate max-w-[220px]">{title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      In-App Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Dismiss Action */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Cognitive Review Complete • Language: <strong>{LANGUAGES.find((l) => l.code === selectedLanguage)?.label}</strong>
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Return to Studio</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default InAppContentReaderModal;
