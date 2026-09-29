'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Zap, FlaskConical, Code, Trophy, 
  Target, Layers, ArrowRight, ShieldCheck, Check
} from 'lucide-react';
import { SkillTrack } from '@/types';

interface EnrollSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (newTrack: SkillTrack) => void;
}

const DOMAINS = [
  {
    id: 'Chemistry',
    title: 'Chemistry & Molecular Science',
    subtitle: 'NCERT Class 12, JEE Advanced, NEET Organic & Physical Mechanics',
    icon: FlaskConical,
    colorScheme: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    tags: ['Chemistry', 'NCERT', 'JEE Advanced', 'Mechanisms'],
    defaultSteps: [
      { step: 1, title: 'Classification & Nomenclature', status: 'active' },
      { step: 2, title: 'Methods of Preparation & Halogen Exchange', status: 'locked' },
      { step: 3, title: 'Nucleophilic Substitution Mechanics (SN1 vs SN2)', status: 'locked' },
      { step: 4, title: 'Ambident Nucleophiles & Saytzeff Elimination', status: 'locked' },
      { step: 5, title: 'Aromatic Wing & Haloarene Low Reactivity', status: 'locked' },
    ],
  },
  {
    id: 'Athletics',
    title: 'Athletics & Kinematic Acceleration',
    subtitle: 'Sprint mechanics, biomechanical force vectors & CNS pre-activation',
    icon: Zap,
    colorScheme: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['Athletics', 'Biomechanics', 'Kinematics', 'Sprint'],
    defaultSteps: [
      { step: 1, title: 'Sprint Mechanics & Block Clearance', status: 'active' },
      { step: 2, title: 'Max Velocity Phase & Pelvic Kinematics', status: 'locked' },
      { step: 3, title: 'Speed Endurance & Deceleration Buffer', status: 'locked' },
      { step: 4, title: 'Competition Cadence Optimization', status: 'locked' },
    ],
  },
  {
    id: 'Programming',
    title: 'Programming & Computer Science',
    subtitle: 'Graph theory, async event loops & high-throughput architecture',
    icon: Code,
    colorScheme: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    tags: ['Programming', 'Graph Theory', 'Algorithms', 'Mastery'],
    defaultSteps: [
      { step: 1, title: 'Asymptotic Analysis & Big-O Axioms', status: 'active' },
      { step: 2, title: 'Graph Traversal & Topological DAGs', status: 'locked' },
      { step: 3, title: 'Shortest Path & Network Flows', status: 'locked' },
      { step: 4, title: 'Dynamic Programming & Memoized Schemas', status: 'locked' },
    ],
  },
  {
    id: 'Custom',
    title: 'Custom Professional Curriculum',
    subtitle: 'Define your own autonomous domain, Socratic gates & milestones',
    icon: Target,
    colorScheme: 'emerald',
    gradient: 'from-teal-500 to-emerald-600',
    tags: ['Custom', 'Autonomous', 'Mastery'],
    defaultSteps: [
      { step: 1, title: 'Axiomatic Foundations & Core Models', status: 'active' },
      { step: 2, title: 'Procedural Execution & Applied Synthesis', status: 'locked' },
      { step: 3, title: 'Advanced Failure Gate & Edge Case Clearance', status: 'locked' },
    ],
  },
];

export const EnrollSkillModal: React.FC<EnrollSkillModalProps> = ({
  isOpen,
  onClose,
  onEnroll,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('Chemistry');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customTag, setCustomTag] = useState<string>('');
  const [targetGoal, setTargetGoal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentDomain = DOMAINS.find(d => d.id === selectedDomainId) || DOMAINS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const titleToUse = customTitle.trim() || currentDomain.title;
    const tagToUse = customTag.trim() ? customTag.trim() : currentDomain.tags[0];

    const newTrack: SkillTrack = {
      id: `track-${Date.now()}`,
      title: titleToUse,
      category: currentDomain.id as any,
      tags: [tagToUse, 'Autonomous', 'Socratic Gate'],
      currentStep: 1,
      totalSteps: currentDomain.defaultSteps.length,
      progressPercent: Math.round(100 / currentDomain.defaultSteps.length),
      colorScheme: currentDomain.colorScheme as any,
      icon: currentDomain.id === 'Athletics' ? 'Zap' : currentDomain.id === 'Chemistry' ? 'FlaskConical' : 'Code',
      milestones: currentDomain.defaultSteps.map(s => ({
        id: `m-${Date.now()}-${s.step}`,
        stepNumber: s.step,
        title: s.title,
        description: `Mastery gate for step ${s.step} in ${titleToUse}`,
        status: (s.status as any),
        acus: [`ACU-${s.step}01: Core Invariants`, `ACU-${s.step}02: Diagnostic Verification`],
      })),
    };

    setTimeout(() => {
      onEnroll(newTrack);
      setIsSubmitting(false);
      onClose();
    }, 400);
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
                  Enroll in New Skill Track
                </h3>
                <p className="text-xs text-slate-300">
                  Synthesize an autonomous roadmap node graph and Socratic milestone gates
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
            {/* Step 1: Select Domain */}
            <div className="space-y-3">
              <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>1. Select Knowledge Domain</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMAINS.map(dom => {
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
                            {dom.title}
                          </h4>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dom.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Title & Target Goal */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Skill or Topic Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder={currentDomain.title}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Sub-Tag
                  </label>
                  <input
                    type="text"
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    placeholder={currentDomain.tags[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Socratic Mastery Goal (Optional)
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={e => setTargetGoal(e.target.value)}
                  placeholder="e.g. Score 100% on JEE Advanced Socratic evaluation gates"
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
                className="px-6 py-2.5 rounded-xl text-xs font-heading font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95 btn-shimmer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <span>Enroll & Launch Workspace</span>
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
