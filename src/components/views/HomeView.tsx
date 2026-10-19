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
