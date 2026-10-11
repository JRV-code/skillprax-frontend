import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
  href = '/',
}) => {
  const dimensions = {
    sm: { width: 24, height: 24, text: 'text-lg' },
    md: { width: 32, height: 32, text: 'text-xl' },
    lg: { width: 44, height: 44, text: 'text-2xl' },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/brand/logo.png"
          alt="SKILL-TRACK Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
          onError={(e) => {
            // Fallback to SVG if PNG fails
            (e.target as HTMLImageElement).src = '/brand/logo.svg';
          }}
        />
      </div>
      {showWordmark && (
        <span className={`${dimensions.text} font-black tracking-tight leading-none`}>
          <span className="text-[#0284C7]">SKILL-</span>
          <span className="text-[#F59E0B]">TRACK</span>
        </span>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export default BrandLogo;
