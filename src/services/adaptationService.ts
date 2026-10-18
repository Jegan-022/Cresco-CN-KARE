/**
 * CRESCO Application Adaptation Service
 *
 * Translates deterministic PedagogyDecision outputs into presentation-safe
 * AdaptationViewModel structures for learner-facing guidance.
 *
 * Architectural Guarantees:
 * - Pure and deterministic: identical decisions yield identical view models.
 * - Non-intrusive: returns null for NEUTRAL_PROGRESSION to prevent notification fatigue.
 * - Safe navigation: targets only existing valid application tabs.
 * - Non-punitive: no XP deductions, no locks, no forced remediation.
 * - Resilient: fails safely without throwing exceptions or blocking the learner.
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/PEDAGOGY_ENGINE_IMPLEMENTATION.md
 */

import { PedagogyDecision } from '../types/pedagogyDecision';
import { AdaptationViewModel, AdaptationSeverity } from '../types/adaptationViewModel';
import { PedagogyContext } from '../types/pedagogyDecision';
import { getStudentLearningEvents } from './learningEventReadService';
import { aggregateLearningEvents } from './evidenceAggregationService';
import { evaluatePedagogy } from './pedagogyEngineService';

/**
 * Pure mapping function translating a PedagogyDecision into an AdaptationViewModel.
 * Returns null when the decision does not warrant an interruption (e.g. NEUTRAL_PROGRESSION).
 */
export function createAdaptationViewModel(
  decision: PedagogyDecision
): AdaptationViewModel | null {
  if (!decision || typeof decision !== 'object') {
    return null;
  }

  const { decisionType, confidence, evidence } = decision;

  switch (decisionType) {
    case 'PREREQUISITE_GAP_SIGNAL_OBSERVED':
      return {
        decisionType,
        title: 'Foundational Review Suggested',
        message: 'A prerequisite networking concept may benefit from a quick review before advancing.',
        action: {
          label: 'Review Prerequisite',
          targetTab: 'review',
        },
        severity: 'review',
        isActionable: true,
        confidence,
        evidenceHighlights: [
          { label: 'Identified Signals', value: evidence.observedErrorCount || 1 },
        ],
      };

    case 'SIGNIFICANT_ERROR_PATTERN_OBSERVED':
      return {
        decisionType,
        title: 'Recommended Concept Review',
        message: 'We noticed a pattern worth reviewing before you continue to the next challenge.',
        action: {
          label: 'Review Concept',
          targetTab: 'review',
        },
        severity: 'review',
        isActionable: true,
        confidence,
        evidenceHighlights: [
          { label: 'Observed Patterns', value: evidence.observedErrorCount || 2 },
        ],
      };

    case 'PRACTICE_EVIDENCE_NEEDED':
      return {
        decisionType,
        title: 'Build Practice Confidence',
        message: 'You have started practicing, but another independent practice activity will help strengthen your understanding.',
        action: {
          label: 'Continue Practice',
          targetTab: 'quiz-and-practice',
        },
        severity: 'guidance',
        isActionable: true,
        confidence,
        evidenceHighlights: [
          { label: 'Completed Lessons', value: evidence.lessonsCompleted },
          { label: 'Completed Practice', value: evidence.successfulPracticeAttempts },
        ],
      };

    case 'HINT_DEPENDENCY_OBSERVED':
      return {
        decisionType,
        title: 'Try Independent Practice',
        message: 'Try the next practice without using a hint if you can. This helps measure your independent understanding.',
        action: {
          label: 'Try Independent Practice',
          targetTab: 'quiz-and-practice',
        },
        severity: 'guidance',
        isActionable: true,
        confidence,
        evidenceHighlights: [
          { label: 'Hints Requested', value: evidence.hintsRequested },
          { label: 'Attempts With Hints', value: evidence.attemptsWithHints },
        ],
      };

    case 'INDEPENDENT_SUCCESS_OBSERVED':
      return {
        decisionType,
        title: 'Independent Success Demonstrated',
        message: 'Good work — you demonstrated independent practice success without relying on hints.',
        severity: 'success',
        isActionable: false,
        confidence,
        evidenceHighlights: [
          { label: 'Independent Successes', value: evidence.independentSuccessfulAttempts },
        ],
      };

    case 'ASSESSMENT_EVIDENCE_AVAILABLE':
      return {
        decisionType,
        title: 'Assessment Record Available',
        message: 'Your assessment evidence has been verified and logged to your progress record.',
        severity: 'info',
        isActionable: false,
        confidence,
        evidenceHighlights: [
          { label: 'Latest Score', value: evidence.latestScore !== undefined ? `${evidence.latestScore}%` : 'N/A' },
          { label: 'Best Score', value: evidence.bestScore !== undefined ? `${evidence.bestScore}%` : 'N/A' },
        ],
      };

    case 'INSUFFICIENT_ASSESSMENT_EVIDENCE':
      return {
        decisionType,
        title: 'Assessment Evidence Needed',
        message: 'More assessment evidence is needed to understand your current progress.',
        action: {
          label: 'Take Assessment',
          targetTab: 'quiz-and-practice',
        },
        severity: 'info',
        isActionable: true,
        confidence,
      };

    case 'NEUTRAL_PROGRESSION':
    default:
      // Return null so neutral baseline produces zero intrusive interruptions
      return null;
  }
}

/**
 * End-to-end evaluation helper for learning boundaries (lesson completion, quiz submission, practice).
 * Scopes event retrieval, executes aggregation, derives pedagogy decisions, and formats learner guidance.
 * 
 * Reliability guarantees:
 * - Fails safely: returns null on any network, read, or processing failure.
 * - Non-blocking: never halts or degrades active learning flow.
 */
export async function getBoundaryAdaptation(
  studentId: string,
  context?: PedagogyContext
): Promise<AdaptationViewModel | null> {
  if (!studentId || typeof studentId !== 'string') {
    return null;
  }

  try {
    const events = await getStudentLearningEvents(studentId, context?.courseId);
    if (!events || events.length === 0) {
      return null;
    }

    const summary = aggregateLearningEvents(events, {
      studentId,
      courseId: context?.courseId || 'cs-4200',
    });

    const decision = evaluatePedagogy(summary, context);
    return createAdaptationViewModel(decision);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[AdaptationService] Non-fatal boundary adaptation error:', msg);
    return null;
  }
}
