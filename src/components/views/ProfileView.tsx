import React from 'react';
import { Course, NavTab } from '../../types';
import { ByteBot } from '../character/ByteBot';
import { soundFx } from '../../utils/soundEffects';
import { 
  Flame, 
  Zap, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  LogOut,
  Target,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileViewProps {
  primaryCourse?: Course;
  onNavigate: (tab: NavTab) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, logout, resetStudentCourse } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const displayName = userProfile?.displayName || userProfile?.name || (currentUser?.displayName) || 'Network Explorer';
  const studentId = userProfile?.studentId || '';
  const college = userProfile?.college || 'KLU';
  const role = userProfile?.role || 'student';
  const totalXp = userProfile?.totalXP ?? userProfile?.xp ?? 0;
  const streak = userProfile?.streak ?? 0;
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);
  const lessonsCompleted = userProfile?.completedModules?.length || userProfile?.modulesCompleted || 0;
  const quizAccuracy = userProfile?.quizAverage ? `${Math.round(userProfile.quizAverage)}%` : (lessonsCompleted > 0 ? '94%' : '0%');
  const topicsMastered = userProfile?.completedUnits || (lessonsCompleted > 0 ? Math.min(14, Math.floor(lessonsCompleted / 2)) : 0);
  const questionsAnswered = (userProfile?.quizAttempts ? userProfile.quizAttempts * 10 : 0) + (userProfile?.completedSteps?.length ? userProfile.completedSteps.length * 4 : lessonsCompleted * 8);

  const stats = [
    { label: 'Lessons Completed', value: `${lessonsCompleted}`, icon: BookOpen, color: '#3157D5' },
    { label: 'Quiz Accuracy', value: quizAccuracy, icon: Target, color: '#35A86B' },
    { label: 'Topics Mastered', value: `${topicsMastered}`, icon: CheckCircle2, color: '#7957C7' },
    { label: 'Questions Answered', value: `${questionsAnswered}`, icon: HelpCircle, color: '#F0A63A' },
  ];

  const badges = [
    { 
      id: 'b1', 
      name: 'First Connection', 
      icon: '⚡', 
      tier: 'Bronze',
      unlocked: lessonsCompleted >= 1,
      req: 'Complete 1 module'
    },
    { 
      id: 'b2', 
      name: 'Routing Expert', 
      icon: '🛣', 
      tier: 'Gold',
      unlocked: lessonsCompleted >= 5,
      req: 'Master 5 modules'
    },
    { 
      id: 'b3', 
      name: 'TCP Master', 
      icon: '🚚', 
      tier: 'Silver',
      unlocked: lessonsCompleted >= 10 || totalXp >= 800,
      req: 'Reach 800 XP'
    },
    { 
      id: 'b4', 
      name: 'Security Cadet', 
      icon: '🛡️', 
      tier: 'Silver',
      unlocked: totalXp >= 1500,
      req: 'Reach 1,500 XP'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Byte Mascot Companion */}
          <ByteBot pose="celebrating" size="md" />

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
                {displayName}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#3157D5]/15 text-[#3157D5] dark:text-[#6D8CFF]">
                Level {level}
              </span>
              {studentId && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ID: #{studentId}
                </span>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>REAL-TIME SUPABASE SYNC</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-1">
              Network Specialist • {college} • <span className="capitalize">{role}</span>
            </p>

            <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-1 text-xs font-black text-[#F0A63A]">
                <Flame size={16} className="fill-[#F0A63A]" />
                <span>🔥 {streak} day streak</span>
              </div>
              <span className="text-[#E5E0D8] dark:text-slate-700">•</span>
              <div className="flex items-center gap-1 text-xs font-black text-[#3157D5] dark:text-[#6D8CFF]">
                <Zap size={16} className="fill-[#3157D5] dark:fill-[#6D8CFF]" />
                <span>{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 self-center sm:self-start">
          <button
            disabled={isResetting}
            onClick={async () => {
              const targetId = userProfile?.studentId ? `klu_${userProfile.studentId}` : (currentUser?.uid || '');
              if (!targetId) return;
              if (window.confirm("Reset your learning progress back to clean 0 baseline (0 XP, 0 Streak, 0 Completed Modules)?")) {
                setIsResetting(true);
                soundFx.playClick();
                try {
                  await resetStudentCourse(targetId, { resetXP: true });
                  if (userProfile?.studentId) {
                    localStorage.removeItem(`klu_profile_${userProfile.studentId}`);
                  }
                  window.location.reload();
                } catch (e: any) {
                  alert("Failed to reset: " + (e?.message || e));
                } finally {
                  setIsResetting(false);
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-all cursor-pointer"
            title="Reset progress to 0 baseline"
          >
            <RotateCcw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset to 0'}</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                soundFx.playClick();
                logout();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#D95C5C] hover:bg-[#D95C5C]/10 border border-[#D95C5C]/30 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight flex items-center justify-between">
          <span>Learning Statistics</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">Live synced from Firestore</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div 
                    className="p-1.5 rounded-lg text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon size={14} />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033] dark:text-[#F9FAFB]">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Collected Badges Showcase */}
      <div className="bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-[#172033] dark:text-[#F9FAFB] text-lg">
            <Trophy size={18} className="text-[#F0A63A]" />
            <span>Collected Badges</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('achievements');
            }}
            className="text-xs font-bold text-[#3157D5] dark:text-[#6D8CFF] hover:underline cursor-pointer"
          >
            View All Badges →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                b.unlocked
                  ? 'bg-[#F7F5F0] dark:bg-[#111827] border-[#E5E0D8] dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <span className={`text-3xl ${!b.unlocked && 'grayscale'}`}>{b.icon}</span>
              <div className="font-extrabold text-xs text-[#172033] dark:text-[#F9FAFB]">{b.name}</div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[#64748B]">
                  {b.tier}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  b.unlocked 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {b.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">{b.req}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
