// skillprax-frontend/src/app/workspace/[id]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  RefreshCw, 
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
  ArrowLeft,
  AlertCircle,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { getPillarById } from "@/lib/pillars";
import QuizModal from "@/components/QuizModal";
import AbandonTrackModal from "@/components/AbandonTrackModal";

interface CuratedResource {
  title: string;
  url: string;
  type?: "video" | "article" | "documentation" | "paper" | "interactive" | "book" | "dataset" | "tool" | "wiki";
  badge: string;
  studyGuidance: string;
  sourceOrigin?: "tavily" | "groq-internal" | "fallback";
}

interface SkillStep {
  id: string;
  stepIndex: number;
  title: string;
  description?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "PASSED" | "FAILED" | "FAILED_REMEDIATION";
  assessableUnits?: Array<{ id: string; label: string; description: string }> | string;
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
  isGenerating?: boolean;
  totalPlannedSteps?: number;
  aiEngine?: string;
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
  
  // Modal States
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAbandonOpen, setIsAbandonOpen] = useState(false);
  const [isAdvancingStep, setIsAdvancingStep] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [milestonesSummary, setMilestonesSummary] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"flowchart" | "study" | "evaluation">("study");

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId || workspaceId === "undefined") return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<any>(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${workspaceId}`
      );
      const wsData: Workspace = data.workspace || data;
      setWorkspace(wsData);
      
      if (wsData.steps && wsData.steps.length > 0) {
        setActiveStep((prevStep) => {
          if (prevStep) {
            const matched = wsData.steps.find((s) => s.id === prevStep.id);
            if (matched) return matched;
          }
          return wsData.steps[wsData.steps.length - 1];
        });
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
      const data = await apiFetch<{ step: SkillStep }>(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${workspaceId}/steps/${stepId}/regenerate`,
        { method: "POST" }
      );
      setWorkspace((prev) => 
        prev ? { ...prev, steps: prev.steps.map((s) => (s.id === stepId ? data.step : s)) } : prev
      );
      if (activeStep?.id === stepId) {
        setActiveStep(data.step);
      }
    } catch (err) {
      setRegenerateError((prev) => ({ 
        ...prev, 
        [stepId]: err instanceof Error ? err.message : "Regeneration failed." 
      }));
    } finally {
      setRegeneratingStepId(null);
    }
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const fetchWorkspace = loadWorkspace;

  const handleMilestonePassed = async () => {
    try {
      setIsQuizOpen(false);
      setIsAdvancingStep(true);
      setActionError(null);

      const res = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/next-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        console.warn('Next-step endpoint returned non-200, refreshing workspace');
        await fetchWorkspace();
        return;
      }

      const data = await res.json();
      const updated = data?.workspace || data;

      if (updated && Array.isArray(updated.steps)) {
        setWorkspace(updated);
        if (updated.steps.length > 0) {
          setActiveStep(updated.steps[updated.steps.length - 1]);
        }
      } else {
        await fetchWorkspace();
      }
    } catch (err) {
      console.error('Next-step progression error:', err);
      await fetchWorkspace();
    } finally {
      setIsAdvancingStep(false);
    }
  };

  const handlePassed = handleMilestonePassed;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090A0F] text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">Loading mastery studio...</p>
        </div>
      </div>
    );
  }

  if (loadError || !workspace) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-foreground">
        <div className="p-6 rounded-3xl bg-[#12151F] border border-[#1E2436] space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Workspace Load Error</h2>
          <p className="text-xs text-red-300">{loadError ?? "Workspace not found."}</p>
          <div className="pt-4 flex justify-center gap-4">
            <Link 
              href="/" 
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-700 transition"
            >
              Return to Dashboard
            </Link>
            <button 
              onClick={loadWorkspace} 
              className="rounded-xl border border-cyan-500/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950 transition"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepsList = Array.isArray(workspace?.steps) ? workspace.steps : [];
  const currentStep = activeStep || (stepsList.length > 0 ? stepsList[0] : null);
  const pillarId = workspace.pillar || workspace.domainCategory || "General Knowledge";
  const pillar = getPillarById(pillarId);
  const title = workspace.skillName || workspace.title || "Skill Track";

  const rawResources = currentStep?.resources || [];
  const resources: CuratedResource[] = Array.isArray(rawResources)
    ? rawResources
    : typeof rawResources === "string"
      ? (JSON.parse(rawResources || "[]") as CuratedResource[])
      : [];

  const rawAcus = currentStep?.assessableUnits || [];
  const acus: Array<{ id: string; label: string; description: string }> = Array.isArray(rawAcus)
    ? rawAcus
    : typeof rawAcus === "string"
      ? (JSON.parse(rawAcus || "[]"))
      : [];

  const overviewText = currentStep?.description || "Master foundational principles and mental models.";
  const questionCount = activeStep?.questionCount || (Array.isArray(activeStep?.assessableUnits) ? activeStep.assessableUnits.length : (Array.isArray(acus) ? acus.length : 5));
  const completedStepsCount = stepsList.filter((s) => s.status === "PASSED").length;

  const isPreparingQuiz = workspace.isGenerating || !currentStep;

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-xl text-foreground p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Floating Orb Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[140px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-cyan-400 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            {pillar && (
              <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                {pillar.label}
              </span>
            )}
            
            <button
              onClick={async () => {
                setIsLoadingReflection(true);
                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${workspace.id}/abandon-reflection`,
                    { method: "POST", headers: { "Content-Type": "application/json" } }
                  );
                  if (res.ok) {
                    const data = await res.json();
                    setReflectionText(data.reflectionText || null);
                    setMilestonesSummary(Array.isArray(data.milestonesSummary) ? data.milestonesSummary : []);
                  } else {
                    setReflectionText(null);
                    setMilestonesSummary([]);
                  }
                } catch (_) {
                  setReflectionText(null);
                  setMilestonesSummary([]);
                } finally {
                  setIsLoadingReflection(false);
                  setIsAbandonOpen(true);
                }
              }}
              disabled={isLoadingReflection}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs text-red-300 font-semibold transition disabled:opacity-50"
            >
              {isLoadingReflection ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Loading…</span></>
              ) : (
                <><Trash2 className="w-3.5 h-3.5" /><span>Pause / Abandon Track</span></>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Overview */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {workspace.targetGoal && (
            <p className="text-xs text-muted-foreground mt-1">Goal: {workspace.targetGoal}</p>
          )}
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
        )}

        {/* Step Tabs Navigation */}
        {workspace.steps.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {workspace.steps.map((s, idx) => {
              const isStepPassed = s.status === "PASSED";
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 ${
                    currentStep?.id === s.id
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold"
                      : "bg-[#12151F] border border-[#1E2436] text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Step {idx + 1}: {s.title}</span>
                  {isStepPassed && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStep?.id === s.id ? "text-slate-950" : "text-emerald-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Step Display */}
        {currentStep ? (
          <div className="border border-[#1E2436] bg-card/80 backdrop-blur-md shadow-lg border border-border/50/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            {/* Step Subheader */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2436] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                    Step {currentStep.stepIndex} of {workspace.steps.length}
                  </span>
                  {currentStep.status === "PASSED" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      MASTERED
                    </span>
                  )}
                  {currentStep.status === "FAILED_REMEDIATION" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                      REMEDIATION GATE
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{currentStep.title}</h2>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-lg bg-background/80 backdrop-blur-xl border border-[#1E2436] font-mono text-cyan-300">
                  Evaluation Gate: {questionCount} Questions (Calibrated to Step Complexity)
                </span>
                <button
                  onClick={() => handleRegenerate(currentStep.id)}
                  disabled={regeneratingStepId === currentStep.id || workspace.isGenerating}
                  className="p-2 rounded-lg bg-background/80 backdrop-blur-xl border border-[#1E2436] hover:border-cyan-500/40 text-muted-foreground hover:text-cyan-300 transition disabled:opacity-50"
                  title="Regenerate step content"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingStepId === currentStep.id ? "animate-spin text-cyan-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Tripartite Tab Switcher */}
            <div className="flex gap-2 border-b border-[#1E2436] pb-4">
              <button
                onClick={() => setActiveTab("flowchart")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === "flowchart"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "bg-background/80 backdrop-blur-xl border border-[#1E2436] text-muted-foreground hover:text-foreground"
                }`}
              >
                🗺️ Flowchart
              </button>
              <button
                onClick={() => setActiveTab("study")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === "study"
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-background/80 backdrop-blur-xl border border-[#1E2436] text-muted-foreground hover:text-foreground"
                }`}
              >
                📚 Study
              </button>
              <button
                onClick={() => setActiveTab("evaluation")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === "evaluation"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-background/80 backdrop-blur-xl border border-[#1E2436] text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚡ Evaluation
              </button>
            </div>

            {activeTab === "flowchart" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Workspace Roadmap</h3>
                <div className="relative border-l-2 border-[#1E2436] pl-6 space-y-6">
                  {stepsList.map((s, idx) => (
                    <div key={s.id} className="relative">
                      <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 border-[#071026] ${s.status === "PASSED" ? "bg-emerald-400" : s.status === "FAILED_REMEDIATION" ? "bg-amber-400 animate-pulse" : s.status === "IN_PROGRESS" ? "bg-cyan-400" : "bg-slate-600"}`} />
                      <div className="text-sm font-bold text-foreground">Step {idx + 1}: {s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.status === "PASSED" ? "Mastered" : s.status === "FAILED_REMEDIATION" ? "Remediation Required" : "Pending Evaluation"}</div>
                    </div>
                  ))}
                  {stepsList.length < (workspace.totalPlannedSteps || 5) && (
                    <div className="relative opacity-50">
                      <div className="absolute -left-[33px] w-4 h-4 rounded-full border-2 border-[#071026] bg-slate-800" />
                      <div className="text-sm font-bold text-muted-foreground">Step {stepsList.length + 1}...</div>
                      <div className="text-xs text-slate-500">Locked</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "study" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Conceptual Overview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                    <Sparkles className="w-4 h-4" />
                    Conceptual Overview & Architecture
                  </div>
                  <div className="bg-background/80 backdrop-blur-xl border border-[#1E2436] rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {overviewText}
                  </div>
                </div>

                {/* Atomic Competency Units */}
                {acus.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Atomic Competency Units ({acus.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {acus.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-background/80 backdrop-blur-xl border border-[#1E2436] text-xs text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground block">{item.label}</span>
                            <span className="text-muted-foreground text-[11px]">{item.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Goal Application */}
                {currentStep.practicalApplication && (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider block">Target Goal Alignment:</span>
                    <p className="text-muted-foreground leading-relaxed">{currentStep.practicalApplication}</p>
                  </div>
                )}

                {/* Dynamic AI-Curated Learning Resources */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                      <BookOpen className="w-4 h-4" />
                      AI-Curated Destination Materials ({resources.length})
                    </div>
                  </div>

                  {resources.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-background/80 backdrop-blur-xl border border-[#1E2436] text-center space-y-3">
                      <p className="text-xs text-muted-foreground">Direct reference links for {currentStep.title}:</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resources.map((res: CuratedResource, idx: number) => {
                        const resType = res.type || "article";
                        const IconComponent = RESOURCE_ICON[resType] || RESOURCE_ICON.default;
                        return (
                          <div 
                            key={idx}
                            className="p-4 rounded-2xl bg-background/80 backdrop-blur-xl border border-[#1E2436] hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 text-accent shrink-0" />
                                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    {res.badge || "Core Reference"}
                                  </span>
                                </div>
                                {res.sourceOrigin === "fallback" && (
                                  <span className="text-[10px] font-mono text-slate-500">(Canonical)</span>
                                )}
                              </div>
                              <a 
                                href={res.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm font-semibold text-foreground group-hover:text-amber-300 transition flex items-center gap-1.5"
                              >
                                {res.title}
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent shrink-0" />
                              </a>
                              {res.studyGuidance && (
                                <p className="text-xs text-muted-foreground leading-normal">
                                  {res.studyGuidance}
                                </p>
                              )}
                            </div>

                            <div className="pt-2">
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-accent text-xs font-semibold transition"
                              >
                                <span>Open Destination Material</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "evaluation" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center p-8 bg-background/80 backdrop-blur-xl border border-[#1E2436] rounded-3xl">
                  <h3 className="text-lg font-bold text-foreground mb-2">Step Evaluation</h3>
                  <p className="text-muted-foreground text-sm mb-6">Test your mastery of the concepts covered in this step. You need 80% to proceed.</p>
                  
                  {isPreparingQuiz ? (
                    <button
                      disabled
                      className="mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-muted-foreground font-semibold text-xs cursor-not-allowed opacity-80"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      Preparing your quiz...
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsQuizOpen(true)}
                      disabled={isAdvancingStep}
                      className={`mx-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${
                        currentStep.status === "FAILED_REMEDIATION"
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      } font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50`}
                    >
                      {isAdvancingStep ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin fill-slate-950" />
                          Generating Next Step...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-slate-950" />
                          {currentStep.status === "FAILED_REMEDIATION"
                            ? `Resolve Remediation Gate (${questionCount} ACUs)`
                            : `Take Evaluation Quiz (${questionCount} ACUs)`}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border border-[#1E2436] bg-[#12151F] rounded-3xl">
            No active step available for this workspace.
          </div>
        )}

        {/* Quiz Modal Render */}
        {currentStep && (
          <QuizModal
            stepId={currentStep.id}
            isOpen={isQuizOpen}
            onClose={() => {
              setIsQuizOpen(false);
              fetchWorkspace();
            }}
            onPassed={handlePassed}
          />
        )}

        {/* Abandon Track Modal Render */}
        {workspace && (
          <AbandonTrackModal
            workspaceId={workspace.id}
            trackTitle={title}
            domain={pillarId}
            completedStepsCount={completedStepsCount}
            reflectionText={reflectionText}
            milestonesSummary={milestonesSummary}
            isOpen={isAbandonOpen}
            onClose={() => setIsAbandonOpen(false)}
            onAbandoned={() => router.push("/")}
          />
        )}
      </div>
    </div>
  );
}
