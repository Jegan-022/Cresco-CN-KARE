/**
 * CRESCO CN Deterministic Personalized Learning Engine Service
 *
 * Implements Step 24 of the CRESCO Production Roadmap.
 *
 * Core Architectural Guarantees:
 * 1. Pure & Deterministic: Identical inputs yield identical recommendations in the exact same order.
 * 2. Independent: Zero dependencies on React, Firebase, network calls, or AI models.
 * 3. Evidence-Grounded: Every recommendation points to verified learning evidence, gaps, or curriculum sequence.
 * 4. Transparent & Explainable: Every recommendation has an honest rationale and verified destination.
 * 5. Prerequisite & Boundary Safe: Excludes unavailable lessons and blocks progression when prerequisites are unmet.
 *
 * Flow:
 * REAL LEARNING EVIDENCE → MASTERY STATUS → LEARNING GAP → PERSONALIZED RECOMMENDATION → STUDENT ACTION → NEW EVIDENCE → UPDATED RECOMMENDATION
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 9: Recommendation)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { ALL_MODULES, FlattenedModule } from '../data/courseContent';
import { findLessonById } from '../components/lesson/lessonDatabase';
import {
  PersonalizationInput,
  PersonalizationResult,
  PersonalizedRecommendation,
  PersonalizationCategory,
  PersonalizationPriority
} from '../types/personalization';
import { RemediationRecommendation } from '../types/remediation';
import { MasteryRecord } from '../types/mastery';

/**
 * Unit prerequisite requirements:
 * Unit 3 (Network Layer) has no prerequisites.
 * Unit 4 (Transport Layer) requires Unit 3 completion.
 * Unit 5 (Application Layer) requires Unit 4 completion.
 */
export const UNIT_PREREQUISITE_RULES: Record<string, { prereqUnitId?: string; prereqTitle?: string; minRequiredModules: number }> = {
  'unit_3': { minRequiredModules: 7 }, // Unit 3 has 7 high-yield core modules
  'unit_4': { prereqUnitId: 'unit_3', prereqTitle: 'Unit 3: Network Layer', minRequiredModules: 5 },
  'unit_5': { prereqUnitId: 'unit_4', prereqTitle: 'Unit 4: Transport Layer', minRequiredModules: 5 }
};

/**
 * Deterministic category rank for priority tie-breaking.
 */
const CATEGORY_PRIORITY_RANK: Record<PersonalizationCategory, number> = {
  'resolve_prerequisites': 0,
  'strengthen_understanding': 1,
  'gather_evidence': 2,
  'continue_learning': 3,
  'review_and_retain': 4
};

const PRIORITY_RANK: Record<PersonalizationPriority, number> = {
  'high': 0,
  'medium': 1,
  'low': 2
};

export function normalizeLessonId(id?: string): string {
  if (!id) return '';
  return id.replace(/_m0(\d)/, '_m$1');
}

/**
 * Evaluates student learning evidence and returns deterministic personalized recommendations.
 */
export function evaluatePersonalizedRecommendations(
  input: PersonalizationInput
): PersonalizationResult {
  const generatedAt = Date.now();
  const studentId = input.studentId?.trim() || '';
  const courseId = input.courseId || 'cs-4200';

  // Defensive isolation: Return empty result if studentId is missing
  if (!studentId) {
    return {
      studentId: '',
      courseId,
      primaryRecommendation: null,
      secondaryRecommendations: [],
      allEligibleRecommendations: [],
      summary: {
        totalEligible: 0,
        unmetPrerequisitesCount: 0,
        activeRemediationsCount: 0,
        needsEvidenceCount: 0,
        completedLessonsCount: 0,
        isCourseCompleted: false
      },
      generatedAt
    };
  }

  // Normalized set supporting both padded ('u4_m05') and unpadded ('u4_m5') IDs
  const completedIds = new Set<string>();
  (input.completedLessonIds || []).forEach((id) => {
    completedIds.add(id);
    completedIds.add(normalizeLessonId(id));
  });

  const masteryMap = new Map<string, MasteryRecord>();
  (input.masteryRecords || []).forEach((m) => {
    masteryMap.set(m.conceptId, m);
    masteryMap.set(normalizeLessonId(m.conceptId), m);
  });

  const eligibleList: PersonalizedRecommendation[] = [];

  // Count completions per unit
  const unit3Completed = ALL_MODULES.filter((m) => m.unitId === 'unit_3' && completedIds.has(m.id)).length;
  const unit4Completed = ALL_MODULES.filter((m) => m.unitId === 'unit_4' && completedIds.has(m.id)).length;
  const unit5Completed = ALL_MODULES.filter((m) => m.unitId === 'unit_5' && completedIds.has(m.id)).length;

  const isUnit3Complete = unit3Completed >= (UNIT_PREREQUISITE_RULES['unit_3']?.minRequiredModules || 7);
  const isUnit4Complete = unit4Completed >= (UNIT_PREREQUISITE_RULES['unit_4']?.minRequiredModules || 5);

  // -------------------------------------------------------------
  // STEP 1: PREREQUISITE BARRIER CHECK (resolve_prerequisites)
  // -------------------------------------------------------------
  // Check if student has attempted or is enrolled in Unit 4 or Unit 5 with missing prereqs
  const hasAttemptedUnit4 = ALL_MODULES.some((m) => m.unitId === 'unit_4' && completedIds.has(m.id));
  const hasAttemptedUnit5 = ALL_MODULES.some((m) => m.unitId === 'unit_5' && completedIds.has(m.id));

  // Also check if active remediations report a prerequisite_gap
  const prereqRemediations = (input.remediationRecommendations || []).filter(
    (r) => r.status === 'active' && r.headline?.toLowerCase().includes('prerequisite')
  );

  if ((hasAttemptedUnit4 || prereqRemediations.length > 0) && !isUnit3Complete) {
    const firstIncompleteUnit3 = ALL_MODULES.find((m) => m.unitId === 'unit_3' && !completedIds.has(m.id)) || ALL_MODULES[0];
    eligibleList.push({
      id: `rec_prereq_${studentId}_unit_3`,
      studentId,
      courseId,
      category: 'resolve_prerequisites',
      priority: 'high',
      title: 'Resolve Prerequisite: Network Layer Foundations',
      description: 'Foundational Network Layer concepts must be mastered before advancing through Transport Layer.',
      rationale: `Transport Layer (Unit 4) requires completed proficiency in Unit 3 (Network Layer). Complete '${firstIncompleteUnit3.title}' to clear this prerequisite.`,
      targetTab: 'learn-map',
      targetLessonId: firstIncompleteUnit3.id,
      conceptId: 'network-layer-prerequisite',
      conceptTitle: 'Network Layer Foundations',
      unitId: 'unit_3',
      unitTitle: 'Unit 3: Network Layer',
      isMandatoryBarrier: true,
      isAvailable: true,
      status: 'active',
      sourceType: 'deterministic_pedagogy',
      evidenceRefs: prereqRemediations.flatMap((r) => r.evidenceRefs),
      estimatedMinutes: 8,
      xpReward: 30,
      generatedAt
    });
  } else if (hasAttemptedUnit5 && !isUnit4Complete) {
    const firstIncompleteUnit4 = ALL_MODULES.find((m) => m.unitId === 'unit_4' && !completedIds.has(m.id)) || ALL_MODULES.find((m) => m.unitId === 'unit_4')!;
    eligibleList.push({
      id: `rec_prereq_${studentId}_unit_4`,
      studentId,
      courseId,
      category: 'resolve_prerequisites',
      priority: 'high',
      title: 'Resolve Prerequisite: Transport Layer Protocols',
      description: 'Application Layer architectures require foundational understanding of TCP/UDP socket transport.',
      rationale: `Application Layer (Unit 5) builds upon TCP flow control and connection states from Unit 4. Complete '${firstIncompleteUnit4.title}' to satisfy prerequisites.`,
      targetTab: 'learn-map',
      targetLessonId: firstIncompleteUnit4.id,
      conceptId: 'transport-layer-prerequisite',
      conceptTitle: 'Transport Layer Foundations',
      unitId: 'unit_4',
      unitTitle: 'Unit 4: Transport Layer',
      isMandatoryBarrier: true,
      isAvailable: true,
      status: 'active',
      sourceType: 'deterministic_pedagogy',
      evidenceRefs: [],
      estimatedMinutes: 8,
      xpReward: 30,
      generatedAt
    });
  }

  // -------------------------------------------------------------
  // STEP 2: ACTIVE TARGETED REMEDIATION (strengthen_understanding)
  // -------------------------------------------------------------
  const activeRemediations = (input.remediationRecommendations || []).filter(
    (r) => r.status === 'active' && !r.headline?.toLowerCase().includes('prerequisite')
  );

  for (const rem of activeRemediations) {
    if (!rem.isAvailable) {
      continue; // Exclude unavailable activities from actionable recommendations
    }

    eligibleList.push({
      id: `rec_rem_${rem.recommendationId}`,
      studentId,
      courseId,
      category: 'strengthen_understanding',
      priority: rem.priority,
      title: rem.headline,
      description: rem.reason,
      rationale: `Diagnostic assessment identified learning gaps on ${rem.conceptTitle}. Completing this targeted activity reinforces understanding.`,
      targetTab: rem.targetTab,
      targetLessonId: rem.targetLessonId,
      targetPracticeTab: rem.targetPracticeTab,
      targetActivityId: rem.targetActivityId,
      conceptId: rem.conceptId,
      conceptTitle: rem.conceptTitle,
      unitId: rem.conceptId.startsWith('unit') ? rem.conceptId : undefined,
      isMandatoryBarrier: rem.isMandatoryBarrier,
      isAvailable: rem.isAvailable,
      status: 'active',
      sourceType: 'deterministic_pedagogy',
      evidenceRefs: rem.evidenceRefs,
      estimatedMinutes: 6,
      xpReward: 25,
      generatedAt
    });
  }

  // -------------------------------------------------------------
  // STEP 3: CONCEPTS LACKING PRACTICE EVIDENCE (gather_evidence)
  // -------------------------------------------------------------
  // Identify lessons that were completed (explored) but have no practice/quiz scores recorded
  const practiceScores = input.practiceScores || {};
  for (const lessonId of completedIds) {
    const mod = ALL_MODULES.find((m) => m.id === lessonId || m.id === normalizeLessonId(lessonId));
    if (!mod) continue;

    const hasQuizScore = practiceScores[lessonId] !== undefined || practiceScores[mod.id] !== undefined || practiceScores[normalizeLessonId(lessonId)] !== undefined;
    const mastery = masteryMap.get(mod.id);
    const needsPracticeEvidence = !hasQuizScore && (!mastery || mastery.masteryState === 'learning' || mastery.masteryState === 'developing' || mastery.masteryState === 'insufficient_evidence');

    if (needsPracticeEvidence) {
      eligibleList.push({
        id: `rec_evidence_${studentId}_${lessonId}`,
        studentId,
        courseId,
        category: 'gather_evidence',
        priority: 'medium',
        title: `Verify Understanding: ${mod.title}`,
        description: 'Complete practice questions to demonstrate your competency and unlock mastery.',
        rationale: `You explored the lesson on '${mod.title}', but have not yet submitted practice drills to verify your competency.`,
        targetTab: 'practice',
        targetLessonId: mod.id,
        targetPracticeTab: 'quiz-and-practice',
        conceptId: mod.id,
        conceptTitle: mod.title,
        unitId: mod.unitId,
        unitTitle: mod.unitTitle,
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        sourceType: 'deterministic_pedagogy',
        evidenceRefs: [lessonId],
        estimatedMinutes: 5,
        xpReward: 20,
        generatedAt
      });
      break; // Limit to 1 most urgent evidence drill to prevent cognitive overload
    }
  }

  // -------------------------------------------------------------
  // STEP 4: NEXT SEQUENTIAL CURRICULUM LESSON (continue_learning)
  // -------------------------------------------------------------
  const nextIncompleteModule: FlattenedModule | undefined = ALL_MODULES.find(
    (m) => !completedIds.has(m.id)
  );

  if (nextIncompleteModule) {
    // Verify that the module's unit prerequisites are satisfied
    let isBlockedByPrereq = false;
    let prereqBlockReason = '';

    if (nextIncompleteModule.unitId === 'unit_4' && !isUnit3Complete) {
      isBlockedByPrereq = true;
      prereqBlockReason = 'Complete Unit 3 Network Layer modules first.';
    } else if (nextIncompleteModule.unitId === 'unit_5' && !isUnit4Complete) {
      isBlockedByPrereq = true;
      prereqBlockReason = 'Complete Unit 4 Transport Layer modules first.';
    }

    if (!isBlockedByPrereq) {
      const canonicalLesson = findLessonById(nextIncompleteModule.id);
      const isAvailable = canonicalLesson !== null || !!nextIncompleteModule.lesson;

      eligibleList.push({
        id: `rec_next_${studentId}_${nextIncompleteModule.id}`,
        studentId,
        courseId,
        category: 'continue_learning',
        // High priority if no unmet prerequisites or critical remediations exist
        priority: eligibleList.length === 0 ? 'high' : 'medium',
        title: `Next Up: ${nextIncompleteModule.title}`,
        description: nextIncompleteModule.pedagogy?.concept || nextIncompleteModule.lesson?.hook || 'Advance through the Computer Networks curriculum.',
        rationale: `Continue your structured syllabus progression in ${nextIncompleteModule.unitTitle}.`,
        targetTab: 'learn-map',
        targetLessonId: nextIncompleteModule.id,
        conceptId: nextIncompleteModule.id,
        conceptTitle: nextIncompleteModule.title,
        unitId: nextIncompleteModule.unitId,
        unitTitle: nextIncompleteModule.unitTitle,
        isMandatoryBarrier: false,
        isAvailable,
        unavailableExplanation: !isAvailable ? 'This lesson is currently under curriculum authoring.' : undefined,
        status: 'active',
        sourceType: 'deterministic_pedagogy',
        evidenceRefs: [],
        estimatedMinutes: nextIncompleteModule.readTimeMinutes || 7,
        xpReward: 50,
        generatedAt
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 5: REVIEW & RETAIN SPACED LEARNING (review_and_retain)
  // -------------------------------------------------------------
  // Offer spaced retention review if student has completed at least 3 lessons
  if (completedIds.size >= 3) {
    const firstCompleted = ALL_MODULES.find((m) => completedIds.has(m.id));
    if (firstCompleted) {
      eligibleList.push({
        id: `rec_review_${studentId}_${firstCompleted.id}`,
        studentId,
        courseId,
        category: 'review_and_retain',
        priority: 'low',
        title: `Spaced Retention: ${firstCompleted.title}`,
        description: 'Periodic review of foundational concepts strengthens long-term memory for exams.',
        rationale: 'Reviewing completed protocol concepts after learning new material reinforces memory retention.',
        targetTab: 'review',
        targetLessonId: firstCompleted.id,
        conceptId: firstCompleted.id,
        conceptTitle: firstCompleted.title,
        unitId: firstCompleted.unitId,
        unitTitle: firstCompleted.unitTitle,
        isMandatoryBarrier: false,
        isAvailable: true,
        status: 'active',
        sourceType: 'deterministic_pedagogy',
        evidenceRefs: [firstCompleted.id],
        estimatedMinutes: 4,
        xpReward: 15,
        generatedAt
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 6: DETERMINISTIC SORTING & PRIORITIZATION
  // -------------------------------------------------------------
  eligibleList.sort((a, b) => {
    // 1. Mandatory barriers first
    if (a.isMandatoryBarrier !== b.isMandatoryBarrier) {
      return a.isMandatoryBarrier ? -1 : 1;
    }
    // 2. Priority rank (high < medium < low)
    const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pDiff !== 0) return pDiff;

    // 3. Category rank (resolve_prereq < strengthen < gather_evidence < continue < review)
    const cDiff = CATEGORY_PRIORITY_RANK[a.category] - CATEGORY_PRIORITY_RANK[b.category];
    if (cDiff !== 0) return cDiff;

    // 4. Deterministic string tie-breaker
    return a.id.localeCompare(b.id);
  });

  // Filter out any duplicates (by targetLessonId + category)
  const seenKeys = new Set<string>();
  const deduplicatedList: PersonalizedRecommendation[] = [];
  for (const rec of eligibleList) {
    const key = `${rec.category}_${rec.targetLessonId || rec.conceptId || rec.id}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicatedList.push(rec);
    }
  }

  const primaryRecommendation = deduplicatedList.length > 0 ? deduplicatedList[0] : null;
  const secondaryRecommendations = deduplicatedList.slice(1, 4);

  return {
    studentId,
    courseId,
    primaryRecommendation,
    secondaryRecommendations,
    allEligibleRecommendations: deduplicatedList,
    summary: {
      totalEligible: deduplicatedList.length,
      unmetPrerequisitesCount: deduplicatedList.filter((r) => r.category === 'resolve_prerequisites').length,
      activeRemediationsCount: deduplicatedList.filter((r) => r.category === 'strengthen_understanding').length,
      needsEvidenceCount: deduplicatedList.filter((r) => r.category === 'gather_evidence').length,
      completedLessonsCount: completedIds.size,
      nextLessonId: nextIncompleteModule?.id,
      isCourseCompleted: completedIds.size >= ALL_MODULES.length
    },
    generatedAt
  };
}

/**
 * Returns student-friendly action label for recommendation button.
 */
export function formatRecommendationActionLabel(rec: PersonalizedRecommendation): string {
  switch (rec.category) {
    case 'resolve_prerequisites':
      return 'Resolve Prerequisite';
    case 'strengthen_understanding':
      return 'Start Targeted Practice';
    case 'gather_evidence':
      return 'Submit Practice Drills';
    case 'continue_learning':
      return 'Continue Lesson';
    case 'review_and_retain':
      return 'Review Concept';
    default:
      return 'Open Activity';
  }
}

/**
 * Returns presentation styling information for recommendation category badges.
 */
export function getCategoryDisplayInfo(category: PersonalizationCategory): {
  label: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  iconName: string;
} {
  switch (category) {
    case 'resolve_prerequisites':
      return {
        label: 'Prerequisite Required',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
        badgeText: 'text-amber-800 dark:text-amber-300',
        accentBorder: 'border-amber-400/50',
        iconName: 'AlertCircle'
      };
    case 'strengthen_understanding':
      return {
        label: 'Targeted Remediation',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-800 dark:text-rose-300',
        accentBorder: 'border-rose-400/50',
        iconName: 'Activity'
      };
    case 'gather_evidence':
      return {
        label: 'Practice Required',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
        badgeText: 'text-indigo-800 dark:text-indigo-300',
        accentBorder: 'border-indigo-400/50',
        iconName: 'CheckCircle'
      };
    case 'continue_learning':
      return {
        label: 'Recommended Next',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        accentBorder: 'border-emerald-400/50',
        iconName: 'Sparkles'
      };
    case 'review_and_retain':
      return {
        label: 'Spaced Review',
        badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
        badgeText: 'text-sky-800 dark:text-sky-300',
        accentBorder: 'border-sky-400/50',
        iconName: 'Clock'
      };
  }
}
