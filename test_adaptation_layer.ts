/**
 * Focused Unit and Integration Tests for CRESCO Application Adaptation Layer (Step 10)
 *
 * Verifies:
 * 1. Mapping: Each supported PedagogyDecisionType maps to the correct learner-facing adaptation.
 * 2. Neutral: NEUTRAL_PROGRESSION returns null (zero notification fatigue).
 * 3. Safety: No adaptation result mutates XP, score, grade, unlock state, or mastery.
 * 4. Determinism: Same decision -> identical adaptation view model.
 * 5. Missing destination: Graceful fallback without fabricating non-existent routes.
 * 6. Failure isolation: Invalid or missing data fails safely without throwing exceptions.
 */

import {
  createAdaptationViewModel,
  getBoundaryAdaptation,
} from './src/services/adaptationService';
import { PedagogyDecision, PedagogyDecisionType } from './src/types/pedagogyDecision';
import { LearnerEvidenceSummary } from './src/types/evidenceSummary';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

function createDummySummary(overrides?: Partial<LearnerEvidenceSummary>): LearnerEvidenceSummary {
  return {
    studentId: 'student-test-1',
    courseId: 'cs-4200',
    lessonsStarted: 2,
    lessonsCompleted: 2,
    simulationsStarted: 0,
    simulationsCompleted: 0,
    practiceStarted: 3,
    practiceCompleted: 3,
    assessmentAttempts: 1,
    assessmentCompletions: 1,
    successfulAttempts: 1,
    practiceAttempts: 3,
    successfulPracticeAttempts: 2,
    independentSuccessfulAttempts: 1,
    attemptsWithHints: 1,
    hintsRequested: 2,
    bestPracticeScore: 80,
    latestPracticeScore: 80,
    averagePracticeScore: 80,
    bestScore: 85,
    latestScore: 85,
    averageScore: 85,
    errorCategoriesObserved: {},
    misconceptionsObserved: {},
    totalEventsCount: 5,
    unitBreakdown: {},
    lessonBreakdown: {},
    assessmentBreakdown: {},
    practiceBreakdown: {},
    activityBreakdown: {},
    ...overrides,
  };
}

interface DummyDecisionOverrides extends Omit<Partial<PedagogyDecision>, 'evidence'> {
  evidence?: Partial<PedagogyDecision['evidence']>;
}

function createDummyDecision(
  decisionType: PedagogyDecisionType,
  overrides?: DummyDecisionOverrides
): PedagogyDecision {
  const baseEvidence: PedagogyDecision['evidence'] = {
    totalEventsCount: 5,
    lessonsCompleted: 2,
    practiceAttempts: 3,
    successfulPracticeAttempts: 2,
    independentSuccessfulAttempts: 1,
    hintsRequested: 2,
    attemptsWithHints: 1,
    assessmentAttempts: 1,
    assessmentCompletions: 1,
    successfulAttempts: 1,
    bestScore: 85,
    latestScore: 85,
    observedErrorCount: 0,
    observedMisconceptionCount: 0,
  };

  return {
    ...overrides,
    decisionType,
    confidence: overrides?.confidence || 'high',
    reason: overrides?.reason || `Deterministic decision for ${decisionType}`,
    scope: overrides?.scope || { studentId: 'student-test-1', courseId: 'cs-4200' },
    evidence: {
      ...baseEvidence,
      ...overrides?.evidence,
    },
    findings: overrides?.findings || [],
  };
}

console.log('--- CRESCO Step 10: Application Adaptation Layer Tests ---\n');

// 1. Mapping Tests for all supported PedagogyDecisionTypes
console.log('Test Suite 1: Decision Mapping to Learner-Facing Guidance');

// 1.1 PREREQUISITE_GAP_SIGNAL_OBSERVED
{
  const decision = createDummyDecision('PREREQUISITE_GAP_SIGNAL_OBSERVED', {
    evidence: { observedErrorCount: 2, lessonsCompleted: 1, successfulPracticeAttempts: 0, independentSuccessfulAttempts: 0, attemptsWithHints: 0, hintsRequested: 0, assessmentAttempts: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'PREREQUISITE_GAP_SIGNAL_OBSERVED produces a non-null view model');
  assert(vm?.decisionType === 'PREREQUISITE_GAP_SIGNAL_OBSERVED', 'ViewModel preserves decisionType');
  assert(vm?.severity === 'review', 'Severity is review');
  assert(vm?.isActionable === true, 'isActionable is true');
  assert(vm?.action?.label === 'Review Prerequisite', 'Action label is "Review Prerequisite"');
  assert(vm?.action?.targetTab === 'review', 'Action navigates to valid review tab');
  assert(!vm?.title.includes('_'), 'Title contains human-readable text without underscores');
  assert(!vm?.message.includes('PREREQUISITE_GAP_SIGNAL_OBSERVED'), 'Learner message does not leak internal enum');
}

// 1.2 SIGNIFICANT_ERROR_PATTERN_OBSERVED
{
  const decision = createDummyDecision('SIGNIFICANT_ERROR_PATTERN_OBSERVED', {
    evidence: { observedErrorCount: 3, lessonsCompleted: 1, successfulPracticeAttempts: 0, independentSuccessfulAttempts: 0, attemptsWithHints: 0, hintsRequested: 0, assessmentAttempts: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'SIGNIFICANT_ERROR_PATTERN_OBSERVED produces a non-null view model');
  assert(vm?.severity === 'review', 'Severity is review');
  assert(vm?.action?.label === 'Review Concept', 'Action label is "Review Concept"');
  assert(vm?.action?.targetTab === 'review', 'Action navigates to valid review tab');
  assert(vm?.title === 'Recommended Concept Review', 'Title is clean and encouraging');
}

// 1.3 PRACTICE_EVIDENCE_NEEDED
{
  const decision = createDummyDecision('PRACTICE_EVIDENCE_NEEDED', {
    evidence: { lessonsCompleted: 2, successfulPracticeAttempts: 0, independentSuccessfulAttempts: 0, attemptsWithHints: 0, hintsRequested: 0, assessmentAttempts: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'PRACTICE_EVIDENCE_NEEDED produces a non-null view model');
  assert(vm?.severity === 'guidance', 'Severity is guidance');
  assert(vm?.action?.label === 'Continue Practice', 'Action label is "Continue Practice"');
  assert(vm?.action?.targetTab === 'quiz-and-practice', 'Action navigates to valid quiz-and-practice tab');
  assert(vm?.message.includes('strengthen your understanding'), 'Message explains value of practice');
}

// 1.4 HINT_DEPENDENCY_OBSERVED
{
  const decision = createDummyDecision('HINT_DEPENDENCY_OBSERVED', {
    evidence: { hintsRequested: 4, attemptsWithHints: 3, lessonsCompleted: 1, successfulPracticeAttempts: 2, independentSuccessfulAttempts: 0, assessmentAttempts: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'HINT_DEPENDENCY_OBSERVED produces a non-null view model');
  assert(vm?.severity === 'guidance', 'Severity is guidance');
  assert(vm?.action?.label === 'Try Independent Practice', 'Action label is "Try Independent Practice"');
  assert(vm?.action?.targetTab === 'quiz-and-practice', 'Action navigates to quiz-and-practice tab');
  assert(vm?.message.includes('measure your independent understanding'), 'Message encourages independent practice without punitive tone');
}

// 1.5 INDEPENDENT_SUCCESS_OBSERVED
{
  const decision = createDummyDecision('INDEPENDENT_SUCCESS_OBSERVED', {
    evidence: { independentSuccessfulAttempts: 3, lessonsCompleted: 2, successfulPracticeAttempts: 3, attemptsWithHints: 0, hintsRequested: 0, assessmentAttempts: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'INDEPENDENT_SUCCESS_OBSERVED produces a non-null view model');
  assert(vm?.severity === 'success', 'Severity is success');
  assert(vm?.isActionable === false, 'isActionable is false (non-intrusive reinforcement)');
  assert(!vm?.message.includes('mastery achieved'), 'Does NOT claim final mastery');
}

// 1.6 ASSESSMENT_EVIDENCE_AVAILABLE
{
  const decision = createDummyDecision('ASSESSMENT_EVIDENCE_AVAILABLE', {
    evidence: { assessmentAttempts: 1, bestScore: 90, latestScore: 90, lessonsCompleted: 1, successfulPracticeAttempts: 1, independentSuccessfulAttempts: 1, attemptsWithHints: 0, hintsRequested: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'ASSESSMENT_EVIDENCE_AVAILABLE produces a non-null view model');
  assert(vm?.severity === 'info', 'Severity is informational');
  assert(vm?.isActionable === false, 'isActionable is false');
}

// 1.7 INSUFFICIENT_ASSESSMENT_EVIDENCE
{
  const decision = createDummyDecision('INSUFFICIENT_ASSESSMENT_EVIDENCE', {
    evidence: { assessmentAttempts: 0, lessonsCompleted: 1, successfulPracticeAttempts: 1, independentSuccessfulAttempts: 1, attemptsWithHints: 0, hintsRequested: 0 },
  });
  const vm = createAdaptationViewModel(decision);
  assert(vm !== null, 'INSUFFICIENT_ASSESSMENT_EVIDENCE produces a non-null view model');
  assert(vm?.severity === 'info', 'Severity is info');
  assert(vm?.action?.label === 'Take Assessment', 'Action offers Take Assessment');
  assert(vm?.action?.targetTab === 'quiz-and-practice', 'Action targets quiz-and-practice tab');
}

// 2. Neutrality & Non-Intrusiveness
console.log('\nTest Suite 2: Neutral Progression (Zero Notification Fatigue)');
{
  const neutralDecision = createDummyDecision('NEUTRAL_PROGRESSION');
  const vm = createAdaptationViewModel(neutralDecision);
  assert(vm === null, 'NEUTRAL_PROGRESSION produces null (zero intrusive interruptions)');
}

// 3. Safety: No State Mutation
console.log('\nTest Suite 3: Safety Guardrails (Zero Mutation of Academic/Progression State)');
{
  const decision = createDummyDecision('PRACTICE_EVIDENCE_NEEDED');
  const deepCopy = JSON.parse(JSON.stringify(decision));
  const vm = createAdaptationViewModel(decision);

  assert(JSON.stringify(decision) === JSON.stringify(deepCopy), 'PedagogyDecision is never mutated by mapping');
  assert((vm as any)?.xp === undefined, 'AdaptationViewModel contains no xp property');
  assert((vm as any)?.score === undefined, 'AdaptationViewModel contains no score property');
  assert((vm as any)?.grade === undefined, 'AdaptationViewModel contains no grade property');
  assert((vm as any)?.unlockLevel === undefined, 'AdaptationViewModel contains no unlockLevel property');
  assert((vm as any)?.lockLevel === undefined, 'AdaptationViewModel contains no lockLevel property');
  assert((vm as any)?.mastery === undefined, 'AdaptationViewModel contains no mastery property');
  assert((vm as any)?.isRemediated === undefined, 'AdaptationViewModel contains no isRemediated property');
}

// 4. Determinism
console.log('\nTest Suite 4: Determinism Guarantee');
{
  const decisionA = createDummyDecision('HINT_DEPENDENCY_OBSERVED', { confidence: 'medium' });
  const decisionB = createDummyDecision('HINT_DEPENDENCY_OBSERVED', { confidence: 'medium' });

  const vmA1 = createAdaptationViewModel(decisionA);
  const vmA2 = createAdaptationViewModel(decisionA);
  const vmB = createAdaptationViewModel(decisionB);

  assert(JSON.stringify(vmA1) === JSON.stringify(vmA2), 'Repeated calls with identical decision produce identical view models');
  assert(JSON.stringify(vmA1) === JSON.stringify(vmB), 'Equivalent decisions produce identical view models');
}

// 5. Missing / Fallback Navigation Targets
console.log('\nTest Suite 5: Navigation Safety (No Fabricated Routes)');
{
  const decision = createDummyDecision('SIGNIFICANT_ERROR_PATTERN_OBSERVED');
  const vm = createAdaptationViewModel(decision);

  assert(vm?.action?.targetTab === 'review', 'Action routes only to known valid tab: review');
  assert(vm?.action?.targetLessonId === undefined, 'Does not invent non-existent targetLessonId');
  assert(vm?.action?.targetUnitId === undefined, 'Does not invent non-existent targetUnitId');
}

// 6. Failure Isolation and Edge Cases
console.log('\nTest Suite 6: Failure Isolation and Robustness');
{
  const nullResult = createAdaptationViewModel(null as any);
  assert(nullResult === null, 'null input returns null safely without throwing');

  const undefinedResult = createAdaptationViewModel(undefined as any);
  assert(undefinedResult === null, 'undefined input returns null safely without throwing');

  const emptyResult = createAdaptationViewModel({} as any);
  assert(emptyResult === null, 'empty object input returns null safely without throwing');

  // getBoundaryAdaptation edge case with missing studentId
  getBoundaryAdaptation('', { courseId: 'cs-4200' }).then((res) => {
    assert(res === null, 'getBoundaryAdaptation with empty studentId returns null safely');
  });

  getBoundaryAdaptation(null as any).then((res) => {
    assert(res === null, 'getBoundaryAdaptation with null studentId returns null safely');
  });
}

// Print Summary
setTimeout(() => {
  console.log('\n==================================================');
  console.log(`Step 10 Tests Complete: ${passedTests} passed, ${failedTests} failed.`);
  console.log('==================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}, 500);
