/**
 * CRESCO Production — Step 21 Mastery Engine Verification Test Suite
 * 
 * Tests:
 * 1. Pure Determinism: Identical evidence + config produces strictly identical decisions.
 * 2. Event Deduplication: Duplicate events are deduplicated without inflating evidence.
 * 3. Five Evidence Pillars:
 *    - Pillar 1: Summative Assessment
 *    - Pillar 2: Practice Volume & Repetition
 *    - Pillar 3: Application / Packet Simulation Lab
 *    - Pillar 4: Independence & Hint Reliance Ratio
 *    - Pillar 5: Spaced Retention Verification
 * 4. Insufficient Evidence handling across all stages (not_started, learning, developing, ready_for_assessment).
 * 5. Academic Threshold Governance:
 *    - When policyStatus is 'pending_academic_approval', state is 'pending_policy' and isMastered is false.
 *    - When policyStatus is 'approved', state becomes 'mastered' and isMastered is true.
 * 6. Prerequisite Barriers:
 *    - Missing prerequisites enforce 'needs_support' and block progression.
 * 7. Invalid, incomplete, and malformed evidence exclusion.
 * 8. Conflicting evidence handling (e.g. high test score but excessive hints or missing simulation).
 * 9. Persistence Service & Trusted-Backend Boundaries:
 *    - Rejection of student ID mismatch.
 *    - Explicit identification of TRUSTED_MASTERY_BACKEND_DEPENDENCY.
 * 10. Canonical MasteryRecord formatting.
 */

import { evaluateMastery, createMasteryRecordFromEvaluation } from './src/services/masteryEngineService';
import { 
  persistMasteryDecision, 
  TRUSTED_MASTERY_BACKEND_DEPENDENCY 
} from './src/services/masteryPersistenceService';
import { LearningEvent } from './src/types/learningEvents';
import { LearnerEvidenceSummary } from './src/types/evidenceSummary';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runStep21MasteryTests() {
  console.log('--- Starting Step 21 Evidence-Based Mastery Engine Tests ---');

  // Helper to generate simulated events
  const generateMockEvents = (studentId: string, unitId: string): LearningEvent[] => [
    {
      eventId: 'evt-1',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'LESSON_STARTED',
      timestamp: '2026-10-01T10:00:00Z',
      sessionId: 'sess-1'
    },
    {
      eventId: 'evt-2',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'LESSON_COMPLETED',
      timestamp: '2026-10-01T10:30:00Z',
      sessionId: 'sess-1',
      metadata: { score: 100 }
    },
    {
      eventId: 'evt-3',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'PRACTICE_COMPLETED',
      timestamp: '2026-10-02T11:00:00Z',
      sessionId: 'sess-2',
      metadata: { score: 90, correctness: true }
    },
    {
      eventId: 'evt-4',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'PRACTICE_COMPLETED',
      timestamp: '2026-10-03T11:00:00Z',
      sessionId: 'sess-3',
      metadata: { score: 95, correctness: true }
    },
    {
      eventId: 'evt-5',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'PRACTICE_COMPLETED',
      timestamp: '2026-10-04T11:00:00Z',
      sessionId: 'sess-4',
      metadata: { score: 100, correctness: true }
    },
    {
      eventId: 'evt-6',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'SIMULATION_COMPLETED',
      timestamp: '2026-10-05T14:00:00Z',
      sessionId: 'sess-5'
    },
    {
      eventId: 'evt-7',
      studentId,
      courseId: 'cs-4200',
      unitId,
      eventType: 'ASSESSMENT_COMPLETED',
      timestamp: '2026-10-10T16:00:00Z',
      sessionId: 'sess-6',
      metadata: { score: 92, correctness: true }
    }
  ];

  // Test 1: Determinism (Identical inputs -> identical outputs)
  console.log('Test 1: Pure Determinism');
  const events = generateMockEvents('student_test_1', 'unit_3');
  const res1 = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: events,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  const res2 = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: events,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });

  assert(JSON.stringify(res1) === JSON.stringify(res2), 'Identical inputs must yield identical decision objects');
  assert(res1.masteryScore === res2.masteryScore, 'Mastery score must be strictly deterministic');

  // Test 2: Event Deduplication
  console.log('Test 2: Event Deduplication & Evidence Hygiene');
  const duplicatedEvents = [...events, events[0], events[1], events[2]];
  const resDedup = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: duplicatedEvents,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  assert(resDedup.pillars.practice.attemptsCount === 3, `Expected 3 practice attempts after deduplication, got ${resDedup.pillars.practice.attemptsCount}`);
  assert(resDedup.pillars.assessment.attemptsCount === 1, `Expected 1 assessment attempt, got ${resDedup.pillars.assessment.attemptsCount}`);

  // Test 3: Insufficient Evidence — Stage Transitions
  console.log('Test 3: Progression States (not_started, learning, developing, ready_for_assessment)');
  
  // Empty events -> not_started
  const emptyRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: []
  });
  assert(emptyRes.masteryState === 'not_started', 'Empty evidence should result in not_started');
  assert(emptyRes.nextAction.action === 'start_lesson', 'Next action should be start_lesson');

  // Lesson in progress -> learning
  const lessonEvents: LearningEvent[] = [{
    eventId: 'e-1',
    studentId: 'student_test_1',
    courseId: 'cs-4200',
    unitId: 'unit_3',
    eventType: 'LESSON_STARTED',
    timestamp: '2026-10-01T10:00:00Z',
    sessionId: 's-1'
  }];
  const learningRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: lessonEvents
  });
  assert(learningRes.masteryState === 'learning', 'Uncompleted lesson should result in learning state');

  // Lessons complete but no practice -> developing
  const completedLessonEvents: LearningEvent[] = [
    ...lessonEvents,
    {
      eventId: 'e-2',
      studentId: 'student_test_1',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      eventType: 'LESSON_COMPLETED',
      timestamp: '2026-10-01T10:30:00Z',
      sessionId: 's-1',
      metadata: { score: 100 }
    }
  ];
  const devRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: completedLessonEvents
  });
  assert(devRes.masteryState === 'developing', '0 practice drills should be in developing state');
  assert(devRes.nextAction.action === 'continue_practice', 'Action should prompt practice drills');

  // Test 4: Academic Threshold Governance (Pending Policy vs Approved Policy)
  console.log('Test 4: Academic Policy Governance & Honesty');
  // res1 has all 5 pillars satisfied, but default policy is 'pending_academic_approval'
  assert(res1.masteryState === 'pending_policy', `Expected 'pending_policy' when policy is unapproved, got ${res1.masteryState}`);
  assert(res1.isMastered === false, 'isMastered must remain false when policy is pending academic approval');
  assert(res1.unresolvedPolicies.length > 0, 'Unresolved policies must explicitly list pending 85% review');

  // When policy is explicitly approved by authorized academic owner:
  const approvedRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: events,
    config: {
      policyStatus: 'approved'
    },
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  assert(approvedRes.masteryState === 'mastered', `Expected 'mastered' when policy is approved, got ${approvedRes.masteryState}`);
  assert(approvedRes.isMastered === true, 'isMastered should be true when approved and all pillars satisfied');
  assert(approvedRes.nextAction.action === 'advance_to_next_topic', 'Next action should advance to next topic');

  // Test 5: Prerequisite Barriers
  console.log('Test 5: Prerequisite Enforcement');
  const prereqRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_4',
    evidence: events,
    config: {
      prerequisites: ['unit_3']
    },
    prerequisiteMasteryRecords: {
      // Unit 3 not mastered yet
    }
  });
  assert(prereqRes.prerequisitesMet === false, 'Prerequisites should not be met');
  assert(prereqRes.masteryState === 'needs_support', 'Unmet prerequisite should yield needs_support');
  assert(prereqRes.nextAction.action === 'clear_prerequisite', 'Next action should guide to clearing prerequisite');

  // Test 6: Conflicting Evidence — High Quiz Score but Excessive Hint Reliance
  console.log('Test 6: Conflicting Evidence (High score + Hint Reliance)');
  const highHintsEvents: LearningEvent[] = [
    ...events,
    {
      eventId: 'evt-h1',
      studentId: 'student_test_1',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      eventType: 'HINT_REQUESTED',
      timestamp: '2026-10-02T10:55:00Z',
      sessionId: 'sess-2'
    },
    {
      eventId: 'evt-h2',
      studentId: 'student_test_1',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      eventType: 'HINT_REQUESTED',
      timestamp: '2026-10-03T10:55:00Z',
      sessionId: 'sess-3'
    },
    {
      eventId: 'evt-h3',
      studentId: 'student_test_1',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      eventType: 'HINT_REQUESTED',
      timestamp: '2026-10-04T10:55:00Z',
      sessionId: 'sess-4'
    }
  ];
  const hintRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: highHintsEvents,
    config: {
      maximumHintRelianceRatio: 0.1 // Max 10% hint reliance
    }
  });
  assert(!hintRes.pillars.independence.satisfied, 'High hint usage must fail independence pillar');
  assert(hintRes.isMastered === false, 'High hint usage must prevent mastery');

  // Test 7: Malformed / Unknown Event Filtering
  console.log('Test 7: Malformed Evidence Filtering');
  const malformedEvents: any[] = [
    null,
    undefined,
    { invalid: true },
    { eventId: 'valid-1', studentId: 'student_test_1', eventType: 'UNKNOWN_FUTURE_EVENT' },
    ...events
  ];
  const malformedRes = evaluateMastery({
    studentId: 'student_test_1',
    scopeId: 'unit_3',
    evidence: malformedEvents as LearningEvent[]
  });
  assert(malformedRes.pillars.assessment.attemptsCount === 1, 'Malformed events safely handled');

  // Test 8: Canonical MasteryRecord Schema Output
  console.log('Test 8: Canonical MasteryRecord Output');
  const record = createMasteryRecordFromEvaluation(approvedRes, 'Unit 3: Network Layer', 'unit_3');
  assert(record.recordId === 'student_test_1_unit_3', 'Record ID matches canonical format');
  assert(record.studentId === 'student_test_1', 'Student ID matches');
  assert(record.masteryState === 'mastered', 'Mastery state matches evaluation');
  assert(record.masteryScore === approvedRes.masteryScore, 'Score matches evaluation');

  // Test 9: Persistence Boundaries & Student ID Mismatch Guard
  console.log('Test 9: Persistence Security & Trusted-Backend Boundaries');
  const authMismatch = await persistMasteryDecision(
    approvedRes,
    'different_attacker_id', // mismatch
    'Unit 3: Network Layer',
    'unit_3'
  );
  assert(authMismatch.success === false, 'Student ID mismatch must fail immediately');
  assert(authMismatch.error?.includes('Security Violation'), 'Security error message returned');

  // Validate Trusted Backend Dependency declaration
  assert(Boolean(TRUSTED_MASTERY_BACKEND_DEPENDENCY.requiredService), 'Trusted backend dependency clearly defined');
  assert(TRUSTED_MASTERY_BACKEND_DEPENDENCY.targetCollection === '/mastery/{recordId}', 'Target collection documented');

  console.log('--- ALL STEP 21 MASTERY ENGINE TESTS PASSED (100%) ---');
}

runStep21MasteryTests().catch((err) => {
  console.error('Mastery test failure:', err);
  process.exit(1);
});
