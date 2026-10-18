// Cresco CN - Level Content Types for Modular Per-Level Architecture
// Each level in src/levels/level-X/ has its own dedicated data and configuration

export interface LevelTakeaway {
  text: string;
}

export interface ConceptTabContent {
  id: 'overview' | 'key-concepts' | 'analogy' | 'examples' | 'notes';
  label: string;
  title: string;
  content: string[];
  keyTakeaways: string[];
  diagram?: {
    type: string;
    source: string;
    layer: string;
    destination: string;
    caption: string;
  };
}

export interface SimulationRouter {
  id: string;
  name: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  active?: boolean;
}

export interface SimulationConfig {
  title: string;
  description: string;
  mascotTip: string;
  sourceCity: string;
  destinationCity: string;
  routers: SimulationRouter[];
  defaultMessage: string;
  path: string[];
  hops: number;
  totalTimeMs: number;
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string; // 'A' | 'B' | 'C' | 'D'
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  isCenter?: boolean;
  category?: 'primary' | 'secondary' | 'accent';
}

export interface MindMapEdge {
  from: string;
  to: string;
  label?: string;
}

export interface SummaryConfig {
  keyConcepts: string[];
  importantPoints: string[];
  realWorldAnalogy: string;
  commonUses: string[];
  mindMap: {
    center: string;
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  };
}

export interface LevelDefinition {
  id: number; // 1, 2, 3...
  slug: string; // 'level-1', 'level-2'
  lessonId: string; // 'u3_m01'
  unitNumber: number; // 3, 4, 5
  unitTitle: string; // 'Unit 3: Network Layer'
  lessonNumber: number; // 1
  totalLessonsInUnit: number; // 8
  title: string; // 'Network Layer — Need and Issues'
  subtitle: string;
  description?: string;
  objectives?: string[];
  estimatedDuration: string;
  mascotQuote: string;
  mascotTip: string;
  xpReward: number;
  nextLevelSlug?: string;
  prevLevelSlug?: string;
  
  // 4 Core Stages matching the design reference
  concept: {
    tabs: ConceptTabContent[];
    heading?: string;
    body?: string;
    highlightWords?: { word: string; explanation: string }[];
  };
  interactive: SimulationConfig;
  animatedLearning?: {
    diagramType?: string;
    animationTopicId?: string;
    description?: string;
  };
  quiz: {
    title: string;
    subtitle: string;
    questions: QuizQuestion[];
    quickTips: string[];
  };
  summary: SummaryConfig;
  completionState?: {
    isCompleted?: boolean;
    minScore?: number;
    requiredBadge?: string;
  };
  phases?: any[];
}
