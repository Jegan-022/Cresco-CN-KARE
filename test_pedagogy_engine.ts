/**
 * CRESCO Pedagogy Engine v1 - Unit & Determinism Verification
 *
 * Verifies that the Pedagogy Engine deterministically evaluates LearnerEvidenceSummary
 * inputs according to strict priority rules without applying unresolved academic thresholds.
 */

import { evaluatePedagogy } from './src/services/pedagogyEngineService';
import { createEmptyEvidenceSummary } from './src/services/evidenceAggregationService';
import { LearnerEvidenceSummary } from './src/types/evidenceSummary';
import { PENDING_ACADEMIC_RULES } from './src/types/pedagogyDecision';

console.log('====================================================');
console.log('🧪 CRESCO PEDAGOGY RULES ENGINE v1 VERIFICATION');
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

// 1. EMPTY EVIDENCE TEST
console.log('--- 1. Empty Evidence Baseline ---');
const emptyEvidence = createEmptyEvidenceSummary('stu_test_001', 'cs-4200');
const decisionEmpty = evaluatePedagogy(emptyEvidence);

assert(decisionEmpty.decisionType === 'NEUTRAL_PROGRESSION', 'Empty evidence returns NEUTRAL_PROGRESSION');
assert(decisionEmpty.confidence === 'low', 'Confidence is low for neutral baseline');
assert(decisionEmpty.findings.length === 0, 'No findings generated for empty baseline');

// 2. LESSON COMPLETED WITHOUT PRACTICE
console.log('\n--- 2. Lesson Completion Without Practice ---');
const lessonOnlyEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  lessonsCompleted: 3,
  practiceAttempts: 0,
  successfulPracticeAttempts: 0,
};
const decisionPracticeNeeded = evaluatePedagogy(lessonOnlyEvidence);

assert(decisionPracticeNeeded.decisionType === 'PRACTICE_EVIDENCE_NEEDED', 'Completed lessons without practice triggers PRACTICE_EVIDENCE_NEEDED');
assert(decisionPracticeNeeded.findings.some(f => f.code === 'PRACTICE_EVIDENCE_NEEDED'), 'Findings contains PRACTICE_EVIDENCE_NEEDED');

// 3. HINT DEPENDENCY EVIDENCE
console.log('\n--- 3. Hint Dependency Evidence ---');
const hintDependentEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  practiceAttempts: 4,
  successfulPracticeAttempts: 4,
  attemptsWithHints: 4,
  hintsRequested: 6,
  independentSuccessfulAttempts: 0,
};
const decisionHintDep = evaluatePedagogy(hintDependentEvidence);

assert(decisionHintDep.decisionType === 'HINT_DEPENDENCY_OBSERVED', 'Repeated hints without independent success triggers HINT_DEPENDENCY_OBSERVED');
assert(decisionHintDep.findings.some(f => f.code === 'HINT_DEPENDENCY_OBSERVED'), 'Findings contains HINT_DEPENDENCY_OBSERVED');

// 4. INDEPENDENT SUCCESS EVIDENCE
console.log('\n--- 4. Independent Success Evidence ---');
const independentEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  practiceAttempts: 3,
  successfulPracticeAttempts: 3,
  independentSuccessfulAttempts: 3,
  attemptsWithHints: 0,
  hintsRequested: 0,
};
const decisionIndep = evaluatePedagogy(independentEvidence);

assert(decisionIndep.decisionType === 'INDEPENDENT_SUCCESS_OBSERVED', 'Clean practice completions triggers INDEPENDENT_SUCCESS_OBSERVED');
assert(decisionIndep.confidence === 'high', 'Independent success yields high confidence');

// 5. ASSESSMENT EVIDENCE EVALUATION
console.log('\n--- 5. Assessment Evidence Evaluation ---');
const assessmentEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  assessmentAttempts: 2,
  assessmentCompletions: 2,
  successfulAttempts: 2,
  bestScore: 92,
  latestScore: 92,
  practiceAttempts: 2,
  successfulPracticeAttempts: 2,
  independentSuccessfulAttempts: 2,
};
const decisionAssess = evaluatePedagogy(assessmentEvidence);
// Note: INDEPENDENT_SUCCESS_OBSERVED is Priority 5, ASSESSMENT_EVIDENCE_AVAILABLE is Priority 6
assert(decisionAssess.decisionType === 'INDEPENDENT_SUCCESS_OBSERVED', 'Independent practice success retains priority over pure assessment availability');
assert(decisionAssess.findings.some(f => f.code === 'ASSESSMENT_EVIDENCE_AVAILABLE'), 'Findings contains ASSESSMENT_EVIDENCE_AVAILABLE signal');

const assessOnlyEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  assessmentAttempts: 1,
  assessmentCompletions: 0, // started but unfinished
};
const decisionIncompleteAssess = evaluatePedagogy(assessOnlyEvidence);
assert(decisionIncompleteAssess.decisionType === 'PRACTICE_EVIDENCE_NEEDED', 'Unfinished assessment without practice triggers PRACTICE_EVIDENCE_NEEDED (Priority 3 over 7)');

// 6. ERROR & MISCONCEPTION SIGNALS
console.log('\n--- 6. Error & Misconception Evidence ---');
const errorEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  practiceAttempts: 3,
  successfulPracticeAttempts: 1,
  errorCategoriesObserved: {
    'CONCEPTUAL_MISMATCH': 2,
    'CALCULATION_ERROR': 1,
  },
  misconceptionsObserved: {
    'BROADCAST_VS_MULTICAST': 1,
  },
};
const decisionErrors = evaluatePedagogy(errorEvidence);

assert(decisionErrors.decisionType === 'SIGNIFICANT_ERROR_PATTERN_OBSERVED', 'Multiple errors trigger SIGNIFICANT_ERROR_PATTERN_OBSERVED');
assert(decisionErrors.findings.some(f => f.code === 'CONCEPTUAL_ERROR_OBSERVED'), 'Conceptual error finding identified');
assert(decisionErrors.findings.some(f => f.code === 'PROCEDURAL_ERROR_OBSERVED'), 'Procedural error finding identified');

// 7. PREREQUISITE GAP SIGNAL
console.log('\n--- 7. Prerequisite Gap Signal ---');
const prereqEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  practiceAttempts: 2,
  errorCategoriesObserved: {
    'PREREQUISITE_GAP_BINARY_MATH': 1,
  },
};
const decisionPrereq = evaluatePedagogy(prereqEvidence);

assert(decisionPrereq.decisionType === 'PREREQUISITE_GAP_SIGNAL_OBSERVED', 'Prerequisite error triggers PREREQUISITE_GAP_SIGNAL_OBSERVED');
assert(decisionPrereq.confidence === 'high', 'Prerequisite gap signal yields high confidence');

// 8. MULTI-FACTOR PRIORITY HIERARCHY TEST
console.log('\n--- 8. Multi-Factor Deterministic Priority Hierarchy ---');
// Simultaneous Prereq (P1) + Significant Errors (P2) + Practice Needed (P3) + Hint Dep (P4)
const compoundEvidence: LearnerEvidenceSummary = {
  ...emptyEvidence,
  lessonsCompleted: 2,
  practiceAttempts: 0,
  successfulPracticeAttempts: 0,
  hintsRequested: 5,
  attemptsWithHints: 2,
  errorCategoriesObserved: {
    'PREREQUISITE_GAP_SUBNETTING': 1,
    'CONCEPTUAL_IP_HEADER': 3,
  },
};
const decisionCompound = evaluatePedagogy(compoundEvidence);
assert(decisionCompound.decisionType === 'PREREQUISITE_GAP_SIGNAL_OBSERVED', 'Priority 1 (Prerequisite Gap) strictly supersedes all lower priorities');

// Simultaneous Significant Errors (P2) + Practice Needed (P3)
const errorsAndPracticeNeeded: LearnerEvidenceSummary = {
  ...emptyEvidence,
  lessonsCompleted: 2,
  practiceAttempts: 0,
  successfulPracticeAttempts: 0,
  errorCategoriesObserved: {
    'CONCEPTUAL_IP_HEADER': 3,
  },
};
const decisionErrorsWin = evaluatePedagogy(errorsAndPracticeNeeded);
assert(decisionErrorsWin.decisionType === 'SIGNIFICANT_ERROR_PATTERN_OBSERVED', 'Priority 2 (Significant Errors) strictly supersedes Priority 3 (Practice Needed)');

// 9. DETERMINISM & PURITY REPEATABILITY
console.log('\n--- 9. Determinism Repeatability (100 Iterations) ---');
let identical = true;
const baseline = JSON.stringify(evaluatePedagogy(compoundEvidence));
for (let i = 0; i < 100; i++) {
  const result = JSON.stringify(evaluatePedagogy(compoundEvidence));
  if (result !== baseline) {
    identical = false;
    break;
  }
}
assert(identical, 'Evaluated 100 times consecutively; output is 100% identical and deterministic');

// 10. STRICT ABSENCE OF UNRESOLVED ACADEMIC THRESHOLDS
console.log('\n--- 10. Academic Review Boundary Isolation ---');
const decisionKeys = Object.keys(decisionCompound);
assert(!decisionKeys.includes('masteryScore'), 'Decision contains NO masteryScore');
assert(!decisionKeys.includes('isMastered'), 'Decision contains NO isMastered');
assert(!decisionKeys.includes('masteryState'), 'Decision contains NO masteryState');
assert(!decisionKeys.includes('unlockNextLevel'), 'Decision contains NO unlockNextLevel');
assert(!decisionKeys.includes('startRemediation'), 'Decision contains NO startRemediation');

assert(PENDING_ACADEMIC_RULES.FINAL_MASTERY_THRESHOLD_PERCENT === 85, 'Pending constant 85% is isolated and untouched');
assert(PENDING_ACADEMIC_RULES.HINT_XP_PENALTY_RATIO === 0.5, 'Pending hint XP penalty constant 0.5 is isolated and untouched');

console.log('\n====================================================');
console.log(`📊 PEDAGOGY ENGINE TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
