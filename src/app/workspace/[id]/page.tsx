// skillprax-frontend/src/app/workspace/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  RefreshCw, 
  Clock, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  FlaskConical, 
  Wrench, 
  Database, 
  Video, 
  Globe, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { getPillarById } from "@/lib/pillars";

interface CuratedResource {
  title: string;
  url: string;
  type: "video" | "article" | "documentation" | "paper" | "interactive" | "book" | "dataset" | "tool" | "wiki";
  badge: string;
  studyGuidance: string;
  sourceOrigin?: "tavily" | "groq-internal";
}

interface SkillStep {
  id: string;
  stepIndex: number;
  title: string;
  description?: string;
  whatYouWillLearn?: string;
  conceptualOverview?: string | null;
  coreKeyTakeaways?: string[];
  keyTakeaways?: string[];
  practicalApplication?: string;
  questionCount?: number;
  resources: CuratedResource[];
  estimatedMinutes?: number | null;
  difficulty?: string;
}

interface Workspace {
  id: string;
  skillName?: string;
  title?: string;
  pillar?: string;
  domainCategory?: string;
  targetGoal?: string;
  steps: SkillStep[];
}

const RESOURCE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  article: FileText,
  documentation: BookOpen,
  paper: FlaskConical,
  interactive: PlayCircle,
  book: BookOpen,
  dataset: Database,
  tool: Wrench,
  wiki: BookOpen,
  default: Globe,
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { 
    ...init, 
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } 
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Request to ${url} failed with status ${res.status}`);
  }
  return json as T;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = (params?.id || "") as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeStep, setActiveStep] = useState<SkillStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<Record<string, string>>({});

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId || workspaceId === "undefined") return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<any>(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${workspaceId}`);
      const wsData = data.workspace || data;
      setWorkspace(wsData);
      if (wsData.steps && wsData.steps.length > 0) {
        setActiveStep(wsData.steps[0]);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { 
    loadWorkspace(); 
  }, [loadWorkspace]);

  async function handleRegenerate(stepId: string) {
    setRegeneratingStepId(stepId);
    setRegenerateError((prev) => ({ ...prev, [stepId]: "" }));
    try {
      const data = await apiFetch<{ step: SkillStep }>(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${workspaceId}/steps/${stepId}/regenerate`, { method: "POST" });
      setWorkspace((prev) => prev ? { ...prev, steps: prev.steps.map((s) => (s.id === stepId ? data.step : s)) } : prev);
      if (activeStep?.id === stepId) {
        setActiveStep(data.step);
      }
    } catch (err) {
      setRegenerateError((prev) => ({ ...prev, [stepId]: err instanceof Error ? err.message : "Regeneration failed." }));
    } finally {
      setRegeneratingStepId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090A0F] text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading mastery studio...</p>
        </div>
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-slate-200">
        <p className="text-red-400">{loadError ?? "Workspace not found."}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/" className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">
            Return to Dashboard
          </Link>
          <button onClick={loadWorkspace} className="rounded-xl border border-cyan-500/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const currentStep = activeStep || (workspace.steps && workspace.steps[0]);
  const pillarId = workspace.pillar || workspace.domainCategory || "";
  const pillar = getPillarById(pillarId);
  const title = workspace.skillName || workspace.title || "Skill Track";

  const rawResources = currentStep?.resources || [];
  const resources: CuratedResource[] = Array.isArray(rawResources)
    ? rawResources
    : typeof rawResources === "string"
      ? JSON.parse(rawResources || "[]")
      : [];

  const rawTakeaways = currentStep?.keyTakeaways || currentStep?.coreKeyTakeaways || [];
  const takeaways: string[] = Array.isArray(rawTakeaways)
    ? rawTakeaways
    : typeof rawTakeaways === "string"
      ? JSON.parse(rawTakeaways || "[]")
      : [];

  const overviewText = currentStep?.conceptualOverview || currentStep?.whatYouWillLearn || "Master foundational principles and mental models.";
  const questionCount = currentStep?.questionCount || 5;

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 bg-cyber-grid p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {pillar && (
              <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                {pillar.label}
              </span>
            )}
          </div>
        </div>

        {/* Workspace Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
          {workspace.targetGoal && (
            <p className="text-xs text-slate-400 mt-1">Goal: {workspace.targetGoal}</p>
          )}
        </div>

        {/* Step Selector Pills if multiple steps exist */}
        {workspace.steps.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {workspace.steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  currentStep?.id === s.id
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "bg-[#12151F] border border-[#1E2436] text-slate-400 hover:text-slate-200"
                }`}
              >
                Step {idx + 1}: {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Main Step Content Card */}
        {currentStep && (
          <div className="border border-[#1E2436] bg-[#12151F] rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            {/* Step Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2436] pb-5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  Step {currentStep.stepIndex} of {workspace.steps.length}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{currentStep.title}</h2>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-lg bg-[#090A0F] border border-[#1E2436] font-mono text-cyan-300">
                  {questionCount} AI-Calibrated Questions
                </span>
                <button
                  onClick={() => handleRegenerate(currentStep.id)}
                  disabled={regeneratingStepId === currentStep.id}
                  className="p-2 rounded-lg bg-[#090A0F] border border-[#1E2436] hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition"
                  title="Regenerate step content"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingStepId === currentStep.id ? "animate-spin text-cyan-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Conceptual Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                <Sparkles className="w-4 h-4" />
                Conceptual Overview & Architecture
              </div>
              <div className="bg-[#090A0F] border border-[#1E2436] rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {overviewText}
              </div>
            </div>

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Core Takeaways & Mental Models:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {takeaways.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#090A0F] border border-[#1E2436] text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Goal Application */}
            {currentStep.practicalApplication && (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                <span className="font-bold text-cyan-400 uppercase tracking-wider block">Target Goal Alignment:</span>
                <p className="text-slate-300 leading-relaxed">{currentStep.practicalApplication}</p>
              </div>
            )}

            {/* AI-Curated Learning Resources */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  <BookOpen className="w-4 h-4" />
                  AI-Curated Destination Materials ({resources.length})
                </div>
              </div>

              {resources.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-center space-y-3">
                  <p className="text-xs text-slate-400">Direct reference links for {currentStep.title}:</p>
                  <div className="flex justify-center">
                    <a
                      href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title + ' ' + currentStep.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/80 transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Explore Encyclopedia Reference
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {resources.map((res: CuratedResource, idx: number) => {
                    const IconComponent = RESOURCE_ICON[res.type] || RESOURCE_ICON.default;
                    return (
                      <div 
                        key={idx}
                        className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              {res.badge || "Core Reference"}
                            </span>
                            {res.sourceOrigin === "groq-internal" && (
                              <span className="text-[10px] font-mono text-slate-500">(Canonical)</span>
                            )}
                          </div>
                          <a 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition flex items-center gap-1.5"
                          >
                            {res.title}
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                          </a>
                          {res.studyGuidance && (
                            <p className="text-xs text-slate-400 leading-normal">
                              {res.studyGuidance}
                            </p>
                          )}
                        </div>

                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition shrink-0"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Evaluation Quiz Footer Action */}
            <div className="pt-6 border-t border-[#1E2436] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Passing threshold: <strong className="text-slate-200">80% Score</strong> to achieve step mastery.
              </div>

              <button
                onClick={() => alert(`Launching ACU Diagnostic Evaluation Quiz with ${questionCount} questions...`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                Take ACU Diagnostic Evaluation Quiz ({questionCount} Questions)
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
