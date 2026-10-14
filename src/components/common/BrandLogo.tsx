'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  showWordmark?: boolean;
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md',
  href = '/',
}) => {
  const heightMap: Record<string, string> = {
    xs: 'h-6',
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-20',
    xl: 'h-20 sm:h-24 md:h-28',
    '2xl': 'h-28 sm:h-32 md:h-36',
    hero: 'h-28 sm:h-36 md:h-44 lg:h-48',
  };

  const content = (
    <div className="relative flex items-center justify-center">
      <Image 
        src="/logo.png" 
        alt="Skill-Track Logo" 
        width={420} 
        height={140} 
        priority 
        className={`${heightMap[size] || heightMap.md} w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:opacity-95`}
      />
    </div>
  );

  if (!href) {
    return (
      <div className={`inline-flex items-center gap-2 group transition-transform ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link 
      href={href} 
      className={`inline-flex items-center gap-2 group transition-transform active:scale-95 ${className}`}
    >
      {content}
    </Link>
  );
};

export default BrandLogo;
