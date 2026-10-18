/**
 * CRESCO Production — Step 21 Mastery Engine Types
 * 
 * Canonical contracts for deterministic, evidence-based mastery evaluation.
 * Aligned with:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md (Sections 2, 9, 11, 13)
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 7: Canonical MasteryRecord Schema)
 * - src/types/evidenceSummary.ts
 * - src/types/pedagogyDecision.ts
 */

export type MasteryState =
  | 'not_started'
  | 'learning'
  | 'developing'
  | 'needs_support'
  | 'ready_for_assessment'
  | 'proficient'
  | 'mastered'
  | 'pending_policy'
  | 'insufficient_evidence';

export type AcademicPolicyStatus = 'approved' | 'pending_academic_approval';

/**
 * Configurable Academic Mastery Thresholds & Policy Rules
 */
export interface MasteryPolicyConfig {
  policyVersion: string;
  policyStatus: AcademicPolicyStatus;
  masteryThresholdPercent: number;          // Typically 85% [PENDING ACADEMIC REVIEW]
  proficiencyThresholdPercent: number;      // Typically 70% [EXISTING TECHNICAL RULE]
  minimumLessonsCompletedRatio: number;     // 1.0 = all lessons in scope must be completed
  minimumPracticeAttempts: number;          // Minimum practice attempts required
  maximumHintRelianceRatio: number;         // Max allowed attempts-with-hints / total-attempts (e.g. 0.3)
  requireSimulationsCompleted: boolean;     // Whether application/lab simulation is mandatory
  requireRetentionSpacedCheck: boolean;     // Whether 7+ days spaced review is required
  retentionWindowDays?: number;             // e.g. 7 days
  prerequisites?: string[];                 // Prerequisite unit/concept IDs that must be mastered first
}

/**
 * Breakdown across the Five Pillars of Mastery Evidence
 */
export interface MasteryPillarEvidence {
  // Pillar 1: Assessment Evidence
  assessment: {
    attemptsCount: number;
    completionsCount: number;
    bestScore?: number;
    latestScore?: number;
    thresholdRequired: number;
    satisfied: boolean;
  };
  // Pillar 2: Practice Evidence
  practice: {
    attemptsCount: number;
    successfulAttemptsCount: number;
    averageScore?: number;
    minRequired: number;
    satisfied: boolean;
  };
  // Pillar 3: Application / Simulation Evidence
  application: {
    simulationsCompleted: number;
    required: boolean;
    satisfied: boolean;
  };
  // Pillar 4: Independence Evidence (Hint Reliance)
  independence: {
    hintsRequested: number;
    attemptsWithHints: number;
    totalInteractions: number;
    hintRelianceRatio: number;
    maxAllowedRatio: number;
    satisfied: boolean;
  };
  // Pillar 5: Retention Evidence (Spaced Performance)
  retention: {
    firstActivityAt?: string;
    lastActivityAt?: string;
    daysBetweenFirstAndLast?: number;
    retentionRequired: boolean;
    satisfied: boolean;
  };
}

/**
 * Next recommended action derived deterministically
 */
export interface NextLearningAction {
  action: 
    | 'start_lesson'
    | 'continue_practice'
    | 'reduce_hint_usage'
    | 'complete_simulation'
    | 'attempt_assessment'
    | 'clear_prerequisite'
    | 'await_policy_approval'
    | 'advance_to_next_topic';
  targetId?: string;
  description: string;
}

/**
 * Comprehensive Evaluation Result produced by the Pure Mastery Engine
 */
export interface MasteryEvaluationResult {
  studentId: string;
  courseId: string;
  scopeId: string; // unitId (e.g. 'unit_3') or concept/moduleId (e.g. 'u3_m01')
  scopeType: 'unit' | 'module' | 'course';
  masteryState: MasteryState;
  isMastered: boolean;
  masteryScore: number; // 0 to 100 calculated index
  pillars: MasteryPillarEvidence;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  missingEvidence: string[];
  unresolvedPolicies: string[];
  policyVersion: string;
  policyStatus: AcademicPolicyStatus;
  explanation: string;
  nextAction: NextLearningAction;
  evaluatedAt: string;
}

/**
 * Canonical MasteryRecord Schema matching docs/CRESCO_LEARNING_DATA_MODEL.md Section 7
 */
export interface MasteryRecord {
  recordId: string;                 // Composite key: `${studentId}_${conceptId}`
  studentId: string;                // Student Firebase Auth UID
  courseId: string;                 // e.g. 'cs-4200'
  conceptId: string;                // e.g. 'unit_3' or 'u3_m01'
  conceptTitle: string;             // Display title
  unitId?: string;                  // 'unit_3'
  masteryState: MasteryState;       // Current mastery state
  masteryScore: number;             // Calculated competence index (0 to 100)
  evidence: {
    quizAttemptIds?: string[];
    packetLabCompleted: boolean;
    totalAttempts: number;
    consecutiveCorrectAnswers?: number;
    lastAssessmentScore?: number;
    bestAssessmentScore?: number;
    lessonsCompletedCount: number;
    practiceAttemptsCount: number;
  };
  detectedMisconceptions?: string[];
  lastEvaluatedAt: string;
  evaluationVersion: string;
  policyStatus: AcademicPolicyStatus;
  updatedAt?: string;
}
