'use client';

import React from 'react';
import { BrandLogo, BrandLogoProps } from './common/BrandLogo';

export interface SkillTrackLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  showWordmark?: boolean;
  className?: string;
  animate?: boolean;
  glow?: boolean;
  href?: string;
  onClick?: () => void;
}

export const SkillTrackLogo: React.FC<SkillTrackLogoProps> = ({
  size = 'md',
  showText = true,
  showWordmark,
  className = '',
  href,
  onClick,
}) => {
  const displayWordmark = showWordmark !== undefined ? showWordmark : showText;

  // Map sizes to BrandLogo supported sizes: 'sm' | 'md' | 'lg'
  const brandSize: 'sm' | 'md' | 'lg' = 
    size === 'xs' || size === 'sm' ? 'sm' :
    size === 'lg' || size === 'xl' || size === 'hero' ? 'lg' : 'md';

  return (
    <div onClick={onClick} className={`inline-flex items-center cursor-pointer ${className}`}>
      <BrandLogo
        size={brandSize}
        showWordmark={displayWordmark}
        href={href}
      />
    </div>
  );
};

export { BrandLogo };
export const SkillpraxLogo = SkillTrackLogo;
export default SkillTrackLogo;
