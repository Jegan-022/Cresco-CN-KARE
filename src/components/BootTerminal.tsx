import React, { useState, useEffect } from 'react';
import { Loader } from './ui/Loader';

export const BootTerminal: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootSequence = [
    { text: 'Initializing secure kernel...', delay: 100 },
    { text: 'Connecting to KLU Network node...', delay: 350 },
    { text: 'Synchronizing XP & Course Data...', delay: 700 },
    { text: 'Mounting Cresco CN environment... [READY]', delay: 1100 },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    bootSequence.forEach((step, index) => {
      const timer = setTimeout(() => {
        setLines((prev) => {
          if (prev.includes(step.text)) return prev;
          return [...prev, step.text];
        });
        setProgress(Math.floor(((index + 1) / bootSequence.length) * 100));
      }, step.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#070D18] text-white flex flex-col items-center justify-center select-none p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#9708F4]/15 blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* User's Exact Animated Ring Loader */}
        <div className="p-5 rounded-3xl bg-[#0B1528]/80 border border-[#9708F4]/30 shadow-[0_0_50px_rgba(151,8,244,0.3)] backdrop-blur-2xl">
          <Loader size="6.5em" />
        </div>

        {/* Title & Status */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-extrabold tracking-widest text-white drop-shadow-sm uppercase">
            CRESCO CN
          </h1>
          <p className="text-xs font-mono text-purple-300/80">
            {lines[lines.length - 1] || 'Initializing system kernel...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-[#9708F4]/30">
            <div 
              className="h-full bg-gradient-to-r from-[#9708F4] to-[#5E14E4] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(151,8,244,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-purple-400">
            <span>KLU_SECURE_NODE</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootTerminal;
