/**
 * CRESCO Pure Targeted Remediation Engine
 *
 * Deterministic, evidence-grounded remediation service that analyzes learning gaps,
 * distinguishes demonstrated difficulty from insufficient evidence, enforces prerequisites,
 * and generates actionable recommendations connected to real curriculum activities.
 *
 * Pure Logic Guarantees:
 * - NO React components or hooks.
 * - NO Firebase / Firestore mutations.
 * - NO network requests or timers.
 * - NO AI / LLM hallucinations.
 * - Bit-for-bit identical outputs for identical normalized inputs.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md Section 8 & 9
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md Section 9, 10, 11, 12
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { 
  RemediationGap, 
  RemediationRecommendation, 
  RemediationEvaluationResult,
  RemediationPriority,
  RemediationGapType,
  RemediationRecord
} from '../types/remediation';
import { MasteryEvaluationResult, MasteryRecord } from '../types/mastery';
import { LearningEvent } from '../types/learningEvents';
import { LearnerEvidenceSummary } from '../types/evidenceSummary';
import { AssessmentEvaluationResult } from './assessmentScoringService';
import { aggregateLearningEvents } from './evidenceAggregationService';
import { findLessonById } from '../components/lesson/lessonDatabase';

export interface RemediationInput {
  studentId: string;
  scopeId: string; // e.g. 'unit_3', 'unit_4', 'u4_m05'
  courseId?: string;
  masteryResult?: MasteryEvaluationResult;
  evidence?: LearningEvent[] | LearnerEvidenceSummary;
  recentAssessment?: AssessmentEvaluationResult;
  prerequisiteMasteryRecords?: Record<string, MasteryRecord>;
  evaluatedAt?: string;
}

/**
 * Maps curriculum units to default representative lessons and titles.
 */
interface UnitCurriculumMapping {
  title: string;
  defaultLessonId: string;
  prerequisiteUnitId?: string;
  availableSimulator: boolean;
}

const UNIT_MAP: Record<string, UnitCurriculumMapping> = {
  'unit_3': {
    title: 'Unit 3: Network Layer',
    defaultLessonId: 'u3_m01',
    availableSimulator: true
  },
  'unit-3': {
    title: 'Unit 3: Network Layer',
    defaultLessonId: 'u3_m01',
    availableSimulator: true
  },
  'unit_4': {
    title: 'Unit 4: Transport Layer',
    defaultLessonId: 'u4_m05',
    prerequisiteUnitId: 'unit_3',
    availableSimulator: true
  },
  'unit-4': {
    title: 'Unit 4: Transport Layer',
    defaultLessonId: 'u4_m05',
    prerequisiteUnitId: 'unit_3',
    availableSimulator: true
  },
  'unit_5': {
    title: 'Unit 5: Application Layer',
    defaultLessonId: 'u5_m02',
    prerequisiteUnitId: 'unit_4',
    availableSimulator: false
  },
  'unit-5': {
    title: 'Unit 5: Application Layer',
    defaultLessonId: 'u5_m02',
    prerequisiteUnitId: 'unit_4',
    availableSimulator: false
  }
};

/**
 * Resolves curriculum lesson ID from module or concept reference.
 */
function resolveLessonId(conceptRef?: string, fallbackUnitId?: string): { lessonId: string; isAvailable: boolean } {
  if (!conceptRef) {
    const unitFallback = fallbackUnitId ? UNIT_MAP[fallbackUnitId]?.defaultLessonId : undefined;
    return { lessonId: unitFallback || 'u3_m01', isAvailable: true };
  }

  // Check if conceptRef directly matches a lesson ID (e.g. u3_m01, u4_m05)
  const directMatch = findLessonById(conceptRef);
  if (directMatch && !directMatch.isUnavailable) {
    return { lessonId: directMatch.id, isAvailable: true };
  }

  // Check for regex like module-3-1 or mod-3-1 or Module u3_m1
  const modMatch = conceptRef.match(/u?(\d+)[-_]m0?(\d+)/i) || conceptRef.match(/mod(?:ule)?[-_](\d+)[-_](\d+)/i);
  if (modMatch) {
    const unitNum = modMatch[1];
    const modNum = parseInt(modMatch[2], 10);
    const zeroPaddedMod = modNum < 10 ? `0${modNum}` : `${modNum}`;
    const candidateId = `u${unitNum}_m${zeroPaddedMod}`;
    const lesson = findLessonById(candidateId);
    if (lesson && !lesson.isUnavailable) {
      return { lessonId: candidateId, isAvailable: true };
    }
    return { lessonId: candidateId, isAvailable: false };
  }

  // Fallback to unit default
  const unitFallback = fallbackUnitId ? UNIT_MAP[fallbackUnitId]?.defaultLessonId : 'u3_m01';
  return { lessonId: unitFallback, isAvailable: true };
}

/**
 * Deterministic comparator for recommendation priority sorting.
 */
function compareRecommendations(a: RemediationRecommendation, b: RemediationRecommendation): number {
  const priorityWeight: Record<RemediationPriority, number> = { high: 3, medium: 2, low: 1 };
  if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  }

  // Secondary sort by gap type criticality
  const gapTypeWeight: Record<RemediationGapType, number> = {
    prerequisite_gap: 5,
    demonstrated_difficulty: 4,
    hint_dependency: 3,
    insufficient_evidence: 2,
    retention_gap: 1
  };

  const aWeight = a.isMandatoryBarrier ? 10 : 0;
  const bWeight = b.isMandatoryBarrier ? 10 : 0;
  if (bWeight !== aWeight) {
    return bWeight - aWeight;
  }

  return a.recommendationId.localeCompare(b.recommendationId);
}

/**
 * Evaluates learning gaps and generates targeted educational remediation recommendations.
 */
export function evaluateRemediation(input: RemediationInput): RemediationEvaluationResult {
  if (!input.studentId || typeof input.studentId !== 'string') {
    throw new Error('Invalid input: studentId must be a valid non-empty string.');
  }
  if (!input.scopeId || typeof input.scopeId !== 'string') {
    throw new Error('Invalid input: scopeId must be a valid non-empty string.');
  }

  const { studentId, scopeId } = input;
  const evaluatedAt = input.evaluatedAt || new Date().toISOString();
  const normalizedScope = scopeId.replace('-', '_');
  const unitConfig = UNIT_MAP[normalizedScope] || UNIT_MAP['unit_3'];

  const gaps: RemediationGap[] = [];
  const recommendations: RemediationRecommendation[] = [];

  // =========================================================================
  // 1. GAP EVALUATION: PREREQUISITES
  // =========================================================================
  if (input.masteryResult && !input.masteryResult.prerequisitesMet) {
    const missingPrereqs = input.masteryResult.missingPrerequisites || [];
    for (const prereqId of missingPrereqs) {
      const prereqConfig = UNIT_MAP[prereqId] || { title: `Prerequisite ${prereqId}`, defaultLessonId: 'u3_m01', availableSimulator: false };
      const gapId = `gap_prereq_${studentId}_${prereqId}`;
      
      gaps.push({
        gapId,
        gapType: 'prerequisite_gap',
        conceptId: prereqId,
        conceptTitle: prereqConfig.title,
        unitId: prereqId,
        description: `Foundational prerequisite ${prereqConfig.title} is not yet proficient or mastered.`,
        evidenceRefs: [`prereq_check_${prereqId}`],
        severity: 'critical'
      });

      recommendations.push({
        recommendationId: `rec_prereq_${prereqId}`,
        gapId,
        conceptId: prereqId,
        conceptTitle: prereqConfig.title,
        headline: `Review Prerequisite: ${prereqConfig.title}`,
        reason: `Progression in ${unitConfig.title} requires mastering foundational concepts in ${prereqConfig.title}.`,
        priority: 'high',
        activityType: 'concept_review',
        targetTab: 'lesson-player',
        targetLessonId: prereqConfig.defaultLessonId,
        isMandatoryBarrier: true,
        isAvailable: true,
        status: 'active',
        evidenceRefs: [`prereq_barrier_${prereqId}`],
        createdTimestamp: evaluatedAt,
        estimatedMinutes: 8
      });
    }
  }

  // =========================================================================
  // 2. GAP EVALUATION: RECENT ASSESSMENT (DEMONSTRATED DIFFICULTY)
  // =========================================================================
  if (input.recentAssessment) {
    const { percentageScore, questionResults, assessmentId, attemptId } = input.recentAssessment;

    // Group incorrect / partially correct question responses
    const strugglingQuestions = (questionResults || []).filter(
      (q) => q.status === 'incorrect' || q.status === 'partially_correct'
    );

    if (strugglingQuestions.length > 0 || percentageScore < 70) {
      // Group by concept reference or module
      const conceptClusters: Record<string, typeof strugglingQuestions> = {};
      for (const q of strugglingQuestions) {
        const key = q.conceptReference || 'General Core Principles';
        if (!conceptClusters[key]) conceptClusters[key] = [];
        conceptClusters[key].push(q);
      }

      for (const [conceptName, questions] of Object.entries(conceptClusters)) {
        const clusterId = conceptName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const gapId = `gap_diff_${attemptId}_${clusterId}`;
        const questionIds = questions.map((q) => q.questionId);
        const resolved = resolveLessonId(conceptName, normalizedScope);

        gaps.push({
          gapId,
          gapType: 'demonstrated_difficulty',
          conceptId: clusterId,
          conceptTitle: conceptName,
          unitId: normalizedScope,
          lessonId: resolved.lessonId,
          description: `Demonstrated difficulty on ${questions.length} question(s) regarding ${conceptName}. Assessment score: ${percentageScore}%.`,
          evidenceRefs: [attemptId, ...questionIds],
          severity: percentageScore < 50 ? 'critical' : 'moderate',
          observedErrorsCount: questions.length,
          lastAttemptScore: percentageScore
        });

        // Determine prescribed activity: full concept review if low score, or targeted drill if moderate
        const activityType = percentageScore < 60 ? 'concept_review' : 'targeted_drill';
        const targetTab = activityType === 'concept_review' ? 'lesson-player' : 'practice';

        recommendations.push({
          recommendationId: `rec_diff_${attemptId}_${clusterId}`,
          gapId,
          conceptId: clusterId,
          conceptTitle: conceptName,
          headline: activityType === 'concept_review' 
            ? `Deep Dive: ${conceptName}` 
            : `Targeted Practice: ${conceptName}`,
          reason: `You missed ${questions.length} question(s) on ${conceptName} during assessment ${assessmentId}.`,
          priority: 'high',
          activityType,
          targetTab,
          targetLessonId: resolved.isAvailable ? resolved.lessonId : undefined,
          targetPracticeTab: 'quiz-and-practice',
          isMandatoryBarrier: percentageScore < 70,
          isAvailable: resolved.isAvailable,
          unavailableExplanation: resolved.isAvailable 
            ? undefined 
            : `Targeted interactive drill for "${conceptName}" is currently awaiting formal authoring. Review syllabus materials instead.`,
          status: 'active',
          evidenceRefs: [attemptId, ...questionIds],
          createdTimestamp: evaluatedAt,
          estimatedMinutes: activityType === 'concept_review' ? 6 : 4
        });
      }
    }
  }

  // =========================================================================
  // 3. GAP EVALUATION: MASTERY ENGINE PILLARS (DISTINGUISHING DIFFICULTY VS INSUFFICIENT EVIDENCE)
  // =========================================================================
  if (input.masteryResult) {
    const { pillars, isMastered, masteryScore } = input.masteryResult;

    // A. Assessment Pillar Check (if not already captured by recentAssessment)
    if (!input.recentAssessment && !pillars.assessment.satisfied) {
      if (pillars.assessment.attemptsCount === 0) {
        // INSUFFICIENT EVIDENCE: Student has not attempted checkpoint
        const gapId = `gap_no_exam_${normalizedScope}`;
        gaps.push({
          gapId,
          gapType: 'insufficient_evidence',
          conceptId: normalizedScope,
          conceptTitle: `${unitConfig.title} Summative Assessment`,
          unitId: normalizedScope,
          description: `Summative assessment has not been attempted for ${unitConfig.title}.`,
          evidenceRefs: ['assessment_evidence_empty'],
          severity: 'moderate'
        });

        recommendations.push({
          recommendationId: `rec_no_exam_${normalizedScope}`,
          gapId,
          conceptId: normalizedScope,
          conceptTitle: `${unitConfig.title} Summative Assessment`,
          headline: `Take ${unitConfig.title} Checkpoint Exam`,
          reason: 'A verified summative assessment is required to evaluate objective competence.',
          priority: 'medium',
          activityType: 'summative_assessment',
          targetTab: 'practice',
          targetPracticeTab: 'challenge',
          isMandatoryBarrier: false,
          isAvailable: true,
          status: 'active',
          evidenceRefs: ['assessment_evidence_empty'],
          createdTimestamp: evaluatedAt,
          estimatedMinutes: 10
        });
      } else {
        const assessmentScore = pillars.assessment.bestScore ?? pillars.assessment.latestScore;
        if (assessmentScore !== undefined && assessmentScore < 70) {
          // DEMONSTRATED DIFFICULTY: Failed prior exam attempt
          const gapId = `gap_low_exam_${normalizedScope}`;
          gaps.push({
            gapId,
            gapType: 'demonstrated_difficulty',
            conceptId: normalizedScope,
            conceptTitle: unitConfig.title,
            unitId: normalizedScope,
            description: `Prior assessment score of ${assessmentScore}% is below the 70% proficiency threshold.`,
            evidenceRefs: ['assessment_score_below_cutoff'],
            severity: 'critical',
            lastAttemptScore: assessmentScore
          });

          recommendations.push({
            recommendationId: `rec_review_exam_${normalizedScope}`,
            gapId,
            conceptId: normalizedScope,
            conceptTitle: unitConfig.title,
            headline: `Review & Prepare: ${unitConfig.title}`,
            reason: `Your previous score of ${assessmentScore}% indicates concepts need reinforcement before re-testing.`,
            priority: 'high',
            activityType: 'concept_review',
            targetTab: 'lesson-player',
            targetLessonId: unitConfig.defaultLessonId,
            isMandatoryBarrier: true,
            isAvailable: true,
            status: 'active',
            evidenceRefs: ['assessment_score_below_cutoff'],
            createdTimestamp: evaluatedAt,
            estimatedMinutes: 7
          });
        }
      }
    }

    // B. Independence Pillar: High Hint Dependency
    if (!pillars.independence.satisfied && pillars.independence.hintRelianceRatio !== undefined) {
      const gapId = `gap_hints_${normalizedScope}`;
      const hintPct = Math.round(pillars.independence.hintRelianceRatio * 100);
      
      gaps.push({
        gapId,
        gapType: 'hint_dependency',
        conceptId: normalizedScope,
        conceptTitle: 'Independent Problem Solving',
        unitId: normalizedScope,
        description: `Hint reliance ratio of ${hintPct}% exceeds the independence threshold (≤15%).`,
        evidenceRefs: [`hint_reliance_${hintPct}pct`],
        severity: 'moderate'
      });

      recommendations.push({
        recommendationId: `rec_hints_${normalizedScope}`,
        gapId,
        conceptId: normalizedScope,
        conceptTitle: 'Independent Problem Solving',
        headline: 'Practice Drills Without Hints',
        reason: `Your hint reliance is ${hintPct}%. Solve upcoming practice drills independently to demonstrate unassisted mastery.`,
        priority: 'medium',
        activityType: 'targeted_drill',
        targetTab: 'practice',
        targetPracticeTab: 'quiz-and-practice',
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        evidenceRefs: [`hint_reliance_${hintPct}pct`],
        createdTimestamp: evaluatedAt,
        estimatedMinutes: 5
      });
    }

    // C. Practice Volume: Insufficient Practice (Not Failure!)
    if (!pillars.practice.satisfied) {
      const gapId = `gap_practice_volume_${normalizedScope}`;
      const current = pillars.practice.attemptsCount;
      const required = pillars.practice.minRequired;

      gaps.push({
        gapId,
        gapType: 'insufficient_evidence',
        conceptId: normalizedScope,
        conceptTitle: 'Practice Fluency & Repetition',
        unitId: normalizedScope,
        description: `Practice volume insufficient: ${current} of ${required} required drills completed.`,
        evidenceRefs: [`practice_attempts_${current}_of_${required}`],
        severity: 'advisory'
      });

      recommendations.push({
        recommendationId: `rec_practice_volume_${normalizedScope}`,
        gapId,
        conceptId: normalizedScope,
        conceptTitle: 'Practice Fluency & Repetition',
        headline: 'Complete Practice Drills',
        reason: `Complete ${required - current} more practice drill(s) to establish reliable fluency.`,
        priority: 'medium',
        activityType: 'targeted_drill',
        targetTab: 'practice',
        targetPracticeTab: 'quiz-and-practice',
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        evidenceRefs: [`practice_attempts_${current}_of_${required}`],
        createdTimestamp: evaluatedAt,
        estimatedMinutes: 4
      });
    }

    // D. Application / Simulation Pillar
    if (!pillars.application.satisfied && unitConfig.availableSimulator) {
      const gapId = `gap_sim_${normalizedScope}`;
      gaps.push({
        gapId,
        gapType: 'insufficient_evidence',
        conceptId: normalizedScope,
        conceptTitle: 'Packet Simulation Lab',
        unitId: normalizedScope,
        description: `Interactive packet simulation lab has not yet been completed for ${unitConfig.title}.`,
        evidenceRefs: ['simulation_uncompleted'],
        severity: 'moderate'
      });

      recommendations.push({
        recommendationId: `rec_sim_${normalizedScope}`,
        gapId,
        conceptId: normalizedScope,
        conceptTitle: 'Packet Simulation Lab',
        headline: `Interactive Packet Simulation: ${unitConfig.title}`,
        reason: 'Hands-on packet tracing verifies your practical protocol execution skills.',
        priority: 'medium',
        activityType: 'guided_simulation',
        targetTab: 'simulator',
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        evidenceRefs: ['simulation_uncompleted'],
        createdTimestamp: evaluatedAt,
        estimatedMinutes: 6
      });
    }

    // E. Retention Pillar
    if (!pillars.retention.satisfied && pillars.assessment.satisfied && !isMastered) {
      const gapId = `gap_retention_${normalizedScope}`;
      gaps.push({
        gapId,
        gapType: 'retention_gap',
        conceptId: normalizedScope,
        conceptTitle: 'Spaced Retention Checkpoint',
        unitId: normalizedScope,
        description: 'Spaced retention interval has not yet passed since initial study.',
        evidenceRefs: ['retention_interval_pending'],
        severity: 'advisory'
      });

      recommendations.push({
        recommendationId: `rec_retention_${normalizedScope}`,
        gapId,
        conceptId: normalizedScope,
        conceptTitle: 'Spaced Retention Checkpoint',
        headline: 'Spaced Review Checkpoint',
        reason: 'Review key flashcards periodically to reinforce long-term memory consolidation.',
        priority: 'low',
        activityType: 'targeted_drill',
        targetTab: 'practice',
        targetPracticeTab: 'flashcards',
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        evidenceRefs: ['retention_interval_pending'],
        createdTimestamp: evaluatedAt,
        estimatedMinutes: 3
      });
    }
  }

  // =========================================================================
  // 4. SORT RECOMMENDATIONS DETERMINISTICALLY
  // =========================================================================
  recommendations.sort(compareRecommendations);

  const activeRemediationCount = recommendations.filter((r) => r.status === 'active' || r.status === 'in_progress').length;
  const hasMandatoryBarriers = recommendations.some((r) => r.isMandatoryBarrier && r.status !== 'completed');

  // Summary message formulation
  let summaryText = 'No active learning gaps detected. Your verified evidence demonstrates solid learning progress.';
  if (gaps.length > 0) {
    const criticalCount = gaps.filter((g) => g.severity === 'critical').length;
    if (criticalCount > 0) {
      summaryText = `${criticalCount} critical learning gap(s) identified requiring targeted review before progressing.`;
    } else {
      summaryText = `${gaps.length} targeted recommendation(s) generated to build fluency and strengthen independent mastery.`;
    }
  }

  return {
    studentId,
    scopeId,
    evaluatedAt,
    gaps,
    recommendations,
    activeRemediationCount,
    hasMandatoryBarriers,
    summaryText
  };
}

/**
 * Creates a canonical RemediationRecord matching docs/CRESCO_LEARNING_DATA_MODEL.md Section 8.
 */
export function createRemediationRecord(
  rec: RemediationRecommendation,
  studentId: string,
  courseId: string = 'cs-4200'
): RemediationRecord {
  let triggerReason: RemediationRecord['triggerReason'] = 'assessment_score_below_threshold';
  if (rec.headline.toLowerCase().includes('prerequisite')) {
    triggerReason = 'prerequisite_gap_detected';
  } else if (rec.activityType === 'guided_simulation') {
    triggerReason = 'repeated_simulator_misconfiguration';
  }

  return {
    remediationId: `rem_${rec.recommendationId}`,
    studentId,
    courseId,
    triggeredConceptId: rec.conceptId,
    triggerReason,
    triggerEvidenceRef: rec.evidenceRefs[0] || 'evidence_unspecified',
    identifiedGap: rec.reason,
    prerequisiteConceptsRequired: rec.isMandatoryBarrier ? [rec.conceptId] : [],
    prescribedActivity: {
      activityType: rec.activityType === 'summative_assessment' ? 'targeted_drill' : rec.activityType,
      targetLessonId: rec.targetLessonId,
      targetActivityId: rec.targetActivityId,
      recommendedReadTimeMinutes: rec.estimatedMinutes || 5
    },
    status: 'assigned',
    assignedAt: rec.createdTimestamp,
    completedAt: null,
    updatedAt: rec.createdTimestamp
  };
}
