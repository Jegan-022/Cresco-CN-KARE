/**
 * Cresco CN - Student Roster Provisioning Script (Auth REST Edition)
 * 
 * Securely provisions all 68 students from students_credentials.csv into
 * Firebase Authentication using Google Identity Toolkit REST API.
 */

import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };
import { STUDENT_CREDENTIALS, StudentCredential } from '../src/data/studentCredentials.js';

const API_KEY = firebaseConfig.apiKey;
const SIGN_UP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
const SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
const UPDATE_USER_URL = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`;

interface AuthResult {
  uid: string;
  isNew: boolean;
  error?: string;
}

async function ensureFirebaseAuthUser(student: StudentCredential): Promise<AuthResult> {
  const email = student.email.toLowerCase().trim();
  const password = student.password.trim();

  // 1. Attempt signup
  try {
    const res = await fetch(SIGN_UP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await res.json();
    if (res.ok && data.localId) {
      // Set display name in Auth
      try {
        await fetch(UPDATE_USER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: data.idToken,
            displayName: student.name,
            returnSecureToken: false
          })
        });
      } catch (e) {
        // Non-fatal
      }
      return { uid: data.localId, isNew: true };
    }

    // 2. If user already exists, sign in to verify or retrieve UID
    if (data.error && data.error.message === 'EMAIL_EXISTS') {
      const signInRes = await fetch(SIGN_IN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      });

      const signInData = await signInRes.json();
      if (signInRes.ok && signInData.localId) {
        return { uid: signInData.localId, isNew: false };
      }

      return { uid: '', isNew: false, error: signInData.error?.message || 'SIGN_IN_FAILED' };
    }

    return { uid: '', isNew: false, error: data.error?.message || 'UNKNOWN_ERROR' };
  } catch (err: any) {
    return { uid: '', isNew: false, error: err.message };
  }
}

async function runProvisioning() {
  console.log('====================================================');
  console.log('🎓 CRESCO CN: FAST STUDENT ROSTER PROVISIONING');
  console.log('Project:', firebaseConfig.projectId);
  console.log('Total students to provision:', STUDENT_CREDENTIALS.length);
  console.log('====================================================\n');

  let createdCount = 0;
  let existingCount = 0;
  let errorCount = 0;

  for (let i = 0; i < STUDENT_CREDENTIALS.length; i++) {
    const student = STUDENT_CREDENTIALS[i];
    const indexStr = `[${i + 1}/${STUDENT_CREDENTIALS.length}]`;
    process.stdout.write(`${indexStr} Provisioning ${student.studentId} (${student.email})... `);

    const authRes = await ensureFirebaseAuthUser(student);

    if (!authRes.uid) {
      console.log(`❌ Auth error: ${authRes.error}`);
      errorCount++;
      continue;
    }

    if (authRes.isNew) {
      createdCount++;
      console.log(`✅ Auth Created (uid: ${authRes.uid.slice(0, 8)}...)`);
    } else {
      existingCount++;
      console.log(`ℹ️ Auth Exists (uid: ${authRes.uid.slice(0, 8)}...)`);
    }

    // Small delay to be polite to the auth endpoint
    await new Promise((r) => setTimeout(r, 60));
  }

  console.log('\n====================================================');
  console.log('📊 PROVISIONING SUMMARY:');
  console.log(`   - New Auth Accounts Created: ${createdCount}`);
  console.log(`   - Pre-existing Auth Accounts: ${existingCount}`);
  console.log(`   - Errors/Failures: ${errorCount}`);
  console.log(`   - Total Processed: ${STUDENT_CREDENTIALS.length}`);
  console.log('====================================================\n');
}

runProvisioning().catch((err) => {
  console.error('Fatal provisioning error:', err);
  process.exit(1);
});
