'use client';

import React from 'react';
import { Flame, ShieldCheck, Target, Clock, X, BarChart3, TrendingUp } from 'lucide-react';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: {
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
  };
  telemetry: {
    todayMinutes: number;
    todayHours: number;
    targetDailyMinutes: number;
    targetDailyHours: number;
    goalCompleted: boolean;
    history: Array<{ date: string; day: string; minutes: number; hours: number }>;
  };
}

export function TelemetryModal({ isOpen, onClose, streak, telemetry }: TelemetryModalProps) {
  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((telemetry.todayMinutes / Math.max(telemetry.targetDailyMinutes, 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#071026] border border-blue-900/60 rounded-2xl w-full max-w-xl p-6 shadow-[0_0_50px_rgba(37,99,235,0.2)] relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <BarChart3 className="w-5 h-5"/>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Telemetry & Mastery Velocity
              </h2>
              <p className="text-[11px] text-blue-300/70 font-mono">Autonomous Competency Telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Streak & Freeze Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-blue-950/40 to-[#071026] border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse"/> Streak
              </span>
              <span className="font-mono text-slate-400">Best: {streak.longestStreak}d</span>
            </div>
            <div className="py-2">
              <span className="text-4xl font-black font-mono text-white">{streak.currentStreak}</span>
              <span className="text-xs font-bold text-amber-400 ml-1.5">DAYS</span>
            </div>
            <p className="text-[11px] text-slate-400">Daily evaluation continuity</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400"/> Shield
              </span>
              <span className="font-mono text-xs text-amber-400/90">{streak.streakFreezes > 0 ? 'Active' : 'Unearned'}</span>
            </div>
            <div className="py-2">
              <span className="text-2xl font-black text-white">{streak.streakFreezes > 0 ? '1 Freeze 🧊' : '0 Freezes'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {streak.streakFreezes > 0 ? 'Shield auto-protects 1 missed day' : 'Unlocked after 7-day streak'}
            </p>
          </div>
        </div>

        {/* Today's Target Hours */}
        <div className="p-4 rounded-xl bg-[#0a1535] border border-blue-900/50 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400"/> Daily Goal: {telemetry.targetDailyHours} Hours
            </span>
            <span className="font-mono text-amber-400 font-bold">{telemetry.todayHours} hrs logged</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-blue-950">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="p-4 rounded-xl bg-[#0a1535]/60 border border-blue-900/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-200 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400"/> 7-Day Study Cadence
            </span>
            <span className="font-mono text-[11px]">Hours / Day</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-24 pt-2">
            {telemetry.history.map((day, idx) => {
              const hPercent = Math.min(100, Math.max(12, Math.round((day.minutes / Math.max(telemetry.targetDailyMinutes, 60)) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-amber-400/90">{day.hours > 0 ? day.hours : ''}</span>
                  <div className="w-full bg-slate-900/90 rounded-md overflow-hidden h-16 flex items-end border border-blue-900/30">
                    <div
                      className={`w-full transition-all duration-300 ${
                        day.minutes >= telemetry.targetDailyMinutes
                          ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : day.minutes > 0
                          ? 'bg-blue-500'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${hPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-blue-300/70">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
