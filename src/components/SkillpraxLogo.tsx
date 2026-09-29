'use client';

import React from 'react';

interface SkillpraxLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showWordmark?: boolean;
  className?: string;
  animate?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const SkillpraxLogo: React.FC<SkillpraxLogoProps> = ({
  size = 'md',
  showText = true,
  showWordmark,
  className = '',
  animate = true,
  glow = false,
  onClick,
}) => {
  const displayWordmark = showWordmark !== undefined ? showWordmark : showText;

  const sizeMap = {
    xs: { iconSize: 28, textSize: 'text-lg', gap: 'gap-1.5' },
    sm: { iconSize: 38, textSize: 'text-xl', gap: 'gap-2' },
    md: { iconSize: 52, textSize: 'text-2xl', gap: 'gap-2.5' },
    lg: { iconSize: 84, textSize: 'text-4xl', gap: 'gap-3.5' },
    xl: { iconSize: 130, textSize: 'text-5xl', gap: 'gap-4' },
    hero: { iconSize: 180, textSize: 'text-6xl', gap: 'gap-5' },
  };

  const { iconSize, textSize } = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft radial ambient glow & rotating halo */}
        {glow && (
          <>
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-700 group-hover:opacity-75 group-hover:scale-125"
              style={{
                background: 'radial-gradient(circle, rgba(0, 145, 255, 0.45) 0%, rgba(245, 158, 11, 0.35) 45%, rgba(16, 185, 129, 0.2) 70%, transparent 85%)',
                transform: 'scale(1.45)',
              }}
            />
            {/* Subtle revolving auroral aura */}
            <div
              className="absolute -inset-4 rounded-full blur-xl opacity-20 pointer-events-none animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, #0091FF, #F59E0B, #10B981, #0091FF)',
                animationDuration: '14s',
              }}
            />
          </>
        )}

        {/* Vector SVG replicating l2.png */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 transition-all duration-300 ${
            animate ? 'group-hover:scale-108 group-hover:-translate-y-1' : ''
          }`}
          style={{
            filter: glow
              ? 'drop-shadow(0 6px 22px rgba(0, 145, 255, 0.35))'
              : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06))',
          }}
        >
          <defs>
            {/* Sky Blue to Electric Blue for Main Arrow left facet */}
            <linearGradient id="arrowFacetLeft" x1="180" y1="90" x2="330" y2="210" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0091FF" />
            </linearGradient>

            {/* Deep Royal Blue for Main Arrow right facet */}
            <linearGradient id="arrowFacetRight" x1="280" y1="70" x2="350" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0091FF" />
              <stop offset="100%" stopColor="#0062D6" />
            </linearGradient>

            {/* Primary Blue River Ribbon Gradient */}
            <linearGradient id="blueRiverGrad" x1="120" y1="210" x2="310" y2="420" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0091FF" />
              <stop offset="50%" stopColor="#0080FF" />
              <stop offset="100%" stopColor="#0099FF" />
            </linearGradient>

            {/* Vibrant Golden Amber Ribbon Gradient */}
            <linearGradient id="goldRibbonGrad" x1="220" y1="160" x2="370" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Gold Compass Accents */}
            <linearGradient id="goldCompass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* 1. TOP COMPASS POINT: Vertical 4-point Diamond in Amber/Gold */}
          <polygon
            points="253,24 269,63 253,109 237,63"
            fill="url(#goldCompass)"
            className="transition-transform duration-300 origin-[253px_66px] group-hover:scale-115"
          />

          {/* 2. WEST COMPASS POINT: Golden Arrowhead pointing West */}
          <polygon
            points="99,207 160,188 160,225"
            fill="url(#goldCompass)"
            className="transition-transform duration-300 origin-[130px_207px] group-hover:-translate-x-1"
          />

          {/* 3. EAST COMPASS POINT: Golden Arrowhead pointing East */}
          <polygon
            points="401,207 339,188 339,225"
            fill="url(#goldCompass)"
            className="transition-transform duration-300 origin-[370px_207px] group-hover:translate-x-1"
          />

          {/* 4. MAIN FACETED 3D UPWARD-RIGHT ARROW */}
          <g className="transition-transform duration-300 origin-[260px_140px] group-hover:translate-x-1 group-hover:-translate-y-1">
            <polygon points="350,62 172,175 279,160" fill="url(#arrowFacetLeft)" />
            <polygon points="350,62 279,160 314,222" fill="url(#arrowFacetRight)" />
          </g>

          {/* 5. DYNAMIC 'S' HIGHWAY / RIVER RIBBON (BLUE PATH) */}
          <path
            d="M 276,164 C 220,190 178,214 170,240 C 158,280 205,295 240,312 C 285,335 300,360 270,395 C 240,430 185,420 115,395 C 160,420 220,435 255,410 C 285,385 270,345 220,320 C 180,300 135,275 145,225 C 155,180 215,160 276,164 Z"
            fill="url(#blueRiverGrad)"
            className="transition-all duration-300 group-hover:brightness-110"
          />

          {/* 6. DYNAMIC GOLDEN ACCENT RIBBON */}
          <path
            d="M 275,163 C 228,198 200,224 200,230 C 200,234 235,220 275,235 C 335,260 365,305 358,350 C 350,395 305,418 220,390 C 280,410 335,398 348,365 C 362,328 342,280 288,255 C 255,240 228,245 220,242 C 232,228 260,200 275,163 Z"
            fill="url(#goldRibbonGrad)"
            className="transition-all duration-300 group-hover:brightness-115"
          />
        </svg>
      </div>

      {/* WORDMARK: "Skill" (Sky Blue) + "prax" (Warm Amber) */}
      {displayWordmark && (
        <div className={`flex items-baseline font-heading font-extrabold tracking-tight mt-1 transition-transform duration-300 group-hover:scale-105 ${textSize}`}>
          <span className="text-[#0091FF] transition-colors duration-200 group-hover:text-[#38BDF8]">
            Skill
          </span>
          <span className="text-[#F59E0B] transition-colors duration-200 group-hover:text-[#FBBF24]">
            prax
          </span>
        </div>
      )}
    </div>
  );
};

export default SkillpraxLogo;
