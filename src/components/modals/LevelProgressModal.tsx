import React from 'react';
import { ByteBot } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { X, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LevelProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentXp?: number;
}

export const LevelProgressModal: React.FC<LevelProgressModalProps> = ({
  isOpen,
  onClose,
  currentXp,
}) => {
  const { userProfile } = useAuth();
  if (!isOpen) return null;

  const xp = userProfile?.totalXP ?? userProfile?.xp ?? currentXp ?? 0;

  const allLevels = [
    { level: 1, title: 'Packet Cadet', minXp: 0, maxXp: 300 },
    { level: 2, title: 'Subnet Apprentice', minXp: 300, maxXp: 600 },
    { level: 3, title: 'Route Scout', minXp: 600, maxXp: 900 },
    { level: 4, title: 'Protocol Navigator', minXp: 900, maxXp: 1200 },
    { level: 5, title: 'Network Specialist', minXp: 1200, maxXp: 1500 },
    { level: 6, title: 'Network Engineer', minXp: 1500, maxXp: 2500 },
    { level: 7, title: 'Chief Architect', minXp: 2500, maxXp: 5000 },
  ];

  const currentTier = allLevels.find(l => xp >= l.minXp && xp < l.maxXp) || (xp >= 5000 ? allLevels[allLevels.length - 1] : allLevels[0]);
  const currentLevelNumber = currentTier.level;
  const currentLevelTitle = currentTier.title.toUpperCase();
  const nextTier = allLevels.find(l => l.level === currentLevelNumber + 1);
  const nextLevelTitle = nextTier ? nextTier.title : 'Supreme Network Master';
  const minXp = currentTier.minXp;
  const maxXp = currentTier.maxXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - minXp) / Math.max(1, maxXp - minXp)) * 100)));
  const xpNeeded = Math.max(0, maxXp - xp);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F7F5F0] dark:hover:bg-slate-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Mascot Avatar */}
        <div className="flex justify-center mb-4">
          <ByteBot pose={xp > 0 ? "celebrating" : "idle"} size="md" />
        </div>

        {/* Level Header */}
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest">
            LEVEL {currentLevelNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            {currentLevelTitle}
          </h2>
          <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">
            {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
          </p>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="w-full h-4 bg-[#F7F5F0] dark:bg-[#111827] rounded-full overflow-hidden border border-[#E5E0D8] dark:border-slate-700 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#3157D5] to-[#5B7CFA] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono font-bold text-[#64748B]">
            <span>Level {currentLevelNumber}</span>
            <span className="text-[#3157D5] dark:text-[#6D8CFF]">{xpNeeded} XP to Level {currentLevelNumber + 1}</span>
            <span>Level {currentLevelNumber + 1}</span>
          </div>
        </div>

        {/* Next Level & Rewards Section */}
        <div className="mt-6 pt-5 border-t border-[#EFECE6] dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#64748B] uppercase">NEXT LEVEL</span>
            <span className="text-xs font-black text-[#172033] dark:text-[#F9FAFB]">{nextLevelTitle}</span>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#3157D5]/15 text-[#3157D5] dark:text-[#6D8CFF] flex items-center justify-center shrink-0">
                <Unlock size={16} />
              </div>
              <div className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB]">
                🔓 Advanced Protocol Scenarios
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#35A86B]/15 text-[#35A86B] flex items-center justify-center shrink-0">
                <Unlock size={16} />
              </div>
              <div className="text-xs font-bold text-[#172033] dark:text-[#F9FAFB]">
                🔓 Topology Sandbox Simulator
              </div>
            </div>
          </div>
        </div>

        {/* Level Path Mini-Timeline */}
        <div className="mt-5 pt-4 border-t border-[#EFECE6] dark:border-slate-800">
          <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider block mb-2">
            LEVEL ROADMAP
          </span>
          <div className="space-y-1.5 text-xs">
            {allLevels.slice(0, 5).map((lvl) => {
              const isCurrent = lvl.level === currentLevelNumber;
              const isCompleted = lvl.level < currentLevelNumber;
              return (
                <div 
                  key={lvl.level}
                  className={`flex items-center justify-between p-2 rounded-xl ${
                    isCurrent
                      ? 'bg-[#3157D5]/10 font-black text-[#3157D5] dark:text-[#6D8CFF]'
                      : isCompleted
                      ? 'text-[#64748B] line-through'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  <span>Level {lvl.level}: {lvl.title}</span>
                  <span className="font-mono">{lvl.minXp} XP</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#3157D5] hover:bg-[#2442B0] text-white font-black text-xs tracking-wider shadow-[0_4px_0_0_#2442B0] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            {xp > 0 ? 'CONTINUE EARNING XP' : 'START EARNING XP'}
          </button>
        </div>

      </div>
    </div>
  );
};
