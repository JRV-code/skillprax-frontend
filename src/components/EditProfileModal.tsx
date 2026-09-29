'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Clock,
  Bell,
  Sparkles,
  Check,
  ChevronUp,
  ChevronDown,
  Camera,
} from 'lucide-react';

import { UserProfile } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: any) => void;
  onOpenAdmin?: () => void;
}

const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    label: 'Scholar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Developer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Scientist',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Athlete',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Engineer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onOpenAdmin,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState((userProfile.age || 18).toString());
  const [profession, setProfession] = useState(userProfile.profession || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || AVATAR_PRESETS[0].url);
  const [targetHours, setTargetHours] = useState(userProfile.targetHours || 1);
  const [targetMinutes, setTargetMinutes] = useState(userProfile.targetMinutes || 0);
  const [reminderTime, setReminderTime] = useState(userProfile.dailyReminderTime || '20:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile.notificationsEnabled ?? true);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (profession.trim().toLowerCase() === '/admin') {
      if (onOpenAdmin) onOpenAdmin();
      onClose();
      return;
    }

    onUpdateProfile({
      name: name.trim() || userProfile.name,
      age: parseInt(age, 10) || userProfile.age,
      profession: profession.trim() || userProfile.profession,
      avatarUrl: avatarUrl || userProfile.avatarUrl,
      targetHours: Math.max(0, Math.min(24, targetHours)),
      targetMinutes: Math.max(0, Math.min(59, targetMinutes)),
      dailyReminderTime: reminderTime,
      notificationsEnabled,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  const handleHourSpin = (delta: number) => {
    setTargetHours((prev) => Math.max(0, Math.min(24, prev + delta)));
  };

  const handleMinSpin = (delta: number) => {
    setTargetMinutes((prev) => {
      const next = prev + delta;
      if (next < 0) return 55;
      if (next > 55) return 0;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md view-transition-enter overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-emerald-200/90 ring-1 ring-black/5 my-8 max-h-[92vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Learner Profile Settings
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                EDIT INTERFACE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your identity, academic goals, daily cadence, and telemetry targets
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Profile Avatar
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Active Avatar Preview with Glow */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 blur-sm opacity-60 animate-pulse" />
                <img
                  src={avatarUrl}
                  alt="Profile Preview"
                  className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute bottom-0 right-0 p-1 bg-emerald-600 text-white rounded-full border-2 border-white shadow-xs">
                  <Check className="w-3 h-3" />
                </span>
              </div>

              {/* Presets List */}
              <div className="flex-1">
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Select a preset persona:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-[11px] text-slate-600 hover:text-emerald-700 hover:border-emerald-400 bg-white font-medium flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Custom URL</span>
                  </button>
                </div>

                {showCustomInput && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="url"
                      value={customAvatarInput}
                      onChange={(e) => setCustomAvatarInput(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarInput.trim()) {
                          setAvatarUrl(customAvatarInput.trim());
                          setCustomAvatarInput('');
                          setShowCustomInput(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Manendra Patel"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="10"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Profession / Academic Track */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Profession / Academic Focus
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Hint: Type <code className="bg-slate-100 text-emerald-700 px-1 py-0.5 rounded">/admin</code> for Master Console
              </span>
            </div>
            <input
              type="text"
              value={profession}
              onChange={(e) => {
                setProfession(e.target.value);
                if (e.target.value.trim().toLowerCase() === '/admin') {
                  if (onOpenAdmin) onOpenAdmin();
                  onClose();
                }
              }}
              placeholder="e.g. Class 12 Student (NEET / JEE Advanced)"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900"
            />
          </div>

          {/* Daily Study Target (Dual Spin Controls) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Daily Target Study Cadence
              </label>
              <span className="text-xs font-bold font-mono text-emerald-800">
                {targetHours}h {targetMinutes}m per day
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Target Hours (0 - 24)
                </span>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={targetHours}
                    onChange={(e) => setTargetHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-sm font-bold text-slate-900 text-center focus:outline-none"
                  />
                  <div className="flex flex-col ml-2">
                    <button
                      type="button"
                      onClick={() => handleHourSpin(1)}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 active:scale-90 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHourSpin(-1)}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 active:scale-90 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Minutes (0 - 59)
                </span>
                <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-sm font-bold text-slate-900 text-center focus:outline-none"
                  />
                  <div className="flex flex-col ml-2">
                    <button
                      type="button"
                      onClick={() => handleMinSpin(5)}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 active:scale-90 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMinSpin(-5)}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 active:scale-90 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Schedule & Notification Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Daily Study Reminder Notification
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive autonomous checkpoint reminder at specified time
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Live Preview Card Mini-Strip */}
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Preview: <strong>{name || 'Learner'}</strong> ({profession || 'Student'})</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">
              {userProfile.flameStreak || 7}d 🔥 | {userProfile.activeFreezes || 1}🧊
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-emerald-500/25 btn-tactile btn-shimmer cursor-pointer flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <span>Save Profile Changes</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
