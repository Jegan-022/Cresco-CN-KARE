import React, { useState, useEffect, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { SplitFlapText } from '../ui/SplitFlapText';
import { MechanicalFlipGroup } from '../ui/MechanicalFlipDigit';
import { PillNav, PillNavItem } from '../ui/PillNav';

interface PreLaunchViewProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding?: () => void;
}

export const PreLaunchView: React.FC<PreLaunchViewProps> = ({ 
  onNavigateToLogin,
  onNavigateToLanding 
}) => {
  // Target Launch: September 15, 00:00:00
  const getTargetLaunchTimestamp = () => {
    const now = new Date();
    let target = new Date(now.getFullYear(), 8, 15, 0, 0, 0); // Month 8 is September
    if (target.getTime() < now.getTime()) {
      target = new Date(now.getFullYear() + 1, 8, 15, 0, 0, 0);
    }
    return target.getTime();
  };

  const calculateTimeLeft = (targetTime: number) => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  const [targetTimestamp] = useState<number>(() => {
    const target = getTargetLaunchTimestamp();
    if (typeof window !== 'undefined') {
      localStorage.setItem('netquest_launch_target_timestamp', String(target));
    }
    return target;
  });

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getTargetLaunchTimestamp()));

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const formatDigits = (num: number) => String(num).padStart(2, '0');

  // Stable navigation items array reference that does NOT re-create on countdown ticks
  const navItems = useMemo<PillNavItem[]>(() => [
    {
      label: 'Home',
      href: '#landing',
      onClick: (e) => {
        e?.preventDefault();
        onNavigateToLanding?.();
      }
    },
    {
      label: 'Launch',
      href: '#launch',
      onClick: (e) => {
        e?.preventDefault();
      }
    }
  ], [onNavigateToLanding]);

  return (
    <div className="h-screen w-screen bg-[#0B0B11] text-white flex flex-col justify-between overflow-hidden select-none relative font-sans">
      
      {/* 1. Header with React Bits PillNav component */}
      <header className="w-full px-4 sm:px-10 py-5 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Tag (Desktop) */}
          <div className="hidden md:flex items-center gap-3 min-w-[180px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-emerald-500/30">
              CCN
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none font-headline">
                CRESCO <span className="text-emerald-400 font-black">CN</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase leading-none mt-1">
                KLU CSE
              </span>
            </div>
          </div>

          {/* Center: Prominent PillNav */}
          <div className="flex-1 sm:flex-none flex items-center justify-center">
            <PillNav
              logo="/logo-green.svg"
              logoAlt="Cresco CN Logo"
              items={navItems}
              activeHref="#launch"
              baseColor="#12131C"
              pillColor="rgba(255, 255, 255, 0.06)"
              hoverCircleColor="#10B981"
              hoveredPillTextColor="#FFFFFF"
              pillTextColor="#94A3B8"
              ease="power3.easeOut"
            />
          </div>

          {/* Right: Quick Access Sign In button (Desktop) */}
          <div className="hidden md:flex items-center justify-end min-w-[120px]">
            <button
              onClick={onNavigateToLogin}
              id="top-right-signin-button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <Lock size={13} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Dead Center Viewport: SplitFlap Text + Countdown Timer using Split Flap */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-6 z-10">
        
        {/* Primary Mechanical Split Flap Board */}
        <div className="flex items-center justify-center max-w-full overflow-x-auto py-2">
          <SplitFlapText
            words={[
              'LAUNCH READY',
              'LAUNCH SEP 15',
              'DEV ACCESS  ',
              'SYNC ONLINE ',
              'SIGNAL LIVE '
            ]}
            flipDuration={0.11}
            stagger={0.06}
            cycleDelay={2600}
            charset="alphanumeric"
            flipsPerChar={8}
            tileColor="#12131C"
            textColor="#FFFFFF"
            tileRadius={8}
            gap={7}
            fontSize="clamp(28px, 4.5vw, 62px)"
            loop={true}
            padTo={12}
          />
        </div>

        {/* Mechanical Split-Flap Countdown Timer */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2.5 sm:gap-5 max-w-full overflow-x-auto py-2">
          
          {/* DAYS */}
          <div className="flex flex-col items-center gap-2">
            <MechanicalFlipGroup 
              digits={formatDigits(timeLeft.days)} 
              fontSize="clamp(22px, 3.2vw, 42px)"
              tileColor="#12131C"
              textColor="#FFFFFF"
              gap={5}
            />
            <span className="text-[9px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              DAYS
            </span>
          </div>

          <div className="flex flex-col items-center -mt-5">
            <span className="text-lg sm:text-2xl font-mono text-slate-600 font-bold">:</span>
          </div>

          {/* HOURS */}
          <div className="flex flex-col items-center gap-2">
            <MechanicalFlipGroup 
              digits={formatDigits(timeLeft.hours)} 
              fontSize="clamp(22px, 3.2vw, 42px)"
              tileColor="#12131C"
              textColor="#FFFFFF"
              gap={5}
            />
            <span className="text-[9px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              HOURS
            </span>
          </div>

          <div className="flex flex-col items-center -mt-5">
            <span className="text-lg sm:text-2xl font-mono text-slate-600 font-bold">:</span>
          </div>

          {/* MINUTES */}
          <div className="flex flex-col items-center gap-2">
            <MechanicalFlipGroup 
              digits={formatDigits(timeLeft.minutes)} 
              fontSize="clamp(22px, 3.2vw, 42px)"
              tileColor="#12131C"
              textColor="#FFFFFF"
              gap={5}
            />
            <span className="text-[9px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              MINS
            </span>
          </div>

          <div className="flex flex-col items-center -mt-5">
            <span className="text-lg sm:text-2xl font-mono text-slate-600 font-bold">:</span>
          </div>

          {/* SECONDS */}
          <div className="flex flex-col items-center gap-2">
            <MechanicalFlipGroup 
              digits={formatDigits(timeLeft.seconds)} 
              fontSize="clamp(22px, 3.2vw, 42px)"
              tileColor="#12131C"
              textColor="#38BDF8"
              gap={5}
            />
            <span className="text-[9px] sm:text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              SECS
            </span>
          </div>

        </div>

      </main>

      {/* 3. Subtle, Minimal Bottom Status */}
      <footer className="w-full pb-6 px-6 text-center z-20">
        <p className="text-[11px] font-mono tracking-wider text-slate-600 uppercase">
          Pre-launch testing • University launch on September 15 • Authorized student & dev login
        </p>
      </footer>

    </div>
  );
};

export default PreLaunchView;
