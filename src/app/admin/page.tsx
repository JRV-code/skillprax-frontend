'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, RefreshCw, ShieldCheck, Zap, 
  Lock, KeyRound, AlertTriangle, LogOut, Sparkles,
  Building2, Truck, DollarSign, Percent, Clock, Check, X,
  ShieldAlert, Award, FileText, ChevronRight
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

  // MODULE 7: Sports & Maidan Admin Sub-Tabs
  const [adminTab, setAdminTab] = useState<'telemetry' | 'clubs' | 'drivers' | 'discounts' | 'escrow'>('telemetry');
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [heldEscrow, setHeldEscrow] = useState<any[]>([]);
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [sportsLoading, setSportsLoading] = useState(false);
  const [sportsActionMsg, setSportsActionMsg] = useState<string | null>(null);

  // Discount Manager Form
  const [selectedClubId, setSelectedClubId] = useState('');
  const [discountFee, setDiscountFee] = useState('');
  const [discountLabel, setDiscountLabel] = useState('15% Negotiated Academy Concession');

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
        const fallbackRes = await fetch('/api/admin/status');
        const fallbackData = await fallbackRes.json();
        setAuthStatus({ initialized: Boolean(fallbackData.isConfigured || fallbackData.initialized) });
      }
    } catch {
      setAuthStatus({ initialized: false });
    } finally {
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    if (adminToken) {
      fetchConfig(adminToken);
      fetchSportsData();
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

  const fetchSportsData = async () => {
    setSportsLoading(true);
    try {
      const [clubsRes, driversRes, escrowRes, allClubsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/sports/clubs/pending'),
        fetch('http://localhost:3001/api/admin/sports/drivers/pending'),
        fetch('http://localhost:3001/api/admin/sports/escrow/held'),
        fetch('http://localhost:3001/api/sports/clubs/explore?radiusKm=500'),
      ]);

      if (clubsRes.ok) {
        const d = await clubsRes.json();
        setPendingClubs(d.clubs || []);
      }
      if (driversRes.ok) {
        const d = await driversRes.json();
        setPendingDrivers(d.drivers || []);
      }
      if (escrowRes.ok) {
        const d = await escrowRes.json();
        setHeldEscrow(d.transactions || []);
      }
      if (allClubsRes.ok) {
        const d = await allClubsRes.json();
        setAllClubs(d.clubs || []);
        if (d.clubs?.length > 0 && !selectedClubId) {
          setSelectedClubId(d.clubs[0].id);
        }
      }
    } catch {
      // Offline fallback state for preview
      setPendingClubs([
        {
          id: 'club-pend-1',
          club_name: 'Ahmedabad Premier Football Academy',
          sports_offered: ['Football'],
          city: 'Ahmedabad',
          monthly_fee: 3500,
          competition_level: 'State',
          facilities: ['Floodlit Turf', 'Physio Room'],
          verification_docs: [
            { title: 'Gujarat State FA Affiliation License', fileUrl: 'https://example.com/fa.pdf' },
            { title: 'Head Coach AFC-B Certification', fileUrl: 'https://example.com/coach.pdf' },
          ],
        },
      ]);
      setPendingDrivers([
        {
          id: 'van-pend-1',
          driver_name: 'Ramesh Solanki',
          registration_number: 'GJ-01-AX-9124',
          license_last_four: '3942',
          route_title: 'Kudasan & PDPU to Sector 21 Sports Complex',
          stops: ['Kudasan Circle', 'Bhaijipura', 'Sector 21'],
          monthly_fare: 1800,
        },
      ]);
      setHeldEscrow([
        {
          id: 'escrow-held-1',
          user_id: 'default-profile',
          transaction_type: 'trial_fee',
          reference_id: 'trial-inv-992',
          amount: 500,
          razorpay_payment_id: 'rzp_pay_8917263',
          escrow_status: 'held',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSportsLoading(false);
    }
  };

  const handleVerifyClub = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/sports/clubs/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setSportsActionMsg(data.message || 'Club processed successfully');
      fetchSportsData();
    } catch {
      alert('Failed to process club application');
    }
  };

  const handleVerifyDriver = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/sports/drivers/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setSportsActionMsg(data.message || 'Driver license verified');
      fetchSportsData();
    } catch {
      alert('Failed to process driver');
    }
  };

  const handleSetDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId || !discountFee) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/sports/clubs/${selectedClubId}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountedFee: Number(discountFee),
          discountLabel,
        }),
      });
      const data = await res.json();
      setSportsActionMsg(data.message || 'Discount promotion updated');
      setDiscountFee('');
      fetchSportsData();
    } catch {
      alert('Failed to apply discount');
    }
  };

  const handleReleaseEscrow = async (id: string, action: 'release' | 'refund') => {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/sports/escrow/${id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setSportsActionMsg(data.message || 'Escrow funds updated');
      fetchSportsData();
    } catch {
      alert('Failed to release escrow funds');
    }
  };

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
            <h1 className="text-xl font-black tracking-tight">
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

  // 2. Lockscreen Modal
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black tracking-tight">
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
                  <span>Verifying...</span>
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

  // 3. Authenticated Master Admin Console with Module 7 Extensions
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
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

      {/* Module 7 Sub-Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setAdminTab('telemetry')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'telemetry'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            API & Telemetry Gateway
          </button>

          <button
            onClick={() => setAdminTab('clubs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'clubs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            Club Verification Queue
            {pendingClubs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingClubs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('drivers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'drivers'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            Driver & Van Approvals
            {pendingDrivers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingDrivers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('discounts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'discounts'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-purple-400" />
            High-Fee Discount Manager
          </button>

          <button
            onClick={() => setAdminTab('escrow')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminTab === 'escrow'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Escrow Payout Queue
            {heldEscrow.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {heldEscrow.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {sportsActionMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sportsActionMsg}</span>
            </div>
            <button onClick={() => setSportsActionMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: API & Telemetry */}
        {adminTab === 'telemetry' && (
          <>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
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
          </>
        )}

        {/* TAB 2: Club Verification Queue */}
        {adminTab === 'clubs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Sports Academy & Club Accreditation Queue
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Review registration certificates, state federation affiliation, and head coach accreditations before publishing academies to the public discovery map.
              </p>
            </div>

            {pendingClubs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">All Academies Verified</h3>
                <p className="text-xs text-slate-500 mt-1">No unverified sports club registrations in queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClubs.map((club) => (
                  <div key={club.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                          Pending Approval
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{club.club_name}</h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        {club.city} • Sports: {Array.isArray(club.sports_offered) ? club.sports_offered.join(', ') : 'Football'} • Level: {club.competition_level} • Monthly Fee: ₹{club.monthly_fee}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-600 font-medium">Uploaded Credentials:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          Federation Affiliation & Coach License
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyClub(club.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Accredit & Publish
                      </button>
                      <button
                        onClick={() => handleVerifyClub(club.id, 'reject')}
                        className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Reject Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Driver & Vendor Approvals */}
        {adminTab === 'drivers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Commercial Driver License & Route Approvals
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify driver credentials and commercial vehicle registrations before athlete transit routes appear in Managed Vans.
              </p>
            </div>

            {pendingDrivers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">All Transit Drivers Verified</h3>
                <p className="text-xs text-slate-500 mt-1">Zero pending driver or van compliance approvals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDrivers.map((driver) => (
                  <div key={driver.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                          Verification Required
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{driver.driver_name}</h3>
                      </div>
                      <p className="text-xs text-slate-600">
                        Vehicle: <span className="font-mono font-bold">{driver.registration_number}</span> • License Check: <span className="font-mono">DL-*****{driver.license_last_four}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Route: {driver.route_title} • Fare: ₹{driver.monthly_fare}/mo
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyDriver(driver.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Verify License & Unlock
                      </button>
                      <button
                        onClick={() => handleVerifyDriver(driver.id, 'reject')}
                        className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: High-Fee Discount Manager */}
        {adminTab === 'discounts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                High-Fee Academy Concession & Discount Manager
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manually flag elite academies with high admission fees, attach platform-negotiated discount rates, and publish promotional badges.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSetDiscount} className="max-w-2xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Target Sports Academy
                  </label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    {allClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.club_name || c.clubName} — {c.city} (Current: ₹{c.monthly_fee || c.monthlyFee}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Discounted Fee (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2975"
                      value={discountFee}
                      onChange={(e) => setDiscountFee(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Promotional Ribbon Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15% off admission this month"
                      value={discountLabel}
                      onChange={(e) => setDiscountLabel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Percent className="w-4 h-4 text-purple-400" />
                  <span>Publish Negotiated Concession</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: Escrow Payout Queue */}
        {adminTab === 'escrow' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Held-Funds Escrow Payout & Money Protection Vault
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authorize fund release only after verifying trial attendance, product shipment, or van transit fulfillment. Trigger automated refunds if canceled.
              </p>
            </div>

            {heldEscrow.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Escrow Queue Cleared</h3>
                <p className="text-xs text-slate-500 mt-1">No held funds transactions awaiting administrative authorization.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">User / Player</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Razorpay Ref</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {heldEscrow.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 capitalize">
                            {(txn.transaction_type || txn.transactionType || '').replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-600">
                            {txn.user_id || txn.userId}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            ₹{Number(txn.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">
                            {txn.razorpay_payment_id || txn.razorpayPaymentId}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              <Lock className="w-3 h-3 text-amber-600" />
                              HELD IN ESCROW
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleReleaseEscrow(txn.id, 'release')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Authorize Release
                            </button>
                            <button
                              onClick={() => handleReleaseEscrow(txn.id, 'refund')}
                              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Refund
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
