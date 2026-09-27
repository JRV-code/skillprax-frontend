'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Key,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { AIProvider, AdminKeysDTO } from '@/lib/types';

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('skillprax_admin_2026');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [keysConfig, setKeysConfig] = useState<AdminKeysDTO>({
    defaultProvider: 'groq',
    keys: {},
    configured: { groq: false, openai: false, anthropic: false, gemini: false },
  });

  const [inputKeys, setInputKeys] = useState({
    groq: '',
    openai: '',
    anthropic: '',
    gemini: '',
    openrouter: '',
    tavily: '',
  });

  const [selectedDefault, setSelectedDefault] = useState<AIProvider>('groq');

  // Connection testing states
  const [testingStatus, setTestingStatus] = useState<
    Record<string, { loading: boolean; ok?: boolean; latencyMs?: number; error?: string }>
  >({});

  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.getKeys(adminSecret);
      setKeysConfig(data);
      setSelectedDefault(data.defaultProvider || 'groq');
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your admin secret.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleSaveKeys = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: any = {
        defaultProvider: selectedDefault,
      };
      if (inputKeys.groq.trim()) payload.groqKey = inputKeys.groq.trim();
      if (inputKeys.openai.trim()) payload.openaiKey = inputKeys.openai.trim();
      if (inputKeys.anthropic.trim()) payload.anthropicKey = inputKeys.anthropic.trim();
      if (inputKeys.gemini.trim()) payload.geminiKey = inputKeys.gemini.trim();
      if (inputKeys.openrouter.trim()) payload.openrouterKey = inputKeys.openrouter.trim();
      if (inputKeys.tavily.trim()) payload.tavilyKey = inputKeys.tavily.trim();

      await api.admin.updateKeys(payload, adminSecret);
      setSuccessMsg('API keys & default provider saved successfully.');

      // Refresh current values
      const updated = await api.admin.getKeys(adminSecret);
      setKeysConfig(updated);
      setInputKeys({ groq: '', openai: '', anthropic: '', gemini: '', openrouter: '', tavily: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to update admin keys.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (provider: string) => {
    setTestingStatus((prev) => ({
      ...prev,
      [provider]: { loading: true },
    }));

    const keyToTest = (inputKeys as any)[provider] || undefined;
    try {
      const result = await api.admin.testConnection(provider, keyToTest);
      setTestingStatus((prev) => ({
        ...prev,
        [provider]: {
          loading: false,
          ok: result.ok,
          latencyMs: result.latencyMs,
          error: result.error,
        },
      }));
    } catch (err: any) {
      setTestingStatus((prev) => ({
        ...prev,
        [provider]: {
          loading: false,
          ok: false,
          error: err.message || 'Ping failed',
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 bg-cyber-grid p-4 sm:p-8">
      {/* Header HUD */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between border-b border-[#1E2436] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg bg-[#12151F] border border-[#1E2436] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Admin Key Command Center
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure multi-LLM API keys, test connection latencies, and manage active default engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-950/50 border border-purple-500/30 text-purple-300">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            SYSTEM_LEVEL: ADMIN
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] cyber-glow-purple"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Enter your system adminSecret password to unlock LLM keys configuration.
            </p>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  x-admin-secret Header Key
                </label>
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin secret..."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1E2436] text-slate-100 text-sm focus:outline-none focus:border-purple-500/70"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Unlock Command Center
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Notifications */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button
                  onClick={() => setSuccessMsg(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Default Provider Selector Card */}
            <div className="p-6 rounded-2xl bg-[#12151F] border border-[#1E2436] cyber-glow-cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Global Default Engine Selection (Groq + Tavily Recommended)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select the active default engine used across all SkillPrax curricula and JIT steps.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  Active: {selectedDefault.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'groq', name: 'Groq + Tavily (Recommended Free)', model: 'openai/gpt-oss-120b', badge: 'Recommended Free' },
                  { id: 'gemini', name: 'Google AI Studio (Free)', model: 'gemini-3.7-flash', badge: 'Flagship Free' },
                  { id: 'openrouter', name: 'OpenRouter (Free)', model: 'gpt-oss-120b:free', badge: 'Backup Free' },
                  { id: 'openai', name: 'OpenAI GPT-4o', model: 'gpt-4o', badge: 'Paid Tier' },
                  { id: 'anthropic', name: 'Anthropic Claude 3.7', model: 'claude-3-7-sonnet-latest', badge: 'Paid Tier' },
                ].map((prov) => {
                  const isSelected = selectedDefault === prov.id;
                  const isConfigured = keysConfig.configured[prov.id as keyof typeof keysConfig.configured];
                  return (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedDefault(prov.id as AIProvider)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-slate-100 cyber-glow-cyan'
                          : 'bg-[#090A0F] border-[#1E2436] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-200">{prov.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                            {prov.badge}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 truncate">{prov.model}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className={`flex items-center gap-1 ${isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isConfigured ? 'Key Set' : 'No Key'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Key Fields Grid - Primary Cards at Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  id: 'groq',
                  name: 'Groq Cloud API Key (Primary Engine)',
                  placeholder: 'gsk_...',
                  helperText: 'Ultra-fast curriculum & quiz generation (100% Free). Active Model: GPT-OSS 120B.',
                  masked: keysConfig.keys.groq,
                  configured: keysConfig.configured.groq,
                  accentColor: 'text-amber-400',
                },
                {
                  id: 'tavily',
                  name: 'Tavily Web Search Engine Key (Primary Grounding)',
                  placeholder: 'tvly-...',
                  helperText: 'Live web verification layer to ensure zero broken URLs.',
                  masked: (keysConfig.keys as any).tavily,
                  configured: (keysConfig.configured as any).tavily,
                  accentColor: 'text-sky-400',
                },
                {
                  id: 'gemini',
                  name: 'Google Gemini API Key (Secondary)',
                  placeholder: 'AQ.Ab8RN6... or AIzaSy...',
                  helperText: 'Google AI Studio Free Tier — Gemini 3.7 Flash',
                  masked: keysConfig.keys.gemini,
                  configured: keysConfig.configured.gemini,
                  accentColor: 'text-cyan-400',
                },
                {
                  id: 'openrouter',
                  name: 'OpenRouter API Key (Optional)',
                  placeholder: 'sk-or-v1-...',
                  helperText: 'OpenRouter Free Tier — Active Model: GPT-OSS 120B Free',
                  masked: keysConfig.keys.openrouter,
                  configured: keysConfig.configured.openrouter,
                  accentColor: 'text-emerald-400',
                },
                {
                  id: 'openai',
                  name: 'OpenAI Platform Key',
                  placeholder: 'sk-proj-...',
                  helperText: 'OpenAI Developer Tier — Flagship gpt-4o & o3-mini',
                  masked: keysConfig.keys.openai,
                  configured: keysConfig.configured.openai,
                  accentColor: 'text-purple-400',
                },
                {
                  id: 'anthropic',
                  name: 'Anthropic Claude API Key',
                  placeholder: 'sk-ant-api...',
                  helperText: 'Anthropic Developer Tier — Claude 3.7 Sonnet',
                  masked: keysConfig.keys.anthropic,
                  configured: keysConfig.configured.anthropic,
                  accentColor: 'text-indigo-400',
                },
              ].map((item) => {
                const status = testingStatus[item.id] || {};
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#12151F] border border-[#1E2436] space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key className={`w-4 h-4 ${item.accentColor}`} />
                          <h4 className="text-sm font-medium text-slate-200">{item.name}</h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                            item.configured
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {item.configured ? item.masked || 'Configured' : 'Unconfigured'}
                        </span>
                      </div>

                      <div className="mt-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {item.configured ? 'Update API Key (Leave blank to preserve current)' : 'Enter New API Key'}
                        </label>
                        <input
                          type="password"
                          value={(inputKeys as any)[item.id] || ''}
                          onChange={(e) =>
                            setInputKeys({ ...inputKeys, [item.id]: e.target.value })
                          }
                          placeholder={item.placeholder}
                          className="w-full px-3.5 py-2 rounded-lg bg-[#090A0F] border border-[#1E2436] text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500/70"
                        />
                        {item.helperText && (
                          <p className="text-[10px] text-cyan-400/90 mt-1.5 leading-normal font-mono">
                            {item.helperText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Test Connection Button & Latency Display */}
                    <div>
                      <div className="pt-3 border-t border-[#1E2436]/60 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleTestConnection(item.id)}
                          disabled={status.loading}
                          className="px-3 py-1.5 rounded-lg bg-[#1a2030] hover:bg-[#222a3f] border border-[#2a344d] text-xs text-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {status.loading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>Test Connection</span>
                        </button>

                        {status.ok !== undefined && (
                          <div className="flex items-center gap-2 text-xs">
                            {status.ok ? (
                              <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                OK ({status.latencyMs}ms)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-400 border border-red-500/30 flex items-center gap-1 font-mono text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Error ({status.latencyMs}ms)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {status.ok === false && status.error && (
                        <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-mono break-all leading-relaxed flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-red-200 mb-0.5">Connection Failure Detail:</p>
                            <p className="text-slate-300 select-all">{status.error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action Bar */}
            <div className="p-4 rounded-2xl bg-[#12151F] border border-[#1E2436] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Keys are saved securely in PostgreSQL AdminConfig table with fallback to .env</span>
              </div>

              <button
                onClick={handleSaveKeys}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Configurations...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Admin Configurations
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
