import fs from 'node:fs';
import path from 'node:path';
import { STUDENT_CREDENTIALS, verifyStudentCredential } from './src/data/studentCredentials.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function testAuthAndIntros() {
  console.log('====================================================');
  console.log('🧪 VERIFYING AUTHENTICATION & INTRO SCREENS INTEGRATION');
  console.log('====================================================\n');

  // 1. Verify all 68 student credentials
  console.log('--- 1. Student Credentials Verification ---');
  assert(STUDENT_CREDENTIALS.length === 68, `Roster has exactly 68 students (found ${STUDENT_CREDENTIALS.length})`);

  let validCount = 0;
  for (const s of STUDENT_CREDENTIALS) {
    const resId = verifyStudentCredential(s.studentId, s.password);
    const resEmail = verifyStudentCredential(s.email, s.password);
    if (resId.valid && resId.matchedPassword && resEmail.valid && resEmail.matchedPassword) {
      validCount++;
    }
  }
  assert(validCount === 68, `All 68 students match credential validation (verified: ${validCount}/68)`);

  // Verify sample students with Klu@ password format
  const sample1 = verifyStudentCredential('99240040116', 'Klu@40116');
  assert(sample1.valid && sample1.matchedPassword === true, 'Student 99240040116 authenticates with Klu@40116');

  const sample2 = verifyStudentCredential('99240040356', 'Klu@40356');
  assert(sample2.valid && sample2.matchedPassword === true, 'Student 99240040356 authenticates with Klu@40356');

  // Verify wrong password fails
  const wrongPwd = verifyStudentCredential('99240040116', 'wrongpass123');
  assert(wrongPwd.matchedPassword === false, 'Wrong password is unambiguously rejected');

  // 2. Verify Intro HTML Screens have NO timestamps, NO beats list, NO replay bar
  console.log('\n--- 2. Intro Screens Cleanliness Verification ---');
  const rootFiles = [
    { path: path.resolve(process.cwd(), '../Cresco CN Admin Portal Intro.html'), name: 'Admin Root Intro' },
    { path: path.resolve(process.cwd(), '../Cresco CN Faculty Login Intro.html'), name: 'Faculty Root Intro' },
    { path: path.resolve(process.cwd(), '../Cresco CN Widescreen Intro.html'), name: 'Student Root Intro' },
    { path: path.resolve(process.cwd(), '../admin/public/admin-intro.html'), name: 'Admin Public Intro' },
    { path: path.resolve(process.cwd(), '../faculty/public/faculty-intro.html'), name: 'Faculty Public Intro' },
    { path: path.resolve(process.cwd(), 'public/student-intro.html'), name: 'Student Public Intro' },
  ];

  for (const f of rootFiles) {
    assert(fs.existsSync(f.path), `File exists: ${f.name}`);
    const content = fs.readFileSync(f.path, 'utf-8');
    
    // Check that timeline / beats are removed
    assert(!content.includes('<ol class="beats">'), `${f.name}: No timeline <ol class="beats"> present`);
    assert(!content.includes('<time>0.'), `${f.name}: No <time> tags present`);
    assert(!content.includes('class="beats"'), `${f.name}: No beats class present`);
    
    // Check that button/replay bar is removed
    assert(!content.includes('Replay intro</button>'), `${f.name}: No "Replay intro" button present`);
    assert(!content.includes('<div class="bar">'), `${f.name}: No control <div class="bar"> present`);

    // Check that animation canvas/mascot is present
    assert(content.includes('class="stage"'), `${f.name}: Stage container is present`);
    assert(content.includes('class="mascot"'), `${f.name}: Mascot element is present`);
    assert(content.includes('play()'), `${f.name}: Animation play script is present`);
  }

  // 3. Verify Overlay Components Exist and are Integrated
  console.log('\n--- 3. Overlay Components Architecture Verification ---');
  const overlays = [
    { path: path.resolve(process.cwd(), '../admin/src/components/AdminIntroOverlay.tsx'), name: 'AdminIntroOverlay' },
    { path: path.resolve(process.cwd(), '../faculty/src/components/FacultyIntroOverlay.tsx'), name: 'FacultyIntroOverlay' },
    { path: path.resolve(process.cwd(), 'src/components/StudentIntroOverlay.tsx'), name: 'StudentIntroOverlay' },
  ];

  for (const o of overlays) {
    assert(fs.existsSync(o.path), `Overlay component exists: ${o.name}`);
    const src = fs.readFileSync(o.path, 'utf-8');
    assert(src.includes('iframe'), `${o.name} renders iframe overlay`);
    assert(src.includes('handleSkip'), `${o.name} provides click-to-skip`);
    assert(src.includes('minDurationMs'), `${o.name} includes duration timer`);
  }

  // 4. Verify App.tsx integrations
  console.log('\n--- 4. App.tsx Integration Verification ---');
  const adminApp = fs.readFileSync(path.resolve(process.cwd(), '../admin/src/App.tsx'), 'utf-8');
  assert(adminApp.includes('AdminIntroOverlay'), 'Admin App.tsx mounts AdminIntroOverlay');
  assert(adminApp.includes('cresco_admin_intro_seen'), 'Admin App.tsx checks session storage for intro');

  const facultyApp = fs.readFileSync(path.resolve(process.cwd(), '../faculty/src/App.tsx'), 'utf-8');
  assert(facultyApp.includes('FacultyIntroOverlay'), 'Faculty App.tsx mounts FacultyIntroOverlay');
  assert(facultyApp.includes('cresco_faculty_intro_seen'), 'Faculty App.tsx checks session storage for intro');

  const studentApp = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
  assert(studentApp.includes('StudentIntroOverlay'), 'Student App.tsx mounts StudentIntroOverlay');
  assert(studentApp.includes('cresco_student_intro_seen'), 'Student App.tsx checks session storage for intro');

  console.log('\n====================================================');
  console.log('🎉 ALL AUTHENTICATION & INTRO VERIFICATION TESTS PASSED!');
  console.log('====================================================\n');
}

testAuthAndIntros().catch((err) => {
  console.error(err);
  process.exit(1);
});
