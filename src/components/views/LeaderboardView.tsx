import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  RefreshCw, 
  Crown, 
  Clock, 
  Zap, 
  CheckCheck,
  Flag,
  Award,
  Sparkles,
  ShieldCheck,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useAuth, GLOBAL_RESET_EPOCH } from '../../context/AuthContext';
import { TOTAL_MODULES_COUNT } from '../../data/courseContent';
import { STUDENT_CREDENTIALS } from '../../data/studentCredentials';
import { isAuthorizedDeveloper } from '../../config/developers';
import { LeaderboardStudent } from '../../types';
import { CertificateModal } from '../modals/CertificateModal';

export interface LeaderboardBadge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  badgeClass: string;
  isUnlocked: (s: { totalXP?: number; xp?: number; modulesCompleted?: number; completedModules?: string[]; streak?: number; overallProgress?: number; finisherRank?: number }) => boolean;
}

export const LEADERBOARD_BADGES: LeaderboardBadge[] = [
  {
    id: 'pioneer',
    name: 'Course Finisher',
    icon: '👑',
    desc: 'Completed all 30 Computer Networks modules',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    isUnlocked: (s) => (s.modulesCompleted ?? (s.completedModules || []).length) >= (TOTAL_MODULES_COUNT || 30) || (s.overallProgress ?? 0) >= 100 || !!s.finisherRank
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    desc: 'Top 3 Finisher or fast learning velocity',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    isUnlocked: (s) => (s.finisherRank !== undefined && s.finisherRank <= 3) || (s.totalXP ?? s.xp ?? 0) >= 2000
  },
  {
    id: 'streak_titan',
    name: 'Streak Titan',
    icon: '🔥',
    desc: 'Maintained 3+ days continuous study streak',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    isUnlocked: (s) => (s.streak ?? 0) >= 3
  },
  {
    id: 'rfc_scholar',
    name: 'RFC Scholar',
    icon: '📜',
    desc: 'Completed 15+ curriculum modules',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    isUnlocked: (s) => (s.modulesCompleted ?? (s.completedModules || []).length) >= 15
  },
  {
    id: 'centurion',
    name: 'XP Centurion',
    icon: '💎',
    desc: 'Earned 1,000+ Total XP',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    isUnlocked: (s) => (s.totalXP ?? s.xp ?? 0) >= 1000
  },
  {
    id: 'network_scout',
    name: 'Network Scout',
    icon: '🛡',
    desc: 'Completed first 5 foundational modules',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    isUnlocked: (s) => (s.modulesCompleted ?? (s.completedModules || []).length) >= 5
  }
];

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
  role?: string;
  resetEpoch?: string;
  isOnline?: boolean;
  lastLogin?: any;
  courseCompletedAt?: any;
  completedAt?: any;
  updatedAt?: any;
  finisherRank?: number; // 1 for 1st to complete, 2 for 2nd, etc.
}

interface LeaderboardViewProps {
  students?: LeaderboardStudent[];
}

// Helper to convert any timestamp format (Firestore Timestamp, ISO string, epoch millis) to milliseconds
export const getTimestampMs = (val: any): number => {
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

// Format completion timestamp nicely into readable date and time
export const formatCompletionDate = (val: any): string => {
  const ms = getTimestampMs(val);
  if (!ms) return 'Recently';
  const d = new Date(ms);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Today at ${timeStr}`;
  }
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  return `${dateStr}, ${timeStr}`;
};

// Check if student has finished the entire curriculum
export const checkStudentCourseCompleted = (s: { modulesCompleted?: number; completedModules?: string[]; overallProgress?: number }): boolean => {
  const mods = s.modulesCompleted ?? (s.completedModules || []).length;
  const prog = s.overallProgress ?? 0;
  return mods >= (TOTAL_MODULES_COUNT || 30) || prog >= 100;
};

// Get reliable course completion timestamp (explicit timestamp or updatedAt fallback when completed)
export const getStudentCompletionTimestamp = (s: FirestoreStudentEntry): number => {
  if (!checkStudentCourseCompleted(s)) return 0;
  const explicit = getTimestampMs(s.courseCompletedAt || s.completedAt);
  if (explicit > 0) return explicit;
  const fallback = getTimestampMs(s.updatedAt || s.lastLogin);
  if (fallback > 0) return fallback;
  return 0;
};

// Strict helper to identify and filter out developer accounts across all identifier representations
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

// Helper to scan all locally cached student profiles in localStorage
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
                name: data.name || data.displayName || `KLU Student (${sId})`,
                displayName: data.displayName || data.name || `KLU Student (${sId})`,
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

export const LeaderboardView: React.FC<LeaderboardViewProps> = () => {
  const { currentUser, userProfile } = useAuth();
  const [remoteStudents, setRemoteStudents] = useState<FirestoreStudentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Sorting: 'completion' (who completed first) vs 'xp' (total XP points)
  const [sortBy, setSortBy] = useState<'completion' | 'xp'>('completion');
  // Filter tabs: 'all' | 'completed' | 'in-progress'
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Merge official KLU student roster, Firestore cloud entries, local storage, and current user
  const getMergedStudents = useCallback((firestoreStudents: FirestoreStudentEntry[]): FirestoreStudentEntry[] => {
    const map = new Map<string, FirestoreStudentEntry>();

    // 1. Ingest official enrolled class roster as baseline (all 66 non-dev enrolled students)
    STUDENT_CREDENTIALS.forEach((cred) => {
      if (isDevAccount(cred.studentId, cred.email, cred.name, cred.role)) return;
      const key = cred.studentId.trim().toLowerCase();
      map.set(key, {
        uid: `klu_${cred.studentId}`,
        studentId: cred.studentId,
        name: cred.name,
        displayName: cred.name,
        email: cred.email,
        college: 'KLU',
        totalXP: 0,
        xp: 0,
        overallProgress: 0,
        modulesCompleted: 0,
        completedModules: [],
        role: 'student',
      });
    });

    // 2. Ingest cloud Firestore students and overlay live verified progress
    firestoreStudents.forEach((s) => {
      if (isDevAccount(s.studentId || s.uid, s.email, s.displayName || s.name, s.role)) return;
      const sId = (s.studentId || s.uid.replace(/^klu_/, '')).trim();
      const key = (sId || s.uid).toLowerCase();
      if (!key) return;
      const existing = map.get(key);
      const isCurrentEpoch = s.resetEpoch === GLOBAL_RESET_EPOCH;
      const sXP = isCurrentEpoch ? (s.totalXP ?? s.xp ?? 0) : 0;
      const sMods = isCurrentEpoch ? (s.modulesCompleted ?? (s.completedModules || []).length) : 0;
      const sProg = isCurrentEpoch ? (s.overallProgress ?? Math.min(100, Math.round((sMods / (TOTAL_MODULES_COUNT || 30)) * 100))) : 0;

      const isFinished = sMods >= (TOTAL_MODULES_COUNT || 30) || sProg >= 100;
      const sCompletedAt = s.courseCompletedAt || s.completedAt || (isFinished ? (s.updatedAt || s.lastLogin) : undefined);

      if (existing) {
        const existingCompletedAt = existing.courseCompletedAt || existing.completedAt;
        // Keep the earliest verified completion timestamp
        let bestCompletedAt = existingCompletedAt;
        if (sCompletedAt) {
          if (!bestCompletedAt) {
            bestCompletedAt = sCompletedAt;
          } else {
            const timeExisting = getTimestampMs(bestCompletedAt);
            const timeIncoming = getTimestampMs(sCompletedAt);
            if (timeIncoming > 0 && (timeExisting === 0 || timeIncoming < timeExisting)) {
              bestCompletedAt = sCompletedAt;
            }
          }
        }

        map.set(key, {
          ...existing,
          uid: s.uid || existing.uid,
          displayName: s.displayName || s.name || existing.displayName,
          name: s.name || s.displayName || existing.name,
          totalXP: Math.max(existing.totalXP || 0, sXP),
          xp: Math.max(existing.xp || 0, sXP),
          modulesCompleted: Math.max(existing.modulesCompleted || 0, sMods),
          overallProgress: Math.max(existing.overallProgress || 0, sProg),
          completedModules: Array.from(new Set([...(existing.completedModules || []), ...((isCurrentEpoch ? s.completedModules : []) || [])])),
          courseCompletedAt: bestCompletedAt,
          updatedAt: s.updatedAt || existing.updatedAt,
          isOnline: s.isOnline !== undefined ? s.isOnline : existing.isOnline,
          lastLogin: s.lastLogin || existing.lastLogin,
        });
      } else {
        map.set(key, {
          uid: s.uid,
          studentId: sId,
          name: s.name || s.displayName || `KLU Student (${sId})`,
          displayName: s.displayName || s.name || `KLU Student (${sId})`,
          email: s.email || `${sId}@klu.ac.in`,
          college: s.college || 'KLU',
          totalXP: sXP,
          xp: sXP,
          overallProgress: sProg,
          modulesCompleted: sMods,
          completedModules: isCurrentEpoch ? (s.completedModules || []) : [],
          courseCompletedAt: sCompletedAt,
          updatedAt: s.updatedAt,
          role: 'student',
          isOnline: !!s.isOnline,
          lastLogin: s.lastLogin,
        });
      }
    });

    // 3. Ingest & merge local student profiles
    const localList = scanLocalStudents();
    localList.forEach((local) => {
      if (isDevAccount(local.studentId || local.uid, local.email, local.displayName || local.name, local.role)) return;
      const sId = (local.studentId || local.uid.replace(/^klu_/, '')).trim();
      if (!sId) return;

      const key = sId.toLowerCase();
      const existing = map.get(key);
      const localXP = local.totalXP ?? local.xp ?? 0;
      const localMods = local.completedModules?.length || local.modulesCompleted || 0;
      const localProg = local.overallProgress ?? Math.min(100, Math.round((localMods / (TOTAL_MODULES_COUNT || 30)) * 100));
      const localCompletedAt = local.courseCompletedAt || local.completedAt || (localProg >= 100 ? local.updatedAt : undefined);

      if (existing) {
        const existingXP = existing.totalXP ?? existing.xp ?? 0;
        const existingMods = existing.completedModules?.length || existing.modulesCompleted || 0;
        const existingCompletedAt = existing.courseCompletedAt || existing.completedAt;

        let bestCompletedAt = existingCompletedAt;
        if (localCompletedAt) {
          if (!bestCompletedAt) {
            bestCompletedAt = localCompletedAt;
          } else {
            const timeExisting = getTimestampMs(bestCompletedAt);
            const timeIncoming = getTimestampMs(localCompletedAt);
            if (timeIncoming > 0 && (timeExisting === 0 || timeIncoming < timeExisting)) {
              bestCompletedAt = localCompletedAt;
            }
          }
        }

        map.set(key, {
          ...existing,
          totalXP: Math.max(existingXP, localXP),
          xp: Math.max(existingXP, localXP),
          modulesCompleted: Math.max(existingMods, localMods),
          overallProgress: Math.max(existing.overallProgress || 0, localProg),
          completedModules: Array.from(new Set([...(existing.completedModules || []), ...(local.completedModules || [])])),
          courseCompletedAt: bestCompletedAt,
          updatedAt: local.updatedAt || existing.updatedAt,
        });
      } else {
        map.set(key, local);
      }
    });

    // 4. Ingest active user profile if student
    if (currentUser && userProfile) {
      const sId = (userProfile.studentId || currentUser.uid.replace(/^klu_/, '')).trim();
      const isDev = isDevAccount(sId, userProfile.email, userProfile.displayName || userProfile.name, userProfile.role);
      
      if (!isDev) {
        const key = sId.toLowerCase();
        const currentXP = userProfile.totalXP ?? userProfile.xp ?? 0;
        const currentMods = (userProfile.completedModules || []).length;
        const currentProg = userProfile.overallProgress ?? Math.min(100, Math.round((currentMods / (TOTAL_MODULES_COUNT || 30)) * 100));
        const existing = map.get(key);
        const existingCompletedAt = existing?.courseCompletedAt || existing?.completedAt;
        const userCompletedAt = userProfile.courseCompletedAt || (currentProg >= 100 ? (userProfile.updatedAt || new Date().toISOString()) : undefined);

        let bestCompletedAt = existingCompletedAt;
        if (userCompletedAt) {
          if (!bestCompletedAt) {
            bestCompletedAt = userCompletedAt;
          } else {
            const timeExisting = getTimestampMs(bestCompletedAt);
            const timeIncoming = getTimestampMs(userCompletedAt);
            if (timeIncoming > 0 && (timeExisting === 0 || timeIncoming < timeExisting)) {
              bestCompletedAt = userCompletedAt;
            }
          }
        }

        const currentEntry: FirestoreStudentEntry = {
          uid: currentUser.uid,
          name: userProfile.name || userProfile.displayName || existing?.name || 'You',
          displayName: userProfile.displayName || userProfile.name || existing?.displayName || 'You',
          studentId: sId,
          email: userProfile.email || `${sId}@klu.ac.in`,
          college: userProfile.college || 'KLU',
          totalXP: Math.max(existing?.totalXP || 0, currentXP),
          xp: Math.max(existing?.xp || 0, currentXP),
          overallProgress: Math.max(existing?.overallProgress || 0, currentProg),
          modulesCompleted: Math.max(existing?.modulesCompleted || 0, currentMods),
          completedModules: Array.from(new Set([...(existing?.completedModules || []), ...(userProfile.completedModules || [])])),
          courseCompletedAt: bestCompletedAt,
          updatedAt: userProfile.updatedAt || existing?.updatedAt,
          role: 'student',
          isOnline: true,
        };
        map.set(key, currentEntry);
      }
    }

    // 5. Final filter: strictly exclude any developer accounts
    return Array.from(map.values()).filter((s) => {
      return !isDevAccount(s.studentId || s.uid, s.email, s.displayName || s.name, s.role);
    });
  }, [currentUser, userProfile]);

  // Real-time Firestore sync listener across all students (clean, read-only subscription)
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    try {
      const studentsRef = collection(db, 'students');
      unsubscribe = onSnapshot(
        studentsRef,
        (snapshot) => {
          const cloudData: FirestoreStudentEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const isCurrentEpoch = data.resetEpoch === GLOBAL_RESET_EPOCH;
            const completedList = isCurrentEpoch ? (data.completedModules || []) : [];
            const calculatedXP = isCurrentEpoch ? (data.totalXP ?? data.xp ?? 0) : 0;
            const calculatedProgress = isCurrentEpoch ? (data.overallProgress ?? Math.min(100, Math.round((completedList.length / (TOTAL_MODULES_COUNT || 30)) * 100))) : 0;

            cloudData.push({
              uid: docSnap.id,
              ...data,
              resetEpoch: data.resetEpoch,
              totalXP: calculatedXP,
              xp: calculatedXP,
              overallProgress: calculatedProgress,
              modulesCompleted: isCurrentEpoch ? (data.modulesCompleted ?? completedList.length) : 0,
              courseCompletedAt: data.courseCompletedAt || data.completedAt,
              updatedAt: data.updatedAt,
              isOnline: !!data.isOnline,
              lastLogin: data.lastLogin,
            });
          });
          setRemoteStudents(cloudData);
          setLastSyncTime(new Date());
          setLoading(false);
        },
        (err) => {
          console.warn("Real-time leaderboard snapshot fallback to local:", err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn("Failed to attach leaderboard listener:", err);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen to cross-tab storage changes and custom XP updates
  useEffect(() => {
    const handleUpdate = () => {
      setLastSyncTime(new Date());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('netquest_profile_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('netquest_profile_updated', handleUpdate);
    };
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastSyncTime(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Compute all students with official Course Completion chronological ranks & sortings
  const { allStudentsWithFinishers, completedCourseFinishers } = useMemo(() => {
    const rawList = getMergedStudents(remoteStudents);

    // 1. Separate students into completed vs in-progress
    const completedList: FirestoreStudentEntry[] = [];
    const inProgressList: FirestoreStudentEntry[] = [];

    rawList.forEach((s) => {
      if (checkStudentCourseCompleted(s)) {
        completedList.push(s);
      } else {
        inProgressList.push(s);
      }
    });

    // 2. Sort completed students by who finished the course FIRST (earliest completion timestamp)
    completedList.sort((a, b) => {
      const timeA = getStudentCompletionTimestamp(a);
      const timeB = getStudentCompletionTimestamp(b);

      if (timeA > 0 && timeB > 0 && timeA !== timeB) {
        return timeA - timeB; // Earliest timestamp finished first!
      }
      if (timeA > 0 && (!timeB || timeB === 0)) return -1;
      if (timeB > 0 && (!timeA || timeA === 0)) return 1;

      // Tie breaker 1: Total XP
      const xpA = a.totalXP ?? a.xp ?? 0;
      const xpB = b.totalXP ?? b.xp ?? 0;
      if (xpB !== xpA) return xpB - xpA;

      // Tie breaker 2: Name
      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });

    // 3. Assign official finisher rank to completed students (1 = 1st to complete, 2 = 2nd to complete...)
    const completedWithFinisherRank: FirestoreStudentEntry[] = completedList.map((s, idx) => ({
      ...s,
      finisherRank: idx + 1,
    }));

    // 4. Sort in-progress students by progress % -> modules count -> XP -> name
    inProgressList.sort((a, b) => {
      const progA = a.overallProgress ?? 0;
      const progB = b.overallProgress ?? 0;
      if (progB !== progA) return progB - progA;

      const modsA = a.modulesCompleted ?? (a.completedModules || []).length;
      const modsB = b.modulesCompleted ?? (b.completedModules || []).length;
      if (modsB !== modsA) return modsB - modsA;

      const xpA = a.totalXP ?? a.xp ?? 0;
      const xpB = b.totalXP ?? b.xp ?? 0;
      if (xpB !== xpA) return xpB - xpA;

      return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
    });

    // Combine for overall reference
    const combined = [...completedWithFinisherRank, ...inProgressList];

    return {
      allStudentsWithFinishers: combined,
      completedCourseFinishers: completedWithFinisherRank,
    };
  }, [getMergedStudents, remoteStudents, lastSyncTime]);

  // Ranked students based on selected Sort Mode ('completion' vs 'xp')
  const rankedStudents = useMemo(() => {
    if (sortBy === 'completion') {
      // Primary requirement: Show all members, prioritizing who completed the course FIRST
      return allStudentsWithFinishers;
    } else {
      // Sort strictly by XP, but preserving finisherRank metadata
      return [...allStudentsWithFinishers].sort((a, b) => {
        const xpA = a.totalXP ?? a.xp ?? 0;
        const xpB = b.totalXP ?? b.xp ?? 0;
        if (xpB !== xpA) return xpB - xpA;

        const progA = a.overallProgress ?? 0;
        const progB = b.overallProgress ?? 0;
        if (progB !== progA) return progB - progA;

        return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
      });
    }
  }, [allStudentsWithFinishers, sortBy]);

  // Calculate current user's rank and completion details
  const currentUserIndex = rankedStudents.findIndex(
    (s) => currentUser && (s.uid === currentUser.uid || (userProfile?.studentId && s.studentId === userProfile.studentId))
  );
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
  const currentStudentEntry = currentUserIndex >= 0 ? rankedStudents[currentUserIndex] : null;
  const currentUserFinisherRank = currentStudentEntry?.finisherRank;

  // Filter students based on filter tab and search query
  const filteredStudents = useMemo(() => {
    let list = rankedStudents;

    // Apply Filter Tab
    if (filterTab === 'completed') {
      list = list.filter(checkStudentCourseCompleted);
    } else if (filterTab === 'in-progress') {
      list = list.filter((s) => !checkStudentCourseCompleted(s));
    }

    // Apply Search Query
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((s) => {
      const name = (s.displayName || s.name || '').toLowerCase();
      const studentId = (s.studentId || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(q) || studentId.includes(q) || email.includes(q);
    });
  }, [rankedStudents, filterTab, searchQuery]);

  // User requirement: "In leaderboard show only top 15 not all students and for each login have to show their position in the leaderboard in total students"
  const displayedStudents = useMemo(() => {
    if (searchQuery.trim()) return filteredStudents;
    return filteredStudents.slice(0, 15);
  }, [filteredStudents, searchQuery]);

  // User unlocked badges computation
  const userUnlockedBadges = useMemo(() => {
    if (!userProfile) return [];
    return LEADERBOARD_BADGES.filter(b => b.isUnlocked({
      totalXP: userProfile.totalXP || userProfile.xp || 0,
      modulesCompleted: userProfile.modulesCompleted || (userProfile.completedModules || []).length,
      streak: userProfile.streak || 0,
      overallProgress: userProfile.overallProgress || 0,
      finisherRank: currentUserFinisherRank
    }));
  }, [userProfile, currentUserFinisherRank]);

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-200">

      {/* Network League & Course Completion Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1F2937] border-2 border-[#E5E0D8] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-[#3157D5] dark:text-[#6D8CFF] uppercase tracking-widest mb-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>ACADEMIC LEADERBOARD • WHO COMPLETED FIRST</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME SYNC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-[#F9FAFB] tracking-tight">
            COURSE COMPLETION & STANDINGS
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
            Real-time rankings tracking who completed all 30 Computer Networks modules first.
          </p>
        </div>

        {/* Status Metrics & Manual Refresh Button */}
        <div className="flex items-center space-x-3 self-start sm:self-center shrink-0 flex-wrap gap-y-2">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black font-mono border border-amber-500/30 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {completedCourseFinishers.length > 0 
                ? `${completedCourseFinishers.length} Finished Course`
                : 'Race to Finish In Progress'}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-[#F7F5F0] dark:bg-slate-800 hover:bg-[#EFECE6] text-[#172033] dark:text-slate-300 text-xs font-bold border border-[#E5E0D8] dark:border-slate-700 transition-colors cursor-pointer"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏆 COURSE COMPLETION HALL OF FAME — FIRST TO FINISH PODIUM               */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-transparent border-2 border-amber-400/30 dark:border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>HALL OF FAME: FIRST TO COMPLETE</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                  30 / 30 MODULES
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pioneering students who completed the entire course curriculum first.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-400">
            {completedCourseFinishers.length} of {rankedStudents.length} Students Completed
          </div>
        </div>

        {completedCourseFinishers.length === 0 ? (
          <div className="bg-white/80 dark:bg-[#151A24]/90 border border-amber-300/60 dark:border-amber-500/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Flag className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              The Race to #1 Course Finisher is Live!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
              No student has crossed the finish line of all {TOTAL_MODULES_COUNT || 30} modules yet. Complete all lessons to be permanently enshrined as the <strong>#1 First to Complete</strong>!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* 🥇 1st to Complete */}
            {completedCourseFinishers[0] ? (
              <div className="bg-white dark:bg-[#151A24] border-2 border-amber-400 dark:border-amber-500/50 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 font-black font-mono text-[10px] px-3 py-1 rounded-bl-xl shadow-xs uppercase tracking-wider flex items-center gap-1">
                  🥇 1ST TO COMPLETE
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                      1
                    </div>
                    <div className="min-w-0 pr-14">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={completedCourseFinishers[0].displayName || completedCourseFinishers[0].name}>
                        {completedCourseFinishers[0].displayName || completedCourseFinishers[0].name}
                      </h4>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                        {completedCourseFinishers[0].studentId || 'KLU Student'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{formatCompletionDate(completedCourseFinishers[0].courseCompletedAt || completedCourseFinishers[0].completedAt || completedCourseFinishers[0].updatedAt)}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                    {completedCourseFinishers[0].totalXP ?? completedCourseFinishers[0].xp ?? 0} XP
                  </span>
                </div>
              </div>
            ) : null}

            {/* 🥈 2nd to Complete */}
            {completedCourseFinishers[1] ? (
              <div className="bg-white dark:bg-[#151A24] border-2 border-slate-300 dark:border-slate-600 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-slate-300 to-slate-400 text-slate-900 font-black font-mono text-[10px] px-3 py-1 rounded-bl-xl shadow-xs uppercase tracking-wider flex items-center gap-1">
                  🥈 2ND TO COMPLETE
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-lg shadow-sm">
                      2
                    </div>
                    <div className="min-w-0 pr-14">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={completedCourseFinishers[1].displayName || completedCourseFinishers[1].name}>
                        {completedCourseFinishers[1].displayName || completedCourseFinishers[1].name}
                      </h4>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                        {completedCourseFinishers[1].studentId || 'KLU Student'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatCompletionDate(completedCourseFinishers[1].courseCompletedAt || completedCourseFinishers[1].completedAt || completedCourseFinishers[1].updatedAt)}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                    {completedCourseFinishers[1].totalXP ?? completedCourseFinishers[1].xp ?? 0} XP
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-[#151A24]/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold mb-2">
                  2
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">2nd Finisher Slot Open</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Finish all 30 modules to claim 🥈</div>
              </div>
            )}

            {/* 🥉 3rd to Complete */}
            {completedCourseFinishers[2] ? (
              <div className="bg-white dark:bg-[#151A24] border-2 border-amber-700/40 dark:border-amber-600/40 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-600 to-amber-700 text-white font-black font-mono text-[10px] px-3 py-1 rounded-bl-xl shadow-xs uppercase tracking-wider flex items-center gap-1">
                  🥉 3RD TO COMPLETE
                </div>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-lg shadow-sm">
                      3
                    </div>
                    <div className="min-w-0 pr-14">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={completedCourseFinishers[2].displayName || completedCourseFinishers[2].name}>
                        {completedCourseFinishers[2].displayName || completedCourseFinishers[2].name}
                      </h4>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                        {completedCourseFinishers[2].studentId || 'KLU Student'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{formatCompletionDate(completedCourseFinishers[2].courseCompletedAt || completedCourseFinishers[2].completedAt || completedCourseFinishers[2].updatedAt)}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                    {completedCourseFinishers[2].totalXP ?? completedCourseFinishers[2].xp ?? 0} XP
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-[#151A24]/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold mb-2">
                  3
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">3rd Finisher Slot Open</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Finish all 30 modules to claim 🥉</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🎖 YOUR OFFICIAL POSITION IN THE COHORT & EARNED BADGES                   */}
      {/* ========================================================================= */}
      {currentUser && userProfile && (
        <div className={`border-2 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden ${
          currentUserFinisherRank || (userProfile.completedModules || []).length >= (TOTAL_MODULES_COUNT || 30)
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/40'
        }`}>
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Rank Badge & Profile Details */}
            <div className="flex items-start sm:items-center space-x-4">
              <div className="relative shrink-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg ${
                  currentUserFinisherRank
                    ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-indigo-500/20'
                }`}>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Rank</span>
                  <span className="text-lg sm:text-xl font-mono leading-none">
                    {currentUserRank ? `#${currentUserRank}` : '—'}
                  </span>
                </div>
                {currentUserFinisherRank && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md text-xs">
                    👑
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                    YOUR POSITION IN COHORT
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono">
                    #{currentUserRank || '—'} of {rankedStudents.length} Students
                  </span>
                  {currentUserRank && rankedStudents.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                      Top {Math.max(1, Math.round((currentUserRank / rankedStudents.length) * 100))}%
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>{userProfile.displayName || userProfile.name || 'You'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-extrabold uppercase">
                    ACTIVE
                  </span>
                </h3>

                <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1 flex-wrap">
                  <span>Roll No: <span className="font-mono text-slate-200 font-semibold">{userProfile.studentId || '—'}</span></span>
                  <span>•</span>
                  <span>KLU CS-4200 Computer Networks</span>
                  {currentUserFinisherRank && currentStudentEntry?.courseCompletedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Completed: {formatCompletionDate(currentStudentEntry.courseCompletedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Metrics + Certificate Trigger Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center shrink-0">
                <div className="px-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total XP</div>
                  <div className="text-sm sm:text-base font-extrabold text-blue-400 font-mono">
                    {(userProfile.totalXP || userProfile.xp || 0).toLocaleString()}
                  </div>
                </div>
                <div className="px-2 border-x border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Progress</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                    {userProfile.overallProgress || 0}%
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Modules</div>
                  <div className="text-sm sm:text-base font-extrabold text-white font-mono">
                    {(userProfile.completedModules || []).length}/{TOTAL_MODULES_COUNT || 30}
                  </div>
                </div>
              </div>

              {/* Certificate Trigger Button */}
              <button
                onClick={() => setIsCertModalOpen(true)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  currentUserFinisherRank || (userProfile.completedModules || []).length >= (TOTAL_MODULES_COUNT || 30) || (userProfile.overallProgress || 0) >= 100
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black shadow-emerald-500/20 hover:scale-102 active:scale-98'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>
                  {currentUserFinisherRank || (userProfile.completedModules || []).length >= (TOTAL_MODULES_COUNT || 30)
                    ? 'View Completion Certificate'
                    : 'Certificate Preview'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User's Badges Showcase */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Earned Badges ({userUnlockedBadges.length}/{LEADERBOARD_BADGES.length}):</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {LEADERBOARD_BADGES.map((badge) => {
                const unlocked = userUnlockedBadges.some(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.desc} (${unlocked ? 'Unlocked' : 'Locked'})`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                      unlocked
                        ? `${badge.badgeClass} shadow-sm`
                        : 'bg-slate-950/40 text-slate-600 border-slate-800/60 opacity-50 grayscale'
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Filter, Search, and Roster Table */}
      <div className="bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#252B36] rounded-2xl overflow-hidden shadow-xs">

        {/* Sorting Mode & Filter Tabs Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#252B36] bg-slate-50 dark:bg-[#141822] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-white dark:bg-[#0B0D12] border border-slate-200 dark:border-[#252B36] rounded-xl self-start">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Members ({rankedStudents.length})
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterTab === 'completed'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>Course Finishers ({completedCourseFinishers.length})</span>
              </button>
              <button
                onClick={() => setFilterTab('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterTab === 'in-progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In Progress ({rankedStudents.length - completedCourseFinishers.length})
              </button>
            </div>

            {/* Sort Toggle: "First to Complete" vs "Total XP" */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Order by:</span>
              <div className="inline-flex rounded-xl border border-slate-200 dark:border-[#252B36] p-0.5 bg-white dark:bg-[#0B0D12]">
                <button
                  onClick={() => setSortBy('completion')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    sortBy === 'completion'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Rank all members prioritizing who completed the course first"
                >
                  <Trophy className="w-3 h-3" />
                  <span>First to Complete</span>
                </button>
                <button
                  onClick={() => setSortBy('xp')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    sortBy === 'xp'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Rank all members by Total XP"
                >
                  <Zap className="w-3 h-3" />
                  <span>Total XP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or roll number..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0B0D12] border border-slate-200 dark:border-[#252B36] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-[#94A3B8] flex items-center space-x-2 flex-wrap">
              <span>Showing:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {searchQuery ? `${displayedStudents.length} Matching Students` : `Top ${displayedStudents.length} of ${rankedStudents.length} Enrolled Students`}
              </span>
              {!searchQuery && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                  Top 15 Display
                </span>
              )}
              {sortBy === 'completion' && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  • Ranked by Course Completion Order
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Synchronizing real-time cohort standings...</p>
          </div>
        ) : displayedStudents.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              {searchQuery ? 'NO MATCHING STUDENTS FOUND' : 'NO STUDENT RANKINGS'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto mt-2">
              {searchQuery
                ? `No student matching "${searchQuery}". Try searching by roll number or name.`
                : 'No student records available for this filter.'}
            </p>
          </div>
        ) : (
          <>
            {/* 1. MOBILE RESPONSIVE CARD LIST (Visible on small screens < md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-[#1C2230]">
              {displayedStudents.map((student, idx) => {
                const rank = idx + 1;
                const isCurrent = currentUser && (student.uid === currentUser.uid || (userProfile?.studentId && student.studentId === userProfile.studentId));
                const studentDisplayName = student.displayName || student.name || `KLU Student (${student.studentId || idx + 1})`;
                const currentXP = student.totalXP ?? student.xp ?? 0;
                const currentMods = student.modulesCompleted ?? (student.completedModules || []).length;
                const currentProgress = student.overallProgress ?? Math.min(100, Math.round((currentMods / (TOTAL_MODULES_COUNT || 30)) * 100));
                const isCompleted = checkStudentCourseCompleted(student);
                const completionTimestamp = getStudentCompletionTimestamp(student);
                const studentBadges = LEADERBOARD_BADGES.filter(b => b.isUnlocked(student));

                return (
                  <div
                    key={student.uid || student.studentId || idx}
                    className={`p-3.5 transition-colors ${
                      isCurrent
                        ? 'bg-blue-50/90 dark:bg-[#5B7CFF]/15 border-l-4 border-l-blue-600'
                        : isCompleted
                        ? 'bg-amber-50/40 dark:bg-amber-500/5'
                        : 'hover:bg-slate-50/80 dark:hover:bg-[#171B24]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Left: Rank & Avatar & Name */}
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-7 h-7 shrink-0 flex items-center justify-center font-bold text-xs">
                          {rank === 1 ? (
                            <span className="text-base" title="Rank 1">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-base" title="Rank 2">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-base" title="Rank 3">🥉</span>
                          ) : (
                            <span className="font-mono text-slate-500 dark:text-slate-400 font-bold text-xs">
                              #{rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar Initial with Live Presence Indicator */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                              isCurrent
                                ? 'bg-blue-600 text-white'
                                : isCompleted
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-600/50'
                                : 'bg-slate-100 dark:bg-[#1E2433] text-slate-700 dark:text-[#94A3B8] border border-slate-200 dark:border-[#252B36]'
                            }`}
                          >
                            {studentDisplayName.charAt(0).toUpperCase()}
                          </div>
                          {student.isOnline && (
                            <span 
                              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#11141B] rounded-full shadow-xs" 
                              title="Online Now" 
                            />
                          )}
                        </div>

                        {/* Name & Roll Number */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className={`text-xs truncate ${isCurrent ? 'font-bold text-blue-700 dark:text-blue-300' : 'font-semibold text-slate-900 dark:text-white'}`}>
                              {studentDisplayName}
                            </span>
                            {isCurrent && (
                              <span className="px-1 py-0.2 rounded bg-blue-600 text-white text-[8px] font-extrabold uppercase shrink-0">
                                YOU
                              </span>
                            )}
                            {student.isOnline && (
                              <span className="px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold uppercase shrink-0 flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {student.studentId && (
                              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                                {student.studentId}
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30 flex items-center gap-1">
                                <CheckCheck className="w-2.5 h-2.5 text-emerald-600" />
                                {student.finisherRank ? `Finisher #${student.finisherRank}` : 'Completed'}
                              </span>
                            )}
                            {studentBadges.length > 0 && (
                              <div className="flex items-center gap-1">
                                {studentBadges.slice(0, 3).map(b => (
                                  <span key={b.id} title={`${b.name}: ${b.desc}`} className="text-xs">
                                    {b.icon}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: XP Score */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-extrabold text-blue-600 dark:text-[#5B7CFF]">
                          {currentXP} <span className="text-[9px] text-slate-500 dark:text-[#94A3B8]">XP</span>
                        </div>
                        {isCompleted && completionTimestamp > 0 && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>{formatCompletionDate(completionTimestamp)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar Row */}
                    <div className="mt-2.5 flex items-center gap-2 pl-9">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[#0B0D12] rounded-full overflow-hidden border border-slate-200/80 dark:border-[#252B36]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                              : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, currentProgress))}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {currentMods}/{TOTAL_MODULES_COUNT || 30} ({currentProgress}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP / TABLET FULL ACADEMIC TABLE (Visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-[#0E1118] border-b border-slate-200 dark:border-[#252B36] text-slate-500 dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Student & Roll No.</th>
                    <th className="py-3.5 px-4 text-center">Badges</th>
                    <th className="py-3.5 px-4 text-center">Course Status & Finish Order</th>
                    <th className="py-3.5 px-4 text-right">XP</th>
                    <th className="py-3.5 px-4 text-center w-44">Syllabus Progress</th>
                    <th className="py-3.5 px-4 text-center">Modules Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#252B36]">
                  {displayedStudents.map((student, idx) => {
                    const rank = idx + 1;
                    const isCurrent = currentUser && (student.uid === currentUser.uid || (userProfile?.studentId && student.studentId === userProfile.studentId));
                    const studentDisplayName = student.displayName || student.name || `KLU Student (${student.studentId || idx + 1})`;
                    const currentXP = student.totalXP ?? student.xp ?? 0;
                    const currentMods = student.modulesCompleted ?? (student.completedModules || []).length;
                    const currentProgress = student.overallProgress ?? Math.min(100, Math.round((currentMods / (TOTAL_MODULES_COUNT || 30)) * 100));
                    const isCompleted = checkStudentCourseCompleted(student);
                    const completionTimestamp = getStudentCompletionTimestamp(student);
                    const studentBadges = LEADERBOARD_BADGES.filter(b => b.isUnlocked(student));

                    return (
                      <tr
                        key={student.uid || student.studentId || idx}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-blue-50/80 dark:bg-[#5B7CFF]/15 hover:bg-blue-100/60 dark:hover:bg-[#5B7CFF]/20 border-l-4 border-l-blue-600'
                            : isCompleted
                            ? 'bg-amber-50/30 dark:bg-amber-500/5 hover:bg-amber-100/30 dark:hover:bg-amber-500/10'
                            : 'hover:bg-slate-50/80 dark:hover:bg-[#171B24]'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center">
                          {rank === 1 ? (
                            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 flex items-center justify-center mx-auto font-bold text-xs shadow-xs">
                              🥇
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-400/20 dark:text-slate-300 dark:border-slate-400/40 flex items-center justify-center mx-auto font-bold text-xs shadow-xs">
                              🥈
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 border border-amber-400 dark:bg-amber-700/20 dark:text-amber-600 dark:border-amber-700/40 flex items-center justify-center mx-auto font-bold text-xs shadow-xs">
                              🥉
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                              #{rank}
                            </span>
                          )}
                        </td>

                        {/* Display Name & Roll Number */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative shrink-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : isCompleted
                                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-600/50'
                                  : 'bg-slate-100 dark:bg-[#1E2433] text-slate-700 dark:text-[#94A3B8] border border-slate-200 dark:border-[#252B36]'
                              }`}>
                                {studentDisplayName.charAt(0).toUpperCase()}
                              </div>
                              {student.isOnline && (
                                <span 
                                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#11141B] rounded-full shadow-xs" 
                                  title="Online Now" 
                                />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${isCurrent ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {studentDisplayName}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                                    YOU
                                  </span>
                                )}
                                {student.isOnline && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    ONLINE
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] flex items-center space-x-2 mt-0.5">
                                {student.studentId && (
                                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                                    {student.studentId}
                                  </span>
                                )}
                                {student.studentId && <span>•</span>}
                                <span>KLU • CS-4200</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Badges Column */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {studentBadges.slice(0, 4).map(b => (
                              <span 
                                key={b.id} 
                                title={`${b.name}: ${b.desc}`} 
                                className="text-base cursor-help hover:scale-125 transition-transform"
                              >
                                {b.icon}
                              </span>
                            ))}
                            {studentBadges.length === 0 && (
                              <span className="text-[10px] text-slate-500 font-mono">—</span>
                            )}
                          </div>
                        </td>

                        {/* Course Status & Finish Order */}
                        <td className="py-4 px-4 text-center">
                          {isCompleted ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono shadow-2xs">
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                                <span>{student.finisherRank ? `Finisher #${student.finisherRank}` : 'Completed Course'}</span>
                              </span>
                              {completionTimestamp > 0 && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-sans">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>{formatCompletionDate(completionTimestamp)}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                              <span>In Progress ({Math.max(0, (TOTAL_MODULES_COUNT || 30) - currentMods)} left)</span>
                            </span>
                          )}
                        </td>

                        {/* Total XP */}
                        <td className="py-4 px-4 text-right font-mono font-bold text-blue-600 dark:text-[#5B7CFF] text-sm">
                          {currentXP} <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">XP</span>
                        </td>

                        {/* Progress */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 max-w-[140px] mx-auto">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-500 dark:text-[#94A3B8]">Syllabus</span>
                              <span className="text-slate-900 dark:text-white font-semibold">{currentProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#0B0D12] rounded-full overflow-hidden border border-slate-200 dark:border-[#252B36]">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                    : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, currentProgress))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Modules Completed */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-800 dark:text-[#F8FAFC]">
                          <span className={`font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {currentMods}
                          </span>
                          <span className="text-slate-500 dark:text-[#94A3B8]"> / {TOTAL_MODULES_COUNT || 30}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {/* Official Certificate Modal */}
      {currentUser && userProfile && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          studentName={userProfile.displayName || userProfile.name || 'KLU Student'}
          studentId={userProfile.studentId || ''}
          college={userProfile.college || 'Kalasalingam Academy of Research and Education (KARE)'}
          completedDate={currentStudentEntry?.courseCompletedAt || userProfile.courseCompletedAt}
          totalXP={userProfile.totalXP || userProfile.xp || 0}
        />
      )}

    </div>
  );
};
