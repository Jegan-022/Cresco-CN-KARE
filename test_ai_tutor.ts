/**
 * CRESCO Production — Step 23 AI Personal Tutor Verification Test Suite
 *
 * Validates backend AI tutor endpoint contracts, curriculum context enrichment,
 * pre-submission answer key protection, duplicate-send prevention, abort cancellation,
 * authority boundary enforcement, canonical AIInteraction schema generation,
 * and lesson recommendation resolution.
 */

import dotenv from 'dotenv';
dotenv.config();

import { handleAiTutorRequest } from './api/ai-tutor';
import { 
  queryAiTutor, 
  buildLessonTutorContext, 
  buildPracticeQuestionContext, 
  buildRemediationTutorContext,
  createAiInteractionRecord,
  TRUSTED_AI_AUTHORITY_BOUNDARY
} from './src/services/aiTutorService';
import { findLessonById } from './src/components/lesson/lessonDatabase';
import { RemediationRecommendation } from './src/types/remediation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runStep23AiTutorTests() {
  console.log('--- Starting Step 23 AI Personal Tutor Tests ---');

  // Test 1: Backend Handler Input Validation
  console.log('Test 1: Backend Request Validation');
  const emptyRes = await handleAiTutorRequest({ message: '' });
  assert(emptyRes.status === 400, 'Empty message must return HTTP 400');
  assert(emptyRes.data.errorCode === 'INVALID_REQUEST', 'Error code must be INVALID_REQUEST');

  const whitespaceRes = await handleAiTutorRequest({ message: '   ' });
  assert(whitespaceRes.status === 400, 'Whitespace message must return HTTP 400');

  // Test 2: AI Provider Configuration & Availability Handling
  console.log('Test 2: Provider Availability & Missing Key Boundary');
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    const noKeyRes = await handleAiTutorRequest({ message: 'Explain TCP' });
    assert(noKeyRes.status === 503, 'Missing API key must return HTTP 503');
    assert(noKeyRes.data.errorCode === 'AI_PROVIDER_UNAVAILABLE', 'Must return AI_PROVIDER_UNAVAILABLE');
    assert(noKeyRes.data.error.includes('GEMINI_API_KEY'), 'Must explain server environment requirement');
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }

  // Test 3: Curriculum Context Selection & Enrichment
  console.log('Test 3: Curriculum Context Selection & Enrichment');
  const tcpLesson = findLessonById('u4_m05');
  assert(tcpLesson !== null, 'TCP lesson u4_m05 must resolve');
  const lessonContext = buildLessonTutorContext(tcpLesson!, 'explain_concept');
  assert(lessonContext.courseId === 'cs-4200', 'Course ID matches canonical code');
  assert(lessonContext.unitId === 'unit_4', 'Unit ID resolved');
  assert(lessonContext.lessonId === 'u4_m05', 'Lesson ID resolved');
  assert(lessonContext.conceptTopic === tcpLesson!.topicTitle, 'Topic title matches curriculum');
  assert(lessonContext.actionType === 'explain_concept', 'Action type mapped correctly');

  // Test 4: Pre-Submission Answer Key Protection (Security Invariant)
  console.log('Test 4: Pre-Submission Answer Key Protection');
  const unsubmittedContext = buildPracticeQuestionContext({
    questionPrompt: 'What is the TCP 3-way handshake sequence?',
    conceptTopic: 'TCP Handshake',
    userMistakeText: 'Option A (Wrong)',
    explanation: 'CONFIDENTIAL ANSWER KEY: SYN, SYN-ACK, ACK',
    isEvaluated: false // Unsubmitted!
  });
  assert(unsubmittedContext.studentMistake === undefined, 'Unsubmitted question must NOT disclose mistake text in prompt');
  assert(unsubmittedContext.explanationSnippet === undefined, 'Unsubmitted question must NEVER attach confidential explanation');
  assert(unsubmittedContext.actionType === 'give_hint', 'Unsubmitted question defaults to Socratic hint mode');

  const evaluatedContext = buildPracticeQuestionContext({
    questionPrompt: 'What is the TCP 3-way handshake sequence?',
    conceptTopic: 'TCP Handshake',
    userMistakeText: 'Option A (Wrong)',
    explanation: 'SYN, SYN-ACK, ACK establishes socket synchronization',
    isEvaluated: true // Already submitted and graded!
  });
  assert(evaluatedContext.studentMistake === 'Option A (Wrong)', 'Evaluated question includes student mistake for diagnostic review');
  assert(evaluatedContext.explanationSnippet?.includes('socket synchronization') === true, 'Evaluated question attaches explanation');
  assert(evaluatedContext.actionType === 'explain_mistake', 'Evaluated question sets explain_mistake action');

  // Test 5: Remediation Recommendation Context Enrichment
  console.log('Test 5: Remediation Context Enrichment');
  const mockRec: RemediationRecommendation = {
    recommendationId: 'rec_u3_subnet',
    gapId: 'gap_subnet',
    conceptId: 'unit_3',
    conceptTitle: 'IPv4 Subnetting & CIDR',
    headline: 'Practice CIDR Prefix Calculation',
    reason: 'Missed 2 subnetting questions on /26 host count.',
    priority: 'high',
    activityType: 'targeted_drill',
    targetTab: 'practice',
    isMandatoryBarrier: false,
    isAvailable: true,
    status: 'active',
    evidenceRefs: ['exam_1'],
    createdTimestamp: '2026-10-18T10:00:00Z'
  };
  const remContext = buildRemediationTutorContext(mockRec);
  assert(remContext.conceptTopic === 'IPv4 Subnetting & CIDR', 'Remediation concept passed');
  assert(remContext.learningObjective === 'Practice CIDR Prefix Calculation', 'Headline mapped to objective');
  assert(remContext.explanationSnippet?.includes('Missed 2 subnetting questions') === true, 'Reason included as snippet');

  // Test 6: Duplicate-Send Prevention
  console.log('Test 6: Duplicate-Send Prevention');
  const query1Promise = queryAiTutor({
    studentId: 'student_test',
    message: 'Can you explain the TCP handshake?'
  });
  // Immediate consecutive query with identical text
  const query2 = await queryAiTutor({
    studentId: 'student_test',
    message: 'Can you explain the TCP handshake?'
  });
  assert(query2.success === false, 'Rapid duplicate send must be blocked');
  assert(query2.errorCode === 'RATE_LIMIT_EXCEEDED', 'Must return RATE_LIMIT_EXCEEDED');
  await query1Promise; // await resolution of first

  // Test 7: In-Flight Request Cancellation (AbortSignal)
  console.log('Test 7: In-Flight Request Cancellation');
  const abortController = new AbortController();
  abortController.abort(); // already aborted
  const cancelledRes = await queryAiTutor(
    {
      studentId: 'student_test',
      message: 'New question for cancellation test'
    },
    abortController.signal
  );
  assert(cancelledRes.success === false, 'Aborted request must return success: false');
  assert(cancelledRes.errorCode === 'NETWORK_TIMEOUT', 'Cancelled request error code is NETWORK_TIMEOUT');

  // Test 8: Authority Boundary Invariants
  console.log('Test 8: Authority Boundary Enforcement');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canGrantMastery === false, 'AI Tutor CANNOT grant mastery');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canAlterGrades === false, 'AI Tutor CANNOT alter grades');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canAwardXP === false, 'AI Tutor CANNOT award XP');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.canOverridePrerequisites === false, 'AI Tutor CANNOT override prerequisites');
  assert(TRUSTED_AI_AUTHORITY_BOUNDARY.role === 'assistive_socratic_tutor', 'Role is strictly assistive');

  // Test 9: Canonical AIInteraction Audit Record Schema
  console.log('Test 9: Canonical AIInteraction Audit Record Generation');
  const mockResponse = {
    success: true,
    reply: 'Under RFC 793, TCP establishes a connection using a 3-way handshake: SYN, SYN-ACK, ACK.',
    model: 'gemini-1.5-flash',
    latencyMs: 420,
    recommendedLessons: [
      { lessonId: 'u4_m05', title: 'TCP Connection Management', unitNumber: 4 }
    ]
  };
  const auditRecord = createAiInteractionRecord({
    studentId: 'student_audit_1',
    prompt: 'How does TCP connect under RFC 793?',
    response: mockResponse,
    context: lessonContext
  });
  assert(auditRecord.interactionId.startsWith('ai_'), 'Interaction ID generated with prefix');
  assert(auditRecord.studentId === 'student_audit_1', 'Student ID recorded');
  assert(auditRecord.courseId === 'cs-4200', 'Course ID recorded');
  assert(auditRecord.interactionType === 'concept_explanation', 'Interaction type mapped');
  assert(auditRecord.inputMetadata.studentQuestionLength > 0, 'Question length recorded');
  assert(auditRecord.outputMetadata.referencedRFCs.includes('RFC 793'), 'Referenced RFCs parsed from reply');
  assert(auditRecord.outputMetadata.suggestedFollowUpConcepts.includes('TCP Connection Management'), 'Follow-up concepts recorded');
  assert(auditRecord.providerInfo.model === 'gemini-1.5-flash', 'Model recorded');

  // Test 10: Missing Curriculum Context Fallback
  console.log('Test 10: Missing Curriculum Context Fallback');
  const emptyContextPrompt = buildPracticeQuestionContext({
    questionPrompt: 'What is quantum entanglement in teleportation?',
    isEvaluated: false
  });
  assert(emptyContextPrompt.unitId === undefined, 'No fake unit ID attached');
  assert(emptyContextPrompt.conceptTopic === 'Practice Question', 'Default topic without fabrication');

  console.log('--- ALL STEP 23 AI PERSONAL TUTOR TESTS PASSED (100%) ---');
}

runStep23AiTutorTests().catch((err) => {
  console.error('AI Tutor test suite failed:', err);
  process.exit(1);
});
