const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

if (!content.includes('deleteUser')) {
  content = content.replace(
    /} from 'firebase\/auth';/,
    '  deleteUser\n} from \'firebase/auth\';'
  );
}

content = content.replace(
  /if \(!cred\.user\.email \|\| !KLU_EMAIL_REGEX\.test\(cred\.user\.email\.trim\(\)\)\) \{\s*await signOut\(auth\);\s*setShowDomainError\(true\);\s*throw new Error\('DOMAIN_ERROR'\);\s*\}/,
  'if (!cred.user.email || !KLU_EMAIL_REGEX.test(cred.user.email.trim())) {\n        try { await deleteUser(cred.user); } catch (e) { await signOut(auth); }\n        setShowDomainError(true);\n        throw new Error(\'DOMAIN_ERROR\');\n      }'
);

content = content.replace(
  /if \(!user\.email \|\| !KLU_EMAIL_REGEX\.test\(user\.email\.trim\(\)\)\) \{\s*await signOut\(auth\);\s*setCurrentUser\(null\);\s*setUserProfile\(null\);\s*setLoading\(false\);\s*setShowDomainError\(true\);\s*return;\s*\}/,
  'if (!user.email || !KLU_EMAIL_REGEX.test(user.email.trim())) {\n          try { await deleteUser(user); } catch (e) { await signOut(auth); }\n          setCurrentUser(null);\n          setUserProfile(null);\n          setLoading(false);\n          setShowDomainError(true);\n          return;\n        }'
);

fs.writeFileSync('src/context/AuthContext.tsx', content);
console.log("Patched AuthContext.tsx with deleteUser");
