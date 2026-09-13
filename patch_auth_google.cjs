const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

content = content.replace(
  /\/\/ provider\.setCustomParameters\(\{ hd: 'klu\.ac\.in' \}\);/g,
  'provider.setCustomParameters({ hd: \'klu.ac.in\' });'
);

content = content.replace(
  /if \(!user\.email \|\| !KLU_EMAIL_REGEX\.test\(user\.email\.trim\(\)\)\) \{\s*await signOut\(auth\);\s*setCurrentUser\(null\);\s*setUserProfile\(null\);\s*setLoading\(false\);\s*return;\s*\}/,
  'if (!user.email || !KLU_EMAIL_REGEX.test(user.email.trim())) {\n          await signOut(auth);\n          setCurrentUser(null);\n          setUserProfile(null);\n          setLoading(false);\n          setShowDomainError(true);\n          return;\n        }'
);

fs.writeFileSync('src/context/AuthContext.tsx', content);
console.log("Patched AuthContext.tsx");
