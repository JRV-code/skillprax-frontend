'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Globe,
  Compass,
  Target,
  Trophy,
  Brain,
  Activity,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  StopCircle,
  Menu,
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface TavilySource {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  usedTavilySearch?: boolean;
  sources?: TavilySource[];
  createdAt?: string;
}

interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

const QUICK_STARTERS = [
  {
    icon: Compass,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    title: 'App Walkthrough',
    prompt: 'Guide me step-by-step on how to use every section of Skill-Track (Skills Studio, Sports Hub, timers, quizzes, and certificates).',
  },
  {
    icon: Target,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    title: 'My Active Progress',
    prompt: 'Check my currently enrolled skills and sports and tell me what step I am on and how to pass it.',
  },
  {
    icon: Trophy,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Sports & Technique Q&A',
    prompt: 'Explain the biomechanics, daily training drills, and tailored dietary tips for my sport.',
  },
  {
    icon: Globe,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    title: 'Latest Web Knowledge',
    prompt: 'Search the latest rules, tournament updates, and equipment recommendations for my discipline.',
  },
];

export function SkillTrackAiHub() {
  const { user, token } = useAuthStore();
  const activeUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('skillprax_active_profile_id') || 'default-profile' : 'default-profile');

  // Multi-session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Active Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [forceWebSearch, setForceWebSearch] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, streamingStatus, scrollToBottom]);

  // Auth Headers helper
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': activeUserId,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [activeUserId, token]);

  // 1. Load User's Chat Sessions (strictly scoped to activeUserId)
  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch(`/api/assistant/sessions?userId=${encodeURIComponent(activeUserId)}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list: ChatSession[] = data.sessions || [];
        setSessions(list);

        // Auto-select latest session or leave null for empty welcome state
        if (list.length > 0 && !activeSessionId) {
          setActiveSessionId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('[AI Guide] Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeUserId, getAuthHeaders, activeSessionId]);

  useEffect(() => {
    loadSessions();
  }, [activeUserId]);

  // 2. Load Messages for Active Session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/assistant/sessions/${sessionId}/messages?userId=${encodeURIComponent(activeUserId)}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('[AI Guide] Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeUserId, getAuthHeaders]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, loadMessages]);

  // 3. Create New Chat Session (+ New Chat)
  const handleNewChat = async () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    }
    try {
      const res = await fetch('/api/assistant/sessions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: activeUserId, title: 'New Conversation' }),
      });
      if (res.ok) {
        const data = await res.json();
        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
        setInputPrompt('');
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.warn('[AI Guide] New chat error:', err);
    }
  };

  // 4. Delete Chat Session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/assistant/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          setActiveSessionId(remaining[0]?.id || null);
          if (remaining.length === 0) setMessages([]);
        }
      }
    } catch (err) {
      console.warn('[AI Guide] Delete error:', err);
    }
  };

  // 5. Submit Prompt & Stream Response (Token-by-Token Autoregressive)
  const handleSubmit = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || inputPrompt).trim();
    if (!textToSend || isStreaming) return;

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    let targetSessionId = activeSessionId;

    // If no active session, create one instantly first
    if (!targetSessionId) {
      try {
        const createRes = await fetch('/api/assistant/sessions', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId: activeUserId, title: 'New Conversation' }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          targetSessionId = createData.session.id;
          setSessions((prev) => [createData.session, ...prev]);
          setActiveSessionId(targetSessionId);
        } else {
          throw new Error('Failed to create new session');
        }
      } catch (err) {
        console.error('[AI Guide] Auto-create session failed:', err);
        return;
      }
    }

    // Append user message immediately to the UI
    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Prepare assistant message holder
    const assistantMsgPlaceholder: ChatMessage = {
      role: 'assistant',
      content: '',
      usedTavilySearch: false,
      sources: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsgPlaceholder]);

    setIsStreaming(true);
    setStreamingStatus(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const streamRes = await fetch(`/api/assistant/sessions/${targetSessionId}/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: textToSend,
          forceWebSearch,
          userId: activeUserId,
        }),
        signal: abortController.signal,
      });

      if (!streamRes.ok) {
        const errJson = await streamRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Stream request failed with status ${streamRes.status}`);
      }

      const reader = streamRes.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported by browser.');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(trimmed.slice(6));

            if (event.type === 'status') {
              setStreamingStatus(event.message || null);
            } else if (event.type === 'sources') {
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === 'assistant') {
                  last.sources = event.sources || [];
                  last.usedTavilySearch = true;
                }
                return copy;
              });
            } else if (event.type === 'token') {
              setStreamingStatus(null);
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === 'assistant') {
                  last.content += event.content || '';
                }
                return copy;
              });
            } else if (event.type === 'done') {
              setStreamingStatus(null);
              if (event.sessionTitle && targetSessionId) {
                const updatedTitle = event.sessionTitle;
                setSessions((prev) =>
                  prev.map((s) => (s.id === targetSessionId ? { ...s, title: updatedTitle } : s))
                );
              }
            } else if (event.type === 'error') {
              setStreamingStatus(null);
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === 'assistant') {
                  last.content += `\n\n> ⚠️ *${event.message || 'Stream error occurred.'}*`;
                }
                return copy;
              });
            }
          } catch (_) {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[AI Guide] Streaming error:', err);
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.role === 'assistant' && !last.content) {
            last.content = `I encountered a momentary connection interruption (${err.message || 'Error'}). Please try sending your prompt again.`;
          }
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      setStreamingStatus(null);
      abortControllerRef.current = null;
      scrollToBottom();
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeSessionObj = sessions.find((s) => s.id === activeSessionId);
  const learnerName = user?.name || 'Scholar';
  const learnerLevel = user?.level || 1;
  const learnerStreak = user?.currentStreak || user?.streakDays || 1;

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex bg-gradient-to-br from-[#F8FAFC] via-[#F0FDF4]/30 to-[#F0F9FF]/40 text-slate-800 font-sans overflow-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* ===========================================================================
          LEFT SIDEBAR: PER-ACCOUNT SAVED CHATS & NEW CHAT BUTTON
         =========================================================================== */}
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 shadow-xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Header & New Chat Button */}
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-heading font-black text-slate-900 tracking-tight">
                  AI Guide & Mentor
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Autonomous Intelligence
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-sky-700 hover:to-emerald-600 transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Conversation</span>
          </button>
        </div>

        {/* Center: Saved Chat History (Strictly Scoped to Account) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="px-2 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Conversations</span>
            <span className="text-[10px] lowercase font-normal">{sessions.length} saved</span>
          </div>

          {loadingSessions ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">
              No conversations yet. Start a new chat to ask questions!
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50/80 text-[#0284C7] font-bold border border-sky-200/90 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span className="truncate max-w-[200px] block">
                    {s.title || 'New Conversation'}
                  </span>

                  <button
                    type="button"
                    title="Delete Conversation"
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom: Personalized Profile Badge */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {learnerName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {learnerName}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium block">
                Level {learnerLevel} • {learnerStreak}d Streak
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===========================================================================
          MAIN CHAT CANVAS: GEMINI / CHATGPT-STYLE CONVERSATION EXPERIENCE
         =========================================================================== */}
      <main className="flex-1 flex flex-col h-[calc(100vh-65px)] relative overflow-hidden">
        {/* Top Chat Canvas Control Bar */}
        <header className="h-14 px-4 sm:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {activeSessionObj?.title || 'Skill-Track Intelligent Mentor'}
            </h2>
          </div>

          {/* Engine & Live Search Status Pill */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Groq LLaMA 3.3 70B</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <Globe className="w-3 h-3 text-[#0284C7]" />
              <span>Live Tavily Search</span>
            </span>
          </div>
        </header>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
              <p className="text-xs font-medium">Loading conversation history...</p>
            </div>
          ) : messages.length === 0 ? (
            /* ===========================================================================
                EMPTY / WELCOME SCREEN WITH 4 QUICK-STARTER CARDS
               =========================================================================== */
            <div className="max-w-3xl mx-auto py-8 sm:py-16 space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-[#0284C7] p-0.5 mx-auto shadow-lg shadow-sky-500/10 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-amber-500">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                  Hello, {learnerName}! How can I guide your mastery today?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                  I am your official SKILL-TRACK AI Mentor. Ask me anything about using the platform, explore step-by-step guidance, ask sport or skill technique questions, or search the live web for verified data.
                </p>
              </motion.div>

              {/* 4 Clickable Quick-Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                {QUICK_STARTERS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.25 }}
                      onClick={() => handleSubmit(card.prompt)}
                      className="p-4 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${card.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                          {card.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {card.prompt}
                      </p>
                      <span className="text-[10px] font-bold text-sky-600 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ask this prompt</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ===========================================================================
                MESSAGE THREAD WITH REAL-TIME STREAMING & MARKDOWN FORMATTING
               =========================================================================== */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0284C7] to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-[#0284C7] to-indigo-600 text-white'
                          : 'bg-white border border-slate-200/90 text-slate-800'
                      }`}
                    >
                      {/* Copy Action on Hover */}
                      {!isUser && msg.content && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Content */}
                      {isUser ? (
                        <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-slate prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-xs sm:prose-p:text-sm prose-p:leading-relaxed prose-li:text-xs sm:prose-li:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Verified Sources Pill List (Tavily Results) */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                            <Globe className="w-3 h-3 text-[#0284C7]" />
                            <span>Live Verified Sources (Tavily)</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-[10px] font-semibold transition-all cursor-pointer truncate max-w-xs"
                              >
                                <span className="truncate">{src.title || src.domain}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                        {learnerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Streaming Status Indicator (Searching Web) */}
              {streamingStatus && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-bold max-w-md animate-pulse">
                  <Globe className="w-4 h-4 animate-spin" />
                  <span>{streamingStatus}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ===========================================================================
            BOTTOM PROMPT COMPOSER BAR
           =========================================================================== */}
        <div className="p-3 sm:p-5 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shrink-0 shadow-lg">
          <div className="max-w-3xl mx-auto space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="relative flex items-center bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-sky-300 focus-within:border-sky-400 transition-all"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => {
                  setInputPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask anything about Skill-Track, your current step, any sport, or any skill..."
                className="flex-1 bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-32"
              />

              <div className="flex items-center gap-1.5 pr-1">
                {/* Live Search Toggle Pill */}
                <button
                  type="button"
                  onClick={() => setForceWebSearch((prev) => !prev)}
                  title={forceWebSearch ? 'Live Web Search Forced ON' : 'Live Web Search Auto-Detect'}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                    forceWebSearch
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  <Globe className={`w-3.5 h-3.5 ${forceWebSearch ? 'text-emerald-600' : ''}`} />
                  <span className="hidden sm:inline text-[11px]">
                    {forceWebSearch ? 'Web ON' : 'Web Auto'}
                  </span>
                </button>

                {/* Send or Stop Button */}
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white shadow-xs transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
              <span className="hidden sm:inline">Personalized with your active skills & health settings</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SkillTrackAiHub;
