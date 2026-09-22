import React from 'react';
import { CrescoMascot } from '../brand/CrescoMascot';
import { soundFx } from '../../utils/soundEffects';
import { Flame, Check, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StreakHeatmap } from '../StreakHeatmap';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays?: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakDays,
}) => {
  const { userProfile } = useAuth();
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
      ? 'Start a lesson today to ignite your learning streak!'
      : actualStreak < 7
      ? 'Great momentum! Keep your network connected every day.'
      : 'Your network has stayed consistently connected!';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-scaleUp my-8">
        
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

        {/* Mascot in Streak Pose */}
        <div className="flex justify-center mb-4">
          <CrescoMascot
            pose={actualStreak > 0 ? 'streak' : 'front'}
            size="xl"
            animation="bounce"
            withGlow={actualStreak > 0}
            speechText={actualStreak > 0 ? `${actualStreak} Day Streak on Fire!` : "Let's build your streak!"}
            speechPosition="top"
          />
        </div>

        {/* Headline */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0A63A]/15 text-[#B45309] dark:text-[#F0A63A] text-xs font-black font-mono">
            <Flame size={14} className="fill-[#F0A63A]" />
            <span>ACTIVE STREAK</span>
          </div>

          <h2 className="text-4xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            {actualStreak} {actualStreak === 1 ? 'DAY' : 'DAYS'}
          </h2>

          <p className="text-sm font-medium text-[#475569] dark:text-[#D1D5DB]">
            "{streakSubtitle}"
          </p>
        </div>

        {/* 7-Day Weekly Calendar Grid */}
        <div className="mt-6 pt-6 border-t border-[#EFECE6] dark:border-slate-800">
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`text-[11px] font-bold font-mono ${item.isToday ? 'text-[#3157D5] dark:text-[#6D8CFF]' : 'text-[#64748B]'}`}>
                  {item.day}
                </span>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                  item.completed
                    ? 'bg-[#F0A63A] text-white shadow-[0_2px_0_0_#B45309]'
                    : 'bg-[#F7F5F0] dark:bg-slate-800 text-[#94A3B8] border border-[#E5E0D8] dark:border-slate-700'
                }`}>
                  {item.completed ? <Check size={16} strokeWidth={3} /> : <span className="text-[10px] text-slate-400">○</span>}
                </div>

                <span className="text-[9px] font-mono font-bold text-[#35A86B]">
                  {item.xp > 0 ? `+${item.xp}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone Card */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F7F5F0] dark:bg-[#111827] border border-[#E5E0D8] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0A63A]/20 text-[#F0A63A] flex items-center justify-center">
              <Flame size={20} className="fill-[#F0A63A]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">NEXT MILESTONE</span>
              <div className="font-black text-sm text-[#172033] dark:text-[#F9FAFB]">🔥 {nextMilestone} DAYS</div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-[#3157D5] dark:text-[#6D8CFF]">
            {daysLeft === 0 ? 'Achieved!' : `${daysLeft} days left`}
          </span>
        </div>

        {/* Streak Freeze Banner */}
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] font-bold text-[#3157D5] dark:text-blue-300">
          <ShieldCheck size={14} className="shrink-0" />
          <span>Streak Shield active: Missed days auto-protected when enrolled.</span>
        </div>

        {/* Activity Heatmap Grid */}
        <div className="mt-5 pt-4 border-t border-[#EFECE6] dark:border-slate-800">
          <StreakHeatmap
            activityDates={userProfile?.activityDates || []}
            currentStreak={actualStreak}
            weeksToShow={12}
          />
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
            {actualStreak > 0 ? 'KEEP IT GOING' : 'START LEARNING'}
          </button>
        </div>

      </div>
    </div>
  );
};
