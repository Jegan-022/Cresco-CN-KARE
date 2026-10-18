/**
 * CRESCO Evidence Aggregation Service
 *
 * Deterministic, pure aggregation pipeline that transforms raw LearningEvent records
 * into a structured LearnerEvidenceSummary.
 *
 * Architectural Guarantees:
 * - Pure and deterministic: identical inputs yield identical outputs.
 * - Zero pedagogical decisions: does NOT calculate mastery, recommendations, or unlock states.
 * - Zero side effects: no network calls, no Firestore writes, no temporal/random mutations.
 * - Resilient: safely handles missing metadata, malformed fields, out-of-order events, and unknown event types.
 *
 * References:
 * - docs/CRESCO_ARCHITECTURE_RULES.md
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/LEARNING_EVIDENCE_IMPLEMENTATION.md
 */

import { LearningEvent } from '../types/learningEvents';
import {
  LearnerEvidenceSummary,
  UnitEvidenceSummary,
  LessonEvidenceSummary,
  AssessmentEvidenceSummary,
  PracticeEvidenceSummary,
  ActivityEvidenceSummary
} from '../types/evidenceSummary';

export interface AggregationOptions {
  studentId?: string;
  courseId?: string;
}

/**
 * Parses and normalizes an ISO timestamp string into epoch milliseconds safely.
 * Returns null if the timestamp is missing, malformed, or unparseable.
 */
function parseTimestampMs(timestamp?: string): number | null {
  if (!timestamp || typeof timestamp !== 'string') return null;
  const time = Date.parse(timestamp);
  return isNaN(time) ? null : time;
}

/**
 * Deterministically aggregates an array of LearningEvent items into a LearnerEvidenceSummary.
 */
export function aggregateLearningEvents(
  events: LearningEvent[],
  options?: AggregationOptions
): LearnerEvidenceSummary {
  if (!Array.isArray(events) || events.length === 0) {
    return createEmptyEvidenceSummary(options?.studentId || '', options?.courseId || 'cs-4200');
  }

  // 1. Deduplicate by eventId (preserve earlier occurrence)
  const seenEventIds = new Set<string>();
  const deduplicatedEvents: LearningEvent[] = [];

  for (const event of events) {
    if (!event || typeof event !== 'object') continue;
    if (event.eventId && typeof event.eventId === 'string') {
      if (seenEventIds.has(event.eventId)) continue;
      seenEventIds.add(event.eventId);
    }
    deduplicatedEvents.push(event);
  }

  // 2. Sort chronologically by timestamp (stable sort)
  // Events with invalid/missing timestamps are placed at the end without throwing
  const sortedEvents = [...deduplicatedEvents].sort((a, b) => {
    const timeA = parseTimestampMs(a.timestamp);
    const timeB = parseTimestampMs(b.timestamp);
    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;
    return timeA - timeB;
  });

  // 3. Resolve studentId and courseId identity
  const inferredStudentId = options?.studentId || sortedEvents.find(e => e.studentId)?.studentId || '';
  const inferredCourseId = options?.courseId || sortedEvents.find(e => e.courseId)?.courseId || 'cs-4200';

  // 4. Initialize counters and aggregation accumulators
  let lessonsStarted = 0;
  let lessonsCompleted = 0;
  let simulationsStarted = 0;
  let simulationsCompleted = 0;
  let practiceStarted = 0;
  let practiceCompleted = 0;

  let assessmentAttempts = 0;
  let assessmentCompletions = 0;
  let successfulAttempts = 0;
  const assessmentScores: number[] = [];
  let latestAssessmentScore: number | undefined = undefined;

  let practiceAttempts = 0;
  let successfulPracticeAttempts = 0;
  const practiceScores: number[] = [];
  let latestPracticeScore: number | undefined = undefined;

  let hintsRequested = 0;
  let attemptsWithHints = 0;
  let independentSuccessfulAttempts = 0;

  const errorCategoriesObserved: Record<string, number> = {};
  const misconceptionsObserved: Record<string, number> = {};

  let firstActivityAt: string | undefined = undefined;
  let lastActivityAt: string | undefined = undefined;

  const unitBreakdown: Record<string, UnitEvidenceSummary> = {};
  const lessonBreakdown: Record<string, LessonEvidenceSummary> = {};
  const assessmentBreakdown: Record<string, AssessmentEvidenceSummary> = {};
  const practiceBreakdown: Record<string, PracticeEvidenceSummary> = {};
  const activityBreakdown: Record<string, ActivityEvidenceSummary> = {};

  // Helper to ensure unit breakdown exists
  const getOrCreateUnit = (unitId: string): UnitEvidenceSummary => {
    if (!unitBreakdown[unitId]) {
      unitBreakdown[unitId] = {
        unitId,
        lessonsStarted: 0,
        lessonsCompleted: 0,
        simulationsCompleted: 0,
        practiceCompleted: 0,
        assessmentAttempts: 0,
        assessmentCompletions: 0,
      };
    }
    return unitBreakdown[unitId];
  };

  // 5. Process each event sequentially in chronological order
  for (const event of sortedEvents) {
    const { eventType, timestamp, unitId, lessonId, activityId, assessmentId, metadata } = event;

    // Track valid timestamps
    if (timestamp && parseTimestampMs(timestamp) !== null) {
      if (!firstActivityAt) firstActivityAt = timestamp;
      lastActivityAt = timestamp;

      if (unitId) {
        const u = getOrCreateUnit(unitId);
        if (!u.firstActivityAt) u.firstActivityAt = timestamp;
        u.lastActivityAt = timestamp;
      }
    }

    // Track Error Categories from metadata
    if (metadata?.errorCategory && typeof metadata.errorCategory === 'string') {
      const cat = metadata.errorCategory.trim();
      if (cat) {
        errorCategoriesObserved[cat] = (errorCategoriesObserved[cat] || 0) + 1;
      }
    }

    // Track Misconceptions from metadata
    if (metadata?.misconceptionTag && typeof metadata.misconceptionTag === 'string') {
      const tag = metadata.misconceptionTag.trim();
      if (tag) {
        misconceptionsObserved[tag] = (misconceptionsObserved[tag] || 0) + 1;
      }
    }

    // Track Hint Requests
    if (eventType === 'HINT_REQUESTED') {
      hintsRequested++;
      if (activityId && practiceBreakdown[activityId]) {
        practiceBreakdown[activityId].hintsRequested++;
      }
    }

    // Process specific event categories
    switch (eventType) {
      // --- LIFECYCLE: LESSONS ---
      case 'LESSON_STARTED': {
        lessonsStarted++;
        if (unitId) getOrCreateUnit(unitId).lessonsStarted++;
        if (lessonId) {
          if (!lessonBreakdown[lessonId]) {
            lessonBreakdown[lessonId] = {
              lessonId,
              unitId,
              levelId: event.levelId,
              startedCount: 0,
              completedCount: 0,
              isCompleted: false,
              firstStartedAt: timestamp,
            };
          }
          lessonBreakdown[lessonId].startedCount++;
        }
        break;
      }

      case 'LESSON_COMPLETED': {
        lessonsCompleted++;
        if (unitId) getOrCreateUnit(unitId).lessonsCompleted++;
        if (lessonId) {
          if (!lessonBreakdown[lessonId]) {
            lessonBreakdown[lessonId] = {
              lessonId,
              unitId,
              levelId: event.levelId,
              startedCount: 0,
              completedCount: 0,
              isCompleted: true,
            };
          }
          lessonBreakdown[lessonId].completedCount++;
          lessonBreakdown[lessonId].isCompleted = true;
          lessonBreakdown[lessonId].lastCompletedAt = timestamp;
          if (typeof metadata?.durationMs === 'number' && !isNaN(metadata.durationMs)) {
            lessonBreakdown[lessonId].totalDurationMs =
              (lessonBreakdown[lessonId].totalDurationMs || 0) + metadata.durationMs;
          }
        }
        break;
      }

      // --- LEARNING: SIMULATIONS & ACTIVITIES ---
      case 'SIMULATION_STARTED': {
        simulationsStarted++;
        break;
      }

      case 'SIMULATION_COMPLETED': {
        simulationsCompleted++;
        if (unitId) getOrCreateUnit(unitId).simulationsCompleted++;
        break;
      }

      case 'CONTENT_VIEWED':
      case 'EXAMPLE_VIEWED':
      case 'VISUAL_VIEWED':
      case 'UNDERSTANDING_CHECK_STARTED':
      case 'UNDERSTANDING_CHECK_COMPLETED': {
        if (activityId) {
          if (!activityBreakdown[activityId]) {
            activityBreakdown[activityId] = {
              activityId,
              unitId,
              lessonId,
              startedCount: 0,
              completedCount: 0,
            };
          }
          if (eventType === 'UNDERSTANDING_CHECK_COMPLETED') {
            activityBreakdown[activityId].completedCount++;
          } else {
            activityBreakdown[activityId].startedCount++;
          }
          activityBreakdown[activityId].lastInteractedAt = timestamp;
        }
        break;
      }

      // --- PRACTICE & DRILLS ---
      case 'PRACTICE_STARTED':
      case 'DRILL_STARTED': {
        practiceStarted++;
        break;
      }

      case 'PRACTICE_COMPLETED':
      case 'DRILL_COMPLETED': {
        practiceCompleted++;
        practiceAttempts++;
        if (unitId) getOrCreateUnit(unitId).practiceCompleted++;

        const isSuccess = metadata?.correctness === true || (typeof metadata?.score === 'number' && metadata.score >= 70);
        if (isSuccess) {
          successfulPracticeAttempts++;
        }

        const score = typeof metadata?.score === 'number' && !isNaN(metadata.score) ? metadata.score : undefined;
        if (score !== undefined) {
          practiceScores.push(score);
          latestPracticeScore = score;
        }

        const hintUsed = metadata?.hintUsed === true;
        if (hintUsed) {
          attemptsWithHints++;
        } else if (isSuccess) {
          independentSuccessfulAttempts++;
        }

        if (activityId) {
          if (!practiceBreakdown[activityId]) {
            practiceBreakdown[activityId] = {
              activityId,
              attemptsCount: 0,
              successfulAttemptsCount: 0,
              hintsRequested: 0,
            };
          }
          const p = practiceBreakdown[activityId];
          p.attemptsCount++;
          if (isSuccess) p.successfulAttemptsCount++;
          if (score !== undefined) {
            p.latestScore = score;
            p.bestScore = p.bestScore !== undefined ? Math.max(p.bestScore, score) : score;
          }
          p.lastPracticedAt = timestamp;
        }
        break;
      }

      // --- ASSESSMENTS ---
      case 'ASSESSMENT_STARTED': {
        assessmentAttempts++;
        if (unitId) getOrCreateUnit(unitId).assessmentAttempts++;
        if (assessmentId) {
          if (!assessmentBreakdown[assessmentId]) {
            assessmentBreakdown[assessmentId] = {
              assessmentId,
              unitId,
              attemptsCount: 0,
              completionsCount: 0,
              successfulAttemptsCount: 0,
            };
          }
          assessmentBreakdown[assessmentId].attemptsCount++;
          assessmentBreakdown[assessmentId].lastAttemptAt = timestamp;
        }
        break;
      }

      case 'ASSESSMENT_COMPLETED': {
        assessmentCompletions++;
        if (unitId) getOrCreateUnit(unitId).assessmentCompletions++;

        const isSuccess = metadata?.correctness === true || (typeof metadata?.score === 'number' && metadata.score >= 70);
        if (isSuccess) {
          successfulAttempts++;
        }

        const score = typeof metadata?.score === 'number' && !isNaN(metadata.score) ? metadata.score : undefined;
        if (score !== undefined) {
          assessmentScores.push(score);
          latestAssessmentScore = score;
        }

        const hintUsed = metadata?.hintUsed === true;
        if (hintUsed) {
          attemptsWithHints++;
        } else if (isSuccess) {
          independentSuccessfulAttempts++;
        }

        if (assessmentId) {
          if (!assessmentBreakdown[assessmentId]) {
            assessmentBreakdown[assessmentId] = {
              assessmentId,
              unitId,
              attemptsCount: 0,
              completionsCount: 0,
              successfulAttemptsCount: 0,
            };
          }
          const a = assessmentBreakdown[assessmentId];
          a.completionsCount++;
          if (a.attemptsCount < a.completionsCount) {
            a.attemptsCount = a.completionsCount;
          }
          if (isSuccess) a.successfulAttemptsCount++;
          if (score !== undefined) {
            a.latestScore = score;
            a.bestScore = a.bestScore !== undefined ? Math.max(a.bestScore, score) : score;
          }
          a.lastAttemptAt = timestamp;
        }

        if (unitId && score !== undefined) {
          const u = getOrCreateUnit(unitId);
          u.latestAssessmentScore = score;
          u.bestAssessmentScore = u.bestAssessmentScore !== undefined ? Math.max(u.bestAssessmentScore, score) : score;
        }
        break;
      }

      default:
        // Safely ignore unknown future event types without crashing or mutating counters
        break;
    }
  }

  // 6. Calculate derived statistics (averages, best scores) purely and safely
  const bestScore = assessmentScores.length > 0 ? Math.max(...assessmentScores) : undefined;
  const averageScore = assessmentScores.length > 0
    ? Math.round(assessmentScores.reduce((sum, s) => sum + s, 0) / assessmentScores.length)
    : undefined;

  const bestPracticeScore = practiceScores.length > 0 ? Math.max(...practiceScores) : undefined;
  const averagePracticeScore = practiceScores.length > 0
    ? Math.round(practiceScores.reduce((sum, s) => sum + s, 0) / practiceScores.length)
    : undefined;

  // Finalize averages and reconcile attempts across breakdowns
  const totalAssessmentAttempts = Math.max(assessmentAttempts, assessmentCompletions);
  const totalPracticeAttempts = Math.max(practiceAttempts, practiceCompleted);

  for (const u of Object.values(unitBreakdown)) {
    u.assessmentAttempts = Math.max(u.assessmentAttempts, u.assessmentCompletions);
  }

  for (const a of Object.values(assessmentBreakdown)) {
    if (a.attemptsCount < a.completionsCount) {
      a.attemptsCount = a.completionsCount;
    }
    // If best and latest are present, but average wasn't set:
    if (a.bestScore !== undefined && a.latestScore !== undefined) {
      a.averageScore = a.bestScore; // Default baseline if single score
    }
  }

  return {
    studentId: inferredStudentId,
    courseId: inferredCourseId,
    lessonsStarted,
    lessonsCompleted,
    simulationsStarted,
    simulationsCompleted,
    practiceStarted,
    practiceCompleted,
    assessmentAttempts: totalAssessmentAttempts,
    assessmentCompletions,
    successfulAttempts,
    bestScore,
    latestScore: latestAssessmentScore,
    averageScore,
    practiceAttempts: totalPracticeAttempts,
    successfulPracticeAttempts,
    bestPracticeScore,
    latestPracticeScore,
    averagePracticeScore,
    hintsRequested,
    attemptsWithHints,
    independentSuccessfulAttempts,
    errorCategoriesObserved,
    misconceptionsObserved,
    firstActivityAt,
    lastActivityAt,
    totalEventsCount: sortedEvents.length,
    unitBreakdown,
    lessonBreakdown,
    assessmentBreakdown,
    practiceBreakdown,
    activityBreakdown,
  };
}

/**
 * Creates a clean zero-state evidence summary structure.
 */
export function createEmptyEvidenceSummary(
  studentId: string,
  courseId: string = 'cs-4200'
): LearnerEvidenceSummary {
  return {
    studentId,
    courseId,
    lessonsStarted: 0,
    lessonsCompleted: 0,
    simulationsStarted: 0,
    simulationsCompleted: 0,
    practiceStarted: 0,
    practiceCompleted: 0,
    assessmentAttempts: 0,
    assessmentCompletions: 0,
    successfulAttempts: 0,
    practiceAttempts: 0,
    successfulPracticeAttempts: 0,
    hintsRequested: 0,
    attemptsWithHints: 0,
    independentSuccessfulAttempts: 0,
    errorCategoriesObserved: {},
    misconceptionsObserved: {},
    totalEventsCount: 0,
    unitBreakdown: {},
    lessonBreakdown: {},
    assessmentBreakdown: {},
    practiceBreakdown: {},
    activityBreakdown: {},
  };
}
