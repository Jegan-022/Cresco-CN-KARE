/**
 * CRESCO Production — Step 20 Verification Test Suite
 * 
 * Verifies Practice, Assessments & Feedback:
 * 1. Objective scoring (single-choice, true/false, deterministic short-answer)
 * 2. Multiple-select rubrics (all_or_nothing, net_positive partial credit, proportional)
 * 3. Subjective pending evaluation without automated guessing
 * 4. Empty and invalid submission handling
 * 5. Deterministic totals, percentage score calculation, and idempotency protection
 * 6. Pre-submission client sanitization (answer disclosure protection)
 * 7. Authentic curriculum challenge question pool loading and evaluation
 * 8. Learning event telemetry creation
 */

import { 
  evaluateQuestionResponse, 
  evaluateAssessmentSubmission, 
  sanitizeQuestionForClient,
  clearProcessedAttempts,
  AssessmentQuestion,
  AssessmentSubmission,
  SingleChoiceQuestion,
  MultipleSelectQuestion,
  TrueFalseQuestion,
  ShortAnswerQuestion,
  SubjectiveQuestion
} from './src/services/assessmentScoringService';
import { UNIT_CHALLENGES } from './src/data/unitQuizzes';
import { ALL_MODULE_QUIZ_QUESTIONS, ALL_MODULES } from './src/data/courseContent';
import { createLearningEventPayload } from './src/services/learningEventService';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runStep20Tests() {
  console.log('--- Starting Step 20 Practice & Assessment Verification Tests ---');
  clearProcessedAttempts();

  // Test 1: Single Choice Evaluation
  console.log('Test 1: Single Choice Objective Evaluation');
  const scQ: SingleChoiceQuestion = {
    id: 'sc-1',
    type: 'single_choice',
    prompt: 'What layer does IP operate on?',
    options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
    correctOptionIndex: 2,
    explanation: 'IP is the principal Network Layer (Layer 3) protocol.',
    points: 2
  };

  const scCorrect = evaluateQuestionResponse(scQ, 2);
  assert(scCorrect.status === 'correct', 'Single choice correct should have status "correct"');
  assert(scCorrect.pointsEarned === 2, 'Points earned should match question points');
  assert(scCorrect.correctAnswer === 2, 'Correct answer should be disclosed on evaluation');

  const scIncorrect = evaluateQuestionResponse(scQ, 1);
  assert(scIncorrect.status === 'incorrect', 'Single choice incorrect should have status "incorrect"');
  assert(scIncorrect.pointsEarned === 0, 'Incorrect single choice earns 0 points');

  const scUnanswered = evaluateQuestionResponse(scQ, null);
  assert(scUnanswered.status === 'unanswered', 'Null response should be marked unanswered');
  assert(scUnanswered.pointsEarned === 0, 'Unanswered earns 0 points');

  // Test 2: True/False Evaluation
  console.log('Test 2: True/False Objective Evaluation');
  const tfQ: TrueFalseQuestion = {
    id: 'tf-1',
    type: 'true_false',
    prompt: 'UDP provides guaranteed in-order delivery of packets.',
    correctValue: false,
    explanation: 'UDP is connectionless and does not guarantee delivery.',
    points: 1
  };

  const tfCorrect = evaluateQuestionResponse(tfQ, false);
  assert(tfCorrect.status === 'correct', 'True/False correct match');
  assert(tfCorrect.pointsEarned === 1, 'True/False points earned');

  const tfIncorrect = evaluateQuestionResponse(tfQ, true);
  assert(tfIncorrect.status === 'incorrect', 'True/False incorrect match');

  // Test 3: Short Answer with Whitespace Normalization & Case Insensitivity
  console.log('Test 3: Short Answer Deterministic Normalization');
  const saQ: ShortAnswerQuestion = {
    id: 'sa-1',
    type: 'short_answer',
    prompt: 'What protocol resolves 32-bit IP addresses to 48-bit MAC addresses?',
    acceptableAnswers: ['ARP', 'Address Resolution Protocol'],
    caseSensitive: false,
    points: 1.5
  };

  const saMatch1 = evaluateQuestionResponse(saQ, '  arp  ');
  assert(saMatch1.status === 'correct', 'Case-insensitive whitespace-trimmed match');
  assert(saMatch1.pointsEarned === 1.5, 'Points earned should be 1.5');

  const saMatch2 = evaluateQuestionResponse(saQ, 'Address Resolution Protocol');
  assert(saMatch2.status === 'correct', 'Alternative acceptable answer match');

  const saMismatch = evaluateQuestionResponse(saQ, 'DHCP');
  assert(saMismatch.status === 'incorrect', 'Mismatched short answer');

  // Test 4: Multiple Select Rubrics (all_or_nothing, net_positive, proportional)
  console.log('Test 4: Multiple Select Rubrics & Partial Credit');
  const msQAllOrNothing: MultipleSelectQuestion = {
    id: 'ms-1',
    type: 'multiple_select',
    prompt: 'Select all transport layer protocols:',
    options: ['TCP', 'IP', 'UDP', 'BGP'],
    correctOptionIndices: [0, 2],
    partialCreditRubric: 'all_or_nothing',
    points: 2
  };

  const msExact = evaluateQuestionResponse(msQAllOrNothing, [0, 2]);
  assert(msExact.status === 'correct', 'Exact multiple select match');
  assert(msExact.pointsEarned === 2, 'Full credit for exact match');

  const msPartialAoN = evaluateQuestionResponse(msQAllOrNothing, [0]);
  assert(msPartialAoN.status === 'incorrect', 'all_or_nothing should give 0 for partial selection');
  assert(msPartialAoN.pointsEarned === 0, 'No partial credit under all_or_nothing');

  // Net Positive Rubric
  const msQNetPositive: MultipleSelectQuestion = {
    id: 'ms-2',
    type: 'multiple_select',
    prompt: 'Select all private IPv4 blocks under RFC 1918:',
    options: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '8.8.8.8/32'],
    correctOptionIndices: [0, 1, 2],
    partialCreditRubric: 'net_positive',
    points: 3
  };

  // 2 correct, 0 false positive -> net 2/3 * 3 = 2 points
  const msNetPos = evaluateQuestionResponse(msQNetPositive, [0, 1]);
  assert(msNetPos.status === 'partially_correct', 'Net positive partial credit');
  assert(msNetPos.pointsEarned === 2, `Points earned should be 2, got ${msNetPos.pointsEarned}`);

  // 2 correct, 1 false positive -> net (2-1)/3 * 3 = 1 point
  const msNetPosPenalty = evaluateQuestionResponse(msQNetPositive, [0, 1, 3]);
  assert(msNetPosPenalty.status === 'partially_correct', 'Net positive with penalty');
  assert(msNetPosPenalty.pointsEarned === 1, `Points earned should be 1, got ${msNetPosPenalty.pointsEarned}`);

  // Test 5: Subjective Questions awaiting Evaluation
  console.log('Test 5: Subjective Question Pending Evaluation Handling');
  const subQ: SubjectiveQuestion = {
    id: 'sub-1',
    type: 'subjective_open',
    prompt: 'Explain the Count-to-Infinity problem and how Split Horizon resolves it.',
    sampleAnswer: 'Count-to-Infinity occurs in distance vector when a link failure propagates loops. Split horizon prevents advertising routes back on the interface they were learned.',
    points: 5
  };

  const subResult = evaluateQuestionResponse(subQ, 'Split horizon stops advertising rumors back to sender.');
  assert(subResult.status === 'pending_evaluation', 'Subjective responses must be pending_evaluation');
  assert(subResult.pointsEarned === 0, 'Subjective responses cannot award unverified client points');
  assert(subResult.feedbackMessage.includes('faculty evaluation'), 'Feedback message states pending review');

  // Test 6: Full Assessment Evaluation with Totals, Percentages & Unanswered Handling
  console.log('Test 6: Full Assessment Evaluation & Percentage Calculations');
  const questions: AssessmentQuestion[] = [scQ, tfQ, saQ, msQAllOrNothing];
  const submission: AssessmentSubmission = {
    assessmentId: 'exam-sample-1',
    attemptId: 'att-sample-100',
    studentId: 'student_123',
    mode: 'formal_assessment',
    unitId: 'unit_3',
    startedAt: '2026-10-18T10:00:00Z',
    submittedAt: '2026-10-18T10:20:00Z',
    responses: [
      { questionId: 'sc-1', response: 2 },        // correct (2 pts)
      { questionId: 'tf-1', response: false },    // correct (1 pt)
      { questionId: 'sa-1', response: 'ARP' },     // correct (1.5 pts)
      { questionId: 'ms-1', response: null }       // unanswered (0 pts)
    ]
  };

  const evalResult = evaluateAssessmentSubmission(submission, questions);
  assert(evalResult.totalQuestions === 4, 'Total questions should be 4');
  assert(evalResult.answeredCount === 3, 'Answered count should be 3');
  assert(evalResult.unansweredCount === 1, 'Unanswered count should be 1');
  assert(evalResult.correctCount === 3, 'Correct count should be 3');
  assert(evalResult.totalPointsPossible === 6.5, `Total points possible should be 6.5, got ${evalResult.totalPointsPossible}`);
  assert(evalResult.totalPointsEarned === 4.5, `Total points earned should be 4.5, got ${evalResult.totalPointsEarned}`);
  const expectedPct = Math.round((4.5 / 6.5) * 1000) / 10; // 69.2%
  assert(evalResult.percentageScore === expectedPct, `Percentage should be ${expectedPct}%, got ${evalResult.percentageScore}%`);

  // Test 7: Idempotency Protection — Duplicate Submission Rejection
  console.log('Test 7: Idempotency & Duplicate Submission Rejection');
  let duplicateRejected = false;
  try {
    evaluateAssessmentSubmission(submission, questions);
  } catch (err: any) {
    if (err.message.includes('Duplicate submission detected')) {
      duplicateRejected = true;
    }
  }
  assert(duplicateRejected, 'Duplicate attemptId must be rejected with an error');

  // Test 8: Pre-Submission Client Sanitization
  console.log('Test 8: Protected Answer Disclosure / Pre-Submission Sanitization');
  const sanitized = sanitizeQuestionForClient(scQ);
  assert(!('correctOptionIndex' in sanitized), 'correctOptionIndex must be stripped from client payload');
  assert(!('explanation' in sanitized), 'explanation must be stripped prior to evaluation');
  assert((sanitized as any).prompt === scQ.prompt, 'Prompt remains present');

  // Test 9: Real Curriculum Content Integration
  console.log('Test 9: Curriculum Challenges and Module Quiz Bank Inventory');
  const unit3Challenge = UNIT_CHALLENGES['unit_3'];
  const unit4Challenge = UNIT_CHALLENGES['unit_4'];
  const unit5Challenge = UNIT_CHALLENGES['unit_5'];

  assert(Boolean(unit3Challenge && unit3Challenge.questions.length > 0), 'Unit 3 challenge questions exist');
  assert(Boolean(unit4Challenge && unit4Challenge.questions.length > 0), 'Unit 4 challenge questions exist');
  assert(Boolean(unit5Challenge && unit5Challenge.questions.length > 0), 'Unit 5 challenge questions exist');
  assert(ALL_MODULE_QUIZ_QUESTIONS.length === 38, `Expected 38 syllabus module quiz questions, got ${ALL_MODULE_QUIZ_QUESTIONS.length}`);
  assert(ALL_MODULES.length === 30, `Expected 30 curriculum modules, got ${ALL_MODULES.length}`);

  // Test 10: Canonical Learning Event Payload Construction
  console.log('Test 10: Canonical Learning Event Evidence Telemetry');
  const eventPayload = createLearningEventPayload(
    {
      eventType: 'ASSESSMENT_COMPLETED',
      courseId: 'cs-4200',
      unitId: 'unit_3',
      assessmentId: 'exam-sample-1',
      metadata: {
        score: evalResult.percentageScore,
        correctness: evalResult.percentageScore >= 70,
        correctCount: evalResult.correctCount,
        unansweredCount: evalResult.unansweredCount
      }
    },
    'student_123',
    'sess_test_123'
  );

  assert(eventPayload.eventType === 'ASSESSMENT_COMPLETED', 'Event type matches');
  assert(eventPayload.studentId === 'student_123', 'Student ID correctly associated');
  assert(eventPayload.metadata?.score === evalResult.percentageScore, 'Score faithfully recorded without fabrication');

  console.log('--- ALL STEP 20 PRACTICE & ASSESSMENT TESTS PASSED SUCCESSFULLY! ---');
}

runStep20Tests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
