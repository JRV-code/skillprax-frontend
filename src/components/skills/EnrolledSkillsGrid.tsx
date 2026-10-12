'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Plus, ArrowRight } from 'lucide-react';

export interface EnrolledSkill {
  id: string;
  skill_name: string;
  sub_genre: string;
  current_step: number;
  total_steps: number;
  category: string;
}

interface EnrolledSkillsGridProps {
  skills: EnrolledSkill[];
  isLoading: boolean;
  onEnrollClick: () => void;
}

export function EnrolledSkillsGrid({
  skills,
  isLoading,
  onEnrollClick,
}: EnrolledSkillsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center mb-4 border border-sky-100">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No skill enrolled yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          You haven't enrolled in any cognitive or technical skills yet. Browse the suggestions below or enroll now to get started!
        </p>
        <button
          type="button"
          onClick={onEnrollClick}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 shadow-md shadow-sky-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll Now to Get Started</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-[#0284C7]">
                {skill.sub_genre || 'General Track'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Step {skill.current_step} of {skill.total_steps}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#0284C7] transition-colors">
              {skill.skill_name}
            </h3>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(10, (skill.current_step / (skill.total_steps || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <Link
            href={`/workspace?skillId=${skill.id}`}
            className="mt-6 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 transition-all shadow-xs"
          >
            <span>Launch Step Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default EnrolledSkillsGrid;
