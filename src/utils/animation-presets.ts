export const fadeUp = {
  from: { opacity: 0, y: 30 },
  to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
} as const;

export const fadeUpFast = {
  from: { opacity: 0, y: 20 },
  to: { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
} as const;

export const scaleIn = {
  from: { opacity: 0, scale: 0.9 },
  to: { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' },
} as const;
