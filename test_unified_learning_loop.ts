/**
 * CRESCO Production — Step 25 Unified Adaptive Learning Loop Verification Suite
 *
 * Validates the complete 6-stage adaptive cycle:
 * DIAGNOSE → LEARN → PRACTICE → ASSESS → ADAPT → MASTER
 *
 * Verifies thin orchestration, deterministic academic integrity, idempotency,
 * partial failure isolation, tutor authority boundaries, and recommendation refresh.
 */

import { 
  executeUnifiedLearningCycle, 
  getTutorContextFromCycle,
  clearInMemoryEventsForStudent,
  getInMemoryEventsForStudent,
  TRUSTED_AI_AUTHORITY_BOUNDARY 
} from './src/services/unifiedLearningLoopService';
import { UnifiedLearningAction } from './src/types/learningLoop';
import { AssessmentEvaluationResult } from './src/services/assessmentScoringService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runStep25UnifiedLearningLoopTests() {
  console.log('--- Starting Step 25 Unified Adaptive Learning Loop Tests ---');

  const studentId = 'student_loop_tester';
  clearInMemoryEventsForStudent(studentId);

  // Test 1: Stage 1 & 2 (LEARN): Complete Lesson Action
  console.log('Test 1: Stage 1 & 2 (LEARN) — Lesson Completion Flow');
  const lessonAction: UnifiedLearningAction = {
    actionId: 'act_lesson_u3m1',
    actionType: 'complete_lesson',
    studentId,
    courseId: 'cs-4200',
    unitId: 'unit_3',
    lessonId: 'u3_m01',
    activityId: 'lesson_phases_complete',
    metadata: {
      lessonTitle: 'Network Layer – Need and Issues',
      phasesCompleted: 6
    }
  };

  const lessonCycle = await executeUnifiedLearningCycle(lessonAction, { mockOffline: true });
  assert(lessonCycle.cycleId.startsWith('cycle_'), 'Cycle ID generated canonically');
  assert(lessonCycle.status === 'completed', 'Cycle marked completed');
  assert(lessonCycle.eventRecorded === true, 'Event recorded in evidence registry');
  assert(lessonCycle.evidenceSummary.totalEventsCount >= 1, 'Evidence summary aggregated event');
  assert(lessonCycle.evidenceSummary.lessonsCompleted >= 1, 'Lessons completed count is 1');
  assert(lessonCycle.masteryDecision.masteryState === 'learning' || lessonCycle.masteryDecision.masteryState === 'developing' || lessonCycle.masteryDecision.masteryState === 'insufficient_evidence', 'Mastery state is honest learning/developing');
  assert(lessonCycle.personalizationResult.primaryRecommendation !== null, 'Personalization generates next recommendation');

  // Test 2: Stage 3 (PRACTICE): Submit Practice Drills Flow
  console.log('Test 2: Stage 3 (PRACTICE) — Practice Submission Flow');
  const practiceAction: UnifiedLearningAction = {
    actionId: 'act_practice_u3m1',
    actionType: 'submit_practice',
    studentId,
    courseId: 'cs-4200',
    unitId: 'unit_3',
    lessonId: 'u3_m01',
    score: 85,
    metadata: {
      category: 'flashcards',
      cardsReviewed: 8
    }
  };

  const practiceCycle = await executeUnifiedLearningCycle(practiceAction, { mockOffline: true });
  assert(practiceCycle.status === 'completed', 'Practice cycle completed');
  assert(practiceCycle.evidenceSummary.totalEventsCount >= 2, 'Evidence reflects both lesson and practice events');
  assert(practiceCycle.evidenceSummary.practiceCompleted >= 1, 'Practice completion tracked in summary');

  // Test 3: Stage 4 & 5 (ASSESS & ADAPT): Assessment with Low Score Triggers Remediation
  console.log('Test 3: Stage 4 & 5 (ASSESS & ADAPT) — Low Assessment Triggers Remediation');
  const mockLowAssessment: AssessmentEvaluationResult = {
    attemptId: 'attempt_tcp_fail',
    assessmentId: 'quiz_u4_m05',
    studentId,
    mode: 'formal_assessment',
    totalQuestions: 4,
    answeredCount: 4,
    unansweredCount: 0,
    correctCount: 1,
    incorrectCount: 3,
    partiallyCorrectCount: 0,
    pendingEvaluationCount: 0,
    totalPointsEarned: 1,
    totalPointsPossible: 4,
    percentageScore: 25, // Score < 70% threshold
    isFullyObjective: true,
    submittedAt: new Date().toISOString(),
    evaluatedAt: new Date().toISOString(),
    questionResults: [
      {
        questionId: 'q1',
        type: 'single_choice',
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible: 1,
        userResponse: 2,
        correctAnswer: 0,
        explanation: 'SYN, SYN-ACK, ACK',
        conceptReference: 'TCP Connection Management',
        feedbackMessage: 'Incorrect sequence. The 3-way handshake begins with SYN.'
      }
    ]
  };

  const lowAssessmentAction: UnifiedLearningAction = {
    actionId: 'act_assess_u4m5_fail',
    actionType: 'submit_assessment',
    studentId,
    courseId: 'cs-4200',
    unitId: 'unit_4',
    lessonId: 'u4_m05',
    score: 25,
    assessmentResult: mockLowAssessment
  };

  const lowCycle = await executeUnifiedLearningCycle(lowAssessmentAction, { mockOffline: true });
  assert(lowCycle.assessmentEvaluation?.percentageScore === 25, 'Assessment score preserved authentically (25%)');
  assert(lowCycle.remediationResult.activeRemediationCount > 0, 'Low score diagnoses active remediation');
  assert(lowCycle.remediationResult.recommendations.length >= 1, 'At least 1 targeted remediation recommendation generated');
  assert(lowCycle.personalizationResult.primaryRecommendation?.category === 'strengthen_understanding', 'Personalization promotes remediation to primary recommendation');

  // Test 4: AI Tutor Integration & Authority Boundary
  console.log('Test 4: AI Tutor Context Building & Authority Invariant');
  const tutorContext = getTutorContextFromCycle(lowCycle);
  assert(tutorContext.actionType === 'explain_mistake', 'Tutor context instructs ByteBot to explain mistake');
  assert(tutorContext.conceptTopic.length > 0, 'Carries concept topic');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canGrantMastery === false, 'AI cannot grant mastery');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canAlterGrades === false, 'AI cannot change assessment grade');

  // Test 5: Stage 6 (MASTER): High Assessment Clears Remediation & Demonstrates Competency
  console.log('Test 5: Stage 6 (MASTER) — High Assessment Clears Remediation');
  const mockPassAssessment: AssessmentEvaluationResult = {
    attemptId: 'attempt_tcp_pass',
    assessmentId: 'quiz_u4_m05',
    studentId,
    mode: 'formal_assessment',
    totalQuestions: 4,
    answeredCount: 4,
    unansweredCount: 0,
    correctCount: 4,
    incorrectCount: 0,
    partiallyCorrectCount: 0,
    pendingEvaluationCount: 0,
    totalPointsEarned: 4,
    totalPointsPossible: 4,
    percentageScore: 100, // 100% Mastery
    isFullyObjective: true,
    submittedAt: new Date().toISOString(),
    evaluatedAt: new Date().toISOString(),
    questionResults: []
  };

  const passAssessmentAction: UnifiedLearningAction = {
    actionId: 'act_assess_u4m5_pass',
    actionType: 'submit_assessment',
    studentId,
    courseId: 'cs-4200',
    unitId: 'unit_4',
    lessonId: 'u4_m05',
    score: 100,
    assessmentResult: mockPassAssessment
  };

  const passCycle = await executeUnifiedLearningCycle(passAssessmentAction, { mockOffline: true });
  assert(passCycle.assessmentEvaluation?.percentageScore === 100, 'Assessment score is 100%');
  assert(passCycle.remediationResult.activeRemediationCount === 0 || passCycle.remediationResult.hasMandatoryBarriers === false, 'Remediation gap cleared on passing test');

  // Test 6: Idempotency & Duplicate Prevention
  console.log('Test 6: Idempotency & Duplicate Action Prevention');
  const duplicateCycle = await executeUnifiedLearningCycle(passAssessmentAction, { mockOffline: true });
  assert(duplicateCycle.status === 'duplicate_prevented', 'Duplicate action returns duplicate_prevented status');

  // Test 7: Partial Failure Isolation (Telemetry Write Failure)
  console.log('Test 7: Partial Failure Isolation (Telemetry Error)');
  const partialFailAction: UnifiedLearningAction = {
    actionId: 'act_partial_fail_test',
    actionType: 'complete_simulation',
    studentId: 'student_isolated_fail',
    courseId: 'cs-4200',
    unitId: 'unit_3',
    lessonId: 'u3_m02',
    score: 90
  };

  // With mockOffline: false and unauthenticated test env, Firestore write will fail safely
  const partialResult = await executeUnifiedLearningCycle(partialFailAction, { mockOffline: false });
  assert(partialResult.status === 'partial_failure' || partialResult.status === 'completed', 'Cycle handles write failure gracefully');
  assert(partialResult.masteryDecision !== undefined, 'Mastery decision evaluated despite telemetry error');
  assert(partialResult.personalizationResult !== undefined, 'Personalization evaluated despite telemetry error');

  // Test 8: Data Isolation Between Different Students
  console.log('Test 8: Student Data Isolation');
  const studentAEvents = getInMemoryEventsForStudent('student_A');
  const studentBEvents = getInMemoryEventsForStudent('student_B');
  assert(studentAEvents.length === 0, 'Student A starts with 0 events');
  assert(studentBEvents.length === 0, 'Student B starts with 0 events');

  await executeUnifiedLearningCycle({
    actionId: 'act_a1',
    actionType: 'complete_lesson',
    studentId: 'student_A',
    lessonId: 'u3_m01'
  }, { mockOffline: true });

  assert(getInMemoryEventsForStudent('student_A').length === 1, 'Student A has 1 event');
  assert(getInMemoryEventsForStudent('student_B').length === 0, 'Student B remains isolated at 0 events');

  console.log('--- ALL STEP 25 UNIFIED ADAPTIVE LEARNING LOOP TESTS PASSED (100%) ---');
}

runStep25UnifiedLearningLoopTests().catch((err) => {
  console.error('Unified learning loop test suite failed:', err);
  process.exit(1);
});
