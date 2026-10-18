/**
 * CRESCO Remediation & Adaptive Recovery Types
 *
 * Strongly typed contracts for deterministic, evidence-based learning gap identification
 * and targeted educational remediation recommendations.
 *
 * Flow:
 * LEARNING EVIDENCE → MASTERY DECISION → GAP IDENTIFICATION → TARGETED REMEDIATION → NEW PRACTICE → RE-EVALUATION
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 8: RemediationRecord, Section 9: Recommendation)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md (Section 9, 10, 11, 12)
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { NavTab } from '../types';

export type RemediationGapType = 
  | 'demonstrated_difficulty' // Concrete incorrect answers or low scores (< 70%) on an objective
  | 'insufficient_evidence'   // Missing practice volume or unattempted drills (not failure)
  | 'prerequisite_gap'        // Missing foundational prerequisite required for progression
  | 'hint_dependency'         // High hint reliance masking lack of independent fluency
  | 'retention_gap';          // Performance has decayed or retention interval unverified

export type RemediationPriority = 'high' | 'medium' | 'low';

export type RemediationStatus = 
  | 'active'                  // Diagnostic gap identified, awaiting student action
  | 'in_progress'             // Student initiated remedial activity
  | 'completed'               // Verified completion evidence recorded
  | 'dismissed';              // Dismissed (allowed only for non-mandatory advisory items)

export type RemediationActivityType = 
  | 'concept_review'          // Review animated lesson or conceptual section
  | 'guided_simulation'       // Interactive packet routing or topology simulation
  | 'targeted_drill'          // Interactive practice questions or flashcard drills
  | 'summative_assessment';   // Formal checkpoint or unit exam retry

export interface RemediationGap {
  gapId: string;
  gapType: RemediationGapType;
  conceptId: string;
  conceptTitle: string;
  unitId?: string;
  lessonId?: string;
  description: string;
  evidenceRefs: string[];
  severity: 'critical' | 'moderate' | 'advisory';
  observedErrorsCount?: number;
  lastAttemptScore?: number;
}

export interface RemediationRecommendation {
  recommendationId: string;
  gapId: string;
  conceptId: string;
  conceptTitle: string;
  headline: string;
  reason: string;
  priority: RemediationPriority;
  activityType: RemediationActivityType;
  targetTab: NavTab;
  targetLessonId?: string;
  targetPracticeTab?: 'flashcards' | 'quiz-and-practice' | 'challenge';
  targetActivityId?: string;
  isMandatoryBarrier: boolean;
  isAvailable: boolean;
  unavailableExplanation?: string;
  status: RemediationStatus;
  evidenceRefs: string[];
  createdTimestamp: string;
  completedTimestamp?: string;
  estimatedMinutes?: number;
}

export interface RemediationEvaluationResult {
  studentId: string;
  scopeId: string;
  evaluatedAt: string;
  gaps: RemediationGap[];
  recommendations: RemediationRecommendation[];
  activeRemediationCount: number;
  hasMandatoryBarriers: boolean;
  summaryText: string;
}

/**
 * Canonical RemediationRecord schema matching docs/CRESCO_LEARNING_DATA_MODEL.md Section 8.
 */
export interface RemediationRecord {
  remediationId: string;
  studentId: string;
  courseId: string;
  triggeredConceptId: string;
  triggerReason: 
    | 'assessment_score_below_threshold'
    | 'repeated_simulator_misconfiguration'
    | 'prerequisite_gap_detected'
    | 'faculty_manual_assignment';
  triggerEvidenceRef: string;
  identifiedGap: string;
  prerequisiteConceptsRequired: string[];
  prescribedActivity: {
    activityType: 'concept_review' | 'guided_simulation' | 'targeted_drill';
    targetLevelNumber?: number;
    targetLessonId?: string;
    targetActivityId?: string;
    recommendedReadTimeMinutes: number;
  };
  status: 
    | 'assigned'
    | 'in_progress'
    | 'completed'
    | 'reassessed_passed'
    | 'reassessed_failed';
  reassessmentAttemptId?: string;
  reassessmentScore?: number;
  assignedAt: string;
  completedAt?: string | null;
  updatedAt: string;
}
