import courseJson from './syllabusUnits345.json';
import { CourseUnitData, CourseModuleData, UnitFinalQuizData, UnitFinalQuizQuestion } from '../types';

export interface FlattenedModule extends CourseModuleData {
  unitId: 'unit_3' | 'unit_4' | 'unit_5';
  unitTitle: string;
  unitColor?: string;
  unitIcon?: string;
  moduleIndex: number;
  globalIndex: number;
}

export interface CategorizedPracticeQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  unitId: string;
  unitTitle: string;
  domain: string;
  type: string;
  question: string;
  answer: string;
}

export interface CategorizedQuizQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  unitId: string;
  unitTitle: string;
  domain: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CourseSearchItem {
  id: string;
  moduleId: string;
  unitId: string;
  title: string;
  subtitle: string;
  category: 'Module' | 'Unit' | 'Topic' | 'Practice';
  targetTab: 'lesson-player' | 'courses' | 'practice';
  keywords: string[];
}

// 1. Immutable Raw Source of Truth
export const COURSE_DATA = courseJson;

// 2. Units typed array (3 units)
export const COURSE_UNITS: CourseUnitData[] = (courseJson.units || []) as unknown as CourseUnitData[];

// 3. Flattened Modules (strictly 17 high-yield non-duplicate modules: 7 in Unit 3, 5 in Unit 4, 5 in Unit 5)
let globalCounter = 0;
export const ALL_MODULES: FlattenedModule[] = COURSE_UNITS.flatMap((unit) => {
  return (unit.modules || []).map((mod, index) => {
    globalCounter++;
    return {
      ...mod,
      unitId: unit.id,
      unitTitle: unit.title,
      unitColor: unit.color,
      unitIcon: unit.icon,
      moduleIndex: index,
      globalIndex: globalCounter
    };
  });
});

export const TOTAL_MODULES_COUNT = ALL_MODULES.length; // Exactly 30

export const UNIT_3_MODULES = ALL_MODULES.filter(m => m.unitId === 'unit_3');
export const UNIT_4_MODULES = ALL_MODULES.filter(m => m.unitId === 'unit_4');
export const UNIT_5_MODULES = ALL_MODULES.filter(m => m.unitId === 'unit_5');

// 4. Map for instant O(1) module resolution by ID
export const MODULE_MAP = new Map<string, FlattenedModule>(
  ALL_MODULES.map(m => [m.id, m])
);

// 5. Unit Final Quizzes
export const UNIT_FINAL_QUIZZES: Record<string, UnitFinalQuizData> = {};
COURSE_UNITS.forEach(unit => {
  if (unit.finalQuiz) {
    UNIT_FINAL_QUIZZES[unit.id] = unit.finalQuiz;
  }
});

// 6. Practice Questions (sourced from module practice drills)
export const ALL_PRACTICE_QUESTIONS: CategorizedPracticeQuestion[] = ALL_MODULES.flatMap(mod => {
  let domain = 'Network Layer';
  if (mod.unitId === 'unit_4') domain = 'Transport Layer';
  if (mod.unitId === 'unit_5') domain = 'Application Layer';

  return (mod.practiceDrills || []).map((p, idx) => ({
    id: `${mod.id}_p${idx + 1}`,
    moduleId: mod.id,
    moduleTitle: mod.title,
    unitId: mod.unitId,
    unitTitle: mod.unitTitle,
    domain,
    type: p.type || 'analytical',
    question: p.prompt || p.question || '',
    answer: p.solution || p.answer || ''
  }));
});

// 7. All Module Quiz Questions
export const ALL_MODULE_QUIZ_QUESTIONS: CategorizedQuizQuestion[] = ALL_MODULES.flatMap(mod => {
  let domain = 'Network Layer';
  if (mod.unitId === 'unit_4') domain = 'Transport Layer';
  if (mod.unitId === 'unit_5') domain = 'Application Layer';

  return (mod.quiz || []).map(q => ({
    id: q.id,
    moduleId: mod.id,
    moduleTitle: mod.title,
    unitId: mod.unitId,
    unitTitle: mod.unitTitle,
    domain,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation
  }));
});

// 8. Quick Reference Flashcards directly from syllabus specification
export const QUICK_REFERENCE_FLASHCARDS = (courseJson as any).quickReferenceFlashcards || [
  { q: "What is the OSPF metric based on?", a: "Cost = 10^8 / Bandwidth (bps)" },
  { q: "Formula for usable hosts in a /27 subnet?", a: "Host bits = 5. Usable = 2^5 - 2 = 30 hosts" },
  { q: "What layer does ARP operate between?", a: "Resolves Network Layer IP to Data Link Layer MAC" },
  { q: "Minimum sequence number space for Go-Back-N with window N?", a: "N + 1" },
  { q: "Minimum sequence number space for Selective Repeat with window N?", a: "2 * N" },
  { q: "What are the 4 steps of DHCP IP assignment?", a: "DORA: Discover, Offer, Request, Acknowledge" },
  { q: "Default port numbers for HTTP, HTTPS, SSH, FTP control?", a: "HTTP: 80, HTTPS: 443, SSH: 22, FTP Control: 21" },
  { q: "What triggers Fast Retransmit in TCP?", a: "Arrival of 3 duplicate ACKs (4 identical ACKs total)" }
];

// 9. Gamification rules & XP values from JSON
export const GAMIFICATION_RULES = courseJson.gamification || {
  xp: {
    lessonCompletion: 10,
    interactiveActivity: 20,
    quickCheck: 20,
    moduleCompletion: 50,
    unitQuizCompletion: 200
  },
  levels: [
    { level: 1, title: "Packet Novice", xpRequired: 0, badge: "🌱" },
    { level: 2, title: "Subnet Scout", xpRequired: 150, badge: "🔍" },
    { level: 3, title: "Router Ranger", xpRequired: 400, badge: "🧭" },
    { level: 4, title: "Transport Tactician", xpRequired: 750, badge: "⚡" },
    { level: 5, title: "TCP Commander", xpRequired: 1200, badge: "🛡️" },
    { level: 6, title: "Application Architect", xpRequired: 1800, badge: "🚀" },
    { level: 7, title: "Network Overlord", xpRequired: 2500, badge: "👑" }
  ]
};

// 10. Global Search Index covering all 17 modules, concepts and keywords
export const COURSE_SEARCH_INDEX: CourseSearchItem[] = ALL_MODULES.map(m => {
  const keywords = [
    m.title.toLowerCase(),
    m.unitTitle.toLowerCase(),
    ...(m.learningObjectives || []).map(o => o.toLowerCase()),
    ...(m.keyTakeaways || []).map(c => c.toLowerCase().slice(0, 40))
  ];

  return {
    id: `search_${m.id}`,
    moduleId: m.id,
    unitId: m.unitId,
    title: m.title,
    subtitle: `${m.unitTitle} • ${m.readTimeMinutes} min read`,
    category: 'Module',
    targetTab: 'lesson-player',
    keywords
  };
});

// 11. Helper Utilities
export function getModuleById(moduleId: string): FlattenedModule | undefined {
  // Normalize module IDs e.g. u3_m1 vs u3_m01 vs mod-3-1
  if (MODULE_MAP.has(moduleId)) return MODULE_MAP.get(moduleId);
  
  // Try normalized variants
  const cleaned = moduleId.replace('mod-', 'u').replace('-', '_m');
  if (MODULE_MAP.has(cleaned)) return MODULE_MAP.get(cleaned);

  // Try padded variants (u3_m01 -> u3_m1)
  const unpadded = moduleId.replace('_m0', '_m');
  if (MODULE_MAP.has(unpadded)) return MODULE_MAP.get(unpadded);

  const padded = moduleId.replace(/_m([1-9])$/, '_m0$1');
  if (MODULE_MAP.has(padded)) return MODULE_MAP.get(padded);

  const baseMatch = ALL_MODULES.find(m => m.id === moduleId);
  if (baseMatch) return baseMatch;

  if (typeof window !== 'undefined') {
    try {
      const customRaw = localStorage.getItem('netquest_custom_modules_v1');
      if (customRaw) {
        const customMods = JSON.parse(customRaw);
        const match = customMods.find((m: any) => m.id === moduleId || m.code === moduleId);
        if (match) return match;
      }
    } catch {
      // Ignore
    }
  }

  return undefined;
}

export function getNextModule(currentModuleId: string): FlattenedModule | null {
  const current = getModuleById(currentModuleId);
  if (!current) return ALL_MODULES[0] || null;
  const idx = ALL_MODULES.findIndex(m => m.id === current.id);
  if (idx >= 0 && idx < ALL_MODULES.length - 1) {
    return ALL_MODULES[idx + 1];
  }
  return null;
}

export function getPreviousModule(currentModuleId: string): FlattenedModule | null {
  const current = getModuleById(currentModuleId);
  if (!current) return null;
  const idx = ALL_MODULES.findIndex(m => m.id === current.id);
  if (idx > 0) {
    return ALL_MODULES[idx - 1];
  }
  return null;
}

export function calculateOverallProgress(completedModulesCount: number): number {
  if (!completedModulesCount || completedModulesCount <= 0) return 0;
  return Math.min(100, Math.round((completedModulesCount / (ALL_MODULES.length || 30)) * 100));
}
