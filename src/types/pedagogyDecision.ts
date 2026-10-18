/**
 * CRESCO Pedagogy Decision Types - Engine v1
 *
 * Strongly typed contracts for deterministic evidence-based pedagogical evaluations.
 * Consumed by future application adaptation layers and faculty analytics.
 *
 * Core Boundaries:
 * - NO mastery assertions (mastery is [PENDING ACADEMIC REVIEW]).
 * - NO automatic remediation actions (progression control deferred to Step 9).
 * - NO XP adjustments or level lock mutations.
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/EVIDENCE_AGGREGATION_IMPLEMENTATION.md
 */

export type PedagogyDecisionType =
  | 'PREREQUISITE_GAP_SIGNAL_OBSERVED'
  | 'SIGNIFICANT_ERROR_PATTERN_OBSERVED'
  | 'PRACTICE_EVIDENCE_NEEDED'
  | 'HINT_DEPENDENCY_OBSERVED'
  | 'INDEPENDENT_SUCCESS_OBSERVED'
  | 'ASSESSMENT_EVIDENCE_AVAILABLE'
  | 'INSUFFICIENT_ASSESSMENT_EVIDENCE'
  | 'NEUTRAL_PROGRESSION';

export type PedagogicalErrorSignal =
  | 'CONCEPTUAL_ERROR_OBSERVED'
  | 'PREREQUISITE_GAP_SIGNAL_OBSERVED'
  | 'PROCEDURAL_ERROR_OBSERVED'
  | 'INTERPRETATION_ERROR_OBSERVED'
  | 'CARELESS_RESPONSE_PATTERN_OBSERVED'
  | 'FLUENCY_GAP_SIGNAL_OBSERVED';

export interface PedagogyFinding {
  code: PedagogyDecisionType | PedagogicalErrorSignal | string;
  category: 'prerequisite' | 'error' | 'practice' | 'independence' | 'assessment' | 'lifecycle';
  description: string;
  evidenceSnapshot: Record<string, unknown>;
}

export interface PedagogyContext {
  courseId?: string;
  unitId?: string;
  levelId?: string | number;
  lessonId?: string;
  activityId?: string;
  assessmentId?: string;
  targetScope?: 'course' | 'unit' | 'lesson' | 'assessment' | 'practice';
  evaluatedAt?: string;
}

export interface PedagogyDecision {
  decisionType: PedagogyDecisionType;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  scope: {
    studentId: string;
    courseId: string;
    unitId?: string;
    levelId?: string | number;
    lessonId?: string;
    activityId?: string;
    assessmentId?: string;
  };
  evidence: {
    totalEventsCount: number;
    lessonsCompleted: number;
    practiceAttempts: number;
    successfulPracticeAttempts: number;
    independentSuccessfulAttempts: number;
    hintsRequested: number;
    attemptsWithHints: number;
    assessmentAttempts: number;
    assessmentCompletions: number;
    successfulAttempts: number;
    bestScore?: number;
    latestScore?: number;
    observedErrorCount: number;
    observedMisconceptionCount: number;
  };
  findings: PedagogyFinding[];
  evaluatedAt?: string;
}

/**
 * ACADEMIC REVIEW BOUNDARY CONSTANTS
 *
 * The following values represent proposed rules currently pending formal academic review.
 * They are deliberately NOT applied as deterministic gates in Engine v1.
 * Reference: docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 */
export const PENDING_ACADEMIC_RULES = {
  FINAL_MASTERY_THRESHOLD_PERCENT: 85,          // [PENDING ACADEMIC REVIEW]
  LEVEL_RECOMMENDATION_THRESHOLD_PERCENT: 80,   // [PENDING ACADEMIC REVIEW]
  SUPPLEMENTAL_PRACTICE_BAND_LOW_PERCENT: 70,   // [PENDING ACADEMIC REVIEW]
  SUPPLEMENTAL_PRACTICE_BAND_HIGH_PERCENT: 75,  // [PENDING ACADEMIC REVIEW]
  HINT_XP_PENALTY_RATIO: 0.5,                   // [PENDING ACADEMIC REVIEW]
  POST_ASSESSMENT_COOLDOWN_MINUTES: 30,         // [PENDING ACADEMIC REVIEW]
} as const;
