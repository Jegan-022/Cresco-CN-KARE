// Cresco CN Interactive Lesson Engine Type Definitions

export type LessonPhaseType = 
  | 'intro'
  | 'explain'
  | 'visualize'
  | 'interact'
  | 'question'
  | 'matching'
  | 'fill-in'
  | 'ordering'
  | 'topology'
  | 'scenario'
  | 'packet-challenge'
  | 'completed';

export type QuestionFormat = 
  | 'mcq'
  | 'tf'
  | 'matching'
  | 'fill-in'
  | 'ordering'
  | 'topology'
  | 'scenario'
  | 'packet-challenge';

export interface McqOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
  sublabel?: string;
  isCorrect?: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface LessonPhase {
  id: string;
  type: LessonPhaseType;
  title: string;
  subtitle?: string;
  byteQuote: string;
  bytePose?: 'idle' | 'explaining' | 'thinking' | 'correct' | 'wrong' | 'celebrating' | 'boss-mode' | 'streak' | 'level-up';
  
  // Concept & Explanation properties
  conceptHeading?: string;
  conceptBody?: string;
  highlightWords?: {
    word: string;
    explanation: string;
  }[];
  
  // Interactive diagram descriptor
  diagramType?: 
    | 'packet-flow'
    | 'tcp-handshake'
    | 'tcp-vs-udp'
    | 'congestion'
    | 'qos'
    | 'dns-pipeline'
    | 'dhcp-dora'
    | 'arp-mac'
    | 'routing-topology'
    | 'save-the-packet'
    | 'http-request'
    | 'https-tls'
    | 'eap-8021x';

  // Question specific properties
  questionText?: string;
  mcqOptions?: McqOption[];
  tfCorrectAnswer?: boolean;
  tfExplanation?: string;
  fillInCorrectAnswer?: string;
  fillInHint?: string;
  orderingItems?: {
    id: string;
    label: string;
    correctPosition: number; // 0-indexed
  }[];
  matchingPairs?: MatchingPair[];
  scenarioDetails?: {
    context: string;
    clues: { label: string; value: string }[];
  };
  explanation?: string;
  hint?: string;
  xpReward?: number;
}

export interface LessonDefinition {
  id: string;
  unitNumber: 3 | 4 | 5;
  unitName: string;
  lessonNumber: number;
  totalLessonsInUnit: number;
  topicTitle: string;
  subtitle: string;
  estimatedDuration: string; // e.g. "3–5 min"
  phases: LessonPhase[];
  nextLessonId?: string;
  nextLessonTitle?: string;
  masteryRating: number; // 0–100%
}
