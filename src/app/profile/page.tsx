'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Edit3, 
  X, 
  ArrowLeft, 
  Loader2, 
  Target 
} from 'lucide-react';

interface ProfileData {
  profile: {
    name: string;
    age: number;
    profession: string;
    joinedAt: string;
    tenureText: string;
  };
  stats: {
    totalSkills: number;
    skillsInProgress: number;
    skillsMastered: number;
    totalMilestonesPassed: number;
  };
  skillCards: Array<{
    id: string;
    title: string;
    domainCategory: string;
    targetGoal: string;
    level: string;
    totalSteps: number;
    completedSteps: number;
    currentStep: number;
    progress: number;
    isMastered: boolean;
  }>;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(18);
  const [formProfession, setFormProfession] = useState('');
  const [saving, setSaving] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setFormName(json.profile.name);
        setFormAge(json.profile.age);
        setFormProfession(json.profile.profession);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          age: Number(formAge),
          profession: formProfession,
        }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        await fetchProfile();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400"/>
      </div>
    );
  }

  const { profile, stats, skillCards } = data || {
    profile: { name: 'Learner', age: 18, profession: 'Student', tenureText: 'Active recently', joinedAt: '' },
    stats: { totalSkills: 0, skillsInProgress: 0, skillsMastered: 0, totalMilestonesPassed: 0 },
    skillCards: [],
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
          <Link className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition" href="/">
            <ArrowLeft className="w-4 h-4"/> Back to Dashboard
          </Link>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12151F] border border-[#1E2436] text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/50 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400"/> Edit Profile
          </button>
        </div>

        {/* User Profile Identity Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#12151F] border border-[#1E2436] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
              <User className="w-8 h-8"/>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#090A0F] text-slate-300 border border-[#1E2436]">
                  {profile.age} yrs
                </span>
              </div>
              <p className="text-sm text-cyan-400 font-semibold mt-0.5">{profile.profession}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500"/>
                <span>{profile.tenureText}</span>
              </div>
            </div>
          </div>

          {/* Quick Aggregate Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-center min-w-[100px]">
              <span className="text-xl font-black font-mono text-cyan-400">{stats.skillsInProgress}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Learning</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-center min-w-[100px]">
              <span className="text-xl font-black font-mono text-emerald-400">{stats.skillsMastered}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Mastered</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-[#1E2436] text-center min-w-[100px]">
              <span className="text-xl font-black font-mono text-amber-400">{stats.totalMilestonesPassed}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Milestones</span>
            </div>
          </div>
        </div>

        {/* Detailed Skill Tracks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2436] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400"/> All Enrolled Skills ({skillCards.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Competency Telemetry</span>
          </div>

          {skillCards.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-[#12151F] border border-[#1E2436] text-slate-400">
              <p className="text-sm">No skills enrolled yet.</p>
              <Link className="inline-block mt-3 text-xs text-cyan-400 hover:underline" href="/">
                Create your first track from Dashboard &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skillCards.map((track) => (
                <div
                  key={track.id}
                  className="p-5 rounded-2xl bg-[#12151F] border border-[#1E2436] hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
                        STEP {track.currentStep} / {track.totalSteps}
                      </span>
                      {track.isMastered ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3"/> Mastered
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#090A0F] text-slate-300 border border-[#1E2436]">
                          {track.level}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">{track.title}</h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                      <Target className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5"/>
                      <span>{track.targetGoal}</span>
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#1E2436]">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Mastery Progress</span>
                        <span className="font-mono text-cyan-400 font-semibold">{track.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#090A0F] rounded-full overflow-hidden border border-[#1E2436]">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                    </div>

                    <Link className="w-full py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all" href={`/workspace/${track.id}`}>
                      <span>Launch Studio</span>
                      <ArrowRight className="w-3.5 h-3.5"/>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12151F] border border-[#1E2436] rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2436]">
                <h3 className="text-base font-bold text-white">Edit Profile</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    required
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Profession / Role</label>
                  <input
                    type="text"
                    required
                    value={formProfession}
                    onChange={(e) => setFormProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0F] border border-[#1E2436] text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#1E2436]">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#090A0F] text-xs text-slate-400 hover:text-white border border-[#1E2436]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
