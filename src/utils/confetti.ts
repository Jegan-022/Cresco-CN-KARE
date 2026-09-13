import confetti from 'canvas-confetti';

/**
 * Cresco CN brand-aligned color palette for subtle celebrations:
 * Academic blues, cyber cyan, emerald success, warm amber, and violet.
 */
const CELEBRATION_COLORS = [
  '#2563eb', // royal blue
  '#38bdf8', // sky cyan
  '#10b981', // emerald green
  '#f59e0b', // warm amber
  '#6366f1', // indigo
];

/**
 * Triggers a non-intrusive, subtle confetti animation
 * designed specifically for section completion milestones.
 * 
 * Characteristics:
 * - Low particle count (35-50 total) for elegance without screen obstruction
 * - Gentle velocity and soft gravity for a floating paper feel
 * - Strictly non-blocking (pointer-events: none)
 * - Respects system 'prefers-reduced-motion' settings
 */
export function triggerSubtleSectionConfetti() {
  // Check if window is available (SSR guard)
  if (typeof window === 'undefined') return;

  // Gentle center burst
  confetti({
    particleCount: 38,
    spread: 60,
    origin: { x: 0.5, y: 0.7 },
    colors: CELEBRATION_COLORS,
    startVelocity: 28,
    gravity: 0.85,
    scalar: 0.8,
    ticks: 160,
    zIndex: 9999,
    disableForReducedMotion: true,
  });

  // Twin micro-bursts timed 180ms later from left and right for balanced flourish
  setTimeout(() => {
    confetti({
      particleCount: 18,
      angle: 60,
      spread: 45,
      origin: { x: 0.25, y: 0.75 },
      colors: CELEBRATION_COLORS,
      startVelocity: 22,
      gravity: 0.9,
      scalar: 0.75,
      ticks: 140,
      zIndex: 9999,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 18,
      angle: 120,
      spread: 45,
      origin: { x: 0.75, y: 0.75 },
      colors: CELEBRATION_COLORS,
      startVelocity: 22,
      gravity: 0.9,
      scalar: 0.75,
      ticks: 140,
      zIndex: 9999,
      disableForReducedMotion: true,
    });
  }, 180);
}
