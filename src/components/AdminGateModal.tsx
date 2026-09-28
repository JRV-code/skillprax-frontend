'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, KeyRound, Loader2, X } from 'lucide-react';

interface AdminGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminGateModal({ isOpen, onClose }: AdminGateModalProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (isOpen) {
      setChecking(true);
      setError(null);
      setPasscode('');
      setConfirmPasscode('');
      fetch(`${API_BASE}/api/admin/status`)
        .then((res) => res.json())
        .then((data) => {
          setIsConfigured(Boolean(data.isConfigured));
          setChecking(false);
        })
        .catch(() => {
          setError('Could not verify admin security status.');
          setChecking(false);
        });
    }
  }, [isOpen, API_BASE]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured && passcode !== confirmPasscode) {
      setError('Passcodes do not match.');
      return;
    }

    setLoading(true);
    const endpoint = isConfigured ? '/api/admin/verify' : '/api/admin/setup';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('skillprax_admin_token', data.token || 'authenticated');
      onClose();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12151F] border border-[#1E2436] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4"/>
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Lock className="w-6 h-6"/>
          </div>
          <h3 className="text-base font-bold text-white">System Engine Gate</h3>
          <p className="text-xs text-slate-400">
            {checking
              ? 'Checking gate security...'
              : isConfigured
              ? 'Enter master passcode to unlock settings.'
              : 'First-time setup: establish your master admin passcode.'}
          </p>
        </div>

        {checking ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400"/>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400"/>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                {isConfigured ? 'Admin Passcode' : 'Create Passcode'}
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-sm text-white focus:outline-none focus:border-cyan-400 font-mono tracking-widest"
              />
            </div>

            {!isConfigured && (
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Confirm Passcode
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#090A0F] border border-[#1E2436] text-sm text-white focus:outline-none focus:border-cyan-400 font-mono tracking-widest"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin"/>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5"/>
                  {isConfigured ? 'Unlock Admin' : 'Set Passcode & Enter'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
