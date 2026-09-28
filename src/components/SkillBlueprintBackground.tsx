'use client';

import React from 'react';

export function SkillBlueprintBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Radial Depth Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-700/15 via-blue-950/5 to-transparent blur-[120px] rounded-full"/>
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-amber-500/5 blur-[140px] rounded-full"/>

      {/* Grid Mesh */}
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
        className="absolute inset-0 w-full h-full stroke-blue-400/20 fill-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Physics - Atomic Orbitals (Top Left) */}
        <g transform="translate(120, 140)">
          <ellipse cx="60" cy="60" rx="55" ry="20" strokeDasharray="4 4" transform="rotate(25 60 60)"/>
          <ellipse cx="60" cy="60" rx="55" ry="20" strokeDasharray="4 4" transform="rotate(-35 60 60)"/>
          <ellipse cx="60" cy="60" rx="55" ry="20" strokeDasharray="4 4" transform="rotate(85 60 60)"/>
          <circle cx="60" cy="60" r="6" className="fill-amber-400/70 stroke-amber-300"/>
        </g>

        {/* Programming - Syntax Matrix & Circuit Nodes (Top Right) */}
        <g transform="translate(1000, 100)">
          <path d="M 20 20 L 60 20 L 80 50 L 140 50" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="3" className="fill-amber-400"/>
          <circle cx="140" cy="50" r="3" className="fill-blue-400"/>
          <text x="30" y="80" fill="rgba(96, 165, 250, 0.4)" fontSize="12" fontFamily="monospace">&lt;engine /&gt;</text>
          <text x="40" y="100" fill="rgba(245, 158, 11, 0.4)" fontSize="12" fontFamily="monospace">λ =&gt; mastery</text>
        </g>

        {/* Chemistry - Molecular Hexagonal Ring & Flask (Bottom Left) */}
        <g transform="translate(140, 620)">
          <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" strokeWidth="1.5"/>
          <line x1="28" y1="36" x2="28" y2="64" strokeWidth="1.2" className="stroke-amber-400/50"/>
          <line x1="50" y1="85" x2="50" y2="120" strokeWidth="1.5"/>
          <circle cx="50" cy="120" r="4" className="fill-blue-400"/>
        </g>

        {/* Athletics & Kinetic Velocity Vector (Center Left) */}
        <g transform="translate(80, 380)">
          <path d="M 0 50 Q 40 10 90 40 T 170 30" strokeWidth="1.5" strokeDasharray="6 3"/>
          <polygon points="175,30 165,24 167,36" className="fill-amber-400 stroke-amber-400"/>
          <circle cx="45" cy="28" r="4" className="fill-blue-400"/>
          <text x="60" y="70" fill="rgba(96, 165, 250, 0.35)" fontSize="10" fontFamily="monospace">Δv_kinetic</text>
        </g>

        {/* Art, Craft & Geometry - Compass Rose & Draft Angle (Bottom Right) */}
        <g transform="translate(1080, 580)">
          <circle cx="70" cy="70" r="50" strokeWidth="1"/>
          <line x1="70" y1="10" x2="70" y2="130" strokeDasharray="3 3"/>
          <line x1="10" y1="70" x2="130" y2="70" strokeDasharray="3 3"/>
          <polygon points="70,30 80,70 70,60 60,70" className="fill-amber-400/60 stroke-amber-400"/>
          <polygon points="70,110 80,70 70,80 60,70" className="fill-blue-500/60 stroke-blue-400"/>
        </g>
      </svg>
    </div>
  );
}
