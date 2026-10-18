/**
 * CRESCO Remediation Tracking & Re-Evaluation Service
 *
 * Coordinates remediation event dispatching, client-side remediation persistence,
 * and seamless re-evaluation of mastery and learning gaps upon completion of remedial activities.
 *
 * Security & Authority Boundaries:
 * - Emits canonical append-only telemetry: REMEDIATION_STARTED, REMEDIATION_COMPLETED.
 * - Idempotent event dispatch prevents duplicate event spamming from rapid button clicks.
 * - Writes student tracking caches to /students/{studentId} within client security rules.
 * - Identifies TRUSTED_REMEDIATION_BACKEND_DEPENDENCY for authoritative /remediations root collections.
 * - AI is STRICTLY decoupled from remediation state mutation or grade grants.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md Section 8 & 9
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md Section 11 & 12
 */

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { recordLearningEvent } from './learningEventService';
import { getStudentLearningEvents } from './learningEventReadService';
import { LearningEvent } from '../types/learningEvents';
import { evaluateMastery } from './masteryEngineService';
import { evaluateRemediation } from './remediationEngineService';
import { 
  RemediationRecommendation, 
  RemediationEvaluationResult,
  RemediationRecord 
} from '../types/remediation';
import { MasteryEvaluationResult, MasteryRecord } from '../types/mastery';
import { AssessmentEvaluationResult } from './assessmentScoringService';

/**
 * Architectural specification for authoritative server-side remediation persistence.
 */
export const TRUSTED_REMEDIATION_BACKEND_DEPENDENCY = {
  authorityCollection: '/remediations',
  authorizationRequired: 'Firebase Admin SDK / Cloud Functions Service Account',
  clientAccessRule: 'firestore.rules disallows direct client writes to root collections',
  status: 'client_local_cache_active_server_pipeline_specified'
};

// Memory cache of recently dispatched remediation event keys to prevent double-firing
const recentlyDispatchedEvents = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 2500;

function isDuplicateDispatch(key: string): boolean {
  const now = Date.now();
  const lastTime = recentlyDispatchedEvents.get(key);
  if (lastTime && now - lastTime < DEDUPLICATION_WINDOW_MS) {
    return true;
  }
  recentlyDispatchedEvents.set(key, now);
  // Clean up old entries
  if (recentlyDispatchedEvents.size > 200) {
    for (const [k, time] of recentlyDispatchedEvents.entries()) {
      if (now - time > 10000) {
        recentlyDispatchedEvents.delete(k);
      }
    }
  }
  return false;
}

/**
 * Records that a student has initiated an assigned remediation recommendation.
 * Emits canonical REMEDIATION_STARTED learning event.
 */
export async function trackRemediationStarted(
  recommendation: RemediationRecommendation,
  studentId: string,
  courseId: string = 'cs-4200'
): Promise<{ success: boolean; eventId?: string; isDuplicate?: boolean }> {
  if (!studentId || !recommendation.recommendationId) {
    return { success: false };
  }

  const dedupKey = `start_${studentId}_${recommendation.recommendationId}`;
  if (isDuplicateDispatch(dedupKey)) {
    return { success: true, isDuplicate: true };
  }

  try {
    const event = await recordLearningEvent({
      studentId,
      courseId,
      unitId: recommendation.conceptId.startsWith('unit') ? recommendation.conceptId : undefined,
      lessonId: recommendation.targetLessonId,
      activityId: recommendation.targetActivityId,
      eventType: 'REMEDIATION_STARTED',
      metadata: {
        recommendationId: recommendation.recommendationId,
        gapId: recommendation.gapId,
        activityType: recommendation.activityType,
        conceptId: recommendation.conceptId,
        priority: recommendation.priority,
        isMandatoryBarrier: recommendation.isMandatoryBarrier
      }
    });

    return { success: true, eventId: event?.eventId };
  } catch (err) {
    console.warn('[RemediationTracking] Non-blocking error recording REMEDIATION_STARTED:', err);
    return { success: false };
  }
}

/**
 * Records that a student has completed an assigned remediation recommendation.
 * Emits canonical REMEDIATION_COMPLETED learning event.
 */
export async function trackRemediationCompleted(
  recommendation: RemediationRecommendation,
  studentId: string,
  courseId: string = 'cs-4200',
  evidenceScore?: number
): Promise<{ success: boolean; eventId?: string; isDuplicate?: boolean }> {
  if (!studentId || !recommendation.recommendationId) {
    return { success: false };
  }

  const dedupKey = `complete_${studentId}_${recommendation.recommendationId}`;
  if (isDuplicateDispatch(dedupKey)) {
    return { success: true, isDuplicate: true };
  }

  try {
    const event = await recordLearningEvent({
      studentId,
      courseId,
      unitId: recommendation.conceptId.startsWith('unit') ? recommendation.conceptId : undefined,
      lessonId: recommendation.targetLessonId,
      activityId: recommendation.targetActivityId,
      eventType: 'REMEDIATION_COMPLETED',
      metadata: {
        recommendationId: recommendation.recommendationId,
        gapId: recommendation.gapId,
        conceptId: recommendation.conceptId,
        score: evidenceScore,
        completedAt: new Date().toISOString()
      }
    });

    return { success: true, eventId: event?.eventId };
  } catch (err) {
    console.warn('[RemediationTracking] Non-blocking error recording REMEDIATION_COMPLETED:', err);
    return { success: false };
  }
}

/**
 * Persists active remediation recommendations to the authenticated student's profile.
 * Respects existing client write boundary under /students/{studentId}.
 */
export async function persistStudentRemediations(
  studentId: string,
  authenticatedUid: string,
  recommendations: RemediationRecommendation[],
  scopeId: string
): Promise<{ success: boolean; error?: string }> {
  if (studentId !== authenticatedUid) {
    return {
      success: false,
      error: 'Security boundary error: Cannot persist remediation for another student identity.'
    };
  }

  try {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      [`remediationState.${scopeId}`]: {
        recommendations: recommendations.map((r) => ({
          recommendationId: r.recommendationId,
          conceptId: r.conceptId,
          conceptTitle: r.conceptTitle,
          headline: r.headline,
          priority: r.priority,
          status: r.status,
          isMandatoryBarrier: r.isMandatoryBarrier,
          targetTab: r.targetTab,
          targetLessonId: r.targetLessonId,
          targetPracticeTab: r.targetPracticeTab,
          createdTimestamp: r.createdTimestamp,
          completedTimestamp: r.completedTimestamp
        })),
        updatedAt: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (err: any) {
    // Non-blocking for offline or permission restricted scenarios
    return {
      success: false,
      error: err?.message || 'Failed to update student remediation cache'
    };
  }
}

/**
 * Executes a full re-evaluation pipeline:
 * 1. Retrieves latest verified learning events.
 * 2. Runs deterministic mastery evaluation.
 * 3. Runs targeted remediation evaluation.
 * 4. Checks if existing active recommendations have since been resolved by new completion evidence.
 */
export async function reevaluateMasteryAndRemediation(params: {
  studentId: string;
  scopeId: string;
  courseId?: string;
  events?: LearningEvent[];
  recentAssessment?: AssessmentEvaluationResult;
  existingRecommendations?: RemediationRecommendation[];
  prerequisiteMasteryRecords?: Record<string, MasteryRecord>;
}): Promise<{
  mastery: MasteryEvaluationResult;
  remediation: RemediationEvaluationResult;
}> {
  const { studentId, scopeId, courseId = 'cs-4200' } = params;

  // 1. Fetch authentic events or use provided in-memory stream
  const events = params.events || (await getStudentLearningEvents(studentId, courseId));

  // 2. Evaluate mastery deterministically
  const mastery = evaluateMastery({
    studentId,
    scopeId,
    courseId,
    evidence: events,
    prerequisiteMasteryRecords: params.prerequisiteMasteryRecords
  });

  // 3. Evaluate remediation gaps and recommendations
  const remediation = evaluateRemediation({
    studentId,
    scopeId,
    courseId,
    masteryResult: mastery,
    evidence: events,
    recentAssessment: params.recentAssessment,
    prerequisiteMasteryRecords: params.prerequisiteMasteryRecords
  });

  // 4. Correlate with existing recommendations: check if any were completed in the event stream
  if (params.existingRecommendations && params.existingRecommendations.length > 0) {
    const completedLessonIds = new Set(
      events.filter((e) => e.eventType === 'LESSON_COMPLETED').map((e) => e.lessonId)
    );
    const completedRemediationIds = new Set(
      events.filter((e) => e.eventType === 'REMEDIATION_COMPLETED').map((e) => (e.metadata as any)?.recommendationId)
    );

    for (const rec of remediation.recommendations) {
      if (completedRemediationIds.has(rec.recommendationId)) {
        rec.status = 'completed';
        rec.completedTimestamp = rec.completedTimestamp || new Date().toISOString();
      } else if (rec.targetLessonId && completedLessonIds.has(rec.targetLessonId)) {
        rec.status = 'completed';
        rec.completedTimestamp = rec.completedTimestamp || new Date().toISOString();
      }
    }
  }

  return {
    mastery,
    remediation
  };
}
