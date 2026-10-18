/**
 * CRESCO Production — Firebase Emulator Runtime Security Rules Test Suite
 *
 * Runs genuine runtime authorization tests against the Google Cloud Firestore Emulator Suite
 * using @firebase/rules-unit-testing.
 *
 * Covers:
 * 1. Unauthenticated reads and writes to protected collections
 * 2. Student reading their own profile (/users/{userId})
 * 3. Student reading or modifying another student's profile (/users/{userId})
 * 4. Learning-event creation with authenticated student's own UID
 * 5. Spoofed learning-event ownership on creation
 * 6. Cross-student learning-event reads
 * 7. Learning-event updates and deletes (denied under append-only policy)
 * 8. Unauthorized curriculum writes (courses, modules, quizzes, flashcards, units)
 * 9. Intended public curriculum reads
 * 10. Lesson-completion ownership and cross-student isolation
 * 11. Username and student-registration access controls
 * 12. Fallback wildcard protection on unlisted collections
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds, 
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ID = 'cresco-cn-security-test';
const RULES_PATH = path.resolve(__dirname, 'firestore.rules');

let testEnv: RulesTestEnvironment;
let passed = 0;
let failed = 0;
let total = 0;

async function runScenario(scenarioName: string, testFn: () => Promise<void>) {
  total++;
  try {
    await testFn();
    console.log(`  ✅ [PASS] ${scenarioName}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${scenarioName}`);
    console.error(`     Error: ${err?.message || err}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🔥 CRESCO FIRESTORE EMULATOR RUNTIME SECURITY SUITE');
  console.log('====================================================\n');
  console.log(`Connecting to Firestore Emulator on host 127.0.0.1:8088...`);
  console.log(`Loading rules file: ${RULES_PATH}\n`);

  if (!fs.existsSync(RULES_PATH)) {
    throw new Error(`Rules file not found at: ${RULES_PATH}`);
  }

  const rulesContent = fs.readFileSync(RULES_PATH, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8088,
    },
  });

  const studentAliceId = 'student_alice_001';
  const studentBobId = 'student_bob_002';

  // Helper context providers
  const getUnauthedDb = () => testEnv.unauthenticatedContext().firestore();
  const getAliceDb = () => testEnv.authenticatedContext(studentAliceId).firestore();
  const getBobDb = () => testEnv.authenticatedContext(studentBobId).firestore();

  console.log('--- Suite 1: Unauthenticated Access to Protected Collections ---');
  await runScenario('Unauthenticated read of private user profile (/users/{userId}) is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(getDoc(doc(db, 'users', studentAliceId)));
  });

  await runScenario('Unauthenticated write to private user profile (/users/{userId}) is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'users', studentAliceId), { name: 'Intruder' }));
  });

  await runScenario('Unauthenticated write to student progress (/students/{studentId}) is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'students', studentAliceId), { xp: 9999 }));
  });

  await runScenario('Unauthenticated write to usernames collection (/usernames/{username}) is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'usernames', 'claimed_user'), { uid: 'anon' }));
  });

  await runScenario('Unauthenticated read of learning events (/learning_events/{eventId}) is denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'learning_events', 'ev_seed_1'), {
        eventId: 'ev_seed_1',
        studentId: studentAliceId,
        eventType: 'LESSON_COMPLETED',
      });
    });
    const db = getUnauthedDb();
    await assertFails(getDoc(doc(db, 'learning_events', 'ev_seed_1')));
  });

  await runScenario('Unauthenticated creation of learning event is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'learning_events', 'ev_anon_1'), {
      eventId: 'ev_anon_1',
      studentId: studentAliceId,
      eventType: 'LESSON_COMPLETED',
    }));
  });

  console.log('\n--- Suite 2: User Profiles & Cross-Student Isolation (/users/{userId}) ---');
  await runScenario('Authenticated student can read their own profile (/users/{userId})', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', studentAliceId), {
        uid: studentAliceId,
        name: 'Alice',
        email: 'alice@klu.ac.in',
      });
    });
    const db = getAliceDb();
    await assertSucceeds(getDoc(doc(db, 'users', studentAliceId)));
  });

  await runScenario('Authenticated student can write and update their own profile (/users/{userId})', async () => {
    const db = getAliceDb();
    await assertSucceeds(setDoc(doc(db, 'users', studentAliceId), {
      uid: studentAliceId,
      name: 'Alice Updated',
      email: 'alice@klu.ac.in',
    }, { merge: true }));
  });

  await runScenario('Authenticated student cannot read another student profile (/users/{userId})', async () => {
    const db = getBobDb();
    await assertFails(getDoc(doc(db, 'users', studentAliceId)));
  });

  await runScenario('Authenticated student cannot write or overwrite another student profile (/users/{userId})', async () => {
    const db = getBobDb();
    await assertFails(setDoc(doc(db, 'users', studentAliceId), {
      uid: studentAliceId,
      name: 'Bob Malicious Edit',
    }, { merge: true }));
  });

  console.log('\n--- Suite 3: Lesson Completions Isolation (/users/{userId}/lessonCompletions/{id}) ---');
  await runScenario('Student can read and record their own lesson completion', async () => {
    const db = getAliceDb();
    const compRef = doc(db, 'users', studentAliceId, 'lessonCompletions', 'comp_mod_3_1');
    await assertSucceeds(setDoc(compRef, {
      lessonId: 'mod_3_1',
      completedAt: new Date().toISOString(),
      score: 100,
    }));
    await assertSucceeds(getDoc(compRef));
  });

  await runScenario('Student cannot read another student lesson completion', async () => {
    const db = getBobDb();
    const compRef = doc(db, 'users', studentAliceId, 'lessonCompletions', 'comp_mod_3_1');
    await assertFails(getDoc(compRef));
  });

  await runScenario('Student cannot tamper with another student lesson completion', async () => {
    const db = getBobDb();
    const compRef = doc(db, 'users', studentAliceId, 'lessonCompletions', 'comp_mod_3_1');
    await assertFails(setDoc(compRef, {
      lessonId: 'mod_3_1',
      score: 0,
    }));
  });

  console.log('\n--- Suite 4: Learning Event Telemetry & Immutability (/learning_events/{id}) ---');
  await runScenario('Authenticated student can create a learning event tied to their own identity', async () => {
    const db = getAliceDb();
    const eventRef = doc(db, 'learning_events', 'ev_alice_success_1');
    await assertSucceeds(setDoc(eventRef, {
      eventId: 'ev_alice_success_1',
      studentId: studentAliceId,
      eventType: 'LESSON_COMPLETED',
      timestamp: new Date().toISOString(),
      payload: { lessonId: 'u3_m1' },
    }));
  });

  await runScenario('Student cannot create a learning event with spoofed studentId', async () => {
    const db = getBobDb();
    const spoofedRef = doc(db, 'learning_events', 'ev_spoofed_bob_as_alice');
    await assertFails(setDoc(spoofedRef, {
      eventId: 'ev_spoofed_bob_as_alice',
      studentId: studentAliceId, // Bob attempting to spoof Alice
      eventType: 'LESSON_COMPLETED',
      timestamp: new Date().toISOString(),
    }));
  });

  await runScenario('Student cannot create a learning event missing required eventId or studentId strings', async () => {
    const db = getAliceDb();
    const invalidRef = doc(db, 'learning_events', 'ev_invalid_missing_fields');
    await assertFails(setDoc(invalidRef, {
      studentId: studentAliceId,
      // missing eventId
      eventType: 'LESSON_COMPLETED',
    }));
  });

  await runScenario('Student can read their own historical learning events', async () => {
    const db = getAliceDb();
    await assertSucceeds(getDoc(doc(db, 'learning_events', 'ev_alice_success_1')));
  });

  await runScenario('Student cannot read another student historical learning events', async () => {
    const db = getBobDb();
    await assertFails(getDoc(doc(db, 'learning_events', 'ev_alice_success_1')));
  });

  await runScenario('Learning events cannot be modified (allow update: if false enforced)', async () => {
    const db = getAliceDb();
    const eventRef = doc(db, 'learning_events', 'ev_alice_success_1');
    await assertFails(updateDoc(eventRef, {
      'payload.tampered': true,
    }));
  });

  await runScenario('Learning events cannot be deleted (allow delete: if false enforced)', async () => {
    const db = getAliceDb();
    const eventRef = doc(db, 'learning_events', 'ev_alice_success_1');
    await assertFails(deleteDoc(eventRef));
  });

  console.log('\n--- Suite 5: Curriculum Protection (Read-Only to Clients) ---');
  const curriculumCollections = [
    { name: 'courses', id: 'cn-course-101' },
    { name: 'curriculum_units', id: 'unit_3' },
    { name: 'modules', id: 'u3_m1' },
    { name: 'curriculum_modules', id: 'mod_c1' },
    { name: 'flashcards', id: 'fc_1' },
    { name: 'quizzes', id: 'quiz_u3_m1' },
    { name: 'course_management', id: 'mgmt_config' },
  ];

  for (const col of curriculumCollections) {
    await runScenario(`Public read permitted for curriculum collection /${col.name}`, async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), col.name, col.id), { title: `Sample ${col.name}` });
      });
      const db = getUnauthedDb();
      await assertSucceeds(getDoc(doc(db, col.name, col.id)));
    });

    await runScenario(`Client write strictly denied for curriculum collection /${col.name}`, async () => {
      const db = getAliceDb();
      await assertFails(setDoc(doc(db, col.name, col.id), { title: 'Tampered Title' }));
    });
  }

  console.log('\n--- Suite 6: Student Progress & Username Registry ---');
  await runScenario('Unauthenticated read of /students/{id} is strictly denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'students', studentAliceId), {
        uid: studentAliceId,
        studentId: studentAliceId,
        email: 'alice@klu.ac.in',
        name: 'Alice Student',
        department: 'CSE',
        xp: 500,
      });
    });
    const db = getUnauthedDb();
    await assertFails(getDoc(doc(db, 'students', studentAliceId)));
  });

  await runScenario('Authenticated student can read their own private profile in /students/{id}', async () => {
    const db = getAliceDb();
    await assertSucceeds(getDoc(doc(db, 'students', studentAliceId)));
  });

  await runScenario('Cross-student read of /students/{id} is strictly denied', async () => {
    const db = getBobDb();
    await assertFails(getDoc(doc(db, 'students', studentAliceId)));
  });

  await runScenario('Authenticated student can update their own progress in /students/{id}', async () => {
    const db = getAliceDb();
    await assertSucceeds(setDoc(doc(db, 'students', studentAliceId), {
      uid: studentAliceId,
      studentId: studentAliceId,
      xp: 600,
    }, { merge: true }));
  });

  await runScenario('Authenticated student cannot modify another student doc in /students/{id}', async () => {
    const db = getBobDb();
    await assertFails(setDoc(doc(db, 'students', studentAliceId), {
      uid: studentAliceId,
      xp: 0,
    }, { merge: true }));
  });

  await runScenario('Unauthenticated client cannot write or delete in /students', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'students', 'new_student'), { xp: 100 }));
    await assertFails(deleteDoc(doc(db, 'students', studentAliceId)));
  });

  await runScenario('Unauthenticated read on /usernames is denied to protect historical claims', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'usernames', 'alice99'), {
        uid: studentAliceId,
        studentId: studentAliceId,
        email: 'alice@klu.ac.in',
        name: 'Alice Student',
      });
    });
    const db = getUnauthedDb();
    await assertFails(getDoc(doc(db, 'usernames', 'alice99')));
  });

  await runScenario('Authenticated user can read /usernames to check handle availability', async () => {
    const db = getAliceDb();
    await assertSucceeds(getDoc(doc(db, 'usernames', 'alice99')));
  });

  await runScenario('Unauthenticated client cannot delete or claim /usernames', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'usernames', 'unauthed_claim'), { uid: 'guest' }));
    await assertFails(deleteDoc(doc(db, 'usernames', 'alice99')));
  });

  await runScenario('Student can claim a username for their own UID', async () => {
    const db = getAliceDb();
    await assertSucceeds(setDoc(doc(db, 'usernames', 'alice_unique_handle'), {
      uid: studentAliceId,
    }));
  });

  await runScenario('Student cannot claim a username for a different UID', async () => {
    const db = getBobDb();
    await assertFails(setDoc(doc(db, 'usernames', 'stolen_handle'), {
      uid: studentAliceId, // Bob attempting to register Alice's UID
    }));
  });

  console.log('\n--- Suite 6B: Sanitized Public Leaderboard Projection (/public_leaderboard/{uid}) ---');
  await runScenario('Public read permitted for /public_leaderboard projection', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'public_leaderboard', studentAliceId), {
        uid: studentAliceId,
        displayName: 'Alice Cadet',
        avatar: 'bot',
        totalXP: 500,
        level: 3,
        modulesCompleted: 5,
        overallProgress: 17,
        streak: 2,
      });
    });
    const db = getUnauthedDb();
    await assertSucceeds(getDoc(doc(db, 'public_leaderboard', studentAliceId)));
  });

  await runScenario('Student client write to their own /public_leaderboard/{uid} is denied (authoritative boundary)', async () => {
    const db = getAliceDb();
    await assertFails(setDoc(doc(db, 'public_leaderboard', studentAliceId), {
      uid: studentAliceId,
      displayName: 'Alice Updated',
      totalXP: 550,
      level: 3,
      modulesCompleted: 6,
    }, { merge: true }));
  });

  await runScenario('Student cannot manipulate their XP, level, badges, or progress in /public_leaderboard', async () => {
    const db = getAliceDb();
    await assertFails(setDoc(doc(db, 'public_leaderboard', studentAliceId), {
      uid: studentAliceId,
      displayName: 'Alice Hacker',
      totalXP: 999999,
      level: 100,
      badges: ['SUPER_ELITE'],
      overallProgress: 100,
    }, { merge: true }));
  });

  await runScenario('Unauthenticated client write to /public_leaderboard is denied', async () => {
    const db = getUnauthedDb();
    await assertFails(setDoc(doc(db, 'public_leaderboard', 'guest123'), {
      uid: 'guest123',
      displayName: 'Anonymous',
      totalXP: 9999,
    }));
  });

  await runScenario('Authenticated student cannot overwrite another student /public_leaderboard doc', async () => {
    const db = getBobDb();
    await assertFails(setDoc(doc(db, 'public_leaderboard', studentAliceId), {
      uid: studentAliceId,
      displayName: 'Bob Tampering Alice Score',
      totalXP: 0,
    }, { merge: true }));
  });

  await runScenario('Audit: /public_leaderboard entry contains zero PII fields', async () => {
    const db = getUnauthedDb();
    const snap = await getDoc(doc(db, 'public_leaderboard', studentAliceId));
    if (!snap.exists()) {
      throw new Error('Expected public_leaderboard document to exist');
    }
    const data = snap.data();
    if (data?.email !== undefined || data?.studentId !== undefined || data?.portalPassword !== undefined || data?.department !== undefined) {
      throw new Error('public_leaderboard document leaked private profile fields!');
    }
  });

  await runScenario('Audit: All student application views do not query /students collection', async () => {
    const checkedViews = [
      'src/components/views/LeaderboardView.tsx',
      'src/components/views/AnalyticsView.tsx',
      'src/components/views/HomeView.tsx',
      'src/components/views/LiveClassroomView.tsx',
      'src/components/views/TeacherDashboardView.tsx',
      'src/components/views/DeveloperDashboardView.tsx',
    ];

    for (const v of checkedViews) {
      const content = fs.readFileSync(path.resolve(__dirname, v), 'utf-8');
      if (content.includes("collection(db, 'students')") || content.includes('collection(db, "students")')) {
        throw new Error(`${v} still queries collection(db, 'students')!`);
      }
    }
  });

  console.log('\n--- Suite 7: Overlapping Rules and Fallback Wildcard Denials ---');
  const unlistedCollections = ['admin_secrets', 'faculty_records', 'audit_vault', 'unknown_col'];
  for (const unlisted of unlistedCollections) {
    await runScenario(`Unlisted collection /${unlisted} read is denied by closed wildcard`, async () => {
      const db = getAliceDb();
      await assertFails(getDoc(doc(db, unlisted, 'doc1')));
    });

    await runScenario(`Unlisted collection /${unlisted} write is denied by closed wildcard`, async () => {
      const db = getAliceDb();
      await assertFails(setDoc(doc(db, unlisted, 'doc1'), { secret: 'data' }));
    });
  }

  // Cleanup
  await testEnv.clearFirestore();
  await testEnv.cleanup();

  console.log('\n====================================================');
  console.log(`📊 RUNTIME EMULATOR TESTS SUMMARY: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`   Failed: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal Emulator Test Runner Error:', err);
  process.exit(1);
});
