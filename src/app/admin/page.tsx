'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, RefreshCw, ShieldCheck, Zap, 
  Lock, KeyRound, AlertTriangle, LogOut, Sparkles 
} from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<{ initialized: boolean } | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Setup state
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Login state
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Console state
  const [groqKey, setGroqKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Latency test states
  const [groqTestStatus, setGroqTestStatus] = useState<{ testing: boolean; success?: boolean; latency?: number; error?: string }>({ testing: false });
  const [tavilyTestStatus, setTavilyTestStatus] = useState<{ testing: boolean; success?: boolean; latency?: number; error?: string }>({ testing: false });

  useEffect(() => {
    const existingToken = sessionStorage.getItem('skillprax_admin_token');
    if (existingToken) {
      setAdminToken(existingToken);
    }
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      setCheckingAuth(true);
      const res = await fetch('/api/admin/auth-status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
      } else {
        // Fallback to /api/admin/status
        const fallbackRes = await fetch('/api/admin/status');
        const fallbackData = await fallbackRes.json();
        setAuthStatus({ initialized: Boolean(fallbackData.isConfigured || fallbackData.initialized) });
      }
    } catch (err) {
      console.error('Failed to verify admin status:', err);
      setAuthStatus({ initialized: false });
    } finally {
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    if (adminToken) {
      fetchConfig(adminToken);
    }
  }, [adminToken]);

  async function fetchConfig(token?: string) {
    try {
      const activeTok = token || adminToken || sessionStorage.getItem('skillprax_admin_token') || '';
      const res = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${activeTok}`,
          'x-admin-token': activeTok,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    if (setupPassword.length < 8) {
      setSetupError('Master password must be at least 8 characters long.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    setSetupLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: setupPassword }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('skillprax_admin_token', data.token);
        setAdminToken(data.token);
        setAuthStatus({ initialized: true });
        fetchConfig(data.token);
      } else {
        setSetupError(data.error || 'Failed to establish master password.');
      }
    } catch (err: any) {
      setSetupError(err.message || 'Network error during setup.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPassword) {
      setLoginError('Please enter your master password.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('skillprax_admin_token', data.token);
        setAdminToken(data.token);
        fetchConfig(data.token);
      } else {
        setLoginError(data.error || 'Incorrect master password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Verification failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('skillprax_admin_token');
    setAdminToken(null);
    setLoginPassword('');
  };

  const handleSaveKeys = async () => {
    if (!adminToken) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ groqApiKey: groqKey, tavilyApiKey: tavilyKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Credentials successfully saved to backend configuration!');
        setGroqKey('');
        setTavilyKey('');
        fetchConfig();
      } else {
        setSaveMessage(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestGroq = async () => {
    setGroqTestStatus({ testing: true });
    try {
      const res = await fetch('/api/admin/test-groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ apiKey: groqKey || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGroqTestStatus({ testing: false, success: true, latency: data.latency });
      } else {
        setGroqTestStatus({ testing: false, success: false, error: data.error });
      }
    } catch (err: any) {
      setGroqTestStatus({ testing: false, success: false, error: err.message });
    }
  };

  const handleTestTavily = async () => {
    setTavilyTestStatus({ testing: true });
    try {
      const res = await fetch('/api/admin/test-tavily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ apiKey: tavilyKey || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTavilyTestStatus({ testing: false, success: true, latency: data.latency });
      } else {
        setTavilyTestStatus({ testing: false, success: false, error: data.error });
      }
    } catch (err: any) {
      setTavilyTestStatus({ testing: false, success: false, error: err.message });
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Securing Administrative Gateway...
          </span>
        </div>
      </div>
    );
  }

  // 1. First-Time Initialization Card
  if (authStatus && !authStatus.initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-heading font-black tracking-tight">
              Initialize Master Admin
            </h1>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              First-time setup: establish a secure master password (minimum 8 characters) to safeguard your API keys and telemetry engines.
            </p>
          </div>

          <form onSubmit={handleSetup} className="p-8 space-y-5">
            {setupError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{setupError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Master Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Confirm Master Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={setupConfirm}
                onChange={(e) => setSetupConfirm(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={setupLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {setupLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Establish Master Admin ➔</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Lockscreen Modal (Subsequent Access before JWT Session)
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-heading font-black tracking-tight">
              Master Admin Lockscreen
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Enter your master password to unlock administrative controls.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Master Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span>Unlock Admin Console ➔</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                ← Return to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authenticated Master Admin Console
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <SkillpraxLogo />
          <span className="text-xs font-mono font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded">
            ADMIN CONSOLE
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Session</span>
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-black text-slate-900">
            System Administration & API Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure LLM inference tokens, search crawlers, and monitor provider latencies.
          </p>
        </div>

        {saveMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groq Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Groq LLaMA 3.3 70B</h3>
                  <span className="text-[10px] font-mono text-slate-400">Pedagogical Synthesis Engine</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                configStatus?.groqConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {configStatus?.groqConfigured ? 'ACTIVE' : 'NOT SET'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Override Groq API Key:
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder={configStatus?.groqKeyMasked || 'gsk_...'}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestGroq}
                disabled={groqTestStatus.testing}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {groqTestStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Latency</span>
              </button>

              {groqTestStatus.success && (
                <span className="text-xs font-mono font-bold text-emerald-600">
                  ⚡ {groqTestStatus.latency}ms
                </span>
              )}
              {groqTestStatus.error && (
                <span className="text-xs font-semibold text-rose-600 truncate max-w-[150px]">
                  {groqTestStatus.error}
                </span>
              )}
            </div>
          </div>

          {/* Tavily Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tavily Search API</h3>
                  <span className="text-[10px] font-mono text-slate-400">Live Resource Harvester</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                configStatus?.tavilyConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {configStatus?.tavilyConfigured ? 'ACTIVE' : 'NOT SET'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Override Tavily API Key:
              </label>
              <input
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder={configStatus?.tavilyKeyMasked || 'tvly-...'}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestTavily}
                disabled={tavilyTestStatus.testing}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {tavilyTestStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Latency</span>
              </button>

              {tavilyTestStatus.success && (
                <span className="text-xs font-mono font-bold text-emerald-600">
                  ⚡ {tavilyTestStatus.latency}ms
                </span>
              )}
              {tavilyTestStatus.error && (
                <span className="text-xs font-semibold text-rose-600 truncate max-w-[150px]">
                  {tavilyTestStatus.error}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveKeys}
          disabled={saving || (!groqKey && !tavilyKey)}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating Credentials...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Persist Credentials to Backend Storage</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
