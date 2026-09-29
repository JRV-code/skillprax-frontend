'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { SkillpraxLogo } from '@/components/SkillpraxLogo';

export default function AdminPage() {
  const [groqKey, setGroqKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Test state
  const [groqTestStatus, setGroqTestStatus] = useState<{ testing: boolean; success?: boolean; latency?: number; error?: string }>({ testing: false });
  const [tavilyTestStatus, setTavilyTestStatus] = useState<{ testing: boolean; success?: boolean; latency?: number; error?: string }>({ testing: false });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSaveKeys = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" href="/profile">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <SkillpraxLogo size="sm"/>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 border-l pl-4 border-slate-200">
            System Administration
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Credentials & Model Routing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure backend access keys for Groq (Curriculum & Socratic Evaluation) and Tavily (Academic Resource Retrieval).
          </p>
        </div>

        {saveMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0"/>
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GROQ CARD */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-sm">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Groq AI Engine</h3>
                  <p className="text-[11px] text-slate-400">LLaMA 3.3 70B Versatile</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                configStatus?.groqConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {configStatus?.groqConfigured ? 'CONNECTED' : 'KEY MISSING'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter Groq API Key
              </label>
              <input
                type="password"
                placeholder={configStatus?.groqKeyMasked || 'gsk_...'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestGroq}
                disabled={groqTestStatus.testing}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {groqTestStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Zap className="w-3.5 h-3.5 text-amber-500"/>}
                Test Groq Connection
              </button>

              {groqTestStatus.success && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5"/>
                  {groqTestStatus.latency}ms OK
                </span>
              )}
              {groqTestStatus.error && (
                <span className="text-xs text-rose-600 font-medium truncate max-w-[150px]" title={groqTestStatus.error}>
                  {groqTestStatus.error}
                </span>
              )}
            </div>
          </div>

          {/* TAVILY CARD */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-sm">
                  T
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tavily Research API</h3>
                  <p className="text-[11px] text-slate-400">Contextual Documentation Retrieval</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                configStatus?.tavilyConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {configStatus?.tavilyConfigured ? 'CONNECTED' : 'KEY MISSING'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter Tavily API Key
              </label>
              <input
                type="password"
                placeholder={configStatus?.tavilyKeyMasked || 'tvly-...'}
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestTavily}
                disabled={tavilyTestStatus.testing}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {tavilyTestStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Zap className="w-3.5 h-3.5 text-cyan-500"/>}
                Test Tavily Connection
              </button>

              {tavilyTestStatus.success && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5"/>
                  {tavilyTestStatus.latency}ms OK
                </span>
              )}
              {tavilyTestStatus.error && (
                <span className="text-xs text-rose-600 font-medium truncate max-w-[150px]" title={tavilyTestStatus.error}>
                  {tavilyTestStatus.error}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSaveKeys}
            disabled={saving || (!groqKey && !tavilyKey)}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <ShieldCheck className="w-4 h-4"/>}
            Save & Update Runtime Credentials
          </button>
        </div>
      </main>
    </div>
  );
}
