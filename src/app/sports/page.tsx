'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  MapPin, 
  ShoppingBag, 
  Bus, 
  ShieldCheck, 
  Building2, 
  Timer, 
  Flame, 
  Sparkles 
} from 'lucide-react';

import { SportsTrainingView } from '@/components/sports/SportsTrainingView';
import { ClubsNearMeView } from '@/components/sports/ClubsNearMeView';
import { SportsDealsView } from '@/components/sports/SportsDealsView';
import { ManagedTravelView } from '@/components/sports/ManagedTravelView';
import { ScoutingPrivacyView } from '@/components/sports/ScoutingPrivacyView';
import { ClubPortalView } from '@/components/sports/ClubPortalView';
import { Navbar } from '@/components/common/Navbar';

type SportsTab = 'training' | 'clubs' | 'shop' | 'travel' | 'scouting' | 'club-portal';

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportsTab>('training');

  const navItems = [
    { id: 'training', label: 'Training & Drills', icon: Timer, count: null },
    { id: 'clubs', label: 'Clubs Near Me', icon: MapPin, count: 'Live Map' },
    { id: 'shop', label: 'Sports Gear Deals', icon: ShoppingBag, count: 'Real Deals' },
    { id: 'travel', label: 'Managed Travel', icon: Bus, count: null },
    { id: 'scouting', label: 'Scouting & Privacy', icon: ShieldCheck, count: 'Protected' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Universal Top Tri-Separation Navbar */}
      <Navbar />

      {/* Top Banner / Hero Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 pt-8 pb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                ATHLETICS & KINETICS ECOSYSTEM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Maidan Engine
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Athletic Performance & Club Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Discover verified sports academies, manage training drills with countdown timers, book vetted athlete transit, and unlock scouting opportunities under minor protection gates.
            </p>
          </div>

          {/* Right Action: Club Portal Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === 'club-portal' ? 'training' : 'club-portal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                activeTab === 'club-portal'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
              }`}
            >
              <Building2 className="w-4 h-4"/>
              <span>{activeTab === 'club-portal' ? 'Back to Athlete View' : 'Switch to Club Portal'}</span>
            </button>
          </div>
        </div>

        {/* Translucent Glassmorphic Sub-Navigation Bar */}
        {activeTab !== 'club-portal' && (
          <div className="max-w-7xl mx-auto mt-8">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/70 backdrop-blur-md scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SportsTab)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-[#0284C7] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSportsTabPill"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284C7]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.count && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive 
                            ? 'bg-sky-50 text-[#0284C7]' 
                            : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Tab View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SportsTrainingView/>
            </motion.div>
          )}

          {activeTab === 'clubs' && (
            <motion.div
              key="clubs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClubsNearMeView/>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SportsDealsView/>
            </motion.div>
          )}

          {activeTab === 'travel' && (
            <motion.div
              key="travel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ManagedTravelView/>
            </motion.div>
          )}

          {activeTab === 'scouting' && (
            <motion.div
              key="scouting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ScoutingPrivacyView/>
            </motion.div>
          )}

          {activeTab === 'club-portal' && (
            <motion.div
              key="club-portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClubPortalView/>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
