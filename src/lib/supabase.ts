import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// Environment variables for Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') && 
    !supabaseUrl.includes('your-project-ref')
  );
};

// Resilient Supabase client with graceful fallback
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured() ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export interface SupabaseStudentRow {
  uid: string;
  student_id?: string;
  name?: string;
  display_name?: string;
  email?: string;
  college?: string;
  course?: string;
  academic_year?: string;
  section?: string;
  role?: string;
  total_xp?: number;
  xp?: number;
  overall_progress?: number;
  unit3_progress?: number;
  unit4_progress?: number;
  unit5_progress?: number;
  lessons_completed?: number;
  modules_completed?: number;
  completed_units?: number;
  quiz_attempts?: number;
  quiz_average?: number;
  practice_scores?: Record<string, number>;
  streak?: number;
  current_unit?: number;
  current_module?: string;
  last_lesson?: string | null;
  completed_modules?: string[];
  completed_steps?: string[];
  unlocked_units?: string[];
  is_online?: boolean;
  portal_password?: string;
  reset_epoch?: string;
  course_completed_at?: string | null;
  last_login?: string | null;
  last_logout?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Convert app student object to Supabase database row
export const toSupabaseStudentRow = (data: any): SupabaseStudentRow => {
  return {
    uid: data.uid,
    student_id: data.studentId || data.student_id,
    name: data.name || data.displayName,
    display_name: data.displayName || data.name,
    email: data.email,
    college: data.college || 'KLU',
    course: data.course || 'Computer Networks',
    academic_year: data.year || data.academic_year || '3rd Year',
    section: data.section || 'CSE-A',
    role: data.role || 'student',
    total_xp: data.totalXP ?? data.total_xp ?? data.xp ?? 0,
    xp: data.xp ?? data.totalXP ?? data.total_xp ?? 0,
    overall_progress: data.overallProgress ?? data.overall_progress ?? 0,
    unit3_progress: data.unit3Progress ?? data.unit3_progress ?? 0,
    unit4_progress: data.unit4Progress ?? data.unit4_progress ?? 0,
    unit5_progress: data.unit5Progress ?? data.unit5_progress ?? 0,
    lessons_completed: data.lessonsCompleted ?? data.lessons_completed ?? 0,
    modules_completed: data.modulesCompleted ?? data.modules_completed ?? (data.completedModules?.length || 0),
    completed_units: data.completedUnits ?? data.completed_units ?? 0,
    quiz_attempts: data.quizAttempts ?? data.quiz_attempts ?? 0,
    quiz_average: data.quizAverage ?? data.quiz_average ?? 0,
    practice_scores: data.practiceScores ?? data.practice_scores ?? {},
    streak: data.streak ?? 0,
    current_unit: data.currentUnit ?? data.current_unit ?? 3,
    current_module: data.currentModule ?? data.current_module ?? 'u3_m01',
    last_lesson: data.lastLesson ?? data.last_lesson ?? null,
    completed_modules: data.completedModules ?? data.completed_modules ?? [],
    completed_steps: data.completedSteps ?? data.completed_steps ?? [],
    unlocked_units: data.unlockedUnits ?? data.unlocked_units ?? ['unit_3', 'unit-3'],
    is_online: data.isOnline ?? data.is_online ?? false,
    portal_password: data.portalPassword ?? data.portal_password,
    reset_epoch: data.resetEpoch ?? data.reset_epoch ?? '2026_09_RESET_SCRATCH_V1',
    course_completed_at: data.courseCompletedAt ?? data.course_completed_at ?? null,
    last_login: data.lastLogin ?? data.last_login ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Convert Supabase database row to app format
export const fromSupabaseStudentRow = (row: any): any => {
  if (!row) return null;
  return {
    uid: row.uid,
    studentId: row.student_id || row.studentId || row.uid.replace(/^klu_/, ''),
    name: row.name || row.display_name || 'Student',
    displayName: row.display_name || row.name || 'Student',
    email: row.email,
    college: row.college || 'KLU',
    course: row.course || 'Computer Networks',
    year: row.academic_year || row.year || '3rd Year',
    section: row.section || 'CSE-A',
    role: row.role || 'student',
    totalXP: Number(row.total_xp ?? row.totalXP ?? row.xp ?? 0),
    xp: Number(row.xp ?? row.total_xp ?? 0),
    overallProgress: Number(row.overall_progress ?? row.overallProgress ?? 0),
    unit3Progress: Number(row.unit3_progress ?? row.unit3Progress ?? 0),
    unit4Progress: Number(row.unit4_progress ?? row.unit4Progress ?? 0),
    unit5Progress: Number(row.unit5_progress ?? row.unit5Progress ?? 0),
    lessonsCompleted: Number(row.lessons_completed ?? row.lessonsCompleted ?? 0),
    modulesCompleted: Number(row.modules_completed ?? row.modulesCompleted ?? 0),
    completedUnits: Number(row.completed_units ?? row.completedUnits ?? 0),
    quizAttempts: Number(row.quiz_attempts ?? row.quizAttempts ?? 0),
    quizAverage: Number(row.quiz_average ?? row.quizAverage ?? 0),
    practiceScores: row.practice_scores || row.practiceScores || {},
    streak: Number(row.streak ?? 0),
    currentUnit: Number(row.current_unit ?? row.currentUnit ?? 3),
    currentModule: row.current_module || row.currentModule || 'u3_m01',
    lastLesson: row.last_lesson ?? row.lastLesson ?? null,
    completedModules: Array.isArray(row.completed_modules) ? row.completed_modules : (row.completedModules || []),
    completedSteps: Array.isArray(row.completed_steps) ? row.completed_steps : (row.completedSteps || []),
    unlockedUnits: Array.isArray(row.unlocked_units) ? row.unlocked_units : (row.unlockedUnits || ['unit_3', 'unit-3']),
    isOnline: Boolean(row.is_online ?? row.isOnline),
    portalPassword: row.portal_password || row.portalPassword,
    resetEpoch: row.reset_epoch || row.resetEpoch,
    courseCompletedAt: row.course_completed_at || row.courseCompletedAt,
    lastLogin: row.last_login || row.lastLogin,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
};

// Real-time helper to subscribe to table changes
export const subscribeToTable = (
  table: string, 
  callback: () => void
): (() => void) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel: RealtimeChannel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn(`Realtime subscription fallback on table ${table}:`, err);
    return () => {};
  }
};
