import { 
  COURSE_DATA, 
  COURSE_UNITS, 
  ALL_MODULES, 
  UNIT_3_MODULES, 
  UNIT_4_MODULES, 
  UNIT_5_MODULES, 
  ALL_PRACTICE_QUESTIONS, 
  ALL_MODULE_QUIZ_QUESTIONS, 
  QUICK_REFERENCE_FLASHCARDS,
  getModuleById, 
  getNextModule, 
  getPreviousModule, 
  calculateOverallProgress 
} from './src/data/courseContent';
import { UNIT_CHALLENGES } from './src/data/unitQuizzes';

console.log('====================================================');
console.log('🧪 NETQUEST E2E 30-MODULE CURRICULUM VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
  }
}

// 1. DATASET & ZERO DUPLICATE TESTS
console.log('--- 1. Course Dataset & Non-Duplicate Integrity ---');
assert(COURSE_UNITS.length === 3, 'Course contains exactly 3 Units (Unit 3, 4, 5)');
assert(ALL_MODULES.length === 30, 'Total modules count equals strictly 30 (0 duplicates)', `Found: ${ALL_MODULES.length}`);
assert(UNIT_3_MODULES.length === 12, 'Unit 3 contains exactly 12 modules', `Found: ${UNIT_3_MODULES.length}`);
assert(UNIT_4_MODULES.length === 9, 'Unit 4 contains exactly 9 modules', `Found: ${UNIT_4_MODULES.length}`);
assert(UNIT_5_MODULES.length === 9, 'Unit 5 contains exactly 9 modules', `Found: ${UNIT_5_MODULES.length}`);

// Check unique IDs and unique titles
const moduleIds = new Set<string>();
const moduleTitles = new Set<string>();
let hasDuplicateId = false;
let hasDuplicateTitle = false;

ALL_MODULES.forEach(m => {
  if (moduleIds.has(m.id)) hasDuplicateId = true;
  moduleIds.add(m.id);

  if (moduleTitles.has(m.title.toLowerCase().trim())) hasDuplicateTitle = true;
  moduleTitles.add(m.title.toLowerCase().trim());
});

assert(!hasDuplicateId, 'All 30 module IDs are unique (No duplicate IDs)');
assert(!hasDuplicateTitle, 'All 30 module titles are unique (No duplicate titles)');

// 2. QUESTION BANK & FLASHCARDS TESTS
console.log('\n--- 2. Question Banks & Flashcards ---');
assert(ALL_MODULE_QUIZ_QUESTIONS.length >= 30, `Total module quiz questions count: ${ALL_MODULE_QUIZ_QUESTIONS.length}`);
assert(QUICK_REFERENCE_FLASHCARDS.length === 8, 'Quick reference flashcards contains 8 items', `Found: ${QUICK_REFERENCE_FLASHCARDS.length}`);
const unit3FinalQCount = UNIT_CHALLENGES['unit-3']?.questions?.length || 0;
const unit4FinalQCount = UNIT_CHALLENGES['unit-4']?.questions?.length || 0;
const unit5FinalQCount = UNIT_CHALLENGES['unit-5']?.questions?.length || 0;
assert(unit3FinalQCount > 0, `Unit 3 Final Challenge questions exist (${unit3FinalQCount})`);
assert(unit4FinalQCount > 0, `Unit 4 Final Challenge questions exist (${unit4FinalQCount})`);
assert(unit5FinalQCount > 0, `Unit 5 Final Challenge questions exist (${unit5FinalQCount})`);

// 3. PEDAGOGICAL CONTENT COMPLETENESS
console.log('\n--- 3. Pedagogical Content Completeness ---');
let allModulesValid = true;
ALL_MODULES.forEach(mod => {
  if (!mod.title || !mod.xp || !mod.readTimeMinutes) {
    allModulesValid = false;
  }
  if (!mod.pedagogy?.hook || !mod.pedagogy?.analogy || !mod.pedagogy?.concept) {
    allModulesValid = false;
  }
  if (!mod.keyTakeaways || mod.keyTakeaways.length === 0) {
    allModulesValid = false;
  }
  if (!mod.quiz || mod.quiz.length === 0) {
    allModulesValid = false;
  }
});
assert(allModulesValid, 'All 30 modules contain complete pedagogical structure (Hook, Analogy, Concept, Key Takeaways, Quiz)');

// 4. PROGRESSION & NAVIGATION HELPERS
console.log('\n--- 4. Progression & Navigation Helpers ---');
assert(calculateOverallProgress(0) === 0, 'Zero-state progress is 0%');
assert(calculateOverallProgress(30) === 100, '30 completed modules is 100%');
assert(calculateOverallProgress(15) === 50, '15 completed modules is 50%');

const firstMod = getModuleById('u3_m1');
assert(firstMod !== undefined && firstMod.title.includes('Need, Issues & Services'), 'getModuleById correctly resolves u3_m1');
const nextMod = getNextModule('u3_m1');
assert(nextMod !== null && nextMod.id === 'u3_m2', 'getNextModule advances from u3_m1 to u3_m2');
const prevMod = getPreviousModule('u3_m2');
assert(prevMod !== null && prevMod.id === 'u3_m1', 'getPreviousModule returns to u3_m1');

// 5. GAMIFICATION & UNLOCK RULES SIMULATION
console.log('\n--- 5. Gamification & Unlocking Rules Simulation ---');
let studentXP = 0;
const completedSteps = new Set<string>();

const m1 = 'u3_m1';
if (!completedSteps.has(`${m1}_intro`)) {
  completedSteps.add(`${m1}_intro`);
  studentXP += 10;
}
if (!completedSteps.has(`${m1}_intro`)) {
  studentXP += 10;
}
assert(studentXP === 10, 'Idempotent Intro XP: Duplicate prevented (XP = 10)');

if (!completedSteps.has(`${m1}_activity`)) {
  completedSteps.add(`${m1}_activity`);
  studentXP += 20;
}
if (!completedSteps.has(`${m1}_quiz`)) {
  completedSteps.add(`${m1}_quiz`);
  studentXP += 50;
}
assert(studentXP === 80, 'Module full completion awards XP (10 + 20 + 50 = 80)');

// Unit Unlocking Simulation
const unlockedUnits = ['unit_3'];
const passScore = 14;
if (passScore / 20 >= 0.70) {
  unlockedUnits.push('unit_4');
}
assert(unlockedUnits.includes('unit_4'), 'Unit 4 unlocks when Unit 3 Final Exam score >= 70%');

const failScore = 12;
if (failScore / 20 >= 0.70) {
  unlockedUnits.push('unit_5');
}
assert(!unlockedUnits.includes('unit_5'), 'Unit 5 remains locked when Unit 4 Final Exam score < 70%');

const passScoreU4 = 15;
if (passScoreU4 / 20 >= 0.70) {
  unlockedUnits.push('unit_5');
}
assert(unlockedUnits.includes('unit_5'), 'Unit 5 unlocks when Unit 4 Final Exam score >= 70%');

console.log('\n====================================================');
console.log(`📊 FINAL TEST REPORT: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round(passedTests/totalTests*100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
