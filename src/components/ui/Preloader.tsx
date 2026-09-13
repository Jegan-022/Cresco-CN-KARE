import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, Network, Sparkles, Terminal, Activity } from 'lucide-react';
import { Loader } from './Loader';

export interface PreloaderProps {
  loading?: boolean;
  duration?: number; // Total loading animation duration in ms (default: 2600)
  variant?: 'stairs' | 'percentage' | 'curtain' | 'slide';
  stairCount?: number; // Number of columns in stairs reveal (default: 8)
  stairsRevealDirection?: 'up' | 'down';
  showProgressBar?: boolean;
  progressBarPosition?: 'top' | 'bottom';
  showPercentageSign?: boolean;
  compliments?: string[];
  onComplete?: () => void;
  children?: React.ReactNode;
  brandTitle?: string;
  userIdentifier?: string;
}

const DEFAULT_COMPLIMENTS = [
  'Establishing secure TCP handshake...',
  'Authenticating student network node...',
  'Routing optimal packets through KLU backbone...',
  'Synchronizing OSI Layer protocol mastery...',
  'Zero packet loss detected — peerless throughput!',
  'Access Granted! Welcome back, Packet Master!',
];

export const Preloader: React.FC<PreloaderProps> = ({
  loading = true,
  duration = 2600,
  variant = 'stairs',
  stairCount = 8,
  stairsRevealDirection = 'up',
  showProgressBar = true,
  progressBarPosition = 'bottom',
  showPercentageSign = true,
  compliments = DEFAULT_COMPLIMENTS,
  onComplete,
  children,
  brandTitle = 'Cresco CN',
  userIdentifier,
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [activeComplimentIdx, setActiveComplimentIdx] = useState(0);

  // Calculate stairs columns array
  const stairs = useMemo(() => Array.from({ length: stairCount }), [stairCount]);

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      setIsDone(true);
      return;
    }

    setProgress(0);
    setIsDone(false);

    const startTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      // Rotate compliments proportionally
      const complimentIndex = Math.min(
        compliments.length - 1,
        Math.floor((pct / 100) * compliments.length)
      );
      setActiveComplimentIdx(complimentIndex);

      if (elapsed < duration) {
        animFrame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        // Delay slightly for dramatic 100% completion before sliding away
        setTimeout(() => {
          setIsDone(true);
          if (onComplete) {
            onComplete();
          }
        }, 350);
      }
    };

    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [loading, duration, compliments, onComplete]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Content behind preloader (revealed when finished) */}
      <div className={`w-full h-full transition-opacity duration-700 ${isDone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {children}
      </div>

      {/* Preloader Overlay */}
      <AnimatePresence>
        {!isDone && (
          <motion.div
            key="preloader-overlay"
            initial={{ opacity: 1 }}
            exit={{
              opacity: variant === 'stairs' ? 1 : 0,
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
            style={{ backgroundColor: variant === 'stairs' ? 'transparent' : '#070D18' }}
          >
            {/* STAIRS VARIANT: Staggered animated vertical columns */}
            {variant === 'stairs' && (
              <div className="absolute inset-0 flex w-full h-full pointer-events-none z-0">
                {stairs.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0 }}
                    exit={{
                      y: stairsRevealDirection === 'up' ? '-100%' : '100%',
                      transition: {
                        duration: 0.75,
                        delay: (i * 0.045),
                        ease: [0.76, 0, 0.24, 1],
                      },
                    }}
                    className="relative flex-1 h-full bg-[#060B14] border-r border-cyan-950/20 last:border-none shadow-2xl"
                  >
                    {/* Subtle cyber grid lines inside each stair column */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-blue-950/20 opacity-30" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* CURTAIN VARIANT: Dual split horizontal curtain doors */}
            {variant === 'curtain' && (
              <div className="absolute inset-0 flex w-full h-full pointer-events-none z-0">
                <motion.div
                  initial={{ x: 0 }}
                  exit={{
                    x: '-100%',
                    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                  }}
                  className="w-1/2 h-full bg-[#060B14] border-r border-cyan-500/20"
                />
                <motion.div
                  initial={{ x: 0 }}
                  exit={{
                    x: '100%',
                    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                  }}
                  className="w-1/2 h-full bg-[#060B14] border-l border-cyan-500/20"
                />
              </div>
            )}

            {/* Top Progress Bar (if configured) */}
            {showProgressBar && progressBarPosition === 'top' && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900/60 z-20 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.1 }}
                />
              </div>
            )}

            {/* Center HUD & Compliments Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.05,
                transition: { duration: 0.35, ease: 'easeInOut' },
              }}
              className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full px-6 py-8 mx-auto text-center"
            >
              {/* Animated Multi-Ring Loader */}
              <div className="relative mb-5">
                <div className="p-3 rounded-2xl bg-[#0B1528]/80 border border-[#9708F4]/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(151,8,244,0.35)]">
                  <Loader size="4.8em" />
                </div>
              </div>

              {/* Brand Title & User badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full shadow-inner flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-cyan-300" />
                  {brandTitle}
                </span>
                {userIdentifier && (
                  <span className="text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-700/60 px-2.5 py-1 rounded-full">
                    {userIdentifier}
                  </span>
                )}
              </div>

              {/* Large Animated Percentage Counter */}
              <div className="relative my-4 flex items-baseline justify-center">
                <span className="font-mono font-extrabold text-7xl md:text-8xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.45)]">
                  {progress}
                </span>
                {showPercentageSign && (
                  <span className="ml-1 font-mono font-semibold text-2xl md:text-3xl text-cyan-400/80">
                    %
                  </span>
                )}
              </div>

              {/* Mid Status Progress Indicator Bar */}
              <div className="w-full max-w-xs h-2 bg-slate-800/80 rounded-full overflow-hidden border border-cyan-500/20 p-[1px] mb-6 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Rotating Compliments / Network Praise Banner */}
              <div className="min-h-[58px] flex items-center justify-center px-5 py-3 rounded-2xl bg-[#0B1528]/90 border border-cyan-500/35 backdrop-blur-xl shadow-[0_4px_25px_rgba(6,182,212,0.15)] max-w-md w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeComplimentIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center gap-2.5 text-xs md:text-sm font-semibold text-white tracking-wide text-center"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                    <span className="bg-gradient-to-r from-cyan-100 via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                      {compliments[activeComplimentIdx] || compliments[0]}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer status line */}
              <div className="mt-5 flex items-center gap-4 text-[11px] font-mono text-slate-400/80">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
                  LATENCY: 0.4ms
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  ENCRYPTED TLS 1.3
                </span>
              </div>
            </motion.div>

            {/* Bottom Progress Bar (default) */}
            {showProgressBar && progressBarPosition === 'bottom' && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/80 z-20 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_14px_rgba(6,182,212,0.85)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.05 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Preloader;
