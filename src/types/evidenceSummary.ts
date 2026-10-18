/**
 * CRESCO Learning Evidence Foundation - Canonical Evidence Summary Types
 *
 * Strongly typed structure representing aggregated, verifiable learning evidence.
 * Strictly objective and deterministic:
 * - NO mastery assertions (e.g. MASTERED, isMastered)
 * - NO pedagogical recommendations (e.g. nextAction, recommendedLesson)
 * - NO state transitions or level unlock decisions
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/LEARNING_EVIDENCE_IMPLEMENTATION.md
 */

export interface LessonEvidenceSummary {
  lessonId: string;
  unitId?: string;
  levelId?: string | number;
  startedCount: number;
  completedCount: number;
  isCompleted: boolean;
  firstStartedAt?: string;
  lastCompletedAt?: string;
  totalDurationMs?: number;
}

export interface ActivityEvidenceSummary {
  activityId: string;
  unitId?: string;
  lessonId?: string;
  startedCount: number;
  completedCount: number;
  lastInteractedAt?: string;
}

export interface AssessmentEvidenceSummary {
  assessmentId: string;
  unitId?: string;
  attemptsCount: number;
  completionsCount: number;
  successfulAttemptsCount: number;
  bestScore?: number;
  latestScore?: number;
  averageScore?: number;
  lastAttemptAt?: string;
}

export interface PracticeEvidenceSummary {
  activityId: string;
  attemptsCount: number;
  successfulAttemptsCount: number;
  bestScore?: number;
  latestScore?: number;
  averageScore?: number;
  hintsRequested: number;
  lastPracticedAt?: string;
}

export interface UnitEvidenceSummary {
  unitId: string;
  lessonsStarted: number;
  lessonsCompleted: number;
  simulationsCompleted: number;
  practiceCompleted: number;
  assessmentAttempts: number;
  assessmentCompletions: number;
  bestAssessmentScore?: number;
  latestAssessmentScore?: number;
  averageAssessmentScore?: number;
  firstActivityAt?: string;
  lastActivityAt?: string;
}

/**
 * Canonical LearnerEvidenceSummary
 * Output of the deterministic evidence aggregation layer.
 */
export interface LearnerEvidenceSummary {
  // Key Identity Scopes
  studentId: string;
  courseId: string;

  // Aggregate Activity / Completion Evidence
  lessonsStarted: number;
  lessonsCompleted: number;
  simulationsStarted: number;
  simulationsCompleted: number;
  practiceStarted: number;
  practiceCompleted: number;

  // Assessment Evidence
  assessmentAttempts: number;
  assessmentCompletions: number;
  successfulAttempts: number;
  bestScore?: number;
  latestScore?: number;
  averageScore?: number;

  // Practice Evidence
  practiceAttempts: number;
  successfulPracticeAttempts: number;
  bestPracticeScore?: number;
  latestPracticeScore?: number;
  averagePracticeScore?: number;

  // Independence Evidence
  hintsRequested: number;
  attemptsWithHints: number;
  independentSuccessfulAttempts: number;

  // Error & Misconception Evidence
  errorCategoriesObserved: Record<string, number>;
  misconceptionsObserved: Record<string, number>;

  // Temporal Evidence
  firstActivityAt?: string;
  lastActivityAt?: string;
  totalEventsCount: number;

  // Granular Scope Breakdowns
  unitBreakdown: Record<string, UnitEvidenceSummary>;
  lessonBreakdown: Record<string, LessonEvidenceSummary>;
  assessmentBreakdown: Record<string, AssessmentEvidenceSummary>;
  practiceBreakdown: Record<string, PracticeEvidenceSummary>;
  activityBreakdown: Record<string, ActivityEvidenceSummary>;
}
