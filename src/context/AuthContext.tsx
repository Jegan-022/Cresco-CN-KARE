import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AlertTriangle, X } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';
import { isAuthorizedDeveloper, getDeveloperProfile, verifyDeveloperPassword } from '../config/developers';
import { findStudentCredential, verifyStudentCredential } from '../data/studentCredentials';
import { ALL_MODULES } from '../data/courseContent';

// KLU email validation regex strictly mandated by requirements
export const KLU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@klu\.ac\.in$/i;

export const extractStudentId = (email: string): string => {
  const match = email.trim().match(/^([A-Za-z0-9._%+-]+)@klu\.ac\.in$/i);
  return match ? match[1] : email.split('@')[0];
};

export interface UserProfileData {
  uid: string;
  name: string;
  displayName: string;
  email: string;
  studentId: string;
  college: string;
  course: string;
  year?: string;
  section?: string;
  role: 'student' | 'teacher' | 'developer';
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

export const GLOBAL_RESET_EPOCH = '2026_09_RESET_SCRATCH_V1';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  const userDocUnsubRef = useRef<(() => void) | null>(null);
  const clearAuthError = () => setAuthError(null);

  // Fetch current student's profile from Firestore with timeout resilience
  const syncAndFetchProfile = async (user: User, fallbackName?: string, fallbackRole?: 'student' | 'teacher' | 'developer') => {
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
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    let currentProfile: UserProfileData = zeroState;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        // Purge any stale mock/fake values or pre-reset epoch profiles
        if (parsed.resetEpoch !== GLOBAL_RESET_EPOCH || (parsed.totalXP || 0) >= 9000 || parsed.completedUnits === 3 || (parsed.streak || 0) >= 90) {
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

    // Immediately establish the active session, profile and user in state & local storage
    if (typeof window !== 'undefined') {
      if (isDev) {
        localStorage.setItem('klu_active_dev_id', studentId);
      } else {
        localStorage.setItem('klu_active_student_id', studentId);
      }
      localStorage.setItem(storageKey, JSON.stringify(currentProfile));
    }
    setCurrentUser(user);
    setUserProfile(currentProfile);

    try {
      const userRef = doc(db, 'students', user.uid);
      const getDocPromise = getDoc(userRef);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 2500)
      );
      const snap = await Promise.race([getDocPromise, timeoutPromise]);

      if (!snap.exists()) {
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
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(currentProfile));
        }
      } else {
        const remoteData = snap.data() as any;
        
        // Reset if remote doc has pre-reset epoch or corrupted stats
        const needsReset = 
          remoteData.resetEpoch !== GLOBAL_RESET_EPOCH ||
          (remoteData.totalXP || 0) >= 9000 || 
          (remoteData.streak || 0) >= 90 || 
          (remoteData.completedUnits >= 3 && (remoteData.completedModules || []).length === 0);

        if (needsReset) {
          console.warn("Resetting student profile to scratch in Firestore:", user.uid);
          await setDoc(userRef, {
            ...zeroState,
            uid: user.uid,
            studentId,
            role: isDev ? 'developer' : (remoteData.role || 'student'),
            resetEpoch: GLOBAL_RESET_EPOCH,
            updatedAt: serverTimestamp()
          });
          setUserProfile(zeroState);
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(zeroState));
          }
        } else {
          // Intelligently merge remote data with local cache
          const localModules = currentProfile.completedModules || [];
          const remoteModules = remoteData.completedModules || [];
          const mergedModules = Array.from(new Set([...localModules, ...remoteModules]));
          const mergedXP = Math.max(
            currentProfile.totalXP || 0, 
            currentProfile.xp || 0,
            remoteData.totalXP || 0, 
            remoteData.xp || 0
          );

          let calculatedCompletedUnits = remoteData.completedUnits || 0;
          if (mergedModules.length === 0 && (remoteData.completedSteps || []).filter((s: string) => s.startsWith('quiz_')).length === 0) {
            calculatedCompletedUnits = 0;
          }

          const isFinished = mergedModules.length >= (ALL_MODULES.length || 30);
          const completionTime = remoteData.courseCompletedAt || currentProfile.courseCompletedAt || (isFinished ? (currentProfile.updatedAt || new Date().toISOString()) : undefined);

          const profile: UserProfileData = {
            ...zeroState,
            ...remoteData,
            ...currentProfile,
            resetEpoch: GLOBAL_RESET_EPOCH,
            role: isDev ? 'developer' : (remoteData.role || currentProfile.role || zeroState.role),
            completedModules: mergedModules,
            totalXP: mergedXP,
            xp: mergedXP,
            completedUnits: calculatedCompletedUnits,
            modulesCompleted: mergedModules.length,
            overallProgress: Math.min(100, Math.round((mergedModules.length / (ALL_MODULES.length || 30)) * 100)),
            ...(completionTime ? { courseCompletedAt: completionTime } : {}),
            updatedAt: new Date().toISOString()
          };
          
          setUserProfile(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(profile));
            if (isDev) {
              localStorage.setItem('klu_active_dev_id', studentId);
            }
          }

          // Keep remote in sync with the merged state and set active presence
          setDoc(userRef, {
            name: profile.name || profile.displayName,
            displayName: profile.displayName || profile.name,
            email: profile.email,
            studentId: profile.studentId,
            college: profile.college || 'KLU',
            role: isDev ? 'developer' : (profile.role || 'student'),
            completedModules: mergedModules,
            totalXP: profile.totalXP,
            xp: profile.xp,
            completedUnits: profile.completedUnits,
            modulesCompleted: mergedModules.length,
            overallProgress: profile.overallProgress,
            ...(profile.courseCompletedAt ? { courseCompletedAt: profile.courseCompletedAt } : {}),
            isOnline: true,
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(() => {});
        }
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
            setUserProfile((prev) => prev ? { ...prev, ...liveData } : liveData);
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
          if (k && (k.startsWith('klu_profile_') || k.startsWith('quiz_') || k.startsWith('netquest_progress_') || k.startsWith('klu_completed_'))) {
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
          if (parsed.resetEpoch === GLOBAL_RESET_EPOCH && (parsed.totalXP || 0) < 9000 && parsed.completedUnits !== 3 && (parsed.streak || 0) < 90) {
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
          if (profile.resetEpoch !== GLOBAL_RESET_EPOCH) {
            localStorage.removeItem(`klu_profile_${activeStudentId}`);
            localStorage.removeItem('klu_active_student_id');
          } else {
            const syntheticUser: any = {
              uid: profile.uid,
              email: profile.email,
              displayName: profile.name || profile.displayName,
              emailVerified: true,
              getIdToken: async () => `token_${profile.uid}`,
            };
            setCurrentUser(syntheticUser);
            setUserProfile(profile);
            setLoading(false);
          }
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
          if (!KLU_EMAIL_REGEX.test(email)) {
            await signOut(auth);
            setShowDomainError(true);
            setAuthError('Access restricted: Only official KLU email addresses (@klu.ac.in) are allowed.');
            return;
          }
          await syncAndFetchProfile(result.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth result error:', err);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = (user.email || '').toLowerCase().trim();
        const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com');
        if (isGoogle && !KLU_EMAIL_REGEX.test(email)) {
          await signOut(auth);
          setShowDomainError(true);
          setAuthError('Access restricted: Only official KLU email addresses (@klu.ac.in) are allowed.');
          return;
        }
        setCurrentUser(user);
        syncAndFetchProfile(user);
      } else {
        const hasDev = typeof window !== 'undefined' && localStorage.getItem('klu_active_dev_id');
        const hasLocal = typeof window !== 'undefined' && localStorage.getItem('klu_active_student_id');
        if (!hasDev && !hasLocal) {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    });

    // Safety timeout: ensure BootTerminal never hangs longer than 2.5 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribeAuth();
    };
  }, []);

  const resetStudentPassword = async (idOrEmail: string, newPassword: string) => {
    setAuthError(null);
    const cleanInput = idOrEmail.trim();
    if (!cleanInput) {
      const msg = 'Please enter your KLU Student ID or Roll Number.';
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
    const studentId = rosterStudent ? rosterStudent.studentId : extractStudentId(cleanInput.includes('@') ? cleanInput : `${cleanInput}@klu.ac.in`);
    const uid = `klu_${studentId}`;

    if (typeof window !== 'undefined') {
      localStorage.setItem(`klu_pwd_${studentId}`, cleanPassword);
    }

    try {
      const userRef = doc(db, 'students', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, { portalPassword: cleanPassword, updatedAt: serverTimestamp() });
      }
    } catch (err) {
      console.warn('Firestore password reset fallback:', err);
    }
  };

  const loginWithStudentId = async (idOrEmail: string, password?: string, studentName?: string) => {
    setAuthError(null);
    const cleanInput = idOrEmail.trim();
    if (!cleanInput) {
      const msg = 'Please enter your Student ID (format: 992400xxxxx).';
      setAuthError(msg);
      throw new Error(msg);
    }

    // Match against enrolled student roster or 992400xxxxx format
    const rosterStudent = findStudentCredential(cleanInput);
    const isFormat = /^992400\d{5}(@klu\.ac\.in)?$/i.test(cleanInput);

    if (!rosterStudent && !isFormat) {
      const msg = 'Invalid Student ID. Student ID must be an 11-digit number in the format 992400xxxxx (e.g. 99240040116).';
      setAuthError(msg);
      throw new Error(msg);
    }

    const email = rosterStudent ? rosterStudent.email : (cleanInput.includes('@') ? cleanInput : `${cleanInput}@klu.ac.in`);
    const studentId = rosterStudent ? rosterStudent.studentId : extractStudentId(email);

    // Password verification: strictly sid@ + last 5 digits of Student ID
    const last5 = studentId.slice(-5);
    const expectedPassword = `sid@${last5}`;
    const cleanPassword = (password || '').trim();

    if (!cleanPassword) {
      const msg = `Please enter your password (format: sid@${last5}).`;
      setAuthError(msg);
      throw new Error(msg);
    }

    const isMatch = cleanPassword.toLowerCase() === expectedPassword.toLowerCase() ||
                    (rosterStudent && rosterStudent.password.toLowerCase() === cleanPassword.toLowerCase());

    if (!isMatch) {
      const msg = `Invalid password. Your password is sid@ followed by the last 5 digits of your Student ID (e.g. sid@${last5}).`;
      setAuthError(msg);
      throw new Error(msg);
    }

    // If ID belongs to an authorized developer, route through developer login automatically!
    if (isAuthorizedDeveloper(studentId) || isAuthorizedDeveloper(email)) {
      await loginWithDeveloperId(studentId, password);
      return;
    }

    // Password persistence with new password
    const pwdStorageKey = `klu_pwd_${studentId}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(pwdStorageKey, expectedPassword);
    }

    const name = studentName || (rosterStudent ? rosterStudent.name : `Student (${studentId})`);
    const uid = `klu_${studentId}`;

    const syntheticUser: any = {
      uid,
      email,
      displayName: name,
      emailVerified: true,
      getIdToken: async () => `token_${uid}`,
    };

    const storageKey = `klu_profile_${studentId}`;
    const zeroState = createZeroStudentState(uid, email, name, 'student');
    let profile: UserProfileData = zeroState;

    // Sanitize any stale local storage key
    const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.resetEpoch === GLOBAL_RESET_EPOCH && parsed.role !== 'developer' && (parsed.totalXP || 0) < 9000) {
          profile = { ...zeroState, ...parsed, role: 'student', studentId };
        } else {
          if (typeof window !== 'undefined') localStorage.removeItem(storageKey);
          profile = zeroState;
        }
      } catch {
        profile = zeroState;
      }
    }

    // Connect to real-time Firestore database
    try {
      const userRef = doc(db, 'students', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const remoteData = snap.data() as any;
        // All passwords unlocked - update portal password in Firestore if provided
        if (password) {
          try {
            await updateDoc(userRef, { portalPassword: password.trim(), updatedAt: serverTimestamp() });
          } catch (e) {
            // Firestore update fallback
          }
        }

        // Reset if remote doc has pre-reset epoch or developer permissions
        const needsReset = remoteData.resetEpoch !== GLOBAL_RESET_EPOCH ||
          remoteData.role === 'developer' || 
          (remoteData.totalXP || 0) >= 9000;

        if (needsReset) {
          console.warn("Resetting student doc to zeroState in Firestore:", uid);
          await setDoc(userRef, { 
            ...zeroState, 
            uid,
            studentId,
            role: 'student',
            resetEpoch: GLOBAL_RESET_EPOCH,
            ...(password ? { portalPassword: password.trim() } : {}),
            updatedAt: serverTimestamp() 
          });
          profile = zeroState;
        } else {
          profile = {
            ...zeroState,
            ...remoteData,
            role: 'student',
            studentId,
            resetEpoch: GLOBAL_RESET_EPOCH,
          };
        }
      } else {
        profile = zeroState;
      }

      // Update real-time presence, login timestamp, and synced profile in Firestore
      const liveLoginPayload = {
        uid,
        studentId,
        name: profile.name || profile.displayName || `KLU Student (${studentId})`,
        displayName: profile.displayName || profile.name || `KLU Student (${studentId})`,
        email: profile.email || `${studentId}@klu.ac.in`,
        college: profile.college || 'KLU',
        role: 'student',
        totalXP: profile.totalXP || 0,
        xp: profile.xp || 0,
        overallProgress: profile.overallProgress || 0,
        modulesCompleted: profile.modulesCompleted || (profile.completedModules || []).length,
        completedModules: profile.completedModules || [],
        streak: profile.streak ?? 0,
        isOnline: true,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(password ? { portalPassword: password.trim() } : {})
      };
      await setDoc(userRef, liveLoginPayload, { merge: true });
    } catch (err: any) {
      if (err?.message?.includes('Incorrect password')) {
        throw err;
      }
      console.warn("Firestore sync in loginWithStudentId fallback:", err);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_dev_id');
      localStorage.setItem('klu_active_student_id', studentId);
      localStorage.setItem(storageKey, JSON.stringify(profile));
    }

    setCurrentUser(syntheticUser);
    setUserProfile(profile);

    // Attach real-time snapshot listener on the user's Firestore document
    try {
      const userRef = doc(db, 'students', uid);
      if (userDocUnsubRef.current) {
        userDocUnsubRef.current();
        userDocUnsubRef.current = null;
      }
      userDocUnsubRef.current = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const liveData = docSnap.data() as any;
          if (liveData.role === 'developer' || (liveData.totalXP || 0) >= 9000) return;
          setUserProfile((prev) => prev ? { ...prev, ...liveData, role: 'student' } : liveData);
        }
      }, (err) => {
        console.warn('[Firestore] Student onSnapshot handled error:', err);
      });
    } catch (e) {
      console.warn("Could not attach real-time listener to student doc:", e);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account',
        hd: 'klu.ac.in'
      });
      
      let user: User | null = null;
      try {
        const cred = await signInWithPopup(auth, provider);
        user = cred.user;
      } catch (popupErr: any) {
        // If popup was blocked by the browser or restricted in iframe, fallback to redirect
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
          console.info('Sign-in popup was blocked or cancelled, falling back to signInWithRedirect...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
      
      if (!user || !user.email) {
        throw new Error('No valid email found on this Google account.');
      }

      const email = user.email.toLowerCase().trim();
      if (!KLU_EMAIL_REGEX.test(email)) {
        await signOut(auth);
        setShowDomainError(true);
        const domainMsg = 'Access restricted: Only official KLU email addresses (@klu.ac.in) are allowed.';
        setAuthError(domainMsg);
        throw new Error(domainMsg);
      }
      
      // Sync and establish profile immediately
      await syncAndFetchProfile(user);
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
    if (currentUser?.uid) {
      try {
        const userRef = doc(db, 'students', currentUser.uid);
        await updateDoc(userRef, {
          isOnline: false,
          lastLogout: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        // Offline or permission fallback
      }
    }
    if (userDocUnsubRef.current) {
      userDocUnsubRef.current();
      userDocUnsubRef.current = null;
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_student_id');
      localStorage.removeItem('klu_active_dev_id');
    }
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
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
    if (!currentUser) return;
    setUserProfile((prev) => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next && typeof window !== 'undefined' && next.studentId) {
        localStorage.setItem(`klu_profile_${next.studentId}`, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: next }));
      }
      return next;
    });
    try {
      const userRef = doc(db, 'students', currentUser.uid);
      await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Failed to update student profile in Firestore:', e);
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
    const courseCompletedAt = userProfile?.courseCompletedAt || (isCourseComplete ? new Date().toISOString() : undefined);

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
