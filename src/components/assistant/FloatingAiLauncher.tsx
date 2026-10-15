'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export function FloatingAiLauncher() {
  const pathname = usePathname();

  // Hide on the assistant page itself
  if (pathname?.startsWith('/assistant')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      <Link href="/assistant">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] via-emerald-500 to-amber-500 text-white font-bold text-xs shadow-xl shadow-sky-500/25 border border-white/40 cursor-pointer overflow-hidden"
          title="Open SKILL-TRACK AI Guide & Mentor"
        >
          {/* Subtle Shimmer Effect */}
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          </div>

          <span className="relative z-10 font-heading tracking-tight drop-shadow-xs">
            Ask AI Guide
          </span>
        </motion.button>
      </Link>
    </div>
  );
}

export default FloatingAiLauncher;
