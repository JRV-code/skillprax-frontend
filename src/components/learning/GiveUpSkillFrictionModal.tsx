'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Clock,
  Flame,
  HelpCircle,
  Lightbulb,
  PauseCircle,
} from 'lucide-react';

export interface GiveUpSkillFrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  skillName: string;
  subGenre?: string;
  domain?: string;
  desiredLevel?: string;
  currentStepIndex: number;
  totalSteps: number;
  completedStepsCount: number;
  currentStepTitle: string;
  onDeleted: () => void;
}

const REASONS = [
  {
    id: 'too_difficult',
    label: 'Too difficult right now',
    counterTip:
      '💡 Tip: Try using the "How to approach this" guide and 0.75x video playback instead of deleting!',
  },
  {
    id: 'not_enough_time',
    label: 'Not enough time today',
    counterTip:
      '💡 Tip: Your progress is saved forever in the cloud—you can just take a break and come back anytime!',
  },
  {
    id: 'switching_skill',
    label: 'Switching to a different skill',
    counterTip:
      '💡 Tip: You can enroll in multiple skills simultaneously without deleting this one!',
  },
];

export const GiveUpSkillFrictionModal: React.FC<GiveUpSkillFrictionModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  skillName,
  subGenre = 'Competency Track',
  desiredLevel = 'Full Mastery',
  currentStepIndex = 1,
  totalSteps = 5,
  completedStepsCount = 0,
  currentStepTitle = 'Current Milestone',
  onDeleted,
}) => {
  const [stage, setStage] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState<number>(4);
  const [canProceedToStage2, setCanProceedToStage2] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStage(1);
      setCountdown(4);
      setCanProceedToStage2(false);
      setSelectedReason(null);
      setConfirmInput('');
      setIsDeleting(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Stage 1 countdown timer
  useEffect(() => {
    if (!isOpen || stage !== 1) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanProceedToStage2(true);
    }
  }, [isOpen, stage, countdown]);

  if (!isOpen || !mounted) return null;

  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex || 1) / Math.max(totalSteps || 1, 1)) * 100)
  );

  const isConfirmationMatched =
    confirmInput.trim().toUpperCase() === 'GIVE UP' ||
    confirmInput.trim().toLowerCase() === skillName.trim().toLowerCase();

  const isDeleteEnabled = Boolean(selectedReason) && isConfirmationMatched && !isDeleting;

  const handleDeleteWorkspace = async () => {
    if (!isDeleteEnabled) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const API_BASE = (
        process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com'
      ).replace(/\/+$/, '');

      const res = await fetch(`${API_BASE}/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          reasonDetail: `Learner gave up on ${skillName} at Milestone ${currentStepIndex}. Reason: ${selectedReason}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete workspace.');
      }

      onDeleted();
      onClose();
    } catch (err: any) {
      console.error('[GiveUpSkillFrictionModal] Error deleting skill:', err);
      setErrorMsg(err.message || 'Unable to delete workspace. Please try again.');
      setIsDeleting(false);
    }
  };

  const selectedReasonObj = REASONS.find((r) => r.id === selectedReason);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer z-10"
          title="Keep skill and close"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === 1 ? (
          /* ============================================================ */
          /* STAGE 1: THE PERSUASION & PROGRESS REALITY CHECK             */
          /* ============================================================ */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-black tracking-wide uppercase bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>⚠️ PAUSE BEFORE YOU QUIT</span>
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight leading-tight">
                Are you sure you want to give up on <span className="text-emerald-700">{skillName}</span>?
              </h2>
              <p className="text-xs text-slate-500">
                Growth requires pushing past the friction point. Review your progress below before making an irreversible choice.
              </p>
            </div>

            {/* Visual Progress Milestone Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Flame className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Milestone {currentStepIndex} of {totalSteps}</span>
                </span>
                <span className="text-emerald-700 font-extrabold">{progressPercent}% Trajectory Cleared</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                The hardest part is starting—and you&apos;ve already cleared the initial inertia. Most learners quit right before their biggest breakthrough in <span className="font-bold text-slate-900">&ldquo;{currentStepTitle}&rdquo;</span>.
              </p>
            </div>

            {/* Why Mastering skillName Matters (Dynamic Benefits Card) */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Why Finishing {skillName} Matters</span>
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                {/* Benefit 1 */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                  <span className="w-5 h-5 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-heading font-bold text-slate-900 block">Compounding Mastery:</span>
                    <span className="text-slate-600">
                      Completing this {totalSteps}-milestone trajectory builds permanent, verified competency in {subGenre} that sets you apart from casual learners.
                    </span>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                  <span className="w-5 h-5 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-heading font-bold text-slate-900 block">Real-World Capability:</span>
                    <span className="text-slate-600">
                      Reaching {desiredLevel} level unlocks practical execution skills you can apply immediately to real-world projects and challenges.
                    </span>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                  <span className="w-5 h-5 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-heading font-bold text-slate-900 block">Protect Your Momentum:</span>
                    <span className="text-slate-600">
                      Giving up now permanently erases {completedStepsCount} completed milestones, your curated study packs, quiz analytics, and earned XP.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 1 Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>💪 Keep Going — Return to Milestone {currentStepIndex}</span>
              </button>

              <button
                type="button"
                disabled={!canProceedToStage2}
                onClick={() => setStage(2)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  canProceedToStage2
                    ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 cursor-pointer'
                    : 'text-slate-400 bg-slate-50 cursor-not-allowed opacity-70'
                }`}
              >
                {canProceedToStage2 ? (
                  <>
                    <span>I still want to give up this skill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Wait {countdown}s before deciding...</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* STAGE 2: HIGH-FRICTION CONFIRMATION GATE                     */
          /* ============================================================ */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-black tracking-wide uppercase bg-rose-100 text-rose-900 border border-rose-300">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>IRREVERSIBLE SKILL DELETION</span>
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">
                Final Confirmation: Abandon {skillName}
              </h2>
              <p className="text-xs text-slate-500">
                Deleting will permanently purge your curated learning pack, milestone history, and quiz diagnostic records.
              </p>
            </div>

            {/* Quick Reason Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                What&apos;s making you want to quit right now? <span className="text-rose-500">*</span>
              </label>

              <div className="space-y-2">
                {REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReason(r.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Counter-Tip */}
              {selectedReasonObj && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2 shadow-2xs"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{selectedReasonObj.counterTip}</span>
                </motion.div>
              )}
            </div>

            {/* Type-to-Confirm Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-bold text-slate-800">
                To permanently delete your roadmap and all progress, type <span className="font-mono text-rose-600 font-extrabold uppercase bg-rose-50 px-1 py-0.5 rounded border border-rose-200">GIVE UP</span> below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type GIVE UP"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm font-mono text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Stage 2 Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-heading font-bold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <PauseCircle className="w-4 h-4" />
                <span>⏸ Just Take a Break (Keep My Progress)</span>
              </button>

              <button
                type="button"
                disabled={!isDeleteEnabled}
                onClick={handleDeleteWorkspace}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isDeleteEnabled
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm shadow-rose-600/20 hover:scale-[1.01] active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Workspace...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>🗑️ Permanently Delete Skill &amp; Progress</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
