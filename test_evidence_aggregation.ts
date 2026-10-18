/**
 * CRESCO Evidence Aggregation Layer - Unit & Determinism Verification
 *
 * Verifies that raw LearningEvents are deterministically transformed into
 * a canonical LearnerEvidenceSummary without pedagogical bias, score fabrication,
 * or order sensitivity.
 */

import { aggregateLearningEvents, createEmptyEvidenceSummary } from './src/services/evidenceAggregationService';
import { LearningEvent } from './src/types/learningEvents';

console.log('====================================================');
console.log('🧪 CRESCO EVIDENCE AGGREGATION LAYER VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
  }
}

// 1. EMPTY / ZERO STATE TEST
console.log('--- 1. Empty State & Initialization ---');
const emptySummary = aggregateLearningEvents([]);
assert(emptySummary.totalEventsCount === 0, 'Zero events yields 0 totalEventsCount');
assert(emptySummary.lessonsCompleted === 0, 'Zero events yields 0 lessonsCompleted');
assert(emptySummary.assessmentAttempts === 0, 'Zero events yields 0 assessmentAttempts');
assert(emptySummary.bestScore === undefined, 'Zero events leaves bestScore undefined');
assert(emptySummary.latestScore === undefined, 'Zero events leaves latestScore undefined');

// 2. EXAMPLE 1: LESSON COMPLETION EVENTS
console.log('\n--- 2. Example 1: Lesson Completion Events ---');
const lessonEvents: LearningEvent[] = [
  {
    eventId: 'evt_l1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    lessonId: 'u3_m01',
    eventType: 'LESSON_STARTED',
    timestamp: '2026-10-07T10:00:00.000Z',
    sessionId: 'sess_1',
  },
  {
    eventId: 'evt_l2',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    lessonId: 'u3_m01',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T10:15:00.000Z',
    sessionId: 'sess_1',
    metadata: { completionPercentage: 100, durationMs: 900000 },
  },
  {
    eventId: 'evt_l3',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    lessonId: 'u3_m02',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T10:30:00.000Z',
    sessionId: 'sess_1',
    metadata: { completionPercentage: 100 },
  },
  {
    eventId: 'evt_l4',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-4',
    lessonId: 'u4_m01',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T10:45:00.000Z',
    sessionId: 'sess_1',
    metadata: { completionPercentage: 100 },
  },
];

const lessonSummary = aggregateLearningEvents(lessonEvents);
assert(lessonSummary.lessonsStarted === 1, 'Correctly counted 1 lesson started');
assert(lessonSummary.lessonsCompleted === 3, 'Correctly counted 3 lessons completed');
assert(lessonSummary.unitBreakdown['unit-3']?.lessonsCompleted === 2, 'Unit 3 breakdown records 2 completed lessons');
assert(lessonSummary.unitBreakdown['unit-4']?.lessonsCompleted === 1, 'Unit 4 breakdown records 1 completed lesson');
assert(lessonSummary.lessonBreakdown['u3_m01']?.isCompleted === true, 'Lesson u3_m01 breakdown flagged as completed');
assert(lessonSummary.lessonBreakdown['u3_m01']?.totalDurationMs === 900000, 'Lesson u3_m01 duration tracked accurately');

// 3. EXAMPLE 2: ASSESSMENT ATTEMPTS & SCORE COMPUTATION
console.log('\n--- 3. Example 2: Assessment Attempts & Scores ---');
const assessmentEvents: LearningEvent[] = [
  {
    eventId: 'evt_a1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    assessmentId: 'quiz_unit-3',
    eventType: 'ASSESSMENT_COMPLETED',
    timestamp: '2026-10-07T11:00:00.000Z',
    sessionId: 'sess_1',
    metadata: { score: 65, correctness: false, attemptNumber: 1 },
  },
  {
    eventId: 'evt_a2',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    assessmentId: 'quiz_unit-3',
    eventType: 'ASSESSMENT_COMPLETED',
    timestamp: '2026-10-07T11:30:00.000Z',
    sessionId: 'sess_1',
    metadata: { score: 90, correctness: true, attemptNumber: 2 },
  },
  {
    eventId: 'evt_a3',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    assessmentId: 'quiz_unit-3',
    eventType: 'ASSESSMENT_COMPLETED',
    timestamp: '2026-10-07T12:00:00.000Z',
    sessionId: 'sess_1',
    metadata: { score: 85, correctness: true, attemptNumber: 3 },
  },
];

const assessSummary = aggregateLearningEvents(assessmentEvents);
assert(assessSummary.assessmentAttempts === 3, 'Correctly recorded 3 assessment attempts');
assert(assessSummary.assessmentCompletions === 3, 'Correctly recorded 3 assessment completions');
assert(assessSummary.successfulAttempts === 2, 'Correctly counted 2 successful attempts');
assert(assessSummary.bestScore === 90, 'Highest real score identified (bestScore = 90)', `Got: ${assessSummary.bestScore}`);
assert(assessSummary.latestScore === 85, 'Latest chronological score identified (latestScore = 85)', `Got: ${assessSummary.latestScore}`);
assert(assessSummary.averageScore === 80, 'Accurate average calculated ((65 + 90 + 85) / 3 = 80)', `Got: ${assessSummary.averageScore}`);

// 4. EXAMPLE 3: PRACTICE & HINTS (INDEPENDENCE EVIDENCE)
console.log('\n--- 4. Example 3: Practice & Independence Evidence ---');
const practiceEvents: LearningEvent[] = [
  {
    eventId: 'evt_p1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    activityId: 'practice_subnetting',
    eventType: 'HINT_REQUESTED',
    timestamp: '2026-10-07T13:00:00.000Z',
    sessionId: 'sess_2',
  },
  {
    eventId: 'evt_p2',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    activityId: 'practice_subnetting',
    eventType: 'PRACTICE_COMPLETED',
    timestamp: '2026-10-07T13:05:00.000Z',
    sessionId: 'sess_2',
    metadata: { score: 80, correctness: true, hintUsed: true },
  },
  {
    eventId: 'evt_p3',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    activityId: 'practice_subnetting',
    eventType: 'PRACTICE_COMPLETED',
    timestamp: '2026-10-07T13:15:00.000Z',
    sessionId: 'sess_2',
    metadata: { score: 100, correctness: true, hintUsed: false },
  },
];

const practiceSummary = aggregateLearningEvents(practiceEvents);
assert(practiceSummary.hintsRequested === 1, 'hintsRequested counted accurately (1)');
assert(practiceSummary.attemptsWithHints === 1, 'attemptsWithHints counted accurately (1)');
assert(practiceSummary.independentSuccessfulAttempts === 1, 'independentSuccessfulAttempts counted accurately (1)');
assert(practiceSummary.bestPracticeScore === 100, 'bestPracticeScore is 100');
assert(practiceSummary.latestPracticeScore === 100, 'latestPracticeScore is 100');

// 5. EXAMPLE 4: OUT-OF-ORDER EVENT ORDERING
console.log('\n--- 5. Example 4: Temporal Sorting & Out-of-Order Events ---');
const outOfOrderEvents: LearningEvent[] = [
  {
    eventId: 'evt_order_3',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T16:00:00.000Z', // LATEST
    sessionId: 'sess_3',
  },
  {
    eventId: 'evt_order_1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'COURSE_STARTED',
    timestamp: '2026-10-07T08:00:00.000Z', // EARLIEST
    sessionId: 'sess_3',
  },
  {
    eventId: 'evt_order_2',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'LESSON_STARTED',
    timestamp: '2026-10-07T12:00:00.000Z', // MIDDLE
    sessionId: 'sess_3',
  },
];

const orderedSummary = aggregateLearningEvents(outOfOrderEvents);
assert(orderedSummary.firstActivityAt === '2026-10-07T08:00:00.000Z', 'firstActivityAt matches earliest timestamp regardless of array order');
assert(orderedSummary.lastActivityAt === '2026-10-07T16:00:00.000Z', 'lastActivityAt matches latest timestamp regardless of array order');

// 6. EXAMPLE 5: MISSING & MALFORMED METADATA RESILIENCE
console.log('\n--- 6. Example 5: Missing Metadata Resilience ---');
const missingMetadataEvents: LearningEvent[] = [
  {
    eventId: 'evt_m1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'ASSESSMENT_COMPLETED',
    timestamp: '2026-10-07T17:00:00.000Z',
    sessionId: 'sess_4',
    // Completely missing metadata
  },
  {
    eventId: 'evt_m2',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'ASSESSMENT_COMPLETED',
    timestamp: '2026-10-07T17:10:00.000Z',
    sessionId: 'sess_4',
    metadata: {
      errorCategory: 'SYNTAX_MISMATCH',
      // Score intentionally omitted
    },
  },
];

const resilientSummary = aggregateLearningEvents(missingMetadataEvents);
assert(resilientSummary.assessmentAttempts === 2, 'Attempts counted even when metadata is omitted');
assert(resilientSummary.bestScore === undefined, 'Missing scores remain undefined (NOT converted to fake 0)');
assert(resilientSummary.latestScore === undefined, 'Latest score remains undefined when no scores exist');
assert(resilientSummary.averageScore === undefined, 'Average score remains undefined when no scores exist');
assert(resilientSummary.errorCategoriesObserved['SYNTAX_MISMATCH'] === 1, 'Error category recorded without crash');

// 7. EXAMPLE 6: UNKNOWN FUTURE EVENT TYPES
console.log('\n--- 7. Example 6: Unknown Future Event Type Tolerance ---');
const unknownEvent = {
  eventId: 'evt_future_99',
  studentId: 'stu_001',
  courseId: 'cs-4200',
  eventType: 'QUANTUM_TELEPORTATION_COMPLETED' as any,
  timestamp: '2026-10-07T18:00:00.000Z',
  sessionId: 'sess_5',
};

const withUnknownSummary = aggregateLearningEvents([unknownEvent]);
assert(withUnknownSummary.totalEventsCount === 1, 'Unknown event type counts towards totalEventsCount');
assert(withUnknownSummary.lastActivityAt === '2026-10-07T18:00:00.000Z', 'Timestamp from unknown event is preserved');
assert(withUnknownSummary.lessonsCompleted === 0, 'Unknown event does not corrupt known counters');

// 8. DEDUPLICATION INTEGRITY
console.log('\n--- 8. Event Deduplication ---');
const duplicateEvents: LearningEvent[] = [
  {
    eventId: 'evt_dup_1',
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T19:00:00.000Z',
    sessionId: 'sess_6',
  },
  {
    eventId: 'evt_dup_1', // Exact duplicate eventId
    studentId: 'stu_001',
    courseId: 'cs-4200',
    eventType: 'LESSON_COMPLETED',
    timestamp: '2026-10-07T19:00:00.000Z',
    sessionId: 'sess_6',
  },
];

const dedupSummary = aggregateLearningEvents(duplicateEvents);
assert(dedupSummary.totalEventsCount === 1, 'Duplicate eventId processed exactly once');
assert(dedupSummary.lessonsCompleted === 1, 'Counter not inflated by duplicate event');

// 9. STRICT ABSENCE OF PEDAGOGY DECISIONS
console.log('\n--- 9. Pedagogical Decision Isolation ---');
const summaryKeys = Object.keys(dedupSummary);
assert(!summaryKeys.includes('masteryScore'), 'Summary contains NO masteryScore field');
assert(!summaryKeys.includes('isMastered'), 'Summary contains NO isMastered field');
assert(!summaryKeys.includes('masteryState'), 'Summary contains NO masteryState field');
assert(!summaryKeys.includes('nextAction'), 'Summary contains NO nextAction field');
assert(!summaryKeys.includes('recommendedLesson'), 'Summary contains NO recommendedLesson field');
assert(!summaryKeys.includes('unlockNextLevel'), 'Summary contains NO unlockNextLevel field');

console.log('\n====================================================');
console.log(`📊 EVIDENCE AGGREGATION TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
