// skillprax-frontend/src/components/NewSkillModal.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Atom, Sigma, Cog, Users, Briefcase, Scale, Palette, HeartPulse, Hammer, Loader2, ArrowRight } from "lucide-react";
import { KNOWLEDGE_PILLARS, UNIVERSAL_DOMAINS } from "@/lib/pillars";
export { UNIVERSAL_DOMAINS };
import { AIProvider } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Atom, Sigma, Cog, Users, Briefcase, Scale, Palette, HeartPulse, Hammer,
};

interface NewSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (params: { skillName: string; pillarId: string }) => Promise<void>;
  onSubmit?: (data: {
    title: string;
    category: string;
    baselineKnowledge: string;
    targetGoal: string;
    preferredProvider: AIProvider;
  }) => Promise<void>;
}

export function NewSkillModal({ isOpen, onClose, onCreate, onSubmit }: NewSkillModalProps) {
  const router = useRouter();
  const [skillName, setSkillName] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(KNOWLEDGE_PILLARS[0].id);
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSubmit = skillName.trim().length >= 2 && selectedPillarId !== null && !isSubmitting;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!canSubmit || !selectedPillarId) return;

    setIsSubmitting(true);
    setError(null);

    const selectedPillar = KNOWLEDGE_PILLARS.find((p) => p.id === selectedPillarId);
    const categoryLabel = selectedPillar ? selectedPillar.label : "General Knowledge";

    try {
      if (onCreate) {
        await onCreate({ skillName: skillName.trim(), pillarId: selectedPillarId });
        setSkillName("");
        onClose();
        return;
      }

      if (onSubmit) {
        await onSubmit({
          title: skillName.trim(),
          category: categoryLabel,
          baselineKnowledge: "Beginner",
          targetGoal: goal.trim() || "Full Mastery",
          preferredProvider: "groq" as AIProvider,
        });
        setSkillName("");
        onClose();
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://skillprax-backend.onrender.com"}/api/workspaces/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: skillName.trim(),
          domainCategory: categoryLabel,
          targetGoal: goal.trim() || "Full Mastery",
          level: "beginner",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create skill workspace");
      }

      const data = await res.json();
      const workspaceId = data.workspace?.id || data.id;
      if (workspaceId) {
        router.push(`/workspace/${workspaceId}`);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating this skill track.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-100">Start a new learning track</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <div>
            <label htmlFor="skillName" className="mb-2 block text-sm font-medium text-neutral-300">
              What do you want to learn?
            </label>
            <input
              id="skillName"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Watercolor portraiture, Negotiation tactics, Cellular respiration"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none text-sm"
              maxLength={200}
              required
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-neutral-300">Which area of knowledge is this?</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KNOWLEDGE_PILLARS.map((pillar) => {
                const Icon = ICON_MAP[pillar.icon] ?? Cog;
                const isSelected = selectedPillarId === pillar.id;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setSelectedPillarId(pillar.id)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-neutral-400"}`} />
                    <span className={`text-xs font-semibold ${isSelected ? "text-emerald-300" : "text-neutral-200"}`}>{pillar.label}</span>
                    <span className="text-[11px] text-neutral-500 leading-tight line-clamp-1">{pillar.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="goal" className="mb-2 block text-sm font-medium text-neutral-300">
              Real-World Target Goal (Optional)
            </label>
            <input
              id="goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Pass exam, build production application, present research paper..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow-lg shadow-emerald-950"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Track...
                </>
              ) : (
                <>
                  Create track
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewSkillModal;
