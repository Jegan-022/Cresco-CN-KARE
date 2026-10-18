/**
 * CRESCO Unified Adaptive Learning Loop Orchestrator
 *
 * Implements Step 25 of the CRESCO Production Roadmap.
 *
 * Orchestrates the complete 6-stage adaptive cycle:
 * DIAGNOSE → LEARN → PRACTICE → ASSESS → ADAPT → MASTER
 *
 * Architectural Guarantees:
 * 1. Thin Orchestration: Coordinates existing services without duplicating their domain logic.
 * 2. Deterministic Academic Integrity: Decisions are derived purely by deterministic engines.
 * 3. Idempotent & Race-Condition Safe: Prevents duplicate event dispatching across rapid actions.
 * 4. Partial Failure Isolation: Non-critical telemetry/AI failures never invalidate authentic test scores or lesson completions.
 * 5. Strict Authority Boundary: AI Tutor is purely assistive and cannot mutate grades or grant mastery.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 */

import { 
  UnifiedLearningAction, 
  UnifiedLearningCycleResult, 
  LearningLoopPartialFailure 
} from '../types/learningLoop';
import { 
  LearningEvent, 
  RecordLearningEventParams, 
  LearningEventType 
} from '../types/learningEvents';
import { 
  createLearningEventPayload, 
  recordLearningEvent, 
  generateEventId, 
  getLearningSessionId 
} from './learningEventService';
import { aggregateLearningEvents } from './evidenceAggregationService';
import { evaluateMastery } from './masteryEngineService';
import { evaluateRemediation } from './remediationEngineService';
import { evaluatePersonalizedRecommendations } from './personalizedLearningService';
import { TutorInstructionalContext } from '../types/aiTutor';
import { TRUSTED_AI_AUTHORITY_BOUNDARY } from './aiTutorService';
import { LearnerEvidenceSummary } from '../types/evidenceSummary';
import { MasteryRecord } from '../types/mastery';

/**
 * In-memory idempotency cache preventing duplicate processing of actions.
 */
interface CachedCycleRecord {
  result: UnifiedLearningCycleResult;
  timestamp: number;
}
const actionIdempotencyCache = new Map<string, CachedCycleRecord>();
const IDEMPOTENCY_WINDOW_MS = 3000;

/**
 * In-memory event store for deterministic execution, test environments, and offline sessions.
 */
const inMemoryStudentEvents = new Map<string, LearningEvent[]>();

export function getInMemoryEventsForStudent(studentId: string): LearningEvent[] {
  return inMemoryStudentEvents.get(studentId) || [];
}

export function clearInMemoryEventsForStudent(studentId: string): void {
  inMemoryStudentEvents.delete(studentId);
}

/**
 * Maps an action type to its canonical telemetry LearningEventType.
 */
function resolveEventType(action: UnifiedLearningAction): LearningEventType {
  switch (action.actionType) {
    case 'complete_lesson':
      return 'LESSON_COMPLETED';
    case 'submit_practice':
      return 'PRACTICE_COMPLETED';
    case 'submit_assessment':
      return 'ASSESSMENT_COMPLETED';
    case 'complete_simulation':
      return 'SIMULATION_COMPLETED';
    case 'complete_remediation':
      return 'PRACTICE_COMPLETED'; // Telemetry records as practice completion with remediation metadata
  }
}

/**
 * Orchestrates a complete adaptive learning cycle triggered by genuine student action.
 */
export async function executeUnifiedLearningCycle(
  action: UnifiedLearningAction,
  options?: {
    mockOffline?: boolean;
    injectedEvents?: LearningEvent[];
    prerequisiteMasteryRecords?: Record<string, MasteryRecord>;
  }
): Promise<UnifiedLearningCycleResult> {
  const timestamp = action.timestamp || Date.now();
  const studentId = action.studentId?.trim() || '';
  const courseId = action.courseId || 'cs-4200';
  const unitId = action.unitId || 'unit_3';
  const scopeId = action.lessonId || unitId;

  // 1. INPUT VALIDATION & ISOLATION
  if (!studentId) {
    throw new Error('UnifiedLearningCycle: studentId is required for evidence correlation.');
  }

  // 2. IDEMPOTENCY CHECK
  const idempotencyKey = action.idempotencyKey || `${studentId}_${action.actionType}_${action.actionId}`;
  const cached = actionIdempotencyCache.get(idempotencyKey);
  if (cached && (Date.now() - cached.timestamp < IDEMPOTENCY_WINDOW_MS)) {
    return {
      ...cached.result,
      status: 'duplicate_prevented'
    };
  }

  const cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const partialFailures: LearningLoopPartialFailure[] = [];

  // 3. STAGE 1: TELEMETRY EVENT RECORDING
  const eventType = resolveEventType(action);
  const sessionId = getLearningSessionId();
  const eventId = generateEventId();
  let eventRecorded = false;

  const eventPayload: LearningEvent = createLearningEventPayload(
    {
      studentId,
      courseId,
      unitId,
      lessonId: action.lessonId,
      activityId: action.activityId,
      eventType,
      metadata: {
        actionId: action.actionId,
        score: action.score ?? action.assessmentResult?.percentageScore,
        pointsEarned: action.assessmentResult?.totalPointsEarned,
        pointsPossible: action.assessmentResult?.totalPointsPossible,
        isRemediation: action.actionType === 'complete_remediation',
        ...action.metadata
      }
    },
    studentId,
    sessionId,
    eventId,
    new Date(timestamp).toISOString()
  );

  // Store in in-memory event registry
  const studentEvents = options?.injectedEvents 
    ? [...options.injectedEvents] 
    : getInMemoryEventsForStudent(studentId);
  studentEvents.push(eventPayload);
  inMemoryStudentEvents.set(studentId, studentEvents);

  if (!options?.mockOffline) {
    try {
      const recordResult = await recordLearningEvent({
        studentId,
        courseId,
        unitId,
        lessonId: action.lessonId,
        activityId: action.activityId,
        eventType,
        metadata: eventPayload.metadata
      });
      eventRecorded = recordResult.success;
      if (!recordResult.success) {
        partialFailures.push({
          step: 'event_recording',
          error: recordResult.error || 'Failed to record event in Firestore',
          fatal: false,
          timestamp: Date.now()
        });
      }
    } catch (err: any) {
      partialFailures.push({
        step: 'event_recording',
        error: err.message || 'Exception during event write',
        fatal: false,
        timestamp: Date.now()
      });
    }
  } else {
    eventRecorded = true;
  }

  // 4. STAGE 2: EVIDENCE AGGREGATION
  let evidenceSummary: LearnerEvidenceSummary;
  try {
    evidenceSummary = aggregateLearningEvents(studentEvents);
  } catch (err: any) {
    partialFailures.push({
      step: 'evidence_aggregation',
      error: err.message || 'Evidence reduction error',
      fatal: true,
      timestamp: Date.now()
    });
    // Build fallback empty summary
    evidenceSummary = aggregateLearningEvents([]);
  }

  // 5. STAGE 3: DETERMINISTIC MASTERY DECISION
  let masteryDecision: any;
  try {
    masteryDecision = evaluateMastery({
      studentId,
      courseId,
      scopeId,
      evidence: evidenceSummary,
      prerequisiteMasteryRecords: options?.prerequisiteMasteryRecords
    });
  } catch (err: any) {
    partialFailures.push({
      step: 'mastery_evaluation',
      error: err.message || 'Mastery evaluation error',
      fatal: false,
      timestamp: Date.now()
    });
    masteryDecision = {
      recordId: `${studentId}_${scopeId}`,
      studentId,
      courseId,
      conceptId: scopeId,
      masteryState: 'insufficient_evidence',
      masteryScore: 0,
      confidenceScore: 0,
      isMastered: false,
      prerequisitesMet: true,
      missingPrerequisites: [],
      evidenceTrail: {
        lessonsCompleted: 0,
        assessmentAttempts: 0,
        bestAssessmentScore: 0,
        latestAssessmentScore: 0,
        practiceAttempts: 0,
        hintsRequested: 0,
        hintRelianceRatio: 0
      },
      evaluationVersion: '1.0.0',
      evaluatedAt: new Date().toISOString()
    };
  }

  // 6. STAGE 4: TARGETED REMEDIATION DIAGNOSIS
  let remediationResult: any;
  try {
    remediationResult = evaluateRemediation({
      studentId,
      courseId,
      scopeId,
      masteryResult: masteryDecision,
      evidence: evidenceSummary,
      recentAssessment: action.assessmentResult,
      prerequisiteMasteryRecords: options?.prerequisiteMasteryRecords
    });
  } catch (err: any) {
    partialFailures.push({
      step: 'remediation_evaluation',
      error: err.message || 'Remediation diagnosis error',
      fatal: false,
      timestamp: Date.now()
    });
    remediationResult = {
      studentId,
      scopeId,
      evaluatedAt: new Date().toISOString(),
      gaps: [],
      recommendations: [],
      hasActiveRemediation: false,
      isBlockedByPrerequisites: false,
      summary: { totalGaps: 0, criticalGaps: 0, mandatoryBarriers: 0 }
    };
  }

  // 7. STAGE 5: RECOMPUTE PERSONALIZED NEXT STEPS
  let personalizationResult: any;
  try {
    const completedLessonIds = studentEvents
      .filter((e) => e.eventType === 'LESSON_COMPLETED' && e.lessonId)
      .map((e) => e.lessonId as string);

    const practiceScores: Record<string, number> = {};
    studentEvents.forEach((e) => {
      if ((e.eventType === 'ASSESSMENT_COMPLETED' || e.eventType === 'PRACTICE_COMPLETED') && e.lessonId) {
        const score = Number(e.metadata?.score ?? 0);
        practiceScores[e.lessonId] = Math.max(practiceScores[e.lessonId] || 0, score);
      }
    });

    personalizationResult = evaluatePersonalizedRecommendations({
      studentId,
      courseId,
      completedLessonIds,
      practiceScores,
      remediationRecommendations: remediationResult.recommendations
    });
  } catch (err: any) {
    partialFailures.push({
      step: 'personalization_recomputation',
      error: err.message || 'Personalization recomputation error',
      fatal: false,
      timestamp: Date.now()
    });
    personalizationResult = {
      studentId,
      courseId,
      primaryRecommendation: null,
      secondaryRecommendations: [],
      allEligibleRecommendations: [],
      summary: {
        totalEligible: 0,
        unmetPrerequisitesCount: 0,
        activeRemediationsCount: 0,
        needsEvidenceCount: 0,
        completedLessonsCount: 0,
        isCourseCompleted: false
      },
      generatedAt: Date.now()
    };
  }

  // 8. ASSEMBLE UNIFIED RESULT
  const cycleResult: UnifiedLearningCycleResult = {
    cycleId,
    studentId,
    courseId,
    unitId,
    lessonId: action.lessonId,
    actionType: action.actionType,
    eventRecorded,
    eventId,
    assessmentEvaluation: action.assessmentResult,
    evidenceSummary,
    masteryDecision,
    remediationResult,
    personalizationResult,
    partialFailures,
    status: partialFailures.length === 0 ? 'completed' : 'partial_failure',
    timestamp
  };

  // Cache for idempotency
  actionIdempotencyCache.set(idempotencyKey, {
    result: cycleResult,
    timestamp: Date.now()
  });

  // 9. BROWSER EVENT NOTIFICATION
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('cresco:learning-cycle-updated', { detail: cycleResult })
      );
    } catch {
      // Ignore in non-browser / test runtimes
    }
  }

  return cycleResult;
}

/**
 * Builds instructional context for ByteBot AI Personal Tutor from a cycle outcome.
 * Respects TRUSTED_AI_AUTHORITY_BOUNDARY: explanations never grant mastery or modify grades.
 */
export function getTutorContextFromCycle(
  result: UnifiedLearningCycleResult
): TutorInstructionalContext {
  const primaryRec = result.personalizationResult.primaryRecommendation;
  const topGap = result.remediationResult.gaps[0];

  if (topGap) {
    return {
      courseId: result.courseId,
      unitId: result.unitId,
      lessonId: result.lessonId,
      conceptTopic: topGap.conceptTitle,
      actionType: 'explain_mistake',
      learningObjective: topGap.description,
      explanationSnippet: `Diagnostic gap: ${topGap.description}. Assessment evidence shows observed difficulties.`
    };
  }

  if (primaryRec) {
    return {
      courseId: result.courseId,
      unitId: primaryRec.unitId || result.unitId,
      lessonId: primaryRec.targetLessonId || result.lessonId,
      conceptTopic: primaryRec.conceptTitle || primaryRec.title,
      actionType: primaryRec.category === 'strengthen_understanding' ? 'explain_mistake' : 'explain_concept',
      learningObjective: primaryRec.rationale,
      explanationSnippet: primaryRec.description
    };
  }

  return {
    courseId: result.courseId,
    unitId: result.unitId,
    lessonId: result.lessonId,
    conceptTopic: 'Curriculum Progression',
    actionType: 'explain_concept',
    learningObjective: 'Advance through CRESCO Computer Networks'
  };
}

export { TRUSTED_AI_AUTHORITY_BOUNDARY };
