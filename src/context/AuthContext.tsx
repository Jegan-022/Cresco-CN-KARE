import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  supabase, 
  isSupabaseConfigured, 
  toSupabaseStudentRow, 
  fromSupabaseStudentRow 
} from '../lib/supabase';
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

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  getIdToken?: () => Promise<string>;
}

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
  currentUser: AuthUser | null;
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDomainError, setShowDomainError] = useState(false);
  const channelRef = useRef<any>(null);
  const clearAuthError = () => setAuthError(null);

  // Fetch current student's profile from Supabase with resilient local fallback
  const syncAndFetchProfile = async (user: AuthUser, fallbackName?: string, fallbackRole?: 'student' | 'teacher' | 'developer') => {
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

    // 2. Sync with Supabase Database
    if (isSupabaseConfigured()) {
      try {
        const { data: remoteRow, error } = await supabase
          .from('students')
          .select('*')
          .eq('uid', user.uid)
          .maybeSingle();

        if (error || !remoteRow) {
          // Document doesn't exist yet: insert initial profile
          const payload = toSupabaseStudentRow({
            ...currentProfile,
            uid: user.uid,
            isOnline: true,
            lastLogin: new Date().toISOString(),
          });
          await supabase.from('students').upsert(payload);
          setUserProfile(currentProfile);
        } else {
          const remoteData = fromSupabaseStudentRow(remoteRow);

          const needsReset = 
            remoteData.resetEpoch !== GLOBAL_RESET_EPOCH ||
            (remoteData.totalXP || 0) >= 9000 || 
            (remoteData.streak || 0) >= 90 || 
            (remoteData.completedUnits >= 3 && (remoteData.completedModules || []).length === 0);

          if (needsReset) {
            console.warn("Resetting student profile to scratch in Supabase:", user.uid);
            const resetPayload = toSupabaseStudentRow({
              ...zeroState,
              uid: user.uid,
              studentId,
              role: isDev ? 'developer' : (remoteData.role || 'student'),
              resetEpoch: GLOBAL_RESET_EPOCH,
              updatedAt: new Date().toISOString()
            });
            await supabase.from('students').upsert(resetPayload);
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

            // Keep Supabase in sync with merged state
            await supabase.from('students').upsert(toSupabaseStudentRow({
              ...profile,
              isOnline: true,
              lastLogin: new Date().toISOString(),
            }));
          }
        }

        // Attach Realtime listener for active user row
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        channelRef.current = supabase
          .channel(`student_realtime_${user.uid}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'students',
              filter: `uid=eq.${user.uid}`,
            },
            (payload) => {
              if (payload.new) {
                const liveData = fromSupabaseStudentRow(payload.new);
                if (!isDev && (liveData.role === 'developer' || (liveData.totalXP || 0) >= 9000)) return;
                setUserProfile((prev) => prev ? { ...prev, ...liveData } : liveData);
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.warn('Supabase profile sync fallback (using local cache):', error);
        setUserProfile(currentProfile);
      }
    }

    setLoading(false);
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
      const syntheticDevUser: AuthUser = {
        uid,
        email: devInfo.email || `${activeDevId.toLowerCase()}@klu.ac.in`,
        displayName: devInfo.name,
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
            const syntheticUser: AuthUser = {
              uid: profile.uid,
              email: profile.email,
              displayName: profile.name || profile.displayName,
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

    // Supabase auth state change listener
    let authListener: any = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const email = (session.user.email || '').toLowerCase().trim();
          if (!KLU_EMAIL_REGEX.test(email)) {
            await supabase.auth.signOut();
            setShowDomainError(true);
            setAuthError('Access restricted: Only official KLU email addresses (@klu.ac.in) are allowed.');
            return;
          }

          const authUser: AuthUser = {
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || email.split('@')[0],
            getIdToken: async () => session.access_token,
          };
          setCurrentUser(authUser);
          syncAndFetchProfile(authUser);
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
      authListener = data?.subscription;
    }

    // Safety timeout: ensure loader never hangs longer than 2.5 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearTimeout(safetyTimer);
      if (authListener) authListener.unsubscribe();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
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

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({ portal_password: cleanPassword, updated_at: new Date().toISOString() })
          .eq('uid', uid);
      } catch (err) {
        console.warn('Supabase password reset fallback:', err);
      }
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

    // If ID belongs to an authorized developer, route through developer login automatically
    if (isAuthorizedDeveloper(studentId) || isAuthorizedDeveloper(email)) {
      await loginWithDeveloperId(studentId, password);
      return;
    }

    // Password persistence with expected password
    const pwdStorageKey = `klu_pwd_${studentId}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(pwdStorageKey, expectedPassword);
    }

    const name = studentName || (rosterStudent ? rosterStudent.name : `Student (${studentId})`);
    const uid = `klu_${studentId}`;

    const syntheticUser: AuthUser = {
      uid,
      email,
      displayName: name,
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

    // Connect to Supabase database
    if (isSupabaseConfigured()) {
      try {
        const { data: remoteRow } = await supabase
          .from('students')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();

        if (remoteRow) {
          const remoteData = fromSupabaseStudentRow(remoteRow);
          const needsReset = remoteData.resetEpoch !== GLOBAL_RESET_EPOCH ||
            remoteData.role === 'developer' || 
            (remoteData.totalXP || 0) >= 9000;

          if (needsReset) {
            console.warn("Resetting student doc to zeroState in Supabase:", uid);
            await supabase.from('students').upsert(toSupabaseStudentRow({
              ...zeroState,
              uid,
              studentId,
              role: 'student',
              resetEpoch: GLOBAL_RESET_EPOCH,
              portalPassword: password?.trim(),
              updatedAt: new Date().toISOString(),
            }));
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
        }

        // Update active presence and lastLogin in Supabase
        await supabase.from('students').upsert(toSupabaseStudentRow({
          ...profile,
          uid,
          studentId,
          isOnline: true,
          lastLogin: new Date().toISOString(),
          portalPassword: password?.trim(),
        }));
      } catch (err) {
        console.warn("Supabase sync in loginWithStudentId fallback:", err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_dev_id');
      localStorage.setItem('klu_active_student_id', studentId);
      localStorage.setItem(storageKey, JSON.stringify(profile));
    }

    setCurrentUser(syntheticUser);
    setUserProfile(profile);

    // Attach Realtime listener to student's record
    if (isSupabaseConfigured()) {
      try {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        channelRef.current = supabase
          .channel(`student_realtime_${uid}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'students',
              filter: `uid=eq.${uid}`,
            },
            (payload) => {
              if (payload.new) {
                const liveData = fromSupabaseStudentRow(payload.new);
                if (liveData.role === 'developer' || (liveData.totalXP || 0) >= 9000) return;
                setUserProfile((prev) => prev ? { ...prev, ...liveData, role: 'student' } : liveData);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn("Could not attach real-time listener to student doc:", e);
      }
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase authentication is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            hd: 'klu.ac.in',
          },
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      const message = err?.message || 'An error occurred during Google Sign-In.';
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

    if (!isSupabaseConfigured()) {
      // Fallback: check against student roster if Supabase keys not set yet
      const roster = findStudentCredential(trimmedEmail);
      if (roster && roster.password === pass) {
        await loginWithStudentId(roster.studentId, pass, roster.name);
        return;
      }
      throw new Error('Supabase is not configured yet. Please log in using your 11-digit Student ID.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const authUser: AuthUser = {
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0],
          getIdToken: async () => data.session?.access_token || '',
        };
        await syncAndFetchProfile(authUser);
      }
    } catch (err: any) {
      const message = err?.message || 'Invalid email or password.';
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

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please use your Student ID to sign in directly.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: {
            display_name: name.trim(),
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const studentName = name.trim();
        const authUser: AuthUser = {
          uid: data.user.id,
          email: data.user.email,
          displayName: studentName,
          getIdToken: async () => data.session?.access_token || '',
        };
        await syncAndFetchProfile(authUser, studentName, role);
      }
    } catch (err: any) {
      const message = err?.message || 'Registration failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setAuthError(null);
    if (currentUser?.uid && isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({
            is_online: false,
            last_logout: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('uid', currentUser.uid);
      } catch (e) {
        // Fallback
      }
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_student_id');
      localStorage.removeItem('klu_active_dev_id');
    }

    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
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

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured yet. Please reset using your student ID.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      if (error) throw error;
    } catch (err: any) {
      const message = err?.message || 'Password reset request failed.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithDeveloperId = async (developerId: string, password?: string) => {
    setAuthError(null);
    const cleanId = developerId.trim() || '285';
    const devInfo = getDeveloperProfile(cleanId);
    const uid = `dev_${devInfo.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const syntheticUser: AuthUser = {
      uid,
      email: devInfo.email || `${cleanId.toLowerCase()}@klu.ac.in`,
      displayName: devInfo.name,
      getIdToken: async () => `dev_token_${uid}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('klu_active_student_id');
      localStorage.setItem('klu_active_dev_id', devInfo.id);
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

    await syncAndFetchProfile(syntheticUser, devInfo.name, 'developer');
  };

  const resetStudentCourse = async (
    studentUidOrId: string, 
    options?: { resetXP?: boolean }
  ): Promise<{ success: boolean; message: string }> => {
    const resetXP = options?.resetXP ?? false;
    try {
      const resetPayload: any = {
        completed_modules: [],
        completed_steps: [],
        overall_progress: 0,
        unit3_progress: 0,
        unit4_progress: 0,
        unit5_progress: 0,
        modules_completed: 0,
        lessons_completed: 0,
        completed_units: 0,
        current_unit: 3,
        current_module: 'u3_m01',
        last_lesson: null,
        unlocked_units: ['unit_3', 'unit-3'],
        course_completed_at: null,
        updated_at: new Date().toISOString(),
      };

      if (resetXP) {
        resetPayload.total_xp = 0;
        resetPayload.xp = 0;
        resetPayload.streak = 0;
      }

      if (isSupabaseConfigured()) {
        await supabase
          .from('students')
          .update(resetPayload)
          .eq('uid', studentUidOrId);
      }

      if (typeof window !== 'undefined') {
        const targetStudentId = studentUidOrId.replace('klu_', '');
        localStorage.removeItem(`klu_profile_${targetStudentId}`);
        if (localStorage.getItem('klu_active_student_id') === targetStudentId) {
          if (userProfile?.studentId === targetStudentId) {
            setUserProfile(prev => prev ? { 
              ...prev, 
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
              courseCompletedAt: undefined,
              ...(resetXP ? { totalXP: 0, xp: 0, streak: 0 } : {}),
              updatedAt: new Date().toISOString() 
            } : null);
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

    if (isSupabaseConfigured()) {
      try {
        const row = toSupabaseStudentRow(updates);
        await supabase
          .from('students')
          .update(row)
          .eq('uid', currentUser.uid);
      } catch (e) {
        console.warn('Failed to update student profile in Supabase:', e);
      }
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

    setUserProfile(prev => prev ? { ...prev, ...payload } : null);
    if (typeof window !== 'undefined' && userProfile.studentId) {
      const updatedFull = { ...userProfile, ...payload };
      localStorage.setItem(`klu_profile_${userProfile.studentId}`, JSON.stringify(updatedFull));
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updatedFull }));
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({
            completed_steps: nextSteps,
            total_xp: nextXP,
            xp: nextXP,
            updated_at: new Date().toISOString(),
          })
          .eq('uid', currentUser.uid);
      } catch (err) {
        console.warn('awardStepXP Supabase sync error:', err);
      }
    }

    return { success: true, duplicate: false };
  };

  // Record completed module with duplicate completion protection, local storage persistence, and resilient Supabase upsert
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

    // 3. Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .upsert(toSupabaseStudentRow(updatedProfile));

        // Also record in lesson_completions table
        await supabase
          .from('lesson_completions')
          .upsert({
            user_id: currentUser.uid,
            lesson_id: moduleId,
            completed: true,
            xp_earned: moduleXp,
            completed_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn("Failed to record module completion in Supabase:", err);
      }
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
    
    const newBest = Math.max(bestScore, scorePercent);
    const newScores = { ...currentScores, [categoryId]: newBest };
    
    const payload: Partial<UserProfileData> = {
      practiceScores: newScores,
      totalXP: (userProfile.totalXP || 0) + xpBonus,
      xp: (userProfile.xp || 0) + xpBonus,
      updatedAt: new Date().toISOString(),
    };
    
    setUserProfile(prev => prev ? { ...prev, ...payload } : null);
    if (typeof window !== 'undefined' && userProfile.studentId) {
      const updatedFull = { ...userProfile, ...payload };
      localStorage.setItem(`klu_profile_${userProfile.studentId}`, JSON.stringify(updatedFull));
      window.dispatchEvent(new CustomEvent('netquest_profile_updated', { detail: updatedFull }));
    }
    
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('students')
          .update({
            practice_scores: newScores,
            total_xp: (userProfile.totalXP || 0) + xpBonus,
            xp: (userProfile.xp || 0) + xpBonus,
            updated_at: new Date().toISOString(),
          })
          .eq('uid', currentUser.uid);
      } catch (e) {
        console.warn("Failed to persist practice score in Supabase:", e);
      }
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 animate-in fade-in duration-200">
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
