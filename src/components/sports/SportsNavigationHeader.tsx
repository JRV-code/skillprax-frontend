'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, ShoppingBag, User, 
  ChevronRight, Activity 
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { LanguageSelector } from '@/components/LanguageSelector';

export interface SportsNavigationHeaderProps {
  activeRole?: string;
}

export const SportsNavigationHeader: React.FC<SportsNavigationHeaderProps> = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Athletic Hub', href: '/sports', icon: Activity },
    { label: 'Athlete Profile', href: '/sports/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Brand, Breadcrumbs */}
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <SkillTrackLogo className="w-7 h-7" />
              <div className="flex items-center gap-1.5 font-heading font-black text-sm tracking-tight text-slate-900">
                <span>SKILL-TRACK</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-300">
                  MAIDAN
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 text-xs text-slate-400">
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/profile" className="hover:text-slate-700 transition-colors">Profile</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-700">Athletics Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <LanguageSelector />

            <Link
              href="/skills"
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1"
              title="Switch to Cognitive Workspace"
            >
              <span>Cognitive Track →</span>
            </Link>
          </div>
        </div>

        {/* Bottom Tier: Streamlined Navigation Links */}
        <nav className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default SportsNavigationHeader;
