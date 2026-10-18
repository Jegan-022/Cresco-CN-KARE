/**
 * CRESCO Learning Evidence Foundation - Canonical Event Types
 *
 * Strongly typed canonical data model for learning events across the CRESCO platform.
 * Supports append-only telemetry stream for student actions and future pedagogy evidence aggregation.
 * Reference: docs/CRESCO_PEDAGOGY_SPECIFICATION.md & docs/CRESCO_LEARNING_DATA_MODEL.md
 */

// Controlled Event Vocabulary according to the CRESCO Pedagogy Specification
export type LifecycleEventType =
  | 'COURSE_STARTED'
  | 'UNIT_STARTED'
  | 'LEVEL_STARTED'
  | 'LESSON_STARTED'
  | 'LESSON_COMPLETED';

export type LearningActivityEventType =
  | 'CONTENT_VIEWED'
  | 'EXAMPLE_VIEWED'
  | 'VISUAL_VIEWED'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_COMPLETED'
  | 'UNDERSTANDING_CHECK_STARTED'
  | 'UNDERSTANDING_CHECK_COMPLETED';

export type PracticeEventType =
  | 'PRACTICE_STARTED'
  | 'PRACTICE_COMPLETED'
  | 'DRILL_STARTED'
  | 'DRILL_COMPLETED'
  | 'HINT_REQUESTED';

export type AssessmentEventType =
  | 'ASSESSMENT_STARTED'
  | 'QUESTION_ANSWERED'
  | 'ASSESSMENT_COMPLETED';

export type AdaptationEventType =
  | 'FEEDBACK_VIEWED'
  | 'REMEDIATION_STARTED'
  | 'REMEDIATION_COMPLETED';

export type LearningEventType =
  | LifecycleEventType
  | LearningActivityEventType
  | PracticeEventType
  | AssessmentEventType
  | AdaptationEventType;

/**
 * Typed metadata structure containing optional, event-appropriate evidence.
 * Does not store sensitive authentication tokens, passwords, or PII.
 */
export interface LearningEventMetadata {
  correctness?: boolean;
  attemptNumber?: number;
  score?: number;
  questionId?: string;
  selectedAnswer?: string | number;
  correctAnswer?: string | number;
  practiceTier?: 'bronze' | 'silver' | 'gold' | 'diamond' | string;
  hintUsed?: boolean;
  durationMs?: number;
  errorCategory?: string;
  misconceptionTag?: string;
  simulationResult?: string | Record<string, unknown>;
  completionPercentage?: number;
  xpEarned?: number;
  [key: string]: unknown;
}

/**
 * Canonical LearningEvent Model
 * Append-only Firestore document schema stored under `/learning_events/{eventId}`.
 */
export interface LearningEvent {
  eventId: string;
  studentId: string;
  courseId: string;
  unitId?: string;
  levelId?: string | number;
  lessonId?: string;
  activityId?: string;
  assessmentId?: string;
  eventType: LearningEventType;
  timestamp: string; // ISO 8601 client timestamp
  sessionId: string;
  metadata?: LearningEventMetadata;
  serverTimestamp?: unknown; // Firestore FieldValue (FieldValue | Timestamp)
}

/**
 * Parameters accepted when recording a new learning event
 */
export interface RecordLearningEventParams {
  eventType: LearningEventType;
  courseId?: string;
  unitId?: string;
  levelId?: string | number;
  lessonId?: string;
  activityId?: string;
  assessmentId?: string;
  studentId?: string;
  sessionId?: string;
  metadata?: LearningEventMetadata;
}

/**
 * Result returned by the event recording service
 */
export interface RecordLearningEventResult {
  success: boolean;
  eventId?: string;
  error?: string;
}
