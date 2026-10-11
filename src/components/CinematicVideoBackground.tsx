'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface CinematicVideoBackgroundProps {
  src?: string;
  overlayOpacity?: number;
  poster?: string;
  className?: string;
}

/**
 * CinematicVideoBackground: Continuous Resilient Looping Video Engine
 *
 * Guarantees video playback never freezes, stalls, or reverts to a static image
 * during page navigation, route transitions, or browser backgrounding.
 */
export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  src = '/background-motion.mp4',
  overlayOpacity = 0.28,
  poster = '/background-poster.jpg',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const lastTimeRef = useRef<number>(0);
  const stallCountRef = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const ensurePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (video.paused) {
      video.play().then(() => {
        setIsVideoReady(true);
      }).catch(() => {
        // Autoplay may be delayed until first user gesture; handled by global listeners
      });
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    ensurePlayback();

    // Watchdog timer: checks every 1000ms that video is actively advancing
    const watchdog = setInterval(() => {
      if (!video || prefersReducedMotion) return;

      if (video.paused) {
        ensurePlayback();
      } else {
        const currentTime = video.currentTime;
        if (currentTime === lastTimeRef.current && currentTime > 0) {
          stallCountRef.current += 1;
          if (stallCountRef.current >= 2) {
            // Video stalled; recover by nudging or resetting
            video.currentTime = 0;
            ensurePlayback();
            stallCountRef.current = 0;
          }
        } else {
          stallCountRef.current = 0;
          lastTimeRef.current = currentTime;
          setIsVideoReady(true);
        }
      }
    }, 1000);

    // Re-trigger playback on route navigation, visibility change, and window focus
    const handleWakeup = () => {
      ensurePlayback();
    };

    window.addEventListener('focus', handleWakeup);
    window.addEventListener('pageshow', handleWakeup);
    document.addEventListener('visibilitychange', handleWakeup);
    window.addEventListener('click', handleWakeup, { passive: true });
    window.addEventListener('scroll', handleWakeup, { passive: true });
    window.addEventListener('pointerdown', handleWakeup, { passive: true });

    return () => {
      clearInterval(watchdog);
      window.removeEventListener('focus', handleWakeup);
      window.removeEventListener('pageshow', handleWakeup);
      document.removeEventListener('visibilitychange', handleWakeup);
      window.removeEventListener('click', handleWakeup);
      window.removeEventListener('scroll', handleWakeup);
      window.removeEventListener('pointerdown', handleWakeup);
    };
  }, [ensurePlayback, prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden bg-slate-900 ${className}`}
      style={{
        backgroundColor: '#0F172A',
      }}
    >
      {/* Fallback poster until video starts */}
      <img
        src={poster}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${
          isVideoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          controls={false}
          disablePictureInPicture
          onPlaying={() => setIsVideoReady(true)}
          onTimeUpdate={() => setIsVideoReady(true)}
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
          onPause={() => {
            // If browser pauses in background, wake it back up
            if (!prefersReducedMotion) ensurePlayback();
          }}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Translucent cinematic overlay for crisp text contrast */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-white/90 via-slate-50/80 to-emerald-50/50 backdrop-blur-[1px]"
        style={{
          opacity: overlayOpacity,
        }}
      />

      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(2, 132, 199, 0.08) 0%, transparent 65%), radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 65%)',
        }}
      />
    </div>
  );
};

export default CinematicVideoBackground;
