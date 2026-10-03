import React, { useEffect } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Flame, Check, ShieldCheck, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToDashboard?: () => void;
  streakDays?: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  onReturnToDashboard,
  streakDays,
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

  const actualStreak = userProfile?.streak ?? streakDays ?? 0;

  const days = [
    { day: 'M', label: 'Mon' },
    { day: 'T', label: 'Tue' },
    { day: 'W', label: 'Wed' },
    { day: 'T', label: 'Thu' },
    { day: 'F', label: 'Fri' },
    { day: 'S', label: 'Sat' },
    { day: 'S', label: 'Sun' },
  ];

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon = 0, Sun = 6
  const daysOfWeek = days.map((d, idx) => {
    const isToday = idx === todayIdx;
    const daysAgo = (todayIdx - idx + 7) % 7;
    const completed = actualStreak > 0 && daysAgo < actualStreak;
    return {
      ...d,
      completed,
      isToday,
      xp: completed ? 50 : 0,
    };
  });

  const nextMilestone = actualStreak < 3 ? 3 : actualStreak < 7 ? 7 : actualStreak < 14 ? 14 : 30;
  const daysLeft = Math.max(0, nextMilestone - actualStreak);

  const streakSubtitle = 
    actualStreak === 0 
      ? 'Complete a lesson today to ignite your streak!'
      : actualStreak < 7
      ? 'Great momentum! Your connection is verified.'
      : 'Network connected consistently every day!';

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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold font-mono border border-orange-500/20">
            <Flame size={13} className="fill-orange-500" />
            <span>ACTIVE STREAK</span>
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

        {/* Big Streak Stat */}
        <div className="text-center py-4 space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>{actualStreak} {actualStreak === 1 ? 'DAY' : 'DAYS'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {streakSubtitle}
          </p>
        </div>

        {/* 7-Day Mini Calendar Grid */}
        <div className="py-2.5 px-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-3">
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-bold font-mono ${item.isToday ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                  {item.day}
                </span>

                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  item.completed
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  {item.completed ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px] text-slate-300 dark:text-slate-600">○</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone & Shield */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 text-orange-900 dark:text-orange-200 mb-4">
          <span className="font-semibold text-[11px]">
            Target: {nextMilestone} Days
          </span>
          <span className="font-mono font-bold text-[11px] text-orange-600 dark:text-orange-400">
            {daysLeft === 0 ? 'Achieved!' : `${daysLeft} days left`}
          </span>
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
