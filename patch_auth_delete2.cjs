const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

content = content.replace(
  /signInWithPopup\n  deleteUser/,
  'signInWithPopup,\n  deleteUser'
);

fs.writeFileSync('src/context/AuthContext.tsx', content);
console.log("Patched AuthContext.tsx syntax error");
