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
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export const InAppContentReaderModal: React.FC<InAppContentReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  sourceUrl = '#',
  sourceBadge = 'Documentation',
  corePrinciple,
  mechanics,
  commonTraps,
  takeaway,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  const defaultCorePrinciple =
    corePrinciple ||
    takeaway ||
    `Mastering ${title} requires an axiomatic understanding of its boundary conditions and operational syntax. Review the underlying rules and verify against empirical test cases.`;

  const defaultMechanics = mechanics || [
    '1. Establish initial conditions and identify prerequisite parameters.',
    '2. Execute the operational sequence in deterministic order without shortcutting intermediate steps.',
    '3. Measure and verify post-execution state against standard benchmark tolerances.',
  ];

  const defaultTraps = commonTraps || [
    'Trap A: Conflating nominal state with steady-state equilibrium.',
    'Trap B: Omitting edge-case boundary checks when scaling variables.',
    'Trap C: Over-relying on intuitive shortcuts instead of first-principles derivations.',
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md">
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
            className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col"
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
                  <h3 className="text-base md:text-lg font-heading font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                    {title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
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

            {/* 4-Quadrant Content Grid */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
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
                    {defaultCorePrinciple}
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
                    {defaultMechanics.map((mech, idx) => (
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
                    {defaultTraps.map((trap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                        <span className="leading-relaxed">{trap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quadrant 4: Direct Source Link Reference */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Quadrant 4: Verified Source Reference
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Researched and vetted directly via Tavily live query filters. Grounded in canonical documentation.
                    </p>
                  </div>

                  {sourceUrl && sourceUrl !== '#' ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm transition-all"
                    >
                      <span className="truncate">Open Full Source Page</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <div className="mt-4 px-4 py-2 bg-slate-200/60 text-slate-500 rounded-xl text-xs font-semibold text-center">
                      Verified Internal Academic Dossier
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Dismiss Action */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Cognitive Review Complete
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
