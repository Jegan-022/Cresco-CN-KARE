const fs = require('fs');
let content = fs.readFileSync('src/data/unitsCurriculum.ts', 'utf8');

content = content.replace(
  /moduleCount: 20\n\s*\}/g,
  "moduleCount: 20,\n    unlockedByDefault: true,\n    examWeight: 30\n  }"
);
content = content.replace(
  /moduleCount: 17\n\s*\}/g,
  "moduleCount: 17,\n    unlockedByDefault: false,\n    examWeight: 40\n  }"
);
content = content.replace(
  /moduleCount: 8\n\s*\}/g,
  "moduleCount: 8,\n    unlockedByDefault: false,\n    examWeight: 30\n  }"
);

fs.writeFileSync('src/data/unitsCurriculum.ts', content);
