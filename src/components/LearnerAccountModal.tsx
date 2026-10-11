'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, User, Mail, GraduationCap, Sparkles, 
  Search, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export interface LearnerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: any) => void;
  initialMode?: 'create' | 'existing';
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const PROFESSION_OPTIONS = [
  'Student',
  'Software Engineer',
  'Healthcare Professional',
  'Designer',
  'Educator',
  'Entrepreneur',
  'Other',
];

export const LearnerAccountModal: React.FC<LearnerAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'create',
}) => {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'create' | 'existing'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const [gender, setGender] = useState('Prefer not to say');
  const [selectedProfession, setSelectedProfession] = useState('Student');
  const [customProfession, setCustomProfession] = useState('');
  const [educationBoard, setEducationBoard] = useState('CBSE');
  const [grade, setGrade] = useState('Class 12');
  const [age, setAge] = useState('18');

  // Single Account Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Real Google Sign-in Handler via @react-oauth/google
  const googleLoginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleToken(tokenResponse.access_token);
        // Fetch verified user profile info from Google UserInfo endpoint
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (userInfoRes.ok) {
          const gData = await userInfoRes.json();
          if (gData.email) {
            setEmail(gData.email);
            setIsGoogleVerified(true);
            if (gData.name && !name.trim()) {
              setName(gData.name);
            }
            if (gData.picture) {
              setAvatarUrl(gData.picture);
            }
            setToastMessage(`Signed in as ${gData.email}. Complete demographics below to continue.`);
          }
        }
      } catch (err: any) {
        console.error('Google profile extraction error:', err);
        setFormError('Failed to retrieve Google profile data.');
      }
    },
    onError: (errorResponse) => {
      console.warn('Google Sign-In failed or cancelled:', errorResponse);
      setToastMessage('Google Sign-In was cancelled or failed.');
    },
  });

  const handleGoogleClick = () => {
    if (!googleClientId || !googleClientId.trim()) {
      setToastMessage('Google Sign-In configuration pending in environment variables.');
      return;
    }
    googleLoginTrigger();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }

    if (!email.trim() && !isGoogleVerified) {
      setFormError('Please provide your Email Address or Continue with Google.');
      return;
    }

    if (selectedProfession === 'Other' && !customProfession.trim()) {
      setFormError('Please specify your profession.');
      return;
    }

    if (selectedProfession === 'Student' && (!educationBoard.trim() || !grade.trim())) {
      setFormError('Please enter your Board and Grade standard.');
      return;
    }

    const finalProfession = selectedProfession === 'Other'
      ? customProfession.trim()
      : selectedProfession === 'Student'
      ? `${educationBoard} ${grade} Student`
      : selectedProfession;

    setIsSubmitting(true);

    try {
      // Send verified payload to backend auth/google or profiles
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          avatarUrl: avatarUrl || undefined,
          gender,
          profession: finalProfession,
          studentDetails: selectedProfession === 'Student' ? { educationBoard, grade } : undefined,
          googleToken: googleToken || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize account.');
      }

      const activeProfile = data.profile || data.user || data;
      if (activeProfile?.id) {
        localStorage.setItem('skillprax_active_profile_id', activeProfile.id);
        if (data.token) {
          localStorage.setItem('skillprax_auth_token', data.token);
        }
        onSuccess(activeProfile);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/profiles/lookup?query=${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.profile) {
        setLookupResult(data.profile);
      } else {
        setLookupError(data.error || 'No matching account found with that email or name.');
      }
    } catch (err) {
      setLookupError('Network error during lookup. Check server status.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectFoundProfile = (profile: any) => {
    localStorage.setItem('skillprax_active_profile_id', profile.id);
    onSuccess(profile);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  {mode === 'create' ? 'Create Learner Account' : 'Retrieve Existing Account'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {mode === 'create'
                    ? 'Establish your identity to access personalized workspaces'
                    : 'Secure single-input lookup prompt (no public list)'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => {
                setMode('create');
                setFormError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                mode === 'create'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              New Learner Profile
            </button>
            <button
              onClick={() => {
                setMode('existing');
                setFormError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                mode === 'existing'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Lookup Existing Profile
            </button>
          </div>

          <div className="p-6 space-y-5">
            {mode === 'create' ? (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Google Sign-In Button */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isGoogleVerified ? 'Google Account Connected' : 'Continue with Google'}</span>
                    {isGoogleVerified && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        ✓ Verified
                      </span>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Syncs learning trajectories, streaks, and reviews across sessions.
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Profile Demographics
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Manendra Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                    <span>Email Address <span className="text-rose-500">*</span></span>
                    {isGoogleVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified via Google
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isGoogleVerified}
                    placeholder="e.g. learner@gmail.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isGoogleVerified ? 'bg-slate-100 border-slate-200 cursor-not-allowed font-mono text-slate-600' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                {/* Gender (Mandatory) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gender Identity <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setGender(opt)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                          gender === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profession (Mandatory) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Profession <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedProfession}
                    onChange={(e) => setSelectedProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PROFESSION_OPTIONS.map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If Student: Board & Grade Accordion */}
                {selectedProfession === 'Student' && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                      Academic Board & Standard Standard
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500">Board</label>
                        <input
                          type="text"
                          value={educationBoard}
                          onChange={(e) => setEducationBoard(e.target.value)}
                          placeholder="e.g. CBSE / ICSE / GSEB"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500">Grade</label>
                        <input
                          type="text"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="e.g. Class 12 / Year 1"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Other: Custom Profession Input */}
                {selectedProfession === 'Other' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Please specify your profession <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customProfession}
                      onChange={(e) => setCustomProfession(e.target.value)}
                      placeholder="e.g. Aerospace Researcher"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isSubmitting ? 'Establishing Profile...' : 'Complete Registration & Launch ➔'}</span>
                </button>
              </form>
            ) : (
              /* Single Input Lookup Prompt */
              <div className="space-y-4">
                <form onSubmit={handleLookupSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter Registered Profile Name or Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        placeholder="e.g. Manendra Patel or learner@gmail.com"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={lookupLoading || !lookupQuery.trim()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{lookupLoading ? 'Searching...' : 'Lookup'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {lookupError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}

                {lookupResult && (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {lookupResult.name ? lookupResult.name.slice(0, 2).toUpperCase() : 'LR'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{lookupResult.name}</h4>
                          <p className="text-[11px] text-slate-500 font-mono">{lookupResult.email || 'Email verified'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        Active Account
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectFoundProfile(lookupResult)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Continue with this Profile ➔</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default LearnerAccountModal;
