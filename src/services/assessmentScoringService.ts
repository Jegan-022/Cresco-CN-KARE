/**
 * CRESCO Production — Step 20 Assessment Scoring Service
 * 
 * Deterministic, objective evaluation and scoring service for CRESCO practice and assessments.
 * Implements pure evaluation logic aligned with the CRESCO Learning Data Model:
 * - Single-choice (strict equality against authoritative correct index/identifier)
 * - Multiple-select (strict match or rubric-based partial credit)
 * - True/False (boolean evaluation)
 * - Short-answer (whitespace-normalized, case-insensitive evaluation against primary and alternate acceptable keys)
 * - Subjective / Open-ended (status: 'pending_evaluation' — zero automated credit without verified grading)
 * 
 * Adheres to:
 * - docs/CRESCO_LEARNING_DATA_MODEL.md
 * - docs/CRESCO_PEDAGOGY_SPECIFICATION.md
 * - Pre-submission answer key protection (never reveal answers in question payload until evaluated)
 * - Idempotent submission evaluation (prevents duplicate submission processing)
 */

export type QuestionType = 
  | 'single_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'subjective_open';

export type PartialCreditRubric = 'all_or_nothing' | 'net_positive' | 'proportional';

export interface BaseAssessmentQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points?: number; // default 1
  moduleId?: string;
  unitId?: string;
  bloomLevel?: string;
  explanation?: string;
  conceptReference?: string;
}

export interface SingleChoiceQuestion extends BaseAssessmentQuestion {
  type: 'single_choice';
  options: string[];
  correctOptionIndex: number;
}

export interface MultipleSelectQuestion extends BaseAssessmentQuestion {
  type: 'multiple_select';
  options: string[];
  correctOptionIndices: number[];
  partialCreditRubric?: PartialCreditRubric; // default 'all_or_nothing'
}

export interface TrueFalseQuestion extends BaseAssessmentQuestion {
  type: 'true_false';
  correctValue: boolean;
}

export interface ShortAnswerQuestion extends BaseAssessmentQuestion {
  type: 'short_answer';
  acceptableAnswers: string[]; // Primary + alternate acceptable strings
  caseSensitive?: boolean; // default false
  numericTolerance?: number; // If numerical comparison applies
}

export interface SubjectiveQuestion extends BaseAssessmentQuestion {
  type: 'subjective_open';
  sampleAnswer?: string;
  scoringCriteria?: string[];
}

export type AssessmentQuestion =
  | SingleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | SubjectiveQuestion;

export type QuestionResponseValue = 
  | number              // SingleChoice option index
  | number[]            // MultipleSelect option indices
  | boolean             // TrueFalse
  | string              // ShortAnswer or Subjective text
  | null 
  | undefined;

export interface QuestionSubmission {
  questionId: string;
  response: QuestionResponseValue;
  timeSpentSeconds?: number;
}

export interface AssessmentSubmission {
  assessmentId: string;
  studentId: string;
  attemptId: string;
  mode: 'practice' | 'formal_assessment' | 'diagnostic';
  unitId?: string;
  moduleId?: string;
  startedAt: string;
  submittedAt: string;
  responses: QuestionSubmission[];
}

export type EvaluationStatus = 'correct' | 'incorrect' | 'partially_correct' | 'pending_evaluation' | 'unanswered';

export interface QuestionEvaluationResult {
  questionId: string;
  type: QuestionType;
  status: EvaluationStatus;
  pointsEarned: number;
  pointsPossible: number;
  userResponse: QuestionResponseValue;
  correctAnswer: unknown; // Disclosed ONLY upon evaluation
  explanation: string;
  conceptReference?: string;
  feedbackMessage: string;
}

export interface AssessmentEvaluationResult {
  assessmentId: string;
  attemptId: string;
  studentId: string;
  mode: 'practice' | 'formal_assessment' | 'diagnostic';
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  partiallyCorrectCount: number;
  pendingEvaluationCount: number;
  totalPointsEarned: number;
  totalPointsPossible: number;
  percentageScore: number;
  isFullyObjective: boolean;
  questionResults: QuestionEvaluationResult[];
  submittedAt: string;
  evaluatedAt: string;
}

/**
 * Normalizes text response for deterministic short answer comparisons.
 */
export function normalizeShortAnswer(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Evaluates a single question response against its authoritative specification.
 */
export function evaluateQuestionResponse(
  question: AssessmentQuestion,
  responseValue: QuestionResponseValue
): QuestionEvaluationResult {
  const pointsPossible = question.points ?? 1;
  const explanation = question.explanation || 'Explanation unavailable for this curriculum question.';
  const conceptReference = question.conceptReference || (question.moduleId ? `Module ${question.moduleId}` : undefined);

  // Check for unanswered
  if (responseValue === null || responseValue === undefined || responseValue === '') {
    return {
      questionId: question.id,
      type: question.type,
      status: 'unanswered',
      pointsEarned: 0,
      pointsPossible,
      userResponse: null,
      correctAnswer: getProtectedCorrectAnswer(question),
      explanation,
      conceptReference,
      feedbackMessage: 'This question was not answered.'
    };
  }

  if (Array.isArray(responseValue) && responseValue.length === 0) {
    return {
      questionId: question.id,
      type: question.type,
      status: 'unanswered',
      pointsEarned: 0,
      pointsPossible,
      userResponse: [],
      correctAnswer: getProtectedCorrectAnswer(question),
      explanation,
      conceptReference,
      feedbackMessage: 'No options were selected.'
    };
  }

  switch (question.type) {
    case 'single_choice': {
      const selectedIdx = typeof responseValue === 'number' ? responseValue : Number(responseValue);
      const isCorrect = selectedIdx === question.correctOptionIndex;
      return {
        questionId: question.id,
        type: question.type,
        status: isCorrect ? 'correct' : 'incorrect',
        pointsEarned: isCorrect ? pointsPossible : 0,
        pointsPossible,
        userResponse: selectedIdx,
        correctAnswer: question.correctOptionIndex,
        explanation,
        conceptReference,
        feedbackMessage: isCorrect ? 'Correct choice.' : 'Incorrect option selected.'
      };
    }

    case 'true_false': {
      const boolVal = typeof responseValue === 'boolean' 
        ? responseValue 
        : String(responseValue).toLowerCase() === 'true';
      const isCorrect = boolVal === question.correctValue;
      return {
        questionId: question.id,
        type: question.type,
        status: isCorrect ? 'correct' : 'incorrect',
        pointsEarned: isCorrect ? pointsPossible : 0,
        pointsPossible,
        userResponse: boolVal,
        correctAnswer: question.correctValue,
        explanation,
        conceptReference,
        feedbackMessage: isCorrect ? 'Correct response.' : 'Incorrect response.'
      };
    }

    case 'multiple_select': {
      const selectedIndices = Array.isArray(responseValue) 
        ? responseValue.map(Number).sort((a, b) => a - b)
        : [Number(responseValue)];
      const correctIndices = [...question.correctOptionIndices].sort((a, b) => a - b);
      const rubric = question.partialCreditRubric || 'all_or_nothing';

      const correctSet = new Set(correctIndices);
      const selectedSet = new Set(selectedIndices);

      const truePositives = selectedIndices.filter(i => correctSet.has(i)).length;
      const falsePositives = selectedIndices.filter(i => !correctSet.has(i)).length;
      const falseNegatives = correctIndices.filter(i => !selectedSet.has(i)).length;

      const isExactMatch = falsePositives === 0 && falseNegatives === 0;

      if (isExactMatch) {
        return {
          questionId: question.id,
          type: question.type,
          status: 'correct',
          pointsEarned: pointsPossible,
          pointsPossible,
          userResponse: selectedIndices,
          correctAnswer: correctIndices,
          explanation,
          conceptReference,
          feedbackMessage: 'All correct options selected.'
        };
      }

      if (rubric === 'all_or_nothing') {
        return {
          questionId: question.id,
          type: question.type,
          status: 'incorrect',
          pointsEarned: 0,
          pointsPossible,
          userResponse: selectedIndices,
          correctAnswer: correctIndices,
          explanation,
          conceptReference,
          feedbackMessage: 'Incorrect selection. All correct options must be selected.'
        };
      }

      if (rubric === 'net_positive') {
        // Points awarded = max(0, (TruePositives - FalsePositives) / TotalCorrect) * pointsPossible
        const netCorrect = Math.max(0, truePositives - falsePositives);
        const fraction = correctIndices.length > 0 ? netCorrect / correctIndices.length : 0;
        const earned = Math.round(fraction * pointsPossible * 100) / 100;
        const status = earned > 0 ? 'partially_correct' : 'incorrect';
        return {
          questionId: question.id,
          type: question.type,
          status,
          pointsEarned: earned,
          pointsPossible,
          userResponse: selectedIndices,
          correctAnswer: correctIndices,
          explanation,
          conceptReference,
          feedbackMessage: earned > 0 
            ? `Partially correct (${truePositives} correct, ${falsePositives} incorrect).`
            : 'Incorrect selection.'
        };
      }

      // Proportional rubric: TruePositives / TotalCorrect (if no false positives)
      if (falsePositives === 0 && truePositives > 0) {
        const fraction = truePositives / correctIndices.length;
        const earned = Math.round(fraction * pointsPossible * 100) / 100;
        return {
          questionId: question.id,
          type: question.type,
          status: 'partially_correct',
          pointsEarned: earned,
          pointsPossible,
          userResponse: selectedIndices,
          correctAnswer: correctIndices,
          explanation,
          conceptReference,
          feedbackMessage: `Partially correct (${truePositives} of ${correctIndices.length} correct options).`
        };
      }

      return {
        questionId: question.id,
        type: question.type,
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible,
        userResponse: selectedIndices,
        correctAnswer: correctIndices,
        explanation,
        conceptReference,
        feedbackMessage: 'Incorrect selection.'
      };
    }

    case 'short_answer': {
      const userText = String(responseValue).trim();
      const caseSensitive = question.caseSensitive ?? false;

      let isMatch = false;
      if (caseSensitive) {
        isMatch = question.acceptableAnswers.some(ans => ans.trim() === userText);
      } else {
        const normalizedUser = normalizeShortAnswer(userText);
        isMatch = question.acceptableAnswers.some(ans => normalizeShortAnswer(ans) === normalizedUser);
      }

      // Numeric tolerance check if applicable
      if (!isMatch && question.numericTolerance !== undefined) {
        const userNum = parseFloat(userText);
        if (!isNaN(userNum)) {
          for (const ans of question.acceptableAnswers) {
            const targetNum = parseFloat(ans);
            if (!isNaN(targetNum) && Math.abs(userNum - targetNum) <= question.numericTolerance) {
              isMatch = true;
              break;
            }
          }
        }
      }

      return {
        questionId: question.id,
        type: question.type,
        status: isMatch ? 'correct' : 'incorrect',
        pointsEarned: isMatch ? pointsPossible : 0,
        pointsPossible,
        userResponse: userText,
        correctAnswer: question.acceptableAnswers[0],
        explanation,
        conceptReference,
        feedbackMessage: isMatch ? 'Correct answer.' : 'Your answer did not match expected criteria.'
      };
    }

    case 'subjective_open': {
      // Subjective answers cannot be authoritatively scored by client
      return {
        questionId: question.id,
        type: question.type,
        status: 'pending_evaluation',
        pointsEarned: 0,
        pointsPossible,
        userResponse: String(responseValue).trim(),
        correctAnswer: question.sampleAnswer || 'Requires teacher review.',
        explanation,
        conceptReference,
        feedbackMessage: 'Submitted for faculty evaluation. Not automatically scored.'
      };
    }

    default:
      return {
        questionId: (question as BaseAssessmentQuestion).id,
        type: (question as BaseAssessmentQuestion).type,
        status: 'incorrect',
        pointsEarned: 0,
        pointsPossible,
        userResponse: responseValue,
        correctAnswer: null,
        explanation: 'Unsupported question type.',
        feedbackMessage: 'Unsupported question type.'
      };
  }
}

/**
 * Returns the protected answer key only during evaluation.
 */
function getProtectedCorrectAnswer(question: AssessmentQuestion): unknown {
  switch (question.type) {
    case 'single_choice':
      return question.correctOptionIndex;
    case 'multiple_select':
      return question.correctOptionIndices;
    case 'true_false':
      return question.correctValue;
    case 'short_answer':
      return question.acceptableAnswers[0];
    case 'subjective_open':
      return question.sampleAnswer || 'Requires manual review';
  }
}

/**
 * Strips correct answers from question objects before transmitting to student view,
 * ensuring students cannot inspect the client payload for answers prior to submission.
 */
export function sanitizeQuestionForClient<T extends AssessmentQuestion>(question: T): Omit<T, 'correctOptionIndex' | 'correctOptionIndices' | 'correctValue' | 'acceptableAnswers'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { explanation, ...rest } = (question as unknown) as Record<string, unknown>;
  const sanitized = { ...rest };
  delete sanitized.correctOptionIndex;
  delete sanitized.correctOptionIndices;
  delete sanitized.correctValue;
  delete sanitized.acceptableAnswers;
  // Explanations are also withheld until submission
  return sanitized as Omit<T, 'correctOptionIndex' | 'correctOptionIndices' | 'correctValue' | 'acceptableAnswers'>;
}

// In-memory idempotency guard for evaluated attempt IDs
const processedAttemptIds = new Set<string>();

/**
 * Authoritatively evaluates an entire assessment submission against the master question definitions.
 * Performs validation, score aggregation, and duplicate submission rejection.
 */
export function evaluateAssessmentSubmission(
  submission: AssessmentSubmission,
  questions: AssessmentQuestion[]
): AssessmentEvaluationResult {
  if (!submission.attemptId || !submission.assessmentId || !submission.studentId) {
    throw new Error('Invalid assessment submission: missing required metadata (attemptId, assessmentId, studentId).');
  }

  // Idempotency check: prevent duplicate submission evaluation
  if (processedAttemptIds.has(submission.attemptId)) {
    throw new Error(`Duplicate submission detected: attempt ${submission.attemptId} has already been evaluated.`);
  }

  const questionMap = new Map<string, AssessmentQuestion>();
  questions.forEach(q => questionMap.set(q.id, q));

  const responseMap = new Map<string, QuestionResponseValue>();
  submission.responses.forEach(r => responseMap.set(r.questionId, r.response));

  const questionResults: QuestionEvaluationResult[] = [];
  let totalPointsEarned = 0;
  let totalPointsPossible = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let partiallyCorrectCount = 0;
  let pendingEvaluationCount = 0;
  let unansweredCount = 0;
  let answeredCount = 0;
  let isFullyObjective = true;

  for (const question of questions) {
    const userResponse = responseMap.get(question.id);
    const result = evaluateQuestionResponse(question, userResponse);
    questionResults.push(result);

    totalPointsPossible += result.pointsPossible;
    totalPointsEarned += result.pointsEarned;

    if (result.type === 'subjective_open') {
      isFullyObjective = false;
    }

    switch (result.status) {
      case 'correct':
        correctCount++;
        answeredCount++;
        break;
      case 'incorrect':
        incorrectCount++;
        answeredCount++;
        break;
      case 'partially_correct':
        partiallyCorrectCount++;
        answeredCount++;
        break;
      case 'pending_evaluation':
        pendingEvaluationCount++;
        answeredCount++;
        break;
      case 'unanswered':
        unansweredCount++;
        break;
    }
  }

  // Percentage calculated only against objective possible points or total
  const percentageScore = totalPointsPossible > 0
    ? Math.round((totalPointsEarned / totalPointsPossible) * 1000) / 10
    : 0;

  // Mark attempt as processed
  processedAttemptIds.add(submission.attemptId);

  return {
    assessmentId: submission.assessmentId,
    attemptId: submission.attemptId,
    studentId: submission.studentId,
    mode: submission.mode,
    totalQuestions: questions.length,
    answeredCount,
    unansweredCount,
    correctCount,
    incorrectCount,
    partiallyCorrectCount,
    pendingEvaluationCount,
    totalPointsEarned: Math.round(totalPointsEarned * 100) / 100,
    totalPointsPossible,
    percentageScore,
    isFullyObjective,
    questionResults,
    submittedAt: submission.submittedAt,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Helper to clear processed attempts (useful for unit testing).
 */
export function clearProcessedAttempts(): void {
  processedAttemptIds.clear();
}
