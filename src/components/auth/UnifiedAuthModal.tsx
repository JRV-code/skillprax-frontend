'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Check,
  User,
} from 'lucide-react';
import { login as storeLogin } from '@/store/useAuthStore';
import { BrandLogo } from '@/components/common/BrandLogo';

declare global {
  interface Window {
    google?: any;
  }
}

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  initialEmail?: string;
}

export function UnifiedAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
}: UnifiedAuthModalProps) {
  // Modal View States: AUTH_FORM or SET_PASSWORD_STEP
  const [modalStep, setModalStep] = useState<'AUTH_FORM' | 'SET_PASSWORD_STEP'>('AUTH_FORM');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Step 1: Auth Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Step 2: Post-Google Password Setup Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Shared Status States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');
  const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
  const isGoogleConfigured = Boolean(
    GOOGLE_CLIENT_ID && 
    GOOGLE_CLIENT_ID !== '' && 
    !GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
    GOOGLE_CLIENT_ID !== 'undefined'
  );

  // Safe JSON Fetch helper that never throws raw SyntaxError on non-JSON HTML
  async function safeFetchJson(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('[Auth Non-JSON Response]:', res.status, text.slice(0, 200));
      throw new Error(
        res.status === 404
          ? 'Authentication service endpoint not found (404). Please check API configuration.'
          : `Authentication server unavailable (HTTP ${res.status}). Please try again in a moment.`
      );
    }

    const data = await res.json();
    if (!res.ok || data.error) {
      const err: any = new Error(data.error || data.message || `Authentication failed (${res.status})`);
      err.data = data;
      err.needsPasswordSetup = Boolean(data.needsPasswordSetup);
      throw err;
    }
    return data;
  }

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalStep('AUTH_FORM');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(false);
      setErrorMessage(null);
      setSuccessNotice(null);
      if (initialEmail) {
        setEmail(initialEmail);
      }
    }
  }, [isOpen, initialEmail]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && isGoogleConfigured) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render hidden/native button container
          const googleButtonContainer = document.getElementById('google-hidden-btn');
          if (googleButtonContainer) {
            googleButtonContainer.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
            });
          }
        } catch (err) {
          console.warn('[SKILL-TRACK Auth] Google Identity Services init error:', err);
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (!window.google?.accounts) {
        const existingScript = document.getElementById('google-gsi-client-script');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-gsi-client-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = initializeGoogle;
          document.body.appendChild(script);
        } else {
          existingScript.addEventListener('load', initializeGoogle);
        }
      } else {
        initializeGoogle();
      }
    }
  }, [isOpen, isGoogleConfigured, GOOGLE_CLIENT_ID, modalStep]);

  // Unified Google Token/Credential Sender to backend
  const handleGoogleAuthPayload = async (payload: { access_token?: string; credential?: string }) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessNotice(null);

      const data = await safeFetchJson(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const activeUser = data.user || data.profile;
      const token = data.token;

      if (token && activeUser) {
        storeLogin(activeUser, token);
        setLoggedInUser(activeUser);
        setSessionToken(token);
      }

      if (data.needsPasswordSetup) {
        setModalStep('SET_PASSWORD_STEP');
        setSuccessNotice('Google account linked! Enhance your account security by setting a password.');
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        setSuccessNotice('Welcome back! Signed in with Google.');
        setTimeout(() => {
          if (onSuccess) onSuccess(activeUser);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Credential Token from GSI One Tap / Native button
  const handleGoogleCredentialResponse = async (response: any) => {
    const credential = response?.credential;
    if (!credential) {
      setErrorMessage('Failed to receive credential from Google. Please try again.');
      return;
    }
    await handleGoogleAuthPayload({ credential });
  };

  // Direct Button Click: Trigger OAuth2 Popup Client
  const handleCustomGoogleClick = () => {
    if (!isGoogleConfigured) {
      setErrorMessage(
        'Google Client ID is not configured in environment variables (NEXT_PUBLIC_GOOGLE_CLIENT_ID). Please sign in with email/password.'
      );
      return;
    }

    if (typeof window === 'undefined') return;

    // 1. Primary: Use window.google.accounts.oauth2.initTokenClient to open standard account chooser popup
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setErrorMessage(
                tokenResponse.error_description || 'Google authorization was cancelled or failed.'
              );
              return;
            }
            if (tokenResponse?.access_token) {
              await handleGoogleAuthPayload({ access_token: tokenResponse.access_token });
            } else {
              setErrorMessage('No access token received from Google.');
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('[UnifiedAuthModal] initTokenClient failed, falling back to One Tap prompt:', err);
      }
    }

    // 2. Fallback: Trigger GSI One Tap / Native hidden button
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            const nativeBtn = document.querySelector('#google-hidden-btn div[role="button"]') as HTMLElement;
            if (nativeBtn) {
              nativeBtn.click();
            }
          }
        });
        return;
      } catch (_) {
        const nativeBtn = document.querySelector('#google-hidden-btn div[role="button"]') as HTMLElement;
        if (nativeBtn) {
          nativeBtn.click();
          return;
        }
      }
    }

    setErrorMessage('Google Sign-In is initializing. Please wait a moment or sign in with email.');
  };

  // Step 1a: Handle Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const data = await safeFetchJson(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const activeUser = data.user || data.profile;
      const token = data.token;

      if (token && activeUser) {
        storeLogin(activeUser, token);
        setLoggedInUser(activeUser);
        setSessionToken(token);
      }

      if (data.needsPasswordSetup) {
        setModalStep('SET_PASSWORD_STEP');
        return;
      }

      setSuccessNotice('Welcome back! Signed in successfully.');

      setTimeout(() => {
        if (onSuccess) onSuccess(activeUser);
        onClose();
      }, 700);
    } catch (err: any) {
      if (err.needsPasswordSetup) {
        setErrorMessage(err.message || 'Account created via Google. Please sign in with Google once to set your password.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1b: Handle Sign Up Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const data = await safeFetchJson(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          password,
          confirmPassword: signupConfirmPassword,
          name: name.trim() || undefined,
        }),
      });

      const activeUser = data.user || data.profile;
      const token = data.token;

      if (token && activeUser) {
        storeLogin(activeUser, token);
        setLoggedInUser(activeUser);
        setSessionToken(token);
      }

      setSuccessNotice('Account created! Welcome to SKILL-TRACK.');

      setTimeout(() => {
        if (onSuccess) onSuccess(activeUser);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Set Account Password Submission
  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const token = sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('skillprax_auth_token') : null);
    if (!token) {
      setErrorMessage('Authentication session expired. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      await safeFetchJson(`${API_BASE}/api/auth/set-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      setPasswordSuccess(true);
      setSuccessNotice('Password saved successfully! Entering SKILL-TRACK...');

      setTimeout(() => {
        if (onSuccess && loggedInUser) {
          onSuccess(loggedInUser);
        }
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while saving password.');
    } finally {
      setLoading(false);
    }
  };

  // Skip Password Setup
  const handleSkipPassword = () => {
    if (onSuccess && loggedInUser) {
      onSuccess(loggedInUser);
    }
    onClose();
  };

  if (!isOpen) return null;

  const userName = loggedInUser?.name || loggedInUser?.email?.split('@')[0] || 'Athlete';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft Glassmorphic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden z-10"
        >
          {/* Subtle Ambient Gradient Accents */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Multi-Step Animated Content with AnimatePresence mode="wait" */}
          <AnimatePresence mode="wait">
            {modalStep === 'AUTH_FORM' ? (
              <motion.div
                key="AUTH_FORM"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="flex justify-center mb-3">
                    <BrandLogo size="lg" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold tracking-wider uppercase mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SKILL-TRACK PLATFORM AUTH</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {activeTab === 'signin'
                      ? 'Access your personalized learning roadmaps, verified packs, and certifications.'
                      : 'Join SKILL-TRACK to start deliberate practice and verified skill progression.'}
                  </p>
                </div>

                {/* Two-Tab Navigation */}
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-heading font-extrabold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'signin'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-heading font-extrabold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'signup'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#F43F5E] mt-0.5" />
                    <div className="leading-snug">{errorMessage}</div>
                  </motion.div>
                )}

                {/* Success Message */}
                {successNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successNotice}</span>
                  </motion.div>
                )}

                {activeTab === 'signin' ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="learner@domain.com"
                          required
                          autoFocus
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Password Field with Show/Hide Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Switcher */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                      >
                        Don&apos;t have an account? <span className="font-bold text-indigo-600 underline">Sign Up</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* SIGN UP FORM */
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    {/* Full Name Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="learner@domain.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password (min. 8 chars)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create strong password"
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Confirm Password
                        </label>
                        {signupConfirmPassword && (
                          <span className={`text-[11px] font-bold flex items-center gap-1 ${
                            password === signupConfirmPassword ? 'text-emerald-600' : 'text-rose-500'
                          }`}>
                            {password === signupConfirmPassword ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Passwords match</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                <span>Passwords do not match</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showSignupConfirmPassword ? 'text' : 'password'}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Create Account Action Button */}
                    <motion.button
                      type="submit"
                      disabled={loading || (Boolean(signupConfirmPassword) && password !== signupConfirmPassword)}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                      className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Switcher */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signin');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                      >
                        Already have an account? <span className="font-bold text-indigo-600 underline">Sign In</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">
                    <span>Or Continue With</span>
                  </div>
                </div>

                {/* Google Sign-In Trigger */}
                {isGoogleConfigured ? (
                  <div>
                    <motion.button
                      type="button"
                      onClick={handleCustomGoogleClick}
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      <span>Continue with Google</span>
                    </motion.button>

                    {/* Hidden Native Container for Google GSI iframe */}
                    <div id="google-hidden-btn" className="hidden" />
                  </div>
                ) : (
                  <div className="py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-500 text-[11px] text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Universal credentials verified securely by SKILL-TRACK</span>
                  </div>
                )}

                {/* Footer note */}
                <p className="text-[10px] text-slate-400 text-center mt-4">
                  By proceeding, you agree to our Terms of Service & Privacy Policy.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="SET_PASSWORD_STEP"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <BrandLogo size="lg" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold tracking-wider uppercase mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>🔐 ENHANCE ACCOUNT SECURITY</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Set Your Account Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Welcome, <strong className="text-slate-800">{userName}</strong>! Set a password so you can access your SKILL-TRACK profile with your Gmail address or Google at any time.
                  </p>
                </div>

                {/* Password Setup Form */}
                <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#F43F5E] mt-0.5" />
                      <div className="leading-snug">{errorMessage}</div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {successNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{successNotice}</span>
                    </motion.div>
                  )}

                  {/* Create Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Create Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showNewPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        autoFocus
                        minLength={6}
                        className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter to confirm"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <motion.button
                    type="submit"
                    disabled={loading || passwordSuccess}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {passwordSuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-white" />
                        <span>Password Saved!</span>
                      </span>
                    ) : loading ? (
                      <span>Saving Password...</span>
                    ) : (
                      <>
                        <span>Save Password & Enter Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Secondary Skip Option */}
                  <button
                    type="button"
                    onClick={handleSkipPassword}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 text-center transition-colors cursor-pointer"
                  >
                    Skip for now
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default UnifiedAuthModal;
