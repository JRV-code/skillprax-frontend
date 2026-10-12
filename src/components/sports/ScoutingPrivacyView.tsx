'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Inbox, UserCheck, Lock } from 'lucide-react';
import SportsInboxView from './SportsInboxView';
import { AthleteProfileView } from './AthleteProfileView';

export function ScoutingPrivacyView() {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'ratings'>('requests');

  return (
    <div className="space-y-6">
      {/* Top Toggle Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Scouting Requests & Minor Privacy Shield</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept or decline academy trial invitations under guardian verification, and track historical evaluation ratings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-sky-600" />
            <span>Scouting Requests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ratings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'ratings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ratings & Privacy</span>
          </button>
        </div>
      </div>

      {/* Content View */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'requests' ? (
          <motion.div
            key="scouting-inbox"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <SportsInboxView />
          </motion.div>
        ) : (
          <motion.div
            key="athlete-ratings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <AthleteProfileView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScoutingPrivacyView;
