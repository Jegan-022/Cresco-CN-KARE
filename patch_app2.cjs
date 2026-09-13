const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace Navbar invocation
content = content.replace(
  /<Navbar[\s\S]*?\/>/,
  `<Navbar
        activeTab={currentTab}
        onNavigate={handleNavigate}
      />`
);

// Replace BottomNav invocation
content = content.replace(
  /<BottomNav[\s\S]*?\/>/,
  `<BottomNav
        activeTab={currentTab}
        onNavigate={handleNavigate}
      />`
);

// Remove unused views
content = content.replace(
  /\{currentTab === 'courses' && \([\s\S]*?<\/[A-Za-z]+>\n\s*\)\}/g,
  ""
);

content = content.replace(
  /\{currentTab === 'achievements' && \([\s\S]*?<\/[A-Za-z]+>\n\s*\)\}/g,
  ""
);

// We need to add AchievementsView
const achievementsViewImport = "import { AchievementsView } from './components/views/AchievementsView';\n";
if (!content.includes('AchievementsView')) {
  content = content.replace("import { LeaderboardView", achievementsViewImport + "import { LeaderboardView");
}

const achievementsViewRender = `
        {currentTab === 'achievements' && (
          <AchievementsView onNavigate={handleNavigate} />
        )}
`;

content = content.replace(
  /\{currentTab === 'leaderboard' && \(/,
  achievementsViewRender + "        {currentTab === 'leaderboard' && ("
);

// HomeView is already handled via the previous patch (mostly). Let's make sure it matches the new props.
content = content.replace(
  /<HomeView[\s\S]*?\/>/,
  `<HomeView onNavigate={handleNavigate} />`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx views and navbar successfully.");
