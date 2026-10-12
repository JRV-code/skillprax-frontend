'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Check, Camera, Clock, Bell, Sparkles, ChevronUp, ChevronDown, User, Mail, GraduationCap,
  Apple, HeartPulse, Globe
} from 'lucide-react';
import { UserProfile } from '@/types';

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'];
const MEDICAL_CHIPS = [
  'None / Fully Fit',
  'Asthma / Respiratory Strain',
  'Knee / ACL Sensitivity',
  'Lower Back Strain',
  'High Blood Pressure',
];
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English (Default)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'de', label: 'German (Deutsch)' },
];

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
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

const PROFESSION_OPTIONS = [
  'Student',
  'Software Engineer',
  'Healthcare Professional',
  'Designer',
  'Educator',
  'Entrepreneur',
  'Other',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email || '');
  const [gender, setGender] = useState<string>(userProfile.gender || 'Prefer not to say');
  const [age, setAge] = useState((userProfile.age || 18).toString());
  const [dateOfBirth, setDateOfBirth] = useState<string>((userProfile as any).dateOfBirth || (userProfile as any).date_of_birth || '');
  const [guardianName, setGuardianName] = useState<string>((userProfile as any).guardianName || (userProfile as any).guardian_name || '');
  const [guardianPhone, setGuardianPhone] = useState<string>((userProfile as any).guardianPhone || (userProfile as any).guardian_phone || '');
  const [guardianEmail, setGuardianEmail] = useState<string>((userProfile as any).guardianEmail || (userProfile as any).guardian_email || '');
  
  // Profession states
  const initialProfBase = PROFESSION_OPTIONS.includes(userProfile.profession || '')
    ? userProfile.profession || 'Student'
    : userProfile.profession?.includes('Student')
    ? 'Student'
    : 'Other';
  const [selectedProfession, setSelectedProfession] = useState<string>(initialProfBase);
  const [customProfession, setCustomProfession] = useState<string>(
    initialProfBase === 'Other' ? userProfile.profession || '' : ''
  );
  const [educationBoard, setEducationBoard] = useState(userProfile.educationBoard || 'CBSE');
  const [grade, setGrade] = useState(userProfile.grade || 'Class 12');

  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || AVATAR_PRESETS[0].url);
  const [dietaryPreference, setDietaryPreference] = useState<string>(userProfile.dietaryPreference || 'Vegetarian');
  const [medicalConditions, setMedicalConditions] = useState<string>(userProfile.medicalConditions || 'None');
  const [preferredLanguage, setPreferredLanguage] = useState<string>(userProfile.preferredLanguage || 'en');
  const [targetHours, setTargetHours] = useState(userProfile.targetHours || 1);
  const [targetMinutes, setTargetMinutes] = useState(userProfile.targetMinutes || 50);
  const [reminderTime, setReminderTime] = useState(userProfile.dailyReminderTime || '20:30');
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile.notificationsEnabled ?? true);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const computedAge = dateOfBirth 
    ? Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : parseInt(age, 10) || null;
  const isMinor = computedAge !== null && computedAge < 18;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please define your Full Name.');
      return;
    }
    if (!gender) {
      setValidationError('Please select your Gender identity.');
      return;
    }
    if (isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
      setValidationError('Athletes under 18 require Guardian Name and Phone Number.');
      return;
    }
    if (selectedProfession === 'Other' && !customProfession.trim()) {
      setValidationError('Please specify your custom profession.');
      return;
    }
    if (selectedProfession === 'Student' && (!educationBoard.trim() || !grade.trim())) {
      setValidationError('Please specify your Board and Grade standard.');
      return;
    }

    const finalProfession = selectedProfession === 'Other' 
      ? customProfession.trim() 
      : selectedProfession === 'Student'
      ? `${educationBoard} ${grade} Student`
      : selectedProfession;

    onUpdateProfile({
      name: name.trim(),
      email: email.trim() || undefined,
      gender,
      age: computedAge !== null ? computedAge : parseInt(age, 10) || userProfile.age,
      dateOfBirth: dateOfBirth || undefined,
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      guardianEmail: isMinor ? guardianEmail.trim() : undefined,
      profession: finalProfession,
      educationBoard: selectedProfession === 'Student' ? educationBoard.trim() : userProfile.educationBoard,
      grade: selectedProfession === 'Student' ? grade.trim() : userProfile.grade,
      avatarUrl: avatarUrl || userProfile.avatarUrl,
      dietaryPreference,
      medicalConditions,
      preferredLanguage: preferredLanguage as any,
      targetHours: Math.max(0, Math.min(24, targetHours)),
      targetMinutes: Math.max(0, Math.min(59, targetMinutes)),
      dailyReminderTime: reminderTime,
      notificationsEnabled,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleHourSpin = (delta: number) => {
    setTargetHours((prev) => Math.max(0, Math.min(24, prev + delta)));
  };

  const handleMinSpin = (delta: number) => {
    setTargetMinutes((prev) => {
      const next = prev + delta;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-extrabold tracking-tight">
                Learner Profile & Demographics
              </h3>
              <p className="text-xs text-slate-300">
                Personal identity, daily commitments, and notification schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {validationError}
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Select Profile Avatar
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setShowCustomInput(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        avatarUrl === preset.url
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-600 hover:text-emerald-700 hover:border-emerald-400 bg-white font-medium flex items-center gap-1 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
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
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Gmail / Email ID *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Demographics: Gender, Date of Birth & Dynamic Age */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Gender Identity (Mandatory) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer truncate ${
                      gender === g
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Date of Birth (Mandatory) *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (e.target.value) {
                    const diff = Math.floor((Date.now() - new Date(e.target.value).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    setAge(String(diff));
                  }
                }}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-900"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Age
              </label>
              <div className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-center">
                {computedAge !== null ? `${computedAge} yrs` : 'Select DOB'}
              </div>
            </div>
          </div>

          {/* Conditional Minor Protection Gate */}
          {isMinor && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  MINOR PROTECTION GATE (AGE &lt; 18)
                </span>
                <span className="text-xs text-amber-900 font-semibold">
                  Guardian authorization required for minor athletes
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Guardian Name *
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Parent / Guardian Name"
                    required={isMinor}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Guardian Phone *
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required={isMinor}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Profession Field */}
          <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Profession / Occupation (Mandatory) *
            </label>
            <div className="flex flex-wrap gap-2">
              {PROFESSION_OPTIONS.map((prof) => (
                <button
                  key={prof}
                  type="button"
                  onClick={() => setSelectedProfession(prof)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedProfession === prof
                      ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-400 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>

            {/* Accordion 1: If Student selected */}
            {selectedProfession === 'Student' && (
              <div className="p-3.5 bg-white rounded-xl border border-sky-200 space-y-3 mt-2 animate-fade-in">
                <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Academic Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Education Board
                    </label>
                    <input
                      type="text"
                      value={educationBoard}
                      onChange={(e) => setEducationBoard(e.target.value)}
                      placeholder="e.g. CBSE, ICSE, GSEB"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Grade / Standard
                    </label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g. Class 12, Undergraduate"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accordion 2: If Other selected */}
            {selectedProfession === 'Other' && (
              <div className="p-3.5 bg-white rounded-xl border border-sky-200 mt-2 animate-fade-in">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Please specify your profession *
                </label>
                <input
                  type="text"
                  value={customProfession}
                  onChange={(e) => setCustomProfession(e.target.value)}
                  placeholder="e.g. Data Scientist, Architect, Sound Engineer"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Dietary Preference & Athletic Fueling */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-amber-600" />
                <span>Dietary Preference (Sports Fueling)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {dietaryPreference}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DIETARY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDietaryPreference(d)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    dietaryPreference === d
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Medical & Physical Conditions Gating */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>Medical & Physical Advisories (AI Gating)</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MEDICAL_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setMedicalConditions(chip)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    medicalConditions === chip
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Custom Injuries or Advisories
              </label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Mild Knee Sensitivity, Asthma, None / Fully Fit"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Preferred Language for Curriculum */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
            <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>Preferred Pedagogical Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setPreferredLanguage(lang.code)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    preferredLanguage === lang.code
                      ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lang.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Study Target */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Daily Target Study Cadence</span>
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

          {/* Daily Schedule & Notification Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Daily Learning Reminder Notification
                </span>
                <span className="text-[11px] text-slate-500">
                  Send reminder email to {email || 'your email'}
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
              className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 transition-all active:scale-95"
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
    </div>,
    document.body
  );
};

export default EditProfileModal;
