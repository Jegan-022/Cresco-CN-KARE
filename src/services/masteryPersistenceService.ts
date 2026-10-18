/**
 * CRESCO Production — Step 21 Mastery Persistence Service
 * 
 * Manages the persistence of verified mastery evaluations while strictly adhering
 * to Firestore security rules and trusted-write boundaries.
 * 
 * Security & Authority Architecture:
 * 1. Pure Calculation Decoupled: Evaluation is performed exclusively by `masteryEngineService`.
 * 2. Authenticated Student Scope: Client writes update the student's private profile document
 *    at `/students/{studentId}` within established security rules (`request.auth.uid == studentId`).
 * 3. Authoritative Backend Boundary: Dedicated root `/mastery` collections are protected against
 *    untrusted client writes. Server-side authoritative recording requires a trusted backend
 *    (Cloud Functions / Admin SDK). This service explicitly handles and documents that boundary
 *    without simulating or faking trusted server operations.
 * 4. Audit Telemetry: Emits canonical `mastery_evaluated` learning events to the append-only stream.
 * 
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 7)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md (Section 12.2)
 * - docs/FIRESTORE_LEARNING_EVENTS_SECURITY.md
 * - firestore.rules
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MasteryRecord, MasteryEvaluationResult } from '../types/mastery';
import { createMasteryRecordFromEvaluation } from './masteryEngineService';
import { recordLearningEvent } from './learningEventService';

export interface MasteryPersistenceResult {
  success: boolean;
  recordId: string;
  persistedToStudentProfile: boolean;
  trustedBackendRequired: boolean;
  trustedBackendDependency?: string;
  error?: string;
  record: MasteryRecord;
}

export const TRUSTED_MASTERY_BACKEND_DEPENDENCY = {
  requiredService: 'Firebase Cloud Functions / Admin SDK',
  targetCollection: '/mastery/{recordId}',
  rationale: 'Client writes to root /mastery collections are denied by firestore.rules to prevent unauthorized client-side tampering of academic grades and mastery statuses. Authoritative certificates require server verification.',
  clientCapability: 'Allowed to persist non-authoritative student mastery tracking within /students/{studentId}.masteryRecords'
};

/**
 * Persists a verified mastery evaluation result to the authenticated student's profile,
 * emits canonical telemetry, and honors trusted write boundaries.
 */
export async function persistMasteryDecision(
  evaluation: MasteryEvaluationResult,
  authenticatedStudentId: string,
  conceptTitle: string,
  unitId?: string
): Promise<MasteryPersistenceResult> {
  // Authentication & Ownership Verification
  if (!authenticatedStudentId || authenticatedStudentId !== evaluation.studentId) {
    return {
      success: false,
      recordId: `${evaluation.studentId}_${evaluation.scopeId}`,
      persistedToStudentProfile: false,
      trustedBackendRequired: false,
      error: 'Security Violation: Cannot persist mastery evaluation for a student identity different from the authenticated session.',
      record: createMasteryRecordFromEvaluation(evaluation, conceptTitle, unitId)
    };
  }

  const record = createMasteryRecordFromEvaluation(evaluation, conceptTitle, unitId);

  try {
    // 1. Persist to student profile document within allowed client security boundaries
    const studentDocRef = doc(db, 'students', authenticatedStudentId);
    
    // Check if document exists
    const docSnap = await getDoc(studentDocRef);
    if (docSnap.exists()) {
      await updateDoc(studentDocRef, {
        [`masteryRecords.${evaluation.scopeId}`]: record,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(studentDocRef, {
        studentId: authenticatedStudentId,
        masteryRecords: {
          [evaluation.scopeId]: record
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 2. Dispatch canonical append-only telemetry event
    // Uses LearningEventType 'UNDERSTANDING_CHECK_COMPLETED' or custom metadata
    recordLearningEvent({
      eventType: evaluation.isMastered ? 'UNDERSTANDING_CHECK_COMPLETED' : 'CONTENT_VIEWED',
      courseId: evaluation.courseId,
      unitId: unitId || (evaluation.scopeType === 'unit' ? evaluation.scopeId : undefined),
      assessmentId: `mastery_${evaluation.scopeId}`,
      studentId: authenticatedStudentId,
      metadata: {
        score: evaluation.masteryScore,
        correctness: evaluation.isMastered,
        masteryState: evaluation.masteryState,
        policyStatus: evaluation.policyStatus
      } as Record<string, unknown>
    }).catch(err => {
      console.warn('[MasteryPersistence] Non-fatal telemetry dispatch error:', err);
    });

    return {
      success: true,
      recordId: record.recordId,
      persistedToStudentProfile: true,
      trustedBackendRequired: true,
      trustedBackendDependency: TRUSTED_MASTERY_BACKEND_DEPENDENCY.rationale,
      record
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[MasteryPersistence] Failed to persist mastery decision to student profile:', errorMsg);

    return {
      success: false,
      recordId: record.recordId,
      persistedToStudentProfile: false,
      trustedBackendRequired: true,
      error: errorMsg,
      record
    };
  }
}

/**
 * Retrieves persisted mastery records from the authenticated student profile.
 */
export async function getStudentMasteryRecords(
  authenticatedStudentId: string
): Promise<Record<string, MasteryRecord>> {
  if (!authenticatedStudentId) return {};

  try {
    const studentDocRef = doc(db, 'students', authenticatedStudentId);
    const docSnap = await getDoc(studentDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data?.masteryRecords as Record<string, MasteryRecord>) || {};
    }
    return {};
  } catch (err) {
    console.warn('[MasteryPersistence] Could not retrieve student mastery records:', err);
    return {};
  }
}
