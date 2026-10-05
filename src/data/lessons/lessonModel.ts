// Strongly typed data models for modular Cresco CN lessons
// Each lesson page (Concept, Interactive, Quiz, Summary) consumes these fields.

export interface ConceptTabOverview {
  heading: string;
  body: string;
  sourceLabel?: string;
  destinationLabel?: string;
  layerLabel?: string;
  takeaways: string[];
}

export interface ConceptTabKeyConcepts {
  heading: string;
  points: {
    title: string;
    description: string;
    badge?: string;
  }[];
}

export interface ConceptTabAnalogy {
  heading: string;
  story: string;
  comparison: {
    realWorld: string;
    networking: string;
  }[];
}

export interface ConceptTabExamples {
  heading: string;
  items: {
    title: string;
    scenario: string;
    howItWorks: string;
  }[];
}

export interface ConceptTabData {
  overview: ConceptTabOverview;
  keyConcepts: ConceptTabKeyConcepts;
  analogy: ConceptTabAnalogy;
  examples: ConceptTabExamples;
  quickNotes: string[];
}

export interface SimulationNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'host' | 'router' | 'gateway';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface SimulationLink {
  from: string;
  to: string;
  label?: string;
}

export interface SimulationData {
  title: string;
  subtitle: string;
  octoSpeech: string;
  sourceCity: string;
  destinationCity: string;
  sourceIp: string;
  destinationIp: string;
  nodes: SimulationNode[];
  links: SimulationLink[];
  bestPath: string[]; // Node IDs in sequence
  hops: number;
  totalTimeMs: number;
  visualExplanationSteps: {
    step: number;
    title: string;
    description: string;
  }[];
  explorePrompts: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  hint?: string;
}

export interface QuizData {
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  quickTips: string[];
}

export interface MindMapBranch {
  id: string;
  title: string;
  category?: string;
  color?: string;
}

export interface LessonSummaryData {
  keyConcepts: string[];
  importantPoints: string[];
  realWorldAnalogy: string;
  commonUses: string[];
  mindMapCenter: string;
  mindMapBranches: MindMapBranch[];
}

export interface LessonUnitItem {
  id: string;
  number: number;
  title: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface ModularLesson {
  id: string; // e.g. 'u3_m01'
  unitId: string; // 'unit_3'
  unitName: string; // 'Unit 3: Network Layer'
  unitNumber: number; // 3
  lessonNumber: number; // 1
  totalLessonsInUnit: number; // 8
  title: string; // 'Network Layer — Need and Issues'
  subtitle: string;
  estimatedDuration: string; // '4–5 min'
  xpReward: number; // 50
  octoConceptSpeech: string;
  octoSimulationSpeech: string;
  octoQuizSpeech: string;
  octoSummarySpeech: string;

  // 4 Modular Pages
  concept: ConceptTabData;
  simulation: SimulationData;
  quiz: QuizData;
  summary: LessonSummaryData;

  // Next lesson pointer
  nextLessonId?: string;
  nextLessonTitle?: string;
}
