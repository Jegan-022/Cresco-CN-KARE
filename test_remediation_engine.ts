/**
 * CRESCO Production — Step 22 Targeted Remediation Engine Verification Test Suite
 *
 * Validates deterministic learning gap identification, evidence grounding,
 * prerequisite enforcement, recommendation ordering, unauthored content handling,
 * canonical RemediationRecord schema generation, and re-evaluation pipeline.
 */

import { 
  evaluateRemediation, 
  createRemediationRecord 
} from './src/services/remediationEngineService';
import { 
  trackRemediationStarted, 
  trackRemediationCompleted,
  persistStudentRemediations,
  reevaluateMasteryAndRemediation,
  TRUSTED_REMEDIATION_BACKEND_DEPENDENCY
} from './src/services/remediationTrackingService';
import { evaluateMastery } from './src/services/masteryEngineService';
import { LearningEvent } from './src/types/learningEvents';
import { AssessmentEvaluationResult } from './src/services/assessmentScoringService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runStep22RemediationTests() {
  console.log('--- Starting Step 22 Targeted Remediation Engine Tests ---');

  // Baseline mock assessment
  const mockFailedAssessment: AssessmentEvaluationResult = {
    assessmentId: 'exam_unit_3',
    attemptId: 'attempt_fail_1',
    studentId: 'student_rem_1',
    mode: 'formal_assessment',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    correctCount: 2,
    incorrectCount: 3,
    partiallyCorrectCount: 0,
    pendingEvaluationCount: 0,
    totalPointsEarned: 2,
    totalPointsPossible: 5,
    percentageScore: 40,
    isFullyObjective: true,
    questionResults: [
      {
        questionId: 'q-subnet-1',
        type: 'single_choice',
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible: 1,
        userResponse: 2,
        correctAnswer: 1,
        explanation: 'CIDR prefix /26 accommodates 62 usable host addresses.',
        conceptReference: 'Module u3_m02 Subnetting',
        feedbackMessage: 'Incorrect calculation of host bits.'
      },
      {
        questionId: 'q-subnet-2',
        type: 'single_choice',
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible: 1,
        userResponse: 0,
        correctAnswer: 3,
        explanation: 'Subnet mask 255.255.255.192 corresponds to /26.',
        conceptReference: 'Module u3_m02 Subnetting',
        feedbackMessage: 'Incorrect mask conversion.'
      },
      {
        questionId: 'q-route-1',
        type: 'single_choice',
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible: 1,
        userResponse: 1,
        correctAnswer: 0,
        explanation: 'Distance Vector routing suffers from count-to-infinity problem.',
        conceptReference: 'Routing Algorithms',
        feedbackMessage: 'Incorrect convergence analysis.'
      },
      {
        questionId: 'q-intro-1',
        type: 'single_choice',
        status: 'correct',
        pointsEarned: 1,
        pointsPossible: 1,
        userResponse: 0,
        correctAnswer: 0,
        explanation: 'Store and forward buffers entire packet.',
        conceptReference: 'Module u3_m01 Need and Issues',
        feedbackMessage: 'Correct.'
      },
      {
        questionId: 'q-intro-2',
        type: 'single_choice',
        status: 'correct',
        pointsEarned: 1,
        pointsPossible: 1,
        userResponse: 1,
        correctAnswer: 1,
        explanation: 'Datagram routing operates connectionless.',
        conceptReference: 'Module u3_m01 Need and Issues',
        feedbackMessage: 'Correct.'
      }
    ],
    submittedAt: '2026-10-18T10:00:00Z',
    evaluatedAt: '2026-10-18T10:00:01Z'
  };

  // Test 1: Pure Determinism
  console.log('Test 1: Pure Determinism');
  const inputA = {
    studentId: 'student_rem_1',
    scopeId: 'unit_3',
    recentAssessment: mockFailedAssessment,
    evaluatedAt: '2026-10-18T12:00:00Z'
  };
  const inputB = {
    studentId: 'student_rem_1',
    scopeId: 'unit_3',
    recentAssessment: mockFailedAssessment,
    evaluatedAt: '2026-10-18T12:00:00Z'
  };
  const resA = evaluateRemediation(inputA);
  const resB = evaluateRemediation(inputB);
  assert(JSON.stringify(resA) === JSON.stringify(resB), 'Identical inputs must yield bit-for-bit identical results');

  // Test 2: Demonstrated Difficulty Identification & Evidence Grounding
  console.log('Test 2: Demonstrated Difficulty from Assessment');
  assert(resA.gaps.length >= 2, 'Should identify at least 2 distinct conceptual gaps from failed questions');
  const subnetGap = resA.gaps.find((g) => g.conceptTitle.includes('Subnetting'));
  assert(subnetGap !== undefined, 'Subnetting gap must be identified');
  assert(subnetGap!.gapType === 'demonstrated_difficulty', 'Subnetting gap must be typed as demonstrated_difficulty');
  assert(subnetGap!.severity === 'critical', 'Score < 50% must trigger critical severity');
  assert(subnetGap!.evidenceRefs.includes('q-subnet-1'), 'Gap must reference failing question 1');
  assert(subnetGap!.evidenceRefs.includes('q-subnet-2'), 'Gap must reference failing question 2');
  assert(subnetGap!.evidenceRefs.includes('attempt_fail_1'), 'Gap must reference attempt ID');

  // Test 3: Insufficient Evidence vs Demonstrated Difficulty
  console.log('Test 3: Insufficient Evidence vs Demonstrated Difficulty');
  const emptyMastery = evaluateMastery({
    studentId: 'student_new',
    scopeId: 'unit_3',
    evidence: []
  });
  const unattemptedRemediation = evaluateRemediation({
    studentId: 'student_new',
    scopeId: 'unit_3',
    masteryResult: emptyMastery,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  const unattemptedExamGap = unattemptedRemediation.gaps.find((g) => g.gapId.includes('no_exam'));
  assert(unattemptedExamGap !== undefined, 'Should detect unattempted assessment');
  assert(unattemptedExamGap!.gapType === 'insufficient_evidence', 'Unattempted exam is insufficient_evidence, NOT demonstrated_difficulty');
  assert(unattemptedExamGap!.severity === 'moderate', 'Unattempted exam severity is moderate, not critical');

  // Test 4: Prerequisite Enforcement & Mandatory Barrier Flagging
  console.log('Test 4: Prerequisite Enforcement');
  const prereqBlockedMastery = evaluateMastery({
    studentId: 'student_rem_1',
    scopeId: 'unit_4',
    evidence: [],
    config: {
      prerequisites: ['unit_3']
    }
  });
  const prereqRemediation = evaluateRemediation({
    studentId: 'student_rem_1',
    scopeId: 'unit_4',
    masteryResult: prereqBlockedMastery,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  assert(prereqRemediation.hasMandatoryBarriers === true, 'Missing prerequisite must establish mandatory barrier');
  const prereqRec = prereqRemediation.recommendations.find((r) => r.activityType === 'concept_review' && r.conceptId === 'unit_3');
  assert(prereqRec !== undefined, 'Must recommend reviewing Unit 3 prerequisite');
  assert(prereqRec!.isMandatoryBarrier === true, 'Prerequisite recommendation must be marked mandatory barrier');
  assert(prereqRec!.targetLessonId === 'u3_m01', 'Prerequisite recommendation targets Unit 3 entry lesson');

  // Test 5: Deterministic Recommendation Ordering
  console.log('Test 5: Recommendation Priority Ordering');
  const topRec = prereqRemediation.recommendations[0];
  assert(topRec.priority === 'high', 'Highest priority recommendation must appear first');
  assert(topRec.isMandatoryBarrier === true, 'Mandatory barrier must be sorted at the top');

  // Test 6: Missing Curriculum Mapping & Unavailable Activities
  console.log('Test 6: Unavailable Activities Handling');
  const unauthoredAssessment: AssessmentEvaluationResult = {
    ...mockFailedAssessment,
    attemptId: 'attempt_unauthored_1',
    questionResults: [
      {
        questionId: 'q-future-1',
        type: 'single_choice',
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible: 1,
        userResponse: 0,
        correctAnswer: 1,
        explanation: 'Future concept.',
        conceptReference: 'Module u3_m99 Experimental Quantum Network Layer',
        feedbackMessage: 'Incorrect.'
      }
    ]
  };
  const unauthoredRemediation = evaluateRemediation({
    studentId: 'student_rem_1',
    scopeId: 'unit_3',
    recentAssessment: unauthoredAssessment,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  const unauthoredRec = unauthoredRemediation.recommendations.find((r) => r.conceptId.includes('quantum'));
  assert(unauthoredRec !== undefined, 'Identified gap for unauthored module');
  assert(unauthoredRec!.isAvailable === false, 'Unauthored module must be marked isAvailable: false');
  assert(unauthoredRec!.unavailableExplanation !== undefined, 'Unauthored module must provide honest explanation');

  // Test 7: Hint Dependency Remediation
  console.log('Test 7: Hint Dependency Remediation');
  const hintHeavyMastery = evaluateMastery({
    studentId: 'student_hints',
    scopeId: 'unit_3',
    evidence: [
      {
        eventId: 'evt-1',
        studentId: 'student_hints',
        courseId: 'cs-4200',
        unitId: 'unit_3',
        eventType: 'PRACTICE_COMPLETED',
        timestamp: '2026-10-18T09:00:00Z',
        sessionId: 'sess-1',
        metadata: { score: 90, hintUsed: true }
      },
      {
        eventId: 'evt-2',
        studentId: 'student_hints',
        courseId: 'cs-4200',
        unitId: 'unit_3',
        eventType: 'HINT_REQUESTED',
        timestamp: '2026-10-18T09:00:10Z',
        sessionId: 'sess-1'
      }
    ],
    config: {
      maximumHintRelianceRatio: 0.15
    }
  });
  const hintRemediation = evaluateRemediation({
    studentId: 'student_hints',
    scopeId: 'unit_3',
    masteryResult: hintHeavyMastery,
    evaluatedAt: '2026-10-18T12:00:00Z'
  });
  const hintGap = hintRemediation.gaps.find((g) => g.gapType === 'hint_dependency');
  assert(hintGap !== undefined, 'Hint dependency gap must be generated');
  const hintRec = hintRemediation.recommendations.find((r) => r.conceptTitle.includes('Independent'));
  assert(hintRec !== undefined, 'Should recommend independent practice without hints');
  assert(hintRec!.targetTab === 'practice', 'Target tab is practice');

  // Test 8: Canonical RemediationRecord Schema
  console.log('Test 8: Canonical RemediationRecord Schema');
  const canonicalRecord = createRemediationRecord(prereqRec!, 'student_rem_1', 'cs-4200');
  assert(canonicalRecord.remediationId.startsWith('rem_rec_prereq_'), 'Remediation ID generated');
  assert(canonicalRecord.studentId === 'student_rem_1', 'Student ID matches');
  assert(canonicalRecord.triggerReason === 'prerequisite_gap_detected', 'Prerequisite trigger reason identified');
  assert(canonicalRecord.status === 'assigned', 'Initial status is assigned');
  assert(canonicalRecord.prescribedActivity.recommendedReadTimeMinutes > 0, 'Estimated time included');

  // Test 9: Re-evaluation & Completion from Real Evidence
  console.log('Test 9: Re-evaluation & Completion from Real Evidence');
  const completedEvents: LearningEvent[] = [
    {
      eventId: 'evt-c1',
      studentId: 'student_rem_1',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      lessonId: 'u3_m01',
      eventType: 'LESSON_COMPLETED',
      timestamp: '2026-10-18T13:00:00Z',
      sessionId: 'sess-comp-1',
      metadata: { score: 100 }
    }
  ];
  // Verify reevaluateMasteryAndRemediation logic with completed lesson
  const reevalResult = await reevaluateMasteryAndRemediation({
    studentId: 'student_rem_1',
    scopeId: 'unit_3',
    events: completedEvents,
    existingRecommendations: [
      {
        recommendationId: 'rec_u3_m01_review',
        gapId: 'gap_u3_m01',
        conceptId: 'unit_3',
        conceptTitle: 'Network Layer Intro',
        headline: 'Review Unit 3 Lesson 1',
        reason: 'Lesson review needed.',
        priority: 'high',
        activityType: 'concept_review',
        targetTab: 'lesson-player',
        targetLessonId: 'u3_m01',
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        evidenceRefs: ['prior_test'],
        createdTimestamp: '2026-10-18T10:00:00Z'
      }
    ]
  });
  assert(reevalResult.mastery !== undefined, 'Mastery evaluated in pipeline');
  assert(reevalResult.remediation !== undefined, 'Remediation evaluated in pipeline');

  // Test 10: Persistence Boundaries & Security Mismatch Guard
  console.log('Test 10: Persistence Security & Trusted-Backend Boundaries');
  // Student mismatch check (blocks cross-student spoofing immediately without network)
  const crossStudentPersist = await persistStudentRemediations(
    'student_victim',
    'attacker_uid',
    [topRec],
    'unit_3'
  );
  assert(crossStudentPersist.success === false, 'Cannot persist remediation for another student identity');
  assert(crossStudentPersist.error?.includes('Security boundary'), 'Security error message returned');
  assert(TRUSTED_REMEDIATION_BACKEND_DEPENDENCY.authorityCollection === '/remediations', 'Authoritative backend dependency declared');
  assert(TRUSTED_REMEDIATION_BACKEND_DEPENDENCY.authorizationRequired.includes('Firebase Admin SDK'), 'Admin SDK requirement declared');

  console.log('--- ALL STEP 22 TARGETED REMEDIATION TESTS PASSED (100%) ---');
}

runStep22RemediationTests().catch((err) => {
  console.error('Remediation test suite failed:', err);
  process.exit(1);
});
