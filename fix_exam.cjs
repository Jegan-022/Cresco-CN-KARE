const fs = require('fs');
let content = fs.readFileSync('src/data/unitsCurriculum.ts', 'utf8');

content = content.replace(/examWeight: 30/g, 'examWeight: "30%"');
content = content.replace(/examWeight: 40/g, 'examWeight: "40%"');

fs.writeFileSync('src/data/unitsCurriculum.ts', content);
