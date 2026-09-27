'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Compass,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldAlert,
  Loader2,
  RefreshCw,
  FolderKanban,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { WorkspaceDTO, AIProvider } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calibration Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStage, setWizardStage] = useState<1 | 2 | 3>(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [telemetryText, setTelemetryText] = useState('Calibrating baseline experience...');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Computer Science',
    baselineKnowledge: '',
    targetGoal: '',
    preferredProvider: 'groq' as AIProvider,
  });

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await api.workspaces.getAll();
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Telemetry loading animation texts
  useEffect(() => {
    if (!isSynthesizing) return;
    const steps = [
      'Calibrating baseline experience & background...',
      'Curating foundational literature & search vault...',
      'Synthesizing Step 1 objective & evaluation threshold...',
      'Building JIT Learning Studio workspace...',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setTelemetryText(steps[index]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isSynthesizing]);

  const handleInitiateWorkspace = async () => {
    if (!formData.title.trim() || !formData.baselineKnowledge.trim() || !formData.targetGoal.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSynthesizing(true);
    try {
      const newWs = await api.workspaces.initiate({
        title: formData.title,
        category: formData.category,
        baselineKnowledge: formData.baselineKnowledge,
        targetGoal: formData.targetGoal,
        preferredProvider: formData.preferredProvider,
      });

      setIsWizardOpen(false);
      setIsSynthesizing(false);
      router.push(`/workspace/${newWs.id}`);
    } catch (err: any) {
      setIsSynthesizing(false);
      alert(`Initialization failed: ${err.message || err}`);
    }
  };

  const categories = [
    'Computer Science',
    'Distributed Systems',
    'Quantum Physics',
    'Artificial Intelligence',
    'Cyber Security',
    'FinTech & Blockchain',
    'Bioinformatics',
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 bg-cyber-grid p-4 sm:p-8">
      {/* HUD Navigation Banner */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2436] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black tracking-tighter text-xl shadow-lg shadow-cyan-500/20">
              SP
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                SKILLPRAX OS
              </h1>
              <p className="text-xs text-slate-400">
                Adaptive Mastery Engine & Dynamic Gatekeeper
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-[#12151F] border border-[#1E2436] hover:border-purple-500/50 text-xs font-medium text-slate-300 hover:text-purple-300 transition flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Admin Command Center</span>
          </Link>

          <button
            onClick={() => {
              setWizardStage(1);
              setIsWizardOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Skill Track</span>
          </button>
        </div>
      </div>

      {/* Main Content Hub */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-200">Active Skill Tracks & Workspaces</h2>
          </div>
          <button
            onClick={fetchWorkspaces}
            className="text-xs text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs font-mono">Loading active mastery workspaces...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              <div>
                <p className="font-semibold">Backend Error</p>
                <p className="text-xs text-slate-400">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchWorkspaces}
              className="px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-800 text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-6 rounded-3xl bg-[#12151F] border border-[#1E2436] text-center max-w-xl mx-auto space-y-4 cyber-glow-cyan"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">No Skill Tracks Created Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Calibrate your baseline experience and target build goals to generate a JIT adaptive learning track.
              </p>
            </div>
            <button
              onClick={() => {
                setWizardStage(1);
                setIsWizardOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Your First Skill Track
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => {
              const isMastered = ws.status === 'MASTERED';
              return (
                <motion.div
                  key={ws.id}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] hover:border-cyan-500/50 transition flex flex-col justify-between space-y-4 group cyber-glow-cyan"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#090A0F] border border-[#1E2436] text-[11px] font-mono text-cyan-400">
                        {ws.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                          isMastered
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        }`}
                      >
                        {isMastered ? 'MASTERED' : `STEP ${ws.currentStepIndex}/${ws.estimatedTotalSteps}`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                      {ws.title}
                    </h3>
                    
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      <span className="text-slate-300 font-medium">Goal: </span>
                      {ws.targetGoal}
                    </p>
                  </div>

                  {/* Progress Bar & Footer */}
                  <div className="pt-4 border-t border-[#1E2436]/60 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                        <span className="text-slate-400">Mastery Progress</span>
                        <span className="text-cyan-400 font-bold">{ws.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] border border-[#1E2436] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${ws.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Engine: {ws.aiProvider?.toUpperCase()}
                      </span>

                      <Link
                        href={`/workspace/${ws.id}`}
                        className="px-4 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <span>Launch Studio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3-STAGE CALIBRATION WIZARD MODAL */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-[#12151F] border border-[#1E2436] p-6 sm:p-8 space-y-6 cyber-glow-cyan relative overflow-hidden"
            >
              {/* Telemetry Loader Overlay during LLM synthesis */}
              {isSynthesizing ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">AI Curriculum Synthesis</h3>
                    <p className="text-xs font-mono text-cyan-400 mt-2 animate-pulse">
                      {telemetryText}
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
                        {wizardStage === 1 && 'Domain & Track Definition'}
                        {wizardStage === 2 && 'Baseline & Target Goal Assessment'}
                        {wizardStage === 3 && 'AI Multi-LLM Engine Selection'}
                      </h2>
                    </div>

                    <button
                      onClick={() => setIsWizardOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* Stage 1 */}
                  {wizardStage === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Skill Track Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Distributed Systems Architecture & Consensus"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          Domain Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                formData.category === cat
                                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                                  : 'bg-[#090A0F] border-[#1E2436] text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => {
                            if (!formData.title.trim()) {
                              alert('Please enter a skill track title.');
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
                    <div className="space-y-4">
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
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-3">
                          Select AI Engine for Curriculum Synthesis & Evaluation
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'groq', name: 'Groq Llama 3.3', desc: 'Ultra-fast inference speed' },
                            { id: 'openai', name: 'OpenAI GPT-4o', desc: 'High accuracy & reasoning' },
                            { id: 'anthropic', name: 'Anthropic Claude 3.5', desc: 'Deep pedagogical structure' },
                            { id: 'gemini', name: 'Google Gemini Pro', desc: 'Broad technical knowledge' },
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
                          onClick={handleInitiateWorkspace}
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
        )}
      </AnimatePresence>
    </div>
  );
}
