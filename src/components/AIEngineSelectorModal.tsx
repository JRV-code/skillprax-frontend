import React, { useState } from 'react';
import { Cpu, X, Zap, Check, Sparkles, Server, Gauge } from 'lucide-react';

export type AIEngine = 'groq-llama-3.3-70b' | 'llama-3.1-8b' | 'mixtral-8x7b' | 'gemini-1.5-pro';

interface AIEngineSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEngine?: AIEngine;
  onSelectEngine?: (engine: AIEngine) => void;
}

interface EngineOption {
  id: AIEngine;
  name: string;
  provider: string;
  latency: string;
  contextWindow: string;
  description: string;
  tag: string;
  color: string;
}

const ENGINE_OPTIONS: EngineOption[] = [
  {
    id: 'groq-llama-3.3-70b',
    name: 'Groq LLaMA 3.3 70B',
    provider: 'Groq LPU Inference',
    latency: '~240 t/s (Ultra Fast)',
    contextWindow: '128k Tokens',
    description: 'Default production model optimized for zero-latency Socratic question generation and instant diagnostic feedback.',
    tag: 'DEFAULT & RECOMMENDED',
    color: 'emerald',
  },
  {
    id: 'llama-3.1-8b',
    name: 'Meta LLaMA 3.1 8B',
    provider: 'Edge Accelerated',
    latency: '~520 t/s (Extreme)',
    contextWindow: '128k Tokens',
    description: 'Lightweight high-throughput engine for instantaneous micro-assessments and rapid drill loops.',
    tag: 'FAST DRILLS',
    color: 'sky',
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mistral Mixtral 8x7B',
    provider: 'MoE Architecture',
    latency: '~180 t/s (Deep Rigor)',
    contextWindow: '32k Tokens',
    description: 'Sparse Mixture of Experts specialized in multi-step chemical synthesis, biomechanics, and complex proofs.',
    tag: 'DEEP SYNTHESIS',
    color: 'amber',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Multimodal Frontier',
    latency: '~110 t/s (Reasoning)',
    contextWindow: '2M Tokens',
    description: 'Long-context multimodal model for synthesizing academic curriculum textbooks and research papers.',
    tag: 'LONG CONTEXT',
    color: 'indigo',
  },
];

export const AIEngineSelectorModal: React.FC<AIEngineSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedEngine = 'groq-llama-3.3-70b',
  onSelectEngine,
}) => {
  const [tempSelected, setTempSelected] = useState<AIEngine>(selectedEngine);
  const [engineReders, setEngineReders] = useState(true);

  if (!isOpen) return null;

  const handleApply = () => {
    if (onSelectEngine) onSelectEngine(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md view-transition-enter overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-200/90 ring-1 ring-black/5 my-6 max-h-[92vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shadow-xs">
            <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Inference AI Engine Selector
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                PRO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the intelligence model that synthesizes curriculum roadmaps & Socratic evaluations
            </p>
          </div>
        </div>

        {/* Engine Selection Options */}
        <div className="space-y-3">
          {ENGINE_OPTIONS.map((opt) => {
            const isSelected = tempSelected === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setTempSelected(opt.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none relative ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-heading font-bold text-slate-900">
                        {opt.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {opt.tag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {opt.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Gauge className="w-3.5 h-3.5" />
                        {opt.latency}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        {opt.contextWindow}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5 transition-transform ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-xs'
                        : 'bg-slate-100 text-transparent border-slate-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Engine Reders Toggle */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-800">
              Engine Socratic Reders & Real-Time Grounding
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEngineReders(!engineReders)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              engineReders ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                engineReders ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Modal Actions */}
        <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center gap-2"
          >
            <span>Apply Selected Engine</span>
            <Zap className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIEngineSelectorModal;
