'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Lock, Unlock, Award, CheckCircle2, 
  Calendar, FileText, Phone, Mail, Edit3, X, AlertTriangle,
  TrendingUp, Clock, Check, Plus, Trash2, ShieldCheck, Flame 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AthleteProfileView() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [auditList, setAuditList] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<{ ratings: any[]; attendance: any[] }>({ ratings: [], attendance: [] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'history'>('profile');

  // Edit form state
  const [editForm, setEditForm] = useState({
    sport: 'Football',
    secondarySports: ['Athletics', 'Basketball'],
    playingPosition: 'Forward / Winger',
    heightCm: 176,
    weightKg: 69,
    achievements: 'State Inter-District Silver Medalist 2025; Golden Boot Gandhinagar U-17 Cup',
    dateOfBirth: '2008-05-14',
    guardianName: 'Sanjay Patel',
    guardianPhone: '+91 98251 98765',
    guardianEmail: 'sanjay.patel@example.com',
  });

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    try {
      setLoading(true);
      const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const [profRes, auditRes, histRes] = await Promise.all([
        fetch(`/api/sports/athlete/profile?userId=${storedId}&sport=Football`),
        fetch(`/api/sports/athlete/audit?userId=${storedId}`),
        fetch(`/api/sports/athlete/history?userId=${storedId}`),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
          setEditForm({
            sport: pData.profile.sport || 'Football',
            secondarySports: pData.profile.secondarySports || ['Athletics'],
            playingPosition: pData.profile.playingPosition || 'Forward',
            heightCm: pData.profile.heightCm || 176,
            weightKg: pData.profile.weightKg || 69,
            achievements: pData.profile.achievements || '',
            dateOfBirth: pData.profile.dateOfBirth ? pData.profile.dateOfBirth.slice(0, 10) : '2008-05-14',
            guardianName: pData.profile.guardianName || '',
            guardianPhone: pData.profile.guardianPhone || '',
            guardianEmail: pData.profile.guardianEmail || '',
          });
        }
      }

      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditList(aData.auditList || []);
      }

      if (histRes.ok) {
        const hData = await histRes.json();
        setHistoryData({
          ratings: hData.ratings || [],
          attendance: hData.attendance || [],
        });
      }
    } catch (err) {
      console.warn('Failed to load athlete profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const res = await fetch('/api/sports/athlete/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedId,
          ...editForm,
        }),
      });

      if (res.ok) {
        setSaveNotice('Athlete profile and privacy credentials saved successfully.');
        setTimeout(() => setSaveNotice(null), 3500);
        setShowEditModal(false);
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAccess = async (requestId: string) => {
    try {
      const res = await fetch('/api/sports/athlete/revoke-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading verified athlete profile...</p>
      </div>
    );
  }

  const isMinor = profile?.isMinor ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Notice if Minor */}
      {isMinor && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Minor Protection Gate Active (&lt; 18 Years):</span> All private biomechanics (height, weight, medical records, and certificates) are strictly locked. Clubs require explicit Guardian Approval via OTP before viewing private metrics.
          </div>
        </div>
      )}

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-700 flex items-center justify-center text-white font-black text-3xl shadow-md border-2 border-white">
              {profile?.userName ? profile.userName.slice(0, 2).toUpperCase() : 'AT'}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider border-2 border-white">
              Verified
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                {profile?.userName || 'Registered Athlete'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold font-mono">
                {profile?.sport || 'Football'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {profile?.playingPosition || 'Forward'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
              <span>City: Gandhinagar / Ahmedabad</span>
              <span>•</span>
              <span>DOB: {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'May 2008'}</span>
              <span>•</span>
              <span className="font-bold text-emerald-700">{isMinor ? 'Minor Protection Active' : 'Senior Athlete'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-heading font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Sports Profile</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'profile', label: 'Physical Biometrics & Certificates' },
          { id: 'privacy', label: 'Accept-to-Unlock Audit Table' },
          { id: 'history', label: 'Performance Notes & Rating Tracker' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PHYSICAL BIOMETRICS & PRIVACY SHIELD PREVIEW */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Biometric Stats */}
          <div className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                PHYSICAL ATTRIBUTES
              </span>
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Height</span>
                <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {profile?.heightCm || 176} cm
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Weight</span>
                <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {profile?.weightKg || 69} kg
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Secondary Sports</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(profile?.secondarySports || ['Athletics', 'Basketball']).map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {isMinor && (
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Guardian Contact:</span>
                <p className="text-slate-800 font-semibold">{profile?.guardianName || 'Sanjay Patel'}</p>
                <p className="text-slate-500 font-mono text-[11px]">{profile?.guardianPhone || '+91 98251 98765'}</p>
              </div>
            )}
          </div>

          {/* Card 2: Certificates & Licenses */}
          <div className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md">
                VERIFIED CREDENTIALS
              </span>
              <Award className="w-4 h-4 text-sky-600" />
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'District Sports Authority License', year: 2025, status: 'Verified' },
                { title: 'State Football Federation Medical Clearance', year: 2024, status: 'Active' },
                { title: 'Level 1 Junior Athlete Certificate', year: 2024, status: 'Verified' },
              ].map((cert, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{cert.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Issued: {cert.year}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Notable Achievements</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {profile?.achievements || 'State Inter-District Silver Medalist 2025; Golden Boot Gandhinagar U-17 Cup'}
              </p>
            </div>
          </div>

          {/* Card 3: Privacy Simulation Preview (What Unapproved Clubs See) */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md">
                PRIVACY SHIELD PREVIEW
              </span>
              <Lock className="w-4 h-4 text-amber-600" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When an unverified or pending club looks up your profile, private metrics are blurred with our <strong>Accept-to-Unlock</strong> protocol:
            </p>

            {/* Blurred Mockup */}
            <div className="relative p-4 rounded-2xl bg-white border border-slate-200 overflow-hidden space-y-2 select-none">
              <div className="filter blur-[4px] pointer-events-none space-y-2 opacity-50">
                <p className="text-xs font-bold">Height: 176 cm • Weight: 69 kg</p>
                <p className="text-xs">Medical: Fitness Level 100%</p>
                <p className="text-xs">Guardian: Sanjay Patel • +91 98251 98765</p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[2px] p-2 text-center">
                <Lock className="w-5 h-5 text-slate-700 mb-1" />
                <span className="text-[11px] font-bold text-slate-900">Metrics Locked</span>
                <span className="text-[9px] text-slate-600">Requires Accepted Scouting Request</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              ✓ Full data remains accessible to you and clubs with explicit consent.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCEPT-TO-UNLOCK AUDIT TABLE */}
      {activeTab === 'privacy' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-black text-slate-900">
                Club Access Audit & Permission Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Live list of sports academies with scouting permissions. You can revoke access anytime with immediate effect.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4 font-bold">Club / Academy Name</th>
                  <th className="py-3 px-4 font-bold">City</th>
                  <th className="py-3 px-4 font-bold">Access Level</th>
                  <th className="py-3 px-4 font-bold">Approved Date</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {auditList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No clubs currently have private access to your profile.
                    </td>
                  </tr>
                ) : (
                  auditList.map((aud, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {aud.clubName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {aud.clubCity || 'Gandhinagar'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          aud.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {aud.status === 'accepted' ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                          <span>{aud.accessLevel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {aud.approvedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {aud.status === 'accepted' ? (
                          <button
                            onClick={() => handleRevokeAccess(aud.requestId)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No access</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY & RATING TRACKER (RATING-OVER-TIME CHART) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Interactive Rating-Over-Time Graph Card */}
          <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  PROGRESSION TELEMETRY
                </span>
                <h3 className="text-lg font-heading font-black text-slate-900 mt-1">
                  Official Club Rating-over-Time Progression
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated from verified post-trial club evaluations and match performance assessments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Latest Level Rating:</span>
                <span className="text-2xl font-black font-mono text-emerald-600">
                  {historyData.ratings[historyData.ratings.length - 1]?.overallRating || 4.4} / 5.0
                </span>
              </div>
            </div>

            {/* SVG Visual Line Graph */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
              <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2">
                {historyData.ratings.map((r, idx) => {
                  const heightPercent = (r.overallRating / 5) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-bold font-mono text-slate-700 opacity-80 group-hover:opacity-100 transition-opacity">
                        {r.overallRating}★
                      </div>
                      <div className="w-full max-w-[48px] bg-slate-200 rounded-xl overflow-hidden h-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.15 }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl shadow-xs"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[70px]">
                        {r.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Metric Baseline: 1.0 (Beginner)</span>
                <span>Target: 5.0 (National Academy Prospect)</span>
              </div>
            </div>

            {/* Trial Outcomes & Verified Coach Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Verified Coach Trial Feedback
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {historyData.ratings.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{r.clubName}</span>
                      <span className="text-emerald-600 font-mono">{r.overallRating} ★</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "{r.notes}"
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                      <span>Tech: {r.technicalScore || 80}</span>
                      <span>•</span>
                      <span>Agility: {r.agilityScore || 85}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl shadow-2xl overflow-hidden my-8"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Edit Athletic Profile & Biometrics</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Primary Sport</label>
                    <input
                      type="text"
                      value={editForm.sport}
                      onChange={(e) => setEditForm({ ...editForm, sport: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Playing Position</label>
                    <input
                      type="text"
                      value={editForm.playingPosition}
                      onChange={(e) => setEditForm({ ...editForm, playingPosition: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Height (cm)</label>
                    <input
                      type="number"
                      value={editForm.heightCm}
                      onChange={(e) => setEditForm({ ...editForm, heightCm: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Weight (kg)</label>
                    <input
                      type="number"
                      value={editForm.weightKg}
                      onChange={(e) => setEditForm({ ...editForm, weightKg: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Notable Achievements</label>
                  <textarea
                    rows={2}
                    value={editForm.achievements}
                    onChange={(e) => setEditForm({ ...editForm, achievements: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                {/* Minor Details if DOB under 18 */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Minor Protection Contacts (Required if under 18)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Guardian Name"
                      value={editForm.guardianName}
                      onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                    <input
                      type="tel"
                      placeholder="Guardian Phone"
                      value={editForm.guardianPhone}
                      onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Guardian Email"
                      value={editForm.guardianEmail}
                      onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
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

export default AthleteProfileView;
