/**
 * CRESCO AI Personal Tutor Types
 *
 * Strongly typed contracts for AI-mediated pedagogical assistance, Socratic hints,
 * contextual lesson guidance, and canonical AIInteraction auditing.
 *
 * Authority Boundaries:
 * - Assistive only: NEVER alters official grades, XP, badges, or mastery records.
 * - Socratic guidance: provides progressive hints before full solutions.
 * - Curriculum-grounded: refers to authentic CS-4200 units, lessons, and RFC protocols.
 * - Answer key protection: never transmits unsubmitted assessment keys to client or prompts.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md Section 10 (Canonical AIInteraction Schema)
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md Section 12
 * - docs/CRESCO_CANONICAL_CURRICULUM.md
 */

import { NavTab } from '../types';

export type TutorActionType = 
  | 'explain_concept'     // Clarifying technical terminology and protocol mechanics
  | 'give_hint'           // Progressive diagnostic hint without direct solution
  | 'explain_mistake'     // Unpacking why a drill answer was incorrect
  | 'simpler_example'     // Analogy or worked example using real-world metaphors
  | 'general_qa';         // Freeform student question about the curriculum

export interface TutorRecommendedLesson {
  lessonId: string;
  title: string;
  unitNumber: number;
  topicTitle?: string;
}

export interface TutorInstructionalContext {
  courseId: string;
  unitId?: string;
  levelNumber?: number;
  lessonId?: string;
  conceptTopic?: string;
  learningObjective?: string;
  actionType?: TutorActionType;
  questionPrompt?: string;
  studentMistake?: string; // Sanitized incorrect response
  explanationSnippet?: string; // Curriculum syllabus explanation snippet
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'tutor' | 'system';
  text: string;
  timestamp: string;
  context?: TutorInstructionalContext;
  recommendedLessons?: TutorRecommendedLesson[];
  suggestedActions?: string[];
  isError?: boolean;
  errorCode?: string;
}

export interface TutorQueryRequest {
  studentId: string;
  message: string;
  context?: TutorInstructionalContext;
  conversationHistory?: {
    role: 'user' | 'model';
    text: string;
  }[];
}

export interface TutorQueryResponse {
  success: boolean;
  reply: string;
  model: string;
  latencyMs: number;
  recommendedLessons?: TutorRecommendedLesson[];
  suggestedActions?: string[];
  error?: string;
  errorCode?: 
    | 'AI_PROVIDER_UNAVAILABLE'
    | 'RATE_LIMIT_EXCEEDED'
    | 'NETWORK_TIMEOUT'
    | 'INVALID_REQUEST'
    | 'SECURITY_VIOLATION'
    | 'CONTENT_FILTERED';
}

/**
 * Canonical AIInteraction schema matching docs/CRESCO_LEARNING_DATA_MODEL.md Section 10.
 */
export interface AIInteraction {
  interactionId: string;
  studentId: string;
  courseId: string;
  context: {
    levelNumber?: number;
    lessonId?: string;
    activityId?: string;
    conceptTopic: string;
  };
  interactionType:
    | 'concept_explanation'
    | 'analogy_generation'
    | 'misconception_diagnosis'
    | 'guided_hint';
  inputMetadata: {
    studentQuestionLength: number;
    sanitizedPromptSnippet: string;
    systemInstructionsVersion: string;
  };
  outputMetadata: {
    responseLength: number;
    referencedRFCs: string[];
    suggestedFollowUpConcepts: string[];
  };
  providerInfo: {
    model: string;
    latencyMs: number;
    tokensUsed?: number;
  };
  timestamp: string;
}
