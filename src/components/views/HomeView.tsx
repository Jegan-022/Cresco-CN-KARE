import React, { useState, useEffect } from 'react';
import { NavTab } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { CrescoMascot } from '../brand/CrescoMascot';
import { useAuth } from '../../context/AuthContext';
import { ALL_MODULES } from '../../data/courseContent';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ArrowRight, 
  Flame, 
  Zap, 
  Check, 
  Lock, 
  Play, 
  Bookmark, 
  Layers,
  Clock,
  CheckCircle2,
  Router,
  Diamond,
  Star,
  Activity,
  Compass,
  AlarmClock,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab, lessonId?: string, sectionId?: number) => void;
  userStats?: {
    streak: number;
    xp: number;
    hearts: number;
  };
}

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar?: string;
  isCurrentUser?: boolean;
  isCourseCompleted?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  userStats = { streak: 0, xp: 0, hearts: 5 },
}) => {
  const { userProfile, currentUser } = useAuth();

  const displayName = userProfile?.displayName || userProfile?.name || 'Student';
  const firstName = displayName.split(' ')[0] || 'Student';
  const studentId = userProfile?.studentId || '';
  const college = userProfile?.college || 'KLU';
  
  // Genuine stats
  const completedIds = userProfile?.completedModules || [];
  const currentXp = userProfile?.totalXP ?? userProfile?.xp ?? userStats.xp ?? 0;
  const currentStreak = userProfile?.streak ?? userStats.streak ?? 0;
  const currentLevel = Math.max(1, Math.floor(currentXp / 300) + 1);
  const progressPercent = Math.min(100, Math.round((completedIds.length / (ALL_MODULES.length || 30)) * 100));

  // Determine active/next module
  const nextModule = ALL_MODULES.find((m) => !completedIds.includes(m.id)) || ALL_MODULES[0];

  // Active path view tab
  const [activePathFilter, setActivePathFilter] = useState<'roadmap' | 'labs' | 'rfcs'>('roadmap');

  // Real-time students leaderboard (starts fresh from 0)
  const [topStudents, setTopStudents] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    try {
      const studentsRef = collection(db, 'students');
      const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: LeaderboardUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Filter out developer accounts
            if (data.role === 'developer' || docSnap.id.startsWith('dev_')) return;
            const sXp = data.totalXP ?? data.xp ?? 0;
            const sName = data.displayName || data.name || `Student ${docSnap.id.slice(0, 5)}`;
            const isMe = docSnap.id === currentUser?.uid || data.studentId === studentId;
            const mods = data.modulesCompleted ?? (data.completedModules || []).length;
            const prog = data.overallProgress ?? 0;
            const isCompleted = mods >= 30 || prog >= 100;
            // Only show active learners who have earned XP, completed course, or current student
            if (sXp > 0 || isMe || isCompleted) {
              list.push({
                id: docSnap.id,
                name: sName,
                xp: sXp,
                isCurrentUser: isMe,
                isCourseCompleted: isCompleted,
              });
            }
          });
          list.sort((a, b) => b.xp - a.xp);
          setTopStudents(list.slice(0, 5));
        } else {
          setTopStudents([]);
        }
      }, (err) => {
        console.warn("HomeView leaderboard onSnapshot handled error:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("HomeView leaderboard listener fallback:", e);
    }
  }, [currentUser?.uid, studentId]);

  // Weekly bar chart (Mon=0..Sun=6)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const weeklyHeights = [45, 70, 30, 85, 60, 50, 95];

  return (
    <div className="w-full max-w-7xl mx-auto pt-4 pb-16 px-6 text-on-surface select-none">
      
      {/* Outer Grid: 68% Learning Canvas + 32% Tactical Stats Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================== */}
        {/* MAIN LEARNING COLUMN (approx 68% / col-span-8)            */}
        {/* ======================================================== */}
        <div className="xl:col-span-8 flex flex-col gap-8 min-w-0">
          
          {/* 1. LARGE IMMERSIVE 3D HERO BANNER with Conic Emerald & Teal Palette */}
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary p-6 md:p-8 shadow-[0_12px_36px_-6px_rgba(16,185,129,0.35)]">
            
            {/* Conic-gradient(emerald, teal) pattern backdrop */}
            <div 
              className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: 'conic-gradient(#10b981, #059669)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#10b981'
              }}
            />

            {/* Ambient geometric topology vectors in backdrop */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" fill="none" viewBox="0 0 800 320">
                <circle cx="680" cy="80" r="140" stroke="white" strokeDasharray="6 6" strokeWidth="1.5" />
                <circle cx="680" cy="80" r="70" stroke="white" strokeWidth="2" />
                <path d="M120,40 L340,120 L580,60 L720,180" stroke="white" strokeLinecap="round" strokeWidth="2" />
                <circle cx="120" cy="40" fill="white" r="8" />
                <circle cx="340" cy="120" fill="white" r="10" />
                <circle cx="580" cy="60" fill="white" r="9" />
                <circle cx="720" cy="180" fill="white" r="12" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-3 border border-white/25 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="font-headline text-xs text-white tracking-widest uppercase font-black">
                    CRESCO CN • {nextModule.unitTitle || 'COMPUTER NETWORKS'}
                  </span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight leading-tight">
                  Welcome to <span className="font-black text-amber-200">Cresco CN</span> — Continue your journey
                </h1>

                <p className="font-body-md text-body-md text-primary-fixed pt-1 max-w-xl opacity-90">
                  Master architectural models, deterministic routing, and packet framing one simulation at a time.
                </p>

                {/* Status Indicators & Track Bar */}
                <div className="pt-5 flex flex-col gap-2 max-w-md">
                  <div className="flex items-center justify-between font-label-md text-label-md text-primary-fixed">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles size={14} className="text-tertiary-fixed-dim" />
                      Level {currentLevel}
                    </span>
                    <span>{currentXp.toLocaleString()} XP Earned</span>
                    <span className="text-tertiary-fixed font-bold">{progressPercent}% Completed</span>
                  </div>

                  {/* Glow Progress Bar */}
                  <div className="w-full h-3.5 bg-on-primary/20 rounded-full p-0.5 overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-tertiary-fixed-dim via-tertiary-fixed to-surface-tint rounded-full shadow-[0_0_12px_#ffba20] transition-all duration-700" 
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Primary Action CTA Button */}
                <div className="pt-6">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNavigate('learn-map');
                    }}
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-surface-container-lowest text-primary font-headline-sm text-headline-sm shadow-[0_4px_0_0_#fed7aa,0_10px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_2px_0_0_#fed7aa,0_6px_12px_rgba(0,0,0,0.1)] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Continue on Island Map</span>
                    <ArrowRight size={18} strokeWidth={2.8} />
                  </button>
                </div>
              </div>

              {/* Network Octopus Mascot */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-surface-tint/20 rounded-full blur-3xl" />
                <CrescoMascot
                  pose={currentStreak >= 3 ? 'streak' : 'front'}
                  size="hero"
                  animation="float"
                  withGlow
                  speechText={`Let's conquer ${nextModule.title?.split(':')[0]?.split('—')[0]?.trim() || 'Network Layer'}!`}
                  speechPosition="top"
                />
              </div>
            </div>
          </section>

          {/* 2. QUICK STATS CARDS ROW (3 Tactile Cards) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Course Progress */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex items-center gap-4 transition-transform hover:-translate-y-0.5 cursor-pointer" onClick={() => onNavigate('learn-map')}>
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" fill="none" r="19" stroke="#ffedd5" strokeWidth="4.5" />
                  <circle 
                    cx="24" cy="24" fill="none" r="19" 
                    stroke="#ff6b00" 
                    strokeDasharray="119.38" 
                    strokeDashoffset={119.38 - (119.38 * progressPercent) / 100} 
                    strokeLinecap="round" strokeWidth="4.5"
                  />
                </svg>
                <span className="absolute font-headline-sm text-headline-sm text-on-surface">{progressPercent}%</span>
              </div>
              <div className="min-w-0">
                <span className="font-label-md text-label-md text-on-surface-variant block uppercase tracking-wider">Progress</span>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold truncate">
                  {completedIds.length > 0 ? `${Math.min(3, Math.ceil(completedIds.length / 6))} of 3 Units` : '0 of 3 Units'}
                </h3>
                <p className="font-body-sm text-body-sm text-outline truncate">
                  {completedIds.length} of {ALL_MODULES.length || 45} Lessons Cleared
                </p>
              </div>
            </div>

            {/* Card 2: Daily Goal */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex flex-col justify-between transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Daily Goal</span>
                <span className="font-code-metric text-code-metric text-primary">{currentXp % 100} / 100 XP</span>
              </div>
              <div className="my-2">
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container rounded-full shadow-[0_0_8px_#ff6b00] transition-all duration-500" 
                    style={{ width: `${Math.min(100, currentXp % 100)}%` }}
                  />
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                <span className="text-tertiary-container font-bold text-[14px]">ℹ</span>
                <span>{100 - (currentXp % 100)} XP to hit daily target</span>
              </p>
            </div>

            {/* Card 3: Streak */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex items-center gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-14 h-14 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-[28px] shadow-[0_4px_0_0_#ffdea8]">
                🔥
              </div>
              <div className="min-w-0">
                <span className="font-label-md text-label-md text-tertiary font-bold tracking-wider uppercase">Active Streak</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </h3>
                <p className="font-body-sm text-body-sm text-outline truncate">
                  {currentStreak > 0 ? '2 days to streak freeze' : 'Start learning to ignite streak'}
                </p>
              </div>
            </div>

          </section>

          {/* 4. INTERACTIVE CURRENT LESSON HERO CARD */}
          <section className="rounded-xl bg-surface-container-lowest p-6 md:p-8 shadow-[0_8px_30px_rgba(19,27,46,0.06)]" id="interactive-lesson-card">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-label-md text-label-md font-bold">
                    {nextModule.unitTitle || 'Unit 3'} • Module {nextModule.moduleIndex + 1}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md">
                    Difficulty: Intermediate
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-tertiary-fixed/60 text-on-tertiary-fixed font-label-md text-label-md flex items-center gap-1 font-bold">
                    <Zap size={13} className="fill-current" /> +50 XP
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center gap-1">
                    <Clock size={13} /> {nextModule.readTimeMinutes || 7} mins
                  </span>
                </div>

                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                  {nextModule.title}
                </h2>

                <p className="font-body-md text-body-md text-on-surface-variant pt-2 max-w-2xl">
                  {nextModule.pedagogy?.concept || nextModule.lesson?.hook || 'Examine fundamental networking mechanisms, header configurations, and packet transitions.'}
                </p>

                {/* Key Takeaways Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
                  {(nextModule.keyTakeaways || [
                    'Master architectural boundaries & RFC definitions.',
                    'Analyze packet framing & control flags.',
                    'Solve drills to unlock module knowledge check quiz.'
                  ]).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-container-low flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium line-clamp-2">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Action Card Column */}
              <div className="w-full md:w-56 shrink-0 flex flex-col gap-3 justify-center">
                <button 
                  onClick={() => { 
                    soundFx.playClick(); 
                    onNavigate('learn-map'); 
                  }}
                  className="w-full py-4 px-6 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-[0_5px_0_0_#047857,0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_0_0_#047857,0_6px_12px_rgba(16,185,129,0.2)] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
                >
                  <span>{completedIds.includes(nextModule.id) ? 'Island Learning Map' : 'Go to Island Map'}</span>
                  <ArrowRight size={20} />
                </button>

                <button 
                  onClick={() => { soundFx.playClick(); onNavigate('learn-map'); }}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark size={16} />
                  <span>Open Full Learning Map</span>
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ======================================================== */}
        {/* RIGHT UTILITY & ANALYTICS RAIL (approx 32% / col-span-4)  */}
        {/* ======================================================== */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* 1. STUDENT PROFILE SUMMARY & 7-DAY XP ACTIVITY */}
          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary text-xl font-bold shadow-sm">
                  {firstName[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[12px] font-bold shadow-[0_2px_0_0_#047857]">
                  {currentLevel}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{displayName}</h3>
                <p className="font-body-sm text-body-sm text-primary font-semibold flex items-center gap-1">
                  <Router size={14} />
                  <span>Network Apprentice</span>
                </p>
                <span className="font-label-md text-label-md text-outline block truncate">
                  {studentId ? `ID: #${studentId} • ` : ''}{college}
                </span>
              </div>
            </div>

            {/* 7-Day Activity Bar Chart */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Weekly Output</span>
                <span className="font-code-metric text-code-metric text-on-surface font-bold">{currentXp} XP total</span>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-1 px-1 bg-surface-container-low rounded-xl">
                {days.map((dayLabel, idx) => {
                  const isCurrent = idx === todayIdx;
                  const barHeight = currentXp > 0 ? (isCurrent ? 95 : weeklyHeights[idx]) : 8;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div 
                        className={`w-full max-w-[16px] rounded-t-md transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-t from-primary to-primary-container shadow-[0_0_8px_#ff6b00]'
                            : 'bg-surface-container-highest group-hover:bg-primary-container'
                        }`} 
                        style={{ height: `${barHeight}%` }}
                      />
                      <span className={`font-label-md text-label-md text-[11px] ${isCurrent ? 'text-primary font-bold' : 'text-outline'}`}>
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm text-[12px] pt-1">
                <span>{currentStreak > 0 ? `Goal met: ${Math.min(7, currentStreak)} of 7 days` : 'Goal met: 0 of 7 days'}</span>
                <span className="text-tertiary-container font-semibold">Sunday Peak</span>
              </div>
            </div>
          </section>

          {/* 2. DAILY CHALLENGE CARD */}
          <section className="rounded-xl bg-gradient-to-br from-surface-container-lowest to-emerald-50/60 dark:to-emerald-950/20 p-6 shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] relative overflow-hidden border border-emerald-100/80 dark:border-emerald-950/40">
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-emerald-500">
              <AlarmClock size={130} />
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-label-md text-label-md font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap size={13} className="fill-current" />
                Daily Challenge
              </span>
              <div className="flex items-center gap-1 font-code-metric text-code-metric text-error font-bold bg-error-container/40 px-2 py-0.5 rounded">
                <Clock size={13} />
                <span>04:42</span>
              </div>
            </div>

            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
              Identify the Correct Routing Algorithm
            </h3>

            <p className="font-body-sm text-body-sm text-on-surface-variant pt-1 pb-4">
              Evaluate link-state convergence vs distance-vector count-to-infinity vulnerabilities.
            </p>

            <div className="flex items-center gap-3 text-[13px] text-on-surface-variant pb-5">
              <span className="flex items-center gap-1">
                <HelpCircle size={15} className="text-primary" />
                3 Questions
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-tertiary-container font-bold">
                <Zap size={15} className="fill-current" />
                +100 XP
              </span>
            </div>

            <button 
              onClick={() => { soundFx.playClick(); onNavigate('boss-challenge'); }}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-label-lg text-label-lg font-bold shadow-[0_4px_0_0_#047857] hover:shadow-[0_2px_0_0_#047857] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Take Challenge</span>
              <ArrowRight size={16} />
            </button>
          </section>

          {/* 3. COMPACT WEEKLY LEADERBOARD */}
          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Diamond size={20} className="text-amber-500 fill-amber-500" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Diamond League</h3>
              </div>
              <button 
                onClick={() => { soundFx.playClick(); onNavigate('leaderboard'); }}
                className="font-label-md text-label-md text-primary font-bold cursor-pointer hover:underline"
              >
                View All
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-outline -mt-2">Top 3 promote to Master League in 2d 14h</p>

            {/* Leaderboard Rows */}
            <div className="flex flex-col gap-2 pt-1">
              {topStudents.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/60 text-center">
                  <p className="font-title-md text-title-md font-semibold text-on-surface">Leaderboard Cleared</p>
                  <p className="font-body-sm text-body-sm text-outline mt-0.5 text-xs">Start learning modules to earn XP and claim the #1 rank!</p>
                </div>
              ) : (
                topStudents.map((s, idx) => {
                  const rank = idx + 1;
                  const isMe = s.isCurrentUser || s.id === currentUser?.uid;

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                        isMe
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 shadow-xs'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full font-bold text-[12px] flex items-center justify-center shrink-0 ${
                          rank === 1 ? 'bg-tertiary-fixed text-tertiary shadow-sm'
                            : rank === 2 ? 'bg-outline-variant text-on-surface shadow-sm'
                            : rank === 3 ? 'bg-tertiary-fixed-dim text-on-tertiary-fixed shadow-sm'
                            : 'text-outline'
                        }`}>
                          {rank}
                        </span>

                        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {s.name[0]}
                        </div>

                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <span className={`font-title-md text-title-md font-semibold truncate ${isMe ? 'text-on-surface' : 'text-on-surface'}`}>
                            {s.name}
                          </span>
                          {isMe && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                              You
                            </span>
                          )}
                          {s.isCourseCompleted && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase shrink-0" title="Course Completed">
                              Finisher
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`font-code-metric text-code-metric font-bold shrink-0 ${isMe ? 'text-emerald-600 dark:text-emerald-400' : 'text-on-surface'}`}>
                        {s.xp.toLocaleString()} XP
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 4. 3D ACHIEVEMENT BADGES COLLECTION */}
          <section className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Protocol Medals</h3>
              <span className="font-label-md text-label-md text-primary font-bold">
                {completedIds.length >= 1 ? '1 / 12 Unlocked' : '0 / 12 Unlocked'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Badge 1: Network Navigator */}
              <div 
                onClick={() => onNavigate('achievements')}
                className="p-3.5 rounded-xl bg-surface-container-low flex flex-col items-center text-center gap-2 transition-transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_4px_0_0_#047857]">
                  <Compass size={24} />
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-bold block text-[13px]">Navigator</span>
                  <span className="font-body-sm text-body-sm text-outline text-[11px] block">Unit 1 Complete</span>
                </div>
              </div>

              {/* Badge 2: Consistency Master */}
              <div 
                onClick={() => onNavigate('achievements')}
                className="p-3.5 rounded-xl bg-surface-container-low flex flex-col items-center text-center gap-2 transition-transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-tertiary-fixed-dim to-tertiary flex items-center justify-center text-on-tertiary-fixed shadow-[0_4px_0_0_#583d00]">
                  <Flame size={24} />
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-bold block text-[13px]">Consistency</span>
                  <span className="font-body-sm text-body-sm text-outline text-[11px] block">10-Day Streak</span>
                </div>
              </div>

              {/* Badge 3: Fast Learner */}
              <div 
                onClick={() => onNavigate('achievements')}
                className="p-3.5 rounded-xl bg-surface-container-low flex flex-col items-center text-center gap-2 transition-transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-[0_4px_0_0_#047857]">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-bold block text-[13px]">Fast Learner</span>
                  <span className="font-body-sm text-body-sm text-outline text-[11px] block">5 Lessons in 1 Day</span>
                </div>
              </div>

              {/* Badge 4: Routing Master (locked) */}
              <div 
                onClick={() => onNavigate('achievements')}
                className="p-3.5 rounded-xl bg-surface-container-low flex flex-col items-center text-center gap-2 opacity-65 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-outline shadow-[0_4px_0_0_#c5c5d9]">
                  <Router size={24} />
                </div>
                <div className="w-full">
                  <span className="font-title-md text-title-md text-on-surface font-bold block text-[13px]">Routing Master</span>
                  <div className="w-full h-1.5 bg-surface-container rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="font-body-sm text-body-sm text-outline text-[10px] block mt-0.5">{progressPercent}% completed</span>
                </div>
              </div>

            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
