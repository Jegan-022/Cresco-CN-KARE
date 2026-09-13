import React, { useState, useEffect } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { triggerSubtleSectionConfetti } from '../../utils/confetti';
import { Laptop, Server, Router, Clock, AlertTriangle, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react';

interface SaveThePacketProps {
  onComplete?: (earnedXp: number) => void;
}

export const SaveThePacketChallenge: React.FC<SaveThePacketProps> = ({ onComplete }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(90); // 01:30
  const [selectedRoute, setSelectedRoute] = useState<'primary' | 'bypass' | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'success' | 'failed'>('playing');

  // Countdown timer 01:30
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (secondsRemaining <= 0) {
      setGameStatus('failed');
      soundFx.playIncorrect();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, gameStatus]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectPrimary = () => {
    soundFx.playClick();
    setSelectedRoute('primary');
    soundFx.playIncorrect();
  };

  const handleSelectBypass = () => {
    soundFx.playClick();
    setSelectedRoute('bypass');
    soundFx.playCorrect();
    soundFx.playLevelUp();
    triggerSubtleSectionConfetti();
    setGameStatus('success');
    if (onComplete) {
      onComplete(25);
    }
  };

  const handleRetry = () => {
    soundFx.playClick();
    setSecondsRemaining(90);
    setSelectedRoute(null);
    setGameStatus('playing');
  };

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#111827] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      
      {/* Header with 01:30 Timer & XP reward */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-[#D95C5C] tracking-wider">
            MINI CHALLENGE · INCIDENT RESPONSE
          </span>
          <h4 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB]">
            SAVE THE PACKET
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E5E0D8] dark:border-slate-700 font-mono text-xs font-black text-[#172033] dark:text-white">
            <Clock size={14} className={secondsRemaining < 20 ? 'text-[#D95C5C] animate-pulse' : 'text-[#3157D5]'} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#35A86B]/15 text-[#35A86B] font-mono text-xs font-black">
            +25 XP
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1D5DB] font-medium">
        "Link Router A ➔ Router B is severed due to fiber cut! Route the critical payload through backup Router C to prevent packet drop."
      </p>

      {/* Network Topology Selection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between gap-4 py-2">
          {/* PC */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#3157D5] text-white flex items-center justify-center shadow-xs">
              <Laptop size={22} />
            </div>
            <span className="text-xs font-bold mt-1 font-mono">PC</span>
          </div>

          {/* Router Choices */}
          <div className="flex-1 space-y-3 px-2 sm:px-6">
            
            {/* Primary Path (Severed) */}
            <button
              onClick={handleSelectPrimary}
              disabled={gameStatus !== 'playing'}
              className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                selectedRoute === 'primary'
                  ? 'bg-[#D95C5C]/15 border-[#D95C5C] text-[#D95C5C]'
                  : 'bg-[#F7F5F0] dark:bg-slate-800 border-[#E5E0D8] dark:border-slate-700 hover:border-[#D95C5C]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Router size={16} />
                <span className="text-xs font-bold font-mono">Primary: Router A ➔ Router B</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#D95C5C] flex items-center gap-1">
                <AlertTriangle size={12} /> SEVERED (DOWN)
              </span>
            </button>

            {/* Backup Alternate Path */}
            <button
              onClick={handleSelectBypass}
              disabled={gameStatus !== 'playing'}
              className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                selectedRoute === 'bypass'
                  ? 'bg-[#35A86B]/15 border-[#35A86B] text-[#35A86B] shadow-xs'
                  : 'bg-[#F7F5F0] dark:bg-slate-800 border-[#3157D5] text-[#3157D5] dark:text-[#6D8CFF] hover:bg-[#3157D5]/10 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-2">
                <Router size={16} />
                <span className="text-xs font-bold font-mono">Backup: Router A ➔ Router C (Bypass)</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#35A86B]">
                OPERATIONAL (24ms)
              </span>
            </button>

          </div>

          {/* Server */}
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              gameStatus === 'success' ? 'bg-[#35A86B] text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Server size={22} />
            </div>
            <span className="text-xs font-bold mt-1 font-mono">Server</span>
          </div>

        </div>

      </div>

      {/* Result Status */}
      {gameStatus === 'success' && (
        <div className="p-4 rounded-2xl bg-[#35A86B]/10 border border-[#35A86B]/30 flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#35A86B]">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Packet safely delivered via alternate Router C path! +25 XP awarded.</span>
          </div>
        </div>
      )}

      {selectedRoute === 'primary' && gameStatus === 'playing' && (
        <div className="p-3.5 rounded-2xl bg-[#D95C5C]/10 border border-[#D95C5C]/30 text-xs font-semibold text-[#D95C5C] flex items-center gap-2 animate-shake">
          <AlertTriangle size={16} />
          <span>Packet dropped! That link is severed. Choose the backup Router C bypass!</span>
        </div>
      )}

      {gameStatus === 'failed' && (
        <div className="p-4 rounded-2xl bg-[#D95C5C]/10 border border-[#D95C5C]/30 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-[#D95C5C]">
            Time expired! Packet dropped in queue.
          </span>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-xl bg-[#D95C5C] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      )}

    </div>
  );
};
