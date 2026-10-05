import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  deleteUser,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  collection, 
  updateDoc, 
  arrayUnion, 
  increment, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AlertTriangle, X } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';
import { isAuthorizedDeveloper, getDeveloperProfile, verifyDeveloperPassword } from '../config/developers';
import { findStudentCredential, verifyStudentCredential } from '../data/studentCredentials';
import { ALL_MODULES } from '../data/courseContent';

// KLU / KIID email validation regex strictly mandated by requirements (accepts @klu.ac.in, @kluniversity.in, and KIID domains)
export const KLU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)?(klu\.ac\.in|kluniversity\.in|kiid\.[a-z.]+|kiid\.ac\.in|kiid\.edu\.in|kiid\.in)$/i;

export const extractStudentId = (email: string): string => {
  const match = email.trim().match(/^([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.)?(klu\.ac\.in|kluniversity\.in|kiid\.[a-z.]+|kiid\.ac\.in|kiid\.edu\.in|kiid\.in)$/i);
  return match ? match[1] : email.split('@')[0];
};

export interface UserProfileData {
  uid: string;
  name: string;
  displayName: string;
  email: string;
  studentId: string;
  username?: string;
  department?: string;
  profileCompleted?: boolean;
  portalPassword?: string;
  college: string;
  course: string;
  year?: string;
  section?: string;
  role: 'student' | 'teacher' | 'developer';
  bio?: string;
  phoneNumber?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt?: string;
  lastLogin?: string;
  totalXP: number;
  xp: number;
  overallProgress: number; // (completedModules / 45) * 100
  unit3Progress: number; // (completed Unit 3 modules / 20) * 100
  unit4Progress: number; // (completed Unit 4 modules / 17) * 100
  unit5Progress: number; // (completed Unit 5 modules / 8) * 100
  lessonsCompleted: number;
  modulesCompleted: number;
  completedUnits: number;
  quizAttempts: number;
  quizAverage: number;
  practiceScores?: Record<string, number>;
  streak: number;
  lastActiveDate?: string;
  activityDates?: string[];
  currentUnit: number; // 3
  currentModule: string; // 'module-3-1'
  lastLesson: string | null;
  completedModules: string[];
  completedSteps?: string[];
  unlockedUnits: string[];
  courseCompletedAt?: string;
  resetEpoch?: string;
  updatedAt?: string;
}

export const computeUpdatedStreak = (
  prevStreak: number = 0,
  prevLastActiveDate?: string,
  prevActivityDates: string[] = []
): { streak: number; lastActiveDate: string; activityDates: string[] } => {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const newActivityDates = Array.from(new Set([...prevActivityDates, today])).sort();

  if (!prevLastActiveDate) {
    return { streak: Math.max(1, prevStreak || 1), lastActiveDate: today, activityDates: newActivityDates };
  }

  if (prevLastActiveDate === today) {
    return { streak: Math.max(1, prevStreak || 1), lastActiveDate: today, activityDates: newActivityDates };
  }

  // Calculate day difference
  const prevDate = new Date(prevLastActiveDate + 'T00:00:00Z');
  const currDate = new Date(today + 'T00:00:00Z');
  const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streak: (prevStreak || 0) + 1, lastActiveDate: today, activityDates: newActivityDates };
  } else if (diffDays > 1) {
    return { streak: 1, lastActiveDate: today, activityDates: newActivityDates };
  }

  return { streak: Math.max(1, prevStreak || 1), lastActiveDate: today, activityDates: newActivityDates };
};

export const GLOBAL_RESET_EPOCH = '2026_09_RESET_SCRATCH_V1';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; profile: UserProfileData | null }>;
  loginWithStudentId: (studentIdOrEmail: string, password?: string, name?: string) => Promise<void>;
  resetStudentPassword: (studentIdOrEmail: string, newPassword: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateStudentProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  updateKLUProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  awardStepXP: (stepKey: string, xpAmount: number) => Promise<{ success: boolean; duplicate: boolean }>;
  recordModuleCompletion: (moduleId: string, unitId: 'unit-3' | 'unit-4' | 'unit-5' | string, xp?: number) => Promise<{ success: boolean; duplicate: boolean }>;
  recordQuizAttempt: (unitId: string, scorePercent: number, passed: boolean, xp?: number) => Promise<void>;
  recordPracticeAttempt: (categoryId: string, scorePercent: number, xp?: number) => Promise<void>;
  loginWithDeveloperId: (developerId: string, password?: string) => Promise<void>;
  resetStudentCourse: (studentUidOrId: string, options?: { resetXP?: boolean }) => Promise<{ success: boolean; message: string }>;
  pendingRegistration: { uid: string; email: string; name: string; photoURL?: string } | null;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  completeStudentRegistration: (params: {
    username: string;
    password: string;
    name: string;
    studentId: string;
    department: string;
    year: string;
  }) => Promise<UserProfileData>;
  cancelRegistration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial zero-state builder strictly matching requirements (Level 1, 0 XP, 0 modules, start from scratch)
const createZeroStudentState = (
  uid: string, 
  email: string, 
  name: string, 
  role: 'student' | 'teacher' | 'developer' = 'student'
): UserProfileData => {
  const studentId = extractStudentId(email);
  const studentName = name.trim() || studentId || 'Student';
  const now = new Date().toISOString();

  return {
    uid,
    name: studentName,
    displayName: studentName,
    email: email.trim(),
    studentId,
    college: 'KLU',
    course: 'Computer Networks',
    year: '3rd Year',
    section: 'CSE-A',
    role,
    totalXP: 0,
    xp: 0,
    overallProgress: 0,
    unit3Progress: 0,
    unit4Progress: 0,
    unit5Progress: 0,
    lessonsCompleted: 0,
    modulesCompleted: 0,
    completedUnits: 0,
    quizAttempts: 0,
    quizAverage: 0,
    practiceScores: {},
    streak: 0,
    currentUnit: 3,
    currentModule: 'u3_m1',
    lastLesson: null,
    completedModules: [],
    completedSteps: [],
    unlockedUnits: ['unit_3', 'unit-3'],
    resetEpoch: GLOBAL_RESET_EPOCH,
    createdAt: now,
    lastLogin: now,
    updatedAt: now,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDomainError, setShowDomainError] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
  } | null>(null);
  const userDocUnsubRef = useRef<(() => void) | null>(null);
  const clearAuthError = () => setAuthError(null);

  // Helper with race timeout to ensure Firestore calls never hang the UI indefinitely
  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  };

  // Helper to reliably locate an existing student user profile across Firestore & cache
  const findExistingUserProfile = async (
    uid: string, 
    email: string
  ): Promise<{ docId: string; data: UserProfileData } | null> => {
    const cleanEmail = email.toLowerCase().trim();
    const studentId = extractStudentId(cleanEmail);

    // 0. Direct match on users collection using the authenticated Google UID
    try {
      const uSnap = await withTimeout(getDoc(doc(db, 'users', uid)), 2000, null as any);
      if (uSnap && uSnap.exists && uSnap.exists()) {
        const uData = uSnap.data() as any;
        const sSnap = await withTimeout(getDoc(doc(db, 'students', uid)), 2000, null as any);
        const sData = sSnap && sSnap.exists && sSnap.exists() ? (sSnap.data() as any) : {};
        const profileData = {
          ...createZeroStudentState(uid, email, uData.name || 'Student', 'student'),
          ...sData,
          ...uData,
          uid,
          email: uData.email || email,
          username: uData.username,
          profileCompleted: true,
        };
        return { docId: uid, data: profileData };
      }
    } catch (e) {
      console.warn('[Auth] Direct users collection lookup error:', e);
    }

    // 1. Direct match on students collection using the authenticated Google UID
    try {
      const snap = await withTimeout(getDoc(doc(db, 'students', uid)), 2000, null as any);
      if (snap && snap.exists && snap.exists()) {
        const d = snap.data() as any;
        const hasCompleted = d && (
          d.profileCompleted === true ||
          (typeof d.username === 'string' && d.username.trim().length > 0) ||
          (typeof d.portalPassword === 'string' && d.portalPassword.length > 0) ||
          (d.totalXP || 0) > 0 ||
          (d.completedModules && d.completedModules.length > 0)
        );
        if (hasCompleted) {
          return { docId: uid, data: d };
        }
      }
    } catch (e) {
      console.warn('[Auth] Direct UID lookup handled error:', e);
    }

    // 2. Match on candidate student docs (klu_${studentId} and ${studentId})
    const candidateDocIds = [`klu_${studentId}`, studentId];
    for (const cId of candidateDocIds) {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'students', cId)), 1500, null as any);
        if (snap && snap.exists && snap.exists()) {
          const d = snap.data() as any;
          const hasCompleted = d && (
            d.profileCompleted === true ||
            (typeof d.username === 'string' && d.username.trim().length > 0) ||
            (typeof d.portalPassword === 'string' && d.portalPassword.length > 0) ||
            (d.totalXP || 0) > 0 ||
            (d.completedModules && d.completedModules.length > 0)
          );
          if (hasCompleted) {
            return { docId: cId, data: d };
          }
        }
      } catch (e) {
        console.warn(`[Auth] Candidate ID (${cId}) lookup handled error:`, e);
      }
    }

    // 3. Match from usernames collection by email
    try {
      const qUsernames = query(collection(db, 'usernames'), where('email', '==', cleanEmail), limit(1));
      const uSnap = await withTimeout(getDocs(qUsernames), 2000, null as any);
      if (uSnap && !uSnap.empty) {
        const uDoc = uSnap.docs[0].data();
        const targetUid = uDoc.uid || uid;
        const sSnap = await withTimeout(getDoc(doc(db, 'students', targetUid)), 1500, null as any);
        if (sSnap && sSnap.exists && sSnap.exists()) {
          return { docId: targetUid, data: sSnap.data() as any };
        }
      }
    } catch (e) {
      console.warn('[Auth] Usernames email lookup handled error:', e);
    }

    // 4. Query students collection by email
    try {
      const qStudents = query(collection(db, 'students'), where('email', '==', cleanEmail), limit(1));
      const sSnap = await withTimeout(getDocs(qStudents), 2000, null as any);
      if (sSnap && !sSnap.empty) {
        const docSnap = sSnap.docs[0];
        const d = docSnap.data() as any;
        return { docId: docSnap.id, data: d };
      }
    } catch (e) {
      console.warn('[Auth] Students collection email query handled error:', e);
    }

    // 5. Check local cache fallback
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`klu_profile_${uid}`) || 
                     localStorage.getItem(`klu_profile_${studentId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.profileCompleted || parsed.username || (parsed.totalXP || 0) > 0)) {
            return { docId: uid, data: parsed };
          }
        } catch {}
      }
    }

    return null;
  };

  // Fetch current student's profile from Firestore with timeout resilience and zero-data loss merging
  const syncAndFetchProfile = async (
    user: User, 
    fallbackName?: string, 
    fallbackRole?: 'student' | 'teacher' | 'developer',
    prefetchedData?: any
  ) => {
    let studentId = extractStudentId(user.email || '');
    if (user.uid.startsWith('dev_')) {
      const devCandidate = user.uid.replace(/^dev_/, '');
      if (isAuthorizedDeveloper(devCandidate)) {
        studentId = devCandidate;
      }
    }
    const isDev = isAuthorizedDeveloper(studentId) || isAuthorizedDeveloper(user.email || '') || user.uid.startsWith('dev_') || (fallbackRole as string) === 'developer';
    const devProfileInfo = isDev ? getDeveloperProfile(studentId) : null;
    const determinedRole: 'student' | 'teacher' | 'developer' = isDev ? 'developer' : (fallbackRole || 'student');
    const studentName = (devProfileInfo ? devProfileInfo.name : null) || user.displayName || fallbackName || studentId || 'Student';
    const zeroState = createZeroStudentState(user.uid, user.email || '', studentName, determinedRole);

    if (isDev) {
      zeroState.role = 'developer';
    }

    // 1. Immediately load from localStorage if available so user is never blocked or reset
    const storageKey = isDev ? `klu_profile_${devProfileInfo?.id || studentId}` : `klu_profile_${studentId}`;
    const localSaved = typeof window !== 'undefined' ? (localStorage.getItem(storageKey) || localStorage.getItem(`klu_profile_${user.uid}`)) : null;
    let currentProfile: UserProfileData = zeroState;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if ((parsed.totalXP || 0) >= 9000 || parsed.completedUnits === 3 || (parsed.streak || 0) >= 90) {
          if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
          currentProfile = zeroState;
        } else {
          currentProfile = { ...zeroState, ...parsed };
          if (isDev) currentProfile.role = 'developer';
        }
      } catch (e) {
        console.warn('Local profile parse error:', e);
      }
    }

    if (prefetchedData) {
      currentProfile = {
        ...currentProfile,
        ...prefetchedData,
        uid: user.uid,
        email: user.email || prefetchedData.email || currentProfile.email,
        username: prefetchedData.username || currentProfile.username,
        profileCompleted: prefetchedData.profileCompleted ?? currentProfile.profileCompleted ?? true,
        portalPassword: prefetchedData.portalPassword || currentProfile.portalPassword,
        department: prefetchedData.department || currentProfile.department || 'CSE',
        year: prefetchedData.year || currentProfile.year || '3rd Year',
      };
    }

    // Immediately establish the active session, profile and user in state & local storage
    if (typeof window !== 'undefined') {
      if (isDev) {
        localStorage.setItem('klu_active_dev_id', studentId);
      } else {
        localStorage.setItem('klu_active_student_id', studentId);
      }
      localStorage.setItem(storageKey, JSON.stringify(currentProfile));
      localStorage.setItem(`klu_profile_${user.uid}`, JSON.stringify(currentProfile));
    }
    setCurrentUser(user);
    setUserProfile(currentProfile);

    try {
      const userRef = doc(db, 'students', user.uid);
      let remoteData: any = prefetchedData;

      if (!remoteData) {
        const getDocPromise = getDoc(userRef);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 4500)
        );
        const snap = await Promise.race([getDocPromise, timeoutPromise]) as any;

        if (snap && snap.exists && snap.exists()) {
          remoteData = snap.data();
        }
      }

      if (!remoteData) {
        setDoc(userRef, { 
          ...currentProfile, 
          uid: user.uid,
          resetEpoch: GLOBAL_RESET_EPOCH,
          isOnline: true,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        }, { merge: true }).catch(() => {});
        setUserProfile(currentProfile);
      } else {
        // Intelligently merge remote data with local cache while strictly preserving identity & credentials
        const localModules = currentProfile.completedModules || [];
        const remoteModules = remoteData.completedModules || [];
        const mergedModules = Array.from(new Set([...localModules, ...remoteModules]));
        const mergedXP = Math.max(
          currentProfile.totalXP || 0, 
          currentProfile.xp || 0,
          remoteData.totalXP || 0, 
          remoteData.xp || 0
        );

        let calculatedCompletedUnits = remoteData.completedUnits || currentProfile.completedUnits || 0;
        if (mergedModules.length === 0 && (remoteData.completedSteps || []).filter((s: string) => s.startsWith('quiz_')).length === 0) {
          calculatedCompletedUnits = 0;
        }

        const isFinished = mergedModules.length >= (ALL_MODULES.length || 30);
        const completionTime = remoteData.courseCompletedAt || currentProfile.courseCompletedAt || (isFinished ? (currentProfile.updatedAt || new Date().toISOString()) : undefined);
        const mergedStreak = Math.max(currentProfile.streak || 0, remoteData.streak || 0);

        const profile: UserProfileData = {
          ...zeroState,
          ...remoteData,
          ...currentProfile,
          uid: user.uid,
          email: user.email || remoteData.email || currentProfile.email,
          name: remoteData.name || currentProfile.name || zeroState.name,
          displayName: remoteData.displayName || currentProfile.displayName || zeroState.displayName,
          studentId: remoteData.studentId || currentProfile.studentId || studentId,
          username: remoteData.username || currentProfile.username,
          profileCompleted: Boolean(remoteData.profileCompleted || currentProfile.profileCompleted),
          portalPassword: remoteData.portalPassword || currentProfile.portalPassword,
          department: remoteData.department || currentProfile.department || 'CSE',
          year: remoteData.year || currentProfile.year || '3rd Year',
          college: remoteData.college || currentProfile.college || 'KLU',
          role: isDev ? 'developer' : (remoteData.role || currentProfile.role || zeroState.role),
          resetEpoch: GLOBAL_RESET_EPOCH,
          completedModules: mergedModules,
          totalXP: mergedXP,
          xp: mergedXP,
          streak: mergedStreak,
          completedUnits: calculatedCompletedUnits,
          modulesCompleted: mergedModules.length,
          overallProgress: Math.min(100, Math.round((mergedModules.length / (ALL_MODULES.length || 30)) * 100)),
          ...(completionTime ? { courseCompletedAt: completionTime } : {}),
          updatedAt: new Date().toISOString()
        };
        
        setUserProfile(profile);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(profile));
          localStorage.setItem(`klu_profile_${user.uid}`, JSON.stringify(profile));
          if (profile.username) {
            localStorage.setItem(`klu_profile_${profile.username}`, JSON.stringify(profile));
          }
          if (isDev) {
            localStorage.setItem('klu_active_dev_id', studentId);
          }
        }

        // Keep remote in sync with the merged state and set active presence
        setDoc(userRef, {
          uid: user.uid,
          name: profile.name || profile.displayName,
          displayName: profile.displayName || profile.name,
          email: profile.email,
          studentId: profile.studentId,
          username: profile.username || null,
          profileCompleted: profile.profileCompleted ?? true,
          department: profile.department || 'CSE',
          year: profile.year || '3rd Year',
          college: profile.college || 'KLU',
          role: isDev ? 'developer' : (profile.role || 'student'),
          completedModules: mergedModules,
          totalXP: profile.totalXP,
          xp: profile.xp,
          streak: profile.streak,
          completedUnits: profile.completedUnits,
          modulesCompleted: mergedModules.length,
          overallProgress: profile.overallProgress,
          ...(profile.portalPassword ? { portalPassword: profile.portalPassword } : {}),
          ...(profile.courseCompletedAt ? { courseCompletedAt: profile.courseCompletedAt } : {}),
          resetEpoch: GLOBAL_RESET_EPOCH,
          isOnline: true,
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }

      // Attach real-time snapshot listener on the active user doc
      try {
        if (userDocUnsubRef.current) {
          userDocUnsubRef.current();
          userDocUnsubRef.current = null;
        }
        userDocUnsubRef.current = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const liveData = docSnap.data() as any;
            if (!isDev && (liveData.role === 'developer' || (liveData.totalXP || 0) >= 9000)) return;
            if ((liveData.totalXP || 0) >= 9000) return;
            if (liveData.completedUnits >= 3 && (!liveData.completedModules || liveData.completedModules.length === 0)) {
              liveData.completedUnits = 0;
            }
            setUserProfile((prev) => prev ? { 
              ...prev, 
              ...liveData,
              username: liveData.username || prev.username,
              profileCompleted: liveData.profileCompleted ?? prev.profileCompleted,
              portalPassword: liveData.portalPassword || prev.portalPassword,
            } : liveData);
          }
        }, (err) => {
          console.warn('[Firestore] Profile onSnapshot handled error (offline cache fallback):', err);
        });
      } catch (e) {
        console.warn('Real-time profile subscription failed:', e);
      }
    } catch (error) {
      console.warn('Firestore profile sync fallback (using local cache):', error);
      setUserProfile(currentProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clean reset for GLOBAL_RESET_EPOCH: ensures everyone starts from scratch at 0
    if (typeof window !== 'undefined') {
      const activeEpoch = localStorage.getItem('netquest_reset_epoch');
      if (activeEpoch !== GLOBAL_RESET_EPOCH) {
        const keysToClean: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('quiz_') || k.startsWith('netquest_progress_') || k.startsWith('klu_completed_'))) {
            keysToClean.push(k);
          }
        }
        keysToClean.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('netquest_reset_epoch', GLOBAL_RESET_EPOCH);
      }
    }

    // Check if an authorized developer session exists locally
    const activeDevId = typeof window !== 'undefined' ? localStorage.getItem('klu_active_dev_id') : null;
    if (activeDevId && isAuthorizedDeveloper(activeDevId)) {
      const devInfo = getDeveloperProfile(activeDevId);
      const uid = `dev_${devInfo.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const syntheticDevUser: any = {
        uid,
        email: devInfo.email || `${activeDevId.toLowerCase()}@klu.ac.in`,
        displayName: devInfo.name,
        emailVerified: true,
        getIdToken: async () => `token_${uid}`,
      };
      const zeroDev = createZeroStudentState(
        uid, 
        devInfo.email || `${activeDevId.toLowerCase()}@klu.ac.in`, 
        devInfo.name, 
        'developer'
      );
      const savedDevProfile = localStorage.getItem(`klu_profile_${devInfo.id}`);
      let devProfile: UserProfileData = zeroDev;
      if (savedDevProfile) {
        try {
          const parsed = JSON.parse(savedDevProfile);
          if ((parsed.totalXP || 0) < 9000 && parsed.completedUnits !== 3 && (parsed.streak || 0) < 90) {
            devProfile = { ...zeroDev, ...parsed, role: 'developer' };
          } else {
            localStorage.removeItem(`klu_profile_${devInfo.id}`);
            devProfile = zeroDev;
          }
        } catch {
          devProfile = zeroDev;
        }
      }
      setCurrentUser(syntheticDevUser);
      setUserProfile(devProfile);
      setLoading(false);
      // Fetch genuine remote Firestore data in background
      syncAndFetchProfile(syntheticDevUser, devInfo.name, 'developer');
      return;
    }

    // Check if a student session exists locally
    const activeStudentId = typeof window !== 'undefined' ? localStorage.getItem('klu_active_student_id') : null;
    if (activeStudentId) {
      const saved = localStorage.getItem(`klu_profile_${activeStudentId}`);
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          const syntheticUser: any = {
            uid: profile.uid || `klu_${activeStudentId}`,
            email: profile.email,
            displayName: profile.name || profile.displayName,
            emailVerified: true,
            getIdToken: async () => `token_${profile.uid || activeStudentId}`,
          };
          setCurrentUser(syntheticUser);
          setUserProfile(profile);
          setLoading(false);
          // Sync in background to ensure latest stats
          syncAndFetchProfile(syntheticUser, profile.name, 'student', profile);
        } catch (e) {
          console.error('Failed to restore local student profile:', e);
        }
      }
    }

    // Handle redirect result if user was redirected for Google Sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const email = (result.user.email || '').toLowerCase().trim();
          if (!KLU_EMAIL_REGEX.test(email) && !isAuthorizedDeveloper(email)) {
            await signOut(auth);
            setShowDomainError(true);
            setAuthError('Access restricted: Only official KLU / KIID email addresses (@klu.ac.in, @kluniversity.in) are allowed.');
            return;
          }
          const existing = await withTimeout(findExistingUserProfile(result.user.uid, email), 2500, null);
          const hasCompletedCredentials = existing && existing.data && (
            existing.data.profileCompleted === true &&
            Boolean(existing.data.portalPassword) &&
            Boolean(existing.data.username)
          );

          if (hasCompletedCredentials) {
            setPendingRegistration(null);
            if (existing.docId !== result.user.uid) {
              setDoc(doc(db, 'students', result.user.uid), {
                ...existing.data,
                uid: result.user.uid,
                email,
                profileCompleted: true,
                updatedAt: serverTimestamp(),
              }, { merge: true }).catch(() => {});
            }
            setCurrentUser(result.user);
            await syncAndFetchProfile(result.user, undefined, undefined, existing.data);
          } else {
            const roster = findStudentCredential(email) || findStudentCredential(extractStudentId(email));
            const studentName = roster?.name || result.user.displayName || 'Student';
            setPendingRegistration({
              uid: result.user.uid,
              email: result.user.email || '',
              name: studentName,
              photoURL: result.user.photoURL || undefined,
            });
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result error:', err);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = (user.email || '').toLowerCase().trim();
        const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
        if (isGoogle && !KLU_EMAIL_REGEX.test(email) && !isAuthorizedDeveloper(email)) {
          await signOut(auth);
          setShowDomainError(true);
          setAuthError('Access restricted: Only official KLU / KIID email addresses (@klu.ac.in, @kluniversity.in) are allowed.');
          return;
        }

        try {
          const existing = await withTimeout(findExistingUserProfile(user.uid, email), 2500, null);
          const hasCompletedCredentials = existing && existing.data && (
            existing.data.profileCompleted === true &&
            Boolean(existing.data.portalPassword) &&
            Boolean(existing.data.username)
          );

          if (hasCompletedCredentials) {
            setPendingRegistration(null);
            if (existing.docId !== user.uid) {
              setDoc(doc(db, 'students', user.uid), {
                ...existing.data,
                uid: user.uid,
                email,
                profileCompleted: true,
                updatedAt: serverTimestamp(),
              }, { merge: true }).catch(() => {});
            }
            setCurrentUser(user);
            await syncAndFetchProfile(user, undefined, undefined, existing.data);
            return;
          }

          if (isGoogle) {
            const roster = findStudentCredential(email) || findStudentCredential(extractStudentId(email));
            const studentName = roster?.name || user.displayName || 'Student';
            setPendingRegistration({
              uid: user.uid,
              email: user.email || '',
              name: studentName,
              photoURL: user.photoURL || undefined,
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Auth state check warning:', e);
        }

        setCurrentUser(user);
        syncAndFetchProfile(user);
      } else {
        const hasDev = typeof window !== 'undefined' && localStorage.getItem('klu_active_dev_id');
        const hasLocal = typeof window !== 'undefined' && localStorage.getItem('klu_active_student_id');
        if (!hasDev && !hasLocal) {
          setCurrentUser(null);
          setUserProfile(null);
          setPendingRegistration(null);
        }
        setLoading(false);
      }
    });

    // Safety timeout: ensure loading state resolves swiftly
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribeAuth();
    };
  }, []);

  const cancelRegistration = () => {
    setPendingRegistration(null);
    if (auth.currentUser) {
      signOut(auth).catch(() => {});
    }
    setCurrentUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3 || clean.length > 80) return false;
    // Allow valid email address or alphanumeric/underscore/dot username
    const isEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(clean);
    const isAlphanumeric = /^[a-z0-9_.-]+$/i.test(clean);
    if (!isEmail && !isAlphanumeric) return false;
    const reserved = ['admin', 'root', 'developer', 'teacher', 'cresco', 'support', 'test', 'guest'];
    if (reserved.includes(clean)) return false;

    try {
      const usernameDocRef = doc(db, 'usernames', clean);
      const snap = await getDoc(usernameDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (pendingRegistration) {
          if (data?.uid === pendingRegistration.uid) return true;
          if (data?.email && pendingRegistration.email && data.email.toLowerCase() === pendingRegistration.email.toLowerCase()) return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Firestore username check error:', err);
      const local = typeof window !== 'undefined' ? localStorage.getItem(`klu_user_claim_${clean}`) : null;
      return !local;
    }
  };

  const completeStudentRegistration = async ({
    username,
    password,
    name,
    studentId,
    department,
    year,
  }: {
    username: string;
    password: string;
    name: string;
    studentId: string;
    department: string;
    year: string;
  }): Promise<UserProfileData> => {
    if (!pendingRegistration) {
      throw new Error('No pending registration session found.');
    }

    const email = pendingRegistration.email.toLowerCase().trim();
    const emailPrefix = email.split('@')[0].toLowerCase();
    // System automatically assigns student's KLU mail as username
    const cleanUser = (username.trim() || email).toLowerCase();
    const cleanPass = password.trim() || 'stu@sid';
    if (cleanPass.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }
    const cleanName = name.trim() || pendingRegistration.name || 'Student';
    const cleanId = (studentId.trim() || emailPrefix || cleanUser).toLowerCase();

    // Verify username availability with timeout so offline or slow Firestore never hangs
    const usernameDocRef = doc(db, 'usernames', cleanUser);
    try {
      const userSnap = await withTimeout(getDoc(usernameDocRef), 1200, null);
      if (userSnap && userSnap.exists()) {
        const uData = userSnap.data();
        const isSelf = uData?.uid === pendingRegistration.uid || 
          (uData?.email && pendingRegistration.email && uData.email.toLowerCase() === pendingRegistration.email.toLowerCase());
        if (!isSelf) {
          throw new Error('This account / username is already registered. Please sign in directly.');
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('already registered')) throw err;
      console.warn('Username check timeout/fallback:', err);
    }

    const uid = pendingRegistration.uid;
    const now = new Date().toISOString();

    const zeroState = createZeroStudentState(uid, email, cleanName, 'student');
    const profile: UserProfileData = {
      ...zeroState,
      uid,
      email,
      username: email, // Official KLU mail assigned as username
      name: cleanName,
      displayName: cleanName,
      studentId: cleanId,
      department: department || 'CSE',
      year: year || '3rd Year',
      profileCompleted: true,
      portalPassword: cleanPass,
      resetEpoch: GLOBAL_RESET_EPOCH,
      updatedAt: now,
    };

    // 1. Link Email/Password in background (non-blocking)
    if (auth.currentUser) {
      try {
        const credential = EmailAuthProvider.credential(email, cleanPass);
        withTimeout(linkWithCredential(auth.currentUser, credential), 1500, null).catch((linkErr: any) => {
          console.warn('Firebase linkWithCredential background note:', linkErr);
        });
      } catch (e) {
        console.warn('EmailAuthProvider credential note:', e);
      }
    }

    // 2. Cache locally immediately so the user can access their session without waiting
    if (typeof window !== 'undefined') {
      localStorage.setItem(`klu_profile_${cleanId}`, JSON.stringify(profile));
      localStorage.setItem(`klu_profile_${uid}`, JSON.stringify(profile));
      localStorage.setItem(`klu_profile_${cleanUser}`, JSON.stringify(profile));
      localStorage.setItem(`klu_profile_${email}`, JSON.stringify(profile));
      localStorage.setItem(`klu_profile_${emailPrefix}`, JSON.stringify(profile));
      localStorage.setItem(`klu_pwd_${cleanId}`, cleanPass);
      localStorage.setItem(`klu_pwd_${cleanUser}`, cleanPass);
      localStorage.setItem(`klu_pwd_${email}`, cleanPass);
      localStorage.setItem(`klu_pwd_${emailPrefix}`, cleanPass);
      localStorage.setItem(`klu_user_claim_${cleanUser}`, uid);
      localStorage.setItem(`klu_user_claim_${email}`, uid);
      localStorage.setItem(`klu_user_claim_${emailPrefix}`, uid);
      localStorage.setItem('klu_active_student_id', cleanId);
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: profile }));
    }

    // 3. Save profile and mappings in Firestore in parallel with timeout
    const credentialPayload = {
      uid,
      username: email,
      email,
      studentId: cleanId,
      name: cleanName,
      department: department || 'CSE',
      year: year || '3rd Year',
      portalPassword: cleanPass,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const writeTasks = [
      setDoc(doc(db, 'usernames', email), credentialPayload, { merge: true }),
      setDoc(doc(db, 'usernames', emailPrefix), credentialPayload, { merge: true }),
      setDoc(doc(db, 'users', uid), credentialPayload, { merge: true }),
      setDoc(doc(db, 'students', uid), {
        ...profile,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(db, 'students', `klu_${cleanId}`), {
        ...profile,
        uid,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ];

    if (cleanUser !== email && cleanUser !== emailPrefix) {
      writeTasks.push(
        setDoc(doc(db, 'usernames', cleanUser), credentialPayload, { merge: true })
      );
    }

    withTimeout(Promise.allSettled(writeTasks), 2000, null).catch(e => {
      console.warn('Firestore parallel profile write background warning:', e);
    });

    // 4. Finalize login and clear pending state instantly
    const syntheticUser: any = auth.currentUser || {
      uid,
      email,
      displayName: cleanName,
      emailVerified: true,
      getIdToken: async () => `token_${uid}`,
    };

    setCurrentUser(syntheticUser);
    setUserProfile(profile);
    setPendingRegistration(null);
    setLoading(false);
    syncAndFetchProfile(syntheticUser, cleanName, 'student', profile);

    return profile;
  };

  const resetStudentPassword = async (idOrEmail: string, newPassword: string) => {
    setAuthError(null);
    const cleanInput = idOrEmail.trim().toLowerCase();
    if (!cleanInput) {
      const msg = 'Please enter your KLU Username, Email, or Student ID.';
      setAuthError(msg);
      throw new Error(msg);
    }
    const cleanPassword = newPassword.trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      const msg = 'Password must be at least 4 characters.';
      setAuthError(msg);
      throw new Error(msg);
    }
    const rosterStudent = findStudentCredential(cleanInput);
    const studentId = rosterStudent 
      ? rosterStudent.studentId 
      : (userProfile?.studentId || (cleanInput.includes('@') ? extractStudentId(cleanInput) : cleanInput.replace(/\D/g, '')) || cleanInput);
    const username = (userProfile?.username || cleanInput).toLowerCase();
    const userEmail = (userProfile?.email || (cleanInput.includes('@') ? cleanInput : `${studentId}@klu.ac.in`)).toLowerCase();
    const emailPrefix = userEmail.split('@')[0].toLowerCase();
    const uid = currentUser?.uid || userProfile?.uid || `klu_${studentId}`;

    if (typeof window !== 'undefined') {
      localStorage.setItem(`klu_pwd_${studentId}`, cleanPassword);
      localStorage.setItem(`klu_pwd_${username}`, cleanPassword);
      localStorage.setItem(`klu_pwd_${userEmail}`, cleanPassword);
      localStorage.setItem(`klu_pwd_${emailPrefix}`, cleanPassword);
      localStorage.setItem(`klu_pwd_${cleanInput}`, cleanPassword);
      if (currentUser?.uid) {
        localStorage.setItem(`klu_pwd_${currentUser.uid}`, cleanPassword);
      }
      if (userProfile) {
        const updated = { 
          ...userProfile, 
          portalPassword: cleanPassword, 
          username: userProfile.username || username || userEmail,
          studentId: userProfile.studentId || studentId,
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(`klu_profile_${studentId}`, JSON.stringify(updated));
        localStorage.setItem(`klu_profile_${username}`, JSON.stringify(updated));
        localStorage.setItem(`klu_profile_${userEmail}`, JSON.stringify(updated));
        if (currentUser?.uid) {
          localStorage.setItem(`klu_profile_${currentUser.uid}`, JSON.stringify(updated));
        }
        window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updated }));
      }
    }

    setUserProfile(prev => prev ? { 
      ...prev, 
      portalPassword: cleanPassword, 
      username: prev.username || username || userEmail,
      studentId: prev.studentId || studentId,
      updatedAt: new Date().toISOString()
    } : null);

    try {
      const updateData = { 
        portalPassword: cleanPassword, 
        username,
        studentId,
        email: userEmail,
        updatedAt: serverTimestamp() 
      };
      const targets = [
        setDoc(doc(db, 'students', uid), updateData, { merge: true }),
        setDoc(doc(db, 'students', `klu_${studentId}`), updateData, { merge: true }),
        setDoc(doc(db, 'usernames', username), { ...updateData, uid }, { merge: true }),
        setDoc(doc(db, 'usernames', userEmail), { ...updateData, uid }, { merge: true }),
        setDoc(doc(db, 'usernames', emailPrefix), { ...updateData, uid }, { merge: true }),
      ];
      if (studentId && studentId !== username && studentId !== emailPrefix) {
        targets.push(setDoc(doc(db, 'usernames', studentId.toLowerCase()), { ...updateData, uid }, { merge: true }));
      }
      if (currentUser?.uid && currentUser.uid !== uid) {
        targets.push(setDoc(doc(db, 'students', currentUser.uid), updateData, { merge: true }));
        targets.push(setDoc(doc(db, 'users', currentUser.uid), updateData, { merge: true }));
      }
      withTimeout(Promise.allSettled(targets), 2500, null).catch(err => {
        console.warn('Firestore password reset targets background note:', err);
      });

      if (auth.currentUser && auth.currentUser.email) {
        try {
          updatePassword(auth.currentUser, cleanPassword).catch((pwErr) => {
            console.warn('Firebase Auth updatePassword notice (custom portal password saved in Firestore & local cache):', pwErr);
          });
        } catch (pwErr) {
          console.warn('Firebase Auth updatePassword warning:', pwErr);
        }
      }
    } catch (err) {
      console.warn('Firestore password reset fallback:', err);
    }
  };

  const loginWithStudentId = async (idOrEmail: string, password?: string, studentName?: string) => {
    setAuthError(null);
    const cleanInput = idOrEmail.trim().toLowerCase();
    if (!cleanInput) {
      const msg = 'Please enter your Username, KLU Mail ID, or Student ID.';
      setAuthError(msg);
      throw new Error(msg);
    }

    const cleanPassword = (password || '').trim();
    if (!cleanPassword) {
      const msg = 'Please enter your password.';
      setAuthError(msg);
      throw new Error(msg);
    }

    // Developer login check
    if (isAuthorizedDeveloper(cleanInput)) {
      await loginWithDeveloperId(cleanInput, password);
      return;
    }

    let matchedUid: string | null = null;
    let matchedStudentId: string | null = null;
    let matchedEmail: string | null = null;
    let matchedName: string | null = null;
    let matchedPassword: string | null = null;
    let matchedData: any = null;

    // 1. Subsequent Login: Username lookup from 'usernames' collection
    // Check cleanInput directly (handles both user@klu.ac.in and username prefix)
    const candidateKeys = [cleanInput];
    if (!cleanInput.includes('@')) {
      candidateKeys.push(`${cleanInput}@klu.ac.in`);
      candidateKeys.push(`${cleanInput}@kluniversity.in`);
    } else {
      candidateKeys.push(cleanInput.split('@')[0]);
    }

    for (const key of candidateKeys) {
      try {
        const usernameDoc = await withTimeout(getDoc(doc(db, 'usernames', key)), 1800, null);
        if (usernameDoc && usernameDoc.exists()) {
          const uData = usernameDoc.data() as any;
          matchedUid = uData?.uid || null;
          matchedStudentId = uData?.studentId || key;
          matchedEmail = uData?.email || (key.includes('@') ? key : null);
          matchedName = uData?.name || null;
          if (uData?.portalPassword) {
            matchedPassword = uData.portalPassword;
          }
          break;
        }
      } catch (e) {
        console.warn('Firestore username lookup fallback note:', e);
      }
    }

    // Direct email authentication if input is an email (non-blocking fallback)
    if (cleanInput.includes('@')) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanInput, cleanPassword);
        await syncAndFetchProfile(cred.user);
        return;
      } catch (fbErr: any) {
        console.warn('Direct email signInWithEmailAndPassword fallback notice:', fbErr?.code);
      }
    }

    // 2. Query 'users' collection by email or username if not yet resolved
    if (!matchedUid || !matchedPassword) {
      try {
        const emailQuery = query(collection(db, 'users'), where('email', '==', cleanInput), limit(1));
        const uSnap = await withTimeout(getDocs(emailQuery), 1500, null as any);
        if (uSnap && !uSnap.empty) {
          const uDoc = uSnap.docs[0].data();
          matchedUid = uDoc.uid || uSnap.docs[0].id;
          matchedStudentId = uDoc.studentId || cleanInput;
          matchedEmail = uDoc.email;
          matchedName = uDoc.name;
          if (uDoc.portalPassword) matchedPassword = uDoc.portalPassword;
        }
      } catch {}
    }

    // 3. Query 'students' collection by email or direct UID
    if (!matchedUid || !matchedPassword) {
      const candidateUids = [`klu_${cleanInput}`, cleanInput];
      for (const cUid of candidateUids) {
        try {
          const sSnap = await getDoc(doc(db, 'students', cUid));
          if (sSnap.exists()) {
            matchedUid = cUid;
            matchedData = sSnap.data();
            matchedStudentId = matchedData.studentId || cleanInput;
            matchedEmail = matchedData.email;
            matchedName = matchedData.name || matchedData.displayName;
            if (matchedData.portalPassword) matchedPassword = matchedData.portalPassword;
            break;
          }
        } catch {}
      }
    }

    if (!matchedUid && cleanInput.includes('@')) {
      try {
        const qByEmail = query(collection(db, 'students'), where('email', '==', cleanInput), limit(1));
        const snap = await getDocs(qByEmail);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          matchedUid = docSnap.id;
          matchedData = docSnap.data();
          matchedStudentId = matchedData.studentId || cleanInput;
          matchedEmail = matchedData.email;
          matchedName = matchedData.name || matchedData.displayName;
          if (matchedData.portalPassword) matchedPassword = matchedData.portalPassword;
        }
      } catch {}
    }

    // 4. Fallback: check local storage cache
    if (!matchedPassword && typeof window !== 'undefined') {
      const localPwd = localStorage.getItem(`klu_pwd_${cleanInput}`) || 
                       (matchedStudentId ? localStorage.getItem(`klu_pwd_${matchedStudentId}`) : null) ||
                       (matchedEmail ? localStorage.getItem(`klu_pwd_${matchedEmail}`) : null);
      if (localPwd) {
        matchedPassword = localPwd;
      }
    }

    // 5. Fallback: check legacy student credentials CSV/roster
    const rosterStudent = findStudentCredential(cleanInput);
    if (rosterStudent) {
      matchedStudentId = rosterStudent.studentId;
      matchedEmail = rosterStudent.email;
      matchedName = rosterStudent.name;
      if (!matchedPassword) {
        matchedPassword = rosterStudent.password;
      }
    }

    // 6. Default fallback for whole-college KLU accounts
    const isRegisterFormat = /^992400\d{4,5}(@klu\.ac\.in)?$/i.test(cleanInput) || /^\d{10,11}$/.test(cleanInput.replace(/\D/g, ''));
    if (!matchedPassword && (isRegisterFormat || KLU_EMAIL_REGEX.test(cleanInput))) {
      matchedPassword = 'stu@sid';
      if (!matchedStudentId) matchedStudentId = cleanInput.split('@')[0];
      if (!matchedEmail) matchedEmail = cleanInput.includes('@') ? cleanInput : `${matchedStudentId}@klu.ac.in`;
    }

    // If still no student identified
    if (!matchedUid && !rosterStudent && !matchedPassword && !matchedData) {
      const msg = 'Account not found. First-time student? Please sign up with your official KLU Google account to activate your portal account.';
      setAuthError(msg);
      throw new Error(msg);
    }

    const studentId = matchedStudentId || cleanInput.split('@')[0] || cleanInput;
    const last5 = studentId.slice(-5);
    const expectedLegacyPassword = `sid@${last5}`;

    const localCachedPwd = typeof window !== 'undefined'
      ? (localStorage.getItem(`klu_pwd_${cleanInput}`) || 
         localStorage.getItem(`klu_pwd_${studentId}`) ||
         (matchedEmail ? localStorage.getItem(`klu_pwd_${matchedEmail}`) : null))
      : null;

    const isMatch = (matchedPassword && cleanPassword === matchedPassword) ||
                    (localCachedPwd && cleanPassword === localCachedPwd) ||
                    (cleanPassword === 'stu@sid') ||
                    (cleanPassword.toLowerCase() === expectedLegacyPassword.toLowerCase()) ||
                    (rosterStudent && rosterStudent.password.toLowerCase() === cleanPassword.toLowerCase());

    if (!isMatch) {
      const msg = 'Invalid password. (Default is stu@sid, or sign in with your official KLU Google account).';
      setAuthError(msg);
      throw new Error(msg);
    }

    // Setup session
    const email = matchedEmail || (cleanInput.includes('@') ? cleanInput : `${studentId}@klu.ac.in`);
    const name = studentName || matchedName || (rosterStudent ? rosterStudent.name : `Student (${studentId})`);
    const uid = matchedUid || `klu_${studentId}`;

    const syntheticUser: any = {
      uid,
      email,
      displayName: name,
      emailVerified: true,
      getIdToken: async () => `token_${uid}`,
    };

    const storageKey = `klu_profile_${studentId}`;
    const zeroState = createZeroStudentState(uid, email, name, 'student');
    let profile: UserProfileData = {
      ...zeroState,
      ...(matchedData || {}),
      uid,
      studentId,
      name,
      displayName: name,
      email,
      role: 'student',
      portalPassword: cleanPassword,
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_dev_id');
      localStorage.setItem('klu_active_student_id', studentId);
      localStorage.setItem(`klu_pwd_${studentId}`, cleanPassword);
      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem(`klu_profile_${uid}`, JSON.stringify(profile));
    }

    setCurrentUser(syntheticUser);
    setUserProfile(profile);

    // Sync Firestore in background & attach live listener
    try {
      const userRef = doc(db, 'students', uid);
      await setDoc(userRef, {
        ...profile,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      syncAndFetchProfile(syntheticUser, name, 'student', profile);
    } catch {}
  };

  const loginWithGoogle = async (): Promise<{ isNewUser: boolean; profile: UserProfileData | null }> => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account',
      });
      
      let user: User | null = null;
      try {
        const cred = await signInWithPopup(auth, provider);
        user = cred.user;
      } catch (popupErr: any) {
        console.warn('Google popup sign-in notice:', popupErr);
        // If popup was blocked by the browser, cancelled, restricted in iframe, or failed with internal-error, fallback to redirect
        if (
          popupErr.code === 'auth/popup-blocked' || 
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/internal-error' ||
          popupErr.code === 'auth/network-request-failed'
        ) {
          console.info('Sign-in popup encountered error, falling back to signInWithRedirect...');
          try {
            await signInWithRedirect(auth, provider);
            return { isNewUser: false, profile: null };
          } catch (redirErr) {
            console.warn('signInWithRedirect fallback warning:', redirErr);
          }
        }
        throw popupErr;
      }
      
      if (!user || !user.email) {
        throw new Error('No valid email found on this Google account.');
      }

      const email = user.email.toLowerCase().trim();
      if (!KLU_EMAIL_REGEX.test(email) && !isAuthorizedDeveloper(email)) {
        await signOut(auth);
        setShowDomainError(true);
        const domainMsg = 'Access restricted: Only official KLU / KIID email addresses (@klu.ac.in, @kluniversity.in) are allowed.';
        setAuthError(domainMsg);
        throw new Error(domainMsg);
      }
      
      // Check if user already exists with completed credentials
      const existing = await withTimeout(findExistingUserProfile(user.uid, email), 2500, null);
      
      const hasCompletedCredentials = existing && existing.data && (
        existing.data.profileCompleted === true &&
        Boolean(existing.data.portalPassword) &&
        Boolean(existing.data.username)
      );

      if (hasCompletedCredentials) {
        setPendingRegistration(null);
        setCurrentUser(user);
        setUserProfile(existing.data);
        await syncAndFetchProfile(user, existing.data.name, 'student', existing.data);
        return { isNewUser: false, profile: existing.data };
      }

      // FIRST-TIME USER:
      // Prompt modal to set up Register Number (10/11 digits) and default password (stu@sid)
      const roster = findStudentCredential(email) || findStudentCredential(extractStudentId(email));
      const studentName = (roster && roster.name) || user.displayName || 'Student';

      setPendingRegistration({
        uid: user.uid,
        email: user.email,
        name: studentName,
        photoURL: user.photoURL || undefined,
      });
      return { isNewUser: true, profile: null };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('SIGN_IN_CANCELLED');
      }
      const message = getHumanErrorMessage(err?.code || err?.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const errorMsg = 'Please enter a valid email address.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      // Wait for backend sync to finish before resolving the login promise
      await syncAndFetchProfile(cred.user);
    } catch (err: any) {
      const message = getHumanErrorMessage(err?.code || err?.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    role: 'student' | 'teacher' = 'student'
  ) => {
    setAuthError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const errorMsg = 'Please enter a valid email address.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!name.trim()) {
      const errorMsg = 'Please enter your full student name.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      const studentName = name.trim();
      
      try {
        await updateProfile(cred.user, { displayName: studentName });
      } catch (e) {
        console.warn('Could not update Auth displayName:', e);
      }

      // Wait for backend sync to finish before resolving the registration promise
      await syncAndFetchProfile(cred.user, studentName, role);

      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Could not send verification email:', e);
      }
    } catch (err: any) {
      const message = getHumanErrorMessage(err?.code || err?.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setAuthError(null);
    const uidToMarkOffline = currentUser?.uid;

    // 1. Immediately unsubscribe from any active Firestore listener
    if (userDocUnsubRef.current) {
      try {
        userDocUnsubRef.current();
      } catch (e) {
        console.warn('Error unsubscribing user listener on logout:', e);
      }
      userDocUnsubRef.current = null;
    }

    // 2. Immediately clear all active credentials and cached session tokens
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('klu_active_student_id');
        localStorage.removeItem('klu_active_dev_id');
        localStorage.removeItem('klu_active_developer_id');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Error clearing local storage on logout:', e);
      }
    }

    // 3. Immediately clear all auth state in React so the UI transitions instantly
    setCurrentUser(null);
    setUserProfile(null);
    setPendingRegistration(null);
    setLoading(false);

    // 4. Fire-and-forget online presence update so network hangs never block logout
    if (uidToMarkOffline) {
      try {
        const userRef = doc(db, 'students', uidToMarkOffline);
        updateDoc(userRef, {
          isOnline: false,
          lastLogout: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      } catch (e) {
        // Safe ignore for offline/synthetic accounts
      }
    }

    // 5. Complete Firebase auth signout if a Firebase session was active
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err: any) {
      console.warn('Firebase signOut warning (session cleared locally):', err);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    const trimmedEmail = email.trim();

    if (!KLU_EMAIL_REGEX.test(trimmedEmail)) {
      const errorMsg = 'Please use your KLU college email address ending with @klu.ac.in.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (err: any) {
      const message = getHumanErrorMessage(err?.code || err?.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithDeveloperId = async (developerId: string, password?: string) => {
    setAuthError(null);
    const cleanId = developerId.trim() || '285';
    // All developer logins unlocked for instant pre-launch and development testing
    const devInfo = getDeveloperProfile(cleanId);
    const uid = `dev_${devInfo.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const syntheticUser: any = {
      uid,
      email: devInfo.email || `${cleanId.toLowerCase()}@klu.ac.in`,
      displayName: devInfo.name,
      emailVerified: true,
      getIdToken: async () => `dev_token_${uid}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_student_id');
      localStorage.setItem('klu_active_dev_id', devInfo.id);
      // Purge any corrupted localStorage keys for this developer
      const keysToClean = [`klu_profile_${devInfo.id}`, `klu_profile_${cleanId}`, `klu_profile_${uid}`];
      for (const k of keysToClean) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const p = JSON.parse(item);
            if ((p.totalXP || 0) >= 9000 || p.completedUnits === 3 || (p.streak || 0) >= 90) {
              localStorage.removeItem(k);
            }
          } catch {
            localStorage.removeItem(k);
          }
        }
      }
    }

    // Connect to Firestore and sync real profile (starts at zero if new, loads genuine progress if exists)
    await syncAndFetchProfile(syntheticUser, devInfo.name, 'developer');
  };

  const resetStudentCourse = async (
    studentUidOrId: string, 
    options?: { resetXP?: boolean }
  ): Promise<{ success: boolean; message: string }> => {
    const resetXP = options?.resetXP ?? false;
    try {
      const userRef = doc(db, 'students', studentUidOrId);
      let existingData: any = {};
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          existingData = snap.data();
        }
      } catch (e) {
        console.warn("Could not read student doc before reset:", e);
      }

      const resetPayload: any = {
        completedModules: [],
        completedSteps: [],
        overallProgress: 0,
        unit3Progress: 0,
        unit4Progress: 0,
        unit5Progress: 0,
        modulesCompleted: 0,
        lessonsCompleted: 0,
        completedUnits: 0,
        currentUnit: 3,
        currentModule: 'u3_m01',
        lastLesson: null,
        unlockedUnits: ['unit_3', 'unit-3'],
        courseCompletedAt: null,
        updatedAt: serverTimestamp(),
      };

      if (resetXP) {
        resetPayload.totalXP = 0;
        resetPayload.xp = 0;
        resetPayload.streak = 0;
      }

      await setDoc(userRef, resetPayload, { merge: true });

      if (typeof window !== 'undefined') {
        const targetStudentId = existingData.studentId || studentUidOrId.replace('klu_', '');
        localStorage.removeItem(`klu_profile_${targetStudentId}`);
        if (localStorage.getItem('klu_active_student_id') === targetStudentId) {
          if (userProfile?.studentId === targetStudentId) {
            setUserProfile(prev => prev ? { ...prev, ...resetPayload, updatedAt: new Date().toISOString() } : null);
          }
        }
      }

      return { success: true, message: `Course progress successfully reset for student ${studentUidOrId}.` };
    } catch (err: any) {
      console.error("Failed to reset student course:", err);
      throw new Error(err.message || 'Failed to reset student course.');
    }
  };

  
  const updateStudentProfile = async (updates: Partial<UserProfileData>) => {
    if (!currentUser && !userProfile) return;
    const uid = currentUser?.uid || userProfile?.uid;
    const cleanId = userProfile?.studentId || (currentUser?.email ? extractStudentId(currentUser.email) : '');

    const effectiveName = updates.displayName || updates.name;
    const sanitizedUpdates: Partial<UserProfileData> = {
      ...updates,
      ...(effectiveName ? { name: effectiveName, displayName: effectiveName } : {}),
      updatedAt: new Date().toISOString()
    };

    setUserProfile((prev) => {
      const next = prev ? { ...prev, ...sanitizedUpdates } : null;
      if (next && typeof window !== 'undefined') {
        if (cleanId) localStorage.setItem(`klu_profile_${cleanId}`, JSON.stringify(next));
        if (uid) localStorage.setItem(`klu_profile_${uid}`, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: next }));
      }
      return next;
    });

    try {
      if (effectiveName && auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: effectiveName });
        } catch (authErr) {
          console.warn("Could not update Firebase Auth displayName:", authErr);
        }
      }

      if (uid) {
        const studentRef = doc(db, 'students', uid);
        await setDoc(studentRef, { ...sanitizedUpdates, updatedAt: serverTimestamp() }, { merge: true });
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { ...sanitizedUpdates, updatedAt: serverTimestamp() }, { merge: true });
      }
      if (cleanId && cleanId !== uid) {
        const legacyRef = doc(db, 'students', `klu_${cleanId}`);
        await setDoc(legacyRef, { ...sanitizedUpdates, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to update student profile in Firestore:', e);
      throw e;
    }
  };

  // Idempotent step-level XP reward with duplicate protection
  const awardStepXP = async (
    stepKey: string, 
    xpAmount: number
  ): Promise<{ success: boolean; duplicate: boolean }> => {
    if (!currentUser || !userProfile) return { success: false, duplicate: false };

    const currentSteps = userProfile.completedSteps || [];
    if (currentSteps.includes(stepKey)) {
      return { success: false, duplicate: true };
    }

    const nextSteps = [...currentSteps, stepKey];
    const nextXP = (userProfile.totalXP || 0) + xpAmount;

    const payload: Partial<UserProfileData> = {
      completedSteps: nextSteps,
      totalXP: nextXP,
      xp: nextXP,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local state update
    setUserProfile(prev => prev ? { ...prev, ...payload } : null);
    if (typeof window !== 'undefined' && userProfile.studentId) {
      const updatedFull = { ...userProfile, ...payload };
      localStorage.setItem(`klu_profile_${userProfile.studentId}`, JSON.stringify(updatedFull));
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updatedFull }));
    }

    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await setDoc(userRef, {
        uid: currentUser.uid,
        name: userProfile.name || userProfile.displayName || 'KLU Student',
        displayName: userProfile.displayName || userProfile.name || 'KLU Student',
        studentId: userProfile.studentId,
        email: userProfile.email,
        college: userProfile.college || 'KLU',
        role: userProfile.role || 'student',
        completedSteps: arrayUnion(stepKey),
        totalXP: nextXP,
        xp: nextXP,
        overallProgress: userProfile.overallProgress || 0,
        modulesCompleted: (userProfile.completedModules || []).length,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('awardStepXP firestore sync error:', err);
    }

    return { success: true, duplicate: false };
  };

  // Record completed module with duplicate completion protection, local storage persistence, and resilient Firestore setDoc
  const recordModuleCompletion = async (
    moduleId: string, 
    unitId: 'unit-3' | 'unit-4' | 'unit-5' | string, 
    moduleXp: number = 50
  ): Promise<{ success: boolean; duplicate: boolean }> => {
    if (!currentUser) return { success: false, duplicate: false };

    if (userProfile?.completedModules?.includes(moduleId)) {
      return { success: true, duplicate: true };
    }

    const completionKey = `${moduleId}_complete`;
    const currentSteps = userProfile?.completedSteps || [];
    const alreadyRewarded = currentSteps.includes(completionKey);
    const xpToAdd = alreadyRewarded ? 0 : moduleXp;

    const nextXP = (userProfile?.totalXP || 0) + xpToAdd;
    const newCompletedList = [...(userProfile?.completedModules || []), moduleId];
    const newSteps = alreadyRewarded ? currentSteps : [...currentSteps, completionKey];
    const newOverallProgress = Math.min(100, Math.round((newCompletedList.length / (ALL_MODULES.length || 30)) * 100));

    // Calculate per-unit progress (Unit 3 has 12, Unit 4 has 9, Unit 5 has 9)
    const u3Count = newCompletedList.filter(id => id.startsWith('u3_') || id.startsWith('mod-3-')).length;
    const u4Count = newCompletedList.filter(id => id.startsWith('u4_') || id.startsWith('mod-4-')).length;
    const u5Count = newCompletedList.filter(id => id.startsWith('u5_') || id.startsWith('mod-5-')).length;
    const unit3Progress = Math.min(100, Math.round((u3Count / 12) * 100));
    const unit4Progress = Math.min(100, Math.round((u4Count / 9) * 100));
    const unit5Progress = Math.min(100, Math.round((u5Count / 9) * 100));
    
    const isCourseComplete = newCompletedList.length >= (ALL_MODULES.length || 30) || newOverallProgress >= 100;
    const courseCompletedAt = isCourseComplete
      ? (userProfile?.courseCompletedAt || new Date().toISOString())
      : userProfile?.courseCompletedAt;
    const streakResult = computeUpdatedStreak(
      userProfile?.streak || 0,
      userProfile?.lastActiveDate,
      userProfile?.activityDates || []
    );

    const updatedProfile: UserProfileData = {
      ...(userProfile || createZeroStudentState(currentUser.uid, currentUser.email || '', currentUser.displayName || 'Student')),
      completedModules: newCompletedList,
      completedSteps: newSteps,
      totalXP: nextXP,
      xp: nextXP,
      overallProgress: newOverallProgress,
      unit3Progress,
      unit4Progress,
      unit5Progress,
      modulesCompleted: newCompletedList.length,
      lastLesson: moduleId,
      streak: streakResult.streak,
      lastActiveDate: streakResult.lastActiveDate,
      activityDates: streakResult.activityDates,
      ...(courseCompletedAt ? { courseCompletedAt } : {}),
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately update in-memory React state
    setUserProfile(updatedProfile);

    // 2. Immediately save to localStorage for offline and refresh persistence
    if (typeof window !== 'undefined' && updatedProfile.studentId) {
      localStorage.setItem(`klu_profile_${updatedProfile.studentId}`, JSON.stringify(updatedProfile));
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updatedProfile }));
    }

    // 3. Save to Firestore with setDoc(..., { merge: true }) so it ALWAYS creates or updates
    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await setDoc(userRef, {
        uid: currentUser.uid,
        name: updatedProfile.name || updatedProfile.displayName,
        displayName: updatedProfile.displayName || updatedProfile.name,
        email: updatedProfile.email,
        studentId: updatedProfile.studentId,
        college: updatedProfile.college || 'KLU',
        role: updatedProfile.role || 'student',
        completedModules: newCompletedList,
        completedSteps: newSteps,
        totalXP: nextXP,
        xp: nextXP,
        modulesCompleted: newCompletedList.length,
        overallProgress: newOverallProgress,
        unit3Progress,
        unit4Progress,
        unit5Progress,
        lastLesson: moduleId,
        streak: streakResult.streak,
        lastActiveDate: streakResult.lastActiveDate,
        activityDates: streakResult.activityDates,
        ...(courseCompletedAt ? { courseCompletedAt } : {}),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Failed to record module completion in Firestore:", err);
    }
    return { success: true, duplicate: false };
  };

  // Record quiz challenge attempt & handle unit unlocking
  const recordQuizAttempt = async (
    unitId: string, 
    scorePercent: number, 
    passed: boolean, 
    quizXp: number = 200
  ): Promise<void> => {
    if (!currentUser) return;

    const currentUnlocked = userProfile?.unlockedUnits || ['unit_3', 'unit-3'];
    const currentAttempts = (userProfile?.quizAttempts || 0) + 1;
    const currentAvg = userProfile?.quizAverage || 0;
    const newAverage = Math.round(((currentAvg * (currentAttempts - 1)) + scorePercent) / currentAttempts);

    let nextUnlocked = [...currentUnlocked];
    let nextCompletedUnits = userProfile?.completedUnits || 0;
    let xpBonus = 0;

    const quizKey = `quiz_${unitId}`;
    const currentSteps = userProfile?.completedSteps || [];
    const alreadyRewarded = currentSteps.includes(quizKey);

    const normUnit = unitId.replace('-', '_'); // 'unit-3' -> 'unit_3'
    if (passed && scorePercent >= 70) {
      if (!alreadyRewarded) {
        xpBonus = quizXp;
      }
      if (normUnit === 'unit_3') {
        if (!nextUnlocked.includes('unit_4')) nextUnlocked.push('unit_4');
        if (!nextUnlocked.includes('unit-4')) nextUnlocked.push('unit-4');
        nextCompletedUnits = Math.max(nextCompletedUnits, 1);
      } else if (normUnit === 'unit_4') {
        if (!nextUnlocked.includes('unit_5')) nextUnlocked.push('unit_5');
        if (!nextUnlocked.includes('unit-5')) nextUnlocked.push('unit-5');
        nextCompletedUnits = Math.max(nextCompletedUnits, 2);
      } else if (normUnit === 'unit_5') {
        nextCompletedUnits = 3;
      }
    }

    const nextSteps = (xpBonus > 0 && !alreadyRewarded)
      ? [...currentSteps, quizKey]
      : currentSteps;

    const payload: Partial<UserProfileData> = {
      quizAttempts: currentAttempts,
      quizAverage: newAverage,
      unlockedUnits: nextUnlocked,
      completedUnits: nextCompletedUnits,
      completedSteps: nextSteps,
      totalXP: (userProfile?.totalXP || 0) + xpBonus,
      xp: (userProfile?.xp || 0) + xpBonus,
      updatedAt: new Date().toISOString(),
    };

    await updateStudentProfile(payload);
  };

  
  
  const recordPracticeAttempt = async (categoryId: string, scorePercent: number, xpBonus: number = 20) => {
    if (!currentUser || !userProfile) return;
    const currentScores = userProfile.practiceScores || {};
    const bestScore = currentScores[categoryId] || 0;
    
    // Only update if new score is better, or if it's the first time
    const newBest = Math.max(bestScore, scorePercent);
    const newScores = { ...currentScores, [categoryId]: newBest };
    
    const payload: Partial<UserProfileData> = {
      practiceScores: newScores,
      totalXP: (userProfile.totalXP || 0) + xpBonus,
      xp: (userProfile.xp || 0) + xpBonus,
      updatedAt: new Date().toISOString(),
    };
    
    // Optimistic
    setUserProfile(prev => prev ? { ...prev, ...payload } : null);
    if (typeof window !== 'undefined' && userProfile.studentId) {
      const updatedFull = { ...userProfile, ...payload };
      localStorage.setItem(`klu_profile_${userProfile.studentId}`, JSON.stringify(updatedFull));
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updatedFull }));
    }
    
    // Persist
    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await setDoc(userRef, {
        [`practiceScores.${categoryId}`]: newBest,
        totalXP: increment(xpBonus),
        xp: increment(xpBonus),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to persist practice score:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        clearAuthError,
        loginWithEmail,
        loginWithGoogle,
        loginWithStudentId,
        registerWithEmail,
        logout,
        resetPassword,
        updateStudentProfile,
        updateKLUProfile: updateStudentProfile,
        awardStepXP,
        recordModuleCompletion,
        recordQuizAttempt,
        recordPracticeAttempt,
        loginWithDeveloperId,
        resetStudentCourse,
        resetStudentPassword,
        pendingRegistration,
        checkUsernameAvailable,
        completeStudentRegistration,
        cancelRegistration,
      }}
    >
      {children}
      {showDomainError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80  animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-red-50">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Access Denied</h2>
              </div>
              <button 
                onClick={() => setShowDomainError(false)}
                className="p-2 -mr-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-6 leading-relaxed">
                You attempted to sign in with a personal or unrecognized Google account. 
                <br /><br />
                This portal is strictly restricted to students and faculty of <strong>KLU</strong>. Please sign in again and select your official <strong>@klu.ac.in</strong> email address.
              </p>
              <button
                onClick={() => setShowDomainError(false)}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Understood, try again
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helpful mapping for Firebase Auth error codes
function getHumanErrorMessage(codeOrMessage: string): string {
  if (typeof codeOrMessage !== 'string') return 'An unexpected authentication error occurred.';
  if (codeOrMessage.includes('auth/invalid-credential') || codeOrMessage.includes('auth/wrong-password') || codeOrMessage.includes('auth/user-not-found')) {
    return 'Invalid email address or password. Please verify and try again.';
  }
  if (codeOrMessage.includes('auth/email-already-in-use')) {
    return 'This KLU email is already registered. Please log in instead or reset your password.';
  }
  if (codeOrMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (codeOrMessage.includes('auth/invalid-email')) {
    return 'Please use your KLU college email address ending with @klu.ac.in.';
  }
  if (codeOrMessage.includes('auth/operation-not-allowed')) {
    return 'Email/Password authentication is not yet enabled in the Firebase Console.';
  }
  if (codeOrMessage.includes('auth/too-many-requests')) {
    return 'Too many failed login attempts. Please wait a few moments and try again.';
  }
  if (codeOrMessage.includes('auth/popup-blocked')) {
    return 'The sign-in pop-up was blocked by your browser. Please enable pop-ups for this site or try again.';
  }
  if (codeOrMessage.includes('auth/internal-error')) {
    return 'Google popup was restricted by browser settings (or cross-site cookies). Please use your Register Number and default password (stu@sid) to sign in directly, or allow popups.';
  }
  if (codeOrMessage.includes('auth/cancelled-popup-request')) {
    return 'Sign-in was cancelled or another sign-in window was already open. Please try again.';
  }
  if (codeOrMessage.includes('auth/unauthorized-domain')) {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host === '127.0.0.1') {
      const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
      return `Domain unauthorized: You are accessing via "127.0.0.1", but Firebase only authorizes "localhost" by default. Please switch to http://localhost${port} or add "127.0.0.1" in Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    return `Domain unauthorized in Firebase: The domain "${host || 'this site'}" is not authorized. Please add "${host}" to Firebase Console > Authentication > Settings > Authorized domains.`;
  }
  if (codeOrMessage.includes('auth/configuration-not-found')) {
    return 'Google Sign-In is not enabled yet in your Firebase Project. Please go to Firebase Console > Authentication > Sign-in method and enable Google.';
  }
  if (codeOrMessage.includes('auth/network-request-failed')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  return codeOrMessage;
}
