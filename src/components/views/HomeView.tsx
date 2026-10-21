import React, { useState, useEffect, useMemo } from 'react';
import { NavTab } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { CrescoMascot } from '../brand/CrescoMascot';
import { useAuth } from '../../context/AuthContext';
import { ALL_MODULES } from '../../data/courseContent';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PersonalizedNextCard } from '../personalization/PersonalizedNextCard';
import { evaluatePersonalizedRecommendations } from '../../services/personalizedLearningService';
import { PersonalizedRecommendation } from '../../types/personalization';
import { TutorInstructionalContext } from '../../types/aiTutor';
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

  const [cycleVersion, setCycleVersion] = useState(0);

  useEffect(() => {
    const handleCycleUpdated = () => {
      setCycleVersion((v) => v + 1);
    };
    window.addEventListener('cresco:learning-cycle-updated', handleCycleUpdated);
    return () => window.removeEventListener('cresco:learning-cycle-updated', handleCycleUpdated);
  }, []);

  // Deterministic Personalized Learning Engine (Step 24)
  const personalizationResult = useMemo(() => {
    return evaluatePersonalizedRecommendations({
      studentId: currentUser?.uid || userProfile?.studentId || 'guest_student',
      completedLessonIds: completedIds,
      practiceScores: (userProfile as any)?.practiceScores,
      quizAverage: userProfile?.quizAverage,
      remediationRecommendations: (userProfile as any)?.activeRemediations || []
    });
  }, [currentUser?.uid, userProfile?.studentId, completedIds, (userProfile as any)?.practiceScores, userProfile?.quizAverage, (userProfile as any)?.activeRemediations, cycleVersion]);

  const handleAskTutorAboutRec = (rec: PersonalizedRecommendation) => {
    const tutorContext: TutorInstructionalContext = {
      courseId: 'cs-4200',
      unitId: rec.unitId,
      lessonId: rec.targetLessonId,
      conceptTopic: rec.conceptTitle || rec.title,
      actionType: rec.category === 'strengthen_understanding' ? 'explain_mistake' : 'explain_concept',
      learningObjective: rec.rationale,
      explanationSnippet: rec.description
    };
    window.dispatchEvent(new CustomEvent('cresco:open-ai-tutor', { detail: tutorContext }));
  };

  // Active path view tab
  const [activePathFilter, setActivePathFilter] = useState<'roadmap' | 'labs' | 'rfcs'>('roadmap');

  // Real-time students leaderboard (starts fresh from 0)
  const [topStudents, setTopStudents] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    try {
      const leaderboardRef = collection(db, 'public_leaderboard');
      const unsubscribe = onSnapshot(leaderboardRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: LeaderboardUser[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const sXp = Number(data.totalXP ?? data.xp ?? 0);
            const sName = String(data.displayName || 'NetQuest Cadet');
            const isMe = docSnap.id === currentUser?.uid;
            const mods = Number(data.modulesCompleted || 0);
            const prog = Number(data.overallProgress || 0);
            const isCompleted = mods >= 30 || prog >= 100 || !!data.courseCompletedAt;

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
        console.warn("HomeView public_leaderboard onSnapshot handled error:", err);
        setTopStudents([]);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("HomeView public_leaderboard listener fallback:", e);
      setTopStudents([]);
    }
  }, [currentUser?.uid]);

  // Authentic Weekly activity computation (Mon=0..Sun=6)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  
  // Calculate start of current week (Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIdx);
  monday.setHours(0, 0, 0, 0);

  const studentActivityDates: string[] = Array.isArray((userProfile as any)?.activityDates) 
    ? (userProfile as any).activityDates 
    : [];

  const weeklyActiveDays = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dayOffset === todayIdx;
    const hasActivity = studentActivityDates.includes(dateStr) || (isToday && currentXp > 0);
    return {
      dayOffset,
      hasActivity,
      isToday,
      height: hasActivity ? (isToday ? 95 : 75) : 8
    };
  });

  const activeDaysCount = weeklyActiveDays.filter(d => d.hasActivity).length;

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
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse" />
                  <span className="font-headline text-xs text-white tracking-widest uppercase font-black">
                    CRESCO CN • {currentUser ? (nextModule.unitTitle || 'COMPUTER NETWORKS') : 'INTERACTIVE LEARNING PLATFORM'}
                  </span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight leading-tight">
                  {currentUser ? (
                    <>Welcome back, <span className="font-black text-amber-200">{firstName}</span> — Continue your journey</>
                  ) : (
                    <>Welcome to <span className="font-black text-amber-200">Cresco CN</span> — Master Networks Visually</>
                  )}
                </h1>

                <p className="font-body-md text-body-md text-primary-fixed pt-1 max-w-xl opacity-95 text-white/90">
                  {currentUser
                    ? 'Master architectural models, deterministic routing, and packet framing one simulation at a time.'
                    : 'The interactive visual computer networks platform for KLU students. Explore real-time protocol simulations, animated learning modules, hands-on packet labs, and curriculum-aligned modules.'
                  }
                </p>

                {currentUser ? (
                  /* Status Indicators & Track Bar */
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
                ) : (
                  /* Feature highlights pills for unauthenticated visitor */
                  <div className="pt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/25 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/15">
                      ⚡ Interactive Labs
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/25 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/15">
                      🎬 Animated Learning
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/25 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/15">
                      🌐 Live Packet Simulator
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/25 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/15">
                      🎓 Open KLU Google Sign-In
                    </span>
                  </div>
                )}

                {/* Primary Action CTA Buttons */}
                <div className="pt-6 flex flex-wrap items-center gap-3">
                  {currentUser ? (
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
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onNavigate('login');
                        }}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-surface-container-lowest text-primary font-headline-sm text-headline-sm shadow-[0_4px_0_0_#fed7aa,0_10px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_2px_0_0_#fed7aa,0_6px_12px_rgba(0,0,0,0.1)] active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <span>Student Login / Get Started</span>
                        <ArrowRight size={18} strokeWidth={2.8} />
                      </button>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onNavigate('animated-learning');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-headline-sm text-headline-sm backdrop-blur-md border border-white/25 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Play size={16} className="fill-white" />
                        <span>Animated Learning</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onNavigate('simulator');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-headline-sm text-headline-sm backdrop-blur-md border border-white/25 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Router size={16} />
                        <span>Try Packet Lab</span>
                      </button>
                    </>
                  )}
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
                  speechText={
                    currentUser
                      ? `Let's conquer ${nextModule.title?.split(':')[0]?.split('—')[0]?.trim() || 'Network Layer'}!`
                      : "Welcome to Cresco CN! Learn computer networks visually."
                  }
                  speechPosition="top"
                />
              </div>
            </div>
          </section>

          {/* 2. QUICK STATS CARDS ROW (3 Tactile Glassmorphic Cards) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Course Progress */}
            <div 
              onClick={() => onNavigate('learn-map')}
              className="group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" fill="none" r="19" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4.5" />
                  <circle 
                    cx="24" cy="24" fill="none" r="19" 
                    stroke="url(#progress-gradient)" 
                    strokeDasharray="119.38" 
                    strokeDashoffset={119.38 - (119.38 * progressPercent) / 100} 
                    strokeLinecap="round" strokeWidth="4.5"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform">
                  {progressPercent}%
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Curriculum Progress
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {completedIds.length > 0 ? `${Math.min(3, Math.ceil(completedIds.length / 6))} of 3 Units` : '0 of 3 Units'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {completedIds.length} of {ALL_MODULES.length || 30} Modules Cleared
                </p>
              </div>
            </div>

            {/* Card 2: Mastery Level & Total XP (Replaced Daily Goal / Challenge) */}
            <div 
              onClick={() => onNavigate('leaderboard')}
              className="group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Mastery Level
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                  <Sparkles size={11} className="fill-amber-500 text-amber-500" />
                  Lv. {currentLevel}
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                    {currentXp.toLocaleString()} <span className="text-xs font-semibold text-slate-400">XP</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {currentXp % 300} / 300 XP
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                    style={{ width: `${Math.max(6, Math.min(100, ((currentXp % 300) / 300) * 100))}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{300 - (currentXp % 300)} XP to reach Level {currentLevel + 1}</span>
              </p>
            </div>

            {/* Card 3: Active Streak */}
            <div 
              onClick={() => onNavigate('achievements')}
              className="group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-rose-500/40 transition-all duration-300 flex items-center gap-4 cursor-pointer hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-orange-500/15 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🔥
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Active Streak
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {currentStreak > 0 ? 'Streak Shield Active' : 'Complete a lesson to ignite streak'}
                </p>
              </div>
            </div>

          </section>

          {/* 4. DETERMINISTIC PERSONALIZED RECOMMENDATION HERO CARD (Step 24) */}
          <PersonalizedNextCard
            result={personalizationResult}
            onNavigate={onNavigate}
            onAskTutor={handleAskTutorAboutRec}
          />

        </div>

        {/* ======================================================== */}
        {/* RIGHT UTILITY & ANALYTICS RAIL (approx 32% / col-span-4)  */}
        {/* ======================================================== */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* 1. STUDENT PROFILE SUMMARY & 7-DAY XP ACTIVITY */}
          {!currentUser ? (
            <section className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_16px_-2px_rgba(19,27,46,0.06)] border border-emerald-500/20 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                  🎓
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">KLU Student Portal</h3>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">Open Access for All Students</p>
                  <span className="font-label-md text-label-md text-outline block">KLU • Computer Networks</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={14} />
                  <span>Platform Highlights</span>
                </div>
                <ul className="text-xs text-on-surface-variant space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span><strong>KLU Google Sign-In:</strong> Open to any @klu.ac.in student</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                    <span><strong>Animated Learning:</strong> Dynamic visual protocol flows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span><strong>Hands-On Labs:</strong> Interactive topology & packet simulator</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('login');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-headline-sm text-headline-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight size={16} />
              </button>
            </section>
          ) : (
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
                    const dayState = weeklyActiveDays[idx];
                    const isCurrent = dayState.isToday;
                    const barHeight = dayState.height;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div 
                          className={`w-full max-w-[16px] rounded-t-md transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-t from-primary to-primary-container shadow-[0_0_8px_#ff6b00]'
                              : dayState.hasActivity
                              ? 'bg-primary/80 group-hover:bg-primary'
                              : 'bg-surface-container-highest'
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
                  <span>{activeDaysCount > 0 ? `Active: ${activeDaysCount} of 7 days` : '0 days active this week'}</span>
                  <span className="text-tertiary-container font-semibold">
                    {activeDaysCount > 0 ? `${activeDaysCount}d Streak Target` : 'No study logged yet'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 2. COMPACT COHORT LEADERBOARD */}
          <section className="rounded-2xl bg-white dark:bg-[#0c1424] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Diamond size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
                <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white">Cohort Standings</h3>
              </div>
              <button 
                onClick={() => { soundFx.playClick(); onNavigate('leaderboard'); }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline flex items-center gap-1"
              >
                <span>View Full Standings</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">Real-time student rankings by verified course mastery</p>

            {/* Leaderboard Rows */}
            <div className="flex flex-col gap-2 pt-1">
              {topStudents.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Race to the Top</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Start learning modules to earn XP and claim the #1 rank!</p>
                </div>
              ) : (
                topStudents.map((s, idx) => {
                  const rank = idx + 1;
                  const isMe = s.isCurrentUser || s.id === currentUser?.uid;

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isMe
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs'
                          : 'bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${
                          rank === 1 ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : rank === 2 ? 'bg-indigo-300 text-slate-950 shadow-xs'
                            : rank === 3 ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 font-mono'
                        }`}>
                          {rank}
                        </span>

                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <span className={`font-mono text-xs font-bold truncate ${isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-200'}`}>
                            {s.name}
                          </span>
                          {isMe && (
                            <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0">
                              You
                            </span>
                          )}
                          {s.isCourseCompleted && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase shrink-0" title="Course Completed">
                              Finisher
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`font-mono text-xs font-bold shrink-0 ${isMe ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {s.xp.toLocaleString()} XP
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 3. MASCOT PROTOCOL MEDALS COLLECTION */}
          <section className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/25 shadow-xs">
                  <Sparkles size={16} className="fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    Protocol Medals
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official Cresco mascot badges earned via mastery
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('achievements');
                }}
                className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {completedIds.length >= 10 ? '4 / 4' : completedIds.length >= 1 ? '3 / 4' : '2 / 4'} Badges
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {/* Medal 1: Course Navigator (mascot-achievement.png) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('achievements');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 dark:from-slate-900 dark:via-[#131b2e] dark:to-slate-900 border border-amber-200/90 dark:border-amber-800/50 flex flex-col items-center text-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <div className="w-16 h-16 relative shrink-0 flex items-center justify-center p-1 rounded-2xl bg-gradient-to-b from-amber-100/80 to-amber-200/30 dark:from-amber-950/60 dark:to-amber-900/20 border border-amber-300/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <img
                    src="/assets/mascot/mascot-achievement.png"
                    alt="Network Achievement Trophy Medal"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.35)] relative z-10"
                  />
                </div>
                <div className="w-full min-w-0">
                  <span className="font-headline font-bold text-xs text-slate-900 dark:text-white block truncate">
                    Course Navigator
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50">
                    {completedIds.length >= 1 ? '★ Unlocked' : 'In Progress'}
                  </span>
                </div>
              </div>

              {/* Medal 2: Streak Master (mascot-streak.png) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('achievements');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-50/80 via-white to-orange-50/40 dark:from-slate-900 dark:via-[#131b2e] dark:to-slate-900 border border-rose-200/90 dark:border-rose-800/50 flex flex-col items-center text-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer group relative overflow-hidden"
              >
                <div className="w-16 h-16 relative shrink-0 flex items-center justify-center p-1 rounded-2xl bg-gradient-to-b from-rose-100/80 to-rose-200/30 dark:from-rose-950/60 dark:to-rose-900/20 border border-rose-300/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <img
                    src="/assets/mascot/mascot-streak.png"
                    alt="Consistency Streak Medal"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(244,63,94,0.35)] relative z-10"
                  />
                </div>
                <div className="w-full min-w-0">
                  <span className="font-headline font-bold text-xs text-slate-900 dark:text-white block truncate">
                    Streak Master
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300/50 dark:border-rose-700/50">
                    {currentStreak > 0 ? `🔥 ${currentStreak}d Streak` : 'Ignite Streak'}
                  </span>
                </div>
              </div>

              {/* Medal 3: Fast Learner (mascot-fast-learner.png) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('achievements');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-sky-50/80 via-white to-blue-50/40 dark:from-slate-900 dark:via-[#131b2e] dark:to-slate-900 border border-sky-200/90 dark:border-sky-800/50 flex flex-col items-center text-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer group relative overflow-hidden"
              >
                <div className="w-16 h-16 relative shrink-0 flex items-center justify-center p-1 rounded-2xl bg-gradient-to-b from-sky-100/80 to-blue-200/30 dark:from-sky-950/60 dark:to-blue-900/20 border border-sky-300/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <img
                    src="/assets/mascot/mascot-fast-learner.png"
                    alt="Fast Learner Lightning Medal"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(14,165,233,0.35)] relative z-10"
                  />
                </div>
                <div className="w-full min-w-0">
                  <span className="font-headline font-bold text-xs text-slate-900 dark:text-white block truncate">
                    Fast Learner
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded-md text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300/50 dark:border-sky-700/50">
                    ⚡ Packet Velocity
                  </span>
                </div>
              </div>

              {/* Medal 4: Problem Solving / Routing Master (mascot-problem-solving.png) */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('achievements');
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-50/80 via-white to-teal-50/40 dark:from-slate-900 dark:via-[#131b2e] dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/50 flex flex-col items-center text-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer group relative overflow-hidden"
              >
                <div className="w-16 h-16 relative shrink-0 flex items-center justify-center p-1 rounded-2xl bg-gradient-to-b from-emerald-100/80 to-teal-200/30 dark:from-emerald-950/60 dark:to-teal-900/20 border border-emerald-300/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <img
                    src="/assets/mascot/mascot-problem-solving.png"
                    alt="Problem Solving Routing Medal"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(16,185,129,0.35)] relative z-10"
                  />
                </div>
                <div className="w-full min-w-0">
                  <span className="font-headline font-bold text-xs text-slate-900 dark:text-white block truncate">
                    Routing Architect
                  </span>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.max(8, progressPercent)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-mono">{progressPercent}% unlocked</span>
                </div>
              </div>

            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
