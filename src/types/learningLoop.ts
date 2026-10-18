/**
 * CRESCO Unified Adaptive Learning Loop Types
 *
 * Canonical schema definitions for Step 25 of the CRESCO Production Roadmap.
 *
 * 6-Stage Learning Loop:
 * DIAGNOSE → LEARN → PRACTICE → ASSESS → ADAPT → MASTER
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { LearningEventType } from './learningEvents';
import { LearnerEvidenceSummary } from './evidenceSummary';
import { MasteryEvaluationResult } from './mastery';
import { RemediationEvaluationResult } from './remediation';
import { PersonalizationResult } from './personalization';
import { AssessmentEvaluationResult } from '../services/assessmentScoringService';

export type UnifiedLearningActionType =
  | 'complete_lesson'
  | 'submit_practice'
  | 'submit_assessment'
  | 'complete_simulation'
  | 'complete_remediation';

export interface UnifiedLearningAction {
  actionId: string;
  actionType: UnifiedLearningActionType;
  studentId: string;
  courseId?: string;
  unitId?: string;
  lessonId?: string;
  activityId?: string;
  assessmentResult?: AssessmentEvaluationResult;
  score?: number;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  timestamp?: number;
}

export interface LearningLoopPartialFailure {
  step: 'event_recording' | 'evidence_aggregation' | 'mastery_evaluation' | 'remediation_evaluation' | 'personalization_recomputation';
  error: string;
  fatal: boolean;
  timestamp: number;
}

export interface UnifiedLearningCycleResult {
  cycleId: string;
  studentId: string;
  courseId: string;
  unitId: string;
  lessonId?: string;
  actionType: UnifiedLearningActionType;
  eventRecorded: boolean;
  eventId?: string;
  assessmentEvaluation?: AssessmentEvaluationResult;
  evidenceSummary: LearnerEvidenceSummary;
  masteryDecision: MasteryEvaluationResult;
  remediationResult: RemediationEvaluationResult;
  personalizationResult: PersonalizationResult;
  partialFailures: LearningLoopPartialFailure[];
  status: 'completed' | 'partial_failure' | 'duplicate_prevented';
  timestamp: number;
}
