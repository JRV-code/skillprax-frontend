import Link from 'next/link';
import { Terminal, Shield, Zap, Cpu, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function Home() {
  const apiUrl = API_BASE_URL;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative p-6 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full z-10 space-y-8 text-center">
        {/* Header HUD Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-glow text-xs font-mono text-[#00F0FF] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Skillprax v1.0.0 — Phase 1 Scaffolding Ready</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
          SKILLPRAX <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FFB800] to-[#10B981]">
            AI LEARNING AGENT & SKILL OS
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          An active, closed-loop pedagogical engine paired with an immersive Sci-Fi RPG HUD.
          Powered by FSRS memory decay algorithms, sub-DAG remediation detours, and Sabotage Mode bug-hunts.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-panel p-5 rounded-xl text-left space-y-2 border border-slate-800 hover:border-[#00F0FF]/40 transition-all">
            <div className="flex items-center gap-2 text-[#00F0FF]">
              <Cpu className="w-5 h-5" />
              <h3 className="font-mono font-bold text-sm">Dynamic Skill Tree</h3>
            </div>
            <p className="text-xs text-slate-400">
              Directed Acyclic Graph (DAG) with FSRS memory stability & retrievability decay metrics.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl text-left space-y-2 border border-slate-800 hover:border-[#FFB800]/40 transition-all">
            <div className="flex items-center gap-2 text-[#FFB800]">
              <Zap className="w-5 h-5" />
              <h3 className="font-mono font-bold text-sm">Dual Intake Vectors</h3>
            </div>
            <p className="text-xs text-slate-400">
              Goal-First Backward Design & Real-World Artifact Deconstruction Lab.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl text-left space-y-2 border border-slate-800 hover:border-[#FF0055]/40 transition-all">
            <div className="flex items-center gap-2 text-[#FF0055]">
              <Shield className="w-5 h-5" />
              <h3 className="font-mono font-bold text-sm">Sabotage Mode</h3>
            </div>
            <p className="text-xs text-slate-400">
              Adversarial AI bug injection terminal & parameter perturbation assessments.
            </p>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Frontend Root: /skillprax-frontend</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Target API: {apiUrl}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
