import type { Variants, Transition } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;
export const SPRING: Transition = { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 };
export const DUR = { fast: 0.18, base: 0.32, slow: 0.5 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.fast, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: SPRING },
  exit: { opacity: 0, scale: 0.98, transition: { duration: DUR.fast } },
};

export const stagger = (gap = 0.06): Variants => ({
  show: { transition: { staggerChildren: gap, delayChildren: 0.04 } },
});

export const panelSlide: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: SPRING },
  exit: { x: '100%', transition: { duration: DUR.base, ease: EASE } },
};

// Reduced motion: swap transform animations for opacity-only.
export const safe = (v: Variants, reduce: boolean | null): Variants =>
  reduce ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } } : v;
