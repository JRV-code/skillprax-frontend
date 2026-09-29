import React from 'react';

interface CinematicVideoBackgroundProps {
  src?: string;
  overlayOpacity?: number;
}

export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  src = '/assets/background-motion.mp4',
  overlayOpacity = 0.25,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-20"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/60 to-slate-950/80 backdrop-blur-[1px]"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
};

export default CinematicVideoBackground;
