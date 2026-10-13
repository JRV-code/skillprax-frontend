'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showWordmark?: boolean;
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md',
  href = '/',
}) => {
  const heightMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  };

  const content = (
    <div className="relative flex items-center">
      <Image 
        src="/logo.png" 
        alt="Skill-Track Logo" 
        width={180} 
        height={60} 
        priority 
        className={`${heightMap[size]} w-auto object-contain transition-opacity group-hover:opacity-90`}
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
