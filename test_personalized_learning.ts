/**
 * CRESCO Production — Step 24 Personalized Learning Engine Verification Test Suite
 *
 * Validates deterministic recommendation output, prerequisite enforcement,
 * priority ordering, remediation & mastery integration, missing evidence detection,
 * exclusion of unavailable items, student data isolation, and refresh reactivity.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 9: Recommendation)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 */

import { 
  evaluatePersonalizedRecommendations, 
  UNIT_PREREQUISITE_RULES 
} from './src/services/personalizedLearningService';
import { PersonalizationInput } from './src/types/personalization';
import { RemediationRecommendation } from './src/types/remediation';
import { ALL_MODULES } from './src/data/courseContent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runStep24PersonalizationTests() {
  console.log('--- Starting Step 24 Personalized Learning Engine Tests ---');

  // Test 1: Pure Determinism
  console.log('Test 1: Pure Determinism');
  const sampleInput: PersonalizationInput = {
    studentId: 'student_101',
    completedLessonIds: ['u3_m01'],
    practiceScores: { 'u3_m01': 85 }
  };
  const res1 = evaluatePersonalizedRecommendations(sampleInput);
  const res2 = evaluatePersonalizedRecommendations(sampleInput);
  assert(res1.primaryRecommendation?.id === res2.primaryRecommendation?.id, 'Deterministic primary recommendation ID');
  assert(res1.allEligibleRecommendations.length === res2.allEligibleRecommendations.length, 'Deterministic recommendation count');
  assert(
    JSON.stringify(res1.allEligibleRecommendations.map((r) => r.id)) === 
    JSON.stringify(res2.allEligibleRecommendations.map((r) => r.id)),
    'Deterministic ordering of all recommendations'
  );

  // Test 2: Prerequisite Enforcement (Transport Layer without Network Layer)
  console.log('Test 2: Prerequisite Barrier Enforcement');
  const jumpingAheadInput: PersonalizationInput = {
    studentId: 'student_202',
    completedLessonIds: ['u4_m05'], // Attempted Unit 4 without completing Unit 3 (7 modules required)
  };
  const prereqRes = evaluatePersonalizedRecommendations(jumpingAheadInput);
  assert(prereqRes.primaryRecommendation !== null, 'Primary recommendation must exist');
  assert(prereqRes.primaryRecommendation?.category === 'resolve_prerequisites', 'Must flag resolve_prerequisites as primary');
  assert(prereqRes.primaryRecommendation?.isMandatoryBarrier === true, 'Prerequisite must be a mandatory barrier');
  assert(prereqRes.primaryRecommendation?.unitId === 'unit_3', 'Prerequisite targets Unit 3');
  assert(prereqRes.summary.unmetPrerequisitesCount >= 1, 'Summary reflects unmet prerequisites');

  // Test 3: Prioritization of Eligible Activities (Remediation vs Next Lesson)
  console.log('Test 3: Priority Ordering (Remediation over Next Lesson)');
  const activeRem: RemediationRecommendation = {
    recommendationId: 'rem_tcp_01',
    gapId: 'gap_tcp_handshake',
    conceptId: 'tcp-3-way-handshake',
    conceptTitle: 'TCP Connection Management & Handshake',
    headline: 'Guided Simulation: TCP 3-Way Handshake',
    reason: 'Scored 50% on TCP handshake quiz. Review packet exchange sequence.',
    priority: 'high',
    activityType: 'guided_simulation',
    targetTab: 'simulator',
    targetLessonId: 'u4_m05',
    isMandatoryBarrier: true,
    isAvailable: true,
    status: 'active',
    evidenceRefs: ['quiz_attempt_99'],
    createdTimestamp: new Date().toISOString()
  };

  const remediationInput: PersonalizationInput = {
    studentId: 'student_303',
    completedLessonIds: ['u3_m01', 'u3_m02', 'u3_m03', 'u3_m04', 'u3_m05', 'u3_m06', 'u3_m07'], // Unit 3 satisfied
    remediationRecommendations: [activeRem]
  };
  const remRes = evaluatePersonalizedRecommendations(remediationInput);
  assert(remRes.primaryRecommendation?.category === 'strengthen_understanding', 'Remediation takes precedence as primary');
  assert(remRes.primaryRecommendation?.priority === 'high', 'Remediation retains high priority');
  assert(remRes.primaryRecommendation?.targetTab === 'simulator', 'Targets simulator view');
  assert(remRes.primaryRecommendation?.evidenceRefs.includes('quiz_attempt_99'), 'Maintains verifiable evidence reference');

  // Test 4: Missing or Insufficient Evidence Detection
  console.log('Test 4: Missing Evidence Detection (Needs Practice Drills)');
  const missingEvidenceInput: PersonalizationInput = {
    studentId: 'student_404',
    completedLessonIds: ['u3_m01'], // Explored lesson
    practiceScores: {} // 0 practice scores recorded!
  };
  const evidenceRes = evaluatePersonalizedRecommendations(missingEvidenceInput);
  const evidenceRec = evidenceRes.allEligibleRecommendations.find((r) => r.category === 'gather_evidence');
  assert(evidenceRec !== undefined, 'Must generate gather_evidence recommendation');
  assert(evidenceRec?.targetTab === 'practice', 'Directs student to practice view');
  assert(evidenceRec?.rationale.includes('practice drills'), 'Explains missing practice evidence in rationale');

  // Test 5: Standard Sequential Curriculum Progression (continue_learning)
  console.log('Test 5: Sequential Curriculum Progression');
  const freshStudentInput: PersonalizationInput = {
    studentId: 'student_fresh',
    completedLessonIds: []
  };
  const freshRes = evaluatePersonalizedRecommendations(freshStudentInput);
  assert(freshRes.primaryRecommendation?.category === 'continue_learning', 'Fresh student continues learning');
  assert(freshRes.primaryRecommendation?.targetLessonId === ALL_MODULES[0].id, 'Recommends first module u3_m01');
  assert(freshRes.primaryRecommendation?.priority === 'high', 'Primary lesson has high priority');

  // Test 6: Exclusion of Unavailable Activities
  console.log('Test 6: Unavailable Activities Exclusion');
  const unavailableRem: RemediationRecommendation = {
    recommendationId: 'rem_unavail_01',
    gapId: 'gap_ghost',
    conceptId: 'ghost-concept',
    conceptTitle: 'Unpublished Protocol',
    headline: 'Unauthored Material',
    reason: 'Test reason',
    priority: 'high',
    activityType: 'guided_simulation',
    targetTab: 'simulator',
    isMandatoryBarrier: false,
    isAvailable: false, // UNAVAILABLE!
    status: 'active',
    evidenceRefs: [],
    createdTimestamp: new Date().toISOString()
  };
  const unavailInput: PersonalizationInput = {
    studentId: 'student_505',
    completedLessonIds: ['u3_m01'],
    remediationRecommendations: [unavailableRem]
  };
  const unavailRes = evaluatePersonalizedRecommendations(unavailInput);
  const hasUnavailInEligible = unavailRes.allEligibleRecommendations.some((r) => r.id.includes('rem_unavail_01'));
  assert(!hasUnavailInEligible, 'Unavailable activity must NOT appear in eligible recommendations');

  // Test 7: Student Data Isolation & Security
  console.log('Test 7: Student Data Isolation');
  const emptyStudentRes = evaluatePersonalizedRecommendations({
    studentId: '   ',
    completedLessonIds: ['u3_m01']
  });
  assert(emptyStudentRes.primaryRecommendation === null, 'Empty studentId returns null primary');
  assert(emptyStudentRes.allEligibleRecommendations.length === 0, 'Empty studentId returns 0 recommendations');

  // Test 8: Recommendation Refresh after Real Evidence / Completion
  console.log('Test 8: Recommendation Refresh after Progress Update');
  const stepAInput: PersonalizationInput = {
    studentId: 'student_progress',
    completedLessonIds: ['u3_m1']
  };
  const stepARes = evaluatePersonalizedRecommendations(stepAInput);
  const nextModuleA = stepARes.allEligibleRecommendations.find((r) => r.category === 'continue_learning')?.targetLessonId;
  assert(nextModuleA === 'u3_m2' || nextModuleA === 'u3_m02', 'Next module after u3_m1 is u3_m2');

  // Simulate completing u3_m2
  const stepBInput: PersonalizationInput = {
    studentId: 'student_progress',
    completedLessonIds: ['u3_m1', 'u3_m2'],
    practiceScores: { 'u3_m1': 80, 'u3_m2': 90 }
  };
  const stepBRes = evaluatePersonalizedRecommendations(stepBInput);
  const nextModuleB = stepBRes.allEligibleRecommendations.find((r) => r.category === 'continue_learning')?.targetLessonId;
  assert(nextModuleB === 'u3_m3' || nextModuleB === 'u3_m03', 'Recommendations dynamically update to u3_m3');

  // Test 9: Spaced Retention Review (review_and_retain)
  console.log('Test 9: Spaced Retention Review');
  const retentionInput: PersonalizationInput = {
    studentId: 'student_veteran',
    completedLessonIds: ['u3_m01', 'u3_m02', 'u3_m03', 'u3_m04'], // 4 completed modules
    practiceScores: { 'u3_m01': 80, 'u3_m02': 90, 'u3_m03': 85, 'u3_m04': 95 }
  };
  const retentionRes = evaluatePersonalizedRecommendations(retentionInput);
  const reviewRec = retentionRes.allEligibleRecommendations.find((r) => r.category === 'review_and_retain');
  assert(reviewRec !== undefined, 'Spaced retention recommendation generated for >= 3 modules');
  assert(reviewRec?.targetTab === 'review', 'Targets review view');

  // Test 10: Complete Curriculum Honest Terminal State
  console.log('Test 10: Complete Curriculum Terminal State');
  const allIds = ALL_MODULES.map((m) => m.id);
  const completeInput: PersonalizationInput = {
    studentId: 'student_graduate',
    completedLessonIds: allIds,
    practiceScores: Object.fromEntries(allIds.map((id) => [id, 100]))
  };
  const completeRes = evaluatePersonalizedRecommendations(completeInput);
  assert(completeRes.summary.isCourseCompleted === true, 'Course completion marked true');
  assert(completeRes.summary.nextLessonId === undefined, 'No fake lessons invented');

  console.log('--- ALL STEP 24 PERSONALIZED LEARNING ENGINE TESTS PASSED (100%) ---');
}

runStep24PersonalizationTests().catch((err) => {
  console.error('Personalization test suite failed:', err);
  process.exit(1);
});
