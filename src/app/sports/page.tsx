'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  MapPin, 
  ShoppingBag, 
  Users2, 
  Sparkles, 
  Compass 
} from 'lucide-react';

import { SportsTrainingView } from '@/components/sports/SportsTrainingView';
import { ClubsNearMeView } from '@/components/sports/ClubsNearMeView';
import { SportsShopView } from '@/components/sports/SportsShopView';
import { Navbar } from '@/components/common/Navbar';

export type SportsTab = 'training' | 'clubs' | 'shop';
export type AgeCategory = 'ALL' | 'U14' | 'U17' | 'U19' | 'OPEN';

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<SportsTab>('training');
  const [selectedAge, setSelectedAge] = useState<AgeCategory>('U17');

  const navItems = [
    { id: 'training', label: 'Conditioning, Drills & Yogasanas', icon: Timer, badge: 'Step Engine' },
    { id: 'clubs', label: 'Clubs Near Me', icon: MapPin, badge: 'Live Map' },
    { id: 'shop', label: 'Sports Gear & Local Stores', icon: ShoppingBag, badge: 'Deals' },
  ];

  const ageCategories: { id: AgeCategory; label: string; desc: string }[] = [
    { id: 'ALL', label: 'All Ages', desc: 'Any age category' },
    { id: 'U14', label: 'Under 14 (U-14)', desc: 'Junior Sub-Cadet' },
    { id: 'U17', label: 'Under 17 (U-17)', desc: 'Cadet & School' },
    { id: 'U19', label: 'Under 19 (U-19)', desc: 'Junior District/State' },
    { id: 'OPEN', label: 'Open / Senior', desc: 'Collegiate & Amateur' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Universal Top Navbar */}
      <Navbar />

      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 pt-8 pb-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                ATHLETICS & SPORTS ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Real-Time Data
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Athletic Performance & Sports Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Access sport-specific training drills with countdown timers, locate real academies in your city on Google Maps, and discover direct gear deals.
            </p>
          </div>

          {/* Age Category Selector */}
          <div className="bg-slate-100/80 p-2 rounded-2xl border border-slate-200/90 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-emerald-600" />
                Age Category Preference
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Active Filter
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm flex-wrap sm:flex-nowrap">
              {ageCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedAge(cat.id)}
                  title={cat.desc}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedAge === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Tab Glassmorphic Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/70 backdrop-blur-md overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SportsTab)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'text-[#0284C7]'
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
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive 
                          ? 'bg-sky-50 text-[#0284C7]' 
                          : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab View Rendering */}
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
              <SportsTrainingView ageCategory={selectedAge} />
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
              <ClubsNearMeView ageCategory={selectedAge} />
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
              <SportsShopView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
