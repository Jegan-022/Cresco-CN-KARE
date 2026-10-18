/**
 * CRESCO Production — Step 21 Mastery Engine Service
 * 
 * Pure, deterministic evaluation engine that converts verified learning evidence
 * into explainable, academic-policy-aware mastery decisions.
 * 
 * Core Guarantees:
 * - Pure & Deterministic: same inputs + same config always produce identical outputs.
 * - Zero Side Effects: no Firestore, no network calls, no UI mutations, no AI dependencies.
 * - Multi-Dimensional Convergence: evaluates the Five Pillars of Mastery Evidence (Section 9.1).
 * - Honest Policy Handling: respects [PENDING ACADEMIC REVIEW] governance flags.
 * - Strict Evidence Hygiene: deduplicates events, excludes malformed records, and enforces prerequisite barriers.
 * 
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - src/types/mastery.ts
 * - src/types/evidenceSummary.ts
 * - src/types/pedagogyDecision.ts
 */

import { LearningEvent } from '../types/learningEvents';
import { LearnerEvidenceSummary, UnitEvidenceSummary, LessonEvidenceSummary } from '../types/evidenceSummary';
import { aggregateLearningEvents } from './evidenceAggregationService';
import { PENDING_ACADEMIC_RULES } from '../types/pedagogyDecision';
import {
  MasteryState,
  MasteryPolicyConfig,
  MasteryPillarEvidence,
  MasteryEvaluationResult,
  NextLearningAction,
  AcademicPolicyStatus,
  MasteryRecord
} from '../types/mastery';

/**
 * Default Mastery Policy Configuration aligned with CRESCO specifications.
 * Final quantitative cutoff (85%) is explicitly marked pending academic review.
 */
export const DEFAULT_MASTERY_POLICY_CONFIG: MasteryPolicyConfig = {
  policyVersion: '1.1.0-governance',
  policyStatus: 'pending_academic_approval',
  masteryThresholdPercent: PENDING_ACADEMIC_RULES.FINAL_MASTERY_THRESHOLD_PERCENT, // 85% [PENDING ACADEMIC REVIEW]
  proficiencyThresholdPercent: 70, // 70% [EXISTING TECHNICAL RULE]
  minimumLessonsCompletedRatio: 1.0, // All lessons in scope must be completed
  minimumPracticeAttempts: 3, // At least 3 practice drills
  maximumHintRelianceRatio: 0.35, // Hint reliance must not exceed 35%
  requireSimulationsCompleted: true, // Simulation / application evidence required
  requireRetentionSpacedCheck: false, // Optional retention check
  retentionWindowDays: 7,
  prerequisites: []
};

export interface MasteryEvaluationInput {
  studentId: string;
  courseId?: string;
  scopeId: string; // 'unit_3', 'unit_4', 'unit_5', or specific moduleId like 'u3_m01'
  scopeType?: 'unit' | 'module' | 'course';
  evidence: LearnerEvidenceSummary | LearningEvent[];
  config?: Partial<MasteryPolicyConfig>;
  prerequisiteMasteryRecords?: Record<string, MasteryRecord>;
  evaluatedAt?: string;
}

/**
 * Parses epoch timestamp safely from an ISO string.
 */
function parseTimestamp(isoString?: string): number | null {
  if (!isoString) return null;
  const time = Date.parse(isoString);
  return isNaN(time) ? null : time;
}

/**
 * Resolves scoped summary from the global summary based on unitId or moduleId.
 */
function resolveScopedSummary(
  summary: LearnerEvidenceSummary,
  scopeId: string
): {
  lessonsCompleted: number;
  lessonsStarted: number;
  assessmentAttempts: number;
  assessmentCompletions: number;
  bestAssessmentScore?: number;
  latestAssessmentScore?: number;
  practiceAttempts: number;
  successfulPracticeAttempts: number;
  averagePracticeScore?: number;
  simulationsCompleted: number;
  hintsRequested: number;
  attemptsWithHints: number;
  firstActivityAt?: string;
  lastActivityAt?: string;
} {
  // Check if scope is a unit
  const normalizedUnit = scopeId.replace('-', '_');
  const unitBreakdown = summary.unitBreakdown[scopeId] || summary.unitBreakdown[normalizedUnit];

  if (unitBreakdown) {
    return {
      lessonsCompleted: unitBreakdown.lessonsCompleted,
      lessonsStarted: unitBreakdown.lessonsStarted,
      assessmentAttempts: unitBreakdown.assessmentAttempts,
      assessmentCompletions: unitBreakdown.assessmentCompletions,
      bestAssessmentScore: unitBreakdown.bestAssessmentScore,
      latestAssessmentScore: unitBreakdown.latestAssessmentScore,
      practiceAttempts: unitBreakdown.practiceCompleted,
      successfulPracticeAttempts: unitBreakdown.practiceCompleted,
      simulationsCompleted: unitBreakdown.simulationsCompleted,
      hintsRequested: summary.hintsRequested,
      attemptsWithHints: summary.attemptsWithHints,
      firstActivityAt: unitBreakdown.firstActivityAt || summary.firstActivityAt,
      lastActivityAt: unitBreakdown.lastActivityAt || summary.lastActivityAt
    };
  }

  // Check if scope is a lesson / module
  const lessonBreakdown = summary.lessonBreakdown[scopeId];
  if (lessonBreakdown) {
    const assessmentForLesson = summary.assessmentBreakdown[`quiz_${scopeId}`] || summary.assessmentBreakdown[scopeId];
    const practiceForLesson = summary.practiceBreakdown[scopeId];
    const activityForLesson = summary.activityBreakdown[scopeId];

    return {
      lessonsCompleted: lessonBreakdown.isCompleted ? 1 : 0,
      lessonsStarted: (lessonBreakdown.startedCount > 0 || lessonBreakdown.isCompleted) ? 1 : 0,
      assessmentAttempts: assessmentForLesson?.attemptsCount || 0,
      assessmentCompletions: assessmentForLesson?.completionsCount || 0,
      bestAssessmentScore: assessmentForLesson?.bestScore,
      latestAssessmentScore: assessmentForLesson?.latestScore,
      practiceAttempts: practiceForLesson?.attemptsCount || 0,
      successfulPracticeAttempts: practiceForLesson?.successfulAttemptsCount || 0,
      averagePracticeScore: practiceForLesson?.averageScore,
      simulationsCompleted: activityForLesson?.completedCount || 0,
      hintsRequested: practiceForLesson?.hintsRequested || 0,
      attemptsWithHints: practiceForLesson?.hintsRequested ? 1 : 0,
      firstActivityAt: lessonBreakdown.firstStartedAt || summary.firstActivityAt,
      lastActivityAt: lessonBreakdown.lastCompletedAt || summary.lastActivityAt
    };
  }

  // Fallback to top-level aggregate evidence
  return {
    lessonsCompleted: summary.lessonsCompleted,
    lessonsStarted: Math.max(summary.lessonsStarted, summary.lessonsCompleted),
    assessmentAttempts: summary.assessmentAttempts,
    assessmentCompletions: summary.assessmentCompletions,
    bestAssessmentScore: summary.bestScore,
    latestAssessmentScore: summary.latestScore,
    practiceAttempts: summary.practiceAttempts,
    successfulPracticeAttempts: summary.successfulPracticeAttempts,
    averagePracticeScore: summary.averagePracticeScore,
    simulationsCompleted: summary.simulationsCompleted,
    hintsRequested: summary.hintsRequested,
    attemptsWithHints: summary.attemptsWithHints,
    firstActivityAt: summary.firstActivityAt,
    lastActivityAt: summary.lastActivityAt
  };
}

/**
 * Pure evaluation function converting evidence and policy configuration into a deterministic MasteryDecision.
 */
export function evaluateMastery(input: MasteryEvaluationInput): MasteryEvaluationResult {
  if (!input.studentId || typeof input.studentId !== 'string') {
    throw new Error('Invalid input: studentId must be a valid non-empty string.');
  }
  if (!input.scopeId || typeof input.scopeId !== 'string') {
    throw new Error('Invalid input: scopeId must be a valid non-empty string.');
  }

  const courseId = input.courseId || 'cs-4200';
  const scopeId = input.scopeId.trim();
  const scopeType = input.scopeType || (scopeId.startsWith('unit') ? 'unit' : 'module');
  const evaluatedAt = input.evaluatedAt || new Date().toISOString();

  // Merge configuration with defaults
  const policy: MasteryPolicyConfig = {
    ...DEFAULT_MASTERY_POLICY_CONFIG,
    ...(input.config || {})
  };

  // 1. Normalize input evidence: if raw LearningEvent[], aggregate deterministically
  let summary: LearnerEvidenceSummary;
  if (Array.isArray(input.evidence)) {
    summary = aggregateLearningEvents(input.evidence, {
      studentId: input.studentId,
      courseId
    });
  } else {
    summary = input.evidence;
  }

  // 2. Extract scoped evidence
  const scoped = resolveScopedSummary(summary, scopeId);

  // 3. Evaluate Prerequisites
  const missingPrerequisites: string[] = [];
  if (policy.prerequisites && policy.prerequisites.length > 0) {
    const prereqRecords = input.prerequisiteMasteryRecords || {};
    for (const prereqId of policy.prerequisites) {
      const record = prereqRecords[prereqId];
      const isSatisfied = record && (record.masteryState === 'mastered' || record.masteryState === 'proficient');
      if (!isSatisfied) {
        missingPrerequisites.push(prereqId);
      }
    }
  }
  const prerequisitesMet = missingPrerequisites.length === 0;

  // 4. Evaluate the Five Pillars of Mastery Evidence (Pedagogy Specification Section 9.1)
  const missingEvidence: string[] = [];

  // Pillar 1: Assessment Evidence
  const assessmentScore = scoped.bestAssessmentScore ?? scoped.latestAssessmentScore;
  const assessmentSatisfied = 
    scoped.assessmentCompletions > 0 && 
    assessmentScore !== undefined && 
    assessmentScore >= policy.masteryThresholdPercent;

  if (scoped.assessmentCompletions === 0) {
    missingEvidence.push(`Summative assessment completion required (threshold: ${policy.masteryThresholdPercent}%).`);
  } else if (assessmentScore !== undefined && assessmentScore < policy.masteryThresholdPercent) {
    missingEvidence.push(`Assessment score of ${assessmentScore}% is below required mastery threshold of ${policy.masteryThresholdPercent}%.`);
  }

  // Pillar 2: Practice Evidence (Fluency and repetition)
  const practiceSatisfied = scoped.practiceAttempts >= policy.minimumPracticeAttempts;
  if (!practiceSatisfied) {
    missingEvidence.push(`Practice volume insufficient: ${scoped.practiceAttempts} of ${policy.minimumPracticeAttempts} required drills completed.`);
  }

  // Pillar 3: Application Evidence (Simulations & Labs)
  const applicationSatisfied = !policy.requireSimulationsCompleted || scoped.simulationsCompleted > 0;
  if (policy.requireSimulationsCompleted && scoped.simulationsCompleted === 0) {
    missingEvidence.push('Interactive packet simulation lab completion required.');
  }

  // Pillar 4: Independence Evidence (Hint reliance)
  const totalInteractions = scoped.practiceAttempts + scoped.assessmentAttempts;
  const hintsCount = Math.max(scoped.attemptsWithHints, scoped.hintsRequested);
  const hintRelianceRatio = totalInteractions > 0 
    ? Math.min(1.0, Math.round((hintsCount / totalInteractions) * 100) / 100)
    : (hintsCount > 0 ? 1 : 0);
  const independenceSatisfied = hintRelianceRatio <= policy.maximumHintRelianceRatio;
  if (!independenceSatisfied) {
    missingEvidence.push(`Hint reliance ratio of ${Math.round(hintRelianceRatio * 100)}% exceeds maximum allowed ${Math.round(policy.maximumHintRelianceRatio * 100)}%.`);
  }

  // Pillar 5: Retention Evidence (Spaced Performance)
  let daysBetweenFirstAndLast: number | undefined;
  let retentionSatisfied = true;
  if (policy.requireRetentionSpacedCheck && policy.retentionWindowDays) {
    const firstTime = parseTimestamp(scoped.firstActivityAt);
    const lastTime = parseTimestamp(scoped.lastActivityAt);
    if (firstTime !== null && lastTime !== null) {
      daysBetweenFirstAndLast = Math.max(0, Math.floor((lastTime - firstTime) / (1000 * 60 * 60 * 24)));
      retentionSatisfied = daysBetweenFirstAndLast >= policy.retentionWindowDays;
    } else {
      retentionSatisfied = false;
    }
    if (!retentionSatisfied) {
      missingEvidence.push(`Spaced retention verification required (${policy.retentionWindowDays}+ days between sessions).`);
    }
  }

  const pillars: MasteryPillarEvidence = {
    assessment: {
      attemptsCount: scoped.assessmentAttempts,
      completionsCount: scoped.assessmentCompletions,
      bestScore: scoped.bestAssessmentScore,
      latestScore: scoped.latestAssessmentScore,
      thresholdRequired: policy.masteryThresholdPercent,
      satisfied: assessmentSatisfied
    },
    practice: {
      attemptsCount: scoped.practiceAttempts,
      successfulAttemptsCount: scoped.successfulPracticeAttempts,
      averageScore: scoped.averagePracticeScore,
      minRequired: policy.minimumPracticeAttempts,
      satisfied: practiceSatisfied
    },
    application: {
      simulationsCompleted: scoped.simulationsCompleted,
      required: policy.requireSimulationsCompleted,
      satisfied: applicationSatisfied
    },
    independence: {
      hintsRequested: scoped.hintsRequested,
      attemptsWithHints: scoped.attemptsWithHints,
      totalInteractions,
      hintRelianceRatio,
      maxAllowedRatio: policy.maximumHintRelianceRatio,
      satisfied: independenceSatisfied
    },
    retention: {
      firstActivityAt: scoped.firstActivityAt,
      lastActivityAt: scoped.lastActivityAt,
      daysBetweenFirstAndLast,
      retentionRequired: policy.requireRetentionSpacedCheck,
      satisfied: retentionSatisfied
    }
  };

  // 5. Calculate Deterministic Mastery Score Index (0 to 100)
  // Weighted across Lesson (20%), Practice (25%), Simulation (15%), and Assessment (40%)
  const lessonFactor = scoped.lessonsCompleted > 0 ? 1 : (scoped.lessonsStarted > 0 ? 0.5 : 0);
  const practiceFactor = Math.min(1, scoped.practiceAttempts / (policy.minimumPracticeAttempts || 1));
  const simFactor = policy.requireSimulationsCompleted ? (scoped.simulationsCompleted > 0 ? 1 : 0) : 1;
  const assessmentFactor = assessmentScore !== undefined ? Math.min(1, assessmentScore / 100) : 0;

  const rawMasteryIndex = (lessonFactor * 20) + (practiceFactor * 25) + (simFactor * 15) + (assessmentFactor * 40);
  const masteryScore = Math.round(rawMasteryIndex * 10) / 10;

  // 6. Track Unresolved Academic Policies Honestly
  const unresolvedPolicies: string[] = [];
  if (policy.policyStatus === 'pending_academic_approval') {
    unresolvedPolicies.push('Final quantitative mastery threshold (85%) is pending formal academic and course coordinator approval.');
    unresolvedPolicies.push('Final retention cooldown window criteria is pending academic review.');
  }

  // 7. Determine Mastery State Machine Transition (Pedagogy Specification Section 9.2)
  let masteryState: MasteryState = 'not_started';
  let isMastered = false;
  let nextAction: NextLearningAction;
  let explanation = '';

  const allPillarsSatisfied = 
    assessmentSatisfied && 
    practiceSatisfied && 
    applicationSatisfied && 
    independenceSatisfied && 
    retentionSatisfied;

  if (!prerequisitesMet) {
    masteryState = 'needs_support';
    explanation = `Progression paused: Prerequisite requirement(s) [${missingPrerequisites.join(', ')}] must be satisfied before mastery can be awarded.`;
    nextAction = {
      action: 'clear_prerequisite',
      targetId: missingPrerequisites[0],
      description: `Complete foundational prerequisites for ${missingPrerequisites[0]}.`
    };
  } else if (scoped.lessonsStarted === 0 && scoped.practiceAttempts === 0 && scoped.assessmentAttempts === 0) {
    masteryState = 'not_started';
    explanation = 'No learning activity has been initiated for this topic.';
    nextAction = {
      action: 'start_lesson',
      targetId: scopeId,
      description: `Begin lesson concepts for ${scopeId}.`
    };
  } else if (scoped.lessonsCompleted === 0) {
    masteryState = 'learning';
    explanation = 'Concept lessons are in progress. Complete instructional phases to unlock practice drills.';
    nextAction = {
      action: 'start_lesson',
      targetId: scopeId,
      description: `Complete introductory lesson concepts for ${scopeId}.`
    };
  } else if (scoped.practiceAttempts < policy.minimumPracticeAttempts) {
    masteryState = 'developing';
    explanation = `Formative practice in progress (${scoped.practiceAttempts}/${policy.minimumPracticeAttempts} drills completed). More unassisted drills required.`;
    nextAction = {
      action: 'continue_practice',
      targetId: scopeId,
      description: `Complete ${policy.minimumPracticeAttempts - scoped.practiceAttempts} more practice drills to build fluency.`
    };
  } else if (!independenceSatisfied) {
    masteryState = 'developing';
    explanation = `Hint reliance (${Math.round(hintRelianceRatio * 100)}%) is too high. Practice independent problem-solving without hints.`;
    nextAction = {
      action: 'reduce_hint_usage',
      targetId: scopeId,
      description: 'Attempt practice drills independently with zero hint requests.'
    };
  } else if (policy.requireSimulationsCompleted && scoped.simulationsCompleted === 0) {
    masteryState = 'developing';
    explanation = 'Conceptual and practice drills completed, but practical packet lab simulation has not been verified.';
    nextAction = {
      action: 'complete_simulation',
      targetId: scopeId,
      description: 'Launch and complete the interactive packet routing lab.'
    };
  } else if (scoped.assessmentCompletions === 0) {
    masteryState = 'ready_for_assessment';
    explanation = 'Prerequisites, lessons, and scaffolded practice drills cleared. Ready for summative assessment.';
    nextAction = {
      action: 'attempt_assessment',
      targetId: scopeId,
      description: `Take the summative assessment challenge for ${scopeId}.`
    };
  } else if (assessmentScore !== undefined && assessmentScore >= policy.proficiencyThresholdPercent && assessmentScore < policy.masteryThresholdPercent) {
    masteryState = 'proficient';
    explanation = `Scored ${assessmentScore}% (proficient standard), but did not reach the ${policy.masteryThresholdPercent}% mastery threshold.`;
    nextAction = {
      action: 'continue_practice',
      targetId: scopeId,
      description: `Review weak topics and re-attempt assessment to reach ${policy.masteryThresholdPercent}%.`
    };
  } else if (allPillarsSatisfied) {
    if (policy.policyStatus === 'approved') {
      masteryState = 'mastered';
      isMastered = true;
      explanation = `Demonstrated comprehensive multi-dimensional competency across all 5 evidence pillars (${masteryScore}% index).`;
      nextAction = {
        action: 'advance_to_next_topic',
        targetId: scopeId,
        description: 'Mastery achieved. Advance to the next curriculum unit or challenge.'
      };
    } else {
      // Academic policy is pending approval: DO NOT invent authorization
      masteryState = 'pending_policy';
      isMastered = false;
      explanation = `All empirical criteria met (${masteryScore}% index), but final mastery award is withheld pending formal academic approval of the ${policy.masteryThresholdPercent}% cutoff threshold.`;
      nextAction = {
        action: 'await_policy_approval',
        targetId: scopeId,
        description: 'Evidence verified. Mastery recognition is pending university academic board confirmation.'
      };
    }
  } else {
    masteryState = 'insufficient_evidence';
    explanation = `Insufficient evidence to grant mastery: ${missingEvidence.join(' ')}`;
    nextAction = {
      action: 'continue_practice',
      targetId: scopeId,
      description: 'Complete the missing practice or assessment requirements listed above.'
    };
  }

  return {
    studentId: input.studentId,
    courseId,
    scopeId,
    scopeType,
    masteryState,
    isMastered,
    masteryScore,
    pillars,
    prerequisitesMet,
    missingPrerequisites,
    missingEvidence,
    unresolvedPolicies,
    policyVersion: policy.policyVersion,
    policyStatus: policy.policyStatus,
    explanation,
    nextAction,
    evaluatedAt
  };
}

/**
 * Converts a pure MasteryEvaluationResult into a canonical MasteryRecord for persistence.
 */
export function createMasteryRecordFromEvaluation(
  evaluation: MasteryEvaluationResult,
  conceptTitle: string,
  unitId?: string
): MasteryRecord {
  return {
    recordId: `${evaluation.studentId}_${evaluation.scopeId}`,
    studentId: evaluation.studentId,
    courseId: evaluation.courseId,
    conceptId: evaluation.scopeId,
    conceptTitle,
    unitId: unitId || (evaluation.scopeType === 'unit' ? evaluation.scopeId : undefined),
    masteryState: evaluation.masteryState,
    masteryScore: evaluation.masteryScore,
    evidence: {
      packetLabCompleted: evaluation.pillars.application.satisfied,
      totalAttempts: evaluation.pillars.practice.attemptsCount + evaluation.pillars.assessment.attemptsCount,
      lastAssessmentScore: evaluation.pillars.assessment.latestScore,
      bestAssessmentScore: evaluation.pillars.assessment.bestScore,
      lessonsCompletedCount: evaluation.pillars.application.satisfied ? 1 : 0,
      practiceAttemptsCount: evaluation.pillars.practice.attemptsCount
    },
    lastEvaluatedAt: evaluation.evaluatedAt,
    evaluationVersion: evaluation.policyVersion,
    policyStatus: evaluation.policyStatus,
    updatedAt: new Date().toISOString()
  };
}
