'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Zap, FlaskConical, Code, Trophy, 
  Target, Layers, ArrowRight, ShieldCheck, Check,
  Atom, Activity, Palette, Home, Brain, Tag, Compass
} from 'lucide-react';
import { SkillTrack, DomainCategory } from '@/types';

export interface EnrollSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (newTrack: SkillTrack) => void;
  initialTitle?: string;
  initialDomain?: string;
  initialSubGenre?: string;
}

const DOMAINS: Array<{
  id: DomainCategory;
  label: string;
  icon: any;
  description: string;
  placeholder: string;
  gradient: string;
}> = [
  {
    id: 'Science',
    label: 'Science',
    icon: Atom,
    description: 'Physics, Chemistry, Molecular Biology, Advanced Calculus',
    placeholder: 'e.g., Rotational Dynamics, Quantum Mechanics, Organic Synthesis',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'Athletics',
    label: 'Athletics',
    icon: Activity,
    description: 'Sprint Bio-Kinetics, Explosive Strength Conditioning, Sports Science',
    placeholder: 'e.g., Sprint Acceleration Mechanics, Plyometric Power Development',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'Art',
    label: 'Art',
    icon: Palette,
    description: 'Digital Illustration, Design Systems, Animation, Color Theory',
    placeholder: 'e.g., Dynamic Figure Drawing, Vector Design Systems, 3D UV Mapping',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'Homemaking',
    label: 'Homemaking',
    icon: Home,
    description: 'Culinary Science, Nutrition Engineering, Spatial Organization, Budgeting',
    placeholder: 'e.g., Macronutrient Optimization, Culinary Thermodynamics',
    gradient: 'from-rose-500 to-amber-600',
  },
  {
    id: 'Cognitive Logic',
    label: 'Cognitive Logic',
    icon: Brain,
    description: 'Algorithms, Critical Reasoning, Mental Models, System Architecture',
    placeholder: 'e.g., Distributed System Consensus, Formal Propositional Logic',
    gradient: 'from-blue-500 to-indigo-600',
  },
];

const SUB_GENRES_MAP: Record<string, string[]> = {
  Science: ['Physical Kinetics', 'Organic Reaction Mechanisms', 'Thermodynamics', 'Quantum Foundations', 'Cellular Genetics'],
  Athletics: ['Goalkeeping & Reflexes', 'Striker Finishing', 'Sprint Acceleration & Biomechanics', 'Midfield Playmaking', 'Explosive Plyometrics'],
  Art: ['Dynamic Portrait Sketching', 'Oil Painting & Glazes', 'Human Anatomy & Gesture', 'Vector Design Systems', '3D Hard-Surface Modeling'],
  Homemaking: ['Culinary Thermodynamics', 'Macronutrient Engineering', 'Spatial Micro-Organization', 'Budgeting & Asset Balance'],
  'Cognitive Logic': ['Distributed Systems Consensus', 'Formal Propositional Logic', 'Graph Algorithms & Traversal', 'System Architecture & Concurrency'],
};

export const EnrollSkillModal: React.FC<EnrollSkillModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
  initialTitle = '',
  initialDomain = '',
  initialSubGenre = '',
}) => {
  const router = useRouter();
  const [selectedDomainId, setSelectedDomainId] = useState<DomainCategory>('Science');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [subGenre, setSubGenre] = useState<string>('');
  const [targetGoal, setTargetGoal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialDomain && DOMAINS.some(d => d.id === initialDomain)) {
      setSelectedDomainId(initialDomain as DomainCategory);
    }
    if (initialTitle) setCustomTitle(initialTitle);
    if (initialSubGenre) setSubGenre(initialSubGenre);
  }, [initialTitle, initialDomain, initialSubGenre, isOpen]);

  if (!isOpen) return null;

  const currentDomain = DOMAINS.find((d) => d.id === selectedDomainId) || DOMAINS[0];
  const suggestedPills = SUB_GENRES_MAP[selectedDomainId] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleToUse = customTitle.trim();
    if (!titleToUse) {
      setErrorMessage('Please enter a specific skill or topic title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const activeProfileId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: activeProfileId,
          title: titleToUse,
          domain: selectedDomainId,
          subGenre: subGenre.trim() || undefined,
          targetGoal: targetGoal.trim() || 'Full Mastery',
        }),
      });

      if (!res.ok) {
        throw new Error('Skill roadmap generation failed. Check server connection.');
      }

      const data = await res.json();
      const workspaceId = data.workspace?.id || data.id;

      if (onEnroll && data.workspace) {
        onEnroll(data.workspace);
      }

      onClose();
      router.push(`/workspace/${workspaceId}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Roadmap generation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-extrabold tracking-tight">
                  ⚡ Generate Mastery Track
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-300">
                    SKILL-TRACK Dynamic Pedagogy Engine
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    3–8 Milestones
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Select Domain */}
            <div className="space-y-3">
              <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>1. Select Core Human Domain</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMAINS.map((dom) => {
                  const IconComp = dom.icon;
                  const isSelected = selectedDomainId === dom.id;

                  return (
                    <div
                      key={dom.id}
                      onClick={() => setSelectedDomainId(dom.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${dom.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-heading font-bold text-slate-900 truncate">
                            {dom.label}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {dom.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Skill Title */}
            <div className="space-y-2">
              <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-sky-600" />
                <span>2. Target Skill / Discipline Title</span>
              </label>

              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={currentDomain.placeholder}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs md:text-sm font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Step 3: Sub-Genre Specialization & Interactive Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>3. Sub-Genre Specialization (Recommended)</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  Select a pill or enter custom
                </span>
              </div>

              {/* Interactive Pills */}
              <div className="flex flex-wrap gap-1.5">
                {suggestedPills.map((pill) => {
                  const isPillActive = subGenre === pill;
                  return (
                    <button
                      type="button"
                      key={pill}
                      onClick={() => setSubGenre(isPillActive ? '' : pill)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isPillActive
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={subGenre}
                onChange={(e) => setSubGenre(e.target.value)}
                placeholder="e.g., Striker Finishing, Memory Concurrency, Molecular Thermodynamics"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Step 4: Target Goal & Scope Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>4. Specific Mastery Objective (Optional)</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Roadmap Scope: 3–8 Milestones
                </span>
              </div>

              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g., Pass JEE Advanced Mechanics, Zero Allocations, Tournament Ready"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Dynamic AI Sizing Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <strong className="text-emerald-900 font-bold">Autonomous Scoping:</strong> Groq evaluates technical complexity and automatically synthesizes between 3 and 8 milestones with Assessable Competency Units and verified Tavily study assets.
              </p>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-heading font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Dynamic Roadmap (Groq)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Track & Launch Studio ➔</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnrollSkillModal;
