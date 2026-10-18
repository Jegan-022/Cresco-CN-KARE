/**
 * CRESCO Learning Evidence Service
 *
 * Implements the append-only learning event telemetry recording layer.
 * All writes are targeted to the Firestore `/learning_events/{eventId}` collection.
 * Designed to fail safely without interrupting active learning workflows.
 *
 * References:
 * - docs/CRESCO_ARCHITECTURE_RULES.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/FIRESTORE_TARGET_ARCHITECTURE.md
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  LearningEvent,
  RecordLearningEventParams,
  RecordLearningEventResult,
} from '../types/learningEvents';

const SESSION_STORAGE_KEY = 'cresco_learning_session_id';
const DEFAULT_COURSE_ID = 'cs-4200';

let inMemorySessionId: string | null = null;

/**
 * Retrieves the current session identifier, or generates and caches a new one.
 * Uses sessionStorage in browser contexts to correlate interactions within a single session.
 */
export function getLearningSessionId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        return stored;
      }
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      return newSessionId;
    } catch {
      // Fallback if sessionStorage is disabled or restricted
    }
  }

  if (!inMemorySessionId) {
    inMemorySessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return inMemorySessionId;
}

/**
 * Resets the session identifier for test or session boundary purposes.
 */
export function resetLearningSessionId(): string {
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    } catch {
      // Ignore sessionStorage errors
    }
  }
  inMemorySessionId = newSessionId;
  return newSessionId;
}

/**
 * Generates an event ID with millisecond precision and entropy.
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Pure helper to build a canonical LearningEvent payload.
 * Useful for deterministic testing and validation.
 */
export function createLearningEventPayload(
  params: RecordLearningEventParams,
  studentId: string,
  sessionId: string,
  eventId: string = generateEventId(),
  timestamp: string = new Date().toISOString()
): LearningEvent {
  const event: LearningEvent = {
    eventId,
    studentId,
    courseId: params.courseId || DEFAULT_COURSE_ID,
    eventType: params.eventType,
    timestamp,
    sessionId: params.sessionId || sessionId,
  };

  if (params.unitId !== undefined) event.unitId = params.unitId;
  if (params.levelId !== undefined) event.levelId = params.levelId;
  if (params.lessonId !== undefined) event.lessonId = params.lessonId;
  if (params.activityId !== undefined) event.activityId = params.activityId;
  if (params.assessmentId !== undefined) event.assessmentId = params.assessmentId;
  if (params.metadata !== undefined) event.metadata = params.metadata;

  return event;
}

/**
 * Records a learning event into the canonical Firestore append-only `/learning_events` collection.
 * 
 * Reliability guarantees:
 * - Uses real authenticated UID or provided studentId.
 * - Append-only: writes a new document per event.
 * - Fail-safe: catches all exceptions, logs a structured warning, and returns { success: false, error }.
 * - Does not break caller or UI rendering when network or Firestore fails.
 */
export async function recordLearningEvent(
  params: RecordLearningEventParams
): Promise<RecordLearningEventResult> {
  try {
    const studentId = params.studentId || auth.currentUser?.uid;
    if (!studentId) {
      console.warn('[LearningEventService] Event skipped: Student is not authenticated.', params.eventType);
      return {
        success: false,
        error: 'Student is not authenticated',
      };
    }

    const sessionId = params.sessionId || getLearningSessionId();
    const eventId = generateEventId();
    const eventPayload = createLearningEventPayload(params, studentId, sessionId, eventId);

    // Append to Firestore collection `/learning_events/{eventId}`
    const eventDocRef = doc(db, 'learning_events', eventId);
    await setDoc(eventDocRef, {
      ...eventPayload,
      serverTimestamp: serverTimestamp(),
    });

    return {
      success: true,
      eventId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('[LearningEventService] Failed to record learning event safely:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
