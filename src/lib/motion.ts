export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = { fast: 0.18, base: 0.28, slow: 0.4 } as const;
export const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: DUR.fast, ease: EASE } },
};
export const stagger = (i: number) => ({ delay: Math.min(i * 0.05, 0.4) });

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.fast, ease: EASE } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: DUR.fast } },
};
