/**
 * CRESCO AI Personal Tutor Service
 *
 * Client-side integration layer connecting the student application to the secure
 * server-side AI tutor proxy (/api/ai-tutor).
 *
 * Authority & Safety Boundaries:
 * - Assistive Only: AI tutor CANNOT grant mastery, mutate grades, award XP, or bypass prerequisites.
 * - Secure Proxy: NEVER exposes provider API keys in browser bundle.
 * - Pre-Submission Protection: Never attaches correct answer keys for unsubmitted questions.
 * - Duplicate Guard: Blocks rapid identical duplicate message submissions.
 * - Socratic Grounding: Enriches prompts with authentic CRESCO curriculum context.
 *
 * References:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md Section 10
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md Section 12
 */

import { 
  TutorQueryRequest, 
  TutorQueryResponse, 
  TutorInstructionalContext, 
  AIInteraction 
} from '../types/aiTutor';
import { LessonDefinition } from '../components/lesson/lessonTypes';
import { RemediationRecommendation } from '../types/remediation';

export const TRUSTED_AI_AUTHORITY_BOUNDARY = {
  role: 'assistive_socratic_tutor',
  canGrantMastery: false,
  canAlterGrades: false,
  canAwardXP: false,
  canOverridePrerequisites: false,
  backendProxyEndpoint: '/api/ai-tutor',
  keyStorage: 'Server-side process.env.GROQ_API_KEY only (never client-exposed)'
};

// In-flight request tracker to prevent duplicate message submission
let activeInFlightRequest: AbortController | null = null;
let lastSentMessage = '';
let lastSentTimestamp = 0;
const DUPLICATE_SUBMISSION_WINDOW_MS = 1500;

/**
 * Sends a student query to the secure backend AI tutor proxy.
 */
export async function queryAiTutor(
  request: TutorQueryRequest,
  externalSignal?: AbortSignal
): Promise<TutorQueryResponse> {
  const trimmedMessage = request.message?.trim();

  if (!trimmedMessage) {
    return {
      success: false,
      reply: '',
      model: 'none',
      latencyMs: 0,
      error: 'Message cannot be empty.',
      errorCode: 'INVALID_REQUEST'
    };
  }

  // Duplicate submission guard
  const now = Date.now();
  if (trimmedMessage === lastSentMessage && now - lastSentTimestamp < DUPLICATE_SUBMISSION_WINDOW_MS) {
    return {
      success: false,
      reply: '',
      model: 'none',
      latencyMs: 0,
      error: 'Duplicate message detected. Please wait a moment before resending.',
      errorCode: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Cancel any existing in-flight request
  if (activeInFlightRequest) {
    activeInFlightRequest.abort();
  }

  const abortController = new AbortController();
  activeInFlightRequest = abortController;
  lastSentMessage = trimmedMessage;
  lastSentTimestamp = now;

  // Listen to external abort signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => abortController.abort());
  }

  const baseUrl = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || '';
  const endpoint = `${baseUrl}/api/ai-tutor`;
  const startTime = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: abortController.signal,
      body: JSON.stringify(request)
    });

    const latencyMs = Date.now() - startTime;
    activeInFlightRequest = null;

    if (!res.ok) {
      let errorData: any = {};
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: `Server error (${res.status})` };
      }

      return {
        success: false,
        reply: '',
        model: errorData.model || 'llama-3.3-70b-versatile',
        latencyMs,
        error: errorData.error || `Tutor service responded with status ${res.status}`,
        errorCode: errorData.errorCode || 'AI_PROVIDER_UNAVAILABLE'
      };
    }

    const data: TutorQueryResponse = await res.json();
    return {
      ...data,
      latencyMs: data.latencyMs || latencyMs
    };
  } catch (err: any) {
    activeInFlightRequest = null;
    const latencyMs = Date.now() - startTime;

    if (err.name === 'AbortError') {
      return {
        success: false,
        reply: '',
        model: 'none',
        latencyMs,
        error: 'Tutor request was cancelled.',
        errorCode: 'NETWORK_TIMEOUT'
      };
    }

    return {
      success: false,
      reply: '',
      model: 'none',
      latencyMs,
      error: 'Unable to reach the AI tutor service. Please check your network connection.',
      errorCode: 'NETWORK_TIMEOUT'
    };
  }
}

/**
 * Builds rich instructional context from an active curriculum lesson.
 */
export function buildLessonTutorContext(
  lesson: LessonDefinition,
  actionType: TutorInstructionalContext['actionType'] = 'explain_concept'
): TutorInstructionalContext {
  const currentPhase = lesson.phases?.[0];
  return {
    courseId: 'cs-4200',
    unitId: `unit_${lesson.unitNumber}`,
    lessonId: lesson.id,
    conceptTopic: lesson.topicTitle,
    learningObjective: lesson.subtitle,
    actionType,
    explanationSnippet: currentPhase?.conceptBody || lesson.subtitle
  };
}

/**
 * Builds instructional context for a practice or assessment question.
 * Protects pre-submission confidentiality: only includes user mistake if question was already evaluated.
 */
export function buildPracticeQuestionContext(params: {
  questionPrompt: string;
  conceptTopic?: string;
  unitId?: string;
  lessonId?: string;
  userMistakeText?: string;
  explanation?: string;
  isEvaluated?: boolean;
}): TutorInstructionalContext {
  return {
    courseId: 'cs-4200',
    unitId: params.unitId,
    lessonId: params.lessonId,
    conceptTopic: params.conceptTopic || 'Practice Question',
    actionType: (params.isEvaluated && params.userMistakeText) ? 'explain_mistake' : 'give_hint',
    questionPrompt: params.questionPrompt,
    // Disclose student mistake and explanation ONLY if question is already evaluated
    studentMistake: params.isEvaluated ? params.userMistakeText : undefined,
    explanationSnippet: params.isEvaluated ? params.explanation : undefined
  };
}

/**
 * Builds instructional context from a targeted remediation recommendation.
 */
export function buildRemediationTutorContext(
  rec: RemediationRecommendation
): TutorInstructionalContext {
  return {
    courseId: 'cs-4200',
    unitId: rec.conceptId.startsWith('unit') ? rec.conceptId : undefined,
    lessonId: rec.targetLessonId,
    conceptTopic: rec.conceptTitle,
    actionType: 'explain_mistake',
    learningObjective: rec.headline,
    explanationSnippet: rec.reason
  };
}

/**
 * Generates an audit record of an AI interaction matching docs/CRESCO_LEARNING_DATA_MODEL.md Section 10.
 */
export function createAiInteractionRecord(params: {
  studentId: string;
  prompt: string;
  response: TutorQueryResponse;
  context?: TutorInstructionalContext;
}): AIInteraction {
  return {
    interactionId: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: params.studentId,
    courseId: params.context?.courseId || 'cs-4200',
    context: {
      levelNumber: params.context?.levelNumber,
      lessonId: params.context?.lessonId,
      conceptTopic: params.context?.conceptTopic || 'General Protocol Engineering'
    },
    interactionType: 
      params.context?.actionType === 'give_hint' 
        ? 'guided_hint'
        : params.context?.actionType === 'explain_mistake'
        ? 'misconception_diagnosis'
        : params.context?.actionType === 'simpler_example'
        ? 'analogy_generation'
        : 'concept_explanation',
    inputMetadata: {
      studentQuestionLength: params.prompt.length,
      sanitizedPromptSnippet: params.prompt.substring(0, 100),
      systemInstructionsVersion: 'v1.0.0-socratic-cs4200'
    },
    outputMetadata: {
      responseLength: params.response.reply.length,
      referencedRFCs: (params.response.reply.match(/RFC\s*\d+/gi) || []).map((r) => r.toUpperCase()),
      suggestedFollowUpConcepts: (params.response.recommendedLessons || []).map((l) => l.title)
    },
    providerInfo: {
      model: params.response.model,
      latencyMs: params.response.latencyMs
    },
    timestamp: new Date().toISOString()
  };
}
