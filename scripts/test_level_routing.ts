import { parseLevelFromPath, getLevelRoute, getLevelRouteByLessonId } from '../src/utils/levelRouting';
import { getLessonById } from '../src/components/lesson/lessonDatabase';
import { getLevelDefinition } from '../src/levels/registry';

console.log('====================================================');
console.log('🧪 LEVEL ARCHITECTURE & NAVIGATION INTEGRITY TEST');
console.log('====================================================\n');

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ [FAIL] ${msg}`);
    throw new Error(msg);
  }
  console.log(`✅ [PASS] ${msg}`);
}

// 1. Test Level 1
console.log('--- 1. Testing Level 1 ---');
const l1Config = getLevelDefinition('level1');
assert(l1Config.id === 1, 'Level 1 ID is 1');
assert(Boolean(l1Config.title), `Level 1 title: "${l1Config.title}"`);
assert(Boolean(l1Config.description), `Level 1 description: "${l1Config.description}"`);
assert(Array.isArray(l1Config.objectives) && l1Config.objectives.length > 0, `Level 1 has ${l1Config.objectives?.length} objectives`);
assert(l1Config.concept.tabs.length >= 4, `Level 1 has ${l1Config.concept.tabs.length} concept tabs`);
assert(Boolean(l1Config.interactive?.title), `Level 1 interactive simulation: "${l1Config.interactive.title}"`);
assert(Boolean(l1Config.animatedLearning?.diagramType), `Level 1 animated diagram: "${l1Config.animatedLearning?.diagramType}"`);
assert(l1Config.quiz.questions.length >= 3, `Level 1 quiz has ${l1Config.quiz.questions.length} questions`);
assert(Boolean(l1Config.summary?.mindMap?.center), `Level 1 summary mindmap: "${l1Config.summary?.mindMap?.center}"`);
assert(l1Config.xpReward === 100, `Level 1 XP reward is ${l1Config.xpReward}`);
const l1Lesson = getLessonById('level1');
assert(l1Lesson.phases.length > 0, `Level 1 resolves to ${l1Lesson.phases.length} lesson phases for GamifiedLessonView`);

// 2. Test Level 2
console.log('\n--- 2. Testing Level 2 ---');
const l2Config = getLevelDefinition('level2');
assert(l2Config.id === 2, 'Level 2 ID is 2');
assert(Boolean(l2Config.title), `Level 2 title: "${l2Config.title}"`);
assert(Boolean(l2Config.description), `Level 2 description: "${l2Config.description}"`);
assert(Array.isArray(l2Config.objectives) && l2Config.objectives.length > 0, `Level 2 has ${l2Config.objectives?.length} objectives`);
assert(l2Config.concept.tabs.length >= 4, `Level 2 has ${l2Config.concept.tabs.length} concept tabs`);
assert(Boolean(l2Config.interactive?.title), `Level 2 interactive simulation: "${l2Config.interactive.title}"`);
assert(Boolean(l2Config.animatedLearning?.diagramType), `Level 2 animated diagram: "${l2Config.animatedLearning?.diagramType}"`);
assert(l2Config.quiz.questions.length >= 2, `Level 2 quiz has ${l2Config.quiz.questions.length} questions`);
assert(Boolean(l2Config.summary?.mindMap?.center), `Level 2 summary mindmap: "${l2Config.summary?.mindMap?.center}"`);
assert(l2Config.xpReward === 120, `Level 2 XP reward is ${l2Config.xpReward}`);
const l2Lesson = getLessonById('level2');
assert(l2Lesson.phases.length > 0, `Level 2 resolves to ${l2Lesson.phases.length} lesson phases for GamifiedLessonView`);

// 3. Test Middle Level: Level 10 (Transport Protocols ARQ Challenge)
console.log('\n--- 3. Testing Middle Level: Level 10 ---');
const l10Config = getLevelDefinition('level10');
assert(l10Config.id === 10, 'Level 10 ID is 10');
assert(l10Config.unitNumber === 4, 'Level 10 belongs to Unit 4 Transport Layer');
assert(Boolean(l10Config.title), `Level 10 title: "${l10Config.title}"`);
assert(Boolean(l10Config.description), `Level 10 description: "${l10Config.description}"`);
assert(Array.isArray(l10Config.objectives) && l10Config.objectives.length > 0, `Level 10 has ${l10Config.objectives?.length} objectives`);
assert(l10Config.concept.tabs.length >= 4, `Level 10 has ${l10Config.concept.tabs.length} concept tabs`);
assert(Boolean(l10Config.interactive?.title), `Level 10 interactive simulation: "${l10Config.interactive.title}"`);
assert(Boolean(l10Config.animatedLearning?.diagramType), `Level 10 animated diagram: "${l10Config.animatedLearning?.diagramType}"`);
assert(l10Config.quiz.questions.length >= 5, `Level 10 quiz has ${l10Config.quiz.questions.length} questions`);
assert(Boolean(l10Config.summary?.mindMap?.center), `Level 10 summary mindmap: "${l10Config.summary?.mindMap?.center}"`);
assert(l10Config.xpReward === 250, `Level 10 XP reward is ${l10Config.xpReward}`);
const l10Lesson = getLessonById('level10');
assert(l10Lesson.phases.length > 0, `Level 10 resolves to ${l10Lesson.phases.length} lesson phases for GamifiedLessonView`);

// 4. Test Final Level: Level 21 (Internet Architecture Capstone)
console.log('\n--- 4. Testing Final Level: Level 21 ---');
const l21Config = getLevelDefinition('level21');
assert(l21Config.id === 21, 'Level 21 ID is 21');
assert(l21Config.unitNumber === 5, 'Level 21 belongs to Unit 5 Application Layer');
assert(Boolean(l21Config.title), `Level 21 title: "${l21Config.title}"`);
assert(Boolean(l21Config.description), `Level 21 description: "${l21Config.description}"`);
assert(Array.isArray(l21Config.objectives) && l21Config.objectives.length > 0, `Level 21 has ${l21Config.objectives?.length} objectives`);
assert(l21Config.concept.tabs.length >= 4, `Level 21 has ${l21Config.concept.tabs.length} concept tabs`);
assert(Boolean(l21Config.interactive?.title), `Level 21 interactive simulation: "${l21Config.interactive.title}"`);
assert(Boolean(l21Config.animatedLearning?.diagramType), `Level 21 animated diagram: "${l21Config.animatedLearning?.diagramType}"`);
assert(l21Config.quiz.questions.length >= 5, `Level 21 quiz has ${l21Config.quiz.questions.length} questions`);
assert(Boolean(l21Config.summary?.mindMap?.center), `Level 21 summary mindmap: "${l21Config.summary?.mindMap?.center}"`);
assert(l21Config.xpReward === 300, `Level 21 XP reward is ${l21Config.xpReward}`);
const l21Lesson = getLessonById('level21');
assert(l21Lesson.phases.length > 0, `Level 21 resolves to ${l21Lesson.phases.length} lesson phases for GamifiedLessonView`);

// 5. Test Learn Map Consistency across all 21 levels
console.log('\n--- 5. Testing Learn Map 21 Levels Consistency ---');
for (let i = 1; i <= 21; i++) {
  const path = `/learn/level${i}`;
  const route = parseLevelFromPath(path);
  assert(Boolean(route && route.levelNumber === i), `Route /learn/level${i} parses to level ${i}`);
  const level = getLevelDefinition(i);
  assert(Boolean(level && level.id === i && level.title), `Level ${i} definition exists with title: "${level.title}"`);
  const lesson = getLessonById(`level${i}`);
  assert(Boolean(lesson && lesson.phases && lesson.phases.length > 0), `Level ${i} provides valid lesson phases for GamifiedLessonView`);
}

console.log('\n====================================================');
console.log('🎉 ALL LEVEL CONTENT & NAVIGATION TESTS PASSED (100%)');
console.log('====================================================\n');
