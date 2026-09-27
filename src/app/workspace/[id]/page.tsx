"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  PlayCircle, 
  FileText, 
  BookOpen, 
  Compass, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const id = params?.id as string;
  const [workspace, setWorkspace] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/workspaces/${id}`);
        if (!res.ok) throw new Error("Workspace not found");
        const data = await res.json();
        setWorkspace(data);
        if (data.steps && data.steps.length > 0) {
          setActiveStep(data.steps[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin"/>
      </div>
    );
  }

  if (!workspace || !activeStep) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
        <p>Workspace could not be loaded.</p>
      </div>
    );
  }

  // Safe parsing of resources & takeaways
  const resources: any[] = Array.isArray(activeStep.resources)
    ? activeStep.resources
    : typeof activeStep.resources === "string"
      ? JSON.parse(activeStep.resources || "[]")
      : [];

  const takeaways: string[] = Array.isArray(activeStep.coreKeyTakeaways)
    ? activeStep.coreKeyTakeaways
    : typeof activeStep.coreKeyTakeaways === "string"
      ? JSON.parse(activeStep.coreKeyTakeaways || "[]")
      : [];

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "video": return <PlayCircle className="w-4 h-4 text-rose-400"/>;
      case "pdf": return <FileText className="w-4 h-4 text-amber-400"/>;
      case "wiki": return <BookOpen className="w-4 h-4 text-purple-400"/>;
      case "interactive": return <Compass className="w-4 h-4 text-emerald-400"/>;
      default: return <Globe className="w-4 h-4 text-cyan-400"/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Step Card */}
        <div className="border border-cyan-900/60 bg-slate-950/70 backdrop-blur rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {activeStep.difficulty || "Beginner"}
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Step {activeStep.stepIndex}: {activeStep.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-cyan-400">
                Gate: <strong className="text-white">{activeStep.questionCount || 5} Questions</strong> (AI-Calibrated)
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">80% Passing Score</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                ACTIVE STUDY
              </span>
            </div>
          </div>

          {/* Conceptual Architecture */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
              <Sparkles className="w-3.5 h-3.5"/>
              Conceptual Overview & Architecture
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {activeStep.whatYouWillLearn || "Master foundational principles and mental models."}
            </div>
          </div>

          {/* Key Takeaways */}
          {takeaways.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Core Key Takeaways & Mental Models:
              </div>
              <div className="flex flex-wrap gap-2">
                {takeaways.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0"/>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Application */}
          {activeStep.practicalApplication && (
            <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs">
              <span className="font-bold text-cyan-400 block mb-1">Real-World Goal Application:</span>
              <p className="text-slate-300">{activeStep.practicalApplication}</p>
            </div>
          )}

          {/* Curated Resources */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                <BookOpen className="w-3.5 h-3.5"/>
                AI-Curated Learning Materials ({resources.length} Selected by Mentor)
              </div>
            </div>

            {resources.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-400">Direct reference links for {activeStep.title}:</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <a
                    href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(activeStep.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/20"
                  >
                    <BookOpen className="w-3.5 h-3.5"/>
                    Encyclopedia Reference
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {resources.map((res: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(res.type)}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {res.badge || "Core Material"}
                        </span>
                      </div>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-semibold text-slate-100 hover:text-cyan-300 flex items-center gap-1.5"
                      >
                        {res.title}
                        <ExternalLink className="w-3 h-3 text-slate-400"/>
                      </a>
                      {res.studyGuidance && (
                        <p className="text-xs text-slate-400 italic">
                          {res.studyGuidance}
                        </p>
                      )}
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-200 transition-all shrink-0"
                    >
                      Study Material
                      <ExternalLink className="w-3 h-3"/>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => alert(`Starting evaluation with ${activeStep.questionCount || 5} questions.`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all"
            >
              <Zap className="w-4 h-4 fill-slate-950"/>
              I Have Completed Materials — Take Evaluation Quiz ({activeStep.questionCount || 5} Questions)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
