/**
 * CRESCO Learning Event Read Service
 *
 * Read-only Firestore retrieval utility for student learning events.
 * Strictly decoupled from the pure evidence aggregation engine.
 *
 * References:
 * - docs/CRESCO_ARCHITECTURE_RULES.md
 * - docs/FIRESTORE_TARGET_ARCHITECTURE.md
 * - docs/LEARNING_EVIDENCE_IMPLEMENTATION.md
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LearningEvent } from '../types/learningEvents';

/**
 * Retrieves historical learning events for an authenticated student from Firestore `/learning_events`.
 * 
 * Reliability guarantees:
 * - Read-only: executes no writes or schema mutations.
 * - Fail-safe: catches all exceptions, logs a structured warning, and returns an empty array.
 * - Does not disrupt UI rendering or learning sessions on network or permission errors.
 */
export async function getStudentLearningEvents(
  studentId: string,
  courseId?: string
): Promise<LearningEvent[]> {
  if (!studentId || typeof studentId !== 'string') {
    return [];
  }

  try {
    const eventsRef = collection(db, 'learning_events');
    const constraints = [where('studentId', '==', studentId.trim())];

    if (courseId) {
      constraints.push(where('courseId', '==', courseId.trim()));
    }

    const q = query(eventsRef, ...constraints);
    const snapshot = await getDocs(q);

    const events: LearningEvent[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        events.push(docSnap.data() as LearningEvent);
      }
    });

    return events;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[LearningEventReadService] Failed to retrieve student learning events safely:', message);
    return [];
  }
}
