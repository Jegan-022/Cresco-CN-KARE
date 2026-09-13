import courseJson from './syllabusUnits345.json';

export interface ChallengeQuestion {
  id: string;
  unitId: 'unit-3' | 'unit-4' | 'unit-5';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface UnitChallenge {
  unitId: 'unit-3' | 'unit-4' | 'unit-5';
  unitTitle: string;
  passingScorePercent: number; // 70%
  passingCount: number; // 14 out of 20
  totalQuestions: number; // 20
  xpReward: number; // +200 XP
  unlocksUnitId?: 'unit-4' | 'unit-5';
  questions: ChallengeQuestion[];
}

// Build challenges directly and verifiably from the source-of-truth course JSON
const buildChallenges = (): Record<string, UnitChallenge> => {
  const challenges: Record<string, UnitChallenge> = {};

  (courseJson.units || []).forEach((unit: any) => {
    const kebabId = (unit.id.replace('_', '-') as 'unit-3' | 'unit-4' | 'unit-5');
    const rawQuestions = (unit.finalQuiz?.questions && unit.finalQuiz.questions.length > 0)
      ? unit.finalQuiz.questions
      : (unit.modules || []).flatMap((m: any) => m.quiz || []);

    const questions: ChallengeQuestion[] = rawQuestions.map((q: any) => ({
      id: q.id,
      unitId: kebabId,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      topic: unit.title
    }));

    let unlocksUnitId: 'unit-4' | 'unit-5' | undefined;
    if (unit.id === 'unit_3') unlocksUnitId = 'unit-4';
    if (unit.id === 'unit_4') unlocksUnitId = 'unit-5';

    const challengeObj: UnitChallenge = {
      unitId: kebabId,
      unitTitle: `${unit.title} Final Exam Challenge`,
      passingScorePercent: unit.passMark || 70,
      passingCount: Math.ceil((questions.length * (unit.passMark || 70)) / 100),
      totalQuestions: questions.length,
      xpReward: (courseJson.gamification as any)?.xp?.unitQuizCompletion || 200,
      unlocksUnitId,
      questions
    };

    // Support both snake_case ('unit_3') and kebab-case ('unit-3') accessors
    challenges[kebabId] = challengeObj;
    challenges[unit.id] = challengeObj;
  });

  return challenges;
};

export const UNIT_CHALLENGES: Record<string, UnitChallenge> = buildChallenges();
