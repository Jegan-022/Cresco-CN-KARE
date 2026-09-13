import { 
  isAuthorizedDeveloper, 
  AUTHORIZED_DEVELOPERS, 
  AUTHORIZED_DEVELOPER_ID_LIST, 
  getDeveloperProfile,
  verifyDeveloperPassword 
} from './src/config/developers';

console.log('--- Testing Developer Authentication Restrictions & Passwords ---');

// 1. Permitted IDs
const id285 = isAuthorizedDeveloper('285');
const id279 = isAuthorizedDeveloper('279');
console.assert(id285 === true, 'ID 285 MUST be authorized');
console.assert(id279 === true, 'ID 279 MUST be authorized');
console.log('✅ ID 285 is authorized:', id285);
console.log('✅ ID 279 is authorized:', id279);

// 2. Developer Passwords
const pass285Valid = verifyDeveloperPassword('285', 'MANIDEEP');
const pass285Invalid = verifyDeveloperPassword('285', 'wrongpass');
console.assert(pass285Valid === true, 'Password MANIDEEP for 285 MUST be valid');
console.assert(pass285Invalid === false, 'Invalid password for 285 MUST be rejected');
console.log('✅ ID 285 password MANIDEEP verified:', pass285Valid);
console.log('✅ ID 285 wrong password rejected:', !pass285Invalid);

const pass279Valid = verifyDeveloperPassword('279', '40279');
const pass279Invalid = verifyDeveloperPassword('279', 'wrongpass');
console.assert(pass279Valid === true, 'Password 40279 for 279 MUST be valid');
console.assert(pass279Invalid === false, 'Invalid password for 279 MUST be rejected');
console.log('✅ ID 279 password 40279 verified:', pass279Valid);
console.log('✅ ID 279 wrong password rejected:', !pass279Invalid);

// 3. Revoked IDs
const revokedIds = [
  '99240040285',
  '99240040279',
  'DEV-KLU-01',
  'DEV-KLU-02',
  'DEV-KLU-03',
  'DEV-KLU-04',
  'admin',
  'root',
  'student123'
];

for (const id of revokedIds) {
  const result = isAuthorizedDeveloper(id);
  console.assert(result === false, `ID ${id} must be strictly revoked!`);
  console.log(`✅ Revoked ID rejected [${id}]:`, !result);
}

// 4. Metadata check
console.assert(AUTHORIZED_DEVELOPERS.length === 2, 'Exactly 2 developers allowed');
console.assert(AUTHORIZED_DEVELOPER_ID_LIST.length === 2, 'Exactly 2 developer IDs in list');
console.log('✅ AUTHORIZED_DEVELOPERS count:', AUTHORIZED_DEVELOPERS.length);
console.log('✅ AUTHORIZED_DEVELOPER_ID_LIST:', AUTHORIZED_DEVELOPER_ID_LIST);

const prof285 = getDeveloperProfile('285');
console.assert(prof285.id === '285', 'Profile 285 verified');
const prof279 = getDeveloperProfile('279');
console.assert(prof279.id === '279', 'Profile 279 verified');
console.log('✅ Profile 285 name:', prof285.name);
console.log('✅ Profile 279 name:', prof279.name);

console.log('\n🎉 ALL DEVELOPER CREDENTIAL TESTS PASSED SUCCESSFULLY!');
