"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Atom, 
  Cpu, 
  Binary, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Palette, 
  Activity, 
  Wrench,
  ArrowRight,
  Loader2
} from "lucide-react";
import { AIProvider } from "@/lib/types";

export const UNIVERSAL_DOMAINS = [
  { id: "natural-sciences", label: "Natural & Physical Sciences", icon: Atom },
  { id: "engineering-tech", label: "Engineering & Applied Technology", icon: Cpu },
  { id: "mathematics-logic", label: "Formal Sciences & Mathematics", icon: Binary },
  { id: "social-sciences", label: "Social Sciences & Human Systems", icon: Users },
  { id: "business-finance", label: "Business, Finance & Strategy", icon: TrendingUp },
  { id: "humanities-philosophy", label: "Humanities, Philosophy & Law", icon: BookOpen },
  { id: "arts-design", label: "Arts, Media & Spatial Design", icon: Palette },
  { id: "health-athletics", label: "Health, Physiology & Athletics", icon: Activity },
  { id: "practical-crafts", label: "Practical Crafts & Applied Trades", icon: Wrench }
];

export function NewSkillModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    title: string;
    category: string;
    baselineKnowledge: string;
    targetGoal: string;
    preferredProvider: AIProvider;
  }) => Promise<void>;
}) {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState(UNIVERSAL_DOMAINS[0].label);
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (onSubmit) {
        await onSubmit({
          title: topic.trim(),
          category: selectedDomain,
          baselineKnowledge: "Beginner",
          targetGoal: goal.trim() || "Full Mastery",
          preferredProvider: "groq" as AIProvider
        });
        onClose();
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic.trim(),
          domainCategory: selectedDomain,
          category: selectedDomain,
          targetGoal: goal.trim() || "Full Mastery",
          level: "Beginner"
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create skill workspace");
      }

      const data = await res.json();
      router.push(`/workspace/${data.workspace.id}`);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to initialize workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Create Learning Track</h2>
        <p className="text-sm text-slate-400 mb-4">Choose a broad domain and set your milestone.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Domain Category
            </label>
            <div className="flex flex-wrap gap-2">
              {UNIVERSAL_DOMAINS.map((dom) => {
                const Icon = dom.icon;
                const isSelected = selectedDomain === dom.label;
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => setSelectedDomain(dom.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5"/>
                    {dom.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              What do you want to learn?
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Fullstack web development, Quantum mechanics, Woodworking joinery..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Real-World Goal / Application
            </label>
            <input
              type="text"
              placeholder="e.g., Build and sell fullstack SaaS apps, Pass competitive exam..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  Educator Curating Track...
                </>
              ) : (
                <>
                  Next: Baseline & Goals
                  <ArrowRight className="w-4 h-4"/>
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
