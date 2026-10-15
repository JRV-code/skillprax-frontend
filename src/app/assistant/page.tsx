'use client';

import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { SkillTrackAiHub } from '@/components/assistant/SkillTrackAiHub';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Universal Top Navigation with the 4th Section (AI Guide) */}
      <Navbar />

      {/* Main AI Guide & Mentor Hub */}
      <SkillTrackAiHub />
    </div>
  );
}
