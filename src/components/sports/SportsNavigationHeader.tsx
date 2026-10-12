'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Compass, Shield, ShoppingBag, Truck, User, 
  Building2, Inbox, ArrowLeft, Activity, Flame, ChevronRight 
} from 'lucide-react';
import { SkillTrackLogo } from '@/components/SkillTrackLogo';
import { LanguageSelector } from '@/components/LanguageSelector';

interface SportsNavigationHeaderProps {
  activeRole?: 'athlete' | 'club';
  onToggleRole?: (role: 'athlete' | 'club') => void;
}

export const SportsNavigationHeader: React.FC<SportsNavigationHeaderProps> = ({
  activeRole = 'athlete',
  onToggleRole,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleClick = (newRole: 'athlete' | 'club') => {
    if (onToggleRole) {
      onToggleRole(newRole);
    }
    if (newRole === 'club') {
      router.push('/sports/club');
    } else if (pathname === '/sports/club') {
      router.push('/sports');
    }
  };

  const navItems = [
    { label: 'Training Studio', href: '/sports', icon: Activity },
    { label: 'Clubs Near Me', href: '/sports/explore', icon: Compass },
    { label: 'Athlete Profile', href: '/sports/profile', icon: User },
    { label: 'Club Portal', href: '/sports/club', icon: Building2 },
    { label: 'Sports Shop', href: '/sports/shop', icon: ShoppingBag },
    { label: 'Managed Vans', href: '/sports/travel', icon: Truck },
    { label: 'Inbox & Escrow', href: '/sports/inbox', icon: Inbox },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Brand, Breadcrumbs, and Dual-Role Switcher */}
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

          {/* DUAL-ROLE TOGGLE SWITCHER */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleClick('athlete')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'athlete' && pathname !== '/sports/club'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Athlete Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleClick('club')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeRole === 'club' || pathname === '/sports/club'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Club Portal</span>
              </button>
            </div>

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

        {/* Bottom Tier: Sub-Module Pills Navigation */}
        <nav className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-xl font-heading font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 border border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-white/60 hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
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
