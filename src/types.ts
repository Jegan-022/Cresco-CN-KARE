export type NavTab = 
  | 'home'
  | 'welcome'
  | 'learn-map'
  | 'courses'
  | 'lesson-player'
  | 'drag-drop'
  | 'simulator'
  | 'boss-challenge'
  | 'daily-challenge'
  | 'practice'
  | 'review'
  | 'exam'
  | 'settings'
  | 'streak'
  | 'level'
  | 'achievements'
  | 'leaderboard'
  | 'profile'
  | 'challenges'
  | 'my-learning'
  | 'teacher-dashboard'
  | 'live-classroom'
  | 'learn'
  | 'lab'
  | 'quiz-and-practice'
  | 'quiz'
  | 'analytics'
  | 'developer-dashboard'
  | '403'
  | '404'
  | 'companion-select'
  | 'guidemaster-select'
  | 'guidemaster-tutor'
  | 'prelaunch'
  | 'landing';

export interface LearningNode {
  id: string;
  nodeCode: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  score?: number;
  xpReward: number;
  timeRemaining?: string;
  labsDone?: number;
  completedDate?: string;
  prereq?: string;
  tag?: string;
  stage?: {
    current: number;
    total: number;
    label: string;
  };
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  isCurrentUser?: boolean;
  role: string;
  badge?: string;
  recentActivity?: string;
}

export interface BlitzQuestion {
  id: number;
  title: string;
  hexDump: string[];
  protocol: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  progress?: {
    current: number;
    target: number;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export type UserRole = 'student' | 'teacher' | 'developer';

export type LessonType = 'video' | 'interactive' | 'reading' | 'quiz';

export interface Lesson {
  id: string;
  sectionId: number;
  title: string;
  duration: string;
  type: LessonType;
  completed: boolean;
  isCurrent?: boolean;
  locked?: boolean;
  overview?: string;
  keyTakeaway?: string;
  notes?: string;
  resources?: { name: string; url?: string; type: string }[];
}

export interface CourseSection {
  id: number;
  title: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  isExpanded?: boolean;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  instructorTitle: string;
  instructorAvatar: string;
  rating: number;
  studentsCount: number;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  currentLessonId: string;
  currentLessonTitle: string;
  lastAccessed: string;
  sectionsCount: number;
  thumbnail?: string;
  category: string;
  description: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  lessonNumber: number;
  totalLessons: number;
  courseTitle: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface PracticeCategory {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  accuracyPercent: number;
  questions: QuizQuestion[];
}

export interface LeaderboardStudent {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  progress: number;
  isCurrentUser?: boolean;
  recentLesson?: string;
  courseCompletedAt?: string;
  finisherRank?: number;
}

export interface StudentProfile {
  name: string;
  email: string;
  avatar: string;
  major: string;
  university: string;
  enrolledCourse: string;
  level: number;
  xp: number;
  courseProgressPercent: number;
  quizAccuracyPercent: number;
  lessonsCompletedCount: number;
  learningStreakDays: number;
  recentActivity: {
    date: string;
    action: string;
    target: string;
  }[];
}

export interface TeacherMetric {
  totalStudents: number;
  activeStudents: number;
  avgProgressPercent: number;
  avgQuizScorePercent: number;
  currentlyLearning: number;
  takingQuiz: number;
  idle: number;
}

export interface LiveQuestionOption {
  id: string;
  label: string;
  text: string;
  votes: number;
  percentage: number;
  isCorrect: boolean;
}

export interface LiveClassroomState {
  isActive: boolean;
  connectedCount: number;
  totalEnrolled: number;
  currentQuestion: string;
  options: LiveQuestionOption[];
  isAnswerRevealed: boolean;
  userVotedOptionId?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Course' | 'Lesson' | 'Topic' | 'Practice';
  targetTab: NavTab;
  lessonId?: string;
  sectionId?: number;
}

export interface ModulePedagogy {
  hook: string;
  analogy: string;
  concept: string;
  architecture?: string;
  keyTakeaways?: string[];
}

export interface PracticeDrillItem {
  prompt: string;
  solution: string;
  id?: string;
  title?: string;
  scenario?: string;
  type?: string;
  question?: string;
  answer?: string;
}

export interface ModuleQuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseModuleData {
  id: string;
  unitId: 'unit_3' | 'unit_4' | 'unit_5';
  title: string;
  xp: number;
  readTimeMinutes: number;
  code?: string;
  duration?: string;
  simulatorType?: string;
  isCustom?: boolean;
  pedagogy?: ModulePedagogy;
  keyTakeaways?: string[];
  interactiveCalculator?: {
    type: string;
    [key: string]: any;
  };
  learningObjectives?: string[];
  lesson?: {
    hook?: string;
    keyConcepts?: string[];
    takeaway?: string;
    deepDive?: {
      section1?: string;
      section2?: string;
    };
    visualization?: {
      type: string;
      description: string;
    };
    interactiveActivity?: {
      type: string;
      description: string;
    };
    quickCheck?: Array<{
      type: string;
      question: string;
    }>;
  };
  practice?: Array<{
    type?: string;
    question?: string;
    answer?: string;
  }>;
  practiceDrills?: PracticeDrillItem[];
  quiz: ModuleQuizItem[];
  completionRule?: {
    required?: string[];
    xp?: {
      lesson?: number;
      interactiveActivity?: number;
      quickCheck?: number;
      moduleCompletion?: number;
    };
    duplicateProtection?: boolean;
  };
}

export interface UnitFinalQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UnitFinalQuizData {
  id: string;
  title: string;
  questionCount: number;
  passPercentage: number;
  questions: UnitFinalQuizQuestion[];
}

export interface CourseUnitData {
  id: 'unit_3' | 'unit_4' | 'unit_5';
  title: string;
  icon?: string;
  color?: string;
  summary?: string;
  moduleCount: number;
  unlockRule?: string;
  passMark?: number;
  modules: CourseModuleData[];
  finalQuiz?: UnitFinalQuizData;
}

