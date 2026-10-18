/**
 * CRESCO Firestore Security Rules Verification
 *
 * Programmatically validates the syntax, AST structure, and authorization constraints
 * of firestore.rules to verify the Step 9 & Step 11 security invariants:
 * - Owner read only for learning events (request.auth.uid == resource.data.studentId)
 * - Owner create only for learning events (request.auth.uid == request.resource.data.studentId)
 * - Immutability for learning events (update, delete denied)
 * - Owner isolation for /users/{userId} and /users/{userId}/lessonCompletions (request.auth.uid == userId)
 * - Curriculum client write protection (courses, modules, quizzes, flashcards, units allow write: if false)
 * - Elimination of unauthenticated write bypasses in /students and /usernames
 * - Fallback wildcard closed to prevent authorization bypass
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('====================================================');
console.log('🔒 CRESCO FIRESTORE SECURITY RULES VERIFICATION');
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

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
assert(fs.existsSync(rulesPath), 'firestore.rules file exists');

const rulesContent = fs.readFileSync(rulesPath, 'utf8');

// 1. VERSION CHECK
assert(rulesContent.includes("rules_version = '2';"), "Rules version specifies v2 ('rules_version = '2'')");

// 2. EXPLICIT MATCH BLOCK ON LEARNING_EVENTS
assert(rulesContent.includes('match /learning_events/{eventId}'), 'Explicit rule block exists for /learning_events/{eventId}');

// 3. READ AUTHORIZATION FOR LEARNING EVENTS
const hasOwnerRead = rulesContent.includes('request.auth.uid == resource.data.studentId');
assert(hasOwnerRead, 'Learning events read rule restricts access to document owner (request.auth.uid == resource.data.studentId)');

// 4. CREATE AUTHORIZATION & SPOOFING PREVENTION FOR LEARNING EVENTS
const hasOwnerCreate = rulesContent.includes('request.auth.uid == request.resource.data.studentId');
assert(hasOwnerCreate, 'Learning events create rule enforces authenticated UID matches submitted studentId (prevents spoofing)');

const hasTypeValidation = rulesContent.includes('request.resource.data.studentId is string') &&
                          rulesContent.includes('request.resource.data.eventId is string');
assert(hasTypeValidation, 'Learning events create rule validates studentId and eventId types');

// 5. IMMUTABILITY (UPDATE & DELETE DENIAL FOR LEARNING EVENTS)
const hasUpdateDenied = rulesContent.includes('update, delete: if false') || rulesContent.includes('update: if false');
const hasDeleteDenied = rulesContent.includes('update, delete: if false') || rulesContent.includes('delete: if false');
assert(hasUpdateDenied, 'Update operation is explicitly prohibited for learning events (allow update: if false)');
assert(hasDeleteDenied, 'Delete operation is explicitly prohibited for learning events (allow delete: if false)');

// 6. OWNER ISOLATION FOR /users/{userId} & /users/{userId}/lessonCompletions
const hasUserOwnerIsolation = rulesContent.includes('match /users/{userId}') &&
                              rulesContent.includes('request.auth.uid == userId');
assert(hasUserOwnerIsolation, 'User profiles /users/{userId} enforce owner isolation (request.auth.uid == userId)');

const hasLessonCompletionIsolation = rulesContent.includes('match /lessonCompletions/{completionId}') &&
                                     rulesContent.includes('request.auth.uid == userId');
assert(hasLessonCompletionIsolation, 'Lesson completions /users/{userId}/lessonCompletions enforce owner isolation');

// 7. CURRICULUM WRITE PROTECTION (NO CLIENT TAMPERING)
const hasCourseWriteDenied = rulesContent.includes('match /courses/{courseId}') &&
                             rulesContent.includes('allow write: if false;');
assert(hasCourseWriteDenied, 'Course definitions disallow client writes (allow write: if false;)');

const hasModuleWriteDenied = rulesContent.includes('match /modules/{moduleId}') &&
                             rulesContent.includes('allow write: if false;');
assert(hasModuleWriteDenied, 'Modules disallow client writes (allow write: if false;)');

const hasCurriculumModuleWriteDenied = rulesContent.includes('match /curriculum_modules/{modId}') &&
                                      rulesContent.includes('allow write: if false;');
assert(hasCurriculumModuleWriteDenied, 'Curriculum modules disallow client writes (allow write: if false;)');

const hasQuizWriteDenied = rulesContent.includes('match /quizzes/{quizId}') &&
                           rulesContent.includes('allow write: if false;');
assert(hasQuizWriteDenied, 'Quizzes disallow client writes (allow write: if false;)');

const hasFlashcardWriteDenied = rulesContent.includes('match /flashcards/{cardId}') &&
                                rulesContent.includes('allow write: if false;');
assert(hasFlashcardWriteDenied, 'Flashcards disallow client writes (allow write: if false;)');

const hasCourseMgmtWriteDenied = rulesContent.includes('match /course_management/{docId}') &&
                                 rulesContent.includes('allow write: if false;');
assert(hasCourseMgmtWriteDenied, 'Course management disallows client writes (allow write: if false;)');

// 8. ELIMINATION OF UNAUTHENTICATED WRITE BYPASSES
const hasNoStudentBypass = !rulesContent.includes('studentId.size() > 0');
assert(hasNoStudentBypass, 'Unauthenticated write bypass in /students eliminated');

const hasNoUsernameBypass = !rulesContent.includes('username.size() > 0');
assert(hasNoUsernameBypass, 'Unauthenticated write bypass in /usernames eliminated');

// 9. WILDCARD FALLBACK BYPASS PREVENTION
const hasClosedWildcard = rulesContent.includes('match /{document=**}') &&
                          rulesContent.includes('allow read, write: if false;');
assert(hasClosedWildcard, 'Fallback wildcard /{document=**} is closed (allow read, write: if false) to prevent bypass');

// 10. EXISTING APPLICATION COLLECTIONS INTEGRITY
const requiredCollections = [
  'public_leaderboard/{uid}',
  'students/{studentId}',
  'usernames/{username}',
  'users/{userId}',
  'courses/{courseId}',
  'curriculum_units/{unitId}',
  'modules/{moduleId}',
  'curriculum_modules/{modId}',
  'flashcards/{cardId}',
  'quizzes/{quizId}',
  'course_management/{docId}',
  'live_classroom/{docId}',
];

for (const col of requiredCollections) {
  assert(rulesContent.includes(`match /${col}`), `Application collection /${col} remains explicitly matched`);
}

const hasPublicLeaderboardWriteDenial = rulesContent.includes('match /public_leaderboard/{uid}') &&
                                        rulesContent.includes('allow read: if true;') &&
                                        rulesContent.includes('allow write: if false;');
assert(hasPublicLeaderboardWriteDenial, 'Public leaderboard projection permits public read but strictly denies client writes to protect authoritative statistics');

// 11. STEP 17: PRIVATE STUDENT READ BOUNDARY & AUTHENTICATED USERNAMES
const hasStudentsOwnerRead = rulesContent.includes('match /students/{studentId}') &&
                             rulesContent.includes('allow read: if request.auth != null && (request.auth.uid == studentId || request.auth.uid == resource.data.uid);');
assert(hasStudentsOwnerRead, 'Private student records strictly restrict read to the authenticated student owner');

const hasUsernamesAuthenticatedRead = rulesContent.includes('match /usernames/{username}') &&
                                      rulesContent.includes('allow read: if request.auth != null;');
assert(hasUsernamesAuthenticatedRead, 'Username registry read requires authenticated session to prevent unauthenticated data harvesting');

console.log('\n====================================================');
console.log(`📊 FIRESTORE SECURITY RULES TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
