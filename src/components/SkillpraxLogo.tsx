import React from 'react';

interface SkillpraxLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SkillpraxLogo: React.FC<SkillpraxLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const textDimensions = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
      <svg
        className={`${iconDimensions} flex-shrink-0 transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Gold Starpoint */}
        <polygon points="100,12 108,32 100,52 92,32" fill="#F59E0B" />
        {/* Left Gold Starpoint */}
        <polygon points="36,88 56,80 76,88 56,96" fill="#F59E0B" />
        {/* Right Gold Starpoint */}
        <polygon points="164,88 144,80 124,88 144,96" fill="#F59E0B" />

        {/* Dynamic Upward Compass Needle Arrow */}
        <path
          d="M 68 76 L 146 30 L 126 100 L 102 70 Z"
          fill="#0284C7"
          className="drop-shadow-sm"
        />
        <path
          d="M 146 30 L 126 100 L 102 70 Z"
          fill="#0369A1"
          opacity="0.8"
        />

        {/* Winding Pathway S-Curve (Cyan/Blue Primary Stream) */}
        <path
          d="M 46 168 C 76 150 94 134 82 108 C 72 86 98 70 114 62 C 104 74 94 88 102 106 C 112 128 86 148 46 168 Z"
          fill="#0284C7"
        />

        {/* Winding Pathway S-Curve (Gold Accent Stream) */}
        <path
          d="M 90 166 C 124 148 144 130 132 108 C 124 94 104 84 92 80 C 108 84 122 96 124 108 C 128 126 112 146 90 166 Z"
          fill="#F59E0B"
        />
      </svg>

      {/* Two-Tone Wordmark */}
      {showWordmark && (
        <span className={`font-black tracking-tight ${textDimensions}`}>
          <span className="text-[#0284C7]">Skill</span>
          <span className="text-[#F59E0B]">prax</span>
        </span>
      )}
    </div>
  );
};

export default SkillpraxLogo;
