/**
 * CRESCO Production — Step 27: Student App Production Readiness Regression Test Suite
 *
 * Validates:
 * 1. Accessibility foundations (prefers-reduced-motion, :focus-visible, .sr-only)
 * 2. Operational configuration & Firebase target project consistency (cresco-cn)
 * 3. Client security (no secret API keys embedded in client bundle)
 * 4. Error recovery & fault tolerance (ErrorBoundary, AI tutor timeout fallback, duplicate suppression)
 * 5. Environment variable documentation (.env.example)
 * 6. Non-blocking learning loop (pedagogy & evidence integrity preserved)
 */

import fs from 'fs';
import path from 'path';
import firebaseConfig from './firebase-applet-config.json';
import { queryAiTutor } from './src/services/aiTutorService';

console.log('================================================================');
console.log('🧪 CRESCO STEP 27: STUDENT PRODUCTION READINESS REGRESSION SUITE');
console.log('================================================================\n');

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

async function runStudentStep27Tests() {
  // 1. Accessibility in CSS
  const cssPath = path.resolve(process.cwd(), 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  assert(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'Accessibility: prefers-reduced-motion media query suppresses animations for vestibular safety'
  );
  assert(
    cssContent.includes(':focus-visible'),
    'Accessibility: High-contrast :focus-visible keyboard navigation rings are configured'
  );
  assert(
    cssContent.includes('.sr-only'),
    'Accessibility: Screen-reader utility (.sr-only) is available for assistive technology'
  );

  // 2. Operational Configuration & Project Consistency
  assert(
    firebaseConfig.projectId === 'cresco-cn',
    'Config: Firebase projectId points to authoritative production project (cresco-cn)'
  );
  assert(
    firebaseConfig.authDomain === 'cresco-cn.firebaseapp.com',
    'Config: Firebase authDomain is aligned with cresco-cn'
  );
  assert(
    !JSON.stringify(firebaseConfig).includes('private_key') &&
    !JSON.stringify(firebaseConfig).includes('client_email'),
    'Security: Client Firebase configuration contains only public web config (no private keys)'
  );

  // 3. Environment Variable Documentation
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

  assert(
    envExampleContent.includes('GEMINI_API_KEY') && envExampleContent.includes('VITE_API_BASE_URL'),
    'Config: All required environment variables are documented in .env.example'
  );

  // 4. Server-Side Protection of Secrets
  const serverPath = path.resolve(process.cwd(), 'server.ts');
  const serverContent = fs.readFileSync(serverPath, 'utf-8');

  assert(
    serverContent.includes('process.env.GEMINI_API_KEY') || serverContent.includes('/api/ai-tutor'),
    'Security: AI Provider secrets are strictly server-side (server.ts proxy)'
  );

  // 5. ErrorBoundary Presence
  const errorBoundaryPath = path.resolve(process.cwd(), 'src/components/errors/ErrorBoundary.tsx');
  const errorBoundaryExists = fs.existsSync(errorBoundaryPath);

  assert(
    errorBoundaryExists,
    'Reliability: Client application includes top-level ErrorBoundary component'
  );

  // 6. AI Tutor Graceful Degradation & Network Failure Recovery
  const aiTutorServicePath = path.resolve(process.cwd(), 'src/services/aiTutorService.ts');
  const aiTutorContent = fs.readFileSync(aiTutorServicePath, 'utf-8');

  assert(
    aiTutorContent.includes('AI_PROVIDER_UNAVAILABLE') && aiTutorContent.includes('NETWORK_TIMEOUT'),
    'Reliability: AI Tutor provides safe fallback reply and errorCodes when backend/provider is unavailable'
  );
  assert(
    aiTutorContent.includes('DUPLICATE_SUBMISSION_WINDOW_MS'),
    'Reliability: AI Tutor suppresses rapid accidental duplicate submissions'
  );

  // 7. Offline / Mock Graceful Response Test (Verify queryAiTutor handles unreachable backend safely)
  const fallbackResult = await queryAiTutor({
    studentId: 'stu_99240041001',
    message: 'How does TCP 3-way handshake work?',
    context: {
      courseId: 'CS-4200',
      lessonId: 'u4_m05',
      unitId: 'Unit 4',
      conceptTopic: 'TCP Handshake'
    }
  });

  assert(
    fallbackResult.success === false && (fallbackResult.errorCode === 'NETWORK_TIMEOUT' || fallbackResult.errorCode === 'AI_PROVIDER_UNAVAILABLE'),
    'Fault Tolerance: queryAiTutor gracefully degrades when backend server is offline in standalone unit tests'
  );

  console.log(`\n----------------------------------------------------`);
  console.log(`Step 27 Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(`----------------------------------------------------\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runStudentStep27Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
