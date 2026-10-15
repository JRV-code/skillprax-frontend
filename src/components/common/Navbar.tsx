'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  User, 
  Flame, 
  LogIn, 
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuthStore } from '@/store/useAuthStore';
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    {
      id: 'skills',
      href: '/skills',
      label: 'Skills Studio',
      subtext: 'Cognitive & Code',
      icon: Brain,
      activeColor: 'text-[#0284C7]',
      badgeColor: 'bg-sky-50 text-[#0284C7]',
    },
    {
      id: 'sports',
      href: '/sports',
      label: 'Sports Hub',
      subtext: 'Athletics & Clubs',
      icon: Activity,
      activeColor: 'text-[#10B981]',
      badgeColor: 'bg-emerald-50 text-[#10B981]',
    },
    {
      id: 'profile',
      href: '/profile',
      label: 'Profile Hub',
      subtext: 'Identity & Region',
      icon: User,
      activeColor: 'text-[#6366F1]',
      badgeColor: 'bg-indigo-50 text-[#6366F1]',
    },
    {
      id: 'assistant',
      href: '/assistant',
      label: 'AI Guide',
      subtext: 'Intelligent Mentor',
      icon: Sparkles,
      activeColor: 'text-[#D97706]',
      badgeColor: 'bg-amber-50 text-[#D97706]',
    },
  ];

  const getActiveTab = () => {
    if (pathname?.startsWith('/skills')) return 'skills';
    if (pathname?.startsWith('/sports')) return 'sports';
    if (pathname?.startsWith('/profile')) return 'profile';
    if (pathname?.startsWith('/assistant')) return 'assistant';
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Top Navbar Left: Brand */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" />
          </div>

          {/* Center: 3 Dedicated Tri-Separation Tabs with Sliding Spring Pill */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-inner">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? `${tab.activeColor} shadow-sm`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60"
                      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? tab.activeColor : 'text-slate-400'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.id === 'skills' ? 'Skills' : tab.id === 'sports' ? 'Sports' : tab.id === 'profile' ? 'Profile' : 'AI Guide'}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User State / Auth Trigger / Streak */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Streak indicator if user is present */}
            {user && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-mono font-bold text-amber-900">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />
                <span>{(user as any).streakDays || (user as any).currentStreak || 1}d STREAK</span>
              </div>
            )}

            {/* City indicator if available */}
            {(user as any)?.city && (
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
                <MapPin className="w-3 h-3 text-[#6366F1]" />
                <span>{(user as any).city}</span>
              </div>
            )}

            {/* Universal Auth Trigger */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-[#6366F1] flex items-center justify-center font-bold text-[10px]">
                  {((user as any).name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {(user as any).name || 'Learner'}
                </span>
              </Link>
            ) : (
              <motion.button
                onClick={() => setAuthModalOpen(true)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#0284C7] hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Join</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Universal Auth Modal */}
      <UnifiedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
