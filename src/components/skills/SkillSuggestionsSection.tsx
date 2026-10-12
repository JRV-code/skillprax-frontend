'use client';

import React from 'react';
import { Sparkles, ArrowRight, Code, Palette, Brain, Languages } from 'lucide-react';

export interface SkillSuggestion {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estSteps: number;
  description: string;
  icon: any;
  affinity: number;
}

export const DEFAULT_SUGGESTIONS: SkillSuggestion[] = [
  {
    id: 's-python',
    title: 'Python Backend Systems',
    category: 'Software Engineering',
    difficulty: 'Beginner',
    estSteps: 5,
    description: 'Master clean API architecture, data structures, and asynchronous execution patterns.',
    icon: Code,
    affinity: 98,
  },
  {
    id: 's-uiux',
    title: 'Design Systems & UI/UX',
    category: 'Digital Product Design',
    difficulty: 'Intermediate',
    estSteps: 6,
    description: 'Architect scalable tokens, micro-interactions, and accessible interface typography.',
    icon: Palette,
    affinity: 94,
  },
  {
    id: 's-ml',
    title: 'Generative AI & LLM Pipelines',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    estSteps: 5,
    description: 'Build retrieval-augmented generation (RAG) agents with vector embeddings.',
    icon: Brain,
    affinity: 91,
  },
  {
    id: 's-lang',
    title: 'Conversational Spanish',
    category: 'Linguistics',
    difficulty: 'Beginner',
    estSteps: 6,
    description: 'Learn native phonetic models, core vocabulary, and conversational fluency.',
    icon: Languages,
    affinity: 86,
  },
];

interface SkillSuggestionsSectionProps {
  suggestions?: SkillSuggestion[];
  onEnrollSuggestion: (suggestion: SkillSuggestion) => void;
}

export function SkillSuggestionsSection({
  suggestions = DEFAULT_SUGGESTIONS,
  onEnrollSuggestion,
}: SkillSuggestionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
          <Sparkles className="w-4 h-4" />
        </span>
        <h2 className="text-lg font-bold text-slate-900">Recommended Skills to Learn</h2>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        AI-curated learning trajectories based on high-impact disciplines
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {item.affinity}% Match
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <span className="text-[11px] font-medium text-slate-400 block mb-2">
                  {item.category}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {item.estSteps} Progressive Steps
                </span>
                <button
                  type="button"
                  onClick={() => onEnrollSuggestion(item)}
                  className="text-xs font-bold text-[#0284C7] hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Enroll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillSuggestionsSection;
