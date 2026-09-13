const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('AnalyticsView')) {
  content = content.replace(
    "import { AchievementsView } from './components/views/AchievementsView';",
    "import { AchievementsView } from './components/views/AchievementsView';\nimport { AnalyticsView } from './components/views/AnalyticsView';"
  );
}

const analyticsViewRender = `
        {currentTab === 'analytics' && (
          <AnalyticsView />
        )}
`;

if (!content.includes("currentTab === 'analytics'")) {
  content = content.replace(
    /\{currentTab === 'practice' && \(/,
    analyticsViewRender + "        {currentTab === 'practice' && ("
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with AnalyticsView successfully.");
