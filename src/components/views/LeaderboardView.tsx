import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Crown, 
  Flame, 
  ArrowUp, 
  Layers, 
  BarChart2
} from 'lucide-react';
import { useAuth, GLOBAL_RESET_EPOCH } from '../../context/AuthContext';
import { TOTAL_MODULES_COUNT } from '../../data/courseContent';
import { isAuthorizedDeveloper } from '../../config/developers';
import { LeaderboardStudent } from '../../types';
import { soundFx } from '../../utils/audio';

export interface FirestoreStudentEntry {
  uid: string;
  name?: string;
  displayName?: string;
  studentId?: string;
  email?: string;
  college?: string;
  totalXP?: number;
  xp?: number;
  overallProgress?: number;
  modulesCompleted?: number;
  lessonsCompleted?: number;
  completedModules?: string[];
  lastLesson?: string | null;
  currentModule?: string;
  streak?: number;
  level?: number;
  avatar?: string;
  role?: string;
  resetEpoch?: string;
  isOnline?: boolean;
  lastLogin?: any;
  courseCompletedAt?: any;
  completedAt?: any;
  updatedAt?: any;
  finisherRank?: number;
}

interface LeaderboardViewProps {
  students?: LeaderboardStudent[];
  onNavigate?: (tab: string) => void;
}

// Convert timestamp format to milliseconds
const getTimestampMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try { return val.toDate().getTime(); } catch (e) { return 0; }
    }
    if (typeof val.seconds === 'number') {
      return val.seconds * 1000 + Math.round((val.nanoseconds || 0) / 1e6);
    }
    if (val._seconds) {
      return val._seconds * 1000;
    }
  }
  return 0;
};

// Check if student has finished the entire curriculum
const checkStudentCourseCompleted = (s: { modulesCompleted?: number; completedModules?: string[]; overallProgress?: number }): boolean => {
  const mods = s.modulesCompleted ?? (s.completedModules || []).length;
  const prog = s.overallProgress ?? 0;
  return mods >= (TOTAL_MODULES_COUNT || 30) || prog >= 100;
};

// Get completion timestamp
const getStudentCompletionTimestamp = (s: FirestoreStudentEntry): number => {
  if (!checkStudentCourseCompleted(s)) return 0;
  const explicit = getTimestampMs(s.courseCompletedAt || s.completedAt);
  if (explicit > 0) return explicit;
  const fallback = getTimestampMs(s.updatedAt || s.lastLogin);
  if (fallback > 0) return fallback;
  return 0;
};

// Filter out developer accounts
const isDevAccount = (
  idOrUid?: string,
  email?: string,
  name?: string,
  role?: string
): boolean => {
  const normId = (idOrUid || '').trim().toLowerCase();
  const normEmail = (email || '').trim().toLowerCase();
  const normName = (name || '').trim().toLowerCase();
  const normRole = (role || '').trim().toLowerCase();

  if (normRole === 'developer') return true;
  if (normId.startsWith('dev_')) return true;
  if (normId === '285' || normId === '279' || normId === '99240040285' || normId === '99240040279') return true;
  if (normEmail.includes('dev285') || normEmail.includes('dev279') || normEmail.includes('40285') || normEmail.includes('40279')) return true;
  if (normName.includes('platform lead') || normName.includes('core systems') || normName.includes('developer')) return true;
  return isAuthorizedDeveloper(normId) || isAuthorizedDeveloper(normEmail);
};

// Scan locally cached student profiles
const scanLocalStudents = (): FirestoreStudentEntry[] => {
  const list: FirestoreStudentEntry[] = [];
  if (typeof window === 'undefined') return list;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('klu_profile_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (data.resetEpoch !== GLOBAL_RESET_EPOCH) continue;
            const sId = data.studentId || key.replace('klu_profile_', '');
            if (!isDevAccount(sId, data.email, data.name || data.displayName, data.role)) {
              const uid = data.uid || `klu_${sId}`;
              const completedList = data.completedModules || [];
              const calculatedProgress = data.overallProgress ?? Math.min(100, Math.round((completedList.length / (TOTAL_MODULES_COUNT || 30)) * 100));
              const calculatedXP = data.totalXP ?? data.xp ?? 0;

              list.push({
                uid,
                name: data.name || data.displayName || sId,
                displayName: data.displayName || data.name || sId,
                studentId: sId,
                email: data.email || `${sId}@klu.ac.in`,
                college: data.college || 'KLU',
                totalXP: calculatedXP,
                xp: calculatedXP,
                overallProgress: calculatedProgress,
                modulesCompleted: data.modulesCompleted ?? completedList.length,
                completedModules: completedList,
                courseCompletedAt: data.courseCompletedAt || data.completedAt,
                updatedAt: data.updatedAt,
                streak: data.streak || 1,
                level: (data as any)?.level || Math.max(1, Math.floor(calculatedXP / 500) + 1),
                avatar: data.avatar,
                role: 'student',
              });
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn("Error scanning local student profiles:", e);
  }

  return list;
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();
  const [remoteStudents, setRemoteStudents] = useState<FirestoreStudentEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Merge ONLY REAL Firestore cloud entries, local storage, and logged-in student (ZERO FAKE DATA)
  const getMergedStudents = useCallback((firestoreStudents: FirestoreStudentEntry[]): FirestoreStudentEntry[] => {
    const map = new Map<string, FirestoreStudentEntry>();

    // 1. Ingest real cloud Firestore students
    firestoreStudents.forEach((s) => {
      if (isDevAccount(s.studentId || s.uid, s.email, s.displayName || s.name, s.role)) return;
      const sId = (s.studentId || s.uid.replace(/^klu_/, '')).trim();
      const key = (sId || s.uid).toLowerCase();

      const sXP = s.totalXP ?? s.xp ?? 0;
      const sMods = s.modulesCompleted ?? (s.completedModules || []).length;
      const sProg = s.overallProgress ?? Math.min(100, Math.round((sMods / (TOTAL_MODULES_COUNT || 30)) * 100));
      const isFinished = sMods >= (TOTAL_MODULES_COUNT || 30) || sProg >= 100;
      const sCompletedAt = s.courseCompletedAt || s.completedAt || (isFinished ? (s.updatedAt || s.lastLogin) : undefined);

      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          uid: s.uid || existing.uid,
          studentId: sId || existing.studentId,
          displayName: s.displayName || s.name || existing.displayName,
          name: s.name || s.displayName || existing.name,
          totalXP: Math.max(existing.totalXP || 0, sXP),
          xp: Math.max(existing.xp || 0, sXP),
          modulesCompleted: Math.max(existing.modulesCompleted || 0, sMods),
          overallProgress: Math.max(existing.overallProgress || 0, sProg),
          streak: Math.max(existing.streak || 0, s.streak || 0),
          level: s.level || Math.max(existing.level || 1, Math.floor(sXP / 500) + 1),
          courseCompletedAt: sCompletedAt || existing.courseCompletedAt,
          isOnline: s.isOnline !== undefined ? s.isOnline : existing.isOnline,
        });
      } else {
        map.set(key, {
          uid: s.uid,
          studentId: sId,
          name: s.name || s.displayName || sId,
          displayName: s.displayName || s.name || sId,
          email: s.email || `${sId}@klu.ac.in`,
          college: s.college || 'KLU',
          totalXP: sXP,
          xp: sXP,
          overallProgress: sProg,
          modulesCompleted: sMods,
          completedModules: s.completedModules || [],
          streak: s.streak || 1,
          level: s.level || Math.max(1, Math.floor(sXP / 500) + 1),
          courseCompletedAt: sCompletedAt,
          updatedAt: s.updatedAt,
          role: 'student',
          isOnline: !!s.isOnline,
        });
      }
    });

    // 2. Ingest real local student profiles from browser cache
    const localList = scanLocalStudents();
    localList.forEach((local) => {
      const sId = (local.studentId || local.uid.replace(/^klu_/, '')).trim();
      if (!sId) return;
      const key = sId.toLowerCase();
      map.set(key, { ...map.get(key), ...local });
    });

    // 3. Ingest active real user profile
    if (currentUser && userProfile) {
      const sId = (userProfile.studentId || currentUser.uid.replace(/^klu_/, '')).trim();
      if (!isDevAccount(sId, userProfile.email, userProfile.displayName || userProfile.name, userProfile.role)) {
        const key = sId.toLowerCase();
        const currentXP = userProfile.totalXP ?? userProfile.xp ?? 0;
        const currentMods = (userProfile.completedModules || []).length;
        const currentProg = userProfile.overallProgress ?? Math.min(100, Math.round((currentMods / (TOTAL_MODULES_COUNT || 30)) * 100));

        map.set(key, {
          uid: currentUser.uid,
          name: userProfile.name || userProfile.displayName || sId,
          displayName: userProfile.displayName || userProfile.name || sId,
          studentId: sId,
          email: userProfile.email || `${sId}@klu.ac.in`,
          college: userProfile.college || 'KLU',
          totalXP: currentXP,
          xp: currentXP,
          overallProgress: currentProg,
          modulesCompleted: currentMods,
          completedModules: userProfile.completedModules || [],
          streak: userProfile.streak || 1,
          level: (userProfile as any)?.level || Math.max(1, Math.floor(currentXP / 500) + 1),
          avatar: (userProfile as any)?.avatar,
          role: 'student',
          isOnline: true,
        });
      }
    }

    return Array.from(map.values()).filter((s) => !isDevAccount(s.studentId || s.uid, s.email, s.displayName || s.name, s.role));
  }, [currentUser, userProfile]);

  // Real-time Firestore sync listener
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const leaderboardRef = collection(db, 'public_leaderboard');
      unsubscribe = onSnapshot(
        leaderboardRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudData: FirestoreStudentEntry[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              const calculatedXP = Number(data.totalXP ?? data.xp ?? 0);
              const calculatedProgress = Number(
                data.overallProgress ?? Math.min(100, Math.round(((data.modulesCompleted || 0) / (TOTAL_MODULES_COUNT || 30)) * 100))
              );
              const sId = data.studentId || docSnap.id.replace(/^klu_/, '');

              cloudData.push({
                uid: docSnap.id,
                studentId: sId,
                name: data.displayName || data.name || sId,
                displayName: data.displayName || data.name || sId,
                totalXP: calculatedXP,
                xp: calculatedXP,
                overallProgress: calculatedProgress,
                modulesCompleted: Number(data.modulesCompleted || 0),
                courseCompletedAt: data.courseCompletedAt || null,
                updatedAt: data.updatedAt,
                streak: Number(data.streak || 1),
                level: Number(data.level || Math.max(1, Math.floor(calculatedXP / 500) + 1)),
              });
            });
            setRemoteStudents(cloudData);
            setLastSyncTime(new Date());
          }
        },
        (err) => {
          console.warn("Real-time public leaderboard warning:", err);
        }
      );
    } catch (err) {
      console.warn("Failed to attach leaderboard listener:", err);
    }

    return () => unsubscribe();
  }, []);

  // Listen to cross-tab updates
  useEffect(() => {
    const handleUpdate = () => setLastSyncTime(new Date());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('netquest_profile_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('netquest_profile_updated', handleUpdate);
    };
  }, []);

  const handleManualRefresh = () => {
    soundFx.playClick();
    setIsRefreshing(true);
    setLastSyncTime(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Rank real students strictly by Total Points / XP descending
  const rankedStudents = useMemo(() => {
    const rawList = getMergedStudents(remoteStudents);

    return [...rawList].sort((a, b) => {
      const xpA = a.totalXP ?? a.xp ?? 0;
      const xpB = b.totalXP ?? b.xp ?? 0;
      if (xpB !== xpA) return xpB - xpA;
      return (a.studentId || a.displayName || '').localeCompare(b.studentId || b.displayName || '');
    });
  }, [getMergedStudents, remoteStudents, lastSyncTime]);

  // Current user rank & metrics
  const currentUserIndex = rankedStudents.findIndex(
    (s) => currentUser && (s.uid === currentUser.uid || (userProfile?.studentId && s.studentId === userProfile.studentId))
  );
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : (rankedStudents.length > 0 ? rankedStudents.length + 1 : 1);
  const currentStudentEntry = currentUserIndex >= 0 ? rankedStudents[currentUserIndex] : null;

  // Filter students by search query (Search by Register Number or Name)
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return rankedStudents.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return rankedStudents.filter((s) => {
      const sId = (s.studentId || '').toLowerCase();
      const name = (s.displayName || s.name || '').toLowerCase();
      return sId.includes(q) || name.includes(q);
    });
  }, [rankedStudents, searchQuery]);

  // Top 3 Podium Real Students
  const rank1 = rankedStudents[0];
  const rank2 = rankedStudents[1];
  const rank3 = rankedStudents[2];

  // Current user display register number
  const currentRegNo = userProfile?.studentId || currentStudentEntry?.studentId || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest');

  return (
    <div className="relative w-full min-h-screen py-6 px-3 sm:px-6 max-w-4xl mx-auto font-sans select-none animate-in fade-in duration-300">
      
      {/* Background Soft Sky Glow & Watermarks */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-200/35 via-indigo-100/25 to-transparent dark:from-indigo-950/25 dark:via-slate-900/35 rounded-full blur-3xl" />
        
        {/* Floating 3D Sparkles & Gems */}
        <div className="absolute top-28 left-16 text-cyan-400/50 text-xl animate-pulse">💎</div>
        <div className="absolute top-48 right-24 text-amber-400/60 text-lg animate-bounce">✨</div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP BRAND HEADER                                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onNavigate) {
              onNavigate('learn');
            } else if (window.history.length > 1) {
              window.history.back();
            }
          }}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200/60 dark:border-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
          title="Go Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        {/* Brand Center */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-[#1E1B4B] dark:text-white">CRESCO</span>
            <span className="text-[#4F46E5] dark:text-[#38BDF8]">CN</span>
          </h2>
          <div className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-400 uppercase mt-0.5">
            LEARN • PRACTICE • IMPROVE • LEAD
          </div>
        </div>

        {/* Time Filter Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="rounded-full bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-purple-800/40 px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs hover:bg-purple-50/80 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="capitalize">{timeFilter === 'all' ? 'All Time' : timeFilter === 'month' ? 'This Month' : 'This Week'}</span>
          </button>

          {isTimeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-purple-100 dark:border-slate-700 py-1.5 z-50 text-xs font-bold text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { setTimeFilter('all'); setIsTimeDropdownOpen(false); soundFx.playClick(); }}
                className={`w-full text-left px-3.5 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center justify-between cursor-pointer ${timeFilter === 'all' ? 'text-purple-600 font-extrabold' : ''}`}
              >
                <span>All Time</span>
                {timeFilter === 'all' && <span>✓</span>}
              </button>
              <button
                onClick={() => { setTimeFilter('month'); setIsTimeDropdownOpen(false); soundFx.playClick(); }}
                className={`w-full text-left px-3.5 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center justify-between cursor-pointer ${timeFilter === 'month' ? 'text-purple-600 font-extrabold' : ''}`}
              >
                <span>This Month</span>
                {timeFilter === 'month' && <span>✓</span>}
              </button>
              <button
                onClick={() => { setTimeFilter('week'); setIsTimeDropdownOpen(false); soundFx.playClick(); }}
                className={`w-full text-left px-3.5 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center justify-between cursor-pointer ${timeFilter === 'week' ? 'text-purple-600 font-extrabold' : ''}`}
              >
                <span>This Week</span>
                {timeFilter === 'week' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TITLE BANNER                                                           */}
      {/* ========================================================================= */}
      <div className="text-center mb-6 relative">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] dark:text-white uppercase drop-shadow-xs">
          <span className="text-[#1E1B4B] dark:text-white">LEADER</span>
          <span className="text-[#3B82F6] dark:text-[#60A5FA]">BOARD</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
          Real-Time Student Cohort Standings
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. 3D TOP 3 PODIUM (WITH REAL REGISTER NUMBERS & OCTOPUS MASCOT)         */}
      {/* ========================================================================= */}
      <div className="relative pt-10 pb-4 mb-6">
        
        {/* Octopus Mascot Holding Trophy */}
        <div className="absolute -top-6 right-2 sm:right-6 z-20 pointer-events-none select-none">
          <img
            src="/assets/mascot/mascot-achievement.png"
            alt="Cresco CN Mascot with Trophy"
            className="w-24 sm:w-28 md:w-32 h-auto object-contain filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.3)] animate-bounce"
            style={{ animationDuration: '4s' }}
          />
        </div>

        {/* Podium Pillars Container */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-lg mx-auto relative z-10 px-2">
          
          {/* 🥈 Rank 2: Silver Pedestal (Left) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Avatar / Initial */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-300 via-slate-100 to-indigo-400 shadow-[0_6px_16px_rgba(99,102,241,0.3)] relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 text-indigo-300 font-mono font-black text-sm sm:text-base flex items-center justify-center border-2 border-white dark:border-slate-800">
                  {rank2?.studentId ? rank2.studentId.slice(-4) : '—'}
                </div>
              </div>
            </div>

            {/* 3D Silver Pedestal Block */}
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#E0E7FF] via-[#C7D2FE] to-[#A5B4FC] shadow-[0_10px_20px_rgba(99,102,241,0.25)] border-t border-white/60 p-3 pt-6 flex flex-col items-center text-center relative min-h-[110px] sm:min-h-[125px]">
              <div className="absolute -top-4 w-8 h-8 rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                2
              </div>

              {rank2 ? (
                <>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-950 truncate max-w-full px-1">
                    {rank2.studentId || rank2.displayName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-800 font-mono">
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                    <span>{(rank2.totalXP ?? rank2.xp ?? 0).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <span className="text-[11px] font-bold text-indigo-900 mt-2">Open Slot</span>
              )}
            </div>
          </div>

          {/* 🥇 Rank 1: Gold Pedestal (Center - Highest) */}
          <div className="flex-1 flex flex-col items-center z-10">
            {/* Crown + Avatar / Initial */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="absolute -top-8 text-amber-400 filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)] animate-pulse">
                <Crown className="w-8 h-8 fill-amber-400 text-amber-500" />
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-[0_8px_25px_rgba(245,158,11,0.45)] relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 text-amber-300 font-mono font-black text-base sm:text-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
                  {rank1?.studentId ? rank1.studentId.slice(-4) : '—'}
                </div>
              </div>
            </div>

            {/* 3D Gold Pedestal Block */}
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#FDE047] via-[#FACC15] to-[#EAB308] shadow-[0_14px_28px_rgba(234,179,8,0.35)] border-t border-white/70 p-3 pt-6 flex flex-col items-center text-center relative min-h-[135px] sm:min-h-[150px]">
              <div className="absolute -top-5 w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white font-black text-base flex items-center justify-center shadow-lg border-2 border-white">
                1
              </div>

              {rank1 ? (
                <>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-950 truncate max-w-full px-1">
                    {rank1.studentId || rank1.displayName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-900 font-mono">
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                    <span>{(rank1.totalXP ?? rank1.xp ?? 0).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <span className="text-[11px] font-bold text-amber-950 mt-2">Open Slot</span>
              )}
            </div>
          </div>

          {/* 🥉 Rank 3: Bronze Pedestal (Right) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Avatar / Initial */}
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-orange-300 to-amber-700 shadow-[0_6px_16px_rgba(249,115,22,0.3)] relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 text-orange-300 font-mono font-black text-sm sm:text-base flex items-center justify-center border-2 border-white dark:border-slate-800">
                  {rank3?.studentId ? rank3.studentId.slice(-4) : '—'}
                </div>
              </div>
            </div>

            {/* 3D Bronze Pedestal Block */}
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#FED7AA] via-[#FDBA74] to-[#FB923C] shadow-[0_10px_20px_rgba(249,115,22,0.25)] border-t border-white/60 p-3 pt-6 flex flex-col items-center text-center relative min-h-[95px] sm:min-h-[110px]">
              <div className="absolute -top-4 w-8 h-8 rounded-xl bg-gradient-to-b from-amber-600 to-orange-700 text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                3
              </div>

              {rank3 ? (
                <>
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-950 truncate max-w-full px-1">
                    {rank3.studentId || rank3.displayName}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-900 font-mono">
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                    <span>{(rank3.totalXP ?? rank3.xp ?? 0).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <span className="text-[11px] font-bold text-orange-950 mt-2">Open Slot</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN LEADERBOARD TABLE CARD (REGISTER NUMBERS)                         */}
      {/* ========================================================================= */}
      <div className="bg-white/95 dark:bg-[#131722]/95 backdrop-blur-xl rounded-[2rem] border border-blue-100/70 dark:border-slate-800 shadow-[0_20px_50px_rgba(79,70,229,0.06)] overflow-hidden mb-8">
        
        {/* Search Bar & Stats Filter Row */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Register Number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 self-end sm:self-center">
            <span>{rankedStudents.length} Registered Students</span>
            <button
              onClick={handleManualRefresh}
              title="Refresh standings"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-14">#</th>
                <th className="py-3.5 px-4">Register Number</th>
                <th className="py-3.5 px-4 text-left">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Points</span>
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span className="flex items-center justify-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Level</span>
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <span className="flex items-center justify-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Streak</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                    {searchQuery ? `No student found for "${searchQuery}"` : 'No student records yet. Start practice or complete modules to appear here!'}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student, idx) => {
                  const rank = idx + 1;
                  const isCurrent = currentUser && (student.uid === currentUser.uid || (userProfile?.studentId && student.studentId === userProfile.studentId));
                  const regNo = student.studentId || (student.uid.startsWith('klu_') ? student.uid.replace('klu_', '') : student.displayName || 'Student');
                  const points = student.totalXP ?? student.xp ?? 0;
                  const level = student.level || Math.max(1, Math.floor(points / 500) + 1);
                  const streak = student.streak || 1;

                  // Row Tint based on Rank
                  const rowBg = rank === 1
                    ? 'bg-amber-50/70 hover:bg-amber-100/60 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
                    : rank === 2
                    ? 'bg-indigo-50/60 hover:bg-indigo-100/50 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/15'
                    : rank === 3
                    ? 'bg-orange-50/60 hover:bg-orange-100/50 dark:bg-orange-500/10 dark:hover:bg-orange-500/15'
                    : isCurrent
                    ? 'bg-blue-50/80 hover:bg-blue-100/70 dark:bg-blue-600/15'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40';

                  return (
                    <tr
                      key={student.uid || idx}
                      className={`transition-colors ${rowBg}`}
                    >
                      {/* Rank Number / Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-white font-black text-xs flex items-center justify-center mx-auto shadow-xs border border-amber-300">
                            1
                          </div>
                        ) : rank === 2 ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-indigo-300 to-indigo-500 text-white font-black text-xs flex items-center justify-center mx-auto shadow-xs border border-indigo-200">
                            2
                          </div>
                        ) : rank === 3 ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-xs border border-orange-300">
                            3
                          </div>
                        ) : (
                          <span className="font-bold text-slate-500 dark:text-slate-400">
                            {rank}
                          </span>
                        )}
                      </td>

                      {/* Register Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                            {regNo.slice(-3)}
                          </div>

                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className={`font-mono text-xs sm:text-sm font-black ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {regNo}
                              </span>
                              {rank === 1 && (
                                <span className="text-amber-500 text-sm">👑</span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[8px] font-extrabold uppercase tracking-wider">
                                  YOU
                                </span>
                              )}
                            </div>
                            {student.displayName && student.displayName !== regNo && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                {student.displayName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Points Column with Green Arrow */}
                      <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <div className="flex items-center gap-1.5">
                          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{points.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Level Column */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-extrabold">
                          Lv. {level}
                        </span>
                      </td>

                      {/* Streak Column */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{streak}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. STICKY / BOTTOM CARD: "YOUR RANKING" (CLEAN MINIMAL - NO ARROW)         */}
      {/* ========================================================================= */}
      <div className="sticky bottom-4 z-30">
        <div className="rounded-[1.75rem] bg-white/95 dark:bg-[#151926]/95 backdrop-blur-md border border-blue-100/90 dark:border-slate-800 shadow-[0_12px_36px_rgba(79,70,229,0.12)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Your Ranking + Register Number */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-300 font-mono font-black text-sm flex items-center justify-center border-2 border-indigo-500/40 shadow-sm shrink-0">
              {currentRegNo.slice(-4)}
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your Ranking
              </div>
              
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {currentUserRank === 1 ? '1st' : currentUserRank === 2 ? '2nd' : currentUserRank === 3 ? '3rd' : `${currentUserRank}th`}
                </span>
                
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {currentRegNo}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Keep going! You are doing great!
              </div>
            </div>
          </div>

          {/* Right: Points + Level + Streak (NO CERTIFICATE ARROW BUTTON) */}
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            {/* Points */}
            <div className="text-center sm:text-right">
              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                <span>{(currentStudentEntry?.totalXP ?? userProfile?.totalXP ?? 0).toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Points</div>
            </div>

            {/* Level */}
            <div className="text-center">
              <div className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-extrabold text-xs">
                Lv. {currentStudentEntry?.level ?? (userProfile as any)?.level ?? 1}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Level</div>
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{currentStudentEntry?.streak ?? userProfile?.streak ?? 1}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Streak</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
