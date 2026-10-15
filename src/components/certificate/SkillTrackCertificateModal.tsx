'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Download,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface SkillTrackCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  skillName: string;
  completionDate?: string;
  isPhysical?: boolean;
}

export function SkillTrackCertificateModal({
  isOpen,
  onClose,
  userName,
  skillName,
  completionDate,
  isPhysical = false,
}: SkillTrackCertificateModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Formatted date
  const effectiveDate = completionDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Deterministic Credential ID
  const credentialId = React.useMemo(() => {
    const slug = (skillName || 'SKILL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const hash = Math.abs(
      (userName + skillName).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
    ).toString(16).toUpperCase().padStart(6, '0').slice(-6);
    return `SKT-${slug}-${hash}`;
  }, [userName, skillName]);

  // Load Google Calligraphy & Prestige Fonts and run 1.8s Synthesis Loading Screen
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);

    // Inject fonts link into head if not already loaded
    const fontId = 'skilltrack-calligraphy-fonts';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap';
      document.head.appendChild(link);
    }

    // Timer: exactly 1.8 seconds (1800ms) loading animation
    const startTime = Date.now();
    const minWait = 1800;

    const timer = setTimeout(async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await Promise.race([
            document.fonts.ready,
            new Promise((res) => setTimeout(res, 800)),
          ]);
        }
      } catch (_) {}

      setIsLoading(false);

      // Trigger celebratory confetti upon revealing certificate
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0284C7', '#10B981', '#F59E0B', '#6366F1'],
        });
      } catch (_) {}
    }, minWait);

    return () => clearTimeout(timer);
  }, [isOpen, userName, skillName]);

  // High-Resolution Pure HTML5 Canvas Generator (2400 × 1650 px, landscape 16:11)
  const handleDownloadHD = async () => {
    try {
      setIsDownloading(true);

      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1650;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Base Canvas Background (Crisp Ivory to White)
      const baseGrad = ctx.createLinearGradient(0, 0, 2400, 1650);
      baseGrad.addColorStop(0, '#FCFBF8');
      baseGrad.addColorStop(0.5, '#FFFFFF');
      baseGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 2400, 1650);

      // 2. Minimalistic Soft Watercolor Corner Meshes (Matching App Palette)
      // Top-Left: Sky Blue
      const tlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 900);
      tlGrad.addColorStop(0, 'rgba(2, 132, 199, 0.08)');
      tlGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.02)');
      tlGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tlGrad;
      ctx.fillRect(0, 0, 1200, 800);

      // Top-Right: Emerald Green
      const trGrad = ctx.createRadialGradient(2400, 0, 0, 2400, 0, 900);
      trGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      trGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.02)');
      trGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = trGrad;
      ctx.fillRect(1200, 0, 1200, 800);

      // Bottom-Left: Warm Gold
      const blGrad = ctx.createRadialGradient(0, 1650, 0, 0, 1650, 900);
      blGrad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
      blGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.02)');
      blGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = blGrad;
      ctx.fillRect(0, 850, 1200, 800);

      // Bottom-Right: Indigo
      const brGrad = ctx.createRadialGradient(2400, 1650, 0, 2400, 1650, 900);
      brGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      brGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.02)');
      brGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = brGrad;
      ctx.fillRect(1200, 850, 1200, 800);

      // 3. Subtle Center Watermark Emblem
      ctx.save();
      ctx.globalAlpha = 0.035;
      ctx.beginPath();
      ctx.arc(1200, 825, 360, 0, Math.PI * 2);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#0284C7';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1200, 825, 330, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();
      ctx.restore();

      // 4. Refined Dual Geometric Border
      // Outer border (Slate)
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#CBD5E1';
      ctx.strokeRect(60, 60, 2280, 1530);

      // Inner border (Gold/Bronze)
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#D97706';
      ctx.strokeRect(84, 84, 2232, 1482);

      // Corner Ornamental Diamonds / Flourishes
      const drawCornerFlourish = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };
      drawCornerFlourish(84, 84);
      drawCornerFlourish(2316, 84);
      drawCornerFlourish(84, 1566);
      drawCornerFlourish(2316, 1566);

      // 5. Centered SKILL-TRACK Logo
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoWidth = 320;
          const logoHeight = (img.height / img.width) * logoWidth;
          ctx.drawImage(img, 1200 - logoWidth / 2, 140, logoWidth, logoHeight);
          resolve();
        };
        img.onerror = () => {
          // Clean vector fallback if image loading encounters cross-origin
          ctx.save();
          ctx.font = 'bold 44px "Playfair Display", serif';
          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          ctx.fillText('SKILL-TRACK', 1200, 190);
          ctx.restore();
          resolve();
        };
        img.src = '/logo.png';
      });

      // 6. Main Heading in Center: "Certificate"
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '112px "Great Vibes", "Alex Brush", cursive';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('Certificate', 1200, 395);

      // Sub-label: "OF COMPLETION"
      ctx.font = 'bold 22px "Playfair Display", serif';
      ctx.fillStyle = '#D97706';
      ctx.fillText('O F   C O M P L E T I O N', 1200, 445);

      // Sky-Blue -> Emerald -> Gold Accent Bar
      const barGrad = ctx.createLinearGradient(900, 0, 1500, 0);
      barGrad.addColorStop(0, '#0284C7');
      barGrad.addColorStop(0.5, '#10B981');
      barGrad.addColorStop(1, '#F59E0B');
      ctx.strokeStyle = barGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(900, 470);
      ctx.lineTo(1500, 470);
      ctx.stroke();

      // Diamond Pip in center
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(1200, 464);
      ctx.lineTo(1206, 470);
      ctx.lineTo(1200, 476);
      ctx.lineTo(1194, 470);
      ctx.closePath();
      ctx.fill();

      // 7. Center Declaration Body
      // Statement Line 1: "This is to certify that"
      ctx.font = 'italic 34px "Playfair Display", serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('This is to certify that', 1200, 565);

      // Recipient Name in Calligraphy
      ctx.font = '700 88px "Great Vibes", "Dancing Script", cursive';
      ctx.fillStyle = '#0284C7';
      ctx.fillText(userName, 1200, 680);

      // Golden underline below user name
      const nameMetrics = ctx.measureText(userName);
      const underHalf = Math.max(220, Math.min(650, nameMetrics.width / 2 + 50));
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(1200 - underHalf, 705);
      ctx.lineTo(1200 + underHalf, 705);
      ctx.stroke();

      // Statement Line 2: "has completed the learning of"
      ctx.font = 'italic 34px "Playfair Display", serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('has completed the learning of', 1200, 785);

      // Completed Skill or Sport Name
      ctx.font = 'bold 60px "Playfair Display", serif';
      ctx.fillStyle = '#065F46';
      ctx.fillText(skillName, 1200, 875);

      // Statement Line 3: "using Skill-Track and has fully completed the tasks provided and has passed all the test."
      ctx.font = '30px "Playfair Display", serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(
        'using Skill-Track and has fully completed the tasks provided and has passed all the test.',
        1200,
        960
      );

      // 8. Delicate Minimalistic Divider
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(800, 1030);
      ctx.lineTo(1600, 1030);
      ctx.stroke();

      // 9. Official Tagline Below Declaration
      ctx.font = 'italic 38px "Dancing Script", "Great Vibes", cursive';
      ctx.fillStyle = '#D97706';
      ctx.fillText(
        '“Build your skill, Rise to your peak and let your progress speak”',
        1200,
        1105
      );

      // 10. Bottom Left Corner: Credential Metadata
      ctx.textAlign = 'left';
      ctx.font = '22px "Playfair Display", serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Date of Completion: ${effectiveDate}`, 200, 1420);

      ctx.font = '18px monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`Credential ID: ${credentialId}`, 200, 1455);

      ctx.font = 'bold 18px "Playfair Display", serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('✓ Deterministically Verified (100% Socratic Clearance)', 200, 1490);

      // 11. Bottom Right Corner: Official Sign-Off
      ctx.textAlign = 'right';

      // Signature flourish line
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1820, 1425);
      ctx.lineTo(2200, 1425);
      ctx.stroke();

      // Sign-off text: "Certified by Team Skill-Track"
      ctx.font = 'bold 28px "Playfair Display", serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('Certified by Team Skill-Track', 2200, 1465);

      ctx.font = '18px "Playfair Display", serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Autonomous AI Mastery Authority', 2200, 1495);

      // Seal Gold Badge on bottom right
      ctx.save();
      ctx.translate(1750, 1450);
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 0);
      ctx.restore();

      ctx.restore();

      // 12. Trigger Instant Clean Download
      const safeSkill = (skillName || 'Skill').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      const safeUser = (userName || 'Learner').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      const fileName = `Skill-Track-Certificate-${safeSkill}-${safeUser}.png`;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('[CertificateExport] Failed:', err);
      setIsDownloading(false);
      alert('Failed to generate high-resolution certificate. Please try the Print / PDF option.');
    }
  };

  // Print as PDF Option
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        {/* MODAL WRAPPER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col"
        >
          {/* TOP BAR / CONTROLS (Hidden when printing) */}
          <div className="print:hidden p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Official Skill-Track Certificate of Completion
                </h3>
                <p className="text-[11px] text-slate-400">
                  100% Deterministic Mastery Credential
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHD}
                disabled={isLoading || isDownloading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#0284C7] hover:from-emerald-600 hover:to-sky-600 text-white text-xs font-black shadow-md shadow-sky-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Rendering HD PNG...' : '⬇ Download Certificate (HD PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN MODAL BODY */}
          <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-100/70 overflow-auto">
            {isLoading ? (
              /* DEDICATED SYNTHESIS LOADING SCREEN (1.8s) */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 sm:py-32 flex flex-col items-center justify-center text-center space-y-5"
              >
                {/* Glowing Tri-Color Seal Spinner */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#0284C7] border-r-[#10B981] border-b-[#F59E0B] border-l-transparent animate-spin" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 border border-slate-200 flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-heading font-black text-slate-900 tracking-tight">
                    Crafting Your Official Skill-Track Certificate...
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Verifying 100% milestone completion & inscribing calligraphy credentials for{' '}
                    <strong className="text-slate-900">{userName}</strong>...
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Loading authentic Calligraphy typography</span>
                </div>
              </motion.div>
            ) : (
              /* THE CALLIGRAPHY CERTIFICATE CANVAS (16:11 Aspect Ratio) */
              <motion.div
                ref={certificateRef}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="certificate-print-container relative w-full aspect-[16/11] max-w-4xl bg-[#FDFAF6] rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-200 overflow-hidden flex flex-col justify-between text-center select-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 10% 10%, rgba(2, 132, 199, 0.07) 0%, transparent 45%), radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.07) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(245, 158, 11, 0.07) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.07) 0%, transparent 45%)',
                }}
              >
                {/* Dual Border Framing */}
                <div className="absolute inset-3 sm:inset-4 border-2 border-slate-300 rounded-xl pointer-events-none" />
                <div className="absolute inset-5 sm:inset-6 border border-amber-600/80 rounded-lg pointer-events-none" />

                {/* Corner Accents */}
                <div className="absolute top-5 left-5 sm:top-6 sm:left-6 w-3 h-3 border-t-2 border-l-2 border-[#0284C7]" />
                <div className="absolute top-5 right-5 sm:top-6 sm:right-6 w-3 h-3 border-t-2 border-r-2 border-[#10B981]" />
                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 w-3 h-3 border-b-2 border-l-2 border-[#F59E0B]" />
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 w-3 h-3 border-b-2 border-r-2 border-[#6366F1]" />

                {/* Subtle Center Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <div className="w-80 h-80 rounded-full border-8 border-slate-900 flex items-center justify-center">
                    <span className="text-9xl font-serif">★</span>
                  </div>
                </div>

                {/* 1. TOP HEADER: Centered Skill-Track Logo */}
                <div className="relative z-10 pt-2 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="Skill-Track"
                    className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                    onError={(e) => {
                      // Fallback text if logo.png fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* 2. MAIN TITLE: "Certificate" in Calligraphy Script */}
                <div className="relative z-10 space-y-1 my-1 sm:my-2">
                  <h1
                    className="text-4xl sm:text-6xl md:text-7xl text-slate-900 leading-tight tracking-normal font-normal drop-shadow-xs"
                    style={{ fontFamily: "'Great Vibes', 'Alex Brush', cursive" }}
                  >
                    Certificate
                  </h1>
                  <span
                    className="block text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-[0.25em]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    O F   C O M P L E T I O N
                  </span>

                  {/* Gradient Accent Line with Diamond */}
                  <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[#0284C7] to-[#10B981]" />
                    <span className="text-[10px] text-amber-600">✦</span>
                    <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-[#F59E0B] to-[#10B981]" />
                  </div>
                </div>

                {/* 3. CENTER DECLARATION BODY */}
                <div className="relative z-10 space-y-2 sm:space-y-3 px-4 sm:px-8 max-w-2xl mx-auto my-auto">
                  <p
                    className="text-xs sm:text-sm text-slate-600 italic"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    This is to certify that
                  </p>

                  {/* User's Name in Large Calligraphy */}
                  <div className="py-0.5">
                    <h2
                      className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#0284C7] drop-shadow-xs leading-none"
                      style={{ fontFamily: "'Great Vibes', 'Dancing Script', cursive" }}
                    >
                      {userName}
                    </h2>
                    <div className="w-48 sm:w-64 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
                  </div>

                  <p
                    className="text-xs sm:text-sm text-slate-600 italic"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    has completed the learning of
                  </p>

                  {/* Completed Skill / Sport Name */}
                  <h3
                    className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-800 tracking-tight leading-snug"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {skillName}
                  </h3>

                  <p
                    className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-normal max-w-xl mx-auto"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    using Skill-Track and has fully completed the tasks provided and has passed all the test.
                  </p>
                </div>

                {/* 4. TAGLINE & FOOTER SIGN-OFF */}
                <div className="relative z-10 pt-2 pb-1 space-y-3">
                  {/* Tagline */}
                  <div className="max-w-md mx-auto pt-1 border-t border-slate-200/80">
                    <p
                      className="text-sm sm:text-lg text-amber-700 italic tracking-wide font-normal"
                      style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive" }}
                    >
                      “Build your skill, Rise to your peak and let your progress speak”
                    </p>
                  </div>

                  {/* Bottom Corners: Date + Verified by Team Skill-Track */}
                  <div className="flex items-end justify-between px-2 sm:px-4 pt-1">
                    {/* Bottom Left: Issue Date & Credential ID */}
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-serif block">
                        Date of Completion: <strong className="text-slate-700">{effectiveDate}</strong>
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        Credential ID: {credentialId}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>100% Socratic Clearance Verified</span>
                      </span>
                    </div>

                    {/* Bottom Right: Official Team Skill-Track Sign-off */}
                    <div className="flex items-center gap-3 text-right">
                      {/* Gold Badge */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
                        <div className="w-full h-full rounded-full border border-white/60 flex items-center justify-center text-white">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                        </div>
                      </div>

                      <div>
                        <div className="w-32 sm:w-40 h-0.5 bg-slate-300 ml-auto mb-1" />
                        <h4
                          className="text-xs sm:text-sm font-bold text-slate-900"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          Certified by Team Skill-Track
                        </h4>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 block">
                          Autonomous AI Mastery Authority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* PRINT-ONLY CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .certificate-print-container,
          .certificate-print-container * {
            visibility: visible !important;
          }
          .certificate-print-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 24mm !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            page-break-inside: avoid;
            background: #ffffff !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}

export default SkillTrackCertificateModal;
