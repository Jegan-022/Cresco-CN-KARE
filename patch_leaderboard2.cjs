const fs = require('fs');

let content = fs.readFileSync('src/components/views/LeaderboardView.tsx', 'utf-8');

// Replace dynamic imports with static imports at the top
if (!content.includes('import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";')) {
  content = 'import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";\n' + content;
}
if (!content.includes('import { db } from "../../lib/firebase";')) {
  content = 'import { db } from "../../lib/firebase";\n' + content;
}

// Remove the dynamic imports inside the function
content = content.replace(
  /const \{ collection, query, orderBy, limit, getDocs \} = await import\('firebase\/firestore'\);\n\s*const \{ db \} = await import\('\.\.\/\.\.\/lib\/firebase'\);/g,
  ''
);

fs.writeFileSync('src/components/views/LeaderboardView.tsx', content);
console.log("Patched LeaderboardView.tsx static imports successfully.");
