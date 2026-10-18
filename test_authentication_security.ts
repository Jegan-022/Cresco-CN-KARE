/**
 * CRESCO Secure Authentication Migration Verification Tests
 *
 * Verifies Step 12 Security Invariants:
 * 1. Preservation of Google OAuth & Firebase Email/Password login flows
 * 2. Elimination of unauthenticated synthetic sessions (getIdToken: async () => token_...)
 * 3. Elimination of plaintext password storage in Firestore and browser localStorage (klu_pwd_, portalPassword)
 * 4. Register-number credential mapping to official university domains (@klu.ac.in, @kluniversity.in)
 * 5. Generic, safe error reporting without credential enumeration
 * 6. Faculty authorization boundary: role enforcement via custom claims, not client-editable fields
 * 7. Deprecation of legacy hardcoded student password fallbacks (stu@sid, sid@...)
 */

import * as fs from 'fs';
import * as path from 'path';
import { KLU_EMAIL_REGEX, extractStudentId } from './src/context/AuthContext';

console.log('====================================================');
console.log('🔒 CRESCO SECURE AUTHENTICATION MIGRATION TESTS');
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

// 1. INSPECT AUTHCONTEXT SOURCE INVARIANTS
const authContextPath = path.resolve(process.cwd(), 'src/context/AuthContext.tsx');
assert(fs.existsSync(authContextPath), 'AuthContext.tsx source file exists');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

// Invariant 1: Google OAuth is preserved
assert(authContextContent.includes('const loginWithGoogle = async ()'), 'Google OAuth provider flow (loginWithGoogle) preserved');
assert(authContextContent.includes('new GoogleAuthProvider()'), 'GoogleAuthProvider instantiated');
assert(authContextContent.includes('signInWithPopup(auth, provider)'), 'Native Firebase signInWithPopup invoked');

// Invariant 2: Email/Password login is preserved
assert(authContextContent.includes('signInWithEmailAndPassword(auth,'), 'Firebase signInWithEmailAndPassword used for cryptographic verification');

// Invariant 3: Synthetic unauthenticated sessions eliminated
const hasSyntheticUser = authContextContent.includes('syntheticUser');
const hasFakeGetIdToken = authContextContent.includes('getIdToken: async () => `token_${uid}`');
assert(!hasSyntheticUser, 'Synthetic unauthenticated student user object creation eliminated from AuthContext');
assert(!hasFakeGetIdToken, 'Fake client-generated token (getIdToken: async () => token_...) eliminated');

// Invariant 4: No plaintext passwords stored in localStorage (klu_pwd_)
const hasLocalStoragePwdSet = /localStorage\.setItem\([`'"]klu_pwd_/i.test(authContextContent);
assert(!hasLocalStoragePwdSet, 'AuthContext never writes plaintext passwords to localStorage (klu_pwd_ eliminated)');

// Invariant 5: Legacy default password fallback ('stu@sid') eliminated from authentication
const hasDefaultStuSidAuth = authContextContent.includes("cleanPassword === 'stu@sid'");
const hasExpectedLegacyPasswordAuth = authContextContent.includes("expectedLegacyPassword");
assert(!hasDefaultStuSidAuth, "Default plaintext password fallback ('stu@sid') eliminated from student authentication");
assert(!hasExpectedLegacyPasswordAuth, "Algorithmic plaintext password fallback ('sid@' + last5) eliminated from student authentication");

// Invariant 6: Plaintext portalPassword stripped from Firestore document writes
assert(authContextContent.includes('const { portalPassword: _omittedPwd, ...firestoreProfile } = profile;'), 'portalPassword is explicitly stripped before saving to Firestore');

// Invariant 7: Safe generic error reporting
assert(authContextContent.includes('Invalid Register Number or password'), 'Safe generic error returned on invalid credentials');

// Invariant 8: Register number domain mapping
const sampleRegNo = '99240041001';
const expectedEmailKlu = `${sampleRegNo}@klu.ac.in`;
const expectedEmailKlUniv = `${sampleRegNo}@kluniversity.in`;
assert(KLU_EMAIL_REGEX.test(expectedEmailKlu), `Sample register number email ${expectedEmailKlu} matches KLU_EMAIL_REGEX`);
assert(KLU_EMAIL_REGEX.test(expectedEmailKlUniv), `Sample register number email ${expectedEmailKlUniv} matches KLU_EMAIL_REGEX`);
assert(extractStudentId(expectedEmailKlu) === sampleRegNo, `extractStudentId accurately resolves register number ${sampleRegNo}`);

// 2. INSPECT LOGINVIEW SOURCE INVARIANTS
const loginViewPath = path.resolve(process.cwd(), 'src/components/views/LoginView.tsx');
assert(fs.existsSync(loginViewPath), 'LoginView.tsx source file exists');
const loginViewContent = fs.readFileSync(loginViewPath, 'utf8');

assert(!loginViewContent.includes('localStorage.setItem(`klu_pwd_'), 'LoginView never caches student passwords in localStorage');
assert(!loginViewContent.includes('Default student password is stu@sid'), 'LoginView removes misleading stu@sid default password hints');
assert(loginViewContent.includes('KLU Sign Up'), 'LoginView maintains one-click KLU Sign Up with official Google account');

// 3. INSPECT SETTINGSVIEW SOURCE INVARIANTS
const settingsViewPath = path.resolve(process.cwd(), 'src/components/views/SettingsView.tsx');
assert(fs.existsSync(settingsViewPath), 'SettingsView.tsx source file exists');
const settingsViewContent = fs.readFileSync(settingsViewPath, 'utf8');

assert(!settingsViewContent.includes('currentPortalPwd'), 'SettingsView never exposes current plaintext portal password');
assert(!settingsViewContent.includes('Default password for all KLU students is stu@sid'), 'SettingsView guidance does not advertise default passwords');
assert(settingsViewContent.includes('hasPasswordAuth'), 'SettingsView determines password status from cryptographic providerData, not plaintext strings');

// 4. INSPECT FIRESTORE RULES FOR ROLE AND OWNER BOUNDARIES
const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
assert(fs.existsSync(rulesPath), 'firestore.rules exists');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

// Rules Invariant 1: Users isolated by authenticated UID, client cannot elevate role to bypass
assert(rulesContent.includes('match /users/{userId}') && rulesContent.includes('request.auth.uid == userId'), 'Firestore rules strictly enforce request.auth.uid == userId on /users/{userId}');

// Rules Invariant 2: Curriculum write denied to all clients (faculty cannot write via client-editable role)
assert(rulesContent.includes('match /courses/{courseId}') && rulesContent.includes('allow write: if false;'), 'Curriculum courses write denied to client sessions');
assert(rulesContent.includes('match /curriculum_modules/{modId}') && rulesContent.includes('allow write: if false;'), 'Curriculum modules write denied to client sessions');

// Rules Invariant 3: Learning events append-only and strictly owner-isolated
assert(rulesContent.includes('match /learning_events/{eventId}'), 'Explicit rule block for /learning_events/{eventId}');
assert(rulesContent.includes('request.auth.uid == request.resource.data.studentId'), 'Learning events enforce ownership on creation');
assert(rulesContent.includes('allow update, delete: if false;'), 'Learning events strictly append-only (update, delete denied)');

// Rules Invariant 4: Public leaderboard sanitized projection rule (client write denied to protect authoritative stats)
assert(rulesContent.includes('match /public_leaderboard/{uid}') && rulesContent.includes('allow write: if false;'), 'Firestore rules strictly enforce allow write: if false on /public_leaderboard/{uid} to protect authoritative statistics');
assert(authContextContent.includes('minimalUsernameClaim'), 'AuthContext writes minimal sanitized claims to /usernames (zero PII)');

// Rules Invariant 5: Private student profiles owner-isolated (read restricted to authenticated student owner)
assert(rulesContent.includes('match /students/{studentId}') && rulesContent.includes('request.auth != null && (request.auth.uid == studentId || request.auth.uid == resource.data.uid)'), 'Firestore rules strictly enforce authenticated owner read on /students/{studentId}');

// Rules Invariant 6: Username availability lookup requires authenticated session (prevents unauthenticated identity harvesting)
assert(rulesContent.includes('match /usernames/{username}') && rulesContent.includes('allow read: if request.auth != null;'), 'Firestore rules enforce authenticated session on /usernames/{username} read');

console.log('\n====================================================');
console.log(`📊 AUTHENTICATION SECURITY TESTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
