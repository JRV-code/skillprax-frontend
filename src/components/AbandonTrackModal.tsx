// skillprax-frontend/src/components/AbandonTrackModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
} from "lucide-react";

export type AbandonReason = "curve_too_steep" | "curriculum_mismatch" | "pivoting_goals" | "other";

export type AbandonModalState = "reflect" | "confirm-input" | "countdown" | "submitting" | "error";

interface AbandonTrackModalProps {
  workspaceId: string;
  trackTitle: string;
  domain: string;
  completedStepsCount: number;
  reflectionText?: string | null;
  milestonesSummary?: string[];
  isOpen: boolean;
  onClose: () => void;
  onAbandoned: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://skillprax-backend.onrender.com";

export default function AbandonTrackModal({
  workspaceId,
  trackTitle,
  domain,
  completedStepsCount,
  reflectionText = null,
  milestonesSummary = [],
  isOpen,
  onClose,
  onAbandoned,
}: AbandonTrackModalProps) {
  const [modalState, setModalState] = useState<AbandonModalState>("reflect");
  const [reason, setReason] = useState<AbandonReason | "">("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [confirmInputText, setConfirmInputText] = useState("");
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  const phrase1 = `abandon ${trackTitle}`.trim().toLowerCase();
  const phrase2 = "pause track";

  const cleanTyped = confirmInputText.trim().toLowerCase();
  const isPhraseMatched = cleanTyped === phrase1 || cleanTyped === phrase2;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setModalState("reflect");
      setReason("");
      setReasonDetail("");
      setConfirmInputText("");
      setCountdownSeconds(5);
      setErrorMessage("");
    }
  }, [isOpen]);

  // Countdown timer logic in 'countdown' state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && modalState === "countdown" && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, modalState, countdownSeconds]);

  if (!isOpen) return null;

  const handleReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (reason === "other" && !reasonDetail.trim()) return;
    setModalState("confirm-input");
  };

  const handleConfirmInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhraseMatched) return;
    setCountdownSeconds(5);
    setModalState("countdown");
  };

  const handleFinalAbandon = async () => {
    if (countdownSeconds > 0) return;
    setModalState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          reasonDetail: reasonDetail.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Deletion failed with status ${res.status}`);
      }

      onAbandoned();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to abandon track.");
      setModalState("error");
    }
  };

  const isLowCommitment = modalState === "reflect" || modalState === "confirm-input";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#12151F] border border-[#1E2436] p-6 sm:p-8 shadow-2xl text-foreground space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wider uppercase">
            <AlertTriangle className="w-5 h-5" />
            <span>Track Abandonment & Reflection</span>
          </div>

          {isLowCommitment && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-800 transition"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STATE 1: REFLECT */}
        {modalState === "reflect" && (
          <form onSubmit={handleReasonSubmit} className="space-y-5">
            {/* Context Framing */}
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                Track Achievement Snapshot
              </span>
              <h3 className="text-base font-bold text-foreground">{trackTitle}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Domain: <strong className="text-foreground">{domain}</strong></span>
                <span>Milestones Mastered: <strong className="text-emerald-400">{completedStepsCount}</strong></span>
              </div>
            </div>

            {/* Groq-Generated Reflection Callout */}
            {(() => {
              const safeMilestones = Array.isArray(milestonesSummary) ? milestonesSummary : [];
              if (!reflectionText && safeMilestones.length === 0) return null;
              return (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  {reflectionText && (
                    <>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                        Before you go — here’s what you’ve built:
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">{reflectionText}</p>
                    </>
                  )}
                  {safeMilestones.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {safeMilestones.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground block">
                Select your primary reason for pausing or abandoning this track:
              </label>

              <div className="space-y-2">
                {[
                  { id: "curve_too_steep", label: "Learning curve too steep for current baseline" },
                  { id: "curriculum_mismatch", label: "Curriculum doesn't align with my goal" },
                  { id: "pivoting_goals", label: "Pivoting goals / switching focus areas" },
                  { id: "other", label: "Other reason" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      reason === opt.id
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200"
                        : "bg-[#090A0F] border-[#1E2436] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="abandonReason"
                      value={opt.id}
                      checked={reason === opt.id}
                      onChange={() => setReason(opt.id as AbandonReason)}
                      className="accent-cyan-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {reason === "other" && (
                <div className="pt-2">
                  <textarea
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    placeholder="Please specify why you are pausing this track..."
                    rows={3}
                    maxLength={500}
                    className="w-full p-3 rounded-xl bg-[#090A0F] border border-[#1E2436] text-xs text-foreground focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E2436]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                Keep Track Active
              </button>
              <button
                type="submit"
                disabled={!reason || (reason === "other" && !reasonDetail.trim())}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Continue Reflection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STATE 2: CONFIRM INPUT */}
        {modalState === "confirm-input" && (
          <form onSubmit={handleConfirmInputSubmit} className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Unlock Abandonment Confirmation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To prevent accidental deletion, type either of the accepted phrases below to unlock:
              </p>
              
              <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1E2436] font-mono text-xs text-cyan-300 space-y-1">
                <div>Option A: <code className="text-emerald-300">abandon {trackTitle}</code></div>
                <div>Option B: <code className="text-emerald-300">pause track</code></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={confirmInputText}
                  onChange={(e) => setConfirmInputText(e.target.value)}
                  placeholder={`Type "abandon ${trackTitle}" or "pause track"`}
                  className="w-full p-3.5 pr-10 rounded-xl bg-[#090A0F] border border-[#1E2436] text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 transition"
                />
                {isPhraseMatched && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3 top-3" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">Phrase matching is case-insensitive.</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1E2436]">
              <button
                type="button"
                onClick={() => setModalState("reflect")}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Reason
              </button>

              <button
                type="submit"
                disabled={!isPhraseMatched}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/80 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Unlock Final Gate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STATE 3: COUNTDOWN */}
        {modalState === "countdown" && (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center">
              <Clock className="w-7 h-7 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground">Final Safety Lock</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Hold on! Review your decision before final confirmation. This action will archive your telemetry and delete track state.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setModalState("reflect")}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 text-muted-foreground hover:bg-slate-700 text-xs font-semibold transition"
              >
                Cancel & Reset
              </button>

              <button
                type="button"
                onClick={handleFinalAbandon}
                disabled={countdownSeconds > 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {countdownSeconds > 0 ? (
                  `Abandon Track (${countdownSeconds}s)`
                ) : (
                  "Confirm Permanent Abandonment"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: SUBMITTING */}
        {modalState === "submitting" && (
          <div className="space-y-4 text-center py-8">
            <Loader2 className="w-10 h-10 text-red-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-muted-foreground">Archiving reflection telemetry & purging track...</p>
          </div>
        )}

        {/* STATE 5: ERROR */}
        {modalState === "error" && (
          <div className="space-y-4 text-center py-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Abandonment Failed</h3>
              <p className="text-xs text-red-300">{errorMessage}</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-muted-foreground text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => setModalState("countdown")}
                className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-900/80"
              >
                Retry Deletion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
