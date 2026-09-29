import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface CinematicVideoBackgroundProps {
  src?: string;
  overlayOpacity?: number;
  crossfadeDuration?: number;
  poster?: string;
  className?: string;
}

/**
 * CinematicVideoBackground: Zero-Cut Seamless Looping Video Engine
 *
 * Implements a Dual-Buffer (Layer A & Layer B) crossfade architecture
 * that eliminates the native HTML5 `<video loop>` hardware-decoder gap,
 * ensuring zero blackouts, micro-stutters, frame drops, or visible seams.
 */
export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  src = '/assets/background-motion.mp4',
  overlayOpacity = 0.28,
  crossfadeDuration = 1.0,
  poster = '/background-poster.jpg',
  className = '',
}) => {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const [opacityA, setOpacityA] = useState<number>(1);
  const [opacityB, setOpacityB] = useState<number>(0);

  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const activeLayerRef = useRef<'A' | 'B'>('A');
  const isTransitioningRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const configureVideoNode = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('disablepictureinpicture', '');
    video.controls = false;
  }, []);

  const safePlay = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return;
    try {
      configureVideoNode(video);
      await video.play();
    } catch {
      // Autoplay blocked or interrupted; will gracefully fall back
    }
  }, [configureVideoNode]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const videoA = videoARef.current;
    const videoB = videoBRef.current;

    if (!videoA || !videoB) return;

    configureVideoNode(videoA);
    configureVideoNode(videoB);

    let isMounted = true;

    activeLayerRef.current = 'A';
    isTransitioningRef.current = false;
    setOpacityA(1);
    setOpacityB(0);

    videoA.currentTime = 0;
    safePlay(videoA)
      .then(() => {
        if (isMounted) setIsVideoReady(true);
      })
      .catch(() => {
        if (isMounted) setHasPlaybackError(true);
      });

    const checkPlaybackLoop = () => {
      if (!isMounted) return;

      const currentActive = activeLayerRef.current;
      const currentVideo = currentActive === 'A' ? videoA : videoB;
      const nextVideo = currentActive === 'A' ? videoB : videoA;

      if (
        currentVideo &&
        currentVideo.duration &&
        !isNaN(currentVideo.duration) &&
        !isTransitioningRef.current
      ) {
        const timeRemaining = currentVideo.duration - currentVideo.currentTime;

        if (timeRemaining <= crossfadeDuration && timeRemaining > 0) {
          isTransitioningRef.current = true;

          nextVideo.currentTime = 0;
          safePlay(nextVideo);

          if (currentActive === 'A') {
            setOpacityA(0);
            setOpacityB(1);
          } else {
            setOpacityA(1);
            setOpacityB(0);
          }

          const transitionTimer = setTimeout(() => {
            if (!isMounted) return;
            activeLayerRef.current = currentActive === 'A' ? 'B' : 'A';
            isTransitioningRef.current = false;

            try {
              currentVideo.pause();
              currentVideo.currentTime = 0;
            } catch {
              // Ignore pause errors
            }
          }, crossfadeDuration * 1000);

          return () => clearTimeout(transitionTimer);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(checkPlaybackLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(checkPlaybackLoop);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      try {
        videoA.pause();
        videoB.pause();
      } catch {
        // Ignore pause errors during teardown
      }
    };
  }, [src, crossfadeDuration, prefersReducedMotion, safePlay, configureVideoNode]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden bg-white ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
      }}
    >
      {(prefersReducedMotion || hasPlaybackError) ? (
        <img
          src={poster}
          alt="Skillprax Ambient Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 opacity-90"
        />
      ) : (
        <>
          <img
            src={poster}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${
              isVideoReady ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <video
            ref={videoARef}
            src={src}
            poster={poster}
            autoPlay
            muted
            playsInline
            loop={false}
            preload="auto"
            controls={false}
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{
              opacity: opacityA,
              transition: `opacity ${crossfadeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: 'opacity',
            }}
          />

          <video
            ref={videoBRef}
            src={src}
            poster={poster}
            muted
            playsInline
            loop={false}
            preload="auto"
            controls={false}
            disablePictureInPicture
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{
              opacity: opacityB,
              transition: `opacity ${crossfadeDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: 'opacity',
            }}
          />
        </>
      )}

      <div
        className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-white/80 via-white/60 to-emerald-50/40 backdrop-blur-[0.5px]"
        style={{
          opacity: overlayOpacity,
        }}
      />

      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.04) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(99, 102, 241, 0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};

export default CinematicVideoBackground;
