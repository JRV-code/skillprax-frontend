'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Leaf, Calculator, TrendingUp, Palette, BookOpen, Activity, ArrowRight, Sparkles, X } from 'lucide-react';
import { AIProvider } from '@/lib/types';
import { DOMAIN_CATEGORIES } from '@/lib/domains';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Leaf,
  Cpu,
  Calculator,
  TrendingUp,
  Palette,
  BookOpen,
  Activity,
};

interface NewSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: string;
    baselineKnowledge: string;
    targetGoal: string;
    preferredProvider: AIProvider;
  }) => Promise<void>;
}

export const NewSkillModal: React.FC<NewSkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [wizardStage, setWizardStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: DOMAIN_CATEGORIES[0].name as string,
    baselineKnowledge: '',
    targetGoal: '',
    preferredProvider: 'groq' as AIProvider,
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] shadow-2xl text-slate-100 cyber-glow-cyan"
        >
          {isSubmitting ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">AI Curriculum Synthesis</h3>
                <p className="text-xs font-mono text-cyan-400 mt-2 animate-pulse">
                  Synthesizing mastery curriculum on {formData.preferredProvider.toUpperCase()} free tier...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Wizard Header */}
              <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                    Calibration Stage {wizardStage} of 3
                  </span>
                  <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                    {wizardStage === 1 && 'Domain & Specific Learning Focus'}
                    {wizardStage === 2 && 'Baseline & Target Goal Assessment'}
                    {wizardStage === 3 && 'AI Multi-LLM Engine Selection'}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1E2436]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stage 1 */}
              {wizardStage === 1 && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Specific Skill or Learning Topic
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Astrophysics Fundamentals, Blender 3D Modeling, Game Theory & Strategy"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                    />

                    {/* Auto-Suggestion Chips */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-mono text-slate-500 block mb-1.5">
                        Suggested Topics Across Domains:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { title: 'Quantum Mechanics Basics', category: 'Natural Sciences & Nature' },
                          { title: 'Blender 3D Asset Creation', category: 'Creative Arts, Design & Media' },
                          { title: 'Distributed Systems & Raft', category: 'Engineering & Applied Technology' },
                          { title: 'Behavioral Economics', category: 'Business, Finance & Economics' },
                          { title: 'Cognitive Neuroscience', category: 'Humanities, History & Philosophy' },
                        ].map((sugg) => (
                          <button
                            key={sugg.title}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                title: sugg.title,
                                category: sugg.category,
                              })
                            }
                            className="px-2.5 py-1 rounded-md text-[10px] bg-[#090A0F] border border-[#1E2436] text-cyan-400 hover:border-cyan-500/50 transition font-mono"
                          >
                            + {sugg.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Broad Knowledge Domain
                    </label>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                      {DOMAIN_CATEGORIES.map((dom) => {
                        const isSelected = formData.category === dom.name;
                        const IconComp = iconMap[dom.icon] || Cpu;
                        return (
                          <button
                            key={dom.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: dom.name })}
                            className={`w-full p-2.5 rounded-xl text-left border transition flex items-center gap-3 ${
                              isSelected
                                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 cyber-glow-cyan'
                                : 'bg-[#090A0F] border-[#1E2436] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#12151F] text-slate-400'}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-slate-200">{dom.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">{dom.examples}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => {
                        if (!formData.title.trim()) {
                          alert('Please enter a skill or technology title.');
                          return;
                        }
                        setWizardStage(2);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                    >
                      Next: Baseline & Goals <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 2 */}
              {wizardStage === 2 && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Baseline Knowledge (What do you already know?)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.baselineKnowledge}
                      onChange={(e) => setFormData({ ...formData, baselineKnowledge: e.target.value })}
                      placeholder="e.g. Undergraduate linear algebra, proficient in Python, no prior quantum physics background."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Goal (What do you want to build or achieve?)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.targetGoal}
                      onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                      placeholder="e.g. Write quantum simulation algorithms using Qiskit and simulate Shor's algorithm."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setWizardStage(1)}
                      className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => {
                        if (!formData.baselineKnowledge.trim() || !formData.targetGoal.trim()) {
                          alert('Please provide baseline experience and target goal.');
                          return;
                        }
                        setWizardStage(3);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                    >
                      Next: Select AI Engine <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Stage 3 */}
              {wizardStage === 3 && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-3">
                      Select AI Engine for Curriculum Synthesis & Evaluation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'groq', name: 'Groq + Tavily Research (Fast & Grounded)', desc: 'GPT-OSS 120B + Tavily Real-Time Web Discovery (Recommended)' },
                        { id: 'gemini', name: 'Google Gemini (Free)', desc: 'Gemini 3.7 Flash (Comprehensive Multimodal)' },
                        { id: 'openrouter', name: 'OpenRouter (Free)', desc: 'GPT-OSS 120B :free (Universal Backup)' },
                        { id: 'openai', name: 'OpenAI Platform', desc: 'GPT-4o (Flagship) | o3-mini (STEM & Logic)' },
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredProvider: prov.id as AIProvider })}
                          className={`p-3.5 rounded-xl border text-left transition ${
                            formData.preferredProvider === prov.id
                              ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 cyber-glow-cyan'
                              : 'bg-[#090A0F] border-[#1E2436] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-200">{prov.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{prov.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setWizardStage(2)}
                      className="px-4 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Back
                    </button>

                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      Synthesize Step 1 & Launch Track
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewSkillModal;
