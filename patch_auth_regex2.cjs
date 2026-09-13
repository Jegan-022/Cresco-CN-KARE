const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

content = content.replace(
  /email\.trim\(\)\.match\(\/\^\(\[A-Za-z0-9\._%\+-\]\+\)@klu\\\.ac\\\.in\$\/\)/g,
  'email.trim().match(/^([A-Za-z0-9._%+-]+)@klu\\.ac\\.in$/i)'
);

fs.writeFileSync('src/context/AuthContext.tsx', content);
console.log("Patched AuthContext.tsx Regex 2");
