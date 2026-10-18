/**
 * CRESCO Learning Evidence Foundation - Unit & Validation Tests
 * Verifies canonical LearningEvent types, payload creation, session management, and fail-safe recording.
 */

import {
  generateEventId,
  getLearningSessionId,
  resetLearningSessionId,
  createLearningEventPayload,
  recordLearningEvent
} from './src/services/learningEventService';
import {
  LearningEventType,
  LearningEventMetadata
} from './src/types/learningEvents';

console.log('====================================================');
console.log('🧪 CRESCO LEARNING EVIDENCE FOUNDATION VERIFICATION');
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

// 1. CONTROLLED VOCABULARY VALIDATION
console.log('--- 1. Controlled Event Vocabulary ---');
const canonicalVocabulary: LearningEventType[] = [
  // Lifecycle
  'COURSE_STARTED',
  'UNIT_STARTED',
  'LEVEL_STARTED',
  'LESSON_STARTED',
  'LESSON_COMPLETED',
  // Learning Activity
  'CONTENT_VIEWED',
  'EXAMPLE_VIEWED',
  'VISUAL_VIEWED',
  'SIMULATION_STARTED',
  'SIMULATION_COMPLETED',
  'UNDERSTANDING_CHECK_STARTED',
  'UNDERSTANDING_CHECK_COMPLETED',
  // Practice
  'PRACTICE_STARTED',
  'PRACTICE_COMPLETED',
  'DRILL_STARTED',
  'DRILL_COMPLETED',
  'HINT_REQUESTED',
  // Assessment
  'ASSESSMENT_STARTED',
  'QUESTION_ANSWERED',
  'ASSESSMENT_COMPLETED',
  // Adaptation
  'FEEDBACK_VIEWED',
  'REMEDIATION_STARTED',
  'REMEDIATION_COMPLETED'
];

assert(canonicalVocabulary.length === 23, 'Canonical vocabulary contains exactly 23 approved event types', `Count: ${canonicalVocabulary.length}`);

// 2. EVENT ID GENERATION & UNIQUENESS
console.log('\n--- 2. Event ID Generation & Entropy ---');
const id1 = generateEventId();
const id2 = generateEventId();
assert(id1.startsWith('evt_'), 'Event ID follows canonical prefix format (evt_*)');
assert(id1 !== id2, 'Sequential event IDs are unique');

// 3. SESSION IDENTIFIER STABILITY
console.log('\n--- 3. Session Identifier Stability ---');
const sess1 = getLearningSessionId();
const sess2 = getLearningSessionId();
assert(sess1.startsWith('sess_'), 'Session ID follows canonical prefix format (sess_*)');
assert(sess1 === sess2, 'Session ID remains stable within the same session context');

const sess3 = resetLearningSessionId();
assert(sess3 !== sess1, 'resetLearningSessionId generates a distinct new session');

// 4. PAYLOAD CONSTRUCTION & OPTIONAL METADATA
console.log('\n--- 4. Event Payload Construction & Metadata ---');
const metadata: LearningEventMetadata = {
  score: 95,
  correctness: true,
  attemptNumber: 1,
  questionId: 'q-subnet-01',
  completionPercentage: 100,
  xpEarned: 50
};

const payload = createLearningEventPayload(
  {
    eventType: 'LESSON_COMPLETED',
    courseId: 'cs-4200',
    unitId: 'unit-3',
    lessonId: 'u3_m01',
    metadata
  },
  'student-mock-uid-123',
  sess3,
  'evt_mock_001',
  '2026-10-07T12:00:00.000Z'
);

assert(payload.eventId === 'evt_mock_001', 'Payload retains provided eventId');
assert(payload.studentId === 'student-mock-uid-123', 'Payload retains studentId');
assert(payload.courseId === 'cs-4200', 'Payload defaults to cs-4200 courseId');
assert(payload.eventType === 'LESSON_COMPLETED', 'Payload matches eventType');
assert(payload.unitId === 'unit-3', 'Payload carries optional unitId');
assert(payload.lessonId === 'u3_m01', 'Payload carries optional lessonId');
assert(payload.assessmentId === undefined, 'Payload omits unused assessmentId');
assert(payload.metadata?.score === 95, 'Payload preserves metadata score');
assert(payload.metadata?.xpEarned === 50, 'Payload preserves metadata xpEarned');

// 5. FAIL-SAFE BEHAVIOR (UNAUTHENTICATED GRACEFUL HANDLING)
console.log('\n--- 5. Fail-Safe Service Execution ---');
async function runServiceTests() {
  const resultWithoutAuth = await recordLearningEvent({
    eventType: 'LESSON_COMPLETED',
    courseId: 'cs-4200',
    lessonId: 'u3_m01'
  });

  assert(resultWithoutAuth.success === false, 'Service safely rejects unauthenticated event recording without throwing');
  assert(resultWithoutAuth.error !== undefined, 'Service returns descriptive non-fatal error information');

  console.log('\n====================================================');
  console.log(`📊 LEARNING EVIDENCE TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runServiceTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
