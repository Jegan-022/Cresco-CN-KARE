import React, { useEffect } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { X, Zap, Unlock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LevelProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToDashboard?: () => void;
  currentXp?: number;
}

export const LevelProgressModal: React.FC<LevelProgressModalProps> = ({
  isOpen,
  onClose,
  onReturnToDashboard,
  currentXp,
}) => {
  const { userProfile } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
  const currentLevelTitle = currentTier.title;
  const nextTier = allLevels.find(l => l.level === currentLevelNumber + 1);
  const nextLevelTitle = nextTier ? nextTier.title : 'Supreme Network Master';
  const minXp = currentTier.minXp;
  const maxXp = currentTier.maxXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - minXp) / Math.max(1, maxXp - minXp)) * 100)));
  const xpNeeded = Math.max(0, maxXp - xp);

  const handleReturnHome = () => {
    try {
      soundFx.playClick();
    } catch {}
    if (onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#101928] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl relative animate-scaleUp text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Badge & ✕ Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold font-mono border border-amber-500/20">
            <Zap size={13} className="fill-amber-500 text-amber-500" />
            <span>LEVEL &amp; XP PROGRESS</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={17} />
          </button>
        </div>

        {/* Level Title & XP */}
        <div className="text-center py-4 space-y-1">
          <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
            LEVEL {currentLevelNumber}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentLevelTitle}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
            {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 py-1 mb-3">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
            <span>{progressPercent}% completed</span>
            <span className="text-cyan-600 dark:text-cyan-400">
              {xpNeeded > 0 ? `${xpNeeded} XP to Level ${currentLevelNumber + 1}` : 'Max Tier!'}
            </span>
          </div>
        </div>

        {/* Next Unlock Preview */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
              <Unlock size={14} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">UPCOMING UNLOCK</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{nextLevelTitle}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons: 1-click Return to Dashboard */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleReturnHome}
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-md shadow-cyan-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full py-1.5 text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
