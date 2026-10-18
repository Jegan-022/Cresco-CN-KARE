/**
 * CRESCO Application Adaptation Types
 *
 * Strongly typed presentation models translating deterministic PedagogyDecision outputs
 * into learner-facing guidance, actionable recommendations, and safe navigation suggestions.
 *
 * Core Boundaries:
 * - NO mastery decisions.
 * - NO progression locking or forced remediation.
 * - NO XP alterations.
 * - NO internal engine jargon exposed to students.
 *
 * References:
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - docs/PEDAGOGY_ENGINE_IMPLEMENTATION.md
 */

import { NavTab } from '../types';
import { PedagogyDecisionType } from './pedagogyDecision';

export type AdaptationSeverity = 'info' | 'guidance' | 'success' | 'review';

export interface AdaptationAction {
  label: string;
  targetTab?: NavTab;
  targetLessonId?: string;
  targetUnitId?: string;
  targetActivityId?: string;
}

export interface AdaptationViewModel {
  decisionType: PedagogyDecisionType;
  title: string;
  message: string;
  action?: AdaptationAction;
  severity: AdaptationSeverity;
  isActionable: boolean;
  confidence: 'low' | 'medium' | 'high';
  evidenceHighlights?: {
    label: string;
    value: string | number;
  }[];
}
