'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Zap, FlaskConical, Code, Trophy, 
  Target, Layers, ArrowRight, ShieldCheck, Check,
  Atom, Activity, Palette, Home, Brain
} from 'lucide-react';
import { SkillTrack, DomainCategory } from '@/types';

interface EnrollSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (newTrack: SkillTrack) => void;
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

export const EnrollSkillModal: React.FC<EnrollSkillModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
}) => {
  const router = useRouter();
  const [selectedDomainId, setSelectedDomainId] = useState<DomainCategory>('Science');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [targetGoal, setTargetGoal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const currentDomain = DOMAINS.find((d) => d.id === selectedDomainId) || DOMAINS[0];

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
                <p className="text-xs text-slate-300">
                  Synthesize an organic Groq LLaMA roadmap across 5 core human domains
                </p>
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
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dom.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-heading font-bold text-slate-900 truncate">
                            {dom.label}
                          </h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dom.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Title & Target Goal */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Skill or Topic Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={currentDomain.placeholder}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Socratic Mastery Goal (Optional)
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Master kinematic impulse and acute vector force clearance"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-heading font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95 btn-shimmer uppercase"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Groq Roadmap...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Generate Mastery Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnrollSkillModal;

