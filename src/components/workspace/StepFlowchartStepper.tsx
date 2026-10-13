'use client';

import React from 'react';
import { CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';

export interface StepNode {
  step_number: number;
  title: string;
  difficulty_tier: string;
  is_unlocked: boolean;
  is_completed: boolean;
}

export interface StepFlowchartStepperProps {
  steps: StepNode[];
  activeStep: number;
  onSelectStep: (stepNumber: number) => void;
}

export const StepFlowchartStepper: React.FC<StepFlowchartStepperProps> = ({
  steps,
  activeStep,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm mb-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Curriculum Architecture Roadmap</h4>
          <p className="text-xs text-slate-400">Sequential milestones and mechanical upgrades</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
          Step {activeStep} of {steps.length}
        </span>
      </div>

      <div className="flex items-stretch gap-4 min-w-[700px]">
        {steps.map((step, idx) => {
          const isActive = step.step_number === activeStep;
          const isCompleted = step.is_completed;
          const isLocked = !step.is_unlocked && !isCompleted;

          return (
            <React.Fragment key={step.step_number}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onSelectStep(step.step_number)}
                className={`flex-1 flex flex-col justify-between p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50/60 border-[#0284C7] ring-2 ring-sky-100 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : isLocked
                    ? 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider ${
                        isActive ? 'text-[#0284C7]' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      STEP {step.step_number}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    )}
                  </div>

                  {/* Explicit Step Name & Difficulty */}
                  <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                    {step.title}
                  </h5>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {step.difficulty_tier || 'Foundations'}
                  </span>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepFlowchartStepper;
