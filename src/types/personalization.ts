/**
 * CRESCO CN Personalized Learning Engine Types
 *
 * Canonical schema definitions for Step 24 of the CRESCO Production Roadmap.
 *
 * Learning Loop:
 * REAL LEARNING EVIDENCE → MASTERY STATUS → LEARNING GAP → PERSONALIZED RECOMMENDATION → STUDENT ACTION → NEW EVIDENCE → UPDATED RECOMMENDATION
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md (Section 9: Recommendation)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { NavTab } from '../types';
import { MasteryRecord } from './mastery';
import { RemediationRecommendation } from './remediation';
import { LearningEvent } from './learningEvents';

export type PersonalizationCategory =
  | 'continue_learning'         // Next eligible syllabus lesson or learning activity
  | 'strengthen_understanding'   // Relevant practice for a verified learning gap (from active remediation)
  | 'gather_evidence'           // Eligible assessment or practice drill when evidence is insufficient
  | 'resolve_prerequisites'     // Existing prerequisite activity that must be completed first
  | 'review_and_retain';        // Revision activity supported by curriculum or spaced retention policy

export type PersonalizationPriority = 'high' | 'medium' | 'low';

export type PersonalizationSourceType = 
  | 'deterministic_pedagogy'    // Rule-based deterministic pedagogy engine
  | 'ai_assisted_advisor';      // Socratic AI tutor explanation

export type RecommendationStatus = 
  | 'active'                    // Displayed and eligible on student dashboard
  | 'in_progress'               // Student has launched the activity
  | 'completed'                 // Verified completion evidence recorded
  | 'dismissed';                // Dismissed (only allowed for non-mandatory advisory items)

export interface PersonalizedRecommendation {
  id: string;
  studentId: string;
  courseId: string;
  category: PersonalizationCategory;
  priority: PersonalizationPriority;
  title: string;
  description: string;
  rationale: string;
  targetTab: NavTab;
  targetLessonId?: string;
  targetLevelNumber?: number;
  targetPracticeTab?: 'flashcards' | 'quiz-and-practice' | 'challenge';
  targetActivityId?: string;
  conceptId?: string;
  conceptTitle?: string;
  unitId?: string;
  unitTitle?: string;
  isMandatoryBarrier: boolean;
  isAvailable: boolean;
  unavailableExplanation?: string;
  status: RecommendationStatus;
  sourceType: PersonalizationSourceType;
  evidenceRefs: string[];
  evidenceSummary?: {
    quizScore?: number;
    totalAttempts?: number;
    hintCount?: number;
    observedErrors?: number;
    masteryState?: string;
  };
  estimatedMinutes?: number;
  xpReward?: number;
  generatedAt: number;
}

export interface PersonalizationInput {
  studentId: string;
  courseId?: string;
  learningEvents?: LearningEvent[];
  masteryRecords?: MasteryRecord[];
  remediationRecommendations?: RemediationRecommendation[];
  completedLessonIds?: string[];
  completedLevelNumbers?: number[];
  unlockedUnits?: string[];
  practiceScores?: Record<string, number>;
  quizAverage?: number;
  activeRemediationIds?: string[];
}

export interface PersonalizationResult {
  studentId: string;
  courseId: string;
  primaryRecommendation: PersonalizedRecommendation | null;
  secondaryRecommendations: PersonalizedRecommendation[];
  allEligibleRecommendations: PersonalizedRecommendation[];
  summary: {
    totalEligible: number;
    unmetPrerequisitesCount: number;
    activeRemediationsCount: number;
    needsEvidenceCount: number;
    completedLessonsCount: number;
    nextLessonId?: string;
    isCourseCompleted: boolean;
  };
  generatedAt: number;
}
