/**
 * Cresco CN - Firestore NoSQL Database Schema Definitions
 * 
 * Top-level collections:
 * 1.  courses
 * 2.  units
 * 3.  levels
 * 4.  lessons
 * 5.  concepts
 * 6.  questions
 * 7.  flashcards
 * 8.  activities
 * 9.  missions
 * 10. bosses
 * 11. users
 * 12. userProgress
 * 13. userMastery
 * 14. quizAttempts
 * 15. achievements
 */

export interface CourseDocument {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  semester?: string;
  totalUnits: number;
  totalModules: number;
  totalXP: number;
  thumbnailUrl?: string;
  syllabusUrl?: string;
  units: string[]; // references to unit document IDs
  createdAt: string;
  updatedAt: string;
}

export interface UnitDocument {
  id: string; // e.g. "unit-3", "unit-4", "unit-5"
  courseId: string;
  unitNumber: number;
  title: string;
  description: string;
  totalModules: number;
  totalXP: number;
  icon?: string;
  color?: string;
  order: number;
  prerequisites?: string[];
  bossId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LevelDocument {
  id: string; // e.g. "level-1" ... "level-10"
  levelNumber: number;
  title: string;
  minXP: number;
  maxXP: number;
  badgeUrl?: string;
  iconName?: string;
  colorHex?: string;
  rewards: {
    title: string;
    perk: string;
  };
}

export interface LessonDocument {
  id: string; // e.g. "u3_m1"
  unitId: string; // e.g. "unit-3"
  courseId?: string;
  title: string;
  order: number;
  durationMinutes: number;
  xpReward: number;
  simulatorType?: string;
  pedagogy: {
    hook: string;
    analogy: string;
    concept: string;
    visualNotes?: string;
  };
  keyTakeaways: string[];
  mediaAssets?: {
    diagramUrl?: string;
    videoUrl?: string;
    pdfSlidesUrl?: string;
    animationUrl?: string;
  };
  quizCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptDocument {
  id: string; // e.g. "concept_ipv4_addressing"
  unitId: string;
  lessonId: string;
  term: string;
  definition: string;
  analogy?: string;
  keyPoints: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  diagramUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface QuestionDocument {
  id: string; // e.g. "q_u3_m1_1"
  unitId: string;
  lessonId?: string;
  quizType: 'module_quiz' | 'practice_drill' | 'unit_final_challenge';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  tags?: string[];
}

export interface FlashcardDocument {
  id: string;
  unitId: string;
  lessonId?: string;
  front: string;
  back: string;
  tag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audioPronunciationUrl?: string;
}

export interface ActivityDocument {
  id: string;
  unitId: string;
  lessonId?: string;
  type: 'packet_tracer' | 'subnet_calculator' | 'router_cli' | 'protocol_analyzer' | 'drag_drop_topology';
  title: string;
  instructions: string;
  initialConfig?: Record<string, any>;
  solutionCriteria?: Record<string, any>;
  xpReward: number;
  estimatedMinutes: number;
}

export interface MissionDocument {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone';
  targetCount: number;
  metric: 'lessons_completed' | 'quizzes_perfect' | 'streak_days' | 'xp_earned';
  xpReward: number;
  badgeReward?: string;
  isDaily: boolean;
  active: boolean;
}

export interface BossDocument {
  id: string; // e.g. "boss_unit_3"
  unitId: string;
  bossName: string;
  title: string;
  description: string;
  avatarUrl?: string;
  hp: number;
  timeLimitSeconds: number;
  passPercentage: number;
  xpReward: number;
  badgeReward: string;
  questionIds: string[];
}

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  studentId: string;
  college: string;
  course: string;
  year?: string;
  section?: string;
  role: 'student' | 'teacher' | 'developer';
  photoURL?: string;
  totalXP: number;
  streak: number;
  currentLevel: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserProgressDocument {
  id: string; // usually userId or `${userId}_${courseId}`
  userId: string;
  courseId: string;
  completedUnits: string[];
  completedLessons: string[];
  currentUnit: string;
  currentLesson: string;
  overallProgressPercent: number;
  unitProgress: {
    unit3: number;
    unit4: number;
    unit5: number;
    [key: string]: number;
  };
  totalXP: number;
  streak: number;
  lastActiveAt: string;
  courseCompletedAt?: string | null;
}

export interface UserMasteryDocument {
  id: string; // `${userId}_${conceptId}`
  userId: string;
  conceptId: string;
  masteryScore: number; // 0 to 100
  reviewCount: number;
  correctCount: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface QuizAttemptDocument {
  id: string;
  userId: string;
  studentId?: string;
  quizId: string;
  unitId?: string;
  lessonId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  timeTakenSeconds?: number;
  completedAt: string;
}

export interface AchievementDocument {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'progress' | 'mastery' | 'streak' | 'challenge' | 'social';
  icon: string;
  badgeUrl?: string;
  xpReward: number;
  unlockedByDefault?: boolean;
}

/**
 * Union of all collection names for type-safety across queries and seeds
 */
export const FIRESTORE_COLLECTIONS = [
  'courses',
  'units',
  'levels',
  'lessons',
  'concepts',
  'questions',
  'flashcards',
  'activities',
  'missions',
  'bosses',
  'users',
  'userProgress',
  'userMastery',
  'quizAttempts',
  'achievements'
] as const;

export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[number];
