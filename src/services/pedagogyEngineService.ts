/**
 * CRESCO Pedagogy Engine Service v1
 *
 * Deterministic, evidence-based pedagogical evaluation engine.
 * Consumes aggregated evidence (LearnerEvidenceSummary) to derive actionable
 * pedagogical findings and primary decisions.
 *
 * Guarantees & Constraints:
 * - Pure & Deterministic: identical inputs always yield identical decisions.
 * - Zero Side Effects: no network, no Firestore, no AI, no system time dependency.
 * - NO Mastery Assertions: final mastery rules remain [PENDING ACADEMIC REVIEW].
 * - NO Progression Mutation: does not lock/unlock levels, grant XP, or alter UI.
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/EVIDENCE_AGGREGATION_IMPLEMENTATION.md
 */

import { LearnerEvidenceSummary } from '../types/evidenceSummary';
import {
  PedagogyContext,
  PedagogyDecision,
  PedagogyDecisionType,
  PedagogyFinding,
  PedagogicalErrorSignal
} from '../types/pedagogyDecision';

/**
 * Known prerequisite gap markers in error categories or misconception tags.
 */
const PREREQUISITE_MARKERS = [
  'PREREQUISITE_GAP',
  'FOUNDATION_MISSING',
  'PREREQUISITE_UNRESOLVED',
  'PREREQUISITE',
];

/**
 * Evaluates aggregated learner evidence against deterministic pedagogical rules.
 */
export function evaluatePedagogy(
  evidence: LearnerEvidenceSummary,
  context?: PedagogyContext
): PedagogyDecision {
  const safeEvidence: LearnerEvidenceSummary = evidence || {
    studentId: context?.courseId || '',
    courseId: context?.courseId || 'cs-4200',
    lessonsStarted: 0,
    lessonsCompleted: 0,
    simulationsStarted: 0,
    simulationsCompleted: 0,
    practiceStarted: 0,
    practiceCompleted: 0,
    assessmentAttempts: 0,
    assessmentCompletions: 0,
    successfulAttempts: 0,
    practiceAttempts: 0,
    successfulPracticeAttempts: 0,
    hintsRequested: 0,
    attemptsWithHints: 0,
    independentSuccessfulAttempts: 0,
    errorCategoriesObserved: {},
    misconceptionsObserved: {},
    totalEventsCount: 0,
    unitBreakdown: {},
    lessonBreakdown: {},
    assessmentBreakdown: {},
    practiceBreakdown: {},
    activityBreakdown: {},
  };

  const studentId = safeEvidence.studentId || '';
  const courseId = context?.courseId || safeEvidence.courseId || 'cs-4200';

  // Extract scoped evidence if context defines unit or lesson
  const scopedEvidence = resolveScopedEvidence(safeEvidence, context);

  // Collect all multi-factor evidence findings
  const findings: PedagogyFinding[] = [];

  // 1. Evaluate Prerequisite Gap Signals
  evaluatePrerequisiteFindings(safeEvidence, findings);

  // 2. Evaluate Granular Error Signals
  evaluateErrorFindings(safeEvidence, findings);

  // 3. Evaluate Practice Evidence
  evaluatePracticeFindings(scopedEvidence, findings);

  // 4. Evaluate Independence & Hint Usage
  evaluateIndependenceFindings(scopedEvidence, findings);

  // 5. Evaluate Assessment Evidence
  evaluateAssessmentFindings(scopedEvidence, findings);

  // 6. Determine Primary Pedagogy Decision via Deterministic Priority Hierarchy
  const primaryDecision = selectPrimaryDecision(findings, scopedEvidence);

  const totalObservedErrors = Object.values(safeEvidence.errorCategoriesObserved || {}).reduce(
    (a, b) => a + b,
    0
  );
  const totalObservedMisconceptions = Object.values(
    safeEvidence.misconceptionsObserved || {}
  ).reduce((a, b) => a + b, 0);

  return {
    decisionType: primaryDecision.decisionType,
    reason: primaryDecision.reason,
    confidence: primaryDecision.confidence,
    scope: {
      studentId,
      courseId,
      unitId: context?.unitId,
      levelId: context?.levelId,
      lessonId: context?.lessonId,
      activityId: context?.activityId,
      assessmentId: context?.assessmentId,
    },
    evidence: {
      totalEventsCount: safeEvidence.totalEventsCount || 0,
      lessonsCompleted: scopedEvidence.lessonsCompleted,
      practiceAttempts: scopedEvidence.practiceAttempts,
      successfulPracticeAttempts: scopedEvidence.successfulPracticeAttempts,
      independentSuccessfulAttempts: scopedEvidence.independentSuccessfulAttempts,
      hintsRequested: scopedEvidence.hintsRequested,
      attemptsWithHints: scopedEvidence.attemptsWithHints,
      assessmentAttempts: scopedEvidence.assessmentAttempts,
      assessmentCompletions: scopedEvidence.assessmentCompletions,
      successfulAttempts: scopedEvidence.successfulAttempts,
      bestScore: scopedEvidence.bestScore,
      latestScore: scopedEvidence.latestScore,
      observedErrorCount: totalObservedErrors,
      observedMisconceptionCount: totalObservedMisconceptions,
    },
    findings,
    evaluatedAt: context?.evaluatedAt,
  };
}

/**
 * Resolves scoped numbers based on optional unit/lesson context.
 */
function resolveScopedEvidence(
  evidence: LearnerEvidenceSummary,
  context?: PedagogyContext
) {
  if (context?.unitId && evidence.unitBreakdown?.[context.unitId]) {
    const u = evidence.unitBreakdown[context.unitId];
    return {
      lessonsCompleted: u.lessonsCompleted || 0,
      practiceAttempts: u.practiceCompleted || 0,
      successfulPracticeAttempts: u.practiceCompleted || 0,
      independentSuccessfulAttempts: evidence.independentSuccessfulAttempts || 0,
      hintsRequested: evidence.hintsRequested || 0,
      attemptsWithHints: evidence.attemptsWithHints || 0,
      assessmentAttempts: u.assessmentAttempts || 0,
      assessmentCompletions: u.assessmentCompletions || 0,
      successfulAttempts: evidence.successfulAttempts || 0,
      bestScore: u.bestAssessmentScore,
      latestScore: u.latestAssessmentScore,
    };
  }

  return {
    lessonsCompleted: evidence.lessonsCompleted || 0,
    practiceAttempts: evidence.practiceAttempts || 0,
    successfulPracticeAttempts: evidence.successfulPracticeAttempts || 0,
    independentSuccessfulAttempts: evidence.independentSuccessfulAttempts || 0,
    hintsRequested: evidence.hintsRequested || 0,
    attemptsWithHints: evidence.attemptsWithHints || 0,
    assessmentAttempts: evidence.assessmentAttempts || 0,
    assessmentCompletions: evidence.assessmentCompletions || 0,
    successfulAttempts: evidence.successfulAttempts || 0,
    bestScore: evidence.bestScore,
    latestScore: evidence.latestScore,
  };
}

/**
 * Rule 1: Prerequisite Gap Detection
 */
function evaluatePrerequisiteFindings(
  evidence: LearnerEvidenceSummary,
  findings: PedagogyFinding[]
) {
  const errorKeys = Object.keys(evidence.errorCategoriesObserved || {});
  const miscKeys = Object.keys(evidence.misconceptionsObserved || {});

  const hasPrereqError = errorKeys.some((k) =>
    PREREQUISITE_MARKERS.some((m) => k.toUpperCase().includes(m))
  );
  const hasPrereqMisc = miscKeys.some((k) =>
    PREREQUISITE_MARKERS.some((m) => k.toUpperCase().includes(m))
  );

  if (hasPrereqError || hasPrereqMisc) {
    findings.push({
      code: 'PREREQUISITE_GAP_SIGNAL_OBSERVED',
      category: 'prerequisite',
      description: 'Prerequisite error pattern observed in telemetry records.',
      evidenceSnapshot: {
        errorCategories: evidence.errorCategoriesObserved,
        misconceptions: evidence.misconceptionsObserved,
      },
    });
  }
}

/**
 * Rule 2: Granular Error Categorization
 */
function evaluateErrorFindings(
  evidence: LearnerEvidenceSummary,
  findings: PedagogyFinding[]
) {
  const errors = evidence.errorCategoriesObserved || {};
  let totalErrorCount = 0;

  for (const [category, count] of Object.entries(errors)) {
    totalErrorCount += count;
    const upper = category.toUpperCase();

    if (upper.includes('CONCEPTUAL') || upper.includes('CONCEPT')) {
      findings.push({
        code: 'CONCEPTUAL_ERROR_OBSERVED',
        category: 'error',
        description: `Observed ${count} conceptual error pattern(s).`,
        evidenceSnapshot: { category, count },
      });
    } else if (upper.includes('PROCEDURAL') || upper.includes('CALCULATION')) {
      findings.push({
        code: 'PROCEDURAL_ERROR_OBSERVED',
        category: 'error',
        description: `Observed ${count} procedural or calculation error pattern(s).`,
        evidenceSnapshot: { category, count },
      });
    } else if (upper.includes('INTERPRETATION') || upper.includes('PROMPT')) {
      findings.push({
        code: 'INTERPRETATION_ERROR_OBSERVED',
        category: 'error',
        description: `Observed ${count} prompt or scenario interpretation error pattern(s).`,
        evidenceSnapshot: { category, count },
      });
    } else if (upper.includes('CARELESS') || upper.includes('TYPO')) {
      findings.push({
        code: 'CARELESS_RESPONSE_PATTERN_OBSERVED',
        category: 'error',
        description: `Observed ${count} careless response pattern(s).`,
        evidenceSnapshot: { category, count },
      });
    } else if (upper.includes('FLUENCY') || upper.includes('TIMEOUT')) {
      findings.push({
        code: 'FLUENCY_GAP_SIGNAL_OBSERVED',
        category: 'error',
        description: `Observed ${count} fluency or timeout pattern(s).`,
        evidenceSnapshot: { category, count },
      });
    }
  }

  const misconceptionCount = Object.values(evidence.misconceptionsObserved || {}).reduce(
    (a, b) => a + b,
    0
  );

  // Multi-factor error severity rule
  if (totalErrorCount >= 2 || misconceptionCount >= 2) {
    findings.push({
      code: 'SIGNIFICANT_ERROR_PATTERN_OBSERVED',
      category: 'error',
      description: 'Multiple recurring error patterns or diagnosed misconception signals observed.',
      evidenceSnapshot: { totalErrorCount, misconceptionCount },
    });
  }
}

/**
 * Rule 3: Practice Evidence Sufficiency
 */
function evaluatePracticeFindings(
  scoped: ReturnType<typeof resolveScopedEvidence>,
  findings: PedagogyFinding[]
) {
  // If learning or assessments have been initiated but no successful practice exists
  const hasLearningActivity = scoped.lessonsCompleted > 0 || scoped.assessmentAttempts > 0;
  if (hasLearningActivity && scoped.successfulPracticeAttempts === 0) {
    findings.push({
      code: 'PRACTICE_EVIDENCE_NEEDED',
      category: 'practice',
      description: 'Learning activity has occurred, but independent successful practice evidence is missing.',
      evidenceSnapshot: {
        lessonsCompleted: scoped.lessonsCompleted,
        practiceAttempts: scoped.practiceAttempts,
        successfulPracticeAttempts: scoped.successfulPracticeAttempts,
      },
    });
  }
}

/**
 * Rule 4: Independence & Hint Dependency
 */
function evaluateIndependenceFindings(
  scoped: ReturnType<typeof resolveScopedEvidence>,
  findings: PedagogyFinding[]
) {
  // Hint dependency observed: student has used hints and has zero independent successes, or high hint frequency
  if (scoped.attemptsWithHints > 0 && scoped.independentSuccessfulAttempts === 0) {
    findings.push({
      code: 'HINT_DEPENDENCY_OBSERVED',
      category: 'independence',
      description: 'Learner repeatedly uses hints during practice; independent execution has not yet been demonstrated.',
      evidenceSnapshot: {
        hintsRequested: scoped.hintsRequested,
        attemptsWithHints: scoped.attemptsWithHints,
        independentSuccessfulAttempts: scoped.independentSuccessfulAttempts,
      },
    });
  } else if (scoped.independentSuccessfulAttempts >= 1) {
    findings.push({
      code: 'INDEPENDENT_SUCCESS_OBSERVED',
      category: 'independence',
      description: 'Learner demonstrates successful execution without relying on hint assistance.',
      evidenceSnapshot: {
        independentSuccessfulAttempts: scoped.independentSuccessfulAttempts,
        attemptsWithHints: scoped.attemptsWithHints,
      },
    });
  }
}

/**
 * Rule 5: Assessment Evidence
 */
function evaluateAssessmentFindings(
  scoped: ReturnType<typeof resolveScopedEvidence>,
  findings: PedagogyFinding[]
) {
  if (scoped.assessmentCompletions > 0) {
    findings.push({
      code: 'ASSESSMENT_EVIDENCE_AVAILABLE',
      category: 'assessment',
      description: 'Verifiable assessment score evidence is available.',
      evidenceSnapshot: {
        assessmentAttempts: scoped.assessmentAttempts,
        assessmentCompletions: scoped.assessmentCompletions,
        bestScore: scoped.bestScore,
        latestScore: scoped.latestScore,
      },
    });
  } else if (scoped.assessmentAttempts > 0) {
    findings.push({
      code: 'INSUFFICIENT_ASSESSMENT_EVIDENCE',
      category: 'assessment',
      description: 'Assessment was initiated but no completion record was found.',
      evidenceSnapshot: {
        assessmentAttempts: scoped.assessmentAttempts,
      },
    });
  }
}

/**
 * Rule Priority Resolver
 * Deterministically maps discovered findings into the primary PedagogyDecision.
 */
function selectPrimaryDecision(
  findings: PedagogyFinding[],
  scoped: ReturnType<typeof resolveScopedEvidence>
): { decisionType: PedagogyDecisionType; reason: string; confidence: 'low' | 'medium' | 'high' } {
  // 1. Priority 1: Prerequisite Gap Signal
  if (findings.some((f) => f.code === 'PREREQUISITE_GAP_SIGNAL_OBSERVED')) {
    return {
      decisionType: 'PREREQUISITE_GAP_SIGNAL_OBSERVED',
      reason: 'Observed evidence indicates potential gaps in prerequisite knowledge requiring foundational reinforcement.',
      confidence: 'high',
    };
  }

  // 2. Priority 2: Significant Error Pattern
  if (findings.some((f) => f.code === 'SIGNIFICANT_ERROR_PATTERN_OBSERVED')) {
    return {
      decisionType: 'SIGNIFICANT_ERROR_PATTERN_OBSERVED',
      reason: 'Recurring error patterns or diagnosed misconception signals observed across interaction telemetry.',
      confidence: 'high',
    };
  }

  // 3. Priority 3: Practice Evidence Needed
  if (findings.some((f) => f.code === 'PRACTICE_EVIDENCE_NEEDED')) {
    return {
      decisionType: 'PRACTICE_EVIDENCE_NEEDED',
      reason: 'Learning activity initiated, but independent successful practice evidence is currently insufficient.',
      confidence: 'medium',
    };
  }

  // 4. Priority 4: Hint Dependency
  if (findings.some((f) => f.code === 'HINT_DEPENDENCY_OBSERVED')) {
    return {
      decisionType: 'HINT_DEPENDENCY_OBSERVED',
      reason: 'Repeated hint assistance utilized during practice; independent execution evidence has not yet been demonstrated.',
      confidence: 'medium',
    };
  }

  // 5. Priority 5: Independent Success
  if (findings.some((f) => f.code === 'INDEPENDENT_SUCCESS_OBSERVED')) {
    return {
      decisionType: 'INDEPENDENT_SUCCESS_OBSERVED',
      reason: 'Learner demonstrates independent successful practice completions without relying on hint assistance.',
      confidence: 'high',
    };
  }

  // 6. Priority 6: Assessment Evidence Available
  if (findings.some((f) => f.code === 'ASSESSMENT_EVIDENCE_AVAILABLE')) {
    return {
      decisionType: 'ASSESSMENT_EVIDENCE_AVAILABLE',
      reason: 'Verifiable assessment score data is available for evaluation.',
      confidence: 'medium',
    };
  }

  // 7. Priority 7: Insufficient Assessment Evidence
  if (findings.some((f) => f.code === 'INSUFFICIENT_ASSESSMENT_EVIDENCE')) {
    return {
      decisionType: 'INSUFFICIENT_ASSESSMENT_EVIDENCE',
      reason: 'Assessment activity initiated but completed assessment evidence is missing.',
      confidence: 'low',
    };
  }

  // 8. Priority 8: Neutral Progression (Default)
  return {
    decisionType: 'NEUTRAL_PROGRESSION',
    reason: 'Learner progressing normally; no actionable interventions or diagnostic patterns detected.',
    confidence: 'low',
  };
}
