'use client';

import React from 'react';

export function SkillBlueprintBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Deep Space Radial Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-700/15 via-blue-950/5 to-transparent blur-[140px] rounded-full"/>
      <div className="absolute bottom-10 right-10 w-[600px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full"/>

      {/* Sci-Fi Blueprint Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Sci-Fi 2D Schematics Overlay */}
      <svg
        className="absolute inset-0 w-full h-full stroke-blue-400/25 fill-none opacity-45"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ATHLETICS 1: Sprint Velocity Vector & Runner Schematic (Top Left) */}
        <g transform="translate(100, 100)">
          {/* Head & Body */}
          <circle cx="50" cy="30" r="8" className="fill-amber-400/80 stroke-amber-400"/>
          <line x1="50" y1="38" x2="35" y2="70" strokeWidth="2.5"/>
          {/* Arms in sprint pump */}
          <line x1="45" y1="48" x2="25" y2="40" strokeWidth="2"/>
          <line x1="25" y1="40" x2="15" y2="55" strokeWidth="2"/>
          <line x1="45" y1="48" x2="65" y2="58" strokeWidth="2"/>
          {/* Legs in drive phase */}
          <line x1="35" y1="70" x2="60" y2="90" strokeWidth="2.5"/>
          <line x1="60" y1="90" x2="80" y2="85" strokeWidth="2"/>
          <line x1="35" y1="70" x2="15" y2="95" strokeWidth="2.5"/>
          <line x1="15" y1="95" x2="5" y2="120" strokeWidth="2"/>
          {/* Velocity Vector lines */}
          <path d="M 90 60 L 150 60 M 135 55 L 150 60 L 135 65" strokeWidth="1.5" className="stroke-amber-400"/>
          <text x="95" y="80" fill="rgba(245, 158, 11, 0.6)" fontSize="10" fontFamily="monospace">v_sprint = 10.4 m/s</text>
        </g>

        {/* ATHLETICS 2: Hurdler / Jumper Trajectory (Center Left) */}
        <g transform="translate(80, 420)">
          <path d="M 0 80 Q 60 10 120 40 T 200 70" strokeWidth="1.5" strokeDasharray="5 4"/>
          <circle cx="120" cy="40" r="6" className="fill-blue-400"/>
          <line x1="120" y1="46" x2="135" y2="65" strokeWidth="2"/>
          <line x1="135" y1="65" x2="160" y2="55" strokeWidth="2"/>
          <line x1="135" y1="65" x2="110" y2="75" strokeWidth="2"/>
          <text x="30" y="100" fill="rgba(96, 165, 250, 0.4)" fontSize="10" fontFamily="monospace">parabolic_trajectory</text>
        </g>

        {/* PROGRAMMING: Syntax Matrix & Logic Bus (Top Right) */}
        <g transform="translate(1050, 110)">
          <rect x="0" y="0" width="160" height="90" rx="8" strokeWidth="1.2" className="stroke-blue-500/40"/>
          <circle cx="15" cy="15" r="3" className="fill-amber-400"/>
          <circle cx="27" cy="15" r="3" className="fill-blue-400"/>
          <circle cx="39" cy="15" r="3" className="fill-blue-600"/>
          <text x="15" y="45" fill="rgba(96, 165, 250, 0.6)" fontSize="11" fontFamily="monospace">const mastery =</text>
          <text x="25" y="65" fill="rgba(245, 158, 11, 0.6)" fontSize="11" fontFamily="monospace">async (acu) =&gt; ...</text>
        </g>

        {/* PHYSICS: Quantum Atomic Field & Spin Vectors (Center Right) */}
        <g transform="translate(1100, 360)">
          <ellipse cx="60" cy="60" rx="65" ry="22" strokeDasharray="5 3" transform="rotate(30 60 60)"/>
          <ellipse cx="60" cy="60" rx="65" ry="22" strokeDasharray="5 3" transform="rotate(-30 60 60)"/>
          <ellipse cx="60" cy="60" rx="65" ry="22" strokeDasharray="5 3" transform="rotate(90 60 60)"/>
          <circle cx="60" cy="60" r="7" className="fill-amber-400/80 stroke-amber-300"/>
          <circle cx="115" cy="35" r="3" className="fill-blue-400"/>
          <text x="20" y="110" fill="rgba(96, 165, 250, 0.4)" fontSize="10" fontFamily="monospace">Ψ(r, θ, φ)</text>
        </g>

        {/* CHEMISTRY: Molecular Hex-Ring with Reaction Bonds (Bottom Left) */}
        <g transform="translate(140, 680)">
          <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" strokeWidth="1.8"/>
          <line x1="28" y1="36" x2="28" y2="64" strokeWidth="1.4" className="stroke-amber-400/60"/>
          <line x1="50" y1="85" x2="50" y2="120" strokeWidth="1.5"/>
          <circle cx="50" cy="120" r="5" className="fill-blue-400"/>
          <text x="65" y="125" fill="rgba(96, 165, 250, 0.4)" fontSize="10" fontFamily="monospace">C6H6-Ring</text>
        </g>

        {/* ART & GEOMETRY: Golden Ratio Spiral & Compass Stylus (Bottom Right) */}
        <g transform="translate(1080, 640)">
          <circle cx="70" cy="70" r="55" strokeWidth="1"/>
          <path d="M 70 70 A 15 15 0 0 1 85 85 A 30 30 0 0 1 55 115 A 60 60 0 0 1 -5 55" strokeWidth="1.5" className="stroke-amber-400/50"/>
          <line x1="70" y1="15" x2="70" y2="125" strokeDasharray="4 4"/>
          <line x1="15" y1="70" x2="125" y2="70" strokeDasharray="4 4"/>
          <polygon points="70,30 78,70 70,62 62,70" className="fill-amber-400/60 stroke-amber-400"/>
          <text x="35" y="145" fill="rgba(245, 158, 11, 0.4)" fontSize="10" fontFamily="monospace">φ = 1.618</text>
        </g>
      </svg>
    </div>
  );
}
