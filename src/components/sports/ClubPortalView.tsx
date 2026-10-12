'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Search, Send, Star, Shield, 
  Calendar, CheckCircle2, AlertCircle, Plus, Edit2, 
  MapPin, Clock, Award, Phone, Check, X, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ClubPortalView() {
  const [activeTab, setActiveTab] = useState<'roster' | 'scout' | 'rating' | 'announcements'>('roster');
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);

  // Active Club State
  const [clubInfo, setClubInfo] = useState({
    id: 'club-gfa-1',
    clubName: 'Gandhinagar Football Academy',
    sportsOffered: ['Football'],
    city: 'Gandhinagar',
    isVerified: true,
    monthlyFee: 2500,
  });

  // Scouting Request Modal State
  const [scoutingModalOpen, setScoutingModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<any | null>(null);
  const [scoutingMessage, setScoutingMessage] = useState('We would like to invite you to our official selection trial session.');
  const [trialDate, setTrialDate] = useState('2026-10-25');
  const [scoutSuccessNotice, setScoutSuccessNotice] = useState<string | null>(null);

  // Player Rating Form State
  const [ratingPlayerId, setRatingPlayerId] = useState<string>('player-1');
  const [overallRating, setOverallRating] = useState<number>(4);
  const [technicalScore, setTechnicalScore] = useState<number>(85);
  const [agilityScore, setAgilityScore] = useState<number>(88);
  const [coachNotes, setCoachNotes] = useState<string>('High agility, exceptional tactical awareness, and smooth passing vision.');
  const [ratingSuccessNotice, setRatingSuccessNotice] = useState<string | null>(null);

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementNotice, setAnnouncementNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchProspects();
    fetchRoster();
  }, []);

  async function fetchProspects() {
    try {
      const res = await fetch('/api/sports/clubs/players-near-me?sport=Football');
      if (res.ok) {
        const data = await res.json();
        setProspects(data.players || []);
      }
    } catch (err) {
      console.warn('Failed to fetch prospects:', err);
    }
  }

  async function fetchRoster() {
    try {
      // Default sample roster items if empty
      setRoster([
        {
          id: 'ros-1',
          name: 'Manendra Patel',
          sport: 'Football',
          playingPosition: 'Forward',
          heightCm: 176,
          weightKg: 69,
          guardianName: 'Sanjay Patel',
          guardianPhone: '+91 98251 98765',
          status: 'Full Private Access Unlocked',
        },
        {
          id: 'ros-2',
          name: 'Aarav Shah',
          sport: 'Football',
          playingPosition: 'Midfielder',
          heightCm: 172,
          weightKg: 64,
          guardianName: 'Bhavin Shah',
          guardianPhone: '+91 97120 11223',
          status: 'Full Private Access Unlocked',
        },
      ]);
    } catch (err) {
      console.warn('Failed to fetch roster:', err);
    }
  }

  const handleSendScoutingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspect) return;

    try {
      const res = await fetch('/api/sports/scouting/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.id,
          playerId: selectedProspect.userId || selectedProspect.id,
          message: scoutingMessage,
          trialDate: new Date(trialDate).toISOString(),
        }),
      });

      if (res.ok) {
        setScoutSuccessNotice(`Scouting Invitation successfully dispatched to ${selectedProspect.name}.`);
        setTimeout(() => setScoutSuccessNotice(null), 4000);
        setScoutingModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sports/clubs/rate-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.id,
          playerId: ratingPlayerId,
          overallRating,
          technicalScore,
          agilityScore,
          notes: coachNotes,
        }),
      });

      if (res.ok) {
        setRatingSuccessNotice('Player evaluation recorded. Telemetry graph updated for player.');
        setTimeout(() => setRatingSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementNotice('Trial Announcement broadcasted to 240+ local registered athletes in Gandhinagar.');
    setAnnouncementText('');
    setTimeout(() => setAnnouncementNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Verification Status Banner */}
      {clubInfo.isVerified ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Accredited Academy Portal:</span>
            <span>Registration Certificate & AFC Head Coach credentials verified. Public discovery active.</span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
            Live on Map
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span className="font-bold">Pending Admin Verification:</span>
          <span>Your academy credentials are in review by SKILL-TRACK admins. Hidden from public discovery.</span>
        </div>
      )}

      {scoutSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{scoutSuccessNotice}</span>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Building2 className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-black text-slate-900">
                {clubInfo.clubName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                AFC Accredited
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Sector 21 Stadium Grounds • City: {clubInfo.city} • Active Roster: {roster.length} Athletes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Monthly Admission:</span>
          <span className="text-lg font-black font-mono text-emerald-700">₹{clubInfo.monthlyFee}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'roster', label: 'My Roster (Accepted Athletes)' },
          { id: 'scout', label: 'Talent Discovery ("Players Near Me")' },
          { id: 'rating', label: 'Post-Trial Player Rating Form' },
          { id: 'announcements', label: 'Broadcast Trial Announcements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MY ROSTER */}
      {activeTab === 'roster' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-black text-slate-900">
                Registered & Accepted Players Roster
              </h3>
              <p className="text-xs text-slate-500">
                Full biometric metrics and guardian emergency contacts unlocked via mutual Accept-to-Unlock consent.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roster.map((player) => (
              <div key={player.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{player.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{player.sport} • Position: {player.playingPosition}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Consent Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Height</span>
                    <p className="font-bold text-slate-800 font-mono">{player.heightCm} cm</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Weight</span>
                    <p className="font-bold text-slate-800 font-mono">{player.weightKg} kg</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Guardian Emergency:</span>
                  <p className="font-semibold text-slate-800">{player.guardianName} ({player.guardianPhone})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TALENT DISCOVERY & SCOUTING */}
      {activeTab === 'scout' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-black text-slate-900">
                Talent Discovery Feed ("Players Near Me")
              </h3>
              <p className="text-xs text-slate-500">
                Public profile view only. Private biometrics unlock only upon player and guardian consent.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prospects.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                      {p.sport}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {p.city}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">{p.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">Position: {p.playingPosition}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-400 italic">
                    🔒 Biometric metrics (Height, Weight, Medical) locked until scouting approval.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedProspect(p);
                    setScoutingModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Scouting Request</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: POST-TRIAL PLAYER RATING FORM */}
      {activeTab === 'rating' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-heading font-black text-slate-900">
              Official Post-Trial Player Evaluation Form
            </h3>
            <p className="text-xs text-slate-500">
              Submit structured evaluation after a trial session. Automatically graphs in the athlete's Progression Telemetry.
            </p>
          </div>

          {ratingSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{ratingSuccessNotice}</span>
            </div>
          )}

          <form onSubmit={handlePostRating} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block">Select Trial Player</label>
              <select
                value={ratingPlayerId}
                onChange={(e) => setRatingPlayerId(e.target.value)}
                className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-medium"
              >
                <option value="player-1">Manendra Patel (Forward)</option>
                <option value="player-2">Aarav Shah (Midfielder)</option>
                <option value="default-profile">Prospect Candidate #1</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Overall Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={overallRating}
                  onChange={(e) => setOverallRating(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block">Technical Score (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={technicalScore}
                  onChange={(e) => setTechnicalScore(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block">Agility Score (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={agilityScore}
                  onChange={(e) => setAgilityScore(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block">Verified Coach Notes & Diagnostics</label>
              <textarea
                rows={3}
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Submit Official Trial Evaluation
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: BROADCAST ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-heading font-black text-slate-900">
              Broadcast Trial & Tournament Announcements
            </h3>
            <p className="text-xs text-slate-500">
              Dispatches notifications directly to all local athletes registered in Gandhinagar / Ahmedabad.
            </p>
          </div>

          {announcementNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{announcementNotice}</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
            <textarea
              rows={4}
              placeholder="e.g., Open U-17 Selection Trials scheduled this Saturday at Sector 21 Stadium Grounds. Bring registration cards."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs"
              required
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Broadcast Announcement to Local Athletes
            </button>
          </form>
        </div>
      )}

      {/* SCOUTING MODAL */}
      <AnimatePresence>
        {scoutingModalOpen && selectedProspect && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Issue Scouting Invitation</h3>
                <button onClick={() => setScoutingModalOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-xs">
                <p className="font-bold text-slate-800">Target Athlete: {selectedProspect.name}</p>
                <span className="text-slate-500 font-mono">Sport: {selectedProspect.sport} ({selectedProspect.playingPosition})</span>
              </div>

              <form onSubmit={handleSendScoutingRequest} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Proposed Trial Date</label>
                  <input
                    type="date"
                    value={trialDate}
                    onChange={(e) => setTrialDate(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block">Invitation Message</label>
                  <textarea
                    rows={3}
                    value={scoutingMessage}
                    onChange={(e) => setScoutingMessage(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setScoutingModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Send Scouting Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClubPortalView;
