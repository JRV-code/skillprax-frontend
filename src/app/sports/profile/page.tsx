'use client';

import React from 'react';
import { SportsNavigationHeader } from '@/components/sports/SportsNavigationHeader';
import { AthleteProfileView } from '@/components/sports/AthleteProfileView';
import { CinematicVideoBackground } from '@/components/CinematicVideoBackground';

export default function SportsProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative selection:bg-emerald-500 selection:text-white">
      <CinematicVideoBackground overlayOpacity={0.12} />
      <SportsNavigationHeader activeRole="athlete" />
      <main className="flex-1 relative z-10 pb-16">
        <AthleteProfileView />
      </main>
    </div>
  );
}
